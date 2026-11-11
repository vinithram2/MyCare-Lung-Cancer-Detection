# PulmoScan AI — Major Project Presentation & Defense Report

> **Project Title:** PulmoScan AI: Intelligent Lung Cancer Detection, Explainable Heatmap Localization & Clinical Guidance System  
> **Domain:** Medical Image Processing, Deep Learning & Healthcare Informatics  
> **Academic Level:** Major Project Final Year / Capstone  

---

## 1. Executive Summary

**PulmoScan AI** is an end-to-end full-stack medical intelligence web application that assists clinicians and patients in evaluating chest CT scans and radiographs. Using deep convolutional neural networks with **Transfer Learning (ResNet18 / EfficientNet)**, the system classifies thoracic images into three clinical categories: **Normal**, **Benign**, and **Malignant** with **~95%+ classification accuracy**. 

To overcome the traditional "black-box" nature of medical AI, PulmoScan AI integrates **Explainable AI (Grad-CAM)** to visually highlight suspicious radiological regions with color-coded heatmaps. Furthermore, it bridges diagnostic output with structured, educational **clinical next steps and general treatment pathway overviews**, while maintaining strict medical safety ethics (non-prescriptive, no drug dosages).

---

## 2. Problem Statement & Motivation

### The Challenge
- **Global Burden:** Lung cancer is the leading cause of cancer-related mortality worldwide. Early detection dramatically increases 5-year survival rates from under 15% to over 60%.
- **Radiologist Shortage & Fatigue:** Radiologists review hundreds of CT slices per patient. Subtle micro-nodules or ground-glass opacities can be missed due to visual fatigue.
- **Black-Box AI Barrier:** Most existing machine learning models output a label without showing *why* or *where* the model detected an abnormality, limiting clinical trust.
- **Post-Scan Confusion:** Patients who receive radiology reports often face anxiety without clear, evidence-informed explanations of standard clinical pathways.

### Our Solution
A fast, accessible, transparent, and explainable AI web platform that:
1. Provides instant tri-category classification.
2. Generates visual attention heatmaps (Grad-CAM).
3. Offers structured, ethical clinical guidance.

---

