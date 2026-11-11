"""
MyCare AI — Multilingual Voice & Text Oncology Assistant & Navigator Router

Supports:
- English (en)
- Hindi (hi) — हिन्दी / Hinglish
- Kannada (kn) — ಕನ್ನಡ / Kanglish

Features:
- Friendly natural conversation & pleasantries ("How are you")
- Direct website navigation & page redirection
- Simple beginner-friendly website walkthroughs ("I don't understand this website")
- Lung pain relief & breathing exercise guidance
- Clinical decision-support & Fleischner Society surveillance
- Multilingual speech & text responses
"""

import re
import json
import asyncio
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class ActionButton(BaseModel):
    label: str
    url: str
    icon: Optional[str] = "arrow-right"

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en"   # "en", "hi", "kn", "auto"
    context: Optional[str] = None    # e.g. current scan result if on results page
    page_context: Optional[str] = None  # full activity summary from ActivityContext

class ChatResponse(BaseModel):
    reply: str
    language: str
    detected_language: str
    suggestions: List[str]
    action_buttons: Optional[List[ActionButton]] = None


# ---------------------------------------------------------------------------
# Knowledge Base & NLP Engine
# ---------------------------------------------------------------------------

KNOWLEDGE_BASE = {
    # -----------------------------------------------------------------------
    # ENGLISH RESPONSES
    # -----------------------------------------------------------------------
    "en": {
        "greeting": (
            "Hello! I am your MyCare AI Health Assistant. I am doing very well and ready to assist you! "
            "You can ask me about lung health, chest/lung pain relief, breathing exercises, "
            "how to use this website, or direct you to any page. How are you feeling today?"
        ),
        "how_are_you": (
            "I'm doing wonderful, thank you for asking! 😊\n"
            "I am fully active and ready to help you navigate this website, analyze CT scans, explore lung health tips, manage respiratory pain, or answer your medical questions. How can I support your health today?"
        ),
        "explain_website": (
            "**Welcome to MyCare! Here is how this website works in 3 easy steps:**\n\n"
            "1. 🔬 **Scan Upload & AI Diagnosis (`/analyze`):**\n"
            "   Click on 'Analyze' in the top bar. You can upload an axial chest CT scan image (or click any of our 1-click Sample Scans). Our deep learning model (ResNet-18) will analyze the slice in under 150 milliseconds.\n\n"
            "2. 🗺️ **Visual Grad-CAM Heatmap (`/results`):**\n"
            "   The system shows whether the scan is **Normal**, **Benign** (non-cancerous nodule), or **Malignant** (cancer). It highlights the exact nodule location with a colorful thermal heatmap so doctors and patients can clearly see it.\n\n"
            "3. 📋 **Clinical Action Plan & PDF Summary:**\n"
            "   You get evidence-based follow-up steps (such as when to get a follow-up scan according to Fleischner Society guidelines) and can print a complete diagnostic summary report with one click!\n\n"
            "4. 🗣️ **Voice Assistant (English, Hindi, Kannada):**\n"
            "   You can speak to me anytime using your microphone in English, Hindi (हिन्दी), or Kannada (ಕನ್ನಡ) for immediate answers."
        ),
        "nav_analyze": (
            "Here is the link to test and upload a CT scan! You can drag and drop your own scan image or try our pre-loaded normal, benign, and malignant sample scans with one click:"
        ),
        "nav_history": (
            "Here is the link to view your past scan records and diagnostic history:"
        ),
        "nav_guidance": (
            "Here is the link to our Clinical Guidance & Care Pathways page, detailing Fleischner Society nodule surveillance protocols and treatment pathways:"
        ),
        "nav_about": (
            "Here is the link to learn all about the MyCare project, dataset metrics, architecture, and team members:"
        ),
        "nav_news": (
            "Here is the link to our **PulmoNews & Research Hub** (`/news`)! You can explore breakthroughs in AI screening, clinical trials, new immunotherapies, and dietary research, with 30-second Siri voice summaries for every article:"
        ),
        "downloads": (
            "Here are the direct links to download the project documents, research paper, and presentation slides:"
        ),
        "lung_pain": (
            "**How to Manage and Relieve Lung & Chest Pain:**\n\n"
            "⚠️ **Emergency Notice:** If pain is sudden, crushing, radiates to your left arm/jaw, or is accompanied by severe dizziness, seek immediate emergency medical care.\n\n"
            "**Steps to Improve Mild-to-Moderate Lung/Chest Discomfort:**\n"
            "1. **Pursed-Lip & Diaphragmatic Breathing:** Inhale through your nose for 2 seconds, then exhale slowly through pursed lips for 4 seconds. This eases airway resistance.\n"
            "2. **Optimal Posture:** Sit upright or elevate your head 30–45 degrees using pillows to relieve pressure on the diaphragm and chest wall.\n"
            "3. **Warm Steam Inhalation:** Inhale warm water vapor (optionally with a drop of eucalyptus) to soothe irritated bronchi and loosen mucus.\n"
            "4. **Stay Hydrated:** Drink warm fluids (warm water, herbal teas, ginger water) to keep mucosal linings lubricated.\n"
            "5. **Avoid Cold Air & Smoke:** Cold air triggers airway bronchospasms. Keep your surroundings warm and strictly avoid smoke and dust.\n"
            "6. **Clinical Evaluation:** Persistent or pleuritic pain (hurts worse when taking deep breaths) requires a chest CT/X-ray to rule out pleurisy, pneumonia, or nodular inflammation."
        ),
        "breathing_exercises": (
            "**Proven Breathing Exercises to Boost Lung Capacity:**\n"
            "1. **Diaphragmatic (Belly) Breathing:** Place one hand on your chest and one on your belly. Breathe deep so only your belly rises, not your chest.\n"
            "2. **4-7-8 Calming Breath:** Inhale through your nose for 4 seconds, hold your breath for 7 seconds, and exhale smoothly through your mouth for 8 seconds.\n"
            "3. **Pranayama (Anulom Vilom):** Alternate nostril breathing for 10 minutes daily improves pulmonary oxygenation.\n"
            "4. **Incentive Spirometer:** Using a medical spirometer 10 times per hour helps expand collapsed lung alveoli."
        ),
        "diet_foods": (
            "**Best Foods & Diet for Lung Health:**\n"
            "• **Berries & Citrus Fruits:** Rich in Vitamin C and flavonoids that combat pulmonary oxidative stress.\n"
            "• **Leafy Greens (Spinach, Broccoli):** High in magnesium, which helps relax bronchial smooth muscles.\n"
            "• **Turmeric (Curcumin) & Ginger:** Powerful natural anti-inflammatories that soothe respiratory passages.\n"
            "• **Walnuts & Fatty Fish:** Packed with Omega-3 fatty acids that reduce chronic lung inflammation.\n"
            "• **Green Tea:** High in epigallocatechin gallate (EGCG) which inhibits lung tissue fibrosis."
        ),
        "cough_relief": (
            "**Tips to Relieve Persistent Cough:**\n"
            "• Drink warm water with raw honey and ginger (honey coats and soothes the pharynx).\n"
            "• Practice warm saltwater gargles 2–3 times a day.\n"
            "• Use a cool-mist room humidifier to prevent airway dryness during sleep.\n"
            "• *Caution:* If your cough lasts more than 3 weeks or produces blood, arrange a thoracic CT examination promptly."
        ),
        "symptoms": (
            "**Common Symptoms of Lung Cancer include:**\n"
            "• Persistent cough lasting > 3 weeks\n"
            "• Coughing up blood or rust-colored sputum (Hemoptysis)\n"
            "• Shortness of breath or new-onset wheezing\n"
            "• Unexplained chest, shoulder, or back pain\n"
            "• Unintentional weight loss and persistent fatigue\n"
            "• Recurrent respiratory infections (bronchitis or pneumonia)\n\n"
            "*Note: If you experience persistent symptoms, please consult a pulmonologist promptly.*"
        ),
        "benign": (
            "**What is a Benign Lung Nodule?**\n"
            "• A benign nodule is a **non-cancerous** growth in the lung (e.g., healed granuloma, hamartoma, or post-infection scar tissue).\n"
            "• **Key Characteristics:** Smooth circumscribed margins, slow or no growth, no pleural tethering.\n"
            "• **Management:** Active surveillance following **Fleischner Society guidelines** with a follow-up low-dose CT scan in 3–6 months to confirm volume stability."
        ),
        "malignant": (
            "**What is Malignant Lung Cancer?**\n"
            "• Malignant lesions contain invasive cancerous cells (such as Adenocarcinoma, Squamous Cell, or Small Cell Carcinoma).\n"
            "• **Key Characteristics on CT:** Spiculated irregular borders, pleural retraction, rapid doubling time, high cellular attenuation.\n"
            "• **Recommended Actions:** Immediate referral to a multidisciplinary thoracic tumor board, PET-CT staging, tissue biopsy (EBUS-TBNA), and tailored therapy."
        ),
        "normal": (
            "**What does a Normal CT scan result mean?**\n"
            "• Normal findings indicate clear bilateral lung fields without focal nodules, mass lesions, or consolidations.\n"
            "• **Recommendation:** Maintain annual Low-Dose CT (LDCT) screening if you have a significant smoking history (>20 pack-years), and practice respiratory wellness."
        ),
        "treatment": (
            "**Main Treatment Modalities for Lung Cancer:**\n"
            "1. **Minimally Invasive Surgery (VATS / Robotic Lobectomy):** Preferred for early-stage localized tumors (Stage I/II).\n"
            "2. **Stereotactic Body Radiotherapy (SBRT):** Targeted high-precision radiation for inoperable tumors.\n"
            "3. **Chemotherapy:** Systemic cytotoxic medications (e.g., Cisplatin, Carboplatin, Pemetrexed).\n"
            "4. **Immunotherapy (Immune Checkpoint Inhibitors):** PD-1 / PD-L1 inhibitors (e.g., Pembrolizumab, Nivolumab).\n"
            "5. **Targeted Therapy:** Precision drugs targeting specific mutations (EGFR, ALK, ROS1, KRAS)."
        ),
        "prevention": (
            "**Prevention & Lung Health Tips:**\n"
            "• **Smoking Cessation:** Stopping smoking is the single most effective way to lower risk.\n"
            "• **Avoid Secondhand Smoke & Radon:** Test home radon levels and ensure proper indoor air ventilation.\n"
            "• **Occupational Safety:** Use certified respiratory masks around asbestos, silica, and diesel fumes.\n"
            "• **Aerobic Exercise:** 150 minutes/week of moderate cardio enhances vital lung capacity."
        ),
        "how_it_works": (
            "**How MyCare AI Works:**\n"
            "1. **Upload:** You upload an axial chest CT scan image (DICOM, PNG, or JPG).\n"
            "2. **Preprocessing:** Image is standardized (224×224) with ImageNet normalization.\n"
            "3. **ResNet-18 Deep Learning:** Our fine-tuned Residual CNN evaluates deep features across 18 layers (99.4% balanced accuracy).\n"
            "4. **Grad-CAM Localization:** Generates a thermal visual heatmap overlay pointing out exact suspicious regions.\n"
            "5. **Clinical Guidance:** Provides structured next steps and treatment education."
        ),
        "fleischner": (
            "**Fleischner Society Guidelines Summary:**\n"
            "• **Solid Nodule < 6mm:** Low risk: No routine follow-up needed. High risk: Optional CT at 12 months.\n"
            "• **Solid Nodule 6–8mm:** Follow-up CT in 6–12 months, then at 18–24 months if stable.\n"
            "• **Solid Nodule > 8mm:** Follow-up CT in 3 months, PET-CT, or biopsy if malignancy risk is elevated."
        ),
        "about_creators": (
            "**About MyCare AI Creators:**\n"
            "MyCare AI was created by **VINITHRAM**, **VINITH V DEVADIGA**, **TEJAS N**, and **VISHNU K** from the Department of Computer Science & Engineering at **NMAM Institute of Technology, Nitte**."
        ),
        "disclaimer": (
            "**Medical Disclaimer:** MyCare AI is an assistive decision-support and educational tool. "
            "It does not replace professional clinical evaluation or tissue biopsy by a licensed oncologist."
        ),
        "default": (
            "I'm here to help you navigate and use MyCare easily! "
            "You can ask me to **take you to the scan upload page**, **explain how this website works**, **check symptoms**, "
            "**provide tips for lung pain**, or **view your past scan history**. What would you like to do?"
        )
    },

    # -----------------------------------------------------------------------
    # HINDI RESPONSES (हिन्दी)
    # -----------------------------------------------------------------------
    "hi": {
        "greeting": (
            "नमस्ते! मैं आपका MyCare AI स्वास्थ्य और वेबसाइट सहायक हूँ। मैं बहुत अच्छा हूँ और आपकी मदद के लिए तैयार हूँ। "
            "आप मुझसे वेबसाइट के उपयोग, सीटी स्कैन जांच, फेफड़ों के दर्द के उपाय, या किसी भी पेज पर जाने के लिए कह सकते हैं!"
        ),
        "how_are_you": (
            "मैं बिल्कुल ठीक हूँ, पूछने के लिए धन्यवाद! 😊\n"
            "मैं आपके फेफड़ों के स्वास्थ्य, सीटी स्कैन विश्लेषण, वेबसाइट नेविगेशन और दर्द निवारण में मदद के लिए तैयार हूँ। बताइए, मैं आपकी क्या सेवा करूँ?"
        ),
        "explain_website": (
            "**MyCare वेबसाइट का उपयोग कैसे करें (आसान 3 चरण):**\n\n"
            "1. 🔬 **स्कैन अपलोड और जांच (`/analyze`):**\n"
            "   ऊपर दिए गए 'Analyze' बटन पर क्लिक करें। अपने सीटी स्कैन की फोटो अपलोड करें या नीचे दिए गए 1-क्लिक टेस्ट सैंपल पर क्लिक करें।\n\n"
            "2. 🗺️ **रंगीन Grad-CAM हीटमैप:**\n"
            "   एआई आपको बताएगा कि परिणाम **Normal** है, **Benign** (गैर-कैंसर गांठ) है, या **Malignant** (कैंसर) है और फेफड़ों के प्रभावित हिस्से पर रंगीन निशान दिखाएगा।\n\n"
            "3. 📋 **चिकित्सीय सलाह और पीडीएफ रिपोर्ट:**\n"
            "   आपको डॉक्टर से परामर्श और आगे की जांच के कदम बताए जाएंगे और आप 1-क्लिक में पूरी डायग्नोस्टिक रिपोर्ट डाउनलोड कर सकते हैं!"
        ),
        "nav_analyze": "सीटी स्कैन अपलोड और जांच पेज पर जाने के लिए नीचे दिए गए बटन पर क्लिक करें:",
        "nav_history": "अपनी पुरानी सीटी स्कैन रिपोर्ट और इतिहास देखने के लिए नीचे क्लिक करें:",
        "nav_guidance": "फ्लाइश्नर सोसाइटी दिशानिर्देश और उपचार के चरणों की जानकारी के लिए यहाँ क्लिक करें:",
        "nav_about": "MyCare प्रोजेक्ट और टीम के बारे में जानने के लिए यहाँ क्लिक करें:",
        "downloads": "प्रोजेक्ट रिपोर्ट, रिसर्च पेपर और प्रेजेंटेशन डाउनलोड करने के लिए नीचे क्लिक करें:",
        "lung_pain": (
            "**फेफड़ों और सीने के दर्द में राहत पाने के उपाय:**\n\n"
            "⚠️ **आपातकालीन चेतावनी:** यदि दर्द बहुत तेज है, बाएं हाथ या जबड़े तक फैल रहा है, तो तुरंत डॉक्टर से संपर्क करें।\n\n"
            "1. **धीमी और गहरी सांस लें (Pursed-Lip Breathing):** नाक से 2 सेकंड सांस लें और 4 सेकंड में धीरे-धीरे छोड़ें।\n"
            "2. **सही मुद्रा (Posture):** तकिए लगाकर 30-45 डिग्री ऊपर झुककर बैठें।\n"
            "3. **गर्म भाप (Steam):** गर्म पानी की भाप लें, इससे सांस की नलियों की सूजन कम होती है।\n"
            "4. **गर्म तरल पदार्थ:** अदरक-शहद का पानी या हर्बल चाय पिएं।\n"
            "5. **धूम्रपान से बचें:** धुएं और ठंडी हवा से बचें।"
        ),
        "breathing_exercises": (
            "**फेफड़ों के लिए सांस के व्यायाम:**\n"
            "1. **डायाफ्रामिक सांस:** केवल पेट फुलाकर गहरी सांस लें।\n"
            "2. **4-7-8 प्राणायाम:** 4 सेकंड अंदर, 7 सेकंड रोकें, 8 सेकंड में बाहर।\n"
            "3. **अनुलोम-विलोम:** 10-15 मिनट रोजाना करने से फेफड़े मजबूत होते हैं।"
        ),
        "diet_foods": (
            "**फेफड़ों को मजबूत बनाने वाले आहार:**\n"
            "हल्दी, अदरक, हरी पत्तेदार सब्जियां, अखरोट, और विटामिन-सी युक्त खट्टे फल।"
        ),
        "cough_relief": (
            "**खांसी से राहत:** अदरक और शहद का रस लें, गुनगुने नमक के पानी से गरारे करें।"
        ),
        "symptoms": (
            "**फेफड़ों के कैंसर के मुख्य लक्षण:**\n"
            "3 सप्ताह से अधिक खांसी, खांसी में खून, सांस फूलना, सीने में लगातार दर्द, और तेजी से वजन कम होना।"
        ),
        "benign": "**सौम्य (Benign) गांठ:** यह गैर-कैंसरयुक्त गांठ होती है जो शरीर में नहीं फैलती।",
        "malignant": "**घातक (Malignant) कैंसर:** यह आक्रामक कैंसर होता है जिसके लिए तुरंत ऑन्कोलॉजिस्ट और बायोप्सी की आवश्यकता होती है।",
        "normal": "**सामान्य (Normal) स्कैन:** फेफड़ों में कोई असामान्य गांठ नहीं है।",
        "treatment": "उपचार के मुख्य तरीके: सर्जरी (VATS Lobectomy), रेडिएशन, कीमोथेरेपी, और इम्यूनोथेरेपी।",
        "prevention": "बचाव: धूम्रपान तुरंत छोड़ें, प्रदूषण से बचें और नियमित प्राणायाम करें।",
        "how_it_works": "MyCare ResNet-18 न्यूरल नेटवर्क और Grad-CAM हीटमैप तकनीक का उपयोग करता है (99.4% सटीकता)।",
        "fleischner": "फ्लाइश्नर दिशानिर्देश: 6mm से छोटी गांठ में निगरानी, 8mm से बड़ी में तुरंत सीटी/बायोप्सी।",
        "about_creators": "निर्माता: NMAMIT निट्टे के छात्र विनीथराम, विनीथ वी देवाडिगा, तेजस एन, और विष्णु के।",
        "disclaimer": "चिकित्सीय अस्वीकरण: यह केवल शैक्षणिक और प्राथमिक सहायता के लिए है।",
        "default": "मैं आपकी मदद के लिए उपस्थित हूँ! आप मुझसे वेबसाइट के किसी भी पेज पर जाने के लिए कह सकते हैं या फेफड़ों के स्वास्थ्य के बारे में पूछ सकते हैं।"
    },

    # -----------------------------------------------------------------------
    # KANNADA RESPONSES (ಕನ್ನಡ)
    # -----------------------------------------------------------------------
    "kn": {
        "greeting": (
            "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ MyCare AI ಸಹಾಯಕ. ನಾನು ತುಂಬಾ ಚೆನ್ನಾಗಿದ್ದೇನೆ ಮತ್ತು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ! "
            "ವೆಬ್‌ಸೈಟ್ ಹೇಗೆ ಬಳಸಬೇಕು, ಸ್ಕ್ಯಾನ್ ಅಪ್‌ಲೋಡ್ ಮಾಡುವುದು, ನೋವು ನಿವಾರಣೆ ಅಥವಾ ಯಾವುದೇ ಪೇಜ್‌ಗೆ ಹೋಗಲು ನೀವು ನನ್ನನ್ನು ಕೇಳಬಹುದು!"
        ),
        "how_are_you": (
            "ನಾನು ತುಂಬಾ ಚೆನ್ನಾಗಿದ್ದೇನೆ, ವಿಚಾರಿಸಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು! 😊\n"
            "ನಿಮ್ಮ ಶ್ವಾಸಕೋಶದ ಆರೋಗ್ಯ, ಸಿಟಿ ಸ್ಕ್ಯಾನ್ ತಪಾಸಣೆ, ವೆಬ್‌ಸೈಟ್ ಬಳಕೆ ಮತ್ತು ಎದೆ ನೋವು ನಿವಾರಣೆಗೆ ಸಲಹೆ ನೀಡಲು ನಾನು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ. ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?"
        ),
        "explain_website": (
            "**MyCare ವೆಬ್‌ಸೈಟ್ ಅನ್ನು ಹೇಗೆ ಬಳಸಬೇಕು (ಸುಲಭ 3 ಹಂತಗಳು):**\n\n"
            "1. 🔬 **ಸ್ಕ್ಯಾನ್ ಅಪ್‌ಲೋಡ್ ಮತ್ತು ತಪಾಸಣೆ (`/analyze`):**\n"
            "   ಮೇಲಿನ 'Analyze' ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ. ನಿಮ್ಮ ಸಿಟಿ ಸ್ಕ್ಯಾನ್ ಫೋಟೋ ಹಾಕಿ ಅಥವಾ ಕೆಳಗಿನ ಸ್ಯಾಂಪಲ್ ಸ್ಕ್ಯಾನ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ. 1 ಸೆಕೆಂಡ್‌ಗಿಂತ ಕಡಿಮೆ ಸಮಯದಲ್ಲಿ ಫಲಿತಾಂಶ ದೊರೆಯುತ್ತದೆ.\n\n"
            "2. 🗺️ **Grad-CAM ಕಲರ್ ಹೀಟ್‌ಮ್ಯಾಪ್:**\n"
            "   ಸ್ಕ್ಯಾನ್‌ನಲ್ಲಿ ಗಡ್ಡೆ ಎಲ್ಲಿದೆ ಎಂದು ಬಣ್ಣದ ಹೀಟ್‌ಮ್ಯಾಪ್ ಮೂಲಕ ಸ್ಪಷ್ಟವಾಗಿ ತೋರಿಸುತ್ತದೆ (Normal, Benign ಅಥವಾ Malignant).\n\n"
            "3. 📋 **ವೈದ್ಯಕೀಯ ವರದಿ ಮತ್ತು ಸಲಹೆ:**\n"
            "   ಮುಂದಿನ ಚಿಕಿತ್ಸಾ ಹಂತಗಳನ್ನು ವಿವರಿಸುತ್ತದೆ ಮತ್ತು ನೀವು 1-ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಸಂಪೂರ್ಣ ವೈದ್ಯಕೀಯ PDF ವರದಿಯನ್ನು ಪ್ರಿಂಟ್ ಮಾಡಿಕೊಳ್ಳಬಹುದು!"
        ),
        "nav_analyze": "ಸಿಟಿ ಸ್ಕ್ಯಾನ್ ಅಪ್‌ಲೋಡ್ ಪೇಜ್‌ಗೆ ಹೋಗಲು ಕೆಳಗಿನ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ:",
        "nav_history": "ನಿಮ್ಮ ಹಿಂದಿನ ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸವನ್ನು ನೋಡಲು ಕೆಳಗೆ ಕ್ಲಿಕ್ ಮಾಡಿ:",
        "nav_guidance": "ಫ್ಲೈಶ್ನರ್ ಮಾರ್ಗಸೂಚಿಗಳು ಮತ್ತು ಚಿಕಿತ್ಸಾ ವಿವರಗಳ ಪೇಜ್‌ಗೆ ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ:",
        "nav_about": "MyCare ಯೋಜನೆ ಮತ್ತು ತಂಡದ ಬಗ್ಗೆ ತಿಳಿಯಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ:",
        "downloads": "ಪ್ರಾಜೆಕ್ಟ್ ರಿಪೋರ್ಟ್ ಮತ್ತು ಪ್ರೆಸೆಂಟೇಶನ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ:",
        "lung_pain": (
            "**ಶ್ವಾಸಕೋಶ ಮತ್ತು ಎದೆ ನೋವು ನಿವಾರಣೆಗೆ ಸಲಹೆಗಳು:**\n\n"
            "1. **Pursed-Lip Breathing:** ಮೂಗಿನಿಂದ 2 ಸೆಕೆಂಡ್ ಉಸಿರೆಳೆದು ತುಟಿ ದುಂಡಗೆ ಮಾಡಿ 4 ಸೆಕೆಂಡ್ ನಿಧಾನವಾಗಿ ಬಿಡಿ.\n"
            "2. **ಉತ್ತಮ ಭಂಗಿ:** 30-45 ಡಿಗ್ರಿ ಎತ್ತರಕ್ಕೆ ತಲೆ ಇಟ್ಟು ಕುಳಿತುಕೊಳ್ಳಿ.\n"
            "3. **ಬಿಸಿ ಹಬೆ:** ಬಿಸಿ ನೀರಿನ ಹಬೆ ತೆಗೆದುಕೊಳ್ಳಿ.\n"
            "4. **ಬಿಸಿ ಪಾನೀಯ:** ಶುಂಠಿ ಮತ್ತು ಜೇನುತುಪ್ಪದ ನೀರು ಕುಡಿಯಿರಿ.\n"
            "5. *ಎಚ್ಚರಿಕೆ:* ನೋವು ತೀವ್ರವಾಗಿದ್ದರೆ ತಕ್ಷಣ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ."
        ),
        "breathing_exercises": "ಹೊಟ್ಟೆಯ ಉಸಿರಾಟ (Diaphragmatic), 4-7-8 ವ್ಯಾಯಾಮ ಮತ್ತು ಅನುಲೋಮ-ವಿಲೋಮ ಪ್ರಾಣಾಯಾಮ ಮಾಡಿ.",
        "diet_foods": "ಅರಿಶಿನ, ಶುಂಠಿ, ಹಸಿರು ತರಕಾರಿಗಳು, ನೆಲ್ಲಿಕಾಯಿ ಮತ್ತು ಒಣ ಹಣ್ಣುಗಳನ್ನು ಸೇವಿಸಿ.",
        "cough_relief": "ಶುಂಠಿ ಮತ್ತು ಜೇನುತುಪ್ಪ ಸೇವಿಸಿ, ಉಪ್ಪು ನೀರಿನಿಂದ ಗಂಟಲು ಮುಕ್ಕಳಿಸಿ.",
        "symptoms": "3 ವಾರಕ್ಕಿಂತ ಹೆಚ್ಚು ಕೆಮ್ಮು, ರಕ್ತ ಬೀಳುವುದು, ಎದೆ ನೋವು, ಉಸಿರಾಟದ ತೊಂದರೆ ಮತ್ತು ತೂಕ ಇಳಿಕೆ.",
        "benign": "ಬೆನೈನ್ (Benign) ಗಡ್ಡೆ: ಇದು ಕ್ಯಾನ್ಸರ್‌ರಹಿತ ಗಡ್ಡೆಯಾಗಿದ್ದು ದೇಹದ ಇತರ ಅಂಗಗಳಿಗೆ ಹರಡುವುದಿಲ್ಲ.",
        "malignant": "ಮಾಲಿಗ್ನೆಂಟ್ (Malignant) ಕ್ಯಾನ್ಸರ್: ಇದು ತೀವ್ರವಾದ ಕ್ಯಾನ್ಸರ್ ಆಗಿದ್ದು ತಕ್ಷಣ ತಜ್ಞರ ಚಿಕಿತ್ಸೆ ಅಗತ್ಯ.",
        "normal": "ಸಾಮಾನ್ಯ (Normal) ಫಲಿತಾಂಶ: ಶ್ವಾಸಕೋಶದಲ್ಲಿ ಯಾವುದೇ ಅಸಹಜ ಗಡ್ಡೆಗಳಿಲ್ಲ.",
        "treatment": "ಚಿಕಿತ್ಸಾ ವಿಧಾನಗಳು: ಸರ್ಜರಿ (VATS), ರೇಡಿಯೇಷನ್, ಕಿಮೊಥೆರಪಿ ಮತ್ತು ಇಮ್ಯುನೊಥೆರಪಿ.",
        "prevention": "ಧೂಮಪಾನ ತ್ಯಜಿಸಿ, ಮಾಸ್ಕ್ ಧರಿಸಿ ಮತ್ತು ನಿತ್ಯ ಪ್ರಾಣಾಯಾಮ ಮಾಡಿ.",
        "how_it_works": "MyCare ResNet-18 ಡೀಪ್ ಲರ್ನಿಂಗ್ ಮೂಲಕ ಸ್ಕ್ಯಾನ್ ಪರಿಶೀಲಿಸುತ್ತದೆ (99.4% ನಿಖರತೆ).",
        "fleischner": "ಫ್ಲೈಶ್ನರ್ ಮಾರ್ಗಸೂಚಿ: ಗಡ್ಡೆಯ ಗಾತ್ರಕ್ಕೆ ತಕ್ಕಂತೆ 3 ರಿಂದ 12 ತಿಂಗಳಲ್ಲಿ ಮರು-ತಪಾಸಣೆ.",
        "about_creators": "ರೂಪಿಸಿದವರು: ಎನ್‌ಎಂಎಎಂಐಟಿ ನಿಟ್ಟೆಯ ವಿದ್ಯಾರ್ಥಿಗಳಾದ ವಿನೀತ್‌ರಾಮ್, ವಿನೀತ್ ವಿ ದೇವಾಡಿಗ, ತೇಜಸ್ ಎನ್ ಮತ್ತು ವಿಷ್ಣು ಕೆ.",
        "disclaimer": "ವೈದ್ಯಕೀಯ ಹಕ್ಕುತ್ಯಾಗ: ಇದು ಶಿಕ್ಷಣ ಮತ್ತು ಪ್ರಾಥಮಿಕ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮಾತ್ರ.",
        "default": "ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ! ನೀವು ಸ್ಕ್ಯಾನ್ ಪೇಜ್‌ಗೆ ಹೋಗಲು ಅಥವಾ ವೆಬ್‌ಸೈಟ್ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು."
    }
}

