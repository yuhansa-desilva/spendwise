import json
from datetime import date
from pathlib import Path

import joblib
import matplotlib

matplotlib.use("Agg")  # draw to a file, not a window
import matplotlib.pyplot as plt
import pandas as pd
import sklearn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    accuracy_score,
    classification_report,
    f1_score,
)
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import FeatureUnion, Pipeline

BASE = Path(__file__).parent
DATA = BASE / "data"
MODELS = BASE / "models"
MODELS.mkdir(exist_ok=True)

train = pd.read_csv(DATA / "transactions.csv")
test = pd.read_csv(DATA / "hand_labeled_test.csv")
print(f"Training rows: {len(train)}, hand-labeled test rows: {len(test)}\n")


def build_model():
    features = FeatureUnion(
        [
            ("word", TfidfVectorizer(lowercase=True, ngram_range=(1, 2))),
            (
                "char",
                TfidfVectorizer(
                    lowercase=True, analyzer="char_wb", ngram_range=(2, 5)
                ),
            ),
        ]
    )
    return Pipeline(
        [
            ("features", features),
            ("clf", LogisticRegression(max_iter=1000, C=10)),
        ]
    )


# 1) Cross-validation on the synthetic data. This number is OPTIMISTIC,
#    because every fold comes from the same generator.
cv_scores = cross_val_score(
    build_model(), train["description"], train["category"], cv=5
)
cv_accuracy = cv_scores.mean()
print(f"5-fold cross-validation on synthetic data: {cv_accuracy:.4f}")

# 2) Train on ALL synthetic rows, then grade on the hand-written set,
#    which the model has never seen. This is the HONEST number.
model = build_model()
model.fit(train["description"], train["category"])
pred = model.predict(test["description"])

accuracy = accuracy_score(test["category"], pred)
macro_f1 = f1_score(test["category"], pred, average="macro")
print(f"Hand-labeled test accuracy: {accuracy:.4f} (n = {len(test)})")
print(f"Hand-labeled test macro F1: {macro_f1:.4f}\n")

print("Per-category results:")
print(classification_report(test["category"], pred, zero_division=0))

# 3) Error analysis: which rows did the model get wrong?
wrong = test["category"].to_numpy() != pred
errors = test[wrong].copy()
errors["predicted"] = pred[wrong]
print("Misclassified hand-labeled rows:")
if len(errors) == 0:
    print("  none")
else:
    print(errors.to_string(index=False))

# 4) Confusion matrix picture
labels = sorted(train["category"].unique())
fig, ax = plt.subplots(figsize=(8, 7))
ConfusionMatrixDisplay.from_predictions(
    test["category"],
    pred,
    labels=labels,
    xticks_rotation=45,
    ax=ax,
    colorbar=False,
)
ax.set_title("Categorizer: confusion matrix (hand-labeled test set)")
fig.tight_layout()
fig.savefig(MODELS / "confusion_matrix.png", dpi=150)

# 5) Save the model and its metrics
joblib.dump(model, MODELS / "categorizer.joblib")
metrics = {
    "trained_on_rows": int(len(train)),
    "cv_accuracy_synthetic": round(float(cv_accuracy), 4),
    "hand_test_rows": int(len(test)),
    "hand_test_accuracy": round(float(accuracy), 4),
    "hand_test_macro_f1": round(float(macro_f1), 4),
    "scikit_learn_version": sklearn.__version__,
    "trained_on_date": date.today().isoformat(),
}
with open(MODELS / "categorizer_metrics.json", "w", encoding="utf-8") as f:
    json.dump(metrics, f, indent=2)

print(f"\nSaved model, metrics and confusion matrix to {MODELS}")