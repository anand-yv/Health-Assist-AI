import models from "../data/models.json";
import type { LinearModel } from "../lib/predict";

export interface Field {
  key: string; // CSV column name – must match the model's featureNames
  label: string;
  hint?: string;
  unit?: string;
  step?: number | "any";
  options?: { value: number; label: string }[]; // renders a <select>
  group?: string;
}

export interface Disease {
  id: "diabetes" | "heart" | "parkinsons";
  name: string;
  icon: string;
  tagline: string;
  algorithm: string;
  dataset: string;
  positiveText: string;
  negativeText: string;
  fields: Field[];
  model: LinearModel;
  metrics: { trainAccuracy: number; testAccuracy: number; samples: number; positiveShare: number };
  examples: { positive: number[]; negative: number[] };
}

const m = models as Record<string, any>;
const yesNo = [{ value: 0, label: "No" }, { value: 1, label: "Yes" }];

const diabetesFields: Field[] = [
  { key: "Pregnancies", label: "Pregnancies", hint: "Number of times pregnant", step: 1 },
  { key: "Glucose", label: "Glucose", unit: "mg/dL", hint: "Plasma glucose, 2h oral glucose tolerance test", step: 1 },
  { key: "BloodPressure", label: "Blood pressure", unit: "mm Hg", hint: "Diastolic", step: 1 },
  { key: "SkinThickness", label: "Skin thickness", unit: "mm", hint: "Triceps skin-fold", step: 1 },
  { key: "Insulin", label: "Insulin", unit: "µU/mL", hint: "2-hour serum insulin", step: 1 },
  { key: "BMI", label: "BMI", unit: "kg/m²", step: 0.1 },
  { key: "DiabetesPedigreeFunction", label: "Diabetes pedigree function", hint: "Genetic family-history score", step: 0.001 },
  { key: "Age", label: "Age", unit: "years", step: 1 },
];

const heartFields: Field[] = [
  { key: "age", label: "Age", unit: "years", step: 1 },
  { key: "sex", label: "Sex", options: [{ value: 0, label: "Female" }, { value: 1, label: "Male" }] },
  { key: "cp", label: "Chest pain type", options: [
    { value: 0, label: "0 – Typical angina" }, { value: 1, label: "1 – Atypical angina" },
    { value: 2, label: "2 – Non-anginal pain" }, { value: 3, label: "3 – Asymptomatic" }] },
  { key: "trestbps", label: "Resting blood pressure", unit: "mm Hg", step: 1 },
  { key: "chol", label: "Serum cholesterol", unit: "mg/dL", step: 1 },
  { key: "fbs", label: "Fasting blood sugar > 120 mg/dL", options: yesNo },
  { key: "restecg", label: "Resting ECG result", options: [
    { value: 0, label: "0 – Normal" }, { value: 1, label: "1 – ST-T abnormality" }, { value: 2, label: "2 – LV hypertrophy" }] },
  { key: "thalach", label: "Max heart rate achieved", unit: "bpm", step: 1 },
  { key: "exang", label: "Exercise-induced angina", options: yesNo },
  { key: "oldpeak", label: "ST depression (exercise)", hint: "Relative to rest", step: 0.1 },
  { key: "slope", label: "Slope of peak exercise ST", options: [
    { value: 0, label: "0 – Upsloping" }, { value: 1, label: "1 – Flat" }, { value: 2, label: "2 – Downsloping" }] },
  { key: "ca", label: "Major vessels coloured by fluoroscopy", options: [0, 1, 2, 3, 4].map((v) => ({ value: v, label: String(v) })) },
  { key: "thal", label: "Thalassemia", options: [
    { value: 0, label: "0 – Null" }, { value: 1, label: "1 – Fixed defect" },
    { value: 2, label: "2 – Normal" }, { value: 3, label: "3 – Reversible defect" }] },
];

const pf = (key: string, group: string, hint?: string): Field => ({ key, label: key, group, hint, step: "any" });
const parkinsonsFields: Field[] = [
  pf("MDVP:Fo(Hz)", "Fundamental frequency", "Average vocal fundamental frequency"),
  pf("MDVP:Fhi(Hz)", "Fundamental frequency", "Maximum vocal fundamental frequency"),
  pf("MDVP:Flo(Hz)", "Fundamental frequency", "Minimum vocal fundamental frequency"),
  pf("MDVP:Jitter(%)", "Jitter (frequency variation)"),
  pf("MDVP:Jitter(Abs)", "Jitter (frequency variation)"),
  pf("MDVP:RAP", "Jitter (frequency variation)"),
  pf("MDVP:PPQ", "Jitter (frequency variation)"),
  pf("Jitter:DDP", "Jitter (frequency variation)"),
  pf("MDVP:Shimmer", "Shimmer (amplitude variation)"),
  pf("MDVP:Shimmer(dB)", "Shimmer (amplitude variation)"),
  pf("Shimmer:APQ3", "Shimmer (amplitude variation)"),
  pf("Shimmer:APQ5", "Shimmer (amplitude variation)"),
  pf("MDVP:APQ", "Shimmer (amplitude variation)"),
  pf("Shimmer:DDA", "Shimmer (amplitude variation)"),
  pf("NHR", "Noise ratios", "Noise-to-harmonics ratio"),
  pf("HNR", "Noise ratios", "Harmonics-to-noise ratio"),
  pf("RPDE", "Nonlinear measures", "Recurrence period density entropy"),
  pf("DFA", "Nonlinear measures", "Detrended fluctuation analysis"),
  pf("spread1", "Nonlinear measures"),
  pf("spread2", "Nonlinear measures"),
  pf("D2", "Nonlinear measures", "Correlation dimension"),
  pf("PPE", "Nonlinear measures", "Pitch period entropy"),
];

export const DISEASES: Disease[] = [
  {
    id: "diabetes", name: "Diabetes", icon: "🩸",
    tagline: "Screens for diabetes from 8 clinical measurements.",
    algorithm: "Support Vector Machine (linear kernel)", dataset: "Pima Indians Diabetes Database",
    positiveText: "The model predicts this person is likely diabetic.",
    negativeText: "The model predicts this person is likely not diabetic.",
    fields: diabetesFields, model: m.diabetes, metrics: m.diabetes.metrics, examples: m.diabetes.examples,
  },
  {
    id: "heart", name: "Heart disease", icon: "❤️",
    tagline: "Estimates heart-disease risk from 13 cardiac indicators.",
    algorithm: "Logistic Regression", dataset: "Cleveland Heart Disease dataset (UCI)",
    positiveText: "The model predicts signs of heart disease.",
    negativeText: "The model predicts no signs of heart disease.",
    fields: heartFields, model: m.heart, metrics: m.heart.metrics, examples: m.heart.examples,
  },
  {
    id: "parkinsons", name: "Parkinson's", icon: "🧠",
    tagline: "Detects Parkinson's from 22 voice-recording biomarkers.",
    algorithm: "Support Vector Machine (linear kernel)", dataset: "Oxford Parkinson's Disease Detection (UCI)",
    positiveText: "The model predicts signs of Parkinson's disease.",
    negativeText: "The model predicts no signs of Parkinson's disease.",
    fields: parkinsonsFields, model: m.parkinsons, metrics: m.parkinsons.metrics, examples: m.parkinsons.examples,
  },
];

// Fail loudly in dev if config and exported model drift apart.
for (const d of DISEASES) {
  const a = d.fields.map((f) => f.key).join("|");
  const b = d.model.featureNames.join("|");
  if (a !== b) throw new Error(`${d.id}: field config does not match model features`);
}
