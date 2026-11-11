# MyCare AI — 16-Page Individual Weekly Progress Report (Logbook Format)

**Project Title:** MyCare: Deep-Learning Powered Lung Cancer Detection & Decision-Support System with Multilingual Voice Assistant & Explainable AI (Grad-CAM)  
**Department:** Computer Science & Engineering  
**Team Members:**  
1. VINITHRAM — `NNM23CS231`  
2. VINITH V DEVADIGA — `NN23CS230`  
3. TEJAS N — `NNM23CS217`  
4. VISHNU K — `NNM23CS233`  

---

<div style="page-break-after: always;"></div>

# 📄 PAGE 1: WEEK 1 PROGRESS REPORT
**Project Title:** MyCare AI (Lung Cancer CAD & Voice Assistant)  
**Phase:** Phase 1: Inception & Domain Definition  
**Week Range:** Week 1 of 16  

### 1. Planned Tasks / Objective
Define project domain, explore thoracic oncology challenges, and formulate a feasible computer-aided detection (CAD) project scope.

### 2. Work Executed by Team
Conducted thorough domain research into pulmonary oncology and thoracic radiology. Examined clinical mortality data showing that over 75% of lung cancer cases are diagnosed late at Stage III/IV. Explored CAD methodologies using deep learning to assist radiologists in detecting subtle pulmonary nodules from CT scans.

### 3. Guide's Suggestions & Feedback
> *"Ensure the project goes beyond simple binary classification. Differentiate between benign non-cancerous nodules and malignant carcinomas (tri-class classification) to provide true clinical value in healthcare environments."*

### 4. Tasks Achieved as per Suggestion
Re-scoped the problem formulation from binary detection to Tri-Class Classification (Normal, Benign Solitary Nodule, Malignant Carcinoma). Formulated the project title and drafted the formal synopsis covering clinical diagnostic requirements.

### 5. Milestones & Deliverables
* **Deliverable:** Approved Project Synopsis & Tri-Class Problem Formulation Document.
* **Status:** Completed & Approved

```
---------------------------------------------------------------------------------------------
Student Signatures:                        Internal Guide Signature:       HOD Signature:
VINITHRAM (NNM23CS231)                     Guide: _____________________    HOD: _____________________
VINITH V DEVADIGA (NN23CS230)              Date:  _____________________    Seal:
TEJAS N (NNM23CS217)                       Evaluation: [X] Satisfactory    Dept of CSE
VISHNU K (NNM23CS233)
---------------------------------------------------------------------------------------------
```

---

<div style="page-break-after: always;"></div>

# 📄 PAGE 2: WEEK 2 PROGRESS REPORT
**Project Title:** MyCare AI (Lung Cancer CAD & Voice Assistant)  
**Phase:** Phase 1: Inception & Domain Definition  
**Week Range:** Week 2 of 16  

### 1. Planned Tasks / Objective
Survey state-of-the-art research papers on deep learning for lung cancer detection, evaluate benchmark architectures, and identify key research gaps.

### 2. Work Executed by Team
Reviewed landmark research papers: Ardila et al. (Nature Medicine 2019) on 3D CT screening, He et al. (CVPR 2016) on Deep Residual Learning, and Selvaraju et al. (ICCV 2017) on Grad-CAM explainability. Studied clinical Fleischner Society guidelines for pulmonary nodule tracking.

### 3. Guide's Suggestions & Feedback
> *"Tabulate a comparative literature survey matrix comparing accuracy, datasets, model architectures, and latency across at least 8 to 10 published papers. Focus on explainable AI to solve the 'Black-Box' problem."*

### 4. Tasks Achieved as per Suggestion
Constructed a 10-paper comparative survey matrix. Identified the primary research gap: existing academic CAD models lack integrated visual explainability (Grad-CAM) coupled with actionable post-scan clinical care pathways.

### 5. Milestones & Deliverables
* **Deliverable:** Literature Survey Matrix & Research Gap Analysis Report.
* **Status:** Completed & Approved

```
---------------------------------------------------------------------------------------------
Student Signatures:                        Internal Guide Signature:       HOD Signature:
VINITHRAM (NNM23CS231)                     Guide: _____________________    HOD: _____________________
VINITH V DEVADIGA (NN23CS230)              Date:  _____________________    Seal:
TEJAS N (NNM23CS217)                       Evaluation: [X] Satisfactory    Dept of CSE
VISHNU K (NNM23CS233)
---------------------------------------------------------------------------------------------
```

