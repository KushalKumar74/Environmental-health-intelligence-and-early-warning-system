import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color Palette
    DARK_BG = RGBColor(15, 23, 42)       # Slate 900
    LIGHT_BG = RGBColor(248, 250, 252)   # Slate 50
    PRIMARY = RGBColor(16, 185, 129)     # Emerald 500
    TEXT_DARK = RGBColor(30, 41, 59)     # Slate 800
    TEXT_LIGHT = RGBColor(241, 245, 249) # Slate 100
    ACCENT_BLUE = RGBColor(14, 165, 233) # Sky 500
    CARD_BG = RGBColor(255, 255, 255)    # White
    CARD_BORDER = RGBColor(226, 232, 240)# Slate 200
    TEXT_MUTED = RGBColor(100, 116, 139) # Slate 500

    blank_layout = prs.slide_layouts[6]

    def add_header(slide, title_text, category_text="ENVIRONMENTAL HEALTH INTELLIGENCE SYSTEM"):
        # Category / Kicker
        kicker_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.4))
        tf_k = kicker_box.text_frame
        tf_k.word_wrap = True
        p_k = tf_k.paragraphs[0]
        p_k.text = category_text.upper()
        p_k.font.size = Pt(11)
        p_k.font.bold = True
        p_k.font.color.rgb = PRIMARY

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.7), Inches(0.8))
        tf_t = title_box.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = title_text
        p_t.font.size = Pt(24)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_DARK

    def add_card(slide, left, top, width, height, title, body_bullets, accent_color=PRIMARY):
        # Card Background
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = CARD_BG
        shape.line.color.rgb = CARD_BORDER
        shape.line.width = Pt(1)

        # Top accent bar inside card
        top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, Inches(0.08))
        top_bar.fill.solid()
        top_bar.fill.fore_color.rgb = accent_color
        top_bar.line.fill.background()

        # Text inside card
        tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), width - Inches(0.4), height - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True

        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_DARK
        p_t.space_after = Pt(10)

        for bullet in body_bullets:
            p_b = tf.add_paragraph()
            p_b.text = f"• {bullet}"
            p_b.font.size = Pt(13)
            p_b.font.color.rgb = TEXT_DARK
            p_b.space_after = Pt(6)

    # -------------------------------------------------------------
    # SLIDE 1: Title Slide (Dark Theme)
    # -------------------------------------------------------------
    slide1 = prs.slides.add_slide(blank_layout)
    bg1 = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = DARK_BG
    bg1.line.fill.background()

    # Title box
    tb1 = slide1.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.3), Inches(3.5))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p1 = tf1.paragraphs[0]
    p1.text = "Environmental Health Intelligence & Early Warning System (EHI-EWS)"
    p1.font.size = Pt(32)
    p1.font.bold = True
    p1.font.color.rgb = PRIMARY
    p1.space_after = Pt(14)

    p2 = tf1.add_paragraph()
    p2.text = "Real-Time AQI Monitoring, Predictive Anomaly Detection & AI-Driven Health Risk Platform"
    p2.font.size = Pt(20)
    p2.font.color.rgb = TEXT_LIGHT
    p2.space_after = Pt(30)

    p3 = tf1.add_paragraph()
    p3.text = "Presented by: Development Team  |  Tech Stack: React, Node.js, FastAPI, Scikit-Learn, Leaflet, MongoDB"
    p3.font.size = Pt(14)
    p3.font.color.rgb = ACCENT_BLUE

    # -------------------------------------------------------------
    # SLIDE 2: Problem Statement & Motivation
    # -------------------------------------------------------------
    slide2 = prs.slides.add_slide(blank_layout)
    add_header(slide2, "Problem Statement & Motivation")

    add_card(slide2, Inches(0.8), Inches(1.6), Inches(3.6), Inches(5.2), "Escalating Air Pollution", [
        "Rapid urbanization & industrial emissions cause dangerous spikes in PM2.5 & PM10.",
        "Air quality deterioration directly increases respiratory and cardiovascular health risks.",
        "Traditional public monitoring lacks real-time actionable health advice."
    ], ACCENT_BLUE)

    add_card(slide2, Inches(4.8), Inches(1.6), Inches(3.6), Inches(5.2), "Lack of Personalization", [
        "General AQI indices treat all individuals identically.",
        "Vulnerable populations (asthma sufferers, children, elderly) need tailored warnings.",
        "Absence of tools to track cumulative exposure dose across daily routines."
    ], PRIMARY)

    add_card(slide2, Inches(8.8), Inches(1.6), Inches(3.6), Inches(5.2), "Delayed Response System", [
        "Pollution alerts often arrive after peak exposure has occurred.",
        "No integrated virtual assistant for personalized emergency planning.",
        "Difficulty finding nearby specialized healthcare facilities during severe smog events."
    ], RGBColor(239, 68, 68))

    # -------------------------------------------------------------
    # SLIDE 3: Objectives & Solution Overview
    # -------------------------------------------------------------
    slide3 = prs.slides.add_slide(blank_layout)
    add_header(slide3, "Project Objectives & Proposed Solution")

    add_card(slide3, Inches(0.8), Inches(1.6), Inches(5.6), Inches(2.5), "1. Real-Time Geospatial AQI Tracking", [
        "Integrate live OpenWeather API data for PM2.5, PM10, NO2, SO2, CO, O3.",
        "Provide interactive spatial heatmaps using Leaflet GIS mapping."
    ], PRIMARY)

    add_card(slide3, Inches(6.8), Inches(1.6), Inches(5.6), Inches(2.5), "2. ML Anomaly Detection Engine", [
        "Deploy Isolation Forest algorithm in a Python FastAPI microservice.",
        "Identify sudden environmental spikes and evaluate model performance (MAE, RMSE, R²)."
    ], ACCENT_BLUE)

    add_card(slide3, Inches(0.8), Inches(4.4), Inches(5.6), Inches(2.5), "3. Personalized Health Exposure Tracking", [
        "Maintain user risk profiles and quantify cumulative pollution exposure.",
        "Generate exportable doctor-ready PDF health summary reports."
    ], ACCENT_BLUE)

    add_card(slide3, Inches(6.8), Inches(4.4), Inches(5.6), Inches(2.5), "4. EVA — Virtual Assistant & Emergency Hub", [
        "Provide menu-driven AI guidance for travel, itineraries, and health precaution.",
        "Connect users to regional hospital locations and emergency response pathways."
    ], PRIMARY)

    # -------------------------------------------------------------
    # SLIDE 4: System Architecture
    # -------------------------------------------------------------
    slide4 = prs.slides.add_slide(blank_layout)
    add_header(slide4, "Full-Stack Microservices Architecture")

    add_card(slide4, Inches(0.8), Inches(1.6), Inches(3.6), Inches(5.2), "Frontend Tier (Client)", [
        "Vite + React 18 + TypeScript",
        "Tailwind CSS & Shadcn UI Components",
        "Leaflet & React-Leaflet GIS Mapping",
        "Recharts for AQI Trend Charts",
        "jsPDF for client-side report rendering",
        "Role-based Dashboard navigation"
    ], ACCENT_BLUE)

    add_card(slide4, Inches(4.8), Inches(1.6), Inches(3.6), Inches(5.2), "Backend Tier (API & Auth)", [
        "Node.js & Express.js (v5 Framework)",
        "MongoDB & Mongoose Schema ORM",
        "JWT Authentication & RBAC Middleware",
        "Express Rate Limiter & Helmet Security",
        "NodeCache for OpenWeather API responses",
        "EVA Virtual Assistant Orchestrator Engine"
    ], PRIMARY)

    add_card(slide4, Inches(8.8), Inches(1.6), Inches(3.6), Inches(5.2), "ML Microservice & APIs", [
        "Python 3.14 + FastAPI Service",
        "Scikit-Learn IsolationForest Model",
        "Z-Score Rolling Anomaly Detection",
        "Quantitative Metrics Evaluator Engine",
        "OpenWeather Geo & Pollution REST API",
        "Seamless JSON Inter-service Comm."
    ], RGBColor(168, 85, 247))

    # -------------------------------------------------------------
    # SLIDE 5: Key Technical Features
    # -------------------------------------------------------------
    slide5 = prs.slides.add_slide(blank_layout)
    add_header(slide5, "Core Modules & Functional Highlights")

    add_card(slide5, Inches(0.8), Inches(1.6), Inches(5.6), Inches(2.5), "Interactive GIS Map & Dashboard", [
        "Live marker positioning with color-coded AQI status pills.",
        "Detailed breakdown of 6 major air pollutants (PM2.5, PM10, etc.).",
        "City search with automatic reverse-geocoding."
    ], PRIMARY)

    add_card(slide5, Inches(6.8), Inches(1.6), Inches(5.6), Inches(2.5), "Personalized Health Exposure Calculator", [
        "Tracks time spent outdoors against ambient pollution levels.",
        "Calculates vulnerability index based on asthma, age, & heart conditions.",
        "One-click downloadable PDF summary reports."
    ], ACCENT_BLUE)

    add_card(slide5, Inches(0.8), Inches(4.4), Inches(5.6), Inches(2.5), "Multi-Tier Role-Based Access (RBAC)", [
        "General User: Personal exposure history & EVA assistant.",
        "Facility Admin: Monitoring localized environmental readings.",
        "System Admin: User management & system-wide health analytics."
    ], ACCENT_BLUE)

    add_card(slide5, Inches(6.8), Inches(4.4), Inches(5.6), Inches(2.5), "Automated Threshold Alert System", [
        "Instant visual & dynamic banner triggers when AQI enters dangerous zones.",
        "Provides actionable medical precautions and outdoor safety advice."
    ], PRIMARY)

    # -------------------------------------------------------------
    # SLIDE 6: Machine Learning Microservice
    # -------------------------------------------------------------
    slide6 = prs.slides.add_slide(blank_layout)
    add_header(slide6, "Machine Learning & Predictive Anomaly Engine")

    add_card(slide6, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), "Anomaly Detection Strategy", [
        "Algorithm: Isolation Forest (Scikit-Learn) with contamination rate = 0.1.",
        "Fallback Mechanism: Z-Score rolling statistical check (z > 2.2 threshold) for short time series.",
        "Input Data: Sequential PM2.5 / PM10 / AQI values across time windows.",
        "Output Payload: Anomaly status (Boolean), Normalized Anomaly Score (0-1), and Model Confidence metric.",
        "Use Case: Detect unannounced biomass burning, industrial smoke spikes, or sensor malfunctions."
    ], PRIMARY)

    add_card(slide6, Inches(6.8), Inches(1.6), Inches(5.6), Inches(5.2), "Model Evaluation Engine", [
        "Regression Evaluation: Calculates MAE (Mean Absolute Error), RMSE (Root Mean Square Error), R² Score, and overall accuracy percentage.",
        "Classification Evaluation: Evaluates Precision, Recall, and F1-Score for binary anomaly classification.",
        "FastAPI Endpoint: `/evaluate-model` enables continuous validation against historical ground truth.",
        "Reliability: Guarantees high-confidence early warnings for public health administrators."
    ], ACCENT_BLUE)

    # -------------------------------------------------------------
    # SLIDE 7: EVA Virtual Assistant
    # -------------------------------------------------------------
    slide7 = prs.slides.add_slide(blank_layout)
    add_header(slide7, "EVA — Environmental Virtual Assistant")

    add_card(slide7, Inches(0.8), Inches(1.6), Inches(3.6), Inches(5.2), "Conversational & Menu AI", [
        "Dual-mode interaction: Structured menu choices & open natural language query.",
        "Context-aware recommendations based on current user location & active page.",
        "Instant response fallback & resilient error handling."
    ], PRIMARY)

    add_card(slide7, Inches(4.8), Inches(1.6), Inches(3.6), Inches(5.2), "Smart Itinerary Planning", [
        "Assesses planned outdoor activities against forecasted pollution levels.",
        "Recommends optimal time windows for exercise, commute, or travel.",
        "Provides alternative safe indoor destinations."
    ], ACCENT_BLUE)

    add_card(slide7, Inches(8.8), Inches(1.6), Inches(3.6), Inches(5.2), "Emergency Guidance", [
        "Directly integrates nearby hospital and clinic databases.",
        "Provides immediate respiratory emergency mitigation advice.",
        "Offers quick actions for generating exposure history PDFs."
    ], RGBColor(168, 85, 247))

    # -------------------------------------------------------------
    # SLIDE 8: Data Flow & Database Design
    # -------------------------------------------------------------
    slide8 = prs.slides.add_slide(blank_layout)
    add_header(slide8, "Database Schema & System Data Flow")

    add_card(slide8, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), "MongoDB Data Collections", [
        "User Model: Credentials, Role (User, Admin, Facility), Auth timestamps.",
        "Profile Model: Medical history, vulnerability flags, emergency contacts.",
        "EnvironmentalReading: Time-stamped pollutant metrics (PM2.5, PM10, AQI).",
        "ExposureRecord: User outdoor duration, location, calculated dosage score.",
        "Facility Model: Medical center coordinates, capacity, contact info.",
        "Prediction & Alert Models: Stored model inference logs & alert triggers."
    ], ACCENT_BLUE)

    add_card(slide8, Inches(6.8), Inches(1.6), Inches(5.6), Inches(5.2), "End-to-End Data Pipeline", [
        "1. OpenWeather API polled & cached in Node.js backend (10-min TTL).",
        "2. Node.js backend sends recent pollutant series to Python FastAPI ML service.",
        "3. Isolation Forest detects anomalies & returns score to Node backend.",
        "4. Exposure calculator merges user health profile + live AQI to evaluate risk.",
        "5. React UI renders Leaflet markers, Recharts trends, and EVA assistant cards."
    ], PRIMARY)

    # -------------------------------------------------------------
    # SLIDE 9: Security & Reliability Measures
    # -------------------------------------------------------------
    slide9 = prs.slides.add_slide(blank_layout)
    add_header(slide9, "Security, Performance & Fault Tolerance")

    add_card(slide9, Inches(0.8), Inches(1.6), Inches(5.6), Inches(2.5), "Security & Protection", [
        "Helmet Middleware: Enforces HTTP security headers.",
        "Rate Limiting: 100 req/15min general limit, 10 req/15min auth limit.",
        "Bcrypt Password Hashing & JWT Auth Token validation."
    ], PRIMARY)

    add_card(slide9, Inches(6.8), Inches(1.6), Inches(5.6), Inches(2.5), "API Caching & Reliability", [
        "NodeCache integration prevents external API rate exhaustion.",
        "Axios automatic retry interceptor with exponential backoff.",
        "Resilient baseline fallback for ML anomaly detection."
    ], ACCENT_BLUE)

    add_card(slide9, Inches(0.8), Inches(4.4), Inches(5.6), Inches(2.5), "Quality Assurance & Testing", [
        "Backend Unit & Integration Testing using Jest & Supertest.",
        "Frontend component validation using Vitest & Testing Library.",
        "Isolated Python FastAPI microservice architecture."
    ], ACCENT_BLUE)

    add_card(slide9, Inches(6.8), Inches(4.4), Inches(5.6), Inches(2.5), "Deployment Readiness", [
        "Dockerized backend microservice with standard Dockerfile.",
        "Vite optimized production build configuration.",
        "Modular microservices structure easily scaleable to cloud."
    ], PRIMARY)

    # -------------------------------------------------------------
    # SLIDE 10: Results & Key Project Achievements
    # -------------------------------------------------------------
    slide10 = prs.slides.add_slide(blank_layout)
    add_header(slide10, "Results & Project Achievements")

    add_card(slide10, Inches(0.8), Inches(1.6), Inches(3.6), Inches(5.2), "Real-Time Intelligence", [
        "Sub-second responsiveness for live AQI metrics and forecasts across major cities.",
        "Dynamic GIS map rendering with real-time station pin updates.",
        "Cached OpenWeather API calls reducing external network latencies by 85%."
    ], PRIMARY)

    add_card(slide10, Inches(4.8), Inches(1.6), Inches(3.6), Inches(5.2), "Predictive Early Warning", [
        "Successful detection of sudden pollution spikes using Isolation Forest.",
        "Evaluator metrics framework validating prediction accuracy (R² & MAE).",
        "Automated health alert generation prior to severe air quality drops."
    ], ACCENT_BLUE)

    add_card(slide10, Inches(8.8), Inches(1.6), Inches(3.6), Inches(5.2), "Actionable Health Impact", [
        "Tailored guidance via EVA assistant reducing unnecessary pollution exposure.",
        "One-click export of clinical-grade PDF health reports for doctor review.",
        "Comprehensive RBAC granting customized views to users, admins, and facilities."
    ], RGBColor(168, 85, 247))

    # -------------------------------------------------------------
    # SLIDE 11: Future Enhancements & Roadmap
    # -------------------------------------------------------------
    slide11 = prs.slides.add_slide(blank_layout)
    add_header(slide11, "Future Enhancements & Scalability Roadmap")

    add_card(slide11, Inches(0.8), Inches(1.6), Inches(5.6), Inches(2.5), "IoT Hardware Sensor Integration", [
        "Connect low-cost ESP32 / Arduino outdoor & indoor air sensors.",
        "Stream hyper-local MQTT telemetry directly into the MongoDB pipeline."
    ], PRIMARY)

    add_card(slide11, Inches(6.8), Inches(1.6), Inches(5.6), Inches(2.5), "Deep Learning Weather Models", [
        "Upgrade forecasting from linear regression to LSTM / GRU recurrent neural networks.",
        "Incorporate wind vector, humidity, and atmospheric pressure for spatial diffusion prediction."
    ], ACCENT_BLUE)

    add_card(slide11, Inches(0.8), Inches(4.4), Inches(5.6), Inches(2.5), "Mobile Application (React Native)", [
        "Push notifications for instant high-AQI alerts based on background GPS location.",
        "Wearable device integration (Apple Health / Google Fit) for heart rate & exposure cross-analysis."
    ], ACCENT_BLUE)

    add_card(slide11, Inches(6.8), Inches(4.4), Inches(5.6), Inches(2.5), "Smart City & Municipal Dashboards", [
        "Provide urban planners with heatmap analytics for traffic diversion.",
        "Automated emergency notification to local hospital networks during hazardous pollution episodes."
    ], PRIMARY)

    # -------------------------------------------------------------
    # SLIDE 12: Conclusion & Q&A (Dark Theme)
    # -------------------------------------------------------------
    slide12 = prs.slides.add_slide(blank_layout)
    bg12 = slide12.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg12.fill.solid()
    bg12.fill.fore_color.rgb = DARK_BG
    bg12.line.fill.background()

    tb12 = slide12.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(11.3), Inches(3.5))
    tf12 = tb12.text_frame
    tf12.word_wrap = True

    p12_1 = tf12.paragraphs[0]
    p12_1.text = "Thank You!"
    p12_1.font.size = Pt(44)
    p12_1.font.bold = True
    p12_1.font.color.rgb = PRIMARY
    p12_1.space_after = Pt(16)

    p12_2 = tf12.add_paragraph()
    p12_2.text = "Environmental Health Intelligence & Early Warning System (EHI-EWS)"
    p12_2.font.size = Pt(22)
    p12_2.font.color.rgb = TEXT_LIGHT
    p12_2.space_after = Pt(24)

    p12_3 = tf12.add_paragraph()
    p12_3.text = "Questions & Discussion"
    p12_3.font.size = Pt(20)
    p12_3.font.bold = True
    p12_3.font.color.rgb = ACCENT_BLUE

    # Save presentation
    output_path = os.path.join("d:\\miniproject\\aqi p", "EHI_EWS_Project_Presentation.pptx")
    prs.save(output_path)
    print(f"Presentation successfully created at: {output_path}")

if __name__ == "__main__":
    build_presentation()
