/**
 * Context Builder for EVA — Formats prompt context, conversation memory, and attachment text.
 */

function buildPromptContext({ userMessage, intentResult, envContext = null, history = [], attachmentText = '' }) {
  const systemPrompt = `You are EVA (Environmental Virtual Assistant), a helpful, intelligent, professional AI assistant for the EHI-EWS platform.
You possess a two-layer intelligence system:
1. Environmental Intelligence: Real-time AQI, PM2.5, weather, forecasts, risk scores, early warning alerts, anomaly events, and healthcare facilities.
2. General AI Assistance: Writing emails, summarizing text, rewriting, translating, answering general knowledge questions, explaining concepts (educational/study help), coding assistance, and brainstorming.

Guidelines:
- If the user asks general questions (coding, writing, study, general knowledge), answer directly without unnecessarily forcing air quality or pollution into the answer.
- If the user asks about air quality, PM2.5, forecasts, or risks, use the provided environmental telemetry context.
- Be concise, helpful, friendly, and accurate.
- Maintain conversation memory when user asks follow-up questions.`;

  let historyContext = '';
  if (history && history.length > 0) {
    historyContext = history.slice(-6).map(h => `${h.sender === 'user' ? 'User' : 'EVA'}: ${h.text}`).join('\n');
  }

  let dataContext = '';
  if (envContext && intentResult.requiresEnvTools) {
    dataContext = `\nLive Environmental Data Context:
Location: ${envContext.locationName}
AQI Index: Level ${envContext.aqi} / 5
PM2.5: ${envContext.pm25} µg/m³
PM10: ${envContext.pm10} µg/m³
Temperature: ${envContext.temp}°C
Humidity: ${envContext.humidity}%
Calculated Exposure Score: ${envContext.exposureScore}/100
Active Alerts: ${envContext.activeAlerts.length > 0 ? JSON.stringify(envContext.activeAlerts) : 'None'}
Active Events: ${envContext.activeEvents.length > 0 ? JSON.stringify(envContext.activeEvents) : 'None'}`;
  }

  let textAttachmentContext = '';
  if (attachmentText) {
    textAttachmentContext = `\nProvided Document/Text Attachment:\n"""\n${attachmentText}\n"""`;
  }

  return {
    systemPrompt,
    fullPrompt: `${systemPrompt}\n${dataContext}${textAttachmentContext}\n\nRecent Conversation History:\n${historyContext}\n\nUser: ${userMessage}\nEVA:`,
  };
}

module.exports = { buildPromptContext };
