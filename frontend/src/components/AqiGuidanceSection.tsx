/**
 * AqiGuidanceSection — Comprehensive Terms & Conditions / Air Quality Guidance
 * Tabbed component with full pollutant details and AQI-level health recommendations.
 */
import { useState } from 'react';
import {
  Wind, Flame, Factory, Leaf, AlertTriangle, ShieldCheck,
  Activity, Info
} from 'lucide-react';
import { Card } from '@/components/ui/card';

type Tab = 'pollutants' | 'guidance';

/* ─── Pollutant Data ─────────────────────────────────────────────────── */
const POLLUTANTS = [
  {
    id: 'pm25',
    name: 'PM₂.₅',
    fullName: 'Fine Particulate Matter',
    color: '#ec4899',
    icon: '🔴',
    description: 'Microscopic particles ≤2.5 μm in diameter that penetrate deep into lung tissue and enter the bloodstream.',
    sources: ['Vehicle exhaust & road dust', 'Industrial combustion & power plants', 'Wildfires and open burning', 'Cooking fumes and tobacco smoke'],
    healthEffects: ['Aggravates asthma and chronic lung disease', 'Increases risk of cardiovascular disease', 'Linked to lung cancer with long-term exposure', 'Causes reduced lung function in children'],
    precautions: ['Wear N95/P100 respirator outdoors', 'Use HEPA air purifiers indoors', 'Keep windows closed on high-pollution days', 'Limit outdoor exercise during peak hours'],
    safeLevel: '< 15 μg/m³ (WHO 24h)',
  },
  {
    id: 'pm10',
    name: 'PM₁₀',
    fullName: 'Coarse Particulate Matter',
    color: '#f97316',
    icon: '🟠',
    description: 'Inhalable particles ≤10 μm that are trapped by the nose and throat but can still irritate airways.',
    sources: ['Construction and demolition dust', 'Road dust and vehicle tyres', 'Agricultural tilling operations', 'Natural dust storms and pollen'],
    healthEffects: ['Nasal and throat irritation', 'Aggravates existing respiratory conditions', 'Eye irritation and watering', 'Reduced lung function during high-exposure periods'],
    precautions: ['Wear a surgical or dust mask outdoors', 'Rinse nasal passages after outdoor exposure', 'Shower after prolonged outdoor activity', 'Monitor local dust advisories'],
    safeLevel: '< 45 μg/m³ (WHO 24h)',
  },
  {
    id: 'co',
    name: 'CO',
    fullName: 'Carbon Monoxide',
    color: '#f59e0b',
    icon: '🟡',
    description: 'Colourless, odourless gas formed by incomplete combustion. Binds to haemoglobin 200× more tightly than oxygen.',
    sources: ['Vehicle engines and traffic', 'Gas stoves, heaters and boilers', 'Industrial furnaces and generators', 'Cigarette smoke'],
    healthEffects: ['Headaches, dizziness and nausea at low levels', 'Impaired cognitive function and confusion', 'Cardiac stress in heart patients', 'Fatal at high concentrations (oxygen deprivation)'],
    precautions: ['Install CO detectors at home', 'Never run engines in enclosed spaces', 'Service gas appliances regularly', 'Ensure adequate ventilation in kitchens'],
    safeLevel: '< 4 mg/m³ (WHO 24h)',
  },
  {
    id: 'co2',
    name: 'CO₂',
    fullName: 'Carbon Dioxide',
    color: '#10b981',
    icon: '🟢',
    description: 'Natural component of air at 0.04%. Elevated indoor levels cause drowsiness; it is primarily a climate gas.',
    sources: ['Human respiration and metabolism', 'Burning of fossil fuels', 'Industrial processes and cement production', 'Deforestation and land use change'],
    healthEffects: ['Drowsiness and headaches at 1,000–2,000 ppm', 'Impaired concentration and cognitive decline above 2,500 ppm', 'Respiratory distress above 5,000 ppm', 'Asphyxiation at very high concentrations'],
    precautions: ['Ventilate enclosed spaces regularly', 'Use CO₂ monitors in offices and schools', 'Increase indoor plants for natural absorption', 'Avoid prolonged time in poorly ventilated rooms'],
    safeLevel: '< 1,000 ppm indoors',
  },
  {
    id: 'no2',
    name: 'NO₂',
    fullName: 'Nitrogen Dioxide',
    color: '#ef4444',
    icon: '🔴',
    description: 'Reddish-brown gas produced when nitrogen oxides from combustion react with oxygen. Strong oxidiser.',
    sources: ['Motor vehicle exhaust (primary source)', 'Power stations and industrial boilers', 'Gas cookers and central heating', 'Aircraft and shipping engines'],
    healthEffects: ['Inflames the lining of the lungs', 'Triggers asthma attacks', 'Increases susceptibility to respiratory infections', 'Linked to premature death with chronic exposure'],
    precautions: ['Avoid heavy-traffic areas during peak hours', 'Use extraction fans when cooking with gas', 'Close car vents in traffic jams', 'Consider electric alternatives for home appliances'],
    safeLevel: '< 10 μg/m³ (WHO annual)',
  },
  {
    id: 'so2',
    name: 'SO₂',
    fullName: 'Sulfur Dioxide',
    color: '#a855f7',
    icon: '🟣',
    description: 'Pungent gas released when sulfur-containing fuels are burned. A precursor to acid rain and PM₂.₅ formation.',
    sources: ['Coal and oil-fired power plants', 'Volcanic eruptions and geothermal activity', 'Copper smelting and metal production', 'Ship fuel combustion (high-sulfur bunker fuel)'],
    healthEffects: ['Immediate airway irritation even at low doses', 'Bronchoconstriction in asthma patients', 'Damages plant life and ecosystems', 'Contributes to acid rain harming water bodies'],
    precautions: ['Stay indoors when SO₂ alerts are issued', 'Use inhalers if asthmatic during elevated levels', 'Avoid areas near industrial zones on still, hot days', 'Lobby for cleaner fuel standards in your area'],
    safeLevel: '< 20 μg/m³ (WHO 24h)',
  },
  {
    id: 'o3',
    name: 'O₃',
    fullName: 'Ground-level Ozone',
    color: '#06b6d4',
    icon: '🔵',
    description: 'Secondary pollutant formed when NOₓ and VOCs react in sunlight. Worst on hot, sunny, windless days.',
    sources: ['Photochemical reaction of vehicle exhaust', 'Industrial solvent and paint emissions', 'Gasoline vapour from refuelling stations', 'Natural lightning and some vegetation'],
    healthEffects: ['Chest pain and coughing during exercise', 'Throat irritation and shortness of breath', 'Aggravates lung diseases including emphysema', 'Long-term exposure causes permanent lung damage'],
    precautions: ['Avoid exercising outdoors on ozone alert days', 'Stay indoors during afternoon peak (2–6 PM)', 'Refuel vehicles in the evening or early morning', 'Monitor local AQI forecasts daily in summer'],
    safeLevel: '< 100 μg/m³ (WHO 8h)',
  },
  {
    id: 'nh3',
    name: 'NH₃',
    fullName: 'Ammonia',
    color: '#84cc16',
    icon: '🟢',
    description: 'Pungent, colourless gas primarily from agricultural sources. Reacts in the atmosphere to form fine particles.',
    sources: ['Livestock farming and animal waste', 'Synthetic fertiliser application', 'Industrial refrigeration systems', 'Wastewater treatment plants'],
    healthEffects: ['Eye, nose and throat irritation', 'Coughing and respiratory distress at high concentrations', 'Contributes to secondary PM₂.₅ formation', 'Can cause lung damage in occupational exposure'],
    precautions: ['Farmers: wear protective gear during fertiliser spreading', 'Avoid areas near large livestock operations on hot days', 'Ensure proper ventilation in industrial refrigeration areas', 'Support ammonia-reduction agriculture practices'],
    safeLevel: '< 200 μg/m³ (24h)',
  },
];

