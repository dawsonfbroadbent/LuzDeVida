"""
Convert joblib ML models to ONNX format for .NET ONNX Runtime consumption.

Run once:  python convert_to_onnx.py

Outputs .onnx files to ../backend/LuzDeVida.API/OnnxModels/
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from skl2onnx import to_onnx, update_registered_converter
from skl2onnx.common.data_types import FloatTensorType, StringTensorType

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
OUTPUT_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "backend", "LuzDeVida.API", "OnnxModels",
)
os.makedirs(OUTPUT_DIR, exist_ok=True)


def save_onnx(model, sample_df, name):
    """Convert and save a model, then print its input/output schema."""
    onnx_model = to_onnx(model, sample_df, target_opset=17,
                         options={id(model): {"zipmap": False}})
    path = os.path.join(OUTPUT_DIR, f"{name}.onnx")
    with open(path, "wb") as f:
        f.write(onnx_model.SerializeToString())

    print(f"\n  Saved: {path}")
    print(f"  Inputs:")
    for inp in onnx_model.graph.input:
        shape = [d.dim_value for d in inp.type.tensor_type.shape.dim]
        dtype = inp.type.tensor_type.elem_type  # 1=float, 8=string
        print(f"    {inp.name}: shape={shape}, dtype={'string' if dtype == 8 else 'float'}")
    print(f"  Outputs:")
    for out in onnx_model.graph.output:
        print(f"    {out.name}")


# =========================================================================
#  1. Donor Churn  (ColumnTransformer: StandardScaler + OneHotEncoder)
# =========================================================================
print("Converting donor churn model...")
donor_model = joblib.load(os.path.join(MODEL_DIR, "donor_churn_model.joblib"))
donor_config = joblib.load(os.path.join(MODEL_DIR, "feature_config.joblib"))

numeric_features = donor_config["numeric_features"]
categorical_features = donor_config["categorical_features"]

sample_data = {}
for f in numeric_features:
    sample_data[f] = np.array([0.0], dtype=np.float32)
for f in categorical_features:
    sample_data[f] = np.array(["unknown"], dtype=object)

# Patch OneHotEncoder: ONNX doesn't support 'infrequent_if_exist',
# switch to 'ignore' so unknown categories produce zero vectors instead of errors.
ohe = donor_model.named_steps["prep"].named_transformers_["cat"]
ohe.handle_unknown = "ignore"

sample_df = pd.DataFrame(sample_data)
save_onnx(donor_model, sample_df, "donor_churn_model")

# Also save feature config as JSON for C# consumption
donor_config_json = {
    "numeric_features": numeric_features,
    "categorical_features": categorical_features,
    "risk_thresholds": donor_config["risk_thresholds"],
}
with open(os.path.join(OUTPUT_DIR, "donor_churn_config.json"), "w") as f:
    json.dump(donor_config_json, f, indent=2)

# =========================================================================
#  2. Resident Risk  (StandardScaler only -- all numeric)
# =========================================================================
print("\nConverting resident risk model...")
resident_model = joblib.load(os.path.join(MODEL_DIR, "resident_risk_model.joblib"))
resident_config = joblib.load(os.path.join(MODEL_DIR, "resident_risk_feature_config.joblib"))

numeric_features_r = resident_config["numeric_features"]

sample_data_r = {f: np.array([0.0], dtype=np.float32) for f in numeric_features_r}
sample_df_r = pd.DataFrame(sample_data_r)
save_onnx(resident_model, sample_df_r, "resident_risk_model")

resident_config_json = {
    "numeric_features": numeric_features_r,
    "risk_thresholds": resident_config["risk_thresholds"],
}
with open(os.path.join(OUTPUT_DIR, "resident_risk_config.json"), "w") as f:
    json.dump(resident_config_json, f, indent=2)

# =========================================================================
#  3. Social Media  (StandardScaler only -- all numeric, pre-encoded)
# =========================================================================
print("\nConverting social media model...")
social_model = joblib.load(os.path.join(MODEL_DIR, "social_media_model.joblib"))
social_config = joblib.load(os.path.join(MODEL_DIR, "social_media_feature_config.joblib"))

features_s = social_config["features"]

sample_data_s = {f: np.array([0.0], dtype=np.float32) for f in features_s}
sample_df_s = pd.DataFrame(sample_data_s)
save_onnx(social_model, sample_df_s, "social_media_model")

social_config_json = {
    "features": features_s,
    "conversion_thresholds": social_config["conversion_thresholds"],
}
with open(os.path.join(OUTPUT_DIR, "social_media_config.json"), "w") as f:
    json.dump(social_config_json, f, indent=2)

print("\nDone! All models converted to ONNX.")
