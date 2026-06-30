from pathlib import Path
from xml.sax.saxutils import escape

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image as PdfImage,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
RENDU = Path(__file__).resolve().parent
ASSETS = RENDU / "assets"
OUTPUT = RENDU / "MSPR_TPRE814_FutureKawa_rendu.pdf"


def register_fonts() -> None:
    fonts = {
        "Arial": Path(r"C:\Windows\Fonts\arial.ttf"),
        "Arial-Bold": Path(r"C:\Windows\Fonts\arialbd.ttf"),
        "Consolas": Path(r"C:\Windows\Fonts\consola.ttf"),
    }
    for name, path in fonts.items():
        if path.exists():
            pdfmetrics.registerFont(TTFont(name, str(path)))


register_fonts()


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        "CoverTitle",
        parent=styles["Title"],
        fontName="Arial-Bold",
        fontSize=25,
        leading=31,
        textColor=colors.HexColor("#123076"),
        alignment=TA_CENTER,
        spaceAfter=18,
    )
)
styles.add(
    ParagraphStyle(
        "CoverSub",
        parent=styles["Normal"],
        fontName="Arial",
        fontSize=13,
        leading=18,
        textColor=colors.HexColor("#334155"),
        alignment=TA_CENTER,
        spaceAfter=8,
    )
)
styles.add(
    ParagraphStyle(
        "H1",
        parent=styles["Heading1"],
        fontName="Arial-Bold",
        fontSize=18,
        leading=23,
        textColor=colors.HexColor("#123076"),
        spaceBefore=8,
        spaceAfter=10,
    )
)
styles.add(
    ParagraphStyle(
        "H2",
        parent=styles["Heading2"],
        fontName="Arial-Bold",
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#1f2937"),
        spaceBefore=7,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        "BodyTextFK",
        parent=styles["BodyText"],
        fontName="Arial",
        fontSize=9.8,
        leading=14.5,
        textColor=colors.HexColor("#1f2937"),
        spaceAfter=7,
    )
)
styles.add(
    ParagraphStyle(
        "Small",
        parent=styles["BodyTextFK"],
        fontSize=8.6,
        leading=12,
        textColor=colors.HexColor("#475569"),
    )
)
styles.add(
    ParagraphStyle(
        "Caption",
        parent=styles["Small"],
        alignment=TA_CENTER,
        textColor=colors.HexColor("#64748b"),
        spaceBefore=3,
        spaceAfter=9,
    )
)
styles.add(
    ParagraphStyle(
        "TableHeader",
        parent=styles["Small"],
        fontName="Arial-Bold",
        textColor=colors.white,
    )
)
styles.add(
    ParagraphStyle(
        "CodeBlock",
        parent=styles["Code"],
        fontName="Consolas",
        fontSize=8.2,
        leading=11,
        textColor=colors.HexColor("#0f172a"),
        backColor=colors.HexColor("#eef2ff"),
        borderPadding=6,
        spaceAfter=8,
    )
)


def P(text: str, style: str = "BodyTextFK") -> Paragraph:
    return Paragraph(text, styles[style])


def H1(text: str) -> Paragraph:
    return Paragraph(text, styles["H1"])


def H2(text: str) -> Paragraph:
    return Paragraph(text, styles["H2"])


def bullet(text: str) -> Paragraph:
    return P(f"• {escape(text)}")


def code(text: str) -> Paragraph:
    return Paragraph(escape(text).replace("\n", "<br/>"), styles["CodeBlock"])


