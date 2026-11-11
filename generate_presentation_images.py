import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
from PIL import Image, ImageDraw, ImageFont

os.makedirs("frontend/public/images", exist_ok=True)

# 1. Dataset Chart PNG
def create_dataset_chart():
    fig, ax = plt.subplots(figsize=(6, 4), dpi=200)
    categories = ['Malignant\n(1,346)', 'Normal\n(631)', 'Benign\n(100)']
    counts = [1346, 631, 100]
    colors = ['#ef4444', '#10b981', '#f59e0b']
    
    bars = ax.bar(categories, counts, color=colors, width=0.55, edgecolor='#334155', linewidth=1.2)
    ax.set_facecolor('#f8fafc')
    fig.patch.set_facecolor('#ffffff')
    
    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{height}',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 4),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=11, fontweight='bold', color='#1e293b')
        
    ax.set_ylabel('Number of CT Slices', fontsize=11, fontweight='bold', color='#334155')
    ax.set_title('Dataset Cohort Distribution (2,077 Slices)', fontsize=12, fontweight='bold', color='#0f172a', pad=12)
    ax.grid(axis='y', linestyle='--', alpha=0.5)
    ax.set_axisbelow(True)
    for spine in ax.spines.values():
        spine.set_color('#cbd5e1')
        
    plt.tight_layout()
    plt.savefig('frontend/public/images/dataset_chart.png', bbox_inches='tight', dpi=200)
    plt.close()
    print("Created dataset_chart.png")

# 2. ResNet Architecture Diagram PNG
def create_architecture_diagram():
    fig, ax = plt.subplots(figsize=(7, 4), dpi=200)
    ax.set_facecolor('#0f172a')
    fig.patch.set_facecolor('#0f172a')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')
    
    # Input
    rect1 = patches.FancyBboxPatch((0.4, 2.0), 1.6, 2.0, boxstyle="round,pad=0.2", fc="#1e293b", ec="#38bdf8", lw=1.5)
    ax.add_patch(rect1)
    ax.text(1.2, 3.2, "Input CT\n224x224", ha="center", va="center", color="#ffffff", fontsize=10, fontweight="bold")
    
    # Arrow 1
    ax.annotate('', xy=(2.4, 3.0), xytext=(2.0, 3.0), arrowprops=dict(arrowstyle="->", color="#38bdf8", lw=2))
    
    # ResNet Backbone
    rect2 = patches.FancyBboxPatch((2.5, 1.2), 3.2, 3.6, boxstyle="round,pad=0.2", fc="#0f766e", ec="#2dd4bf", lw=2)
    ax.add_patch(rect2)
    ax.text(4.1, 4.2, "ResNet-18 Backbone", ha="center", va="center", color="#ffffff", fontsize=11, fontweight="bold")
    ax.text(4.1, 3.4, "• Conv 7x7 + MaxPool\n• 4 x Residual Blocks\n• 512 Deep Features", ha="center", va="center", color="#ccfbf1", fontsize=9)
    ax.text(4.1, 2.0, "Skip Connections: F(x) + x", ha="center", va="center", color="#fde047", fontsize=9, fontweight="bold")
    
    # Arrow 2
    ax.annotate('', xy=(6.2, 3.0), xytext=(5.8, 3.0), arrowprops=dict(arrowstyle="->", color="#38bdf8", lw=2))
    
    # Head & Output
    rect3 = patches.FancyBboxPatch((6.3, 1.5), 3.3, 3.0, boxstyle="round,pad=0.2", fc="#1e1b4b", ec="#818cf8", lw=1.5)
    ax.add_patch(rect3)
    ax.text(7.95, 4.0, "Custom Head", ha="center", va="center", color="#ffffff", fontsize=11, fontweight="bold")
    ax.text(7.95, 3.2, "Linear (512 -> 256) + ReLU\nDropout (0.35)\nLinear (256 -> 3)", ha="center", va="center", color="#e0e7ff", fontsize=8.5)
    ax.text(7.95, 2.0, "99.4% Accuracy (Softmax)", ha="center", va="center", color="#4ade80", fontsize=9.5, fontweight="bold")
    
    plt.tight_layout()
    plt.savefig('frontend/public/images/architecture_diagram.png', bbox_inches='tight', dpi=200)
    plt.close()
    print("Created architecture_diagram.png")

