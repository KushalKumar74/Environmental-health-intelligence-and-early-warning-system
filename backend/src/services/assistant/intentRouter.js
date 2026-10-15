/**
 * Intent Router for EVA (Environmental Virtual Assistant)
 * Classifies requests into ENVIRONMENTAL, GENERAL, or MIXED intents.
 */

const INTENT_CATEGORIES = {
  ENVIRONMENTAL_CURRENT: 'ENVIRONMENTAL',
  ENVIRONMENTAL_FORECAST: 'ENVIRONMENTAL',
  ENVIRONMENTAL_HISTORY: 'ENVIRONMENTAL',
  PERSONAL_EXPOSURE: 'ENVIRONMENTAL',
  ENVIRONMENTAL_RISK: 'ENVIRONMENTAL',
  ENVIRONMENTAL_ALERT: 'ENVIRONMENTAL',
  ENVIRONMENTAL_EVENT: 'ENVIRONMENTAL',
  LOCATION_COMPARISON: 'ENVIRONMENTAL',
  FACILITY_QUERY: 'ENVIRONMENTAL',

  GENERAL_QUESTION: 'GENERAL',
  WRITING: 'GENERAL',
  REWRITING: 'GENERAL',
  SUMMARIZATION: 'GENERAL',
  TRANSLATION: 'GENERAL',
  EXPLANATION: 'GENERAL',
  STUDY_HELP: 'GENERAL',
  BRAINSTORMING: 'GENERAL',
  CODING: 'GENERAL',
  CALCULATION: 'GENERAL',
  TEXT_ANALYSIS: 'GENERAL',
  CASUAL_CONVERSATION: 'GENERAL',

  MIXED_ENVIRONMENTAL_GENERAL: 'MIXED',
};

