/**
 * EVA Menu Engine — Structured Menu Data, Sub-menus, Options & Breadcrumb Definitions
 * Inspired by Namma Metro WhatsApp Chatbot: MENU -> SELECT -> SUB-MENU -> SELECT -> RESULT -> NEXT ACTION
 */

const MAIN_MENU = {
  id: 'main_menu',
  title: '🌿 EVA — Main Menu',
  subtitle: 'Your Environmental & Personal AI Assistant',
  greeting: 'Hi! 👋 What would you like to do today?',
  breadcrumbs: ['EVA'],
  options: [
    { id: 'cat_weather', label: '🌤 Weather & Forecast', icon: 'Sun', category: 'WEATHER' },
    { id: 'cat_aqi', label: '🌿 Air Quality', icon: 'Wind', category: 'AQI' },
    { id: 'cat_vacation', label: '✈️ Plan a Vacation', icon: 'Palmtree', category: 'VACATION' },
    { id: 'cat_healthcare', label: '🏥 Healthcare & Hospitals', icon: 'Hospital', category: 'HEALTHCARE' },
    { id: 'cat_nearby', label: '📍 Explore Nearby', icon: 'MapPin', category: 'NEARBY' },
    { id: 'cat_routes', label: '🗺 Route & Travel', icon: 'Route', category: 'ROUTES' },
    { id: 'cat_exposure', label: '📊 My Exposure', icon: 'Activity', category: 'EXPOSURE' },
    { id: 'cat_alerts', label: '⚠️ My Alerts', icon: 'Bell', category: 'ALERTS' },
    { id: 'cat_insights', label: '📈 Environmental Insights', icon: 'TrendingUp', category: 'INSIGHTS' },
    { id: 'cat_general_ai', label: '🤖 More / AI Assistant', icon: 'Sparkles', category: 'GENERAL_AI' },
  ],
};

// Map route page name to context-sensitive recommended quick actions
const ROUTE_CONTEXT_MENUS = {
  'Dashboard': [
    { id: 'weather_now', label: '🌤 Weather Now', action: 'EXECUTE' },
    { id: 'aqi_now', label: '🌿 Current AQI', action: 'EXECUTE' },
    { id: 'aqi_why_high', label: '❓ Why is AQI High?', action: 'EXECUTE' },
    { id: 'cat_vacation', label: '✈️ Plan a Vacation', action: 'NAVIGATE' },
  ],
  'GIS Spatial Map': [
    { id: 'aqi_now', label: '🌿 AQI Here', action: 'EXECUTE' },
    { id: 'cat_nearby', label: '📍 Nearby Places', action: 'NAVIGATE' },
    { id: 'cat_healthcare', label: '🏥 Find Hospitals', action: 'NAVIGATE' },
    { id: 'cat_routes', label: '🗺 Analyze Route', action: 'NAVIGATE' },
  ],
  'Facilities': [
    { id: 'hosp_general', label: '🏥 Hospitals Near Me', action: 'EXECUTE' },
    { id: 'hosp_emergency', label: '🚨 Emergency Care', action: 'EXECUTE' },
    { id: 'hosp_clinics', label: '🩺 Clinics', action: 'EXECUTE' },
  ],
  'Exposure History': [
    { id: 'exp_today', label: '📊 Today\'s Exposure', action: 'EXECUTE' },
    { id: 'exp_week', label: '📈 Weekly Exposure', action: 'EXECUTE' },
    { id: 'exp_why', label: '❓ Explain My Risk', action: 'EXECUTE' },
  ],
  'Events & Alerts': [
    { id: 'alert_active', label: '⚠️ Active Alerts', action: 'EXECUTE' },
    { id: 'alert_why', label: '❓ Why Did I Get Alert?', action: 'EXECUTE' },
    { id: 'alert_history', label: '📜 Alert History', action: 'EXECUTE' },
  ],
};