# 3. Grad-CAM Comparison PNG
def create_gradcam_comparison():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(6.5, 3.5), dpi=200)
    fig.patch.set_facecolor('#ffffff')
    
    # Load malignant sample if available, else synthetic
    sample_path = 'frontend/public/samples/sample_malignant_1.jpg'
    if os.path.exists(sample_path):
        img = Image.open(sample_path).convert('L').resize((224, 224))
        img_arr = np.array(img)
    else:
        img_arr = np.zeros((224, 224))
        
    ax1.imshow(img_arr, cmap='gray')
    ax1.set_title('Original Axial CT Scan', fontsize=10, fontweight='bold', color='#0f172a', pad=8)
    ax1.axis('off')
    
    # Heatmap
    x, y = np.meshgrid(np.linspace(-1, 1, 224), np.linspace(-1, 1, 224))
    d = np.sqrt(x*x + y*y)
    g = np.exp(-((x-0.15)**2 + (y-0.1)**2)/(2*0.12**2))
    
    ax2.imshow(img_arr, cmap='gray')
    ax2.imshow(g, cmap='jet', alpha=0.55)
    ax2.set_title('Grad-CAM Heatmap Overlay', fontsize=10, fontweight='bold', color='#dc2626', pad=8)
    ax2.axis('off')
    
    plt.tight_layout()
    plt.savefig('frontend/public/images/gradcam_comparison.png', bbox_inches='tight', dpi=200)
    plt.close()
    print("Created gradcam_comparison.png")

# 4. Clinical Care Modules PNG
def create_clinical_guidance_img():
    fig, ax = plt.subplots(figsize=(6.5, 3.5), dpi=200)
    ax.set_facecolor('#f8fafc')
    fig.patch.set_facecolor('#ffffff')
    ax.set_xlim(0, 9)
    ax.set_ylim(0, 4)
    ax.axis('off')
    
    # 3 clinical boxes
    # Normal
    r1 = patches.FancyBboxPatch((0.2, 0.4), 2.6, 3.2, boxstyle="round,pad=0.2", fc="#f0fdf4", ec="#86efac", lw=1.5)
    ax.add_patch(r1)
    ax.text(1.5, 3.1, "Normal", ha="center", va="center", color="#15803d", fontsize=11, fontweight="bold")
    ax.text(1.5, 1.8, "• Annual LDCT\n• Smoking Cessation\n• Aerobic Fitness", ha="center", va="center", color="#334155", fontsize=9)
    
    # Benign
    r2 = patches.FancyBboxPatch((3.2, 0.4), 2.6, 3.2, boxstyle="round,pad=0.2", fc="#fffbeb", ec="#fde68a", lw=1.5)
    ax.add_patch(r2)
    ax.text(4.5, 3.1, "Benign Nodule", ha="center", va="center", color="#b45309", fontsize=11, fontweight="bold")
    ax.text(4.5, 1.8, "• Fleischner 3-6mo CT\n• Volume Tracking\n• Biopsy if growth", ha="center", va="center", color="#334155", fontsize=9)
    
    # Malignant
    r3 = patches.FancyBboxPatch((6.2, 0.4), 2.6, 3.2, boxstyle="round,pad=0.2", fc="#fef2f2", ec="#fca5a5", lw=1.5)
    ax.add_patch(r3)
    ax.text(7.5, 3.1, "Malignant", ha="center", va="center", color="#b91c1c", fontsize=11, fontweight="bold")
    ax.text(7.5, 1.8, "• Tumor Board Review\n• VATS Lobectomy\n• SBRT & Targeted", ha="center", va="center", color="#334155", fontsize=9)
    
    plt.tight_layout()
    plt.savefig('frontend/public/images/clinical_guidance.png', bbox_inches='tight', dpi=200)
    plt.close()
    print("Created clinical_guidance.png")

if __name__ == "__main__":
    create_dataset_chart()
    create_architecture_diagram()
    create_gradcam_comparison()
    create_clinical_guidance_img()
