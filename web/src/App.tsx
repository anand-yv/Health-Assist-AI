import { useState } from "react";
import { DISEASES } from "./config/diseases";
import PredictionForm from "./components/PredictionForm";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  const [id, setId] = useState(DISEASES[0].id);
  const disease = DISEASES.find((d) => d.id === id)!;

  return (
    <div className="app">
      <header className="topbar">
        <h1>Health Assist <em>AI</em></h1>
        <nav aria-label="Condition" className="tabs" role="tablist">
          {DISEASES.map((d) => (
            <button key={d.id} role="tab" aria-selected={d.id === id} className={d.id === id ? "tab active" : "tab"} onClick={() => setId(d.id)}>
              {d.name}
            </button>
          ))}
        </nav>
        <ThemeToggle />
      </header>

      <div className="layout">
        <PredictionForm key={disease.id} disease={disease} />
      </div>

      <footer>
        <span>Educational demo, not medical advice. Trained on small public datasets; never use it to diagnose.</span>
        <span className="mono">Runs in your browser · nothing is sent anywhere</span>
      </footer>
    </div>
  );
}