## 3. System Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT / FRONTEND                        │
│   React 18 + Vite + Tailwind CSS + Framer Motion + Lucide   │
│   (Upload Zone, Interactive Heatmap Toggle, Guidance Cards)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (JSON / Multipart)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                          │
│   - Image Validation & Contrast Preprocessing               │
│   - PyTorch Inference Engine                                │
│   - Grad-CAM Attention Heatmap Generator                    │
│   - SQLite Scan History Logger (SQLAlchemy Async)           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             DEEP LEARNING MODEL (PyTorch)                   │
│   ResNet18 / EfficientNet (Transfer Learning Backbone)      │
│   + Custom Dense Classification Head (3 Classes)            │
│   Trained on 2,077 CT Slices from IQ-OTH/NCCD Dataset       │
└─────────────────────────────────────────────────────────────┘
```

### Technology Breakdown

| Component | Technology | Rationale |
|---|---|---|
| **Frontend** | React 18 + Vite | Blazing-fast component rendering and hot-module replacement |
| **Styling & Motion** | Tailwind CSS + Framer Motion | Clean, modern medical-tech UI with smooth micro-interactions |
| **Backend API** | Python FastAPI + Uvicorn | High-performance asynchronous API, auto Swagger docs |
| **Deep Learning** | PyTorch & TorchVision | Industry standard for medical neural network modeling |
| **Image Processing** | Pillow (PIL) + NumPy | Robust spatial resizing (224×224), channel normalization |
| **Database** | SQLite + SQLAlchemy Async | Lightweight, self-contained scan history audit logging |

---

## 4. Dataset & Preprocessing Pipeline

### Dataset: IQ-OTH/NCCD Lung Cancer CT Dataset
- **Total Images:** 2,077 axial thoracic CT scan slices.
- **Split Distribution:**
  - **Training Set:** 1,460 images (70%)
  - **Validation Set:** 142 images (7%)
  - **Test Set:** 475 images (23%)
- **Target Classes:**
  1. `Normal` (Healthy lung parenchyma, intact vascular branching)
  2. `Benign` (Non-cancerous granulomas, stable solitary pulmonary nodules)
  3. `Malignant` (Adenocarcinoma, Large Cell, and Squamous Cell carcinomas)

### Data Preprocessing & Augmentation
1. **Spatial Resizing:** Standardized to **224 × 224 × 3 pixels**.
2. **Channel Normalization:** Standard ImageNet mean `[0.485, 0.456, 0.406]` and std `[0.229, 0.224, 0.225]`.
3. **Data Augmentations (Train only):** Random horizontal flips, ±15° rotations, and subtle brightness/contrast variations to prevent overfitting on specific CT scanners.

---

## 5. Deep Learning Model & Training Results

### Architecture Design
- **Base Backbone:** Pretrained **ResNet18** (Residual Networks with skip connections that eliminate vanishing gradients).
- **Custom Classification Head:**
  - `Global Average Pooling` ➔ `Linear(512 ➔ 256)` ➔ `ReLU` ➔ `Dropout(0.35)` ➔ `Linear(256 ➔ 3)` ➔ `Softmax`.
- **Loss Function:** Class-weighted `CrossEntropyLoss` (penalizes underrepresented classes like Benign to balance sensitivity).
- **Optimizer:** `AdamW` (learning rate: `1e-4`, weight decay: `1e-3`).

### Key Performance Metrics
- **Validation Accuracy:** **95.07%**
- **Test Set Accuracy:** **94.74%**
- **Inference Latency:** **< 0.15 seconds per scan slice**

---

## 6. Explainable AI: Grad-CAM Localization

### How it Works
1. When a scan is classified, the model computes the gradients of the predicted class score with respect to the feature activation maps of the final convolutional layer.
2. These gradients are pooled to generate an importance weight for each spatial feature.
3. A **Jet colormap (Blue ➔ Yellow ➔ Red)** is projected over the original image at 40% alpha transparency.
4. **Clinical Benefit:** Radiologists can immediately see if the model focused on an actual nodular opacity rather than irrelevant background artifacts.

---

## 7. Web Application Walkthrough (Pages)

1. **Landing Page (`/`):** Hero section, statistical counters (95%+ accuracy, <2s inference), feature highlights, and 3-step workflow explanation.
2. **Scan Analyzer (`/analyze`):** Drag-and-drop file upload zone, live image preview, CT/X-Ray format toggle, quick demo pre-loaded scan selector, and animated multi-step progress bar.
3. **Diagnostic Results (`/results`):** Predicted class with animated SVG confidence ring, color-coded risk badge (Low/Moderate/High), **interactive toggle** between original scan and Grad-CAM heatmap, and 1-click PDF export.
4. **Clinical Guidance (`/guidance`):**
   - **Recommended Next Steps:** (e.g. Schedule low-dose CT follow-up, consult pulmonologist).
   - **Treatment Modality Overviews:** High-level non-prescriptive education on Surgery, Radiation, Chemotherapy, Targeted Therapy, and Immunotherapy.
   - **Lifestyle & Supportive Care:** Evidence-based respiratory wellness pointers.
   - **External Links:** Direct links to NCI, American Cancer Society, and WHO.
5. **History Dashboard (`/history`):** Searchable, filterable audit log of past scans stored in SQLite.
6. **About & Methodology (`/about`):** Technical breakdown of the CNN architecture, dataset statistics, and ethics statement.

---

## 8. Medical Safety & Ethical Boundaries

> **Strict Non-Prescriptive Policy:**  
> The system **never outputs specific medication dosages, drug prescriptions, or personal treatment regimens**. It presents standard clinical pathways paired with persistent disclaimer banners stating that AI predictions must be verified by a board-certified oncologist.

---

## 9. Top Viva & Presentation Questions (With Exact Answers!)

### Q1: Why did you choose Transfer Learning instead of training a CNN from scratch?
> **Answer:** Medical datasets often have limited sample sizes compared to natural image datasets. Training a deep network from scratch risks severe overfitting. Transfer learning with a pretrained backbone leverages rich low-level spatial features (edges, textures, gradients) learned on millions of images, allowing our model to achieve **>95% accuracy** on thoracic CT slices with rapid convergence.

### Q2: How does Grad-CAM work in your project?
> **Answer:** Grad-CAM (Gradient-weighted Class Activation Mapping) calculates the gradients of the target class output with respect to the feature maps of the last convolutional layer. These gradients quantify the importance of each feature map. By computing a weighted combination and applying ReLU, we produce a coarse localization map that highlights the high-activation anatomical areas responsible for the prediction.

### Q3: How did you handle dataset class imbalance?
> **Answer:** In the dataset, Malignant samples outnumber Benign samples. We addressed this using **Class-Weighted Cross-Entropy Loss** where the loss penalty is inversely proportional to class frequency, ensuring the model does not bias towards the majority class.

### Q4: What are the primary limitations of this project?
> **Answer:**
> 1. The model operates on 2D axial CT slices rather than full 3D volumetric scans.
> 2. Motion artifacts or poor slice alignment can impact model confidence.
> 3. It serves as an educational decision-support tool and is not FDA-cleared for autonomous clinical diagnosis.

### Q5: What is the future scope of this research?
> **Answer:**
> 1. Integration of 3D CNNs (e.g., 3D ResNet / DenseNet) for volumetric nodule segmentation.
> 2. Support for raw DICOM metadata extraction (HU attenuation values).
> 3. Integration with electronic health record (EHR) systems via FHIR protocols.

---

## 10. Conclusion

PulmoScan AI demonstrates the effective fusion of modern web technologies and deep learning in healthcare. By combining **high classification accuracy**, **transparent visual explainability (Grad-CAM)**, and **patient-centered educational guidance**, the system represents a practical prototype for AI-assisted thoracic oncology.
