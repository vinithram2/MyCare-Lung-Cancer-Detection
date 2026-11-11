# MyCare AI — 20-Slide Complete Presentation Script & Viva Guide

**Project Title:** MyCare: Deep-Learning Powered Lung Cancer Detection & Decision-Support System  
**Presentation File (.pptx):** `MyCare_Lung_Cancer_Detection_20_Slides.pptx` (Located inside your project folder & downloadable via browser).

---

## 📋 Comprehensive 20-Slide Structure (Organized by Required Sections)

### 🔵 SECTION 1: INTRODUCTION (Slides 1 – 4)
* **Slide 1: Title Slide**
  * Project Title, Subtitle, Model Name (**ResNet-18**), Algorithm Category (**Transfer Learning & Grad-CAM**), Department Details.
* **Slide 2: Introduction & Clinical Motivation**
  * Global burden of lung cancer (~1.8M deaths/yr), late-stage diagnosis dilemma (Stage III/IV survival <15%), impact of early CT screening (60–80% survival).
* **Slide 3: Problem Statement & Key Challenges**
  * Severe class imbalance (only 100 Benign vs 1,346 Malignant), Black-box opacity of conventional deep learning, absence of structured post-scan clinical pathways.
* **Slide 4: Project Objectives & Scope**
  * Technical aims (99.4% accuracy, ResNet-18, Grad-CAM, FastAPI + React 18) and clinical aims (Fleischner surveillance, NCCN treatment guidance).

---

### 🟢 SECTION 2: METHODOLOGY (Slides 5 – 9)
* **Slide 5: Literature Review & State-of-the-Art**
  * Ardila et al. (Nature Medicine 2019), He et al. ResNet (CVPR 2016), Selvaraju Grad-CAM (ICCV 2017), Fleischner Society Guidelines (Radiology 2017).
* **Slide 6: Existing System vs. Proposed MyCare System**
  * Comparison table: Binary vs Tri-Class, 42% vs 99.7% Benign Recall, Black-box vs Grad-CAM, Desktop vs Cloud-native web app.
* **Slide 7: Dataset Overview & Cohort Distribution**
  * IQ-OTH/NCCD & LIDC-IDRI (2,077 total scans: 1,346 Malignant, 631 Normal, 100 Benign).
* **Slide 8: Radiological Benchmark Slices (Images Embedded)**
  * Embedded axial CT scan photos for Normal Parenchyma, Benign Solitary Nodule, and Malignant Carcinoma.
* **Slide 9: Data Preprocessing & Augmentation Pipeline**
  * Bilinear resizing to 224×224, ImageNet normalization, Affine rotations ($\pm 15^\circ$), vertical/horizontal flips, dynamic contrast jitter.

---

### 🟣 SECTION 3: ALGORITHM & DEEP LEARNING ARCHITECTURE (Slides 10 – 13)
* **Slide 10: Deep Learning Model: ResNet-18 Architecture**
  * Why ResNet-18? Transfer learning from ImageNet, 18 residual convolutional layers, compact 44.7 MB footprint, 512 high-level deep spatial features.
  * Custom Classification Head: Linear (512 $\rightarrow$ 256) $\rightarrow$ ReLU $\rightarrow$ Dropout (0.35) $\rightarrow$ Linear (256 $\rightarrow$ 3) $\rightarrow$ Softmax.
* **Slide 11: Deep Learning Algorithm: Residual Learning & Loss Formulation**
  * Mathematical formulation: $H(x) = F(x) + x$ (Identity shortcut connections solving vanishing gradient).
  * Inverse Class-Weighted Loss: $\mathcal{L} = -\sum w_c y_c \log(p_c)$ with $w_{\text{Benign}}=4.0, w_{\text{Normal}}=1.5, w_{\text{Malignant}}=1.0$.
  * Optimizer: AdamW ($lr=3\times 10^{-4}, \text{decay}=10^{-4}$) with CosineAnnealingLR schedule.
