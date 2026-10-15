/**
 * Deterministic, explainable health-risk prediction engine.
 *
 * Inputs : age, asthma, hoursOutside, AQI level (1..5)
 * Output : RiskLevel + numeric score + human-readable reasoning trail.
 *
 * Designed to be swappable with an ML model later — keep the same I/O contract.
 */

export type RiskLevel = "Low" | "Moderate" | "High" | "Severe";

export interface PredictionInput {
  age: number;
  asthma: boolean;
  hoursOutside: number;
  aqi: number; // 1..5
  allergies?: boolean;
  diabetes?: boolean;
  heartDisease?: boolean;
  maskType?: string;
  exerciseIntensity?: string;
}

export interface PredictionResult {
  level: RiskLevel;
  score: number; // 0..100
  reasons: string[];
}

const AQI_BASE: Record<number, number> = { 1: 5, 2: 18, 3: 38, 4: 62, 5: 85 };

export function predictRisk(input: PredictionInput): PredictionResult {
  const reasons: string[] = [];
  const aqi = Math.max(1, Math.min(5, Math.round(input.aqi)));
  let score = AQI_BASE[aqi];
  reasons.push(`Base AQI level ${aqi} contributes ${AQI_BASE[aqi]} pts.`);

  // Age sensitivity (children & elderly more vulnerable)
  if (input.age < 12) {
    score += 12;
    reasons.push(`Age < 12: developing lungs add +12 pts.`);
  } else if (input.age >= 60) {
    score += 10;
    reasons.push(`Age ≥ 60: reduced respiratory reserve adds +10 pts.`);
  } else if (input.age >= 45) {
    score += 4;
    reasons.push(`Age ≥ 45: mild susceptibility adds +4 pts.`);
  }

  // Pre-existing condition
  if (input.asthma) {
    const a = aqi >= 3 ? 18 : 10;
    score += a;
    reasons.push(`Asthma diagnosis adds +${a} pts (amplified by AQI).`);
  }

  // Allergies
  if (input.allergies) {
    const alg = aqi >= 2 ? 6 : 3;
    score += alg;
    reasons.push(`Seasonal allergies / respiratory sensitivity adds +${alg} pts.`);
  }

  // Diabetes
  if (input.diabetes && aqi >= 3) {
    score += 6;
    reasons.push(`Diabetes increases cardiovascular sensitivity: +6 pts.`);
  }

  // Heart Disease
  if (input.heartDisease && aqi >= 2) {
    score += 8;
    reasons.push(`Heart disease amplifies PM2.5/CO risk: +8 pts.`);
  }

  // Exercise intensity
  const exLevel = (input.exerciseIntensity || 'sedentary').toLowerCase();
  if (exLevel === 'intense') {
    const ex = aqi >= 2 ? 15 : 6;
    score += ex;
    reasons.push(`Intense outdoor exercise significantly increases pollutant inhalation: +${ex} pts.`);
  } else if (exLevel === 'moderate') {
    const ex = aqi >= 2 ? 8 : 3;
    score += ex;
    reasons.push(`Moderate outdoor activity increases inhalation: +${ex} pts.`);
  } else if (exLevel === 'light') {
    score += 3;
    reasons.push(`Light outdoor activity: +3 pts.`);
  }

  // Exposure time
  const hours = Math.max(0, input.hoursOutside);
  if (hours >= 6) {
    const e = aqi >= 3 ? 14 : 8;
    score += e;
    reasons.push(`${hours}h outside is high exposure: +${e} pts.`);
  } else if (hours >= 3) {
    score += 5;
    reasons.push(`${hours}h outside is moderate exposure: +5 pts.`);
  } else {
    reasons.push(`${hours}h outside is low exposure: no penalty.`);
  }

  // Mask protection
  const mask = (input.maskType || 'none').toLowerCase();
  if (mask === 'n95' || mask === 'kn95' || mask === 'respirator') {
    const reduction = Math.min(18, Math.round(score * 0.25));
    score -= reduction;
    reasons.push(`Wearing N95/Respirator mask provides strong filtration: -${reduction} pts.`);
  } else if (mask === 'cloth' || mask === 'surgical') {
    const reduction = Math.min(6, Math.round(score * 0.1));
    score -= reduction;
    reasons.push(`Wearing standard mask provides partial filtration: -${reduction} pts.`);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let level: RiskLevel;
  if (score < 25) level = "Low";
  else if (score < 50) level = "Moderate";
  else if (score < 75) level = "High";
  else level = "Severe";

  reasons.push(`Final score ${score}/100 → ${level} risk.`);
  return { level, score, reasons };
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  Low: "text-aqi-good",
  Moderate: "text-aqi-moderate",
  High: "text-aqi-unhealthy",
  Severe: "text-aqi-hazardous",
};

export const RISK_BG: Record<RiskLevel, string> = {
  Low: "bg-aqi-good",
  Moderate: "bg-aqi-moderate",
  High: "bg-aqi-unhealthy",
  Severe: "bg-aqi-hazardous",
};