// Menu Category Definitions
const SUB_MENUS = {
  cat_weather: {
    id: 'cat_weather',
    title: '🌤 Weather & Forecast',
    message: 'What weather information would you like to check?',
    breadcrumbs: ['EVA', 'Weather & Forecast'],
    options: [
      { id: 'weather_now', label: 'Weather Now', action: 'LOCATION_PROMPT' },
      { id: 'weather_today', label: 'Today\'s Weather', action: 'LOCATION_PROMPT' },
      { id: 'weather_tomorrow', label: 'Tomorrow\'s Forecast', action: 'LOCATION_PROMPT' },
      { id: 'weather_7day', label: '7-Day Forecast', action: 'LOCATION_PROMPT' },
      { id: 'weather_rain', label: 'Will It Rain?', action: 'LOCATION_PROMPT' },
      { id: 'cat_vacation', label: 'Weather for a Trip', action: 'NAVIGATE' },
    ],
  },
  cat_aqi: {
    id: 'cat_aqi',
    title: '🌿 Air Quality',
    message: 'What air quality telemetry would you like to inspect?',
    breadcrumbs: ['EVA', 'Air Quality'],
    options: [
      { id: 'aqi_now', label: 'Current AQI', action: 'LOCATION_PROMPT' },
      { id: 'aqi_pollutants', label: 'PM2.5 / PM10 Breakdown', action: 'LOCATION_PROMPT' },
      { id: 'aqi_forecast', label: 'AQI Forecast', action: 'LOCATION_PROMPT' },
      { id: 'aqi_compare', label: 'Compare Locations', action: 'INPUT_PROMPT', promptMessage: 'Enter two locations to compare (e.g. Bangalore vs Delhi):' },
      { id: 'aqi_why_high', label: 'Why is AQI High?', action: 'EXECUTE' },
      { id: 'aqi_my_risk', label: 'My Environmental Risk', action: 'EXECUTE' },
    ],
  },
  cat_vacation: {
    id: 'cat_vacation',
    title: '✈️ Plan a Vacation',
    message: 'Where would you like to go on vacation?',
    breadcrumbs: ['EVA', 'Vacation Planner'],
    options: [
      { id: 'vac_dest_goa', label: '🏖 Goa', action: 'VACATION_DEST', value: 'Goa' },
      { id: 'vac_dest_mysore', label: '🏛 Mysore', action: 'VACATION_DEST', value: 'Mysore' },
      { id: 'vac_dest_ooty', label: '🏔 Ooty', action: 'VACATION_DEST', value: 'Ooty' },
      { id: 'vac_dest_manali', label: '❄️ Manali', action: 'VACATION_DEST', value: 'Manali' },
      { id: 'vac_dest_kerala', label: '🌴 Kerala', action: 'VACATION_DEST', value: 'Kerala' },
      { id: 'vac_dest_custom', label: '🔍 Enter Destination', action: 'INPUT_PROMPT', promptMessage: 'Type your vacation destination:' },
    ],
  },
  cat_healthcare: {
    id: 'cat_healthcare',
    title: '🏥 Healthcare & Hospitals',
    message: 'What type of healthcare facility are you looking for?',
    breadcrumbs: ['EVA', 'Healthcare'],
    options: [
      { id: 'hosp_general', label: '🏥 Hospitals', action: 'LOCATION_PROMPT', facilityType: 'Hospital' },
      { id: 'hosp_emergency', label: '🚨 Emergency Care', action: 'LOCATION_PROMPT', facilityType: 'Emergency' },
      { id: 'hosp_clinics', label: '🩺 Clinics', action: 'LOCATION_PROMPT', facilityType: 'Clinic' },
      { id: 'hosp_pharmacies', label: '💊 Pharmacies', action: 'LOCATION_PROMPT', facilityType: 'Pharmacy' },
      { id: 'hosp_diagnostic', label: '🔬 Diagnostic Centers', action: 'LOCATION_PROMPT', facilityType: 'Diagnostic' },
    ],
  },
  cat_nearby: {
    id: 'cat_nearby',
    title: '📍 Explore Nearby',
    message: 'Select what nearby places you want to explore:',
    breadcrumbs: ['EVA', 'Explore Nearby'],
    options: [
      { id: 'near_hospitals', label: '🏥 Hospitals', action: 'NEARBY_SEARCH', placeType: 'hospitals' },
      { id: 'near_restaurants', label: '🍽 Restaurants', action: 'NEARBY_SEARCH', placeType: 'restaurants' },
      { id: 'near_hotels', label: '🏨 Hotels', action: 'NEARBY_SEARCH', placeType: 'hotels' },
      { id: 'near_pharmacies', label: '💊 Pharmacies', action: 'NEARBY_SEARCH', placeType: 'pharmacies' },
      { id: 'near_cafes', label: '☕ Cafes', action: 'NEARBY_SEARCH', placeType: 'cafes' },
      { id: 'near_tourist', label: '📸 Tourist Attractions', action: 'NEARBY_SEARCH', placeType: 'attractions' },
      { id: 'near_ev', label: '⚡ EV Charging', action: 'NEARBY_SEARCH', placeType: 'ev_charging' },
      { id: 'near_parking', label: '🅿️ Parking', action: 'NEARBY_SEARCH', placeType: 'parking' },
    ],
  },
  cat_routes: {
    id: 'cat_routes',
    title: '🗺 Routes & Travel',
    message: 'Select route & travel intelligence service:',
    breadcrumbs: ['EVA', 'Routes & Travel'],
    options: [
      { id: 'route_plan', label: '🗺 Plan a Route', action: 'INPUT_PROMPT', promptMessage: 'Enter origin and destination (e.g. Bangalore to Mysore):' },
      { id: 'route_compare', label: '⚡ Compare Routes', action: 'EXECUTE' },
      { id: 'route_low_exp', label: '🌿 Lower Exposure Route', action: 'EXECUTE' },
      { id: 'route_weather', label: '🌤 Travel Weather', action: 'LOCATION_PROMPT' },
    ],
  },
  cat_exposure: {
    id: 'cat_exposure',
    title: '📊 My Exposure',
    message: 'Select exposure period or trend analysis:',
    breadcrumbs: ['EVA', 'My Exposure'],
    options: [
      { id: 'exp_today', label: '📅 Today', action: 'EXECUTE' },
      { id: 'exp_week', label: '📆 This Week', action: 'EXECUTE' },
      { id: 'exp_month', label: '🗓 This Month', action: 'EXECUTE' },
      { id: 'exp_trend', label: '📈 Exposure Trend', action: 'EXECUTE' },
      { id: 'exp_highest', label: '⚠️ Highest Exposure Period', action: 'EXECUTE' },
      { id: 'exp_why', label: '❓ Why Did Exposure Increase?', action: 'EXECUTE' },
    ],
  },
  cat_alerts: {
    id: 'cat_alerts',
    title: '⚠️ My Alerts',
    message: 'Select alert status or explanation option:',
    breadcrumbs: ['EVA', 'My Alerts'],
    options: [
      { id: 'alert_active', label: '🔔 Active Alerts', action: 'EXECUTE' },
      { id: 'alert_history', label: '📜 Alert History', action: 'EXECUTE' },
      { id: 'alert_why', label: '❓ Why Did I Get This Alert?', action: 'EXECUTE' },
      { id: 'alert_settings', label: '⚙️ Alert Settings', action: 'EXECUTE' },
    ],
  },
  cat_insights: {
    id: 'cat_insights',
    title: '📈 Environmental Insights',
    message: 'Select an environmental intelligence insight:',
    breadcrumbs: ['EVA', 'Insights'],
    options: [
      { id: 'ins_trends', label: '📊 Pollution Trends', action: 'EXECUTE' },
      { id: 'ins_events', label: '🔥 Environmental Events', action: 'EXECUTE' },
      { id: 'ins_compare', label: '🌆 Location Comparison', action: 'EXECUTE' },
      { id: 'ins_risk', label: '🛡 Risk Insights', action: 'EXECUTE' },
    ],
  },
  cat_general_ai: {
    id: 'cat_general_ai',
    title: '🤖 More / AI Assistant',
    message: 'What everyday text, study, or coding task would you like help with?',
    breadcrumbs: ['EVA', 'AI Assistant'],
    options: [
      { id: 'ai_ask_free', label: '💬 Ask EVA Anything', action: 'INPUT_PROMPT', promptMessage: 'Type your question or request:' },
      { id: 'ai_write', label: '✍️ Write Something', action: 'SUBMENU', target: 'sub_ai_write' },
      { id: 'ai_summarize', label: '📝 Summarize Text', action: 'INPUT_PROMPT', promptMessage: 'Paste the text you want summarized:' },
      { id: 'ai_translate', label: '🌐 Translate', action: 'INPUT_PROMPT', promptMessage: 'Paste text and target language:' },
      { id: 'ai_study', label: '📚 Study Assistant', action: 'SUBMENU', target: 'sub_ai_study' },
      { id: 'ai_coding', label: '💻 Coding Help', action: 'SUBMENU', target: 'sub_ai_coding' },
      { id: 'ai_brainstorm', label: '💡 Brainstorm Ideas', action: 'INPUT_PROMPT', promptMessage: 'Enter topic to brainstorm:' },
    ],
  },

  // Sub-menus for writing, study, and coding
  sub_ai_write: {
    id: 'sub_ai_write',
    title: '✍️ Writing Assistant',
    message: 'What would you like to write?',
    breadcrumbs: ['EVA', 'AI Assistant', 'Write'],
    options: [
      { id: 'write_email', label: '✉️ Professional Email', action: 'INPUT_PROMPT', promptMessage: 'Describe what the email should say:' },
      { id: 'write_msg', label: '💬 Chat Message', action: 'INPUT_PROMPT', promptMessage: 'Describe the message:' },
      { id: 'write_resume', label: '📄 Resume Summary / Bullet', action: 'INPUT_PROMPT', promptMessage: 'Describe job title or achievements:' },
      { id: 'write_report', label: '📊 Summary Report', action: 'INPUT_PROMPT', promptMessage: 'Describe report key findings:' },
      { id: 'write_post', label: '📱 Social Media Post', action: 'INPUT_PROMPT', promptMessage: 'Enter post topic:' },
    ],
  },
  sub_ai_study: {
    id: 'sub_ai_study',
    title: '📚 Study Assistant',
    message: 'What study assistance do you need?',
    breadcrumbs: ['EVA', 'AI Assistant', 'Study'],
    options: [
      { id: 'study_explain', label: '🧠 Explain a Topic Simply', action: 'INPUT_PROMPT', promptMessage: 'Enter the topic name:' },
      { id: 'study_questions', label: '❓ Generate Practice Questions', action: 'INPUT_PROMPT', promptMessage: 'Enter subject or topic:' },
      { id: 'study_notes', label: '📝 Create Study Notes', action: 'INPUT_PROMPT', promptMessage: 'Paste chapter or topic details:' },
      { id: 'study_mcq', label: '🎯 Multiple Choice Quiz (MCQs)', action: 'INPUT_PROMPT', promptMessage: 'Enter subject name:' },
      { id: 'study_prep', label: '💼 Interview Preparation', action: 'INPUT_PROMPT', promptMessage: 'Enter role or topic:' },
    ],
  },
  sub_ai_coding: {
    id: 'sub_ai_coding',
    title: '💻 Coding Assistant',
    message: 'What programming task can I help you with?',
    breadcrumbs: ['EVA', 'AI Assistant', 'Coding'],
    options: [
      { id: 'code_explain', label: '📖 Explain Code', action: 'INPUT_PROMPT', promptMessage: 'Paste code snippet:' },
      { id: 'code_debug', label: '🐞 Debug Code / Fix Error', action: 'INPUT_PROMPT', promptMessage: 'Paste code and error message:' },
      { id: 'code_gen', label: '⚡ Generate Code Snippet', action: 'INPUT_PROMPT', promptMessage: 'Describe what code should do:' },
      { id: 'code_learn', label: '🚀 Learn Programming Concept', action: 'INPUT_PROMPT', promptMessage: 'Enter programming topic:' },
    ],
  },
};

// Location Prompt Sub-Menu Template
function getStandardLocationPrompt(targetAction, title, breadcrumbs) {
  return {
    id: `loc_prompt_${targetAction}`,
    title: title || 'Select Location',
    message: 'Where would you like to check?',
    breadcrumbs: breadcrumbs || ['EVA', 'Select Location'],
    options: [
      { id: `${targetAction}_loc_device`, label: '📍 My Location', action: 'EXECUTE', locType: 'DEVICE', targetAction },
      { id: `${targetAction}_loc_saved`, label: '📌 Saved Location (Bangalore)', action: 'EXECUTE', locType: 'SAVED', locationName: 'Bangalore', targetAction },
      { id: `${targetAction}_loc_custom`, label: '🏙 Enter Location', action: 'INPUT_PROMPT', promptMessage: 'Enter city or landmark name:', targetAction },
    ],
  };
}

module.exports = {
  MAIN_MENU,
  SUB_MENUS,
  ROUTE_CONTEXT_MENUS,
  getStandardLocationPrompt,
};
