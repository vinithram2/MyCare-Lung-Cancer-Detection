# 🫁 MyCare: AI-Powered Lung Cancer Detection & Explainable Decision Support System

[![PyTorch](https://img.shields.io/badge/PyTorch-2.4-EE4C2C.svg?style=flat&logo=pytorch)](https://pytorch.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![Accuracy](https://img.shields.io/badge/Benchmark%20Accuracy-99.4%25-brightgreen.svg)]()
[![Recall](https://img.shields.io/badge/Malignant%20Recall-100.0%25-success.svg)]()

> **Major Project Phase Submission**  
> **Institution:** NMAM Institute of Technology (NMAMIT), Nitte  
> **Project Guide:** Dr. Sandeep  
> **Team Members:**
> - **VINITHRAM**
> - **VINITH V DEVADIGA**
> - **TEJAS N**
> - **VISHNU K**

---

## 📌 Project Overview

**MyCare** is an end-to-end, clinically focused deep learning diagnostic and clinical decision support platform designed to assist radiologists and healthcare providers in automated multi-class thoracic nodule identification and classification from Computed Tomography (CT) scans.

### 🌟 Key Highlights
1. **Multi-Class Classification:** Accurately classifies axial thoracic CT scans into three diagnostic categories:
   - **Normal Lung Parenchyma**
   - **Benign Pulmonary Nodule**
   - **Malignant Carcinoma** (Adenocarcinoma, Large Cell, Squamous Cell)
2. **High-Fidelity Accuracy:**
   - **99.4% Overall Test Accuracy** on the IQ-OTH/NCCD benchmark test cohort.
   - **100.0% Malignant Recall** (Zero false negatives on malignant tumors).
3. **Explainable AI (XAI) with Grad-CAM:**
   - Generates high-resolution gradient-weighted class activation heatmaps overlaid directly on CT slices to highlight suspicious tissue density and spicular borders.
4. **Clinical Decision Support & Interactive Chatbot:**
   - Automated NCCN and Fleischner Society follow-up protocols.
   - Integrated medical knowledge assistant for patient guidance.

---

## 📂 Repository Structure

```text
├── Project_Documents/                  # 📄 Official Academic Submissions
│   ├── MyCare_Complete_Major_Project_Report.docx   # Comprehensive Phase Report
│   ├── MyCare_IEEE_Transactions_Research_Paper.docx # IEEE 2-Column Research Paper
│   ├── MyCare_16_Page_Weekly_Progress_Report.docx  # Phase Milestone Tracker
│   └── MyCare_Lung_Cancer_Detection_Full.pptx     # 28-Slide Final Presentation
│
├── Dataset/                            # 🩻 Benchmark Dataset Deliverables
│   ├── Lung_Cancer_Dataset_100_Samples.zip         # 300 Curated Slices (100/class)
│   └── README.md                                  # Full IQ-OTH/NCCD Dataset Details
│
├── backend/                            # ⚡ FastAPI + PyTorch Backend Engine
│   ├── app/
│   │   ├── models/inference.py         # PyTorch ResNet-18 Inference Pipeline
│   │   ├── utils/gradcam.py            # Grad-CAM Heatmap Generator
│   │   ├── utils/preprocessing.py      # CT Validation & Adaptive Normalization
│   │   └── routes/predict.py           # REST API Endpoint (/api/predict)
│   ├── weights/pulmoscan_model.pth     # Pre-trained Model Checkpoint (44.7 MB)
│   ├── train/train_full_dataset.py     # Training & Optimization Script
│   └── run.py                          # ASGI Server Entrypoint
│
├── frontend/                           # 💻 React 18 + Vite Modern Web Client
│   ├── src/
│   │   ├── pages/AnalyzePage.jsx       # CT Scan Upload & Analysis Interface
│   │   ├── pages/ResultsPage.jsx       # Results, Probabilities & Grad-CAM Heatmap
│   │   └── components/                 # UI Cards, Chatbot, Modals & Navigation
│   └── package.json
│
├── .gitignore                          # Git clean staging configuration
└── README.md                           # Main Project Documentation
```

---

## 🔬 Model Architecture & Training Specifications

* **Backbone:** Deep Residual Network (**ResNet-18**) with ImageNet transfer learning.
* **Residual Learning Formula:** $\mathcal{H}(x) = \mathcal{F}(x) + x$ (eliminates vanishing gradient).
* **Optimizer:** AdamW ($\text{lr} = 3.5 \times 10^{-4}$, weight decay $= 1.0 \times 10^{-4}$).
* **LR Scheduler:** CosineAnnealingLR ($T_{\max} = 8$, $\eta_{\min} = 1.0 \times 10^{-6}$).
* **Class Imbalance Resolution:** 1:1:1 Balanced `WeightedRandomSampler` + Class-Weighted Cross-Entropy ($8.0\times$ penalty on Benign errors).
* **Inference Latency:** $< 150\text{ ms}$ per CT slice (Real-time).

---

## 🚀 How to Run the Project Locally

### Prerequisites
* Python 3.10 or 3.11
* Node.js v18+ and npm

### 1. Start the Backend API (FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
python run.py
```
> The API will be live at: `http://localhost:8000`  
> Swagger Documentation: `http://localhost:8000/docs`

### 2. Start the Frontend (React + Vite)
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
> The web application will be live at: `http://localhost:5173`

---

## 📑 Academic Deliverables Included

All requested files from **Dr. Sandeep** are present in the repository:
1. **Source Code:** Complete frontend and backend implementation.
2. **Dataset:** Curated test dataset with 300 slices in `Dataset/` and instructions for the 330MB full cohort.
3. **Project Report:** Full Major Project Report in `Project_Documents/`.
4. **Presentation (PPT):** Updated 28-slide presentation in `Project_Documents/`.
