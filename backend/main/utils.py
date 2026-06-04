from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.lib.colors import darkblue
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import io
import os
from django.conf import settings
from django.core.files.base import ContentFile
from .models import Certification


def generate_certification_png(certification):
    """
    Génère une attestation PNG pour une certification donnée avec design IT HUB
    """
    # Dimensions du certificat (format portrait standard pour certificats en ligne)
    width, height = 1200, 900
    
    # Créer une image avec fond dégradé IT HUB
    img = Image.new('RGB', (width, height), '#0f172a')
    draw = ImageDraw.Draw(img)
    
    # Couleurs IT HUB
    it_hub_purple = (124, 58, 237)  # #7c3aed
    it_hub_indigo = (79, 70, 229)   # #4f46e5
    it_hub_blue = (37, 99, 235)     # #2563eb
    white = (248, 250, 252)         # #f8fafc
    gold = (251, 191, 36)           # #fbbf24
    
    # Fond dégradé simulé avec rectangles
    for i in range(height):
        alpha = int(255 * (1 - i / height * 0.3))
        color = (
            int(15 * alpha / 255),
            int(23 * alpha / 255),
            int(42 * alpha / 255)
        )
        draw.line([(0, i), (width, i)], fill=color)
    
    # Bordure décorative avec dégradé
    border_width = 10
    for i in range(border_width):
        alpha = int(255 * (1 - i / border_width))
        color = (
            int(124 * alpha / 255),
            int(58 * alpha / 255),
            int(237 * alpha / 255)
        )
        draw.rectangle([i, i, width - i - 1, height - i - 1], outline=color, width=1)
    
    # Bordure intérieure dorée
    draw.rectangle([border_width + 8, border_width + 8, width - border_width - 9, height - border_width - 9], 
                  outline=gold, width=2)
    
    # Coins décoratifs
    corner_size = 75
    # Coin supérieur gauche
    for i in range(corner_size):
        color = (
            int(124 * (1 - i / corner_size)),
            int(58 * (1 - i / corner_size)),
            int(237 * (1 - i / corner_size))
        )
        draw.line([(border_width + i, border_width + corner_size), (border_width + corner_size, border_width + i)], fill=color, width=2)
    
    # Coin supérieur droit
    for i in range(corner_size):
        color = (
            int(124 * (1 - i / corner_size)),
            int(58 * (1 - i / corner_size)),
            int(237 * (1 - i / corner_size))
        )
        draw.line([(width - border_width - corner_size, border_width + i), (width - border_width - i, border_width + corner_size)], fill=color, width=2)
    
    # Coin inférieur gauche
    for i in range(corner_size):
        color = (
            int(124 * (1 - i / corner_size)),
            int(58 * (1 - i / corner_size)),
            int(237 * (1 - i / corner_size))
        )
        draw.line([(border_width + i, height - border_width - corner_size), (border_width + corner_size, height - border_width - i)], fill=color, width=2)
    
    # Coin inférieur droit
    for i in range(corner_size):
        color = (
            int(124 * (1 - i / corner_size)),
            int(58 * (1 - i / corner_size)),
            int(237 * (1 - i / corner_size))
        )
        draw.line([(width - border_width - corner_size, height - border_width - i), (width - border_width - i, height - border_width - corner_size)], fill=color, width=2)
    
    # Essayer de charger des polices, utiliser des polices par défaut si non disponibles
    try:
        title_font = ImageFont.truetype("arial.ttf", 50)
        subtitle_font = ImageFont.truetype("arial.ttf", 30)
        name_font = ImageFont.truetype("arial.ttf", 45)
        text_font = ImageFont.truetype("arial.ttf", 22)
        signature_font = ImageFont.truetype("arial.ttf", 18)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        name_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
        signature_font = ImageFont.load_default()
    
    # Logo IT HUB (texte stylisé)
    logo_text = "IT HUB"
    logo_bbox = draw.textbbox((0, 0), logo_text, font=title_font)
    logo_width = logo_bbox[2] - logo_bbox[0]
    logo_x = (width - logo_width) // 2
    draw.text((logo_x, 100), logo_text, fill=it_hub_purple, font=title_font)
    
    # Sous-titre
    subtitle = "CERTIFICATION"
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (width - subtitle_width) // 2
    draw.text((subtitle_x, 170), subtitle, fill=white, font=subtitle_font)
    
    # Ligne décorative sous le titre
    line_y = 220
    draw.line([(width // 4, line_y), (width * 3 // 4, line_y)], fill=gold, width=2)
    
    # Texte d'introduction
    intro_text = "ATTESTATION DE RÉUSSITE"
    intro_bbox = draw.textbbox((0, 0), intro_text, font=text_font)
    intro_width = intro_bbox[2] - intro_bbox[0]
    intro_x = (width - intro_width) // 2
    draw.text((intro_x, 280), intro_text, fill=it_hub_blue, font=text_font)
    
    # Texte principal
    user_name = f"{certification.user.first_name} {certification.user.last_name}"
    quiz_title = certification.quiz.title
    trainer_name = certification.quiz.trainer_name
    
    # Récupérer le score depuis la tentative la plus récente si disponible
    from .models import Attempt
    latest_attempt = Attempt.objects.filter(user=certification.user, quiz=certification.quiz).order_by('-attempt_date').first()
    score = latest_attempt.score if latest_attempt else None
    
    main_text = "Le présent document certifie que"
    
    # Calculer la position pour centrer le texte
    lines = main_text.split('\n')
    y_position = 340
    line_height = 35
    
    for line in lines:
        if line.strip():
            line_bbox = draw.textbbox((0, 0), line, font=text_font)
            line_width = line_bbox[2] - line_bbox[0]
            line_x = (width - line_width) // 2
            draw.text((line_x, y_position), line, fill=white, font=text_font)
        y_position += line_height
    
    # Nom de l'étudiant (mis en évidence)
    name_bbox = draw.textbbox((0, 0), user_name, font=name_font)
    name_width = name_bbox[2] - name_bbox[0]
    name_x = (width - name_width) // 2
    draw.text((name_x, y_position), user_name, fill=it_hub_purple, font=name_font)
    y_position += 75
    
    # Suite du texte
    continuation_text = "a réussi avec succès la certification"
    cont_bbox = draw.textbbox((0, 0), continuation_text, font=text_font)
    cont_width = cont_bbox[2] - cont_bbox[0]
    cont_x = (width - cont_width) // 2
    draw.text((cont_x, y_position), continuation_text, fill=white, font=text_font)
    y_position += 50
    
    # Titre du quiz
    quiz_bbox = draw.textbbox((0, 0), quiz_title, font=subtitle_font)
    quiz_width = quiz_bbox[2] - quiz_bbox[0]
    quiz_x = (width - quiz_width) // 2
    draw.text((quiz_x, y_position), quiz_title, fill=it_hub_indigo, font=subtitle_font)
    y_position += 60
    
    # Score
    score_text = f"Score: {score}%" if score else ""
    if score_text:
        score_bbox = draw.textbbox((0, 0), score_text, font=text_font)
        score_width = score_bbox[2] - score_bbox[0]
        score_x = (width - score_width) // 2
        draw.text((score_x, y_position), score_text, fill=gold, font=text_font)
    
    # Date
    date_text = f"Délivré le {certification.obtained_date.strftime('%d %B %Y')}"
    date_bbox = draw.textbbox((0, 0), date_text, font=signature_font)
    date_width = date_bbox[2] - date_bbox[0]
    draw.text(((width - date_width) // 2, height - 180), date_text, fill=white, font=signature_font)
    
    # Signature du formateur
    signature_text = f"Formateur: {trainer_name}"
    signature_bbox = draw.textbbox((0, 0), signature_text, font=signature_font)
    signature_width = signature_bbox[2] - signature_bbox[0]
    draw.text(((width - signature_width) // 2, height - 140), signature_text, fill=it_hub_purple, font=signature_font)
    
    # Ligne de signature
    # sig_line_y = height - 130
    # sig_line_width = 200
    # draw.line([((width - sig_line_width) // 2, sig_line_y), ((width + sig_line_width) // 2, sig_line_y)], fill=white, width=2)
    
    # ID de certification
    # cert_id_text = f"ID: {certification.id}"
    # cert_id_bbox = draw.textbbox((0, 0), cert_id_text, font=signature_font)
    # cert_id_width = cert_id_bbox[2] - cert_id_bbox[0]
    # draw.text(((width - cert_id_width) // 2, height - 80), cert_id_text, fill=it_hub_blue, font=signature_font)
    
    # Convertir en bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    # Sauvegarder le fichier
    filename = f"certification_{certification.id}.png"
    certification.png_file.save(filename, ContentFile(img_bytes.read()), save=True)
    
    return certification.png_file


def generate_certification_pdf(certification):
    """
    Génère une attestation PDF pour une certification donnée avec design IT HUB
    """
    # Dimensions du certificat (format portrait standard pour certificats en ligne)
    width, height = 1200, 900
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=(width, height))
    
    # Couleurs IT HUB
    it_hub_purple = (124/255, 58/255, 237/255)  # #7c3aed
    it_hub_indigo = (79/255, 70/255, 229/255)   # #4f46e5
    it_hub_blue = (37/255, 99/255, 235/255)     # #2563eb
    white = (248/255, 250/255, 252/255)         # #f8fafc
    gold = (251/255, 191/255, 36/255)           # #fbbf24
    dark_bg = (15/255, 23/255, 42/255)          # #0f172a
    
    # Fond avec dégradé simulé
    p.setFillColorRGB(*dark_bg)
    p.rect(0, 0, width, height, fill=1, stroke=0)
    
    # Bordure décorative avec dégradé
    border_width = 10
    for i in range(border_width):
        alpha = 1 - (i / border_width)
        p.setStrokeColorRGB(it_hub_purple[0] * alpha, it_hub_purple[1] * alpha, it_hub_purple[2] * alpha)
        p.setLineWidth(1)
        p.rect(i, i, width - 2*i, height - 2*i)
    
    # Bordure intérieure dorée
    p.setStrokeColorRGB(*gold)
    p.setLineWidth(2)
    p.rect(border_width + 8, border_width + 8, width - 2*(border_width + 8), height - 2*(border_width + 8))
    
    # Coins décoratifs
    corner_size = 75
    # Coin supérieur gauche
    for i in range(corner_size):
        alpha = 1 - (i / corner_size)
        p.setStrokeColorRGB(it_hub_purple[0] * alpha, it_hub_purple[1] * alpha, it_hub_purple[2] * alpha)
        p.setLineWidth(2)
        p.line(border_width + i, border_width + corner_size, border_width + corner_size, border_width + i)
    
    # Coin supérieur droit
    for i in range(corner_size):
        alpha = 1 - (i / corner_size)
        p.setStrokeColorRGB(it_hub_purple[0] * alpha, it_hub_purple[1] * alpha, it_hub_purple[2] * alpha)
        p.setLineWidth(2)
        p.line(width - border_width - corner_size, border_width + i, width - border_width - i, border_width + corner_size)
    
    # Coin inférieur gauche
    for i in range(corner_size):
        alpha = 1 - (i / corner_size)
        p.setStrokeColorRGB(it_hub_purple[0] * alpha, it_hub_purple[1] * alpha, it_hub_purple[2] * alpha)
        p.setLineWidth(2)
        p.line(border_width + i, height - border_width - corner_size, border_width + corner_size, height - border_width - i)
    
    # Coin inférieur droit
    for i in range(corner_size):
        alpha = 1 - (i / corner_size)
        p.setStrokeColorRGB(it_hub_purple[0] * alpha, it_hub_purple[1] * alpha, it_hub_purple[2] * alpha)
        p.setLineWidth(2)
        p.line(width - border_width - corner_size, height - border_width - i, width - border_width - i, height - border_width - corner_size)
    
    # Logo IT HUB
    p.setFillColorRGB(*it_hub_purple)
    p.setFont("Helvetica-Bold", 24)
    logo_text = "IT HUB"
    logo_width = p.stringWidth(logo_text, "Helvetica-Bold", 24)
    p.drawString((width - logo_width) / 2, height - 80, logo_text)
    
    # Sous-titre
    p.setFillColorRGB(*white)
    p.setFont("Helvetica-Bold", 16)
    subtitle = "CERTIFICATION"
    subtitle_width = p.stringWidth(subtitle, "Helvetica-Bold", 16)
    p.drawString((width - subtitle_width) / 2, height - 110, subtitle)
    
    # Ligne décorative
    p.setStrokeColorRGB(*gold)
    p.setLineWidth(2)
    p.line(width / 4, height - 130, width * 3 / 4, height - 130)
    
    # Texte d'introduction
    p.setFillColorRGB(*it_hub_blue)
    p.setFont("Helvetica-Bold", 12)
    intro_text = "ATTESTATION DE RÉUSSITE"
    intro_width = p.stringWidth(intro_text, "Helvetica-Bold", 12)
    p.drawString((width - intro_width) / 2, height - 170, intro_text)
    
    # Texte principal
    p.setFillColorRGB(*white)
    p.setFont("Helvetica", 10)
    user_name = f"{certification.user.first_name} {certification.user.last_name}"
    quiz_title = certification.quiz.title
    trainer_name = certification.quiz.trainer_name
    
    # Récupérer le score depuis la tentative la plus récente si disponible
    from .models import Attempt
    latest_attempt = Attempt.objects.filter(user=certification.user, quiz=certification.quiz).order_by('-attempt_date').first()
    score = latest_attempt.score if latest_attempt else None
    
    main_text = "Le présent document certifie que"
    main_text_width = p.stringWidth(main_text, "Helvetica", 10)
    p.drawString((width - main_text_width) / 2, height - 220, main_text)
    
    # Nom de l'étudiant (mis en évidence)
    p.setFillColorRGB(*it_hub_purple)
    p.setFont("Helvetica-Bold", 18)
    name_width = p.stringWidth(user_name, "Helvetica-Bold", 18)
    p.drawString((width - name_width) / 2, height - 260, user_name)
    
    # Suite du texte
    p.setFillColorRGB(*white)
    p.setFont("Helvetica", 10)
    continuation_text = "a réussi avec succès la certification"
    cont_width = p.stringWidth(continuation_text, "Helvetica", 10)
    p.drawString((width - cont_width) / 2, height - 300, continuation_text)
    
    # Titre du quiz
    p.setFillColorRGB(*it_hub_indigo)
    p.setFont("Helvetica-Bold", 14)
    quiz_width = p.stringWidth(quiz_title, "Helvetica-Bold", 14)
    p.drawString((width - quiz_width) / 2, height - 340, quiz_title)
    
    # Score
    if score:
        p.setFillColorRGB(*gold)
        p.setFont("Helvetica-Bold", 12)
        score_text = f"Score: {score}%"
        score_width = p.stringWidth(score_text, "Helvetica-Bold", 12)
        p.drawString((width - score_width) / 2, height - 380, score_text)
    
    # Date
    p.setFillColorRGB(*white)
    p.setFont("Helvetica", 9)
    date_text = f"Délivré le {certification.obtained_date.strftime('%d %B %Y')}"
    date_width = p.stringWidth(date_text, "Helvetica", 9)
    p.drawString((width - date_width) / 2, 120, date_text)
    
    # Signature du formateur
    p.setFillColorRGB(*it_hub_purple)
    p.setFont("Helvetica", 9)
    signature_text = f"Formateur: {trainer_name}"
    signature_width = p.stringWidth(signature_text, "Helvetica", 9)
    p.drawString((width - signature_width) / 2, 90, signature_text)
    
    # Ligne de signature
    # p.setStrokeColorRGB(*white)
    # p.setLineWidth(2)
    # sig_line_width = 150
    # p.line((width - sig_line_width) / 2, 80, (width + sig_line_width) / 2, 80)
    
    # ID de certification
    # p.setFillColorRGB(*it_hub_blue)
    # p.setFont("Helvetica", 8)
    # cert_id_text = f"ID: {certification.id}"
    # cert_id_width = p.stringWidth(cert_id_text, "Helvetica", 8)
    # p.drawString((width - cert_id_width) / 2, 50, cert_id_text)
    
    p.save()
    
    # Sauvegarder le fichier
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    filename = f"certification_{certification.id}.pdf"
    certification.pdf_file.save(filename, ContentFile(pdf_bytes), save=True)
    
    return certification.pdf_file


def generate_certification_files(certification):
    """
    Génère les fichiers PNG et PDF pour une certification
    """
    try:
        generate_certification_png(certification)
        generate_certification_pdf(certification)
        return True
    except Exception as e:
        print(f"Erreur lors de la génération des fichiers de certification: {e}")
        return False
