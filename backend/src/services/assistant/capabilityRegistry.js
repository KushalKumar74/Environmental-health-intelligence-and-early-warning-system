/**
 * Capability Registry for EVA — Universal AI Assistant
 * Defines supported capabilities across Environmental, General AI, Travel, Places/Hospitals, and Weather.
 */

const CAPABILITIES = {
  CASUAL_CONVERSATION: { id: 'CASUAL_CONVERSATION', name: 'Casual Conversation', requiresTools: false },
  WRITING: { id: 'WRITING', name: 'General Writing', requiresTools: false },
  REWRITING: { id: 'REWRITING', name: 'Text Polishing & Rewriting', requiresTools: false },
  SUMMARIZATION: { id: 'SUMMARIZATION', name: 'Summarization', requiresTools: false },
  TRANSLATION: { id: 'TRANSLATION', name: 'Language Translation', requiresTools: false },
  EXPLANATION: { id: 'EXPLANATION', name: 'Educational Explanation', requiresTools: false },
  STUDY_HELP: { id: 'STUDY_HELP', name: 'Study & Interview Prep', requiresTools: false },
  CODING: { id: 'CODING', name: 'Coding & Debugging', requiresTools: false },
  BRAINSTORMING: { id: 'BRAINSTORMING', name: 'Brainstorming Ideas', requiresTools: false },
  GENERAL_QUESTION: { id: 'GENERAL_QUESTION', name: 'General Knowledge', requiresTools: false },

  TRAVEL_PLANNING: { id: 'TRAVEL_PLANNING', name: 'Travel & Vacation Planning', requiresTools: true },
  HOSPITAL_SEARCH: { id: 'HOSPITAL_SEARCH', name: 'Healthcare Facility Discovery', requiresTools: true },
  PLACES_SEARCH: { id: 'PLACES_SEARCH', name: 'Place & Amenity Discovery', requiresTools: true },
  WEATHER_QUERY: { id: 'WEATHER_QUERY', name: 'Weather Telemetry', requiresTools: true },

  ENVIRONMENTAL_CURRENT: { id: 'ENVIRONMENTAL_CURRENT', name: 'Live Air Quality Telemetry', requiresTools: true },
  ENVIRONMENTAL_FORECAST: { id: 'ENVIRONMENTAL_FORECAST', name: 'Air Quality Forecast', requiresTools: true },
  ENVIRONMENTAL_HISTORY: { id: 'ENVIRONMENTAL_HISTORY', name: 'Historical Exposure', requiresTools: true },
  PERSONAL_EXPOSURE: { id: 'PERSONAL_EXPOSURE', name: 'Personalized Exposure Analysis', requiresTools: true },
  ENVIRONMENTAL_ALERT: { id: 'ENVIRONMENTAL_ALERT', name: 'Early Warning Alerts', requiresTools: true },
  ENVIRONMENTAL_EVENT: { id: 'ENVIRONMENTAL_EVENT', name: 'Pollution Anomaly Lifecycle', requiresTools: true },
  FACILITY_QUERY: { id: 'FACILITY_QUERY', name: 'Facility Telemetry', requiresTools: true },
  LOCATION_COMPARISON: { id: 'LOCATION_COMPARISON', name: 'Spatial Telemetry Comparison', requiresTools: true },
};

function getCapability(capabilityId) {
  return CAPABILITIES[capabilityId] || CAPABILITIES.GENERAL_QUESTION;
}

module.exports = { CAPABILITIES, getCapability };
