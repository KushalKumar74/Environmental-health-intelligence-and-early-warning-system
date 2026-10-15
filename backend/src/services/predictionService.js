const AQI_BASE = { 1: 5, 2: 18, 3: 38, 4: 62, 5: 85 };

/**
 * Deterministic, explainable health-risk prediction engine.
 *
 * Inputs : age, asthma, hoursOutside, aqi (1..5), maskType, exerciseIntensity, allergies
 * Output : { level: 'Low'|'Moderate'|'High'|'Severe', score: 0..100, reasons: string[] }
 */
const predictHealthRisk = ({
    age,
    asthma,
    hoursOutside,
    aqi,
    maskType = 'none',
    exerciseIntensity = 'sedentary',
    allergies = false,
    diabetes = false,
    heartDisease = false,
}) => {
    const reasons = [];
    const normalizedAqi = Math.max(1, Math.min(5, Math.round(aqi)));
    let score = AQI_BASE[normalizedAqi];
    reasons.push(`Base AQI level ${normalizedAqi} contributes ${AQI_BASE[normalizedAqi]} pts.`);

    // Age sensitivity
    if (age < 12) {
        score += 12;
        reasons.push(`Age < 12: developing lungs add +12 pts.`);
    } else if (age >= 60) {
        score += 10;
        reasons.push(`Age >= 60: reduced respiratory reserve adds +10 pts.`);
    } else if (age >= 45) {
        score += 4;
        reasons.push(`Age >= 45: mild susceptibility adds +4 pts.`);
    }

    // Pre-existing condition (Asthma)
    if (asthma) {
        const a = normalizedAqi >= 3 ? 18 : 10;
        score += a;
        reasons.push(`Asthma diagnosis adds +${a} pts (amplified by AQI).`);
    }

    // Allergies
    if (allergies) {
        const alg = normalizedAqi >= 2 ? 6 : 3;
        score += alg;
        reasons.push(`Seasonal allergies / respiratory sensitivity adds +${alg} pts.`);
    }

    // Diabetes
    if (diabetes && normalizedAqi >= 3) {
        score += 6;
        reasons.push(`Diabetes increases cardiovascular sensitivity: +6 pts.`);
    }

    // Heart Disease
    if (heartDisease && normalizedAqi >= 2) {
        score += 8;
        reasons.push(`Heart disease amplifies PM2.5/CO risk: +8 pts.`);
    }

    // Exercise intensity (inhalation rate increases exposure)
    if (exerciseIntensity === 'intense') {
        const ex = normalizedAqi >= 2 ? 15 : 6;
        score += ex;
        reasons.push(`Intense outdoor exercise significantly increases pollutant inhalation: +${ex} pts.`);
    } else if (exerciseIntensity === 'moderate') {
        const ex = normalizedAqi >= 2 ? 8 : 3;
        score += ex;
        reasons.push(`Moderate outdoor activity increases inhalation: +${ex} pts.`);
    } else if (exerciseIntensity === 'light') {
        score += 3;
        reasons.push(`Light outdoor activity: +3 pts.`);
    }

    // Exposure time
    const hours = Math.max(0, hoursOutside);
    if (hours >= 6) {
        const e = normalizedAqi >= 3 ? 14 : 8;
        score += e;
        reasons.push(`${hours}h outside is high exposure: +${e} pts.`);
    } else if (hours >= 3) {
        score += 5;
        reasons.push(`${hours}h outside is moderate exposure: +5 pts.`);
    } else {
        reasons.push(`${hours}h outside is low exposure: no penalty.`);
    }

    // Mask protection (reduces overall score)
    const normalizedMask = (maskType || 'none').toLowerCase();
    if (normalizedMask === 'n95' || normalizedMask === 'kn95' || normalizedMask === 'respirator') {
        const reduction = Math.min(18, Math.round(score * 0.25));
        score -= reduction;
        reasons.push(`Wearing N95/Respirator mask provides strong filtration: -${reduction} pts.`);
    } else if (normalizedMask === 'cloth' || normalizedMask === 'surgical') {
        const reduction = Math.min(6, Math.round(score * 0.1));
        score -= reduction;
        reasons.push(`Wearing standard mask provides partial filtration: -${reduction} pts.`);
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    let level;
    if (score < 25) level = "Low";
    else if (score < 50) level = "Moderate";
    else if (score < 75) level = "High";
    else level = "Severe";

    reasons.push(`Final score ${score}/100 -> ${level} risk.`);
    return { level, score, reasons };
};

module.exports = {
    predictHealthRisk
};