SUGGESTIONS = {
    "en": [
        "How do I use this website?",
        "Take me to Scan Upload page",
        "How to improve lung pain?",
        "Show my scan history",
        "Download Project Report"
    ],
    "hi": [
        "इस वेबसाइट का उपयोग कैसे करें?",
        "मुझे स्कैन अपलोड पेज पर ले चलो",
        "फेफड़ों के दर्द में क्या करें?",
        "मेरी पुरानी स्कैन हिस्ट्री दिखाओ",
        "प्रोजेक्ट रिपोर्ट डाउनलोड करें"
    ],
    "kn": [
        "ಈ ವೆಬ್‌ಸೈಟ್ ಹೇಗೆ ಬಳಸಬೇಕು?",
        "ನನ್ನನ್ನು ಸ್ಕ್ಯಾನ್ ಪೇಜ್‌ಗೆ ಕರೆದೊಯ್ಯಿರಿ",
        "ಶ್ವಾಸಕೋಶದ ನೋವಿಗೆ ಪರಿಹಾರವೇನು?",
        "ನನ್ನ ಹಳೆಯ ಸ್ಕ್ಯಾನ್ ಹಿಸ್ಟರಿ ತೋರಿಸಿ",
        "ಪ್ರಾಜೆಕ್ಟ್ ರಿಪೋರ್ಟ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ"
    ]
}


