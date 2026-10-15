import { describe, it, expect } from "vitest";
import { predictRisk } from "@/lib/prediction";

describe("predictRisk", () => {
  it("returns Low for healthy adult, good AQI, low exposure", () => {
    const r = predictRisk({ age: 30, asthma: false, hoursOutside: 1, aqi: 1 });
    expect(r.level).toBe("Low");
    expect(r.score).toBeLessThan(25);
  });

  it("escalates with asthma and high AQI", () => {
    const r = predictRisk({ age: 30, asthma: true, hoursOutside: 6, aqi: 5 });
    expect(["High", "Severe"]).toContain(r.level);
    expect(r.score).toBeGreaterThan(75);
  });

  it("clamps AQI to valid range", () => {
    const r = predictRisk({ age: 30, asthma: false, hoursOutside: 0, aqi: 99 });
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it("includes reasoning trail", () => {
    const r = predictRisk({ age: 70, asthma: true, hoursOutside: 8, aqi: 4 });
    expect(r.reasons.length).toBeGreaterThanOrEqual(4);
    expect(r.reasons.some((s) => s.toLowerCase().includes("asthma"))).toBe(true);
  });

  it("treats children as more sensitive", () => {
    const adult = predictRisk({ age: 30, asthma: false, hoursOutside: 4, aqi: 3 });
    const child = predictRisk({ age: 8, asthma: false, hoursOutside: 4, aqi: 3 });
    expect(child.score).toBeGreaterThan(adult.score);
  });

  it("handles diabetes and heart disease scoring", () => {
    const base = predictRisk({ age: 30, asthma: false, hoursOutside: 2, aqi: 3 });
    const withConditions = predictRisk({ age: 30, asthma: false, hoursOutside: 2, aqi: 3, diabetes: true, heartDisease: true });
    expect(withConditions.score).toBe(base.score + 6 + 8);
    expect(withConditions.reasons.some((s) => s.includes("Diabetes"))).toBe(true);
    expect(withConditions.reasons.some((s) => s.includes("Heart disease"))).toBe(true);
  });
});
