/**
 * WeatherAnimation — animated weather/AQI visual for Dashboard hero.
 * Determines animation type based on AQI level and weather description.
 */

interface Props {
  aqi: number;
  weatherDesc?: string;
}

type Condition = 'sunny' | 'cloudy' | 'rainy' | 'polluted' | 'severe';

function getCondition(aqi: number, desc: string): Condition {
  const d = desc.toLowerCase();
  if (aqi >= 5) return 'severe';
  if (aqi >= 4) return 'polluted';
  if (d.includes('rain') || d.includes('drizzle') || d.includes('shower')) return 'rainy';
  if (d.includes('cloud') || d.includes('overcast') || aqi === 3) return 'cloudy';
  return 'sunny';
}

/* ---------- Sub-animations ---------- */

function SunAnimation() {
  return (
    <div className="weather-anim sunny-anim">
      {/* Rays */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="sun-ray" style={{ transform: `rotate(${i * 45}deg)` }} />
      ))}
      {/* Core */}
      <div className="sun-core" />
    </div>
  );
}

function RainAnimation() {
  return (
    <div className="weather-anim rain-anim">
      <div className="rain-cloud" />
      {[...Array(18)].map((_, i) => (
        <div
          key={i}
          className="raindrop"
          style={{
            left: `${(i * 5.5) % 100}%`,
            animationDelay: `${(i * 0.15) % 2}s`,
            animationDuration: `${0.6 + (i % 4) * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

function CloudAnimation() {
  return (
    <div className="weather-anim cloud-anim">
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />
    </div>
  );
}

function HazeAnimation() {
  return (
    <div className="weather-anim haze-anim">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="haze-wisp" style={{ '--wisp-i': i } as React.CSSProperties} />
      ))}
    </div>
  );
}

function SevereAnimation() {
  return (
    <div className="weather-anim severe-anim">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="smoke-wisp" style={{ '--wisp-i': i } as React.CSSProperties} />
      ))}
      <div className="severe-overlay" />
    </div>
  );
}

export default function WeatherAnimation({ aqi, weatherDesc = '' }: Props) {
  const condition = getCondition(aqi, weatherDesc);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl" aria-hidden>
      {condition === 'sunny' && <SunAnimation />}
      {condition === 'rainy' && <RainAnimation />}
      {condition === 'cloudy' && <CloudAnimation />}
      {condition === 'polluted' && <HazeAnimation />}
      {condition === 'severe' && <SevereAnimation />}
    </div>
  );
}