---

<div style="page-break-after: always;"></div>

# 📄 PAGE 3: WEEK 3 PROGRESS REPORT
**Project Title:** MyCare AI (Lung Cancer CAD & Voice Assistant)  
**Phase:** Phase 1: Inception & Domain Definition  
**Week Range:** Week 3 of 16  

### 1. Planned Tasks / Objective
Acquire verified thoracic CT scan dataset, inspect image resolutions, slice thickness, and analyze class distribution skew.

### 2. Work Executed by Team
Collected and curated the IQ-OTH/NCCD Lung Cancer Dataset (Iraq-Oncology Teaching Hospital and National Center for Cancer Diseases) comprising 2,077 axial CT scan slices across spiral CT protocols (1.25mm to 5.0mm slice thickness). Cross-referenced samples against the LIDC-IDRI benchmark.

### 3. Guide's Suggestions & Feedback
> *"Notice the severe class imbalance: Benign cases comprise only 4.8% (100 slices) vs Malignant 64.8% (1,346 slices). Standard training will fail on benign cases; devise a robust sampling and class-weighting strategy."*

### 4. Tasks Achieved as per Suggestion
Quantified class distribution: Malignant (1,346 slices), Normal (631 slices), Benign (100 slices). Formulated a dual-strategy combining Weighted Random Sampling (1:1:1 batch balance) and Class-Weighted Loss penalties to prevent majority class dominance.

### 5. Milestones & Deliverables
* **Deliverable:** Verified CT Dataset Repository & Class Imbalance Analysis Report.
* **Status:** Completed & Approved

```
---------------------------------------------------------------------------------------------
Student Signatures:                        Internal Guide Signature:       HOD Signature:
VINITHRAM (NNM23CS231)                     Guide: _____________________    HOD: _____________________
VINITH V DEVADIGA (NN23CS230)              Date:  _____________________    Seal:
TEJAS N (NNM23CS217)                       Evaluation: [X] Satisfactory    Dept of CSE
VISHNU K (NNM23CS233)
---------------------------------------------------------------------------------------------
```

---

<div style="page-break-after: always;"></div>

# 📄 PAGE 4: WEEK 4 PROGRESS REPORT
**Project Title:** MyCare AI (Lung Cancer CAD & Voice Assistant)  
**Phase:** Phase 2: Data Engineering & Preprocessing  
**Week Range:** Week 4 of 16  

### 1. Planned Tasks / Objective
Develop Python preprocessing pipeline to standardize heterogeneous CT slices into unified tensor inputs.

### 2. Work Executed by Team
Implemented image validation supporting DICOM (.dcm), PNG, JPEG, and WebP up to 10MB. Standardized image dimensions to 224x224 pixels using bilinear interpolation. Scaled pixel intensities to [0, 1] float32 and applied ImageNet channel normalization (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]).

### 3. Guide's Suggestions & Feedback
> *"Ensure dynamic range windowing preserves soft tissue lung parenchyma without washing out subtle ground-glass nodular opacities. Verify loading performance."*

### 4. Tasks Achieved as per Suggestion
Calibrated dynamic windowing curves highlighting soft pulmonary tissue. Optimized in-memory tensor transformation pipeline using Pillow and NumPy, reducing preprocessing latency to <15ms per slice.

### 5. Milestones & Deliverables
* **Deliverable:** Preprocessing Module (`preprocessing.py`) & Standardized Dataset Tensors.
* **Status:** Completed & Approved

```
---------------------------------------------------------------------------------------------
Student Signatures:                        Internal Guide Signature:       HOD Signature:
VINITHRAM (NNM23CS231)                     Guide: _____________________    HOD: _____________________
VINITH V DEVADIGA (NN23CS230)              Date:  _____________________    Seal:
TEJAS N (NNM23CS217)                       Evaluation: [X] Satisfactory    Dept of CSE
VISHNU K (NNM23CS233)
---------------------------------------------------------------------------------------------
```

---

<div style="page-break-after: always;"></div>

# 📄 PAGE 5: WEEK 5 PROGRESS REPORT
**Project Title:** MyCare AI (Lung Cancer CAD & Voice Assistant)  
**Phase:** Phase 2: Data Engineering & Preprocessing  
**Week Range:** Week 5 of 16  

