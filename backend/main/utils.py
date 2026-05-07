from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.lib.colors import black, darkblue
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import io
import os
from django.conf import settings
from django.core.files.base import ContentFile
from .models import Certification


def generate_certification_png(certification):
    """
    Génère une attestation PNG pour une certification donnée
    """
    # Dimensions du certificat (format A4 en pixels à 300 DPI)
    width, height = 2480, 3508
    
    # Créer une image blanche
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)
    
    # Couleurs
    dark_blue = (0, 51, 102)
    gold = (255, 215, 0)
    
    # Essayer de charger des polices, utiliser des polices par défaut si non disponibles
    try:
        title_font = ImageFont.truetype("arial.ttf", 80)
        text_font = ImageFont.truetype("arial.ttf", 40)
        signature_font = ImageFont.truetype("arial.ttf", 30)
    except:
        title_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
        signature_font = ImageFont.load_default()
    
    # Bordure décorative
    border_margin = 50
    draw.rectangle([border_margin, border_margin, width - border_margin, height - border_margin], 
                  outline=dark_blue, width=5)
    draw.rectangle([border_margin + 10, border_margin + 10, width - border_margin - 10, height - border_margin - 10], 
                  outline=gold, width=2)
    
    # Titre
    title = "ATTESTATION DE PARTICIPATION"
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    draw.text((title_x, 300), title, fill=dark_blue, font=title_font)
    
    # Texte principal
    user_name = f"{certification.user.first_name} {certification.user.last_name}"
    quiz_title = certification.quiz.title
    trainer_name = certification.quiz.trainer_name
    
    main_text = f"Le soussigné certifie que\n\n{user_name}\n\na suivi l'intégralité de la formation sur\n\n{quiz_title}"
    
    # Calculer la position pour centrer le texte
    lines = main_text.split('\n')
    y_position = 800
    line_height = 60
    
    for line in lines:
        if line.strip():
            line_bbox = draw.textbbox((0, 0), line, font=text_font)
            line_width = line_bbox[2] - line_bbox[0]
            line_x = (width - line_width) // 2
            draw.text((line_x, y_position), line, fill=black, font=text_font)
        y_position += line_height
    
    # Date
    date_text = f"Fait le {certification.obtained_date.strftime('%d %B %Y')}"
    date_bbox = draw.textbbox((0, 0), date_text, font=signature_font)
    date_width = date_bbox[2] - date_bbox[0]
    draw.text(((width - date_width) // 2, height - 400), date_text, fill=black, font=signature_font)
    
    # Signature du formateur
    signature_text = f"Formateur: {trainer_name}"
    signature_bbox = draw.textbbox((0, 0), signature_text, font=signature_font)
    signature_width = signature_bbox[2] - signature_bbox[0]
    draw.text(((width - signature_width) // 2, height - 300), signature_text, fill=dark_blue, font=signature_font)
    
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
    Génère une attestation PDF pour une certification donnée
    """
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    # Couleurs
    dark_blue = (0, 51/255, 102/255)
    
    # Bordure décorative
    p.setStrokeColorRGB(*dark_blue)
    p.setLineWidth(2)
    p.rect(50, 50, width - 100, height - 100)
    
    # Titre
    p.setFont("Helvetica-Bold", 24)
    title = "ATTESTATION DE PARTICIPATION"
    title_width = p.stringWidth(title, "Helvetica-Bold", 24)
    p.drawString((width - title_width) / 2, height - 150, title)
    
    # Texte principal
    p.setFont("Helvetica", 16)
    user_name = f"{certification.user.first_name} {certification.user.last_name}"
    quiz_title = certification.quiz.title
    trainer_name = certification.quiz.trainer_name
    
    main_text = f"Le soussigné certifie que\n\n{user_name}\n\na suivi l'intégralité de la formation sur\n\n{quiz_title}"
    
    # Centrer le texte
    lines = main_text.split('\n')
    y_position = height - 350
    line_height = 30
    
    for line in lines:
        if line.strip():
            line_width = p.stringWidth(line, "Helvetica", 16)
            p.drawString((width - line_width) / 2, y_position, line)
        y_position -= line_height
    
    # Date
    p.setFont("Helvetica", 12)
    date_text = f"Fait le {certification.obtained_date.strftime('%d %B %Y')}"
    date_width = p.stringWidth(date_text, "Helvetica", 12)
    p.drawString((width - date_width) / 2, 200, date_text)
    
    # Signature du formateur
    signature_text = f"Formateur: {trainer_name}"
    signature_width = p.stringWidth(signature_text, "Helvetica", 12)
    p.drawString((width - signature_width) / 2, 150, signature_text)
    
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
    generate_certification_png(certification)
    generate_certification_pdf(certification)
    return certification