def table(data, widths, header=True) -> Table:
    prepared = []
    for row_index, row in enumerate(data):
        row_style = "TableHeader" if header and row_index == 0 else "Small"
        prepared.append([cell if hasattr(cell, "wrap") else P(str(cell), row_style) for cell in row])
    t = Table(prepared, colWidths=widths, repeatRows=1 if header else 0, hAlign="LEFT")
    style = [
        ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#cbd5e1")),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#e2e8f0")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    if header:
        style += [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Arial-Bold"),
        ]
    t.setStyle(TableStyle(style))
    return t


def image_block(filename: str, caption: str, max_width: float = 16.7 * cm) -> KeepTogether:
    path = ASSETS / filename
    img = Image.open(path)
    ratio = img.height / img.width
    width = max_width
    height = width * ratio
    if height > 12.8 * cm:
        height = 12.8 * cm
        width = height / ratio
    return KeepTogether([PdfImage(str(path), width=width, height=height), P(caption, "Caption")])


def make_architecture_diagram() -> None:
    path = ASSETS / "architecture_flux.png"
    width, height = 1500, 620
    image = Image.new("RGB", (width, height), "#f8fafc")
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 26)
    bold = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 28)
    small = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 21)

    def box(x, y, w, h, title, subtitle="", fill="#ffffff", outline="#1e3a8a"):
        draw.rounded_rectangle((x, y, x + w, y + h), radius=18, fill=fill, outline=outline, width=3)
        draw.text((x + 24, y + 20), title, font=bold, fill="#0f172a")
        if subtitle:
            draw.text((x + 24, y + 58), subtitle, font=small, fill="#475569")

    def arrow(x1, y1, x2, y2):
        draw.line((x1, y1, x2, y2), fill="#334155", width=4)
        draw.polygon((x2, y2, x2 - 14, y2 - 8, x2 - 14, y2 + 8), fill="#334155")

    draw.text((48, 34), "Flux de données FutureKawa", font=bold, fill="#123076")
    box(50, 120, 230, 110, "ESP32 + DHT11", "GPIO32, Thonny")
    box(350, 120, 210, 110, "Mosquitto", "MQTT 1883")
    box(630, 120, 230, 110, "mqtt_bridge", "MQTT -> REST")
    box(930, 78, 240, 80, "API Brazil", "port 3000", "#eff6ff")
    box(930, 178, 240, 80, "API Colombia", "port 3002", "#eff6ff")
    box(930, 278, 240, 80, "API Ecuador", "port 3003", "#eff6ff")
    box(1230, 178, 220, 100, "MySQL", "volumes par pays", "#ecfdf5", "#15803d")
    box(520, 405, 260, 100, "API centrale", "agrégation siège")
    box(900, 405, 260, 100, "React", "dashboard web", "#fff7ed", "#ea580c")
    arrow(280, 175, 350, 175)
    arrow(560, 175, 630, 175)
    arrow(860, 175, 930, 118)
    arrow(860, 175, 930, 218)
    arrow(860, 175, 930, 318)
    arrow(1170, 118, 1230, 215)
    arrow(1170, 218, 1230, 228)
    arrow(1170, 318, 1230, 245)
    arrow(1230, 278, 760, 405)
    arrow(780, 455, 900, 455)
    draw.text((50, 545), "Les mesures sont persistées en SQL puis exposées à l'interface par l'API centrale.", font=font, fill="#334155")
    image.save(path)