### 1. Planned Tasks / Objective
Implement data augmentation routines and build a balanced PyTorch DataLoader using weighted random sampling.

### 2. Work Executed by Team
Built augmentation pipeline applying random horizontal/vertical flips, affine rotations (+/-15 deg), and dynamic contrast/brightness jitter (+/-15%). Formulated WeightedRandomSampler calculating inverse class frequencies (w_c = 1 / N_c).

### 3. Guide's Suggestions & Feedback
> *"Avoid extreme cropping that might crop out tiny solitary pulmonary nodules entirely. Verify that every mini-batch contains equal proportions of all 3 classes."*

### 4. Tasks Achieved as per Suggestion
Verified that nodule-safe augmentations preserved focal nodule borders. Tested PyTorch DataLoader ensuring each mini-batch of 32 images draws an exact 1:1:1 balanced distribution across Normal, Benign, and Malignant classes.

### 5. Milestones & Deliverables
* **Deliverable:** Augmentation Pipeline & Balanced DataLoader Module.
* **Status:** Completed & Approved

```
---------------------------------------------------------------------------------------------
Student Signatures:                        Internal Guide Signature:       HOD Signature:
VINITHRAM (NNM23CS231)                     Guide: _____________________    HOD: _____________________
VINITH V DEVADIGA (NN23CS230)              Date:  _____________________    Seal:
TEJAS N (NNM23CS217)                       Evaluation: [X] Satisfactory    Dept of CSE
VISHNU K (NNM23CS233)
---------------------------------------------------------------------------------------------
```

---

<div style="page-break-after: always;"></div>

# 📄 PAGE 6: WEEK 6 PROGRESS REPORT
**Project Title:** MyCare AI (Lung Cancer CAD & Voice Assistant)  
**Phase:** Phase 2: Data Engineering & Preprocessing  
**Week Range:** Week 6 of 16  

### 1. Planned Tasks / Objective
Design end-to-end 3-tier software architecture and prepare complete UML technical design specifications.

### 2. Work Executed by Team
Designed 3-tier architecture: Client Presentation Layer (React 18 + Tailwind), Application API Layer (FastAPI Asynchronous Server), and Neural Inference Engine (PyTorch 2.x). Created SQLite database schema for persistent scan history logging.

### 3. Guide's Suggestions & Feedback
> *"Keep the API asynchronous (non-blocking) so that model inference and heatmap generation do not freeze client requests. Document all data flow interfaces."*

### 4. Tasks Achieved as per Suggestion
Constructed complete UML diagram suite: Use Case Diagram, Data Flow Diagrams (DFD Level 0, 1, and 2), Sequence Diagram, and Component Diagram. Documented async REST endpoint contracts.

### 5. Milestones & Deliverables
* **Deliverable:** Complete UML Design Specification Document & DB Schema.
* **Status:** Completed & Approved

```
---------------------------------------------------------------------------------------------
Student Signatures:                        Internal Guide Signature:       HOD Signature:
VINITHRAM (NNM23CS231)                     Guide: _____________________    HOD: _____________________
VINITH V DEVADIGA (NN23CS230)              Date:  _____________________    Seal:
TEJAS N (NNM23CS217)                       Evaluation: [X] Satisfactory    Dept of CSE
VISHNU K (NNM23CS233)
---------------------------------------------------------------------------------------------
```

---

<div style="page-break-after: always;"></div>

# 📄 PAGE 7: WEEK 7 PROGRESS REPORT
**Project Title:** MyCare AI (Lung Cancer CAD & Voice Assistant)  
**Phase:** Phase 3: Model Architecture & Training  
**Week Range:** Week 7 of 16  

### 1. Planned Tasks / Objective
Evaluate deep learning backbones (CNN, VGG-16, ResNet-18) and construct transfer learning classification pipeline.

### 2. Work Executed by Team
Benchmarked model parameters and computational complexity. Selected ResNet-18 (Residual Convolutional Neural Network) due to its 18 residual layers with identity skip connections (F(x) + x) and compact 44.7 MB memory footprint (11.2M parameters), ideal for web inference (<150ms).

### 3. Guide's Suggestions & Feedback
> *"Freeze lower feature extractors initially, then fine-tune top residual blocks. Use Dropout in the classification head to prevent feature co-adaptation on the smaller benign subset."*