/* ─── AQI Guidance Data (US EPA 6-level scale) ──────────────────────── */
const AQI_GUIDANCE = [
  {
    level: 'Good',
    range: '0–50',
    color: '#22c55e',
    bg: 'bg-green-500/10 border-green-500/30',
    badge: 'bg-green-500',
    emoji: '😊',
    summary: 'Air quality is satisfactory, and air pollution poses little or no risk.',
    healthRecs: ['Enjoy outdoor activities freely', 'No special precautions needed for any group', 'Great day for outdoor exercise and sports'],
    outdoorRecs: ['All outdoor activities recommended', 'Children can play outside normally', 'Ideal for hiking, cycling and running'],
    precautions: ['No precautions necessary', 'A good day to air out your home', 'Monitor tomorrow\'s forecast to plan ahead'],
  },
  {
    level: 'Moderate',
    range: '51–100',
    color: '#eab308',
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    badge: 'bg-yellow-500',
    emoji: '🙂',
    summary: 'Air quality is acceptable. Very sensitive people may experience minor symptoms.',
    healthRecs: ['Unusually sensitive people should consider limiting prolonged outdoor exertion', 'Most people can be active outdoors', 'Watch for symptoms like coughing or shortness of breath'],
    outdoorRecs: ['Most outdoor activities are fine', 'Sensitive individuals: reduce prolonged vigorous activity', 'Shorter outdoor sessions recommended for asthmatics'],
    precautions: ['Keep reliever inhaler handy if asthmatic', 'Ventilate your home during cooler hours', 'Check AQI updates throughout the day'],
  },
  {
    level: 'Unhealthy for Sensitive Groups',
    range: '101–150',
    color: '#f97316',
    bg: 'bg-orange-500/10 border-orange-500/30',
    badge: 'bg-orange-500',
    emoji: '😐',
    summary: 'Sensitive groups (children, elderly, asthma/heart patients) may experience health effects.',
    healthRecs: ['Sensitive groups should limit prolonged outdoor exertion', 'People with lung/heart disease should take extra care', 'Watch for respiratory symptoms — see a doctor if worsening'],
    outdoorRecs: ['General public can continue most activities', 'Sensitive groups: keep outdoor time short', 'Avoid outdoor exercise during peak pollution hours (afternoon)'],
    precautions: ['Wear a mask if you are in a sensitive group', 'Use air purifiers indoors', 'Keep medications accessible', 'Close windows if outdoors air smells acrid'],
  },
  {
    level: 'Unhealthy',
    range: '151–200',
    color: '#ef4444',
    bg: 'bg-red-500/10 border-red-500/30',
    badge: 'bg-red-500',
    emoji: '😷',
    summary: 'Everyone may begin to experience health effects. Sensitive groups face serious risk.',
    healthRecs: ['Everyone should reduce prolonged outdoor exertion', 'Sensitive groups: avoid outdoor activities', 'Children and elderly should stay indoors as much as possible'],
    outdoorRecs: ['Avoid heavy outdoor exercise for all groups', 'If outdoors, wear N95 respirator', 'Limit time outdoors to essential tasks only'],
    precautions: ['Run air purifiers continuously', 'Keep windows and doors closed', 'Avoid opening windows — recirculate indoor air', 'Seek medical advice for any respiratory symptoms'],
  },
  {
    level: 'Very Unhealthy',
    range: '201–300',
    color: '#7c3aed',
    bg: 'bg-purple-600/10 border-purple-600/30',
    badge: 'bg-purple-600',
    emoji: '🚨',
    summary: 'Health alert. Everyone risks serious health effects. Avoid all outdoor activity.',
    healthRecs: ['Everyone should avoid prolonged outdoor exposure', 'Sensitive groups face severe health risk', 'Seek immediate medical attention if experiencing chest pain or difficulty breathing'],
    outdoorRecs: ['Avoid all non-essential outdoor activity', 'If forced outdoors, wear full-face N100 respirator', 'Reschedule outdoor events and gatherings'],
    precautions: ['Seal gaps around windows and doors', 'Use multiple HEPA purifiers', 'Create a clean room — a single well-sealed room with purifier', 'Have emergency medications on hand'],
  },
  {
    level: 'Hazardous',
    range: '301+',
    color: '#9f1239',
    bg: 'bg-rose-900/20 border-rose-900/50',
    badge: 'bg-rose-900',
    emoji: '☣️',
    summary: 'Emergency conditions. Serious health effects for entire population. Stay indoors.',
    healthRecs: ['Everyone must avoid all outdoor activity', 'Evacuate area if advised by authorities', 'Seek immediate hospital care for any breathing difficulty'],
    outdoorRecs: ['Do NOT go outdoors', 'Follow emergency protocols from local health authorities', 'Cancel or postpone all outdoor events immediately'],
    precautions: ['Shelter in place — seal all windows and doors', 'Run all available air purifiers on maximum', 'Call emergency services if you develop breathing problems', 'Conserve indoor air — minimise cooking with high heat'],
  },
];

