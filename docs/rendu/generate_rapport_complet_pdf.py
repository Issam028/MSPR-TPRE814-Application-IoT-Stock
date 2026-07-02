from __future__ import annotations

import html
import re
import shutil
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
MD_PATH = ROOT / "docs" / "rendu" / "MSPR_TPRE814_FutureKawa_rapport_complet.md"
PDF_PATH = ROOT / "docs" / "rendu" / "MSPR_TPRE814_FutureKawa_rapport_complet.pdf"
DELIVERABLE_PDF_PATH = (
    ROOT
    / "docs"
    / "rendu"
    / "MSPR_TPRE814_Thibault AUTEXIER - Issam HARNOUFI - Zaid ABABOU - Ali WARI.pdf"
)


TEAM_MEMBERS = [
    "Thibault AUTEXIER",
    "Issam HARNOUFI",
    "Zaid ABABOU",
    "Ali WARI",
]


def clean_inline(text: str) -> str:
    text = html.escape(text.strip())
    text = re.sub(r"`([^`]+)`", r"<font name='Courier'>\1</font>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"\*([^*]+)\*", r"<i>\1</i>", text)
    return text


def split_table_row(line: str) -> list[str]:
    raw = line.strip().strip("|")
    return [clean_inline(cell) for cell in raw.split("|")]


def resolve_image(path_text: str) -> Path:
    path_text = path_text.strip()
    if path_text.startswith("<") and path_text.endswith(">"):
        path_text = path_text[1:-1]
    return (MD_PATH.parent / path_text).resolve()


def image_flowable(path: Path, max_width: float) -> Image | Paragraph:
    if not path.exists():
        return Paragraph(f"Image manquante : {html.escape(str(path))}", STYLES["Warn"])

    img = Image(str(path))
    ratio = img.imageHeight / float(img.imageWidth)
    width = min(max_width, img.imageWidth)
    height = width * ratio
    max_height = 13 * cm
    if height > max_height:
        height = max_height
        width = height / ratio
    img.drawWidth = width
    img.drawHeight = height
    img.hAlign = "CENTER"
    return img


def build_table(rows: list[list[str]], available_width: float) -> Table:
    column_count = max(len(row) for row in rows)
    normalized = [row + [""] * (column_count - len(row)) for row in rows]
    col_widths = [available_width / column_count] * column_count
    data = [[Paragraph(cell, STYLES["TableCell"]) for cell in row] for row in normalized]
    table = Table(data, colWidths=col_widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#cbd5e1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def flush_paragraph(buffer: list[str], story: list) -> None:
    if not buffer:
        return
    text = " ".join(part.strip() for part in buffer if part.strip())
    if text:
        story.append(Paragraph(clean_inline(text), STYLES["Body"]))
        story.append(Spacer(1, 0.14 * cm))
    buffer.clear()


def flush_bullets(buffer: list[str], story: list) -> None:
    if not buffer:
        return
    items = [ListItem(Paragraph(clean_inline(item), STYLES["Body"]), leftIndent=12) for item in buffer]
    story.append(ListFlowable(items, bulletType="bullet", leftIndent=18))
    story.append(Spacer(1, 0.14 * cm))
    buffer.clear()


def flush_table(buffer: list[str], story: list, available_width: float) -> None:
    if not buffer:
        return
    rows = [split_table_row(line) for line in buffer if not re.match(r"^\|\s*-", line)]
    if rows:
        story.append(build_table(rows, available_width))
        story.append(Spacer(1, 0.24 * cm))
    buffer.clear()


def parse_markdown() -> list:
    available_width = A4[0] - 3.4 * cm
    story: list = []
    paragraph_buffer: list[str] = []
    bullet_buffer: list[str] = []
    table_buffer: list[str] = []
    code_buffer: list[str] = []
    in_code = False

    lines = MD_PATH.read_text(encoding="utf-8").splitlines()
    if lines and lines[0].startswith("# MSPR TPRE814"):
        toc_index = next((index for index, value in enumerate(lines) if value.startswith("## Table des matières")), 0)
        lines = lines[toc_index:]

    for raw_line in lines:
        line = raw_line.rstrip()

        if line.startswith("```"):
            flush_paragraph(paragraph_buffer, story)
            flush_bullets(bullet_buffer, story)
            flush_table(table_buffer, story, available_width)
            if in_code:
                story.append(Preformatted("\n".join(code_buffer), STYLES["Code"]))
                story.append(Spacer(1, 0.18 * cm))
                code_buffer.clear()
                in_code = False
            else:
                in_code = True
            continue

        if in_code:
            code_buffer.append(line)
            continue

        if 'page-break-after' in line:
            flush_paragraph(paragraph_buffer, story)
            flush_bullets(bullet_buffer, story)
            flush_table(table_buffer, story, available_width)
            story.append(PageBreak())
            continue

        if line.startswith("|"):
            flush_paragraph(paragraph_buffer, story)
            flush_bullets(bullet_buffer, story)
            table_buffer.append(line)
            continue

        flush_table(table_buffer, story, available_width)

        if not line.strip():
            flush_paragraph(paragraph_buffer, story)
            flush_bullets(bullet_buffer, story)
            continue

        image_match = re.match(r"!\[([^\]]*)\]\((.+)\)", line)
        if image_match:
            flush_paragraph(paragraph_buffer, story)
            flush_bullets(bullet_buffer, story)
            image_path = resolve_image(image_match.group(2))
            story.append(image_flowable(image_path, available_width))
            story.append(Spacer(1, 0.12 * cm))
            continue

        if line.startswith("# "):
            flush_paragraph(paragraph_buffer, story)
            flush_bullets(bullet_buffer, story)
            story.append(Paragraph(clean_inline(line[2:]), STYLES["H1"]))
            story.append(Spacer(1, 0.25 * cm))
            continue

        if line.startswith("## "):
            flush_paragraph(paragraph_buffer, story)
            flush_bullets(bullet_buffer, story)
            story.append(Paragraph(clean_inline(line[3:]), STYLES["H2"]))
            story.append(Spacer(1, 0.16 * cm))
            continue

        if line.startswith("### "):
            flush_paragraph(paragraph_buffer, story)
            flush_bullets(bullet_buffer, story)
            story.append(Paragraph(clean_inline(line[4:]), STYLES["H3"]))
            continue

        if line.startswith("- "):
            flush_paragraph(paragraph_buffer, story)
            bullet_buffer.append(line[2:])
            continue

        if re.match(r"^\d+\. ", line):
            flush_paragraph(paragraph_buffer, story)
            bullet_buffer.append(re.sub(r"^\d+\. ", "", line))
            continue

        paragraph_buffer.append(line)

    flush_paragraph(paragraph_buffer, story)
    flush_bullets(bullet_buffer, story)
    flush_table(table_buffer, story, available_width)
    return story


def build_cover_page() -> list:
    members = "<br/>".join(TEAM_MEMBERS)
    return [
        Spacer(1, 2.1 * cm),
        Paragraph("MSPR TPRE814", STYLES["CoverKicker"]),
        Spacer(1, 0.35 * cm),
        Paragraph("Rapport complet du projet FutureKawa", STYLES["CoverTitle"]),
        Spacer(1, 0.9 * cm),
        Paragraph("Bloc 4", STYLES["CoverLabel"]),
        Spacer(1, 0.14 * cm),
        Paragraph("Concevoir et développer des solutions applicatives métier et spécifiques", STYLES["CoverSubtitle"]),
        Spacer(1, 1.0 * cm),
        Paragraph("Projet", STYLES["CoverLabel"]),
        Spacer(1, 0.14 * cm),
        Paragraph("Application IoT de supervision des stocks et des conditions de stockage", STYLES["CoverSubtitle"]),
        Spacer(1, 1.0 * cm),
        Paragraph("Équipe projet", STYLES["CoverLabel"]),
        Spacer(1, 0.16 * cm),
        Paragraph(members, STYLES["CoverNames"]),
        Spacer(1, 1.2 * cm),
        Paragraph("Livrable professionnel - Version PDF", STYLES["CoverMeta"]),
        PageBreak(),
    ]


def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#64748b"))
    canvas.drawString(1.7 * cm, 1.0 * cm, "FutureKawa - Rapport MSPR TPRE814")
    canvas.drawRightString(A4[0] - 1.7 * cm, 1.0 * cm, f"Page {doc.page}")
    canvas.restoreState()


styles = getSampleStyleSheet()
STYLES = {
    "CoverKicker": ParagraphStyle(
        "CoverKicker",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1e3a8a"),
        spaceAfter=4,
    ),
    "CoverTitle": ParagraphStyle(
        "CoverTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=26,
        leading=32,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=8,
    ),
    "CoverLabel": ParagraphStyle(
        "CoverLabel",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#64748b"),
    ),
    "CoverSubtitle": ParagraphStyle(
        "CoverSubtitle",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=20,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#111827"),
    ),
    "CoverNames": ParagraphStyle(
        "CoverNames",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=13,
        leading=18,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#111827"),
    ),
    "CoverMeta": ParagraphStyle(
        "CoverMeta",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#64748b"),
    ),
    "H1": ParagraphStyle(
        "H1",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=8,
        spaceAfter=8,
    ),
    "H2": ParagraphStyle(
        "H2",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=19,
        textColor=colors.HexColor("#1e3a8a"),
        spaceBefore=8,
        spaceAfter=5,
    ),
    "H3": ParagraphStyle(
        "H3",
        parent=styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#334155"),
        spaceBefore=6,
        spaceAfter=4,
    ),
    "Body": ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13,
        alignment=TA_LEFT,
        textColor=colors.HexColor("#111827"),
    ),
    "TableCell": ParagraphStyle(
        "TableCell",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=7.3,
        leading=9,
        textColor=colors.HexColor("#111827"),
    ),
    "Code": ParagraphStyle(
        "Code",
        parent=styles["Code"],
        fontName="Courier",
        fontSize=7.4,
        leading=9,
        backColor=colors.HexColor("#f1f5f9"),
        borderColor=colors.HexColor("#cbd5e1"),
        borderWidth=0.4,
        borderPadding=5,
        textColor=colors.HexColor("#0f172a"),
    ),
    "Warn": ParagraphStyle(
        "Warn",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#b91c1c"),
        alignment=TA_CENTER,
    ),
}


def main() -> None:
    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=A4,
        rightMargin=1.7 * cm,
        leftMargin=1.7 * cm,
        topMargin=1.7 * cm,
        bottomMargin=1.5 * cm,
        title="MSPR TPRE814 FutureKawa - Rapport complet",
        author="FutureKawa",
    )
    story = build_cover_page() + parse_markdown()
    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    shutil.copyfile(PDF_PATH, DELIVERABLE_PDF_PATH)
    print(PDF_PATH)
    print(DELIVERABLE_PDF_PATH)


if __name__ == "__main__":
    main()
