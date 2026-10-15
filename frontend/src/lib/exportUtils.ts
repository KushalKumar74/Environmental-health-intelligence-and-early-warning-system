import { jsPDF } from "jspdf";
import type { HealthRecord } from "@/store/records";
import { getAqiCategory } from "@/lib/aqi";

/**
 * Downloads a list of HealthRecord objects as a CSV file.
 */
export function downloadRecordsCSV(records: HealthRecord[], filename = "AQI_Health_History.csv"): void {
  if (!records || records.length === 0) return;

  const headers = [
    "ID",
    "Date & Time",
    "Name",
    "Location",
    "Age",
    "Asthma",
    "Allergies",
    "Mask Type",
    "Exercise Intensity",
    "Hours Outside",
    "AQI Level",
    "Predicted Risk",
    "Risk Score",
  ];

  const rows = records.map((r) => [
    `"${r._id}"`,
    `"${new Date(r.createdAt).toLocaleString()}"`,
    `"${r.name || ""}"`,
    `"${r.location || ""}"`,
    r.age,
    r.asthma ? "Yes" : "No",
    r.allergies ? "Yes" : "No",
    `"${r.maskType || "none"}"`,
    `"${r.exerciseIntensity || "sedentary"}"`,
    r.hoursOutside,
    r.aqi,
    `"${r.predictedRisk}"`,
    r.score,
  ]);

  const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates an Analytics Summary PDF Report.
 */
export function downloadAnalyticsPDF(records: HealthRecord[], userName?: string): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  let y = 0;

  // Header Bar
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, W, 28, "F");

  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("UAQI Analytics & Health Log Report", 14, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 20);
  if (userName) doc.text(`User: ${userName}`, W - 14, 20, { align: "right" });

  y = 38;

  // Overview Summary
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.text("📊 Summary Statistics", 14, y);
  y += 8;

  const total = records.length;
  const avgAqi = (records.reduce((s, r) => s + r.aqi, 0) / (total || 1)).toFixed(1);
  const avgScore = (records.reduce((s, r) => s + r.score, 0) / (total || 1)).toFixed(1);
  const avgHours = (records.reduce((s, r) => s + r.hoursOutside, 0) / (total || 1)).toFixed(1);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(`Total Recorded Entries: ${total}`, 14, y);
  doc.text(`Average AQI Level: ${avgAqi} / 5`, 80, y);
  y += 6;
  doc.text(`Average Risk Score: ${avgScore} / 100`, 14, y);
  doc.text(`Average Daily Exposure: ${avgHours} hours`, 80, y);
  y += 10;

  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.line(14, y, W - 14, y);
  y += 8;

  // Table Header
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("📋 Recent Health Records Log", 14, y);
  y += 8;

  doc.setFillColor(240, 240, 240);
  doc.rect(14, y, W - 28, 8, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("Date", 16, y + 5.5);
  doc.text("Name", 48, y + 5.5);
  doc.text("AQI", 90, y + 5.5);
  doc.text("Hrs Out", 112, y + 5.5);
  doc.text("Risk Level", 140, y + 5.5);
  doc.text("Score", 175, y + 5.5);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  records.slice(0, 20).forEach((r) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const dateStr = new Date(r.createdAt).toLocaleDateString();
    const nameStr = (r.name || "—").slice(0, 18);

    doc.setTextColor(70, 70, 70);
    doc.text(dateStr, 16, y);
    doc.text(nameStr, 48, y);
    doc.text(`${r.aqi}/5`, 90, y);
    doc.text(`${r.hoursOutside}h`, 112, y);

    // Color risk level
    const riskColors: Record<string, [number, number, number]> = {
      Low: [34, 197, 94],
      Moderate: [234, 179, 8],
      High: [239, 68, 68],
      Severe: [124, 58, 237],
    };
    const [rc, gc, bc] = riskColors[r.predictedRisk] || [100, 100, 100];
    doc.setTextColor(rc, gc, bc);
    doc.setFont("helvetica", "bold");
    doc.text(r.predictedRisk, 140, y);

    doc.setTextColor(70, 70, 70);
    doc.setFont("helvetica", "normal");
    doc.text(`${r.score}/100`, 175, y);

    y += 6;
  });

  // Footer
  doc.setFillColor(245, 245, 245);
  doc.rect(0, doc.internal.pageSize.getHeight() - 12, W, 12, "F");
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text("UAQI Health Platform · Report generated automatically.", W / 2, doc.internal.pageSize.getHeight() - 4, { align: "center" });

  doc.save(`UAQI_Analytics_Report_${Date.now()}.pdf`);
}
