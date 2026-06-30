from pathlib import Path
import re
import textwrap

from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[2]
ASSETS = Path(__file__).resolve().parent / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)

EDGE_CANDIDATES = [
    Path(r"C:\Program Files (x86)\Microsoft\EdgeCore\149.0.4022.98\msedge.exe"),
    Path(r"C:\Program Files (x86)\Microsoft\EdgeWebView\Application\149.0.4022.98\msedge.exe"),
    Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
    Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
]


def edge_executable() -> str:
    for candidate in EDGE_CANDIDATES:
        if candidate.exists():
            return str(candidate)
    raise FileNotFoundError("Microsoft Edge executable not found.")


def clean_text(text: str) -> str:
    text = re.sub(r"\x1b\[[0-?]*[ -/]*[@-~]", "", text)
    return text.replace("\r\n", "\n").strip()


def tail_alert_block(text: str) -> str:
    text = clean_text(text)
    marker = "EMAIL ALERT LOG"
    if marker not in text:
        return text
    return marker + text.rsplit(marker, 1)[1]


def text_image(source: Path, output: Path, title: str, mode: str = "tail") -> None:
    text = clean_text(source.read_text(encoding="utf-8", errors="replace"))
    if mode == "alert":
        text = tail_alert_block(text)
    elif mode == "tail":
        text = "\n".join(text.splitlines()[-12:])

    lines = [title, ""]
    for line in text.splitlines():
        if len(line) <= 118:
            lines.append(line)
        else:
            lines.extend(textwrap.wrap(line, 118, break_long_words=False))

    font_path = Path(r"C:\Windows\Fonts\consola.ttf")
    font = ImageFont.truetype(str(font_path), 20) if font_path.exists() else ImageFont.load_default()
    small = ImageFont.truetype(str(font_path), 18) if font_path.exists() else font

    line_height = 27
    width = 1480
    height = max(360, 42 + len(lines) * line_height)
    image = Image.new("RGB", (width, height), "#0f172a")
    draw = ImageDraw.Draw(image)

    draw.rectangle((0, 0, width, 46), fill="#111827")
    draw.text((24, 13), title, fill="#e5e7eb", font=small)

    y = 62
    for index, line in enumerate(lines[2:], start=1):
        color = "#f8fafc"
        if "en alerte" in line.lower() or "EMAIL ALERT" in line:
            color = "#fb923c"
        elif "posted: 201" in line or '"statut":  "conforme"' in line:
            color = "#86efac"
        elif "mqtt:" in line:
            color = "#93c5fd"
        draw.text((24, y), line, fill=color, font=font)
        y += line_height

    image.save(output)


def capture_app() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=edge_executable(), headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
        page.goto("http://localhost:8080", wait_until="networkidle")
        page.wait_for_timeout(1500)

        page.locator("#zone-4").click(timeout=5000)
        page.wait_for_timeout(1000)
        page.screenshot(path=str(ASSETS / "dashboard_bresil.png"))

        page.locator(".navbar__item").nth(1).click()
        page.wait_for_timeout(3500)
        page.screenshot(path=str(ASSETS / "exploitations_bresil.png"))

        page.locator(".navbar__item").nth(2).click()
        page.wait_for_timeout(3500)
        page.screenshot(path=str(ASSETS / "entrepots_bresil.png"))

        page.locator(".navbar__item").nth(0).click()
        page.wait_for_timeout(1000)
        page.locator("#zone-6").click(timeout=5000)
        page.wait_for_timeout(1000)
        page.screenshot(path=str(ASSETS / "dashboard_equateur.png"))

        browser.close()


def main() -> None:
    capture_app()
    text_image(ASSETS / "api_alert_log.txt", ASSETS / "api_alert_log.png", "Preuve alerte e-mail en mode log", "alert")
    text_image(ASSETS / "mqtt_bridge_log.txt", ASSETS / "mqtt_bridge_log.png", "Preuve MQTT -> API -> MySQL", "tail")
    text_image(ASSETS / "latest_mesure_brazil.json", ASSETS / "latest_mesure_brazil.png", "Derniere mesure lue via API centrale", "full")
    text_image(ASSETS / "docker_services.txt", ASSETS / "docker_services.png", "Services Docker actifs", "full")
    text_image(ASSETS / "ecuador_exploitations.json", ASSETS / "ecuador_exploitations.png", "API centrale - donnees Equateur", "full")


if __name__ == "__main__":
    main()