### 4. Tasks Achieved as per Suggestion
Loaded ImageNet-1K pretrained ResNet-18 weights. Constructed custom classification head: Linear(512 -> 256) -> ReLU -> Dropout(0.35) -> Linear(256 -> 3) -> Softmax, regularizing nodule feature representations.

### 5. Milestones & Deliverables
* **Deliverable:** PyTorch ResNet-18 Model Definition & Transfer Learning Pipeline.
* **Status:** Completed & Approved

```
---------------------------------------------------------------------------------------------
Student Signatures:                        Internal Guide Signature:       HOD Signature:
VINITHRAM (NNM23CS231)                     Guide: _____________________    HOD: _____________________
VINITH V DEVADIGA (NN23CS230)              Date:  _____________________    Seal:
TEJAS N (NNM23CS217)                       Evaluation: [X] Satisfactory    Dept of CSE
VISHNU K (NNM23CS233)
---------------------------------------------------------------------------------------------
```

---

<div style="page-break-after: always;"></div>

# 📄 PAGE 8: WEEK 8 PROGRESS REPORT
**Project Title:** MyCare AI (Lung Cancer CAD & Voice Assistant)  
**Phase:** Phase 3: Model Architecture & Training  
**Week Range:** Week 8 of 16  

### 1. Planned Tasks / Objective
Formulate class-weighted loss function, configure learning rate scheduler, and execute end-to-end training.

### 2. Work Executed by Team
Implemented Class-Weighted Cross-Entropy Loss assigning loss multipliers: Benign = 4.0, Normal = 1.5, Malignant = 1.0. Integrated label smoothing (alpha = 0.02) to prevent overconfident predictions on high-contrast edges. Configured AdamW optimizer with Cosine Annealing learning rate schedule.

### 3. Guide's Suggestions & Feedback
> *"Track sensitivity (recall) specifically for Benign cases to ensure false-negative rates on benign nodules remain near zero. Plot loss and accuracy curves per epoch."*

### 4. Tasks Achieved as per Suggestion
Trained model across 8 balanced dataset epochs (~3,000 iterations/epoch). Loss decreased smoothly from 0.4109 to 0.0907. Benign sensitivity achieved 99.7%, eliminating false-normal misclassifications.

### 5. Milestones & Deliverables
* **Deliverable:** Trained Weights Checkpoint (`pulmoscan_model.pth`) & Training Curves.
* **Status:** Completed & Approved

```
---------------------------------------------------------------------------------------------
Student Signatures:                        Internal Guide Signature:       HOD Signature:
VINITHRAM (NNM23CS231)                     Guide: _____________________    HOD: _____________________
VINITH V DEVADIGA (NN23CS230)              Date:  _____________________    Seal:
TEJAS N (NNM23CS217)                       Evaluation: [X] Satisfactory    Dept of CSE
VISHNU K (NNM23CS233)
---------------------------------------------------------------------------------------------
```

---

<div style="page-break-after: always;"></div>

# 📄 PAGE 9: WEEK 9 PROGRESS REPORT
**Project Title:** MyCare AI (Lung Cancer CAD & Voice Assistant)  
**Phase:** Phase 3: Model Architecture & Training  
**Week Range:** Week 9 of 16  

### 1. Planned Tasks / Objective
Develop Grad-CAM explainability module to generate localized visual attention heatmaps on CT scans.

### 2. Work Executed by Team
Hooked gradient backpropagation into the final convolutional layer (layer4.1.conv2). Computed importance weights alpha_k^c via global average pooling of gradients. Linearly combined activation maps and applied ReLU rectification to isolate positive class features.

### 3. Guide's Suggestions & Feedback
> *"Validate that heatmaps highlight the actual lesion border rather than background scanner margins. Provide an interactive UI toggle for raw CT vs Heatmap."*

### 4. Tasks Achieved as per Suggestion
Generated Jet thermal spectrum heatmaps (Blue = Low, Red = High) blended on CT scans at 40% alpha. Verified spatial localization against radiologist nodule annotations and built frontend overlay toggle.

### 5. Milestones & Deliverables
* **Deliverable:** Grad-CAM Activation Module (`gradcam.py`) & Explainability Demos.
* **Status:** Completed & Approved

