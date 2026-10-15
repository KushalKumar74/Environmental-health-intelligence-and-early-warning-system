/**
 * PDF health report generator using jsPDF.
 * Produces a formatted single-page report with AQI data and prediction results.
 */
import { jsPDF } from 'jspdf';

interface ReportData {
  location: string;
  aqi: number;
  aqiLabel: string;
  components: Record<string, number>;
  prediction?: {
    level: string;
    score: number;
    reasons: string[];
  };
  userName?: string;
}

const AQI_COLORS_HEX: Record<number, [number, number, number]> = {
  1: [34, 197, 94],
  2: [234, 179, 8],
  3: [249, 115, 22],
  4: [239, 68, 68],
  5: [124, 58, 237],
};

export function downloadHealthReport(data: ReportData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  let y = 0;

  // ---- Header gradient bar ----
  const level = Math.max(1, Math.min(5, Math.round(data.aqi)));
  const [r, g, b] = AQI_COLORS_HEX[level] ?? [34, 197, 94];
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, W, 28, 'F');

  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('UAQI Health Report', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 20);
  if (data.userName) doc.text(`User: ${data.userName}`, W - 14, 20, { align: 'right' });

  y = 36;

  // ---- Location & AQI summary ----
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text(`📍 ${data.location}`, 14, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(r, g, b);
  doc.text(`Current AQI: ${data.aqi}/5 — ${data.aqiLabel}`, 14, y);
  y += 10;

  // ---- Divider ----
  doc.setDrawColor(220, 220, 220);
  doc.line(14, y, W - 14, y);
  y += 7;

  // ---- Pollutant grid ----
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('Pollutant Levels (μg/m³)', 14, y);
  y += 7;

  const LABELS: Record<string, string> = {
    co: 'CO', no: 'NO', no2: 'NO₂', o3: 'O₃', so2: 'SO₂', pm2_5: 'PM2.5', pm10: 'PM10', nh3: 'NH₃',
  };

  const pollutants = Object.entries(data.components);
  const cols = 2;
  const colW = (W - 28) / cols;

  pollutants.forEach(([key, val], idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const cx = 14 + col * colW;
    const cy = y + row * 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(`${LABELS[key] ?? key}:`, cx, cy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`${typeof val === 'number' ? val.toFixed(2) : val}`, cx + 16, cy);
  });

  y += Math.ceil(pollutants.length / cols) * 10 + 6;

  // ---- Divider ----
  doc.setDrawColor(220, 220, 220);
  doc.line(14, y, W - 14, y);
  y += 7;

  // ---- Prediction section ----
  if (data.prediction) {
    const { level: pLevel, score, reasons } = data.prediction;
    const riskColors: Record<string, [number, number, number]> = {
      Low: [34, 197, 94], Moderate: [234, 179, 8], High: [239, 68, 68], Severe: [124, 58, 237],
    };
    const [pr, pg, pb] = riskColors[pLevel] ?? [100, 100, 100];

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Health Risk Prediction', 14, y);
    y += 7;

    doc.setFontSize(16);
    doc.setTextColor(pr, pg, pb);
    doc.text(`${pLevel} Risk — Score: ${score}/100`, 14, y);
    y += 9;

    // Progress bar
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(14, y, W - 28, 4, 2, 2, 'F');
    doc.setFillColor(pr, pg, pb);
    doc.roundedRect(14, y, ((W - 28) * score) / 100, 4, 2, 2, 'F');
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Why this score?', 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    reasons.forEach((r) => {
      const lines = doc.splitTextToSize(`• ${r}`, W - 28);
      doc.text(lines, 14, y);
      y += lines.length * 5;
    });
    y += 4;
  }

  // ---- Footer ----
  doc.setFillColor(245, 245, 245);
  doc.rect(0, doc.internal.pageSize.getHeight() - 14, W, 14, 'F');
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.setFont('helvetica', 'normal');
  doc.text('UAQI · Data from OpenWeatherMap · For informational purposes only. Not medical advice.', W / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });

  doc.save(`UAQI_Report_${data.location.replace(/\s/g, '_')}_${Date.now()}.pdf`);
}
