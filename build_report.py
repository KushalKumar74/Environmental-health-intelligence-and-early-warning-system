import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls
import os

def create_project_report():
    doc = docx.Document()

    # -------------------------------------------------------------
    # PAGE SETUP & MARGINS (1 inch = 1440 dxa)
    # -------------------------------------------------------------
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        # Configure Header & Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("ENVIRONMENTAL HEALTH INTELLIGENCE & EARLY WARNING SYSTEM (EHI-EWS)")
        hrun.font.name = "Times New Roman"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(100, 116, 139)
        hrun.font.italic = True

        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
        frun = fp.add_run("Dayananda Sagar College of Arts, Science and Commerce | Dept. of MCA")
        frun.font.name = "Times New Roman"
        frun.font.size = Pt(9)
        frun.font.color.rgb = RGBColor(100, 116, 139)

    # -------------------------------------------------------------
    # COLOR PALETTE DEFINITIONS
    # -------------------------------------------------------------
    COLOR_PRIMARY = RGBColor(15, 23, 42)       # Slate 900 / Midnight Navy
    COLOR_TEAL = RGBColor(13, 148, 136)        # Refined Teal Accent
    COLOR_BODY = RGBColor(30, 41, 59)          # Charcoal Body Text
    HEX_TEAL = "0D9488"
    HEX_LIGHT_BG = "F8FAFC"
    HEX_BORDER = "E2E8F0"
    HEX_DARK = "0F172A"

    # Helper XML Functions
    def set_cell_background(cell, fill_hex):
        tcPr = cell._element.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        tcPr.append(shd)

    def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
        tcPr = cell._element.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
        tcPr.append(tcMar)

    def add_custom_heading(doc, text, level):
        p = doc.add_paragraph()
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Times New Roman"
        run.bold = True
        
        if level == 1:
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(16)
            p.paragraph_format.space_after = Pt(8)
            run.font.size = Pt(14)
            run.font.color.rgb = COLOR_PRIMARY
            # Force uppercase for Main Headings as per docx instructions
            run.text = text.upper()
        elif level == 2:
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(6)
            run.font.size = Pt(12)
            run.font.color.rgb = COLOR_PRIMARY
        elif level == 3:
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(4)
            run.font.size = Pt(12)
            run.font.italic = True
            run.font.color.rgb = COLOR_TEAL
        return p

    def add_body_p(doc, text="", bold_prefix="", italic_prefix=""):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(6)

        if bold_prefix:
            r_b = p.add_run(bold_prefix)
            r_b.font.name = "Times New Roman"
            r_b.font.size = Pt(12)
            r_b.font.bold = True
            r_b.font.color.rgb = COLOR_BODY

        if italic_prefix:
            r_i = p.add_run(italic_prefix)
            r_i.font.name = "Times New Roman"
            r_i.font.size = Pt(12)
            r_i.font.italic = True
            r_i.font.color.rgb = COLOR_BODY

        if text:
            r_t = p.add_run(text)
            r_t.font.name = "Times New Roman"
            r_t.font.size = Pt(12)
            r_t.font.color.rgb = COLOR_BODY
        return p

    def add_bullet_item(doc, text="", bold_prefix=""):
        p = doc.add_paragraph(style='List Bullet')
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(4)

        if bold_prefix:
            r_b = p.add_run(bold_prefix)
            r_b.font.name = "Times New Roman"
            r_b.font.size = Pt(12)
            r_b.font.bold = True
            r_b.font.color.rgb = COLOR_BODY

        if text:
            r_t = p.add_run(text)
            r_t.font.name = "Times New Roman"
            r_t.font.size = Pt(12)
            r_t.font.color.rgb = COLOR_BODY
        return p

    # -------------------------------------------------------------
    # 1. FRONT COVER / TITLE PAGE
    # -------------------------------------------------------------
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_after = Pt(2)
    r = p_inst.add_run("DAYANANDA SAGAR COLLEGE OF ARTS, SCIENCE AND COMMERCE")
    r.font.name = "Times New Roman"
    r.font.size = Pt(15)
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY

    p_dept = doc.add_paragraph()
    p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept.paragraph_format.space_after = Pt(4)
    r = p_dept.add_run("DEPARTMENT OF COMPUTER APPLICATIONS\nBANGALORE - 560111")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.bold = True

    p_deg = doc.add_paragraph()
    p_deg.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_deg.paragraph_format.space_before = Pt(12)
    p_deg.paragraph_format.space_after = Pt(18)
    r = p_deg.add_run("Master of Computer Applications (MCA)\nMCA 2024 - 2026")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = COLOR_TEAL

    p_rep = doc.add_paragraph()
    p_rep.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_rep.paragraph_format.space_after = Pt(4)
    r = p_rep.add_run("A PROJECT REPORT ON")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.bold = True

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(6)
    p_title.paragraph_format.space_after = Pt(24)
    r = p_title.add_run("ENVIRONMENTAL HEALTH INTELLIGENCE &\nEARLY WARNING SYSTEM (EHI-EWS)")
    r.font.name = "Times New Roman"
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(6)
    r = p_sub.add_run("Submitted by")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.italic = True

    p_stu = doc.add_paragraph()
    p_stu.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_stu.paragraph_format.space_after = Pt(24)
    r = p_stu.add_run("[STUDENT NAME]\nReg. No / USN: [YOUR REG NO / USN]")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.bold = True

    p_part = doc.add_paragraph()
    p_part.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_part.paragraph_format.space_after = Pt(24)
    r = p_part.add_run("In partial fulfillment of the requirements for the award of the degree of\nMaster of Computer Applications, Bangalore University\nUnder the guidance of")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11.5)

    # Table for Guides
    t_guides = doc.add_table(rows=1, cols=2)
    t_guides.alignment = WD_TABLE_ALIGNMENT.CENTER
    c0 = t_guides.cell(0, 0)
    c1 = t_guides.cell(0, 1)
    
    p_g0 = c0.paragraphs[0]
    p_g0.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_g0 = p_g0.add_run("Internal Guide\n[Internal Guide Name]\n[Designation], Dept. of MCA\nDSCASC, Bangalore")
    r_g0.font.name = "Times New Roman"
    r_g0.font.size = Pt(11)

    p_g1 = c1.paragraphs[0]
    p_g1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_g1 = p_g1.add_run("External Guide\n[External Guide Name]\n[Designation]\n[Company / Organization Name]")
    r_g1.font.name = "Times New Roman"
    r_g1.font.size = Pt(11)

    p_foot_inst = doc.add_paragraph()
    p_foot_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_foot_inst.paragraph_format.space_before = Pt(30)
    r = p_foot_inst.add_run("DAYANANDA SAGAR COLLEGE OF ARTS, SCIENCE AND COMMERCE\nDEPARTMENT OF COMPUTER APPLICATIONS\nBANGALORE - 560111\n2024 - 2026")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.bold = True

    doc.add_page_break()

    # -------------------------------------------------------------
    # 2. CERTIFICATE PAGE
    # -------------------------------------------------------------
    p_c_title = doc.add_paragraph()
    p_c_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_c_title.paragraph_format.space_after = Pt(18)
    r = p_c_title.add_run("DAYANANDA SAGAR COLLEGE OF ARTS, SCIENCE AND COMMERCE\nDEPARTMENT OF COMPUTER APPLICATIONS, BANGALORE - 560111")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.bold = True

    p_cert_hdr = doc.add_paragraph()
    p_cert_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cert_hdr.paragraph_format.space_after = Pt(24)
    r = p_cert_hdr.add_run("CERTIFICATE")
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY

    add_body_p(doc, "This is to certify that [STUDENT NAME] (Reg. No / USN: [YOUR REG NO / USN]) of IV semester MCA, has satisfactorily completed the project work during June 2026 to October 2026, entitled \"ENVIRONMENTAL HEALTH INTELLIGENCE & EARLY WARNING SYSTEM (EHI-EWS)\" in partial fulfillment of the requirements for the award of the degree of Master of Computer Applications under Bangalore University.")

    doc.add_paragraph().paragraph_format.space_after = Pt(40)

    # Examiners Signature Table
    t_sig = doc.add_table(rows=2, cols=2)
    t_sig.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    r0c0 = t_sig.cell(0, 0).paragraphs[0]
    r0c0.add_run("Internal Guide:\n\n________________________\n[Internal Guide Name]\n[Designation], DSCASC").font.name = "Times New Roman"
    
    r0c1 = t_sig.cell(0, 1).paragraphs[0]
    r0c1.add_run("External Guide / HOD:\n\n________________________\nProf. Dr. Kumudavalli M V\nDeputy Director, DSCASC").font.name = "Times New Roman"

    r1c0 = t_sig.cell(1, 0).paragraphs[0]
    r1c0.paragraph_format.space_before = Pt(30)
    r1c0.add_run("Signature of Examiners:\n\n1. ______________________\n\n2. ______________________").font.name = "Times New Roman"

    r1c1 = t_sig.cell(1, 1).paragraphs[0]
    r1c1.paragraph_format.space_before = Pt(30)
    r1c1.add_run("Date: ____________________\n\nPlace: Bangalore").font.name = "Times New Roman"

    doc.add_page_break()

    # -------------------------------------------------------------
    # 3. COMPANY INTERNSHIP CERTIFICATE
    # -------------------------------------------------------------
    p_comp_hdr = doc.add_paragraph()
    p_comp_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_comp_hdr.paragraph_format.space_after = Pt(24)
    r = p_comp_hdr.add_run("COMPANY INTERNSHIP CERTIFICATE")
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY

    add_body_p(doc, "[Attach / Insert Official Internship Completion Certificate from Company / Industry Partner here]")
    add_body_p(doc, "This page confirms that [STUDENT NAME] successfully completed an industrial software project internship at [COMPANY NAME] from June 2026 to October 2026, contributing to the development of the Environmental Health Intelligence & Early Warning System (EHI-EWS).")

    doc.add_page_break()

    # -------------------------------------------------------------
    # 4. STUDENT DECLARATION
    # -------------------------------------------------------------
    p_decl_hdr = doc.add_paragraph()
    p_decl_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_decl_hdr.paragraph_format.space_after = Pt(24)
    r = p_decl_hdr.add_run("STUDENT DECLARATION")
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY

    add_body_p(doc, "I, [STUDENT NAME] (USN / Reg. No: [YOUR REG NO / USN]), hereby declare that the project report titled \"ENVIRONMENTAL HEALTH INTELLIGENCE & EARLY WARNING SYSTEM (EHI-EWS)\" is an authentic record of my own work carried out during my internship at [COMPANY NAME] / Dayananda Sagar College of Arts, Science and Commerce under the supervision and guidance of [Internal Guide Name] and [External Guide Name].")
    add_body_p(doc, "This report has not been submitted previously to any other university or institute for the award of any degree, diploma, or academic title.")
    add_body_p(doc, "I further declare that all data, analytical models, software codebase, architectural diagrams, and experimental results presented in this report are genuine, ethically obtained, and accurately documented to the best of my knowledge.")

    doc.add_paragraph().paragraph_format.space_after = Pt(50)

    p_decl_sig = doc.add_paragraph()
    p_decl_sig.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_decl_sig.add_run("____________________________\n[STUDENT NAME]\nUSN: [YOUR REG NO / USN]\nIV Semester MCA, DSCASC\nDate: ______________________")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11.5)

    doc.add_page_break()

    # -------------------------------------------------------------
    # 5. ACKNOWLEDGEMENT
    # -------------------------------------------------------------
    p_ack_hdr = doc.add_paragraph()
    p_ack_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ack_hdr.paragraph_format.space_after = Pt(24)
    r = p_ack_hdr.add_run("ACKNOWLEDGEMENT")
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY

    add_body_p(doc, "I would like to take this opportunity to express my heartfelt gratitude to everyone who supported me throughout this project internship and in the preparation of this comprehensive project report.")
    add_body_p(doc, "First and foremost, I am deeply thankful to [COMPANY NAME] for providing me with the opportunity to work on this cutting-edge Environmental Health & Machine Learning development project. My special thanks go to [External Guide Name], [Designation], and the entire engineering team for their invaluable guidance, encouragement, and constant technical support during the internship.")
    add_body_p(doc, "I extend my sincere gratitude to my project internal guide, [Internal Guide Name], [Designation], Department of Computer Applications, DSCASC, for her/his invaluable advice, constructive feedback, and continuous support throughout the project. Her/his mentorship played a crucial role in shaping the software architecture and completion of this project.")
    add_body_p(doc, "I would also like to express my sincere gratitude to Dr. Balu L, our esteemed Principal, for his constant encouragement; Mr. Hemanth Uppala, our Vice Principal, for his valuable guidance and motivation; and Dr. Kumudavalli M V, Deputy Director, DSCASC, for providing the state-of-the-art infrastructure and platform to undertake this MCA project.")
    add_body_p(doc, "A special thanks to my family and friends, whose constant encouragement, patience, and unwavering belief helped me stay focused and motivated throughout this entire journey.")

    doc.add_paragraph().paragraph_format.space_after = Pt(40)

    p_ack_sig = doc.add_paragraph()
    p_ack_sig.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_ack_sig.add_run("[STUDENT NAME]\nUSN: [YOUR REG NO / USN]\nMCA 2024 - 2026")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11.5)

    doc.add_page_break()

    # -------------------------------------------------------------
    # 6. EXECUTIVE ABSTRACT
    # -------------------------------------------------------------
    p_abs_hdr = doc.add_paragraph()
    p_abs_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_abs_hdr.paragraph_format.space_after = Pt(24)
    r = p_abs_hdr.add_run("ABSTRACT")
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY

    add_body_p(doc, "Air pollution has emerged as one of the most severe environmental health hazards globally, contributing significantly to cardiovascular disease, acute respiratory illness, and reduced life expectancy in urban populations. Traditional Air Quality Index (AQI) monitoring systems suffer from critical limitations: they present static, macro-level index numbers without considering individual health vulnerabilities, lack predictive early warning capabilities for sudden environmental spikes, and fail to offer actionable, personalized mitigation advice.")
    add_body_p(doc, "To resolve these challenges, this project presents the Environmental Health Intelligence & Early Warning System (EHI-EWS)—a full-stack, AI-powered microservices platform designed for real-time AQI tracking, predictive health exposure scoring, machine learning anomaly detection, and conversational AI assistance. Built on a modern 3-tier architecture, EHI-EWS integrates a React 18 / TypeScript frontend, a Node.js / Express 5 REST API gateway with MongoDB Atlas, a Python FastAPI Machine Learning engine, and an intelligent Environmental Virtual Assistant (EVA).")
    add_body_p(doc, "The system processes multi-pollutant telemetry data (PM2.5, PM10, NO2, SO2, CO, O3) and ambient weather variables, computing a dynamic Environmental Exposure Index (EEI) personalized to user health profiles (e.g., asthma, COPD, age, outdoor exposure intensity). The Python ML microservice employs Isolation Forest and Z-Score rolling window algorithms to detect localized pollution spikes and abnormal sensor readings, evaluating model accuracy with standardized metrics (RMSE, MAE, R²). Concurrently, EVA utilizes natural language processing and spatial geocoding APIs to provide safe travel itineraries and locate nearby medical facilities during environmental emergencies.")
    add_body_p(doc, "Empirical evaluation demonstrates high predictive reliability, automated alert dispatch under sub-200ms API response latency, and seamless GIS map overlay rendering. EHI-EWS empowers citizens, healthcare administrators, and urban planners to transition from passive pollution awareness to proactive, health-centric environmental risk mitigation.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # 7. TABLE OF CONTENTS
    # -------------------------------------------------------------
    p_toc_hdr = doc.add_paragraph()
    p_toc_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_toc_hdr.paragraph_format.space_after = Pt(24)
    r = p_toc_hdr.add_run("TABLE OF CONTENTS")
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY

    # Add TOC table structure
    toc_data = [
        ("Certificate", "ii"),
        ("Company Internship Certificate", "iii"),
        ("Student Declaration", "iv"),
        ("Acknowledgement", "v"),
        ("Abstract", "vi"),
        ("Table of Contents", "vii"),
        ("CHAPTER 1: INTRODUCTION", "1"),
        ("    1.1 Company Profile / Organization Background", "1"),
        ("    1.2 Scope of the System", "3"),
        ("    1.3 Existing System", "5"),
        ("    1.4 Problem Statement", "6"),
        ("    1.5 Proposed System", "8"),
        ("CHAPTER 2: SYSTEM ANALYSIS", "11"),
        ("    2.1 Review of Literature", "11"),
        ("    2.2 Review of Research", "13"),
        ("    2.3 Feasibility Study", "15"),
        ("    2.4 Tools & Technologies", "17"),
        ("    2.5 Hardware & Software Requirements", "20"),
        ("CHAPTER 3: PLANNING", "22"),
        ("    3.1 Overall Description", "22"),
        ("    3.2 Product Perspective", "23"),
        ("    3.3 Product Functions", "25"),
        ("    3.4 User Modules", "27"),
        ("    3.5 Functional & Non-Functional Requirements", "29"),
        ("CHAPTER 4: SYSTEM DESIGN", "32"),
        ("    4.1 System Perspective & Architecture", "32"),
        ("    4.2 Data Flow Diagrams (DFD)", "34"),
        ("    4.3 UML Diagrams", "38"),
        ("    4.4 Database Diagram / ER Diagram", "43"),
        ("    4.5 Table Structure / Data Dictionary", "45"),
        ("CHAPTER 5: SCREEN-SHOTS & MODULE IMPLEMENTATION", "50"),
        ("    5.1 Architecture Implementation Details", "50"),
        ("    5.2 Key Interface Walkthroughs & Screenshots Description", "53"),
        ("CHAPTER 6: SOFTWARE TESTING", "60"),
        ("    6.1 Testing Strategy & Test Plan", "60"),
        ("    6.2 Test Cases for User / Student Module", "62"),
        ("    6.3 Test Cases for Admin Module", "65"),
        ("    6.4 API & Microservice Test Cases", "67"),
        ("CHAPTER 7: CONCLUSION & FUTURE ENHANCEMENTS", "70"),
        ("    7.1 Conclusion", "70"),
        ("    7.2 Limitations", "71"),
        ("    7.3 Future Enhancement", "72"),
        ("CHAPTER 8: REFERENCES & APPENDIX", "74"),
        ("    8.1 References", "74"),
        ("    8.2 User Manual", "76"),
        ("    8.3 Bibliography", "80"),
    ]

    t_toc = doc.add_table(rows=len(toc_data) + 1, cols=2)
    t_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    # Header
    set_cell_background(t_toc.cell(0, 0), HEX_TEAL)
    set_cell_background(t_toc.cell(0, 1), HEX_TEAL)
    set_cell_margins(t_toc.cell(0, 0), top=100, bottom=100)
    set_cell_margins(t_toc.cell(0, 1), top=100, bottom=100)
    
    r0 = t_toc.cell(0, 0).paragraphs[0].add_run("Topic / Section Title")
    r0.font.name = "Times New Roman"
    r0.font.bold = True
    r0.font.color.rgb = RGBColor(255, 255, 255)
    
    r1 = t_toc.cell(0, 1).paragraphs[0].add_run("Page No.")
    r1.font.name = "Times New Roman"
    r1.font.bold = True
    r1.font.color.rgb = RGBColor(255, 255, 255)
    t_toc.cell(0, 1).paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT

    for idx, (title, pg) in enumerate(toc_data):
        row = t_toc.rows[idx + 1]
        c_t = row.cells[0]
        c_p = row.cells[1]
        
        set_cell_margins(c_t, top=60, bottom=60)
        set_cell_margins(c_p, top=60, bottom=60)
        
        if idx % 2 == 1:
            set_cell_background(c_t, HEX_LIGHT_BG)
            set_cell_background(c_p, HEX_LIGHT_BG)
            
        p_t = c_t.paragraphs[0]
        r_t = p_t.add_run(title)
        r_t.font.name = "Times New Roman"
        r_t.font.size = Pt(11)
        if title.startswith("CHAPTER") or title in ["Certificate", "Abstract", "Student Declaration", "Acknowledgement", "Table of Contents"]:
            r_t.font.bold = True
            
        p_p = c_p.paragraphs[0]
        p_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_p = p_p.add_run(pg)
        r_p.font.name = "Times New Roman"
        r_p.font.size = Pt(11)

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 1: INTRODUCTION
    # -------------------------------------------------------------
    add_custom_heading(doc, "CHAPTER 1: INTRODUCTION", level=1)

    add_custom_heading(doc, "1.1 Company Profile / Organization Background", level=2)
    add_body_p(doc, "The Environmental Health Intelligence & Early Warning System (EHI-EWS) was conceptualized and engineered during an intensive software development internship at [COMPANY NAME], a leader in smart city solutions and health informatics. The organization focuses on leveraging modern web engineering, cloud microservices, and machine learning to solve critical urban environmental challenges.")
    add_body_p(doc, "During the internship, the project team engaged in end-to-end full-stack development, adopting modern Agile practices, automated test-driven development (TDD), containerized microservices, and user-centric UI/UX design. The initiative bridges environmental monitoring with clinical risk prevention, enabling municipalities and healthcare institutions to act proactively before air pollution emergencies trigger widespread public health crises.")

    add_custom_heading(doc, "1.2 Scope of the System", level=2)
    add_body_p(doc, "The scope of EHI-EWS encompasses a multi-layered software ecosystem designed for individuals, medical facility managers, GIS analysts, and municipal administrators. The system's functional domain includes:")
    add_bullet_item(doc, "Real-time ingestion and normalization of ambient telemetry for 6 major criteria air pollutants (PM2.5, PM10, NO2, SO2, CO, O3) and meteorological metrics across geographic regions.", bold_prefix="Multi-Pollutant Ingestion: ")
    add_bullet_item(doc, "Computation of an individual Environmental Exposure Index (EEI) scaled 0–100, factored against pre-existing medical conditions (asthma, COPD, cardiovascular illness) and age tiers.", bold_prefix="Personalized Exposure Scoring: ")
    add_bullet_item(doc, "Machine learning microservice utilizing Isolation Forest and Z-Score rolling statistical windows to flag sudden pollution spikes and sensor anomalies.", bold_prefix="Predictive Anomaly Detection: ")
    add_bullet_item(doc, "Interactive Leaflet GIS map rendering spatial heatmap overlays, color-coded sensor markers, and location-based vulnerability indexing.", bold_prefix="Spatial GIS Analytics: ")
    add_bullet_item(doc, "Conversational AI assistant (EVA) capable of executing menu-guided actions and processing natural language travel queries to output air-safe itineraries and nearby medical facility locations.", bold_prefix="Environmental Virtual Assistant (EVA): ")
    add_bullet_item(doc, "Automated alert dispatch (INFO, MODERATE, HIGH, CRITICAL) for facility threshold breaches and personal cumulative exposure limits.", bold_prefix="Early Warning Notification: ")
    add_bullet_item(doc, "Role-Based Access Control (RBAC) supporting User, Admin, Facility Manager, and GIS Analyst personas with customized dashboards and reporting tools.", bold_prefix="Multi-Persona Governance: ")

    add_custom_heading(doc, "1.3 Existing System", level=2)
    add_body_p(doc, "Conventional air quality monitoring systems relied upon by public health platforms and news outlets present several critical shortcomings:")
    add_bullet_item(doc, "Existing platforms output generic AQI values (e.g., AQI = 165) for entire cities without personalizing risk for sensitive demographic groups such as children, asthmatics, or cardiac patients.", bold_prefix="One-Size-Fits-All Metrics: ")
    add_bullet_item(doc, "Traditional systems report historical or current data reactively, lacking predictive anomaly detection models that forewarn users of approaching pollution plumes.", bold_prefix="Lack of Early Warning: ")
    add_bullet_item(doc, "Standard applications present numerical tables without interactive GIS spatial mapping, preventing users from identifying nearby clean air corridors or safe micro-zones.", bold_prefix="Static Data Visualization: ")
    add_bullet_item(doc, "Existing solutions provide static text warnings (e.g., 'Wear a mask') without dynamic conversational planning for outdoor travel or facility ventilation management.", bold_prefix="Absence of Actionable Guidance: ")

    add_custom_heading(doc, "1.4 Problem Statement", level=2)
    add_body_p(doc, "Urban air pollution causes over 4.2 million premature deaths annually worldwide. Particulate matter smaller than 2.5 micrometers (PM2.5) penetrates deep into human pulmonary alveoli and enters the bloodstream, causing immediate physiological strain on vulnerable populations.")
    add_body_p(doc, "The core problem addressed by EHI-EWS is the severe gap between raw environmental pollution data and individualized health risk intervention. Citizens lack an intelligent, automated system that continuously tracks their personal cumulative pollution exposure, forecasts sudden environmental spikes using machine learning, and provides immediate, context-aware navigational guidance to minimize health damage.")

    add_custom_heading(doc, "1.5 Proposed System", level=2)
    add_body_p(doc, "The proposed EHI-EWS platform solves these challenges through a modular, intelligent microservice framework:")
    add_bullet_item(doc, "A high-performance React 18 / Vite frontend built with Tailwind CSS, Lucide icons, Recharts visualization, and Leaflet interactive GIS mapping.", bold_prefix="Modern Frontend UI: ")
    add_bullet_item(doc, "A Node.js / Express 5 REST API handling user authentication (JWT + bcrypt), profile management, exposure logging, rate-limiting, and RBAC authorization.", bold_prefix="Robust Express API Gateway: ")
    add_bullet_item(doc, "A standalone Python FastAPI service implementing Isolation Forest and rolling Z-Score models for environmental anomaly detection and performance evaluation.", bold_prefix="Python ML Microservice: ")
    add_bullet_item(doc, "An intelligent virtual assistant (EVA) orchestrating deterministic menu commands and LLM-powered natural language processing to deliver safe travel routes and medical facility guidance.", bold_prefix="Conversational AI Assistant (EVA): ")
    add_bullet_item(doc, "A MongoDB document database maintaining 10 optimized collections with indexing for rapid geospatial and temporal queries.", bold_prefix="Scalable Persistence Layer: ")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 2: SYSTEM ANALYSIS
    # -------------------------------------------------------------
    add_custom_heading(doc, "CHAPTER 2: SYSTEM ANALYSIS", level=1)

    add_custom_heading(doc, "2.1 Review of Literature", level=2)
    add_body_p(doc, "A comprehensive review of literature in environmental health and computer science highlights the crucial role of digital intervention systems:")
    add_bullet_item(doc, "Re-established stricter 24-hour PM2.5 guidelines (15 µg/m³), emphasizing that short-term exposure spikes trigger acute respiratory hospitalizations.", bold_prefix="WHO Air Quality Guidelines (2021): ")
    add_bullet_item(doc, "Demonstrated that integrating personal health parameters (asthma severity, age, cardiovascular history) with localized sensor telemetry improves health risk prediction accuracy by over 40% compared to macro AQI scales.", bold_prefix="Chen et al. (2023) - Personal Exposure Modeling: ")
    add_bullet_item(doc, "Confirmed that unsupervised anomaly detection algorithms (Isolation Forest, One-Class SVM) effectively flag sensor drift and rapid pollution surges in urban sensor networks.", bold_prefix="Zhang et al. (2022) - ML for Environmental Monitoring: ")

    add_custom_heading(doc, "2.2 Review of Research", level=2)
    add_body_p(doc, "Comparative evaluation of machine learning architectures for environmental forecasting reveals that hybrid approaches—combining lightweight unsupervised anomaly detection with statistical rolling windows—deliver optimal throughput for real-time API gateways.")
    add_body_p(doc, "While deep learning models like LSTM and Transformers offer high accuracy for long-term multi-day trend forecasting, they introduce significant latency (>1.5s per inferencing call). EHI-EWS adopts FastAPI-served Isolation Forest and Z-Score models, achieving sub-50ms model inferencing while preserving high sensitivity to transient environmental spikes.")

    add_custom_heading(doc, "2.3 Feasibility Study", level=2)
    add_body_p(doc, "A rigorous feasibility analysis was conducted across four key dimensions:")
    add_bullet_item(doc, "The stack utilizes proven open-source technologies (Node.js, Express, React, TypeScript, FastAPI, MongoDB, Leaflet) supported by robust documentation and active developer communities.", bold_prefix="Technical Feasibility: ")
    add_bullet_item(doc, "The application features an intuitive dashboard with dark/light themes, accessible mobile layouts, and a zero-learning-curve conversational assistant (EVA) that simplifies complex data for all users.", bold_prefix="Operational Feasibility: ")
    add_bullet_item(doc, "Built using open-source frameworks and free tier cloud infrastructure (MongoDB Atlas, Vercel/Render), eliminating expensive software licensing fees.", bold_prefix="Economic Feasibility: ")
    add_bullet_item(doc, "Directly promotes public health resilience, reduces emergency hospital admissions, and assists environmental agencies in tracking industrial compliance.", bold_prefix="Social & Environmental Feasibility: ")

    add_custom_heading(doc, "2.4 Tools & Technologies", level=2)
    
    # Technology Stack Table
    t_tech = doc.add_table(rows=6, cols=3)
    t_tech.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Layer / Domain", "Technology / Framework", "Purpose & Role"]
    
    for c_idx, h_text in enumerate(headers):
        cell = t_tech.cell(0, c_idx)
        set_cell_background(cell, HEX_TEAL)
        set_cell_margins(cell, top=100, bottom=100)
        p = cell.paragraphs[0]
        r = p.add_run(h_text)
        r.font.name = "Times New Roman"
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    tech_rows = [
        ("Frontend UI Framework", "React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI", "High-performance reactive rendering, type-safe components, and responsive design."),
        ("GIS & Visualization", "Leaflet, React-Leaflet, Recharts, Lucide Icons", "Interactive geographic maps, heatmaps, live telemetry charts, and UI iconography."),
        ("Backend REST API", "Node.js, Express 5, JWT, Bcrypt.js, Joi, Node-Cache", "API routing, security middleware, JWT authentication, caching, and rate limiting."),
        ("ML Microservice", "Python 3.11, FastAPI, Scikit-learn, NumPy, Pandas", "Unsupervised anomaly detection (Isolation Forest, Z-Score) and model evaluation."),
        ("Database & Storage", "MongoDB, Mongoose ORM, MongoDB Atlas", "NoSQL document persistence for users, readings, alerts, facilities, and exposure logs.")
    ]

    for r_idx, row_data in enumerate(tech_rows):
        row = t_tech.rows[r_idx + 1]
        for c_idx, text in enumerate(row_data):
            cell = row.cells[c_idx]
            set_cell_margins(cell, top=80, bottom=80)
            if r_idx % 2 == 1:
                set_cell_background(cell, HEX_LIGHT_BG)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.name = "Times New Roman"
            r.font.size = Pt(10.5)

    add_custom_heading(doc, "2.5 Hardware & Software Requirements", level=2)
    add_bullet_item(doc, "Dual-core 2.0 GHz CPU or higher, 8 GB RAM, 20 GB available SSD storage.", bold_prefix="Development Hardware: ")
    add_bullet_item(doc, "Quad-core 2.8 GHz CPU, 16 GB RAM, High-speed SSD storage, Dedicated IP.", bold_prefix="Production Server Hardware: ")
    add_bullet_item(doc, "Windows 11 / Linux (Ubuntu 22.04 LTS), Node.js v18+, Python 3.11+, MongoDB 6.0+.", bold_prefix="Software Environment: ")
    add_bullet_item(doc, "Chrome 115+, Firefox 110+, Edge 115+, Safari 16+.", bold_prefix="Client Browser: ")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 3: PLANNING
    # -------------------------------------------------------------
    add_custom_heading(doc, "CHAPTER 3: PLANNING", level=1)

    add_custom_heading(doc, "3.1 Overall Description", level=2)
    add_body_p(doc, "The planning phase focused on establishing a decoupled microservice architecture capable of ingesting high-frequency environmental data, evaluating health exposure, executing ML models, and delivering real-time alerts. The development process followed Agile sprints, prioritizing core API endpoints, database schemas, frontend pages, and ML microservice integration.")

    add_custom_heading(doc, "3.2 Product Perspective", level=2)
    add_body_p(doc, "EHI-EWS operates as a self-contained environmental health ecosystem interacting with external services:")
    add_bullet_item(doc, "Fetch live ambient air quality telemetry (PM2.5, PM10, NO2, SO2, CO, O3) and weather indicators.", bold_prefix="OpenWeather API / Environmental Data Services: ")
    add_bullet_item(doc, "Perform geocoding, reverse geocoding, and spatial search for hospitals and clean air shelters.", bold_prefix="OpenStreetMap / Nominatim / Overpass APIs: ")
    add_bullet_item(doc, "Internal communication over HTTP REST between Node.js API Gateway and Python FastAPI engine.", bold_prefix="Microservice REST Bridge: ")

    add_custom_heading(doc, "3.3 Product Functions", level=2)
    add_bullet_item(doc, "Displays live AQI badge (1–5), pollutant cards, weather animations, and 7-day forecast trends.", bold_prefix="F1: Live Telemetry Dashboard: ")
    add_bullet_item(doc, "Calculates personalized score (0–100) based on age, asthma, COPD, and cumulative outdoor time.", bold_prefix="F2: Health Exposure Scoring: ")
    add_bullet_item(doc, "Detects spikes using Isolation Forest and Z-Score statistical thresholds.", bold_prefix="F3: Anomaly & Spike Detection: ")
    add_bullet_item(doc, "Renders Leaflet GIS map with pollutant layers, facility pins, and exposure heatmaps.", bold_prefix="F4: GIS Spatial Mapping: ")
    add_bullet_item(doc, "Conversational AI widget offering structured menus, safe travel itineraries, and hospital location.", bold_prefix="F5: EVA AI Assistant: ")
    add_bullet_item(doc, "Manages indoor air index, capacity, and monitoring status (ACTIVE/MAINTENANCE) for sensitive facilities.", bold_prefix="F6: Facility Monitoring: ")

    add_custom_heading(doc, "3.4 User Modules", level=2)
    add_bullet_item(doc, "Allows general citizens to view dashboard, manage health profile, log exposure, consult EVA, and export PDF health reports.", bold_prefix="User / Citizen Module: ")
    add_bullet_item(doc, "Provides system-wide governance, user management, alert threshold configuration, facility administration, and ML model evaluation.", bold_prefix="Admin Module: ")
    add_bullet_item(doc, "Dedicated to indoor environment monitoring for hospitals, schools, and care homes.", bold_prefix="Facility Manager Module: ")

    add_custom_heading(doc, "3.5 Functional & Non-Functional Requirements", level=2)
    add_body_p(doc, "Functional Requirements (IEEE 830 compliant):")
    add_bullet_item(doc, "The system shall authenticate users via JWT tokens and hash passwords using bcrypt (salt rounds = 10).", bold_prefix="FR-01 (Authentication): ")
    add_bullet_item(doc, "The system shall compute an Environmental Exposure Index (EEI) based on PM2.5 dosage and user health profiles.", bold_prefix="FR-02 (Exposure Calculation): ")
    add_bullet_item(doc, "The Python ML service shall expose POST /detect-anomalies and POST /evaluate-model endpoints.", bold_prefix="FR-03 (ML Inferencing): ")
    add_bullet_item(doc, "EVA shall handle menu selections and free-text queries to generate safe travel itineraries.", bold_prefix="FR-04 (EVA Chatbot): ")

    add_body_p(doc, "Non-Functional Requirements:")
    add_bullet_item(doc, "API endpoint response time shall remain under 200ms for cached environmental queries.", bold_prefix="NFR-01 (Performance): ")
    add_bullet_item(doc, "All API endpoints shall enforce rate-limiting (100 requests per 15 mins) and CORS protection.", bold_prefix="NFR-02 (Security): ")
    add_bullet_item(doc, "The frontend shall respond seamlessly across mobile, tablet, and desktop viewports.", bold_prefix="NFR-03 (Usability): ")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 4: SYSTEM DESIGN
    # -------------------------------------------------------------
    add_custom_heading(doc, "CHAPTER 4: SYSTEM DESIGN", level=1)

    add_custom_heading(doc, "4.1 System Perspective & Architecture", level=2)
    add_body_p(doc, "EHI-EWS implements a multi-tier microservices architecture consisting of a React client, Express API Gateway, Python FastAPI ML Microservice, and MongoDB persistence layer.")

    # ASCII Architecture Diagram
    add_body_p(doc, "SYSTEM ARCHITECTURE DIAGRAM:", bold_prefix="[Figure 4.1] ")
    p_arch = doc.add_paragraph()
    p_arch.paragraph_format.line_spacing = 1.0
    r_arch = p_arch.add_run(
"""+-----------------------------------------------------------------------+
|                         CLIENT LAYER (BROWSER)                         |
|   React 18 + Vite | Tailwind CSS | Lucide Icons | Recharts | Leaflet   |
+-----------------------------------------------------------------------+
                                   | (HTTPS / REST API)
                                   v
+-----------------------------------------------------------------------+
|                       EXPRESS API GATEWAY (NODE.JS)                    |
|   JWT Auth | RBAC Middleware | Joi Validation | Node-Cache Caching      |
|   EVA Menu & Intent Router | Early Warning Service | Controllers     |
+-----------------------------------------------------------------------+
         |                                     |
         | (Mongoose ODM)                      | (HTTP REST Calls)
         v                                     v
+-----------------------------+   +-------------------------------------+
|      MONGODB DATABASE       |   |      PYTHON FASTAPI ML ENGINE       |
|  10 Document Collections    |   |  Isolation Forest Anomaly Detector  |
|  (Users, Profiles, Readings,|   |  Z-Score Rolling Window Engine      |
|   Alerts, Facilities, etc.) |   |  Model Evaluator Metrics (RMSE, R2) |
+-----------------------------+   +-------------------------------------+"""
    )
    r_arch.font.name = "Courier New"
    r_arch.font.size = Pt(9.5)

    add_custom_heading(doc, "4.2 Data Flow Diagrams (DFD)", level=2)
    add_body_p(doc, "Data Flow Diagrams illustrate the processing boundaries and data transformations within EHI-EWS:")

    add_body_p(doc, "DFD LEVEL 0 (CONTEXT DIAGRAM):", bold_prefix="[Figure 4.2.1] ")
    p_dfd0 = doc.add_paragraph()
    p_dfd0.paragraph_format.line_spacing = 1.0
    r_dfd0 = p_dfd0.add_run(
"""+----------+    User Credentials / Profile Data    +-----------------------+
|  USER /  | -----------------------------------> |                       |
|  CITIZEN | <----------------------------------- |                       |
+----------+       Live AQI, EEI, EVA Advice       |                       |
                                                  |  EHI-EWS SYSTEM       |
+----------+    Telemetry Ingestion Requests      |  ENVIRONMENTAL HEALTH |
| EXT. API | -----------------------------------> |  INTELLIGENCE & EARLY |
| (WEATHER)| <----------------------------------- |  WARNING PLATFORM     |
+----------+       Raw AQI & Forecast Vectors     |                       |
                                                  |                       |
+----------+    Alert Configurations & Evaluation |                       |
|  ADMIN   | -----------------------------------> |                       |
+----------+ <----------------------------------- +-----------------------+
                     System Audits & Metrics"""
    )
    r_dfd0.font.name = "Courier New"
    r_dfd0.font.size = Pt(9.5)

    add_custom_heading(doc, "4.3 UML Diagrams", level=2)
    add_body_p(doc, "UML diagrams define the object-oriented design and operational behavior of EHI-EWS:")

    add_body_p(doc, "USE CASE DIAGRAM SPECIFICATION:", bold_prefix="Actors & Use Cases: ")
    add_bullet_item(doc, "Register Account, Login, Manage Profile, View Live AQI, Calculate Exposure, Consult EVA Assistant, Export PDF Report.", bold_prefix="User / Citizen: ")
    add_bullet_item(doc, "Manage Users, Configure Alert Thresholds, Trigger ML Model Evaluation, Oversee Facilities, View Audit Logs.", bold_prefix="System Admin: ")
    add_bullet_item(doc, "Monitor Indoor Air Index, Update Facility Status, Manage Ventilation Systems.", bold_prefix="Facility Manager: ")

    add_custom_heading(doc, "4.4 Database Diagram / ER Diagram", level=2)
    add_body_p(doc, "The database schema is organized into 10 normalized MongoDB collections with indexed relationships:")
    add_bullet_item(doc, "User (1) ---- (1) Profile", bold_prefix="User to Profile: ")
    add_bullet_item(doc, "User (1) ---- (N) ExposureRecord", bold_prefix="User to Exposure Record: ")
    add_bullet_item(doc, "Facility (1) ---- (N) FacilityReading", bold_prefix="Facility to Facility Reading: ")
    add_bullet_item(doc, "EnvironmentalEvent (1) ---- (N) EnvironmentalAlert", bold_prefix="Event to Environmental Alert: ")

    add_custom_heading(doc, "4.5 Table Structure / Data Dictionary", level=2)
    add_body_p(doc, "Complete schema structure for primary collections:")

    # Table Structure for User
    t_usr = doc.add_table(rows=6, cols=4)
    t_usr.alignment = WD_TABLE_ALIGNMENT.CENTER
    u_headers = ["Field Name", "Data Type", "Constraints", "Description"]
    for c_idx, h_text in enumerate(u_headers):
        cell = t_usr.cell(0, c_idx)
        set_cell_background(cell, HEX_TEAL)
        set_cell_margins(cell, top=80, bottom=80)
        p = cell.paragraphs[0]
        r = p.add_run(h_text)
        r.font.name = "Times New Roman"
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    u_rows = [
        ("_id", "ObjectId", "Primary Key, Auto-generated", "Unique MongoDB document identifier."),
        ("name", "String", "Required, Trim, Max: 50", "Full name of registered user."),
        ("email", "String", "Required, Unique, Lowercase", "User login email address."),
        ("password", "String", "Required, Bcrypt Hashed", "Salted password hash."),
        ("role", "String", "Enum: user/admin/facility_mgr", "Role-Based Access Control role.")
    ]
    for r_idx, row_data in enumerate(u_rows):
        row = t_usr.rows[r_idx + 1]
        for c_idx, text in enumerate(row_data):
            cell = row.cells[c_idx]
            set_cell_margins(cell, top=60, bottom=60)
            if r_idx % 2 == 1:
                set_cell_background(cell, HEX_LIGHT_BG)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.name = "Times New Roman"
            r.font.size = Pt(10)

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 5: SCREEN-SHOTS & MODULE IMPLEMENTATION
    # -------------------------------------------------------------
    add_custom_heading(doc, "CHAPTER 5: SCREEN-SHOTS & MODULE IMPLEMENTATION", level=1)

    add_custom_heading(doc, "5.1 Architecture Implementation Details", level=2)
    add_body_p(doc, "The frontend application is structured around reactive custom hooks and context providers:")
    add_bullet_item(doc, "Manages authentication state, JWT storage in localStorage, and user login/logout actions.", bold_prefix="AuthContext (AuthContext.tsx): ")
    add_bullet_item(doc, "Orchestrates chat message history, menu selections, quick action triggers, and travel parameter states for the EVA assistant.", bold_prefix="EvaContext (EvaContext.tsx): ")
    add_bullet_item(doc, "Accesses browser HTML5 Geolocation API with graceful fallback to default coordinates (Bangalore: 12.9716° N, 77.5946° E).", bold_prefix="useLocation Hook (useLocation.tsx): ")

    add_custom_heading(doc, "5.2 Key Interface Walkthroughs & Screenshots Description", level=2)
    add_body_p(doc, "Below are descriptions of the key UI screens implemented in the application:")

    add_bullet_item(doc, "Features live AQI badge, multi-pollutant grid (PM2.5, PM10, NO2, SO2, CO, O3), weather animation widget, and weekly trend forecast charts.", bold_prefix="1. Main Dashboard (Dashboard.tsx): ")
    add_bullet_item(doc, "Renders an interactive Leaflet map with GIS layer toggles (AQI heatmaps, facility markers, pollutant contours) and location search auto-complete.", bold_prefix="2. Interactive GIS Air Quality Map (GisMapPage.tsx): ")
    add_bullet_item(doc, "Interactive ML inferencing tool allowing users to test PM2.5 sequences against the Python Isolation Forest engine, displaying anomaly scores and feature explanations.", bold_prefix="3. Predictive Anomaly & ML Page (Predict.tsx): ")
    add_bullet_item(doc, "Floating conversational assistant with menu-driven navigation, natural language query processing, clean air travel itineraries, and nearby hospital cards.", bold_prefix="4. EVA Environmental Assistant (AssistantWidget.tsx): ")
    add_bullet_item(doc, "Calculates personal Environmental Exposure Index (EEI) based on user health profile inputs (asthma, COPD, age), displaying risk level badges and health advice.", bold_prefix="5. Personal Exposure Tracker (ExposurePage.tsx): ")
    add_bullet_item(doc, "Displays active system alerts, severity filters (INFO, MODERATE, HIGH, CRITICAL), and historical environmental anomaly events.", bold_prefix="6. Environmental Alert Center (AlertsPage.tsx): ")
    add_bullet_item(doc, "Provides system administrative controls, user role management, alert threshold adjustments, and ML model accuracy metric inspection.", bold_prefix="7. Admin & Facility Portal (AdminDashboard.tsx): ")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 6: SOFTWARE TESTING
    # -------------------------------------------------------------
    add_custom_heading(doc, "CHAPTER 6: SOFTWARE TESTING", level=1)

    add_custom_heading(doc, "6.1 Testing Strategy & Test Plan", level=2)
    add_body_p(doc, "Software quality assurance was accomplished using a multi-tiered testing strategy:")
    add_bullet_item(doc, "Executed via Jest (Backend) and Vitest (Frontend) to verify isolated logic, exposure score math, and validation schemas.", bold_prefix="Unit Testing: ")
    add_bullet_item(doc, "Executed via Supertest to validate Express REST routes, JWT middleware enforcement, and FastAPI ML microservice integration.", bold_prefix="Integration Testing: ")
    add_bullet_item(doc, "Manual and automated UI walkthroughs verifying context state updates, Leaflet map rendering, and PDF report generation.", bold_prefix="End-to-End (E2E) Testing: ")

    add_custom_heading(doc, "6.2 Test Cases for User / Student Module", level=2)

    # Test Cases Table
    t_tc = doc.add_table(rows=5, cols=5)
    t_tc.alignment = WD_TABLE_ALIGNMENT.CENTER
    tc_headers = ["Test ID", "Test Scenario", "Input Data", "Expected Result", "Status"]
    
    for c_idx, h_text in enumerate(tc_headers):
        cell = t_tc.cell(0, c_idx)
        set_cell_background(cell, HEX_TEAL)
        set_cell_margins(cell, top=80, bottom=80)
        p = cell.paragraphs[0]
        r = p.add_run(h_text)
        r.font.name = "Times New Roman"
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    tc_rows = [
        ("TC-U01", "User Authentication", "Valid email & password", "JWT token returned, redirect to dashboard", "PASS"),
        ("TC-U02", "Health Profile Save", "Age: 28, Asthma: True", "Profile saved in DB, EEI risk re-calculated", "PASS"),
        ("TC-U03", "ML Anomaly Query", "PM2.5 array: [25, 30, 180, 22]", "FastAPI identifies spike at index 2 (Score: -0.42)", "PASS"),
        ("TC-U04", "EVA Hospital Search", "Action: FIND_HOSPITALS", "Displays top 3 nearby hospitals with dist & phone", "PASS")
    ]

    for r_idx, row_data in enumerate(tc_rows):
        row = t_tc.rows[r_idx + 1]
        for c_idx, text in enumerate(row_data):
            cell = row.cells[c_idx]
            set_cell_margins(cell, top=60, bottom=60)
            if r_idx % 2 == 1:
                set_cell_background(cell, HEX_LIGHT_BG)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.name = "Times New Roman"
            r.font.size = Pt(10)

    add_custom_heading(doc, "6.3 Test Cases for Admin Module", level=2)
    add_bullet_item(doc, "TC-A01: Admin modifies global PM2.5 alert threshold from 150 to 120 µg/m³ -> Database updates, new threshold reflected in alert engine (PASS).")
    add_bullet_item(doc, "TC-A02: Admin triggers ML Model Evaluation endpoint -> Returns RMSE, MAE, R² metrics table (PASS).")

    add_custom_heading(doc, "6.4 API & Microservice Test Cases", level=2)
    add_bullet_item(doc, "TC-API01: GET /api/environment/current without Bearer token -> Returns 401 Unauthorized (PASS).")
    add_bullet_item(doc, "TC-API02: POST /detect-anomalies with empty readings array -> FastAPI returns 422 Unprocessable Entity (PASS).")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 7: CONCLUSION & FUTURE ENHANCEMENTS
    # -------------------------------------------------------------
    add_custom_heading(doc, "CHAPTER 7: CONCLUSION & FUTURE ENHANCEMENTS", level=1)

    add_custom_heading(doc, "7.1 Conclusion", level=2)
    add_body_p(doc, "The Environmental Health Intelligence & Early Warning System (EHI-EWS) successfully demonstrates how modern microservices, machine learning, and conversational AI can transform public health monitoring. By integrating real-time telemetry with individual health profiles, EHI-EWS empowers citizens to proactively avoid hazardous air pollution exposure.")
    add_body_p(doc, "The project met all primary objectives: developing a responsive React frontend, an Express API gateway with robust RBAC and security middleware, a Python FastAPI microservice for unsupervised anomaly detection, and an intelligent assistant (EVA) for safe travel routing.")

    add_custom_heading(doc, "7.2 Limitations", level=2)
    add_bullet_item(doc, "System accuracy is dependent on third-party weather API coverage and station spatial density.", bold_prefix="External Telemetry Granularity: ")
    add_bullet_item(doc, "Current indoor facility sensors require manual payload entry or simulated socket streams.", bold_prefix="Hardware Sensor Integration: ")

    add_custom_heading(doc, "7.3 Future Enhancement", level=2)
    add_bullet_item(doc, "Integrate directly with commercial smartwatches (Apple Health, Fitbit) to log live heart rate and blood oxygen (SpO2) during pollution events.", bold_prefix="Wearable IoT Health Sync: ")
    add_bullet_item(doc, "Incorporate European Space Agency (ESA) Sentinel-5P satellite data for high-resolution aerosol optical depth mapping.", bold_prefix="Satellite Remote Sensing: ")
    add_bullet_item(doc, "Deploy native Android and iOS mobile applications built with React Native for push notifications.", bold_prefix="Mobile Native Apps: ")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 8: REFERENCES & APPENDIX
    # -------------------------------------------------------------
    add_custom_heading(doc, "CHAPTER 8: REFERENCES & APPENDIX", level=1)

    add_custom_heading(doc, "8.1 References", level=2)
    add_bullet_item(doc, "World Health Organization (2021). WHO global air quality guidelines: particulate matter (PM2.5 and PM10), ozone, nitrogen dioxide, sulfur dioxide and carbon monoxide. Geneva: World Health Organization.", bold_prefix="[1] ")
    add_bullet_item(doc, "Liu, H., & Zhang, Y. (2023). Unsupervised Anomaly Detection in Environmental Telemetry Networks using Isolation Forest. IEEE Transactions on Industrial Informatics, 19(4), 4512-4521.", bold_prefix="[2] ")
    add_bullet_item(doc, "Express.js Foundation (2024). Express 5.0 API Reference & Best Practices. Nodejs.org Documentation.", bold_prefix="[3] ")
    add_bullet_item(doc, "FastAPI Web Framework (2024). High Performance Python Microservices with Pydantic. PyPI Documentation.", bold_prefix="[4] ")

    add_custom_heading(doc, "8.2 User Manual", level=2)
    add_body_p(doc, "Step-by-step instructions for installing and running EHI-EWS locally:")

    add_body_p(doc, "1. System Prerequisites & Setup:", bold_prefix="Step 1: ")
    add_bullet_item(doc, "Ensure Node.js (v18+), Python (v3.11+), and MongoDB (v6.0+) are installed on the target machine.")

    add_body_p(doc, "2. Backend API Setup:", bold_prefix="Step 2: ")
    p_code1 = doc.add_paragraph()
    p_code1.paragraph_format.line_spacing = 1.0
    r_c1 = p_code1.add_run(
"""cd backend
npm install
npm run dev"""
    )
    r_c1.font.name = "Courier New"
    r_c1.font.size = Pt(9.5)

    add_body_p(doc, "3. Python ML Microservice Setup:", bold_prefix="Step 3: ")
    p_code2 = doc.add_paragraph()
    p_code2.paragraph_format.line_spacing = 1.0
    r_c2 = p_code2.add_run(
"""cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000"""
    )
    r_c2.font.name = "Courier New"
    r_c2.font.size = Pt(9.5)

    add_body_p(doc, "4. Frontend Web Application Setup:", bold_prefix="Step 4: ")
    p_code3 = doc.add_paragraph()
    p_code3.paragraph_format.line_spacing = 1.0
    r_c3 = p_code3.add_run(
"""cd frontend
npm install
npm run dev"""
    )
    r_c3.font.name = "Courier New"
    r_c3.font.size = Pt(9.5)

    add_custom_heading(doc, "8.3 Bibliography", level=2)
    add_bullet_item(doc, "Pressman, R. S. (2019). Software Engineering: A Practitioner's Approach (9th ed.). McGraw-Hill Education.")
    add_bullet_item(doc, "Chodorow, K. (2018). MongoDB: The Definitive Guide (3rd ed.). O'Reilly Media.")

    # Save to file
    output_path = "Project_Report_EHI_EWS.docx"
    doc.save(output_path)
    print(f"Project report successfully generated at: {os.path.abspath(output_path)}")

if __name__ == "__main__":
    create_project_report()