/* ─── Component ─────────────────────────────────────────────────────── */
export default function AqiGuidanceSection() {
  const [activeTab, setActiveTab] = useState<Tab>('pollutants');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedGuidance, setExpandedGuidance] = useState<string | null>('Good');

  return (
    <Card className="p-6 sm:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-sky flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Air Quality Guidance & Terms</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pollutant information, health effects, and safety recommendations based on official WHO &amp; US EPA standards.
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 p-1 rounded-xl bg-secondary/50 w-full sm:w-fit">
        {([
          { id: 'pollutants' as Tab, label: 'Pollutant Guide', icon: <Wind className="h-4 w-4" /> },
          { id: 'guidance' as Tab, label: 'AQI Level Guidance', icon: <Activity className="h-4 w-4" /> },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === t.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.id === 'pollutants' ? 'Pollutants' : 'AQI Guide'}</span>
          </button>
        ))}
      </div>

      {/* ── Tab: Pollutants ── */}
      {activeTab === 'pollutants' && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Click any pollutant to see detailed health effects and precautions. WHO-recommended safe levels are shown.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {POLLUTANTS.map((p) => {
              const isOpen = expanded === p.id;
              return (
                <div
                  key={p.id}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen ? 'border-primary/40 shadow-elegant' : 'hover:border-primary/30'
                  }`}
                >
                  {/* Pollutant header — always visible */}
                  <button
                    className="w-full flex items-center gap-3 p-4 text-left"
                    onClick={() => setExpanded(isOpen ? null : p.id)}
                  >
                    <span className="text-xl">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: p.color }}>{p.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{p.fullName}</span>
                      </div>
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded-full mt-1 inline-block">
                        Safe: {p.safeLevel}
                      </span>
                    </div>
                    <Info className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="px-4 pb-5 space-y-4 border-t bg-secondary/20">
                      <p className="text-sm text-muted-foreground pt-4">{p.description}</p>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {/* Sources */}
                        <div className="rounded-lg bg-background/60 border p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Factory className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-xs font-semibold">Sources</span>
                          </div>
                          <ul className="space-y-1">
                            {p.sources.map((s, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                <span className="mt-0.5 shrink-0">•</span>{s}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Health Effects */}
                        <div className="rounded-lg bg-background/60 border p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Flame className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-xs font-semibold">Health Effects</span>
                          </div>
                          <ul className="space-y-1">
                            {p.healthEffects.map((h, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                <span className="mt-0.5 shrink-0">•</span>{h}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Precautions */}
                        <div className="rounded-lg bg-background/60 border p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-xs font-semibold">Precautions</span>
                          </div>
                          <ul className="space-y-1">
                            {p.precautions.map((pr, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                <span className="mt-0.5 shrink-0">•</span>{pr}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab: AQI Level Guidance ── */}
      {activeTab === 'guidance' && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Health recommendations, outdoor activity guidance, and safety precautions for each AQI level (US EPA scale).
          </p>
          <div className="space-y-3">
            {AQI_GUIDANCE.map((g) => {
              const isOpen = expandedGuidance === g.level;
              return (
                <div
                  key={g.level}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${g.bg} ${
                    isOpen ? 'shadow-elegant' : ''
                  }`}
                  style={{ borderLeftWidth: 4, borderLeftColor: g.color }}
                >
                  {/* Header */}
                  <button
                    className="w-full flex items-center gap-3 p-4 text-left"
                    onClick={() => setExpandedGuidance(isOpen ? null : g.level)}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm" style={{ color: g.color }}>{g.level}</span>
                        <span className={`text-xs text-white px-2 py-0.5 rounded-full ${g.badge}`}>AQI {g.range}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{g.summary}</p>
                    </div>
                    <Info className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''} text-muted-foreground`} />
                  </button>

                  {/* Expanded */}
                  {isOpen && (
                    <div className="px-4 pb-5 border-t border-current/10 space-y-4 bg-background/30">
                      <p className="text-sm text-muted-foreground pt-4">{g.summary}</p>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {/* Health Recs */}
                        <div className="rounded-lg bg-background/60 border p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Activity className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-xs font-semibold">Health Recommendations</span>
                          </div>
                          <ul className="space-y-1.5">
                            {g.healthRecs.map((r, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                <span className="mt-0.5 shrink-0">✓</span>{r}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Outdoor Activity */}
                        <div className="rounded-lg bg-background/60 border p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Leaf className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-xs font-semibold">Outdoor Activity</span>
                          </div>
                          <ul className="space-y-1.5">
                            {g.outdoorRecs.map((r, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                <span className="mt-0.5 shrink-0">✓</span>{r}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Safety Precautions */}
                        <div className="rounded-lg bg-background/60 border p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-xs font-semibold">Safety Precautions</span>
                          </div>
                          <ul className="space-y-1.5">
                            {g.precautions.map((pr, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                <span className="mt-0.5 shrink-0">⚠</span>{pr}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl bg-secondary/50 border p-4 mt-2">
            <p className="text-xs text-muted-foreground">
              ⚠️ <strong className="text-foreground">Disclaimer:</strong> This guidance is informational only and does not
              constitute medical advice. AQI values are sourced from OpenWeatherMap. Always consult a qualified
              healthcare professional regarding health decisions. AQI thresholds follow the US EPA standard scale.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
