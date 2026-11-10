"""Retrain the three Health Assist AI models and export them as JSON.

All three models are linear (linear-kernel SVM / logistic regression), so a
prediction is just  sign(w . x + b).  Exporting the weights lets the React
front-end run inference in the browser with no backend.

Usage:  python ml/train_and_export.py
"""
import json
import pickle
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn import svm
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
LEGACY = ROOT.parent / "legacy" / "original-models"
OUT = ROOT.parent / "web" / "src" / "data" / "models.json"

# Same recipes as the original notebooks (seeds, splits, hyper-parameters).
SPECS = {
    "diabetes": dict(csv="diabetes.csv", target="Outcome", drop=[], stratify=True,
                     model=lambda: svm.SVC(kernel="linear"), legacy="diabetes_model.sav"),
    "heart": dict(csv="heart.csv", target="target", drop=[], stratify=True,
                  model=lambda: LogisticRegression(), legacy="heart_disease_model.sav"),
    "parkinsons": dict(csv="parkinsons.csv", target="status", drop=["name"], stratify=False,
                       model=lambda: svm.SVC(kernel="linear"), legacy="parkinsons_model.sav"),
}


def build(key, spec):
    df = pd.read_csv(DATA / spec["csv"], encoding="utf-8-sig")
    X = df.drop(columns=[spec["target"], *spec["drop"]])
    y = df[spec["target"]]
    Xtr, Xte, ytr, yte = train_test_split(
        X, y, test_size=0.2, stratify=y if spec["stratify"] else None, random_state=2)
    model = spec["model"]().fit(Xtr, ytr)
    w, b = model.coef_[0], float(model.intercept_[0])

    # Sanity check: exported maths must equal sklearn on every row.
    manual = (X.values @ w + b > 0).astype(int)
    assert (manual == model.predict(X)).all(), f"{key}: export mismatch"

    # Compare with the original pickle (trained with sklearn 1.0.2).
    agreement = None
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            old = pickle.load(open(LEGACY / spec["legacy"], "rb"))
        agreement = float((old.predict(X.values) == model.predict(X.values)).mean())
    except Exception as e:  # pragma: no cover
        print(f"  (could not load legacy pickle: {e})")

    # Example patients straight from the held-out test set, correctly classified.
    pred_te = model.predict(Xte)
    examples = {}
    for label, cls in (("negative", 0), ("positive", 1)):
        idx = np.where((yte.values == cls) & (pred_te == cls))[0][0]
        examples[label] = [float(v) for v in Xte.iloc[idx].values]

    print(f"{key:11s} train={accuracy_score(ytr, model.predict(Xtr)):.4f} "
          f"test={accuracy_score(yte, pred_te):.4f} legacy-agreement={agreement}")
    return {
        "featureNames": list(X.columns),
        "weights": [float(v) for v in w],
        "intercept": b,
        "kind": "logistic" if key == "heart" else "svm",
        "metrics": {
            "trainAccuracy": float(accuracy_score(ytr, model.predict(Xtr))),
            "testAccuracy": float(accuracy_score(yte, pred_te)),
            "samples": int(len(df)),
            "positiveShare": float(y.mean()),
        },
        "stats": {c: {"min": float(X[c].min()), "max": float(X[c].max()),
                      "mean": float(X[c].mean()), "std": float(X[c].std())} for c in X.columns},
        "examples": examples,
        # Every real patient's score (w.x + b) and true label, for the result chart.
        "scores": [[round(float(v), 3), int(c)] for v, c in zip(X.values @ w + b, y.values)],
    }


if __name__ == "__main__":
    OUT.parent.mkdir(parents=True, exist_ok=True)
    result = {k: build(k, s) for k, s in SPECS.items()}
    OUT.write_text(json.dumps(result, indent=2))
    print("wrote", OUT)
