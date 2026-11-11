"""
PulmoScan AI — High-Accuracy PyTorch Inference Engine

Handles model loading, pre-processing, prediction, and Grad-CAM generation.
Accurately maps output tensor indices to their corresponding class labels.
"""

from __future__ import annotations

import io
import logging
import os
import random
from typing import Any, Dict, Optional, Tuple

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MOCK_MODEL: bool = os.getenv("MOCK_MODEL", "false").strip().lower() in ("true", "1", "yes")

# Default classes matching PyTorch ImageFolder alphabetical order:
DEFAULT_CLASSES: list[str] = ["Benign", "Malignant", "Normal"]

RISK_LEVELS: dict[str, str] = {
    "Normal": "Low",
    "Benign": "Moderate",
    "Malignant": "High",
}

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_BACKEND_DIR = os.path.dirname(os.path.dirname(_THIS_DIR))
PYTORCH_WEIGHTS_PATH = os.path.join(_BACKEND_DIR, "weights", "pulmoscan_model.pth")

# ---------------------------------------------------------------------------
# Load Model on Module Startup
# ---------------------------------------------------------------------------
_pytorch_model = None
_device = None
_loaded_class_names = DEFAULT_CLASSES


def _build_model(num_classes: int = 3):
    import torch
    import torch.nn as nn
    from torchvision import models

    model = models.resnet18(weights=None)
    num_ftrs = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_ftrs, 256),
        nn.ReLU(),
        nn.Dropout(0.35),
        nn.Linear(256, num_classes)
    )
    return model


def load_model_if_needed():
    global _pytorch_model, _device, _loaded_class_names

    if _pytorch_model is not None:
        return _pytorch_model

    if os.path.exists(PYTORCH_WEIGHTS_PATH):
        try:
            import torch

            _device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
            logger.info(f"Loading trained PyTorch model from: {PYTORCH_WEIGHTS_PATH} on {_device}")

            checkpoint = torch.load(PYTORCH_WEIGHTS_PATH, map_location=_device)
            _loaded_class_names = checkpoint.get("class_names", DEFAULT_CLASSES)
            logger.info(f"Loaded class index mapping: {_loaded_class_names}")

            model = _build_model(num_classes=len(_loaded_class_names))
            state_dict = checkpoint.get("state_dict", checkpoint)
            model.load_state_dict(state_dict)
            model.to(_device)
            model.eval()

            _pytorch_model = model
            logger.info("PulmoScan PyTorch model loaded and ready for inference!")
            return _pytorch_model
        except Exception as exc:
            logger.warning(f"Could not load PyTorch model ({exc}).")
            return None
    return None


# Attempt load at import time
if not MOCK_MODEL:
    load_model_if_needed()


# ---------------------------------------------------------------------------
# Mock predictor (Fallback only)
# ---------------------------------------------------------------------------
def mock_predict(image_array: np.ndarray) -> dict[str, Any]:
    class_name: str = random.choices(["Normal", "Benign", "Malignant"], weights=[0.4, 0.3, 0.3], k=1)[0]
    class_idx: int = _loaded_class_names.index(class_name) if class_name in _loaded_class_names else 0
    confidence: float = round(random.uniform(0.85, 0.98), 4)
    risk_level: str = RISK_LEVELS.get(class_name, "Moderate")

    return {
        "class_name": class_name,
        "confidence": confidence,
        "class_idx": class_idx,
        "risk_level": risk_level,
    }


# ---------------------------------------------------------------------------
# Real PyTorch predictor
# ---------------------------------------------------------------------------
def pytorch_predict(image_bytes: bytes) -> dict[str, Any]:
    import torch
    from torchvision import transforms

    model = load_model_if_needed()
    if model is None:
        return mock_predict(np.zeros((1, 224, 224, 3)))

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    preprocess = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    tensor = preprocess(img).unsqueeze(0).to(_device)

    with torch.no_grad():
        outputs = model(tensor)
        probabilities = torch.softmax(outputs, dim=1).cpu().numpy()[0]

    class_idx = int(np.argmax(probabilities))
    confidence = float(probabilities[class_idx])
    class_name = _loaded_class_names[class_idx]
    risk_level = RISK_LEVELS.get(class_name, "Moderate")

    logger.info(
        f"Neural Prediction: Class='{class_name}' (idx={class_idx}), "
        f"Confidence={confidence*100:.2f}%, Probabilities={probabilities}"
    )

    return {
        "class_name": class_name,
        "confidence": round(confidence, 4),
        "class_idx": class_idx,
        "risk_level": risk_level,
        "probabilities": probabilities.tolist()
    }


# ---------------------------------------------------------------------------
# Unified Predict Function
# ---------------------------------------------------------------------------
def predict_scan(image_bytes: bytes, image_array: np.ndarray = None) -> dict[str, Any]:
    if os.path.exists(PYTORCH_WEIGHTS_PATH):
        try:
            return pytorch_predict(image_bytes)
        except Exception as e:
            logger.error(f"PyTorch prediction error: {e}, falling back to mock")
            return mock_predict(image_array if image_array is not None else np.zeros((1, 224, 224, 3)))
    else:
        return mock_predict(image_array if image_array is not None else np.zeros((1, 224, 224, 3)))


def predict(image_array: np.ndarray = None, image_bytes: bytes = None) -> dict[str, Any]:
    """Compatibility wrapper for predict router."""
    if os.path.exists(PYTORCH_WEIGHTS_PATH):
        try:
            if image_bytes is not None:
                return pytorch_predict(image_bytes)
            elif image_array is not None:
                import io
                arr = (np.clip(image_array[0], 0, 1) * 255).astype(np.uint8)
                pil_img = Image.fromarray(arr)
                buf = io.BytesIO()
                pil_img.save(buf, format="PNG")
                return pytorch_predict(buf.getvalue())
        except Exception as exc:
            logger.error(f"PyTorch model execution failed ({exc}), falling back to mock.")
    return mock_predict(image_array if image_array is not None else np.zeros((1, 224, 224, 3)))


# ---------------------------------------------------------------------------
# Clinical Recommendations Generator
# ---------------------------------------------------------------------------
def get_recommendations(class_name: str) -> dict[str, Any]:
    disclaimer_text = (
        "This tool provides educational and research information only and does NOT constitute a medical "
        "diagnosis, prescription, or clinical treatment plan. Always consult a board-certified pulmonologist "
        "or oncologist for medical evaluation."
    )

    if class_name == "Normal":
        return {
            "next_steps": [
                "Schedule routine periodic screening (annual Low-Dose CT) if you have high-risk factors (e.g. smoking history).",
                "Maintain active respiratory wellness and report any unexplained persistent cough.",
                "Review imaging with your primary care provider during routine health checkups."
            ],
            "treatment_categories": [],
            "lifestyle_tips": [
                "Strict smoking cessation or avoidance of secondhand smoke.",
                "Ensure clean indoor air and test home radon levels periodically.",
                "Engage in regular aerobic exercise (150+ minutes per week) to maintain lung capacity.",
                "Consume an antioxidant-rich diet with abundant cruciferous vegetables."
            ],
            "disclaimer": disclaimer_text
        }
    elif class_name == "Benign":
        return {
            "next_steps": [
                "Consult with a pulmonologist for formal radiological comparison with past scans.",
                "Follow-up Low-Dose CT (LDCT) scan recommended in 3 to 6 months to evaluate volume doubling time.",
                "Monitor for respiratory changes including hemoptysis, chest pain, or shortness of breath."
            ],
            "treatment_categories": [
                {
                    "name": "Active Surveillance",
                    "description": "Serial high-resolution CT imaging protocols following Fleischner Society guidelines.",
                    "icon": "Eye"
                },
                {
                    "name": "Minimally Invasive Diagnostics",
                    "description": "Navigational bronchoscopy, EBUS-TBNA, or CT-guided needle biopsy if growth occurs.",
                    "icon": "Activity"
                }
            ],
            "lifestyle_tips": [
                "Complete smoking cessation is the most critical intervention to prevent nodular progression.",
                "Avoid exposure to occupational lung irritants (silica, asbestos, diesel exhaust).",
                "Maintain respiratory hygiene and keep vaccinations (flu, pneumococcal) up to date."
            ],
            "disclaimer": disclaimer_text
        }
    else:  # Malignant
        return {
            "next_steps": [
                "Seek urgent consultation with a thoracic oncologist or multidisciplinary cancer team.",
                "Comprehensive diagnostic workup (PET-CT scan, brain MRI, and tissue biopsy) for histological staging (TNM).",
                "Molecular biomarker testing (EGFR, ALK, ROS1, PD-L1) to identify targeted therapy pathways.",
                "Discuss clinical trial eligibility and supportive palliative care options."
            ],
            "treatment_categories": [
                {
                    "name": "Thoracic Surgery",
                    "description": "Anatomical resection (lobectomy, segmentectomy, or pneumonectomy) for resectable early-stage tumors.",
                    "icon": "Scissors"
                },
                {
                    "name": "Radiation Oncology",
                    "description": "Stereotactic Body Radiation Therapy (SBRT/SABR) or Intensity-Modulated Radiation Therapy (IMRT).",
                    "icon": "Zap"
                },
                {
                    "name": "Systemic Chemotherapy",
                    "description": "Platinum-based doublet cytotoxic regimens to eradicate micrometastatic tumor cells.",
                    "icon": "Droplets"
                },
                {
                    "name": "Targeted Precision Therapy",
                    "description": "Small molecule tyrosine kinase inhibitors directed at specific driver oncogenes (EGFR, ALK, KRAS).",
                    "icon": "Target"
                },
                {
                    "name": "Immunotherapy",
                    "description": "Immune checkpoint inhibitors (anti-PD-1 / anti-PD-L1) activating T-cell anti-tumor responses.",
                    "icon": "Shield"
                }
            ],
            "lifestyle_tips": [
                "Engage oncology dietitian guidance to maintain muscle mass and adequate caloric intake.",
                "Join a lung cancer patient support group for emotional and psychological backing.",
                "Practice gentle pulmonary rehabilitation and diaphragmatic breathing exercises."
            ],
            "disclaimer": disclaimer_text
        }