def page_footer(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setFont("Arial", 8)
        canvas.setFillColor(colors.HexColor("#64748b"))
        canvas.drawString(1.6 * cm, 1.05 * cm, "MSPR TPRE814 - FutureKawa")
        canvas.drawRightString(19.4 * cm, 1.05 * cm, f"Page {doc.page}")
    canvas.restoreState()


def build_story():
    make_architecture_diagram()
    story = []

    story += [
        Spacer(1, 2.7 * cm),
        P("MSPR TPRE814 - Bloc 4", "CoverSub"),
        P("FutureKawa", "CoverTitle"),
        P("Application IoT de supervision des stocks et des conditions de stockage", "CoverSub"),
        Spacer(1, 0.8 * cm),
        P("Rendu technique et fonctionnel", "CoverSub"),
        Spacer(1, 2.4 * cm),
        P("Équipe projet : Antoine GARNIER, Thibault AUTEXIER, Issam HARNOUFI, Zaid ABABOU, Ali WARI", "CoverSub"),
        P("Version du 30 juin 2026", "CoverSub"),
        Spacer(1, 1.1 * cm),
        P("Dossier rédigé à partir du projet livré, des captures applicatives et des preuves d'exécution Docker/MQTT.", "Caption"),
        PageBreak(),
    ]

    story += [
        H1("Table des matières"),
        bullet("1. Contexte, besoin et périmètre du POC"),
        bullet("2. Architecture distribuée et choix techniques"),
        bullet("3. Modèle de données, API et intégration multi-pays"),
        bullet("4. Chaîne IoT MicroPython, MQTT et persistance"),
        bullet("5. Interface web, alertes et expérience utilisateur"),
        bullet("6. Tests, CI Jenkins et preuves d'exécution"),
        bullet("7. Conduite du changement et documentation"),
        bullet("8. Validation de la grille et points restant à sécuriser"),
        bullet("9. Annexes de démonstration"),
        PageBreak(),
    ]

    story += [
        H1("1. Contexte et périmètre"),
        P("FutureKawa doit suivre ses lots de café et contrôler les conditions de stockage dans plusieurs pays. Le risque métier principal est simple : une température ou une humidité hors seuil peut dégrader la qualité du stock avant que les équipes ne s'en rendent compte. Le POC livré répond donc à deux besoins : centraliser les informations de stock et faire remonter automatiquement les mesures IoT."),
        P("Le projet a été conçu comme une solution distribuée. Chaque pays dispose de sa propre API et de sa propre base MySQL, tandis qu'une API centrale joue le rôle du siège et expose les données à l'interface React. Le flux IoT suit le cours : un ESP32 équipé d'un capteur DHT11 publie en MQTT vers Mosquitto ; un bridge transforme ensuite le message MQTT en écriture REST dans l'API pays."),
        H2("Périmètre fonctionnel livré"),
        table(
            [
                ["Fonction", "Statut", "Preuve"],
                ["Gestion des exploitations et entrepôts", "Livré", "Pages Exploitations et Entrepôts + API centrale par pays"],
                ["Gestion des lots", "Livré", "Cartes de lots, recherche, historique et statut"],
                ["Mesures température/humidité", "Livré", "ESP32 MicroPython, MQTT, simulateur et endpoint POST /mesures"],
                ["Alertes", "Livré", "Statut en alerte, affichage UI, notification e-mail en mode log ou SMTP"],
                ["Architecture multi-pays", "Livré", "Brazil, Colombia et Ecuador dans Docker Compose"],
                ["CI/CD", "Livré", "Jenkinsfile + validation Docker Compose + builds"],
            ],
            [5.0 * cm, 3.0 * cm, 8.0 * cm],
        ),
        PageBreak(),
    ]

    story += [
        H1("2. Architecture distribuée"),
        P("L'architecture a été gardée volontairement lisible pour une soutenance : les responsabilités sont séparées et chaque composant peut être lancé localement avec Docker Compose. Ce choix permet de démontrer le projet sans dépendre d'un cloud externe."),
        image_block("architecture_flux.png", "Figure 1 - Architecture technique du flux IoT vers l'interface web."),
        H2("Services Docker"),
        table(
            [
                ["Service", "Rôle"],
                ["app_central", "Interface React servie sur le port 8080."],
                ["api_central", "API siège sur le port 3001 ; agrège Brazil, Colombia et Ecuador."],
                ["api_brazil / api_colombia / api_ecuador", "APIs pays isolées, chacune connectée à sa base."],
                ["mysql_Brazil / mysql_Colombia / mysql_Ecuador", "Persistance SQL par pays avec volumes Docker."],
                ["mqtt_broker", "Broker Mosquitto local sur le port 1883."],
                ["mqtt_bridge", "Abonné MQTT qui poste les mesures dans l'API Brazil par défaut."],
                ["iot_simulator", "Génération de mesures de démonstration quand le capteur n'est pas branché."],
            ],
            [5.5 * cm, 10.5 * cm],
        ),
        image_block("docker_services.png", "Figure 2 - Services actifs après ajout du troisième pays Ecuador."),
        PageBreak(),
    ]

    story += [
        H1("3. Données et API"),
        P("Le modèle de données reste volontairement court : exploitation, entrepôt, lot et mesure. Cela suffit pour relier un stock à son lieu physique et à son historique de température/humidité. Les statuts sont calculés côté API afin de garder une règle unique pour le frontend, les tests et les notifications."),
        table(
            [
                ["Table", "Contenu principal"],
                ["exploitations", "Nom de l'exploitation."],
                ["entrepots", "Nom et rattachement à une exploitation."],
                ["lots", "Entrepôt, date de stockage et statut : conforme, en alerte ou périmé."],
                ["mesures", "Entrepôt, température, humidité, timestamp et statut."],
            ],
            [4.0 * cm, 12.0 * cm],
        ),
        H2("Routes principales"),
        code(
            "GET  /:country/exploitations\n"
            "GET  /:country/entrepots\n"
            "GET  /:country/lots\n"
            "GET  /:country/mesures/entrepot/:id/latest\n"
            "POST /mesures  (API pays, réception des mesures IoT)"
        ),
        P("La preuve multi-pays a été renforcée en ajoutant Ecuador dans Docker Compose et dans les mappings de l'API centrale. Le frontend avait déjà la sélection Équateur ; le routage backend manquant a été ajouté pour les exploitations, entrepôts, lots et mesures."),
        image_block("ecuador_exploitations.png", "Figure 3 - L'API centrale expose les exploitations Ecuador après seed de démonstration."),
        PageBreak(),
    ]

    story += [
        H1("4. Chaîne IoT"),
        P("La partie embarquée est écrite en MicroPython pour correspondre à la demande du cours et à l'utilisation de Thonny. Le capteur DHT11 est branché sur l'ESP32 avec VCC sur 3V3, GND sur GND et DATA sur GPIO32. Le script lit le capteur, construit un payload JSON puis le publie sur le topic MQTT futurekawa/mesures."),
        H2("Rôle du script MicroPython"),
        bullet("Connexion Wi-Fi avec les identifiants du fichier config.py."),
        bullet("Connexion au broker Mosquitto sur le port 1883."),
        bullet("Lecture DHT11 : température et humidité."),
        bullet("Publication périodique d'un JSON : id_entrepot, temperature, humidite."),
        code(
            '{"id_entrepot":1,"temperature":26.5,"humidite":55}\n'
            "Topic MQTT : futurekawa/mesures\n"
            "Fichier : iot/esp32-dht11/micropython/main_mqtt.py"
        ),
        P("À domicile, sans capture Thonny exploitable, le flux matériel est sécurisé par un test MQTT reproductible : mosquitto_pub publie le même message que l'ESP32, puis mqtt_bridge le persiste dans l'API. Cela prouve le maillon MQTT -> API -> MySQL, qui est la partie critique pour le rendu."),
        image_block("mqtt_bridge_log.png", "Figure 4 - Le bridge reçoit une mesure MQTT et obtient une création HTTP 201."),
        image_block("latest_mesure_brazil.png", "Figure 5 - Dernière mesure relue via l'API centrale après persistance."),
        PageBreak(),
    ]

    story += [
        H1("5. Interface web"),
        P("L'interface React sert de poste de supervision. Elle est pensée pour une démonstration rapide : sélection du pays, choix de l'exploitation, lecture d'un entrepôt, consultation des lots, mesures récentes et alertes. Les pages Exploitations et Entrepôts ont été enrichies pour éviter de cacher l'information dans des tableaux bruts."),
        image_block("dashboard_bresil.png", "Figure 6 - Dashboard avec sélection du Brésil."),
        image_block("dashboard_equateur.png", "Figure 7 - Dashboard avec sélection de l'Équateur, troisième pays du périmètre."),
        PageBreak(),
        H2("Page Exploitations"),
        P("La page Exploitations affiche les indicateurs rapides de l'entrepôt sélectionné. Le graphe a été corrigé pour rester lisible quand l'historique contient beaucoup de points : seules les mesures récentes sont prises, puis regroupées en buckets moyens lorsque le volume devient trop grand. L'utilisateur voit donc une tendance compréhensible au lieu d'un bloc visuel illisible."),
        image_block("exploitations_bresil.png", "Figure 8 - Page Exploitations : jauges et graphe lisible après regroupement des mesures."),
        PageBreak(),
        H2("Page Entrepôts"),
        P("La page Entrepôts permet de cliquer sur chaque entrepôt et de voir le détail : lots, température, humidité, dernière mesure et historique récent. Les alertes visibles dans l'historique donnent le contexte nécessaire : valeur mesurée, statut et moment de la mesure."),
        image_block("entrepots_bresil.png", "Figure 9 - Page Entrepôts : détail opérationnel et historique des mesures."),
        PageBreak(),
    ]

    story += [
        H1("6. Alertes"),
        P("Les règles d'alerte sont centralisées côté API pays. Une mesure devient en alerte si la température sort de l'intervalle 24-30 °C ou si l'humidité sort de l'intervalle 50-60 %. Les lots peuvent aussi être signalés selon leur ancienneté, afin de faire remonter les risques de péremption."),
        H2("Notification e-mail"),
        P("Pour éviter de mettre des identifiants SMTP dans le dépôt, le comportement par défaut est le mode log. Il génère exactement le contenu de l'e-mail attendu : sujet, entrepôt, mesure, température, humidité, statut et seuils. En production, le mode SMTP s'active par variables d'environnement : ALERT_EMAIL_MODE=smtp, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS et ALERT_EMAIL_TO."),
        image_block("api_alert_log.png", "Figure 10 - Contenu de l'alerte e-mail validé en mode log."),
        H2("Navigation depuis les alertes"),
        P("Le choix produit retenu est de ne pas afficher une alerte isolée sans contexte. Une alerte doit ramener l'utilisateur vers la zone métier concernée : pays, exploitation, entrepôt et historique des mesures. C'est plus logique pour un responsable d'exploitation, car il peut immédiatement comparer la dernière mesure avec les lots présents."),
        PageBreak(),
    ]

    story += [
        H1("7. Tests et CI"),
        P("Le plan de tests est organisé autour du chemin critique : démarrage Docker, écriture API conforme, écriture API en alerte, publication MQTT, interface web, build local et vérification multi-pays. Les commandes sont reproductibles dans PowerShell et documentées dans docs/tests/plan_de_tests.md."),
        table(
            [
                ["Test", "Résultat observé"],
                ["Docker Compose", "Stack dev reconstruite et active, compose config --quiet sans erreur."],
                ["API alerte", "POST /mesures avec 34 °C et 84 % retourne statut en alerte."],
                ["MQTT", "mosquitto_pub -> mqtt_bridge -> POST API -> HTTP 201."],
                ["API centrale", "Lecture /brazil/... et /ecuador/... fonctionnelle."],
                ["Frontend", "Build Vite terminé ; screenshots Dashboard, Exploitations et Entrepôts générés."],
                ["Jenkins", "Jenkinsfile présent : validate compose, build APIs, build frontend, build bridge."],
            ],
            [4.5 * cm, 11.5 * cm],
        ),
        H2("Pipeline Jenkins"),
        P("Le Jenkinsfile vérifie les éléments qui casseraient une livraison : configuration Docker Compose, build country API, build central API, build frontend et build de l'image mqtt_bridge. Le pipeline ne remplace pas les tests manuels IoT, mais il empêche de pousser une version qui ne compile plus."),
        code(
            "stages:\n"
            "  - Validate Docker Compose\n"
            "  - Build Country API\n"
            "  - Build Central API\n"
            "  - Build Frontend\n"
            "  - Build MQTT Bridge Image"
        ),
        PageBreak(),
    ]

    story += [
        H1("8. Conduite du changement"),
        P("Le projet ne se limite pas au code : les responsables d'exploitation doivent comprendre ce que signifie une alerte et comment réagir. Le plan de conduite du changement prévoit donc une démonstration courte, une fiche réflexe, des référents pays et une période pilote sur un entrepôt."),
        table(
            [
                ["Public", "Besoin traité"],
                ["Responsables d'exploitation", "Lire les alertes et prioriser les actions."],
                ["Équipes entrepôt", "Comprendre les mesures et vérifier le capteur."],
                ["Direction qualité", "Suivre la conformité des conditions de stockage."],
                ["DSI", "Maintenir Docker, APIs, bases SQL et MQTT."],
                ["Siège", "Voir une supervision multi-pays centralisée."],
            ],
            [5.3 * cm, 10.7 * cm],
        ),
        P("Les documents livrés couvrent le cadrage, l'architecture, les tests, Jenkins, les alertes e-mail/log et la conduite du changement. Cela répond à l'attendu de livrables projet, pas seulement à une démonstration technique."),
        PageBreak(),
    ]

    story += [
        H1("9. Validation de la grille"),
        table(
            [
                ["Attendu de la grille", "Statut", "Éléments de preuve"],
                ["Recueil du besoin et cadrage", "Validé", "Questionnaire phase 2, périmètre du POC, besoins FutureKawa explicités."],
                ["Architecture applicative distribuée", "Validé", "API centrale + APIs pays Brazil/Colombia/Ecuador + bases MySQL séparées + Docker Compose."],
                ["Développement web / API / IoT", "Validé", "React, NestJS, MySQL, ESP32 MicroPython, Mosquitto MQTT, bridge Python."],
                ["Intégration logicielle au SI", "Validé", "API centrale agrégatrice, routes par pays, persistance SQL et interface de supervision."],
                ["Tests et plan de tests", "Validé", "Plan de tests T01 à T08, preuves API/MQTT/UI, compose config et builds."],
                ["CI/CD Jenkins", "Validé", "Jenkinsfile à la racine et documentation docs/ci/jenkins.md."],
                ["Documentation utilisateur et technique", "Validé", "README, dossier technique, guide MQTT/ESP32, alertes, commandes de lancement."],
                ["Conduite du changement", "Validé", "Plan d'information, communication, formation, participation et indicateurs."],
            ],
            [5.4 * cm, 2.4 * cm, 8.2 * cm],
        ),
        H2("Points à sécuriser avant la remise"),
        bullet("Si le matériel est disponible le jour J, refaire une capture Thonny montrant published: {...}."),
        bullet("Si le jury exige un vrai e-mail reçu, ajouter des identifiants SMTP dans l'environnement local puis relancer le test alerte."),
        bullet("Éviter de présenter l'ancien dossier non suivi Smart Tracker, qui n'appartient pas au rendu."),
        PageBreak(),
    ]

    story += [
        H1("10. Annexes"),
        H2("Lancement du projet"),
        code("docker compose --profile dev up --build -d\nhttp://localhost:8080"),
        H2("Seed Ecuador"),
        code("docker compose exec -e SEED_TRUNCATE=true -e SEED_RANDOM_SEED=814 api_ecuador npm run seed"),
        H2("Test alerte API"),
        code('Invoke-RestMethod -Method Post -Uri "http://localhost:3000/mesures" -ContentType "application/json" -Body \'{"id_entrepot":1,"temperature":34,"humidite":84}\''),
        H2("Test MQTT sans ESP32"),
        code('docker exec mqtt_broker mosquitto_pub -h localhost -p 1883 -t futurekawa/mesures -m "{id_entrepot:1,temperature:26.5,humidite:55}"\ndocker logs --tail 30 mqtt_bridge'),
        H2("Fichiers importants"),
        bullet("iot/esp32-dht11/micropython/main_mqtt.py : code ESP32 MicroPython."),
        bullet("iot/mqtt-bridge/bridge.py : bridge MQTT vers API REST."),
        bullet("country/api/src/alerts/alert-notification.service.ts : notification alertes."),
        bullet("central/app/src/page/Exploitations/StatsCard/StatsCard.tsx : graphe lisible par regroupement."),
        bullet("docker-compose.yml : orchestration des trois pays, MQTT et application web."),
        bullet("Jenkinsfile : pipeline CI."),
    ]

    return story


def main() -> None:
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=1.55 * cm,
        leftMargin=1.55 * cm,
        topMargin=1.45 * cm,
        bottomMargin=1.55 * cm,
        title="MSPR TPRE814 FutureKawa rendu",
        author="Equipe projet MSPR",
    )
    doc.build(build_story(), onFirstPage=page_footer, onLaterPages=page_footer)
    print(OUTPUT)


if __name__ == "__main__":
    main()