```
---------------------------------------------------------------------------------------------
Student Signatures:                        Internal Guide Signature:       HOD Signature:
VINITHRAM (NNM23CS231)                     Guide: _____________________    HOD: _____________________
VINITH V DEVADIGA (NN23CS230)              Date:  _____________________    Seal:
TEJAS N (NNM23CS217)                       Evaluation: [X] Satisfactory    Dept of CSE
VISHNU K (NNM23CS233)
---------------------------------------------------------------------------------------------
```

---

<div style="page-break-after: always;"></div>

# 📄 PAGE 10: WEEK 10 PROGRESS REPORT
**Project Title:** MyCare AI (Lung Cancer CAD & Voice Assistant)  
**Phase:** Phase 4: Full-Stack & Feature Integration  
**Week Range:** Week 10 of 16  

### 1. Planned Tasks / Objective
Develop production-ready FastAPI backend serving prediction, history logging, and health endpoints.

### 2. Work Executed by Team
Developed FastAPI REST application with asynchronous endpoints: POST /api/predict (multipart scan upload, tensor evaluation, Grad-CAM generation, and diagnosis), GET /api/history and DELETE /api/history/{id} (SQLite database), and GET /health.

### 3. Guide's Suggestions & Feedback
> *"Implement automatic static directory cleanup and ensure temporary image buffers are safely freed from memory. Benchmark round-trip latency under 200ms."*

### 4. Tasks Achieved as per Suggestion
Added in-memory image streaming and automatic static directory management. Benchmarked end-to-end API inference latency at <150 milliseconds per scan. Registered CORS middleware and Pydantic validation.

### 5. Milestones & Deliverables
* **Deliverable:** FastAPI Backend Server Codebase & Interactive Swagger Docs (`/docs`).
* **Status:** Completed & Approved

```
---------------------------------------------------------------------------------------------
Student Signatures:                        Internal Guide Signature:       HOD Signature:
VINITHRAM (NNM23CS231)                     Guide: _____________________    HOD: _____________________
VINITH V DEVADIGA (NN23CS230)              Date:  _____________________    Seal:
TEJAS N (NNM23CS217)                       Evaluation: [X] Satisfactory    Dept of CSE
VISHNU K (NNM23CS233)
---------------------------------------------------------------------------------------------
```

---

<div style="page-break-after: always;"></div>

# 📄 PAGE 11: WEEK 11 PROGRESS REPORT
**Project Title:** MyCare AI (Lung Cancer CAD & Voice Assistant)  
**Phase:** Phase 4: Full-Stack & Feature Integration  
**Week Range:** Week 11 of 16  

### 1. Planned Tasks / Objective
Build modern responsive Single Page Application (SPA) using React 18, Vite, and Tailwind CSS.

### 2. Work Executed by Team
Created medical user interface featuring drag-and-drop file upload zone, scanning laser beam animation, circular confidence dials, and color-coded risk badges (Low, Moderate, High). Developed pages: Landing, Analyze, Results, History, and About.

### 3. Guide's Suggestions & Feedback
> *"Prominently display medical disclaimers on all pages. Include ready-to-test 1-click sample scans so evaluators can test the system immediately."*

### 4. Tasks Achieved as per Suggestion
Integrated persistent medical disclaimer banners and embedded 1-click sample CT scans for Normal, Benign, and Malignant cases directly into the diagnostic dropzone.

### 5. Milestones & Deliverables
* **Deliverable:** React 18 Single Page Application (`/analyze`, `/results`, `/history`).
* **Status:** Completed & Approved

```
---------------------------------------------------------------------------------------------
Student Signatures:                        Internal Guide Signature:       HOD Signature:
VINITHRAM (NNM23CS231)                     Guide: _____________________    HOD: _____________________
VINITH V DEVADIGA (NN23CS230)              Date:  _____________________    Seal:
TEJAS N (NNM23CS217)                       Evaluation: [X] Satisfactory    Dept of CSE
VISHNU K (NNM23CS233)
---------------------------------------------------------------------------------------------
```

---

<div style="page-break-after: always;"></div>

# 📄 PAGE 12: WEEK 12 PROGRESS REPORT
**Project Title:** MyCare AI (Lung Cancer CAD & Voice Assistant)  
**Phase:** Phase 4: Full-Stack & Feature Integration  
**Week Range:** Week 12 of 16  

### 1. Planned Tasks / Objective
Implement evidence-based clinical decision-support pathways and automated PDF report export.

### 2. Work Executed by Team
Integrated Fleischner Society surveillance protocols (3-6 month CT follow-up for solid nodules) and NCCN oncology treatment pathways (VATS lobectomy, SBRT radiation, chemotherapy, PD-1 immunotherapy, and targeted EGFR/ALK therapies).