def detect_language(text: str, user_selected_lang: str = "en") -> str:
    """Detects if text is Kannada, Hindi, or English."""
    if re.search(r'[\u0C80-\u0CFF]', text):
        return "kn"
    if re.search(r'[\u0900-\u097F]', text):
        return "hi"
    
    text_lower = text.lower()
    hindi_keywords = ["namaste", "lakshan", "upchar", "ilaaj", "gath", "kya hai", "kaise", "sujhav", "dawa", "khemo", "dard", "khasi", "le chalo", "dikhao", "batao"]
    kannada_keywords = ["namaskara", "lakshanagalu", "chikitse", "gadde", "enidhu", "hege", "saluhe", "houshadhi", "kannada", "ede novu", "hege maadodu", "thorisi", "karedoyyiri"]
    
    if any(k in text_lower for k in kannada_keywords):
        return "kn"
    if any(k in text_lower for k in hindi_keywords):
        return "hi"
        
    return user_selected_lang if user_selected_lang in ["hi", "kn"] else "en"


def match_intent_and_actions(text: str, lang: str):
    """Identifies the conversational intent and attaches interactive UI navigation buttons."""
    t = text.lower()
    actions: List[ActionButton] = []
    
    # 1. Direct Redirection / Navigation Requests
    if any(w in t for w in ["upload", "analyze", "scan page", "test scan", "upload scan", "scan photo", "check scan", "take me to upload", "direct to scan", "scan upload", "le chalo scan", "upload page", "karedoyyiri scan"]):
        actions.append(ActionButton(label="🚀 Go to Scan Upload Page", url="/analyze", icon="scan"))
        actions.append(ActionButton(label="📜 View Scan History", url="/history", icon="clock"))
        return "nav_analyze", actions

    if any(w in t for w in ["history", "past scan", "my scan", "records", "previous scan", "itihas", "purana scan", "history dikhao", "scan history", "thorisi history"]):
        actions.append(ActionButton(label="📜 View Scan History", url="/history", icon="clock"))
        actions.append(ActionButton(label="🚀 New Scan Analysis", url="/analyze", icon="scan"))
        return "nav_history", actions

    if any(w in t for w in ["guideline", "care pathway", "fleischner", "guidance", "recommendation page", "margasuchi"]):
        actions.append(ActionButton(label="📖 Read Fleischner Guidelines", url="/guidance", icon="book-open"))
        actions.append(ActionButton(label="🚀 Start Scan Analysis", url="/analyze", icon="scan"))
        return "nav_guidance", actions

    if any(w in t for w in ["about", "who built", "developers", "creators", "team", "project details", "about page", "kiske bare me"]):
        actions.append(ActionButton(label="ℹ️ About MyCare Project", url="/about", icon="info"))
        actions.append(ActionButton(label="🚀 Try Scan Tool", url="/analyze", icon="scan"))
        return "nav_about", actions

    if any(w in t for w in ["news", "article", "research", "discovery", "breakthrough", "pulmonews", "samachar", "latest news", "news page", "varthae"]):
        actions.append(ActionButton(label="📰 View PulmoNews Hub", url="/news", icon="newspaper"))
        actions.append(ActionButton(label="🚀 Try Scan Tool", url="/analyze", icon="scan"))
        return "nav_news", actions

    if any(w in t for w in ["download", "report download", "paper template", "word file", "docx", "presentation", "pptx", "download report", "download paper"]):
        actions.append(ActionButton(label="📄 Download Major Project Report (.docx)", url="http://localhost:8080/MyCare_Complete_Major_Project_Report.docx", icon="download"))
        actions.append(ActionButton(label="📜 Download Full Research Paper (.docx)", url="http://localhost:8080/MyCare_Full_Paper_Conference_Template.docx", icon="download"))
        actions.append(ActionButton(label="📊 Download 20-Slide Presentation (.pptx)", url="http://localhost:8080/MyCare_Lung_Cancer_Detection_20_Slides.pptx", icon="download"))
        return "downloads", actions

    # 2. How to use / Don't understand website
    if any(w in t for w in [
        "how to use", "how do i use", "explain website", "dont understand", "don't understand", "what is this website", 
        "how does this work", "help me use", "website guide", "tutorial", "kaise use kare", "website samjhao", 
        "samajh nahi aaya", "hege balasukollodu", "artha aaglilla", "vivarisi"
    ]):
        actions.append(ActionButton(label="🚀 Try 1-Click Scan Test", url="/analyze", icon="play"))
        actions.append(ActionButton(label="📖 View Clinical Guidance", url="/guidance", icon="book-open"))
        actions.append(ActionButton(label="ℹ️ About the Project", url="/about", icon="info"))
        return "explain_website", actions

    # 3. How are you / pleasantries
    if any(w in t for w in ["how r u", "how are you", "how r you", "how do you do", "hows it going", "how is it going", "aap kaise ho", "kaise ho", "hegidhdhira", "hegiddira", "hegidiya", "you doing"]):
        actions.append(ActionButton(label="🔬 Upload a Scan", url="/analyze", icon="scan"))
        actions.append(ActionButton(label="💡 How to relieve lung pain?", url="/chat", icon="heart"))
        return "how_are_you", actions

    # 4. Lung pain / Chest pain / General pain & discomfort relief
    if any(w in t for w in [
        "pain", "feeling pain", "feel pain", "having pain", "have pain", "in pain", "got pain",
        "hurts", "hurting", "hurt", "ache", "aching", "sore", "soreness", "discomfort",
        "lung pain", "chest pain", "pain in lung", "pain in chest", "improve lung pain", "relieve pain", "cure pain", 
        "chest hurt", "lung hurt", "pain relief", "dard", "dard ho raha", "seene me dard", "fefrde me dard", "dard kam", "ede novu", 
        "novige parihara", "novu hege kammi", "shwasakosha novu", "novu"
    ]):
        actions.append(ActionButton(label="🫁 Breathing Exercises", url="/chat", icon="wind"))
        actions.append(ActionButton(label="🥗 Best Foods for Lungs", url="/chat", icon="apple"))
        actions.append(ActionButton(label="🚀 Check CT Scan", url="/analyze", icon="scan"))
        return "lung_pain", actions

    # 5. Breathing exercises
    if any(w in t for w in ["breathing exercise", "breath exercise", "lung capacity", "pranayama", "inhalation", "how to breathe", "saans lene ki exercise", "vyayam", "usirata vyayama"]):
        actions.append(ActionButton(label="💡 Tips to relieve lung pain", url="/chat", icon="heart"))
        return "breathing_exercises", actions

    # 6. Diet / Foods for lungs
    if any(w in t for w in ["food", "diet", "what to eat", "fruits", "nutrition", "aahar", "kya khaye", "kya khana chahiye", "aahara", "yava aahara", "tinabeku"]):
        actions.append(ActionButton(label="🫁 Breathing Exercises", url="/chat", icon="wind"))
        return "diet_foods", actions

    # 7. Cough relief
    if any(w in t for w in ["cough relief", "persistent cough", "cure cough", "khasi ka ilaj", "khasi kaise thik", "kemmu", "kemmininda"]):
        actions.append(ActionButton(label="🚀 Check CT Scan", url="/analyze", icon="scan"))
        return "cough_relief", actions

    # 8. Greetings
    if any(w in t for w in ["hi", "hello", "hey", "namaste", "namaskar", "namaskara", "namasthe", "good morning", "good afternoon", "help", "who are you"]):
        actions.append(ActionButton(label="🚀 Start Scan Analysis", url="/analyze", icon="scan"))
        actions.append(ActionButton(label="❓ How to use this website?", url="/chat", icon="help-circle"))
        return "greeting", actions
        
    # 9. Symptoms / Signs
    if any(w in t for w in ["symptom", "sign", "cough", "blood", "breath", "weight loss", "lakshan", "khasi", "khoon", "lakshanagalu", "kemmu", "raktha"]):
        actions.append(ActionButton(label="🚀 Test CT Scan Now", url="/analyze", icon="scan"))
        return "symptoms", actions
        
    # 10. Benign
    if any(w in t for w in ["benign", "nodule", "non-cancer", "non cancerous", "harmless", "saumya", "gath", "benine", "gadde", "sadharana"]):
        actions.append(ActionButton(label="📖 Fleischner Guidelines", url="/guidance", icon="book-open"))
        return "benign", actions
        
    # 11. Malignant
    if any(w in t for w in ["malignant", "cancerous", "adenocarcinoma", "carcinoma", "severe", "ghatak", "cancer", "maalignant", "tೀವ್ರ"]):
        actions.append(ActionButton(label="📖 View Care Pathways", url="/guidance", icon="book-open"))
        return "malignant", actions
        
    # 12. Normal
    if any(w in t for w in ["normal", "clear", "healthy", "safe", "negative", "samanya", "theek", "shuddha"]):
        return "normal", actions
        
    # 13. Treatments
    if any(w in t for w in ["treatment", "cure", "surgery", "chemo", "chemotherapy", "radiation", "immunotherapy", "lobectomy", "sbrt", "upchar", "ilaaj", "dawai", "chikitse", "shastrachikitse"]):
        actions.append(ActionButton(label="📖 View Clinical Pathways", url="/guidance", icon="book-open"))
        return "treatment", actions
        
    # 14. Prevention
    if any(w in t for w in ["prevent", "prevention", "lifestyle", "smoke", "smoking", "exercise", "bachav", "dhumpan", "thadegattuvike", "dhumapana"]):
        return "prevention", actions
        
    # 15. How MyCare works
    if any(w in t for w in ["how it works", "mycare", "resnet", "accuracy", "gradcam", "grad-cam", "model", "algorithm", "kaise kaam", "kelsa", "vidhana"]):
        actions.append(ActionButton(label="🚀 Try Live Scan", url="/analyze", icon="scan"))
        actions.append(ActionButton(label="ℹ️ Technical Details", url="/about", icon="info"))
    # 16. User activity / Where am I / What did I do
    if any(w in t for w in [
        "what did i do", "where am i", "what page", "which page", "my activity", "track what i did", 
        "session", "what have i done", "kaha hu", "kya kiya", "elli iddini", "yava page"
    ]):
        actions.append(ActionButton(label="🚀 Go to Scan Upload", url="/analyze", icon="scan"))
        actions.append(ActionButton(label="📜 View Scan History", url="/history", icon="history"))
        return "user_activity", actions

    # Default
    actions.append(ActionButton(label="🚀 Go to Scan Upload", url="/analyze", icon="scan"))
    actions.append(ActionButton(label="❓ How to use website?", url="/chat", icon="help-circle"))
    return "default", actions


