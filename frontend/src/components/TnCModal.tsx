/**
 * TnCModal — Terms & Conditions modal with gas explanations,
 * AQI scale, health impacts, and user guidelines.
 */
import { useState } from 'react';
import { X, Wind, Info, HeartPulse, BookOpen, AlertCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

type TncTab = 'gases' | 'scale' | 'health' | 'guide';

const TAB_ITEMS: { id: TncTab; label: string; icon: React.ReactNode }[] = [
  { id: 'gases', label: 'Gas Guide', icon: <Wind className="h-4 w-4" /> },
  { id: 'scale', label: 'AQI Scale', icon: <AlertCircle className="h-4 w-4" /> },
  { id: 'health', label: 'Health Impacts', icon: <HeartPulse className="h-4 w-4" /> },
  { id: 'guide', label: 'User Guide', icon: <BookOpen className="h-4 w-4" /> },
];

const GAS_DATA = [
  { name: 'CO (Carbon Monoxide)', color: '#f59e0b', desc: 'Produced by incomplete combustion of fuels. High levels reduce oxygen delivery to organs. Sources: vehicles, industrial processes.', safe: '< 4 mg/m³' },
  { name: 'NO₂ (Nitrogen Dioxide)', color: '#ef4444', desc: 'Formed from burning fossil fuels. Irritates airways and worsens respiratory conditions. Sources: traffic, power plants.', safe: '< 40 μg/m³' },
  { name: 'SO₂ (Sulfur Dioxide)', color: '#a855f7', desc: 'Released by burning coal and oil. Causes acid rain and respiratory irritation. Sources: power plants, volcanic activity.', safe: '< 20 μg/m³' },
  { name: 'O₃ (Ground-level Ozone)', color: '#06b6d4', desc: 'Formed when pollutants react in sunlight. Causes chest pain and throat irritation. Worse on hot sunny days.', safe: '< 100 μg/m³' },
  { name: 'PM₂.₅ (Fine Particles)', color: '#ec4899', desc: 'Tiny particles ≤2.5μm. Penetrate deep into lungs and bloodstream. Linked to heart disease and cancer. Sources: combustion, dust.', safe: '< 15 μg/m³' },
  { name: 'PM₁₀ (Coarse Particles)', color: '#f97316', desc: 'Particles ≤10μm. Cause respiratory irritation. Sources: road dust, pollen, construction.', safe: '< 45 μg/m³' },
  { name: 'NH₃ (Ammonia)', color: '#84cc16', desc: 'From agricultural and industrial sources. Irritates eyes, nose and throat at high concentrations.', safe: '< 200 μg/m³' },
];

const AQI_SCALE = [
  { level: 1, label: 'Good', color: '#22c55e', who: 'Air quality is satisfactory; little or no risk.', emoji: '😊' },
  { level: 2, label: 'Fair', color: '#eab308', who: 'Acceptable; minor concern for very sensitive individuals.', emoji: '🙂' },
  { level: 3, label: 'Moderate', color: '#f97316', who: 'Sensitive groups may experience effects.', emoji: '😐' },
  { level: 4, label: 'Poor', color: '#ef4444', who: 'Everyone may experience adverse effects.', emoji: '😷' },
  { level: 5, label: 'Very Poor', color: '#7c3aed', who: 'Health alert — emergency conditions for everyone.', emoji: '🚨' },
];

const HEALTH_IMPACTS = [
  { group: 'Children', icon: '👶', impact: 'Developing lungs are especially vulnerable. Exposure to PM2.5 and ozone can impair lung growth and increase asthma risk.' },
  { group: 'Elderly (60+)', icon: '👴', impact: 'Reduced respiratory and cardiac reserve. High AQI increases risk of heart attack and stroke.' },
  { group: 'Asthma/COPD', icon: '🫁', impact: 'Pollutants directly trigger bronchospasm. NO₂ and PM2.5 are the primary triggers.' },
  { group: 'Pregnant Women', icon: '🤰', impact: 'Air pollution linked to preterm birth and low birth weight. Avoid outdoor activity when AQI ≥ 3.' },
  { group: 'Healthy Adults', icon: '🏃', impact: 'Generally safe at AQI 1–2. Reduce intense outdoor exercise when AQI ≥ 4.' },
];

export default function TnCModal({ open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TncTab>('gases');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal aria-label="Terms and Conditions">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-sky flex items-center justify-center">
              <Info className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Terms &amp; Data Guide</h2>
              <p className="text-xs text-muted-foreground">Understanding AQI and your health data</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-3 border-b bg-secondary/30 overflow-x-auto">
          {TAB_ITEMS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === t.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {activeTab === 'gases' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Each pollutant has different health effects. WHO-recommended safe levels are shown.</p>
              {GAS_DATA.map((g) => (
                <div key={g.name} className="rounded-xl border p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
                    <span className="font-semibold text-sm">{g.name}</span>
                    <span className="ml-auto text-xs bg-secondary px-2 py-0.5 rounded-full">Safe: {g.safe}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{g.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'scale' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">OpenWeatherMap uses a 1–5 scale aligned with European Air Quality Index standards.</p>
              {AQI_SCALE.map((a) => (
                <div key={a.level} className="flex items-center gap-4 rounded-xl border p-4" style={{ borderLeftColor: a.color, borderLeftWidth: 4 }}>
                  <span className="text-2xl">{a.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: a.color }}>Level {a.level} — {a.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{a.who}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-2">Different groups face varying levels of risk. Our prediction engine accounts for these factors.</p>
              {HEALTH_IMPACTS.map((h) => (
                <div key={h.group} className="rounded-xl border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{h.icon}</span>
                    <span className="font-semibold">{h.group}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{h.impact}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-sm text-muted-foreground">
              <h3 className="font-semibold text-foreground text-base">📖 How to Use UAQI</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li><strong className="text-foreground">Search your city</strong> — Use the location search on the Dashboard to fetch real-time AQI data for any city worldwide.</li>
                <li><strong className="text-foreground">Check pollutant levels</strong> — The Dashboard displays 8 key pollutants with color-coded indicators.</li>
                <li><strong className="text-foreground">Run a health prediction</strong> — Go to the Predict page, enter your age, hours spent outdoors, and any health conditions. The engine calculates your personal risk score.</li>
                <li><strong className="text-foreground">Save your results</strong> — Click "Save to history" to store predictions in your personal database. Your data is private and linked to your account.</li>
                <li><strong className="text-foreground">Analyse trends</strong> — The Analytics page shows charts of your saved predictions over time.</li>
                <li><strong className="text-foreground">Download reports</strong> — Generate a PDF health report from the Dashboard.</li>
              </ol>
              <div className="mt-4 rounded-xl bg-secondary/50 p-4 border">
                <p className="text-xs">⚠️ <strong className="text-foreground">Disclaimer:</strong> UAQI data is informational only and does not constitute medical advice. Always consult a healthcare professional for health decisions. AQI data sourced from OpenWeatherMap.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