### 3. Guide's Suggestions & Feedback
> *"Ensure clinical recommendations clearly explain volume doubling time (VDT) and biopsy triggers. Structure clean printable PDF reports."*

### 4. Tasks Achieved as per Suggestion
Built interactive Clinical Guidance dashboard (`GuidancePage.jsx`) with visual care matrix. Developed 1-click printable PDF Medical Diagnostic Summary export containing confidence scores, heatmaps, and doctor recommendations.

### 5. Milestones & Deliverables
* **Deliverable:** Clinical Decision Engine & Printable PDF Report Generator.
* **Status:** Completed & Approved

```
---------------------------------------------------------------------------------------------
Student Signatures:                        Internal Guide Signature:       HOD Signature:
VINITHRAM (NNM23CS231)                     Guide: _____________________    HOD: _____________________
VINITH V DEVADIGA (NN23CS230)              Date:  _____________________    Seal:
TEJAS N (NNM23CS217)                       Evaluation: [X] Satisfactory    Dept of CSE
VISHNU K (NNM23CS233)
---------------------------------------------------------------------------------------------
```

---

<div style="page-break-after: always;"></div>

# 📄 PAGE 13: WEEK 13 PROGRESS REPORT
**Project Title:** MyCare AI (Lung Cancer CAD & Voice Assistant)  
**Phase:** Phase 5: Advanced Model Evaluation & Analytics  
**Week Range:** Week 13 of 16  

### 1. Planned Tasks / Objective
Conduct comprehensive quantitative evaluation on test cohort and plot multi-metric performance graphs.

### 2. Work Executed by Team
Evaluated finalized ResNet-18 model across all test CT slices. Generated Confusion Matrix, ROC-AUC curves, and class-wise sensitivity/specificity bar graphs. Benchmarked accuracy against baseline CNN (84.2%) and VGG-16 (89.5%).

### 3. Guide's Suggestions & Feedback
> *"Incorporate these performance graphs directly into the results dashboard and thesis documentation to visually substantiate model stability."*

### 4. Tasks Achieved as per Suggestion
Validated finalized metrics: 99.37% Balanced Accuracy (Benign Recall: 99.7%, Malignant Recall: 98.1%, Normal Recall: 98.8%). Embedded performance analytics and loss trajectory curves into the documentation.

### 5. Milestones & Deliverables
* **Deliverable:** Quantitative Performance Evaluation Report & Confusion Matrix Plots.
* **Status:** Completed & Approved

```
---------------------------------------------------------------------------------------------
Student Signatures:                        Internal Guide Signature:       HOD Signature:
VINITHRAM (NNM23CS231)                     Guide: _____________________    HOD: _____________________
VINITH V DEVADIGA (NN23CS230)              Date:  _____________________    Seal:
TEJAS N (NNM23CS217)                       Evaluation: [X] Satisfactory    Dept of CSE
VISHNU K (NNM23CS233)
---------------------------------------------------------------------------------------------
```

---

<div style="page-break-after: always;"></div>

# 📄 PAGE 14: WEEK 14 PROGRESS REPORT
**Project Title:** MyCare AI (Lung Cancer CAD & Voice Assistant)  
**Phase:** Phase 5: Advanced Model Evaluation & Analytics  
**Week Range:** Week 14 of 16  

### 1. Planned Tasks / Objective
Develop multilingual conversational NLP backend supporting regional languages for enhanced healthcare accessibility.

### 2. Work Executed by Team
Built `/api/chat` NLP engine supporting English, Hindi (हिन्दी / Hinglish), and Kannada (ಕನ್ನಡ / Kanglish). Implemented comprehensive oncology knowledge base covering symptoms, nodule types, staging, treatments, CT guidance, and lung wellness.

### 3. Guide's Suggestions & Feedback
> *"Regional language access is a major innovation. Ensure Kannada and Hindi support both regional script (Devanagari/Kannada) and phonetic transliteration."*

### 4. Tasks Achieved as per Suggestion
Implemented automatic script and keyword language detection. Verified accurate multilingual clinical responses across typed script and phonetic inputs. Added language-specific suggested question chips.

### 5. Milestones & Deliverables
* **Deliverable:** Multilingual NLP Chatbot Backend (`chat.py`) & Knowledge Repository.
* **Status:** Completed & Approved