# ---------------------------------------------------------------------------
# API Route
# ---------------------------------------------------------------------------
@router.post("/chat", response_model=ChatResponse, summary="Multilingual AI Assistant & Navigator Chatbot")
async def chat_endpoint(request: ChatRequest):
    """
    Multilingual voice & text chat endpoint supporting English, Hindi, and Kannada
    with direct website navigation action buttons, Siri voice support, and dynamic activity tracking.
    """
    user_msg = request.message.strip()
    if not user_msg:
        lang = request.language if request.language in ["hi", "kn", "en"] else "en"
        return ChatResponse(
            reply=KNOWLEDGE_BASE[lang]["greeting"],
            language=lang,
            detected_language=lang,
            suggestions=SUGGESTIONS[lang],
            action_buttons=[
                ActionButton(label="🚀 Go to Scan Upload", url="/analyze", icon="scan"),
                ActionButton(label="❓ How to use this website?", url="/chat", icon="help-circle")
            ]
        )

    # Detect language
    lang = detect_language(user_msg, request.language)
    if lang not in KNOWLEDGE_BASE:
        lang = "en"
        
    intent, action_buttons = match_intent_and_actions(user_msg, lang)
    reply_text = KNOWLEDGE_BASE[lang].get(intent, KNOWLEDGE_BASE[lang]["default"])
    
    # Context-aware activity enhancement
    if intent == "user_activity" and request.page_context:
        reply_text = f"📍 **Here is what I've tracked during your session:**\n\n{request.page_context}\n\nFeel free to ask me to take you to any page or analyze a CT scan!"
    elif request.page_context and intent == "default":
        # Check if page-specific tip makes sense
        if "analyze" in request.page_context.lower():
            reply_text += "\n\n💡 *Tip: Since you're on the Scan Upload page, you can drag and drop a CT scan or test our 1-click sample scans.*"
        elif "results" in request.page_context.lower():
            reply_text += "\n\n💡 *Tip: You're viewing your scan results. You can download a PDF summary report or check the Grad-CAM heatmap.*"

    # If scan result context was provided
    if request.context and intent == "default":
        ctx_lower = request.context.lower()
        if "benign" in ctx_lower:
            reply_text += f"\n\n*(Note for your current scan: {KNOWLEDGE_BASE[lang]['benign']})*"
        elif "malignant" in ctx_lower:
            reply_text += f"\n\n*(Note for your current scan: {KNOWLEDGE_BASE[lang]['malignant']})*"
        elif "normal" in ctx_lower:
            reply_text += f"\n\n*(Note for your current scan: {KNOWLEDGE_BASE[lang]['normal']})*"

    return ChatResponse(
        reply=reply_text,
        language=lang,
        detected_language=lang,
        suggestions=SUGGESTIONS[lang],
        action_buttons=action_buttons if action_buttons else None
    )