function routeIntent(userMessage = '', history = [], attachmentText = '') {
  const msgLower = userMessage.toLowerCase().trim();

  // Extract explicit city mentions if present
  let extractedLocation = null;
  const cityMatch = msgLower.match(/\b(in|at|for|near|of)\s+([a-zA-Z\s]{3,20})/i);
  if (cityMatch) {
    let cleanLoc = cityMatch[2].replace(/\b(right now|today|tomorrow|now|this morning|tonight|currently)\b/gi, '').trim();
    if (cleanLoc.length >= 3 && !['the', 'my', 'this', 'that'].includes(cleanLoc.toLowerCase())) {
      extractedLocation = cleanLoc.charAt(0).toUpperCase() + cleanLoc.slice(1);
    }
  }

  // 0. Casual Greetings & Basic Polite Conversation (NO Tools Required)
  if (/^(hi|hiii|hiiii|hello|hey|good morning|good afternoon|good evening|thank you|thanks|bye|goodbye|see ya)\b/i.test(msgLower) && msgLower.length < 25) {
    return {
      category: 'GENERAL',
      intent: 'CASUAL_CONVERSATION',
      requiresEnvTools: false,
    };
  }

  // 1. Check for Travel & Vacation Planning
  if (/\b(plan a trip|vacation|trip to|travel to|going to|visit|itinerary|holiday|stay in|heading to)\b/i.test(msgLower)) {
    return {
      category: 'TRAVEL',
      intent: 'TRAVEL_PLANNING',
      requiresEnvTools: true,
      extractedLocation,
    };
  }

  // 2. Check for Hospital & Healthcare Facility Discovery
  if (/\b(hospital|hospitals|clinic|doctor|emergency room|icu|cardiology|children's hospital|pediatric|medical center)\b/i.test(msgLower)) {
    return {
      category: 'HOSPITAL',
      intent: 'HOSPITAL_SEARCH',
      requiresEnvTools: true,
      extractedLocation,
    };
  }

  // 3. Check for Weather & Atmospheric Queries
  if (/\b(weather|rain|raining|umbrella|temperature|forecast|sunny|cloudy|wind|road trip weather)\b/i.test(msgLower) && !isEnvTerm) {
    return {
      category: 'WEATHER',
      intent: 'WEATHER_QUERY',
      requiresEnvTools: true,
      extractedLocation,
    };
  }

  // 4. Check for Mixed Requests (Combining environmental data + general AI writing/explanation)
  const isEnvTerm = /\b(aqi|pm2\.5|pm10|air quality|pollution|exposure|smog|ozone|telemetry|forecast|alert|warning)\b/i.test(msgLower);
  const isGeneralWritingTask = /\b(write|email|message|essay|presentation|outline|summarize|explain in simple|translate|story|poem)\b/i.test(msgLower);

  if (isEnvTerm && isGeneralWritingTask) {
    return {
      category: 'MIXED',
      intent: 'MIXED_ENVIRONMENTAL_GENERAL',
      requiresEnvTools: true,
      extractedLocation,
    };
  }

  // 2. Check for Specific Environmental Intents
  if (/\b(aqi|air quality|pm2\.5|pm10|humidity|temperature|wind speed|current air|pollution right now|how is the air)\b/i.test(msgLower)) {
    return {
      category: 'ENVIRONMENTAL',
      intent: 'ENVIRONMENTAL_CURRENT',
      requiresEnvTools: true,
      extractedLocation,
    };
  }

  if (/\b(forecast|tomorrow|next 24 hours|weekly weather|weather outlook|predict air|future air)\b/i.test(msgLower)) {
    return {
      category: 'ENVIRONMENTAL',
      intent: 'ENVIRONMENTAL_FORECAST',
      requiresEnvTools: true,
      extractedLocation,
    };
  }

  if (/\b(yesterday|history|past week|historical|trend|was my risk higher|previous air)\b/i.test(msgLower)) {
    return {
      category: 'ENVIRONMENTAL',
      intent: 'ENVIRONMENTAL_HISTORY',
      requiresEnvTools: true,
      extractedLocation,
    };
  }

  if (/\b(alert|warning|spike|threshold|critical|hazard|early warning)\b/i.test(msgLower)) {
    return {
      category: 'ENVIRONMENTAL',
      intent: 'ENVIRONMENTAL_ALERT',
      requiresEnvTools: true,
      extractedLocation,
    };
  }

  if (/\b(anomaly|event|isolation forest|pollution peak|lifecycle)\b/i.test(msgLower)) {
    return {
      category: 'ENVIRONMENTAL',
      intent: 'ENVIRONMENTAL_EVENT',
      requiresEnvTools: true,
      extractedLocation,
    };
  }

  if (/\b(facility|hospital|clinic|care center|elderly care|icu|bed capacity)\b/i.test(msgLower)) {
    return {
      category: 'ENVIRONMENTAL',
      intent: 'FACILITY_QUERY',
      requiresEnvTools: true,
      extractedLocation,
    };
  }

  if (/\b(compare|versus|vs|between|difference in air|which city is cleaner)\b/i.test(msgLower) && isEnvTerm) {
    return {
      category: 'ENVIRONMENTAL',
      intent: 'LOCATION_COMPARISON',
      requiresEnvTools: true,
      extractedLocation,
    };
  }

  if (/\b(my risk|exposure score|health risk score|why is my score|am i safe|vulnerability|exposure level)\b/i.test(msgLower)) {
    return {
      category: 'ENVIRONMENTAL',
      intent: 'PERSONAL_EXPOSURE',
      requiresEnvTools: true,
      extractedLocation,
    };
  }

  // 3. Check for Follow-up Environmental Queries based on Conversation History
  if (history.length > 0) {
    const lastBotMsg = (history[history.length - 1]?.text || '').toLowerCase();
    const lastWasEnv = /\b(aqi|pm2\.5|pm10|air quality|exposure|pollution)\b/i.test(lastBotMsg);
    
    if (lastWasEnv && /\b(is that bad|why|what about tomorrow|explain that|is it safe|how come|and yesterday)\b/i.test(msgLower)) {
      return {
        category: 'ENVIRONMENTAL',
        intent: 'ENVIRONMENTAL_CURRENT',
        requiresEnvTools: true,
        extractedLocation,
      };
    }
  }

  // 4. General AI Tasks (NO Environmental API calls required)
  if (/\b(write|draft|email|letter|resume|linkedin|essay|content|post|speech)\b/i.test(msgLower)) {
    return { category: 'GENERAL', intent: 'WRITING', requiresEnvTools: false };
  }

  if (/\b(rewrite|make it|rephrase|paraphrase|proofread|polite|professional|formal|casual|simplify text)\b/i.test(msgLower)) {
    return { category: 'GENERAL', intent: 'REWRITING', requiresEnvTools: false };
  }

  if (/\b(summarize|summary|bullet points|key points|takeaways|tl;dr|digest)\b/i.test(msgLower) || attachmentText) {
    return { category: 'GENERAL', intent: 'SUMMARIZATION', requiresEnvTools: false };
  }

  if (/\b(translate|in kannada|in hindi|in spanish|in french|in german|in tamil|in telugu|language)\b/i.test(msgLower)) {
    return { category: 'GENERAL', intent: 'TRANSLATION', requiresEnvTools: false };
  }

  if (/\b(code|coding|javascript|python|java|html|css|sql|bug|error|undefined|function|react|node|algorithm|git|syntax|debug)\b/i.test(msgLower)) {
    return { category: 'GENERAL', intent: 'CODING', requiresEnvTools: false };
  }

  if (/\b(study|quiz|mcq|flashcard|interview|dbms|normalization|concept|teach me|exam|notes)\b/i.test(msgLower)) {
    return { category: 'GENERAL', intent: 'STUDY_HELP', requiresEnvTools: false };
  }

  if (/\b(brainstorm|ideas|name for|suggest|topics|project ideas|feature ideas)\b/i.test(msgLower)) {
    return { category: 'GENERAL', intent: 'BRAINSTORMING', requiresEnvTools: false };
  }

  if (/\b(explain|what is|how does|why does|difference between|define|meaning of)\b/i.test(msgLower) && !isEnvTerm) {
    return { category: 'GENERAL', intent: 'EXPLANATION', requiresEnvTools: false };
  }

  if (/\b(hi|hello|hey|good morning|good evening|who are you|joke|tell me something|fun fact)\b/i.test(msgLower)) {
    return { category: 'GENERAL', intent: 'CASUAL_CONVERSATION', requiresEnvTools: false };
  }

  // 5. Default Fallback Intent
  return {
    category: 'GENERAL',
    intent: 'GENERAL_QUESTION',
    requiresEnvTools: false,
  };
}

module.exports = { routeIntent, INTENT_CATEGORIES };
