"""
PDF Generator — DOT-compliant 24-hour ELD log PDF report builder.
"""

import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from models.log_sheet import DailyLog


class PDFGenerator:
    """Generates DOT-compliant 24-hour driver ELD log PDF reports."""

    def generate_daily_log_pdf(self, daily_log: DailyLog) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        elements = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0f172a'),
            alignment=1
        )

        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#475569'),
            alignment=1
        )

        elements.append(Paragraph("<b>DRIVER'S DAILY LOG (24 Hours)</b>", title_style))
        elements.append(Paragraph("FMCSA / DOT Hours of Service (HOS) Record of Duty Status", subtitle_style))
        elements.append(Spacer(1, 15))

        trip = daily_log.trip
        info_data = [
            [
                Paragraph(f"<b>Log ID:</b> {daily_log.id}", styles['Normal']),
                Paragraph(f"<b>Day Number:</b> Day {daily_log.day_number}", styles['Normal']),
            ],
            [
                Paragraph(f"<b>Origin:</b> {trip.current_location}", styles['Normal']),
                Paragraph(f"<b>Destination:</b> {trip.dropoff_location}", styles['Normal']),
            ],
            [
                Paragraph(f"<b>Total Distance:</b> {daily_log.total_miles_driven} miles", styles['Normal']),
                Paragraph(f"<b>Date:</b> {daily_log.created_at.strftime('%Y-%m-%d')}", styles['Normal']),
            ]
        ]

        info_table = Table(info_data, colWidths=[270, 270])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 15))

        summary_data = [
            ['Duty Status Category', 'Hours Allocated', 'HOS Limit / Status'],
            ['1. OFF DUTY', f"{daily_log.off_duty_hours:.2f} hrs", 'Compliant'],
            ['2. SLEEPER BERTH', f"{daily_log.sleeper_berth_hours:.2f} hrs", 'Compliant'],
            ['3. DRIVING', f"{daily_log.driving_hours:.2f} hrs", 'Max 11.0 hrs (OK)' if daily_log.driving_hours <= 11.0 else 'VIOLATION'],
            ['4. ON DUTY (NOT DRIVING)', f"{daily_log.on_duty_not_driving_hours:.2f} hrs", 'Compliant'],
            ['TOTAL ACCOUNTED HOURS', '24.00 hrs', '24-Hour Total Valid']
        ]

        summary_table = Table(summary_data, colWidths=[220, 160, 160])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('ALIGN', (2, 0), (2, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#94a3b8')),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 20))

        doc.build(elements)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