# ---------------------------------------------------------------------------
# Helper: Split Text into Natural Spoken Sentences for Low-Latency Streaming
# ---------------------------------------------------------------------------
def split_into_spoken_sentences(text: str) -> List[str]:
    """
    Splits markdown / structured medical text into clean, natural spoken sentences.
    Preserves meaning while removing markdown symbols (**, #, etc.) for TTS clarity.
    """
    # Remove markdown headers and bolding
    cleaned = re.sub(r'[*#_`~]', '', text)
    # Remove markdown bullet points at line starts
    cleaned = re.sub(r'^\s*[-•]\s*', '', cleaned, flags=re.MULTILINE)
    # Remove markdown links [text](url) -> text
    cleaned = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', cleaned)
    
    # Split by sentence terminators or bullet points / newlines
    raw_sentences = re.split(r'(?<=[.!?:\n])\s+', cleaned)
    sentences = []
    for s in raw_sentences:
        s_clean = s.strip()
        if s_clean and len(s_clean) > 1:
            sentences.append(s_clean)
    
    return sentences if sentences else [text.strip()]


# ---------------------------------------------------------------------------
# Real-Time Voice WebSocket Endpoint (/api/ws/voice)
# ---------------------------------------------------------------------------
@router.websocket("/ws/voice")
async def voice_call_websocket(websocket: WebSocket):
    """
    Real-Time Full-Duplex Voice Call WebSocket.
    
    Handles:
    - Zero-push-to-talk streaming audio conversation
    - Spoken natural greeting on call start
    - Fast sentence-by-sentence streaming for instant TTS playback
    - Barge-in / user interruption handling (cancelling in-flight generation)
    - Full activity context and multilingual support
    """
    await websocket.accept()
    logger.info("Voice Call WebSocket connection established.")
    
    active_stream_task: Optional[asyncio.Task] = None
    
    async def process_user_utterance(user_text: str, lang_req: str, page_ctx: Optional[str] = None, scan_ctx: Optional[str] = None):
        nonlocal websocket
        try:
            # 1. State: Thinking
            await websocket.send_json({
                "type": "ai_state",
                "state": "thinking",
            })
            
            # Small realistic latency buffer (10-50ms)
            await asyncio.sleep(0.04)
            
            # Detect language
            lang = detect_language(user_text, lang_req)
            if lang not in KNOWLEDGE_BASE:
                lang = "en"
                
            intent, action_buttons = match_intent_and_actions(user_text, lang)
            reply_text = KNOWLEDGE_BASE[lang].get(intent, KNOWLEDGE_BASE[lang]["default"])
            
            # Dynamic Context
            if intent == "user_activity" and page_ctx:
                reply_text = f"📍 Here is what I've tracked during your session:\n\n{page_ctx}\n\nFeel free to ask me to take you to any page or analyze a CT scan!"
            elif page_ctx and intent == "default":
                if "analyze" in page_ctx.lower():
                    reply_text += "\n\nTip: Since you're on the Scan Upload page, you can test our 1-click sample scans."
                elif "results" in page_ctx.lower():
                    reply_text += "\n\nTip: You're viewing your scan results. You can download a PDF summary report or check the Grad-CAM heatmap."
            
            if scan_ctx and intent == "default":
                ctx_lower = scan_ctx.lower()
                if "benign" in ctx_lower:
                    reply_text += f"\n\n(Note for your current scan: {KNOWLEDGE_BASE[lang]['benign']})"
                elif "malignant" in ctx_lower:
                    reply_text += f"\n\n(Note for your current scan: {KNOWLEDGE_BASE[lang]['malignant']})"
                elif "normal" in ctx_lower:
                    reply_text += f"\n\n(Note for your current scan: {KNOWLEDGE_BASE[lang]['normal']})"

            # Split into spoken sentences for low-latency streaming
            sentences = split_into_spoken_sentences(reply_text)
            
            # 2. State: Speaking
            await websocket.send_json({
                "type": "ai_state",
                "state": "speaking",
                "total_sentences": len(sentences),
            })
            
            # Stream sentences one-by-one
            accumulated_text = ""
            for idx, sentence in enumerate(sentences):
                accumulated_text += (" " if accumulated_text else "") + sentence
                is_last = (idx == len(sentences) - 1)
                
                await websocket.send_json({
                    "type": "ai_sentence_stream",
                    "index": idx,
                    "sentence": sentence,
                    "is_final_sentence": is_last,
                    "accumulated_text": accumulated_text,
                    "language": lang,
                })
                # Yield control briefly
                await asyncio.sleep(0.01)

            # Convert action buttons to dict format
            formatted_actions = [
                {"label": btn.label, "url": btn.url, "icon": btn.icon}
                for btn in (action_buttons or [])
            ]
            
            # 3. Stream completed
            await websocket.send_json({
                "type": "ai_stream_end",
                "full_text": reply_text,
                "language": lang,
                "action_buttons": formatted_actions,
                "suggestions": SUGGESTIONS.get(lang, SUGGESTIONS["en"]),
            })
            
        except asyncio.CancelledError:
            logger.info("Voice stream task was cancelled due to user barge-in / interruption.")
            await websocket.send_json({
                "type": "ai_interrupted",
                "message": "AI speech interrupted by user.",
            })
        except Exception as e:
            logger.error(f"Error processing voice utterance: {e}", exc_info=True)
            await websocket.send_json({
                "type": "error",
                "message": "Failed to process speech query.",
            })

    try:
        while True:
            raw_msg = await websocket.receive_text()
            data = json.loads(raw_msg)
            msg_type = data.get("type", "")
            
            # 1. Start Call -> Send Welcome Greeting & Start Listening
            if msg_type == "start_call":
                lang = data.get("language", "en")
                greetings = {
                    "en": "Hello! I am your MyCare AI assistant. I am listening, how can I help you today?",
                    "hi": "नमस्ते! मैं आपका मायकेयर एआई असिस्टेंट हूँ। मैं सुन रहा हूँ, बताइए मैं आपकी क्या मदद कर सकता हूँ?",
                    "kn": "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಮೈಕೇರ್ ಎಐ ಸಹಾಯಕ. ನಾನು ಕೇಳುತ್ತಿದ್ದೇನೆ, ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
                }
                greet_text = greetings.get(lang, greetings["en"])
                
                await websocket.send_json({
                    "type": "call_connected",
                    "greeting": greet_text,
                    "language": lang,
                })
                
                # Stream greeting sentence
                await websocket.send_json({
                    "type": "ai_sentence_stream",
                    "index": 0,
                    "sentence": greet_text,
                    "is_final_sentence": True,
                    "accumulated_text": greet_text,
                    "language": lang,
                    "is_greeting": True,
                })
                
                await websocket.send_json({
                    "type": "ai_stream_end",
                    "full_text": greet_text,
                    "language": lang,
                    "is_greeting": True,
                })
            
            # 2. User Final Speech (Silence Debounce or STT Final)
            elif msg_type == "user_speech_final":
                user_text = data.get("text", "").strip()
                lang = data.get("language", "en")
                page_ctx = data.get("page_context")
                scan_ctx = data.get("context")
                
                if user_text:
                    # Cancel any prior active generation task
                    if active_stream_task and not active_stream_task.done():
                        active_stream_task.cancel()
                        
                    active_stream_task = asyncio.create_task(
                        process_user_utterance(user_text, lang, page_ctx, scan_ctx)
                    )
            
            # 3. User Barge-In (Interruption Detected while AI is speaking)
            elif msg_type == "barge_in":
                logger.info("Barge-in received: aborting AI speech stream immediately.")
                if active_stream_task and not active_stream_task.done():
                    active_stream_task.cancel()
                    
                await websocket.send_json({
                    "type": "ai_state",
                    "state": "listening",
                })
                
            # 4. User Speech Interim (Live transcript preview)
            elif msg_type == "user_speech_interim":
                # Acknowledge or reflect state if needed
                pass
                
            # 5. Ping / Keepalive
            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})
                
            # 6. End Call
            elif msg_type == "end_call":
                if active_stream_task and not active_stream_task.done():
                    active_stream_task.cancel()
                await websocket.send_json({"type": "call_ended"})
                break
                
    except WebSocketDisconnect:
        logger.info("Voice Call WebSocket disconnected.")
        if active_stream_task and not active_stream_task.done():
            active_stream_task.cancel()
    except Exception as e:
        logger.error(f"WebSocket voice loop error: {e}", exc_info=True)
        if active_stream_task and not active_stream_task.done():
            active_stream_task.cancel()