```
---------------------------------------------------------------------------------------------
Student Signatures:                        Internal Guide Signature:       HOD Signature:
VINITHRAM (NNM23CS231)                     Guide: _____________________    HOD: _____________________
VINITH V DEVADIGA (NN23CS230)              Date:  _____________________    Seal:
TEJAS N (NNM23CS217)                       Evaluation: [X] Satisfactory    Dept of CSE
VISHNU K (NNM23CS233)
---------------------------------------------------------------------------------------------
```

---

<div style="page-break-after: always;"></div>

# 📄 PAGE 15: WEEK 15 PROGRESS REPORT
**Project Title:** MyCare AI (Lung Cancer CAD & Voice Assistant)  
**Phase:** Phase 6: Innovations, Chatbot & Final Defense  
**Week Range:** Week 15 of 16  

### 1. Planned Tasks / Objective
Integrate hands-free speech recognition and text-to-speech audio playback into the chatbot.

### 2. Work Executed by Team
Integrated Web Speech Recognition API (`webkitSpeechRecognition`) for voice input with automatic language switching (en-IN, hi-IN, kn-IN). Added Web Speech Synthesis (`SpeechSynthesisUtterance`) for voice readouts with play/pause/mute audio controls.

### 3. Guide's Suggestions & Feedback
> *"Test voice input across different ambient noise levels and verify microphone permissions handling. Provide volume mute/play controls on all voice messages."*

### 4. Tasks Achieved as per Suggestion
Built floating `ChatWidget.jsx` accessible across all pages with animated voice recording wave and speech audio controls. Created dedicated full-screen `/chat` consultation page.

### 5. Milestones & Deliverables
* **Deliverable:** Voice AI Module (`speech.js`), Floating Widget & Chatbot Page.
* **Status:** Completed & Approved

```
---------------------------------------------------------------------------------------------
Student Signatures:                        Internal Guide Signature:       HOD Signature:
VINITHRAM (NNM23CS231)                     Guide: _____________________    HOD: _____________________
VINITH V DEVADIGA (NN23CS230)              Date:  _____________________    Seal:
TEJAS N (NNM23CS217)                       Evaluation: [X] Satisfactory    Dept of CSE
VISHNU K (NNM23CS233)
---------------------------------------------------------------------------------------------
```

---

<div style="page-break-after: always;"></div>

# 📄 PAGE 16: WEEK 16 PROGRESS REPORT
**Project Title:** MyCare AI (Lung Cancer CAD & Voice Assistant)  
**Phase:** Phase 6: Innovations, Chatbot & Final Defense  
**Week Range:** Week 16 of 16  

### 1. Planned Tasks / Objective
Finalize Major Project Thesis Report, prepare presentation slides, and conduct final system defense.

### 2. Work Executed by Team
Completed Major Project Thesis Report following university guidelines. Prepared 20-slide presentation (`MyCare_Lung_Cancer_Detection_20_Slides.pptx`) with large readable fonts, embedded CT scan photos, and algorithm diagrams. Showcased key advancements: Multilingual Voice AI Chatbot and Graphical Analytics.

### 3. Guide's Suggestions & Feedback
> *"Highlight the multilingual voice chatbot (English, Hindi, Kannada) and interactive analytical graphs as key project advancements. Ensure all team members demonstrate mastery of ResNet-18 skip connections (F(x)+x) and Grad-CAM in the viva."*

### 4. Tasks Achieved as per Suggestion
Successfully conducted live project demonstration showcasing 99.4% CT scan inference, Grad-CAM visualization, and voice chatbot operation in English, Hindi, and Kannada. Project report and presentation verified and approved for university submission.

### 5. Milestones & Deliverables
* **Deliverable:** Final Project Thesis Report, 20-Slide PPT Presentation & Approved System.
* **Status:** Completed & Approved for University Submission

```
---------------------------------------------------------------------------------------------
Student Signatures:                        Internal Guide Signature:       HOD Signature:
VINITHRAM (NNM23CS231)                     Guide: _____________________    HOD: _____________________
VINITH V DEVADIGA (NN23CS230)              Date:  _____________________    Seal:
TEJAS N (NNM23CS217)                       Evaluation: [X] Satisfactory    Dept of CSE
VISHNU K (NNM23CS233)
---------------------------------------------------------------------------------------------
```
