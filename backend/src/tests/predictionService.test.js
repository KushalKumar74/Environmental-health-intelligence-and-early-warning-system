const { predictHealthRisk } = require('../services/predictionService');

describe('Prediction Service', () => {
    test('AQI 1 returns Low risk for healthy individual', () => {
        const result = predictHealthRisk({ age: 30, asthma: false, hoursOutside: 2, aqi: 1 });
        expect(result.level).toBe('Low');
        expect(result.score).toBe(5);
    });

    test('High AQI adds score', () => {
        const result = predictHealthRisk({ age: 30, asthma: false, hoursOutside: 2, aqi: 4 });
        expect(result.level).toBe('High');
        expect(result.score).toBe(62); // 62 base
    });

    test('Vulnerable age adds score', () => {
        const result = predictHealthRisk({ age: 10, asthma: false, hoursOutside: 1, aqi: 1 });
        expect(result.score).toBe(17); // 5 base + 12 age
    });

    test('Asthma and high AQI adds score', () => {
        const result = predictHealthRisk({ age: 30, asthma: true, hoursOutside: 1, aqi: 3 });
        expect(result.score).toBe(56); // 38 base + 18 asthma
    });

    test('Hazardous AQI and long exposure returns Severe', () => {
        const result = predictHealthRisk({ age: 25, asthma: false, hoursOutside: 8, aqi: 5 });
        expect(result.level).toBe('Severe');
        expect(result.score).toBe(99); // 85 base + 14 hours
    });

    test('N95 mask reduces overall risk score', () => {
        const withoutMask = predictHealthRisk({ age: 30, asthma: false, hoursOutside: 4, aqi: 4 });
        const withMask = predictHealthRisk({ age: 30, asthma: false, hoursOutside: 4, aqi: 4, maskType: 'n95' });
        expect(withMask.score).toBeLessThan(withoutMask.score);
    });

    test('Intense outdoor exercise increases risk score', () => {
        const sedentary = predictHealthRisk({ age: 30, asthma: false, hoursOutside: 2, aqi: 3, exerciseIntensity: 'sedentary' });
        const intense = predictHealthRisk({ age: 30, asthma: false, hoursOutside: 2, aqi: 3, exerciseIntensity: 'intense' });
        expect(intense.score).toBeGreaterThan(sedentary.score);
    });

    test('Seasonal allergies add susceptibility score', () => {
        const result = predictHealthRisk({ age: 30, asthma: false, hoursOutside: 2, aqi: 3, allergies: true });
        expect(result.reasons.some(r => r.includes('allergies'))).toBe(true);
    });

    test('Diabetes adds score when AQI >= 3', () => {
        const withoutDiabetes = predictHealthRisk({ age: 30, asthma: false, hoursOutside: 2, aqi: 3, diabetes: false });
        const withDiabetes = predictHealthRisk({ age: 30, asthma: false, hoursOutside: 2, aqi: 3, diabetes: true });
        expect(withDiabetes.score).toBe(withoutDiabetes.score + 6);
        expect(withDiabetes.reasons.some(r => r.includes('Diabetes'))).toBe(true);
    });

    test('Heart disease adds score when AQI >= 2', () => {
        const withoutHeart = predictHealthRisk({ age: 30, asthma: false, hoursOutside: 2, aqi: 2, heartDisease: false });
        const withHeart = predictHealthRisk({ age: 30, asthma: false, hoursOutside: 2, aqi: 2, heartDisease: true });
        expect(withHeart.score).toBe(withoutHeart.score + 8);
        expect(withHeart.reasons.some(r => r.includes('Heart disease'))).toBe(true);
    });
});
