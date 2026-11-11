"""
Generate Today's Updates PPT — short, simple 1-line bullet points.
No AI assistant / voice chatbot content.
"""
import os
import shutil
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Colors
    C_DARK = RGBColor(15, 23, 42)
    C_SLATE_CARD = RGBColor(30, 41, 59)
    C_TEAL = RGBColor(13, 148, 136)
    C_CYAN = RGBColor(56, 189, 248)
    C_WHITE = RGBColor(255, 255, 255)
    C_TEXT = RGBColor(51, 65, 85)
    C_BORDER = RGBColor(226, 232, 240)

    blank_layout = prs.slide_layouts[6]

    def add_header(slide, title_text, category_text="MYCARE AI • TODAY'S ENHANCEMENTS"):
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(11.7), Inches(1.1))
        tf = header_box.text_frame
        tf.word_wrap = True
        p_cat = tf.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = C_TEAL
        p_cat.space_after = Pt(2)
        p_title = tf.add_paragraph()
        p_title.text = title_text
        p_title.font.size = Pt(23)
        p_title.font.bold = True
        p_title.font.color.rgb = C_DARK
        div = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.45), Inches(11.7), Inches(0.025))
        div.fill.solid()
        div.fill.fore_color.rgb = C_BORDER
        div.line.fill.background()

    def add_card(slide, left, top, width, height, title="", items=None, bg_color=C_WHITE, border_color=C_BORDER, title_color=C_DARK, font_size=Pt(14)):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.5)
        tb = slide.shapes.add_textbox(left + Inches(0.28), top + Inches(0.22), width - Inches(0.56), height - Inches(0.44))
        tf = tb.text_frame
        tf.word_wrap = True
        if title:
            p_title = tf.paragraphs[0]
            p_title.text = title
            p_title.font.size = Pt(16)
            p_title.font.bold = True
            p_title.font.color.rgb = title_color
            p_title.space_after = Pt(8)
            first = False
        else:
            first = True
        if items:
            for item in items:
                p = tf.add_paragraph() if not first else tf.paragraphs[0]
                first = False
                p.text = "•  " + item
                p.font.size = font_size
                p.font.color.rgb = C_TEXT
                p.space_after = Pt(7)

    # ─── SLIDE 1: Title Slide ───
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = C_DARK
    bg1.line.fill.background()

    tb1 = s1.shapes.add_textbox(Inches(0.9), Inches(1.1), Inches(7.6), Inches(5.6))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p1_tag = tf1.paragraphs[0]
    p1_tag.text = "TODAY'S SYSTEM ENHANCEMENTS"
    p1_tag.font.size = Pt(13)
    p1_tag.font.bold = True
    p1_tag.font.color.rgb = C_TEAL
    p1_tag.space_after = Pt(10)

    p1_title = tf1.add_paragraph()
    p1_title.text = "MyCare AI: New Features & Improvements"
    p1_title.font.size = Pt(30)
    p1_title.font.bold = True
    p1_title.font.color.rgb = C_WHITE
    p1_title.space_after = Pt(14)

    p1_sub = tf1.add_paragraph()
    p1_sub.text = "• PulmoNews Research Hub\n• Clinical Guidance & Protocols\n• Backend & Frontend Upgrades"
    p1_sub.font.size = Pt(15.5)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = C_CYAN
    p1_sub.space_after = Pt(22)

    p1_info = tf1.add_paragraph()
    p1_info.text = "Department of Computer Science & Engineering • Academic Year 2026"
    p1_info.font.size = Pt(12.5)
    p1_info.font.bold = True
    p1_info.font.color.rgb = RGBColor(148, 163, 184)

    # Team box
    team_shape = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.8), Inches(3.6), Inches(3.8), Inches(3.2))
    team_shape.fill.solid()
    team_shape.fill.fore_color.rgb = C_SLATE_CARD
    team_shape.line.color.rgb = C_TEAL
    team_shape.line.width = Pt(1.5)
    team_tb = s1.shapes.add_textbox(Inches(9.0), Inches(3.75), Inches(3.4), Inches(2.9))
    team_tf = team_tb.text_frame
    team_tf.word_wrap = True
    p_team_title = team_tf.paragraphs[0]
    p_team_title.text = "PROJECT TEAM"
    p_team_title.font.size = Pt(12)
    p_team_title.font.bold = True
    p_team_title.font.color.rgb = C_TEAL
    p_team_title.space_after = Pt(8)
    for name, usn in [("VINITHRAM", "NNM23CS231"), ("VINITH V DEVADIGA", "NN23CS230"), ("TEJAS N", "NNM23CS217"), ("VISHNU K", "NNM23CS233")]:
        p_mem = team_tf.add_paragraph()
        p_mem.text = f"• {name} — {usn}"
        p_mem.font.size = Pt(11.5)
        p_mem.font.bold = True
        p_mem.font.color.rgb = C_WHITE
        p_mem.space_after = Pt(4)

    # ─── SLIDE 2: What We Did Today ───
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "1. Overview — What Changed Today")
    add_card(s2, Inches(0.8), Inches(1.7), Inches(5.6), Inches(5.2), "New Features Added", [
        "Added PulmoNews page with 5 medical article categories",
        "Added clinical guidance based on Fleischner Society rules",
        "Added respiratory exercises and pain relief tips",
        "Improved backend speed with async database queries",
    ])
    add_card(s2, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.2), "Why These Changes Matter", [
        "Patients get latest lung cancer research in one place",
        "Doctors get evidence-based follow-up recommendations",
        "Breathing exercises help patients manage chest pain",
        "Faster backend means quicker scan results for users",
    ])

    # ─── SLIDE 3: PulmoNews Research Hub ───
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "2. PulmoNews — Medical Research Hub")
    add_card(s3, Inches(0.8), Inches(1.7), Inches(3.7), Inches(5.2), "5 Article Categories", [
        "AI Innovations — latest AI screening methods",
        "Clinical Trials — ongoing cancer treatment studies",
        "Immunotherapy — new immune-based treatments",
        "Patient Tips — symptom and recovery guidance",
        "Nutrition — lung-healthy diet recommendations",
    ])
    add_card(s3, Inches(4.8), Inches(1.7), Inches(3.7), Inches(5.2), "Search & Filter", [
        "Real-time keyword search across all articles",
        "Category tabs to switch topics instantly",
        "Reading time and source badges on each card",
        "Works on mobile, tablet, and desktop screens",
    ])
    add_card(s3, Inches(8.8), Inches(1.7), Inches(3.7), Inches(5.2), "Benefits", [
        "Keeps doctors updated with latest findings",
        "Helps patients understand their condition",
        "Links directly from scan results to articles",
    ])

    # ─── SLIDE 4: Clinical Images ───
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "3. Clinical Photography & Visuals")
    add_card(s4, Inches(0.8), Inches(1.7), Inches(5.6), Inches(5.2), "Medical Images Added", [
        "Pathology images showing cell-level views",
        "Radiology workstation screenshots",
        "Lab research and immunotherapy photos",
        "Patient consultation environment images",
    ])
    add_card(s4, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.2), "Design Quality", [
        "Smooth hover animations using Framer Motion",
        "Compressed images for fast page loading",
        "Clean card layout with category tags",
        "Color contrast follows accessibility standards",
    ])

    # ─── SLIDE 5: Clinical Decision Support ───
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "4. Clinical Decision Support & Guidelines")
    add_card(s5, Inches(0.8), Inches(1.7), Inches(5.6), Inches(5.2), "Fleischner Society Guidelines", [
        "Normal scan — schedule routine annual checkup",
        "Benign nodule — follow-up CT in 3-6 months",
        "Stable nodule for 2 years — no biopsy needed",
        "Malignant suspicion — urgent oncologist review",
    ])
    add_card(s5, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.2), "Treatment Options Shown", [
        "Surgery — removal of tumor in early stages",
        "Radiation — targeted rays to shrink tumors",
        "Immunotherapy — helps immune system fight cancer",
        "Targeted therapy — drugs for specific gene mutations",
    ])

    # ─── SLIDE 6: Breathing Exercises ───
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "5. Respiratory Care & Pain Relief")
    add_card(s6, Inches(0.8), Inches(1.7), Inches(5.6), Inches(5.2), "Breathing Exercises", [
        "Diaphragmatic breathing to improve lung capacity",
        "Pursed-lip breathing to keep airways open",
        "4-7-8 technique to relax chest muscles",
        "Spirometry exercises to prevent lung collapse",
    ])
    add_card(s6, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.2), "Pain Management Tips", [
        "Elevate head 30-45 degrees to ease breathing",
        "Steam inhalation to clear blocked airways",
        "Anti-inflammatory foods like turmeric and ginger",
        "Red-flag warnings for emergency chest pain",
    ])

    # ─── SLIDE 7: Backend Architecture ───
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "6. Backend — FastAPI Improvements")
    add_card(s7, Inches(0.8), Inches(1.7), Inches(3.7), Inches(5.2), "API Endpoints", [
        "POST /api/predict — upload and classify CT scan",
        "GET /api/history — view past scan records",
        "DELETE /api/history/{id} — remove a record",
        "GET /api/health — check server status",
    ])
    add_card(s7, Inches(4.8), Inches(1.7), Inches(3.7), Inches(5.2), "Performance", [
        "Async database — no blocking during queries",
        "Pydantic V2 for fast data validation",
        "Direct image-to-model pipeline (no disk saves)",
        "Uvicorn ASGI server for high concurrency",
    ])
    add_card(s7, Inches(8.8), Inches(1.7), Inches(3.7), Inches(5.2), "Security", [
        "Only allows JPEG, PNG, WebP image uploads",
        "Max file size limited to 10 MB",
        "CORS configured for safe cross-origin access",
        "Proper error messages for invalid requests",
    ])

    # ─── SLIDE 8: Deep Learning Model ───
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "7. Deep Learning Model & Heatmaps")
    add_card(s8, Inches(0.8), Inches(1.7), Inches(5.6), Inches(5.2), "ResNet-18 Model", [
        "18-layer deep neural network for CT classification",
        "Balanced training to handle uneven class sizes",
        "Small model size — only 44.7 MB",
        "99.37% accuracy on 2,077 test CT scans",
    ])
    add_card(s8, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.2), "Grad-CAM Heatmaps", [
        "Highlights which area the model looked at",
        "Shows exact pixels used for the decision",
        "Color-coded overlay on the original CT scan",
        "Generated in under 150 milliseconds",
    ])

    # ─── SLIDE 9: Frontend UI ───
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, "8. Frontend — React UI Improvements")
    add_card(s9, Inches(0.8), Inches(1.7), Inches(5.6), Inches(5.2), "Scan & Results Page", [
        "Drag-and-drop image upload with preview",
        "One-click sample scans for quick testing",
        "Animated confidence gauge showing result",
        "Side-by-side original vs heatmap comparison",
    ])
    add_card(s9, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.2), "Reports & History", [
        "Auto-generated clinical action plan per scan",
        "Treatment cards explaining each option",
        "One-click PDF report download",
        "Scan history table with delete option",
    ])

    # ─── SLIDE 10: Testing & Benchmarks ───
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, "9. Testing & Performance Results")
    add_card(s10, Inches(0.8), Inches(1.7), Inches(5.6), Inches(5.2), "Speed Benchmarks", [
        "Full scan prediction in under 145 ms",
        "Heatmap generation in under 42 ms",
        "API round-trip time under 210 ms",
        "Database query under 8 ms for 50 records",
    ])
    add_card(s10, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.2), "Verification Results", [
        "Backend health check — passed (HTTP 200)",
        "Frontend loads with zero console errors",
        "Accuracy — Benign 99.7%, Malignant 98.1%, Normal 98.8%",
        "Follows Fleischner nodule management standards",
    ])

    # ─── SLIDE 11: Conclusion ───
    s11 = prs.slides.add_slide(blank_layout)
    bg11 = s11.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg11.fill.solid()
    bg11.fill.fore_color.rgb = C_DARK
    bg11.line.fill.background()

    tb11 = s11.shapes.add_textbox(Inches(1.0), Inches(1.4), Inches(11.3), Inches(5.0))
    tf11 = tb11.text_frame
    tf11.word_wrap = True

    p11_tag = tf11.paragraphs[0]
    p11_tag.text = "SUMMARY"
    p11_tag.font.size = Pt(14)
    p11_tag.font.bold = True
    p11_tag.font.color.rgb = C_TEAL
    p11_tag.space_after = Pt(12)

    p11_title = tf11.add_paragraph()
    p11_title.text = "Today's Key Achievements"
    p11_title.font.size = Pt(28)
    p11_title.font.bold = True
    p11_title.font.color.rgb = C_WHITE
    p11_title.space_after = Pt(16)

    p11_sub = tf11.add_paragraph()
    p11_sub.text = "Added PulmoNews research hub, clinical guidelines, breathing exercises,\nfaster backend, and improved frontend — all in one day."
    p11_sub.font.size = Pt(16)
    p11_sub.font.color.rgb = RGBColor(203, 213, 225)
    p11_sub.space_after = Pt(24)

    p11_closing = tf11.add_paragraph()
    p11_closing.text = "MyCare AI • Department of Computer Science & Engineering • Thank You!"
    p11_closing.font.size = Pt(14)
    p11_closing.font.bold = True
    p11_closing.font.color.rgb = C_CYAN

    output_path = "MyCare_Todays_Innovations_Presentation.pptx"
    prs.save(output_path)
    print(f"Saved: {os.path.abspath(output_path)}")

    shutil.copy2(output_path, "frontend/public/MyCare_Todays_Innovations_Presentation.pptx")
    shutil.copy2(output_path, "frontend/public/MyCare_Today_Changes_Slides.pptx")

    desktop_dest = os.path.expanduser('~/Desktop/MyCare_Todays_Innovations_Presentation.pptx')
    try:
        shutil.copy2(output_path, desktop_dest)
        print("Copied to Desktop:", desktop_dest)
    except Exception as e:
        print("Desktop copy notice:", e)

if __name__ == "__main__":
    build_presentation()
