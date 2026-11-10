# 🩺 Health Assist AI

Machine-learning risk screening for **diabetes**, **heart disease** and **Parkinson's disease** — a React app that runs
the trained models **entirely in the browser**. No backend, no database, no data collection.

🌐 **Live site: https://anand-yv.github.io/Health-Assist-AI/**

> Educational demo only — not medical advice.

## Why there is no backend
All three models are linear (linear-kernel SVM ×2, logistic regression), so a prediction is `sign(w·x + b)`.
`ml/train_and_export.py` retrains them with the original notebooks' recipe and exports weights to
`web/src/data/models.json`; the front-end evaluates them directly. The result is a static site that hosts free anywhere.

| Model | Algorithm | Test accuracy |
|---|---|---|
| Diabetes (Pima) | Linear SVM | 77.3% |
| Heart disease (Cleveland) | Logistic Regression | 82.0% |
| Parkinson's (Oxford) | Linear SVM | 87.2% |

The retrained models agree with the original pickles on 100% of dataset rows.

## Project layout
```
web/      React + TypeScript + Vite app (the deployable site)
ml/       training script, datasets, original Colab notebooks
legacy/   original Streamlit app + pickled models (kept for reference)
```

## Run locally
```bash
cd web && npm install && npm run dev      # http://localhost:5173
npm test                                  # model sanity tests
npm run build                             # static site in web/dist
```
Retrain / re-export models (optional): `pip install -r ml/requirements.txt && python ml/train_and_export.py`

## Deploy (free)
- **Vercel / Netlify / Cloudflare Pages:** root directory `web`, build `npm run build`, output `dist`.
- **GitHub Pages (used for the live site):** push to `main`; enable *Settings → Pages → Source: GitHub Actions* (workflow included).