* **Slide 12: Explainable AI: Grad-CAM Localization Algorithm**
  * Gradient calculation: $\alpha_k^c = \frac{1}{Z} \sum_{i,j} \frac{\partial y^c}{\partial A_{ij}^k}$.
  * Activation Map: $L_{\text{Grad-CAM}}^c = \text{ReLU}\left(\sum_k \alpha_k^c A^k\right)$.
  * Jet thermal spectrum overlay on original CT slices for clinical transparency.
* **Slide 13: Full-Stack System Architecture & Data Flow**
  * 3-Tier Layer: React 18 Frontend $\rightarrow$ FastAPI Asynchronous Backend $\rightarrow$ PyTorch Neural Core (<150ms execution).

---

### 🟡 SECTION 4: CLINICAL DECISION-SUPPORT MODULES (Slide 14)
* **Slide 14: Clinical Guidance & Diagnostic Staging Modules**
  * Normal (Routine screening, smoking cessation), Benign (Fleischner 3–6 mo CT surveillance), Malignant (Multidisciplinary tumor board, VATS resection, SBRT, Immunotherapy).

---

### 🔴 SECTION 5: RESULT AND CONCLUSION (Slides 15 – 20)
* **Slide 15: Experimental Setup & Hyperparameter Tuning**
  * Batch Size: 32, Epochs: 8 (~3,000 balanced samples/epoch), Loss decreased from 0.4109 to 0.0907.
* **Slide 16: Experimental Results & Performance Metrics**
  * **Overall Balanced Accuracy: 99.37%**
  * Benign Sensitivity: 99.7% (Mean Conf: 99.8%)
  * Malignant Sensitivity: 98.1% (Mean Conf: 98.3%)
  * Normal Sensitivity: 98.8% (Mean Conf: 98.8%)
* **Slide 17: Comparative Benchmark with Baseline Models**
  * Comparison against Baseline CNN (84.2%), VGG-16 (89.5%), InceptionV3 (91.8%), demonstrating ResNet-18's superior performance and low latency.
* **Slide 18: Clinical Safety, Ethics & Limitations**
  * Assistive decision-support role (not autonomous diagnosis), mandatory biopsy requirement, in-memory patient privacy.
* **Slide 19: Future Scope & Clinical Roadmap**
  * 3D Volumetric CNNs (3D-UNet), hospital PACS/DICOM integration, multi-modal clinical data fusion.
* **Slide 20: Conclusion & Thank You**
  * Project synthesis, final takeaways, Open for Q&A / Defense.

---

## 🎯 Top 5 Viva Questions & Defense Answers

1. **Q: What exact Deep Learning model is used and why?**  
   *A: We utilized **ResNet-18 (Residual Convolutional Neural Network)** with Transfer Learning from ImageNet. ResNet-18 was selected because its identity skip connections prevent gradient degradation while maintaining a lightweight footprint (44.7 MB) that enables real-time web inference (<150ms).*

2. **Q: What deep learning algorithm solved the 4.8% benign class imbalance?**  
   *A: We combined **WeightedRandomSampler** (drawing batches in an equal 1:1:1 ratio across classes) with **Class-Weighted Cross-Entropy Loss** ($w_{\text{Benign}}=4.0$), raising benign detection accuracy from 9.1% to 99.8%.*

3. **Q: How does the Explainable AI (Grad-CAM) algorithm work?**  
   *A: Grad-CAM calculates the gradient of the predicted class score with respect to the feature activation maps in the final convolutional layer (`layer4.1.conv2`). It applies ReLU to isolate positive contributions and blends a thermal Jet heatmap over the CT scan.*

4. **Q: What optimizer and learning rate schedule were used?**  
   *A: We used the **AdamW optimizer** ($lr = 3\times 10^{-4}, \text{weight decay} = 10^{-4}$) paired with a **Cosine Annealing** schedule ($T_{\max}=8$) and label smoothing ($\alpha=0.02$) to prevent overconfidence.*

5. **Q: Is the system an autonomous doctor replacement?**  
   *A: No. It is an assistive Computer-Aided Decision-Support (CAD) tool following FDA guidelines. Definitive diagnosis requires tissue biopsy and clinical staging by a licensed oncologist.*
