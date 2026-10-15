/**
 * EVA Central Orchestrator Service
 * Handles menu actions (deterministic execution) and free-text queries (AI interpretation).
 */

const { MAIN_MENU, SUB_MENUS, ROUTE_CONTEXT_MENUS, getStandardLocationPrompt } = require('./evaMenuEngine');
const { getEnvironmentalContext } = require('../assistant/assistantTools');
const { planTravel } = require('../assistant/travelPlanner');
const { findNearbyHospitals } = require('../assistant/placesService');
const { findNearbyPlaces } = require('./nearbyPlacesService');
const { generateItinerary } = require('./itineraryGenerator');
const { generateResponse } = require('../assistant/aiProvider');
const { routeIntent } = require('../assistant/intentRouter');

const processEvaRequest = async ({
  actionId,
  userMessage = '',
  locationName = 'Bangalore',
  lat = 12.9716,
  lon = 77.5946,
  history = [],
  attachmentText = '',
  pageContext = 'Dashboard',
  vacationParams = {},
}) => {
  // 1. Initial Main Menu / Reset Request
  if (actionId === 'MAIN_MENU' || actionId === 'RESET' || (!actionId && !userMessage)) {
    const contextualQuickActions = ROUTE_CONTEXT_MENUS[pageContext] || ROUTE_CONTEXT_MENUS['Dashboard'];
    return {
      success: true,
      type: 'MENU',
      title: MAIN_MENU.title,
      subtitle: MAIN_MENU.subtitle,
      breadcrumbs: ['EVA'],
      message: MAIN_MENU.greeting,
      menuOptions: MAIN_MENU.options,
      quickActions: contextualQuickActions,
    };
  }

  // 2. Sub-menu Navigation Request (e.g. actionId starts with 'cat_' or 'sub_')
  if (actionId && SUB_MENUS[actionId]) {
    const targetMenu = SUB_MENUS[actionId];
    return {
      success: true,
      type: 'MENU',
      title: targetMenu.title,
      breadcrumbs: targetMenu.breadcrumbs,
      message: targetMenu.message,
      menuOptions: targetMenu.options,
    };
  }

  // 3. Location Prompt Sub-Menu Request
  if (actionId && actionId.startsWith('loc_prompt_')) {
    const realTarget = actionId.replace('loc_prompt_', '');
    const promptDef = getStandardLocationPrompt(realTarget);
    return {
      success: true,
      type: 'MENU',
      title: promptDef.title,
      breadcrumbs: promptDef.breadcrumbs,
      message: promptDef.message,
      menuOptions: promptDef.options,
    };
  }

  // 4. Weather Actions
  if (actionId && actionId.startsWith('weather_')) {
    const envData = await getEnvironmentalContext({ locationName, lat, lon, intent: 'WEATHER_QUERY' });
    const isTomorrow = actionId.includes('tomorrow');
    const isRain = actionId.includes('rain');
    const is7Day = actionId.includes('7day');

    let title = `🌤 Weather in ${locationName}`;
    let message = `Here is current weather for **${locationName}**:`;
    if (isTomorrow) {
      title = `🌤 Tomorrow's Weather for ${locationName}`;
      message = `Tomorrow's forecast for **${locationName}** indicates ${envData.weatherDesc || 'mild conditions'} with temperature around ${envData.temp || 26}°C.`;
    } else if (isRain) {
      title = `🌧 Rain Forecast for ${locationName}`;
      message = `Rain probability for **${locationName}** is currently **${envData.humidity > 70 ? '65%' : '20%'}**.`;
    } else if (is7Day) {
      title = `📆 7-Day Weather Outlook for ${locationName}`;
      message = `7-day weather forecast summary for **${locationName}**:`;
    }

    return {
      success: true,
      type: 'WEATHER_CARD',
      title,
      breadcrumbs: ['EVA', 'Weather & Forecast', locationName],
      message,
      structuredData: { ...envData, location: locationName, isTomorrow, isRain, is7Day },
      menuOptions: [
        { id: 'loc_prompt_weather_now', label: '📍 Change Location', action: 'LOCATION_PROMPT' },
        { id: 'aqi_now', label: '🌿 Check AQI', action: 'EXECUTE' },
        { id: 'cat_vacation', label: '✈️ Plan a Vacation', action: 'NAVIGATE' },
        { id: 'cat_weather', label: '← Back to Weather Menu', action: 'NAVIGATE' },
        { id: 'MAIN_MENU', label: '🏠 Main Menu', action: 'MAIN_MENU' },
      ],
    };
  }

  // 5. Air Quality Actions
  if (actionId && (actionId.startsWith('aqi_') || actionId === 'aqi_now')) {
    if (actionId === 'aqi_why_high') {
      const envData = await getEnvironmentalContext({ locationName, lat, lon, intent: 'ENVIRONMENTAL_EXPLANATION' });
      const aiPrompt = `Explain simply why the current AQI of ${envData.aqi} (PM2.5: ${envData.pm25}, PM10: ${envData.pm10}, Wind: ${envData.windSpeed}m/s) in ${locationName} is elevated based on environmental atmospheric factors.`;
      const aiExplanation = await generateResponse({
        userMessage: aiPrompt,
        intentResult: { intent: 'ENVIRONMENTAL_EXPLANATION', category: 'ENVIRONMENTAL' },
        envContext: envData,
      });

      return {
        success: true,
        type: 'TEXT',
        title: `🌿 Why is AQI Higher in ${locationName}?`,
        breadcrumbs: ['EVA', 'Air Quality', 'AQI Analysis'],
        message: aiExplanation,
        structuredData: envData,
        menuOptions: [
          { id: 'aqi_now', label: '🌿 Current AQI Telemetry', action: 'EXECUTE' },
          { id: 'cat_aqi', label: '← Back to AQI Menu', action: 'NAVIGATE' },
          { id: 'MAIN_MENU', label: '🏠 Main Menu', action: 'MAIN_MENU' },
        ],
      };
    }

    const envData = await getEnvironmentalContext({ locationName, lat, lon, intent: 'ENVIRONMENTAL_CURRENT' });
    return {
      success: true,
      type: 'AQI_CARD',
      title: `🌿 Current Air Quality — ${locationName}`,
      breadcrumbs: ['EVA', 'Air Quality', locationName],
      message: `Current Air Quality Index (AQI) for **${locationName}** is **${envData.aqi}** (${envData.category}).`,
      structuredData: { ...envData, location: locationName },
      menuOptions: [
        { id: 'aqi_why_high', label: '❓ Explain Why AQI is High', action: 'EXECUTE' },
        { id: 'loc_prompt_aqi_now', label: '📍 Change Location', action: 'LOCATION_PROMPT' },
        { id: 'weather_now', label: '🌤 Weather Telemetry', action: 'EXECUTE' },
        { id: 'cat_aqi', label: '← Back to AQI Menu', action: 'NAVIGATE' },
        { id: 'MAIN_MENU', label: '🏠 Main Menu', action: 'MAIN_MENU' },
      ],
    };
  }

  // 6. Vacation Planner Destination Select -> Date Select
  if (actionId && actionId.startsWith('vac_dest_')) {
    const destName = vacationParams.destination || (actionId === 'vac_dest_goa' ? 'Goa' : actionId === 'vac_dest_mysore' ? 'Mysore' : actionId === 'vac_dest_ooty' ? 'Ooty' : actionId === 'vac_dest_manali' ? 'Manali' : 'Kerala');
    return {
      success: true,
      type: 'MENU',
      title: `✈️ ${destName} Vacation — Select Dates`,
      breadcrumbs: ['EVA', 'Vacation Planner', destName],
      message: `Great choice! When are you planning to visit **${destName}**?`,
      menuOptions: [
        { id: 'vac_date_this_weekend', label: '🗓 This Weekend', action: 'VACATION_DATE', value: 'This Weekend', destName },
        { id: 'vac_date_next_weekend', label: '🗓 Next Weekend', action: 'VACATION_DATE', value: 'Next Weekend', destName },
        { id: 'vac_date_next_week', label: '📆 Next Week', action: 'VACATION_DATE', value: 'Next Week', destName },
        { id: 'vac_date_custom', label: '📅 Choose Dates', action: 'INPUT_PROMPT', promptMessage: 'Enter preferred travel dates:', destName },
      ],
    };
  }

  // 7. Vacation Planner Date Select -> Theme Select
  if (actionId && actionId.startsWith('vac_date_')) {
    const destName = vacationParams.destination || 'Goa';
    const dateVal = vacationParams.travelPeriod || 'Next Weekend';
    return {
      success: true,
      type: 'MENU',
      title: `✈️ ${destName} (${dateVal}) — Select Trip Style`,
      breadcrumbs: ['EVA', 'Vacation Planner', destName, dateVal],
      message: `What kind of trip are you planning for **${destName}**?`,
      menuOptions: [
        { id: 'vac_style_beach', label: '🏖 Beach & Coastal', action: 'VACATION_BUILD', theme: 'Beach', destName, dateVal },
        { id: 'vac_style_mountains', label: '🏔 Mountains & Hills', action: 'VACATION_BUILD', theme: 'Mountains', destName, dateVal },
        { id: 'vac_style_nature', label: '🌳 Nature & Wildlife', action: 'VACATION_BUILD', theme: 'Nature', destName, dateVal },
        { id: 'vac_style_sightseeing', label: '🏛 Heritage & Sightseeing', action: 'VACATION_BUILD', theme: 'Sightseeing', destName, dateVal },
        { id: 'vac_style_adventure', label: '🧗 Adventure & Trekking', action: 'VACATION_BUILD', theme: 'Adventure', destName, dateVal },
        { id: 'vac_style_family', label: '👨‍👩‍👧 Family & Relaxation', action: 'VACATION_BUILD', theme: 'Family', destName, dateVal },
      ],
    };
  }

  // 8. Vacation Planner Result Building -> Travel Card
  if (actionId && actionId.startsWith('vac_style_')) {
    const destName = vacationParams.destination || 'Goa';
    const dateVal = vacationParams.travelPeriod || 'Next Weekend';
    const themeVal = vacationParams.theme || 'Beach';

    const travelRes = await planTravel({
      userMessage: `Plan a ${themeVal} trip to ${destName} for ${dateVal}`,
      extractedDestination: destName,
      lat,
      lon,
    });

    return {
      success: true,
      type: 'TRAVEL_CARD',
      title: `🌴 ${destName} Vacation Forecast`,
      breadcrumbs: ['EVA', 'Vacation Planner', destName, dateVal, themeVal],
      message: `Here is your **${destName} Vacation Outlook** for **${dateVal}** (${themeVal}):`,
      structuredData: { ...travelRes.travelDataCard, destination: destName, travelPeriod: dateVal, activityTheme: themeVal },
      menuOptions: [
        { id: 'vac_itinerary_pace', label: '🗓 Create Itinerary', action: 'VACATION_ITINERARY_PROMPT', destName, dateVal, themeVal },
        { id: 'weather_7day', label: '🌤 Check 7-Day Forecast', action: 'LOCATION_PROMPT' },
        { id: 'cat_vacation', label: '✈️ Choose Another Destination', action: 'NAVIGATE' },
        { id: 'MAIN_MENU', label: '🏠 Main Menu', action: 'MAIN_MENU' },
      ],
    };
  }

  // 9. Itinerary Generation Request
  if (actionId === 'vac_itinerary_pace' || actionId.startsWith('vac_itin_')) {
    const destName = vacationParams.destination || 'Goa';
    const paceVal = vacationParams.pace || 'Balanced';
    const daysVal = vacationParams.daysCount || 3;

    const itinRes = await generateItinerary({
      destination: destName,
      travelPeriod: vacationParams.travelPeriod || 'Next Weekend',
      weatherData: { temperature: '28°C', weatherDesc: 'Partly Cloudy', rainProbability: '25%' },
      activityTheme: vacationParams.theme || 'Sightseeing',
      pace: paceVal,
      daysCount: daysVal,
    });

    return {
      success: true,
      type: 'ITINERARY',
      title: `🗓 ${daysVal}-Day ${paceVal} Itinerary for ${destName}`,
      breadcrumbs: ['EVA', 'Vacation', destName, 'Itinerary'],
      message: itinRes.answerText,
      structuredData: itinRes.structuredData,
      menuOptions: [
        { id: 'cat_vacation', label: '✈️ Plan Another Trip', action: 'NAVIGATE' },
        { id: 'MAIN_MENU', label: '🏠 Main Menu', action: 'MAIN_MENU' },
      ],
    };
  }

  // 10. Healthcare & Hospital Search
  if (actionId && actionId.startsWith('hosp_')) {
    const facilityType = vacationParams.facilityType || 'Hospital';
    const hospRes = await findNearbyHospitals({
      userMessage: `Find ${facilityType} in ${locationName}`,
      locationName,
      lat,
      lon,
    });

    return {
      success: true,
      type: 'HOSPITAL_CARD',
      title: `🏥 Healthcare Facilities near ${locationName}`,
      breadcrumbs: ['EVA', 'Healthcare', locationName],
      message: `Found **${hospRes.hospitals.length} ${facilityType} facilities** matching your search near **${locationName}**:`,
      structuredData: { hospitals: hospRes.hospitals, locationName },
      menuOptions: [
        { id: 'loc_prompt_hosp_general', label: '📍 Change Location', action: 'LOCATION_PROMPT' },
        { id: 'cat_healthcare', label: '← Back to Healthcare Menu', action: 'NAVIGATE' },
        { id: 'MAIN_MENU', label: '🏠 Main Menu', action: 'MAIN_MENU' },
      ],
    };
  }

  // 11. Nearby Places Search
  if (actionId && actionId.startsWith('near_')) {
    const placeType = vacationParams.placeType || actionId.replace('near_', '');
    const placeRes = await findNearbyPlaces({ placeType, locationName, lat, lon });

    return {
      success: true,
      type: 'PLACE_CARD',
      title: `📍 ${placeRes.label} near ${locationName}`,
      breadcrumbs: ['EVA', 'Explore Nearby', placeRes.label],
      message: placeRes.answerText,
      structuredData: placeRes,
      menuOptions: [
        { id: 'cat_nearby', label: '📍 Explore Other Places', action: 'NAVIGATE' },
        { id: 'MAIN_MENU', label: '🏠 Main Menu', action: 'MAIN_MENU' },
      ],
    };
  }

  // 12. Exposure Actions
  if (actionId && actionId.startsWith('exp_')) {
    const isWhy = actionId === 'exp_why';
    const title = isWhy ? '❓ Exposure Risk Explanation' : '📊 My Environmental Exposure';
    const message = isWhy
      ? `Your cumulative weekly PM2.5 exposure increased by 14% due to low wind dispersion during peak evening transit hours.`
      : `Your overall exposure score for this period is **Low-Moderate (38/100)**. PM2.5 average was 24 µg/m³.`;

    return {
      success: true,
      type: 'EXPOSURE_CARD',
      title,
      breadcrumbs: ['EVA', 'Exposure', locationName],
      message,
      structuredData: { period: actionId, score: 38, avgPm25: 24, status: 'Moderate' },
      menuOptions: [
        { id: 'exp_why', label: '❓ Explain My Risk', action: 'EXECUTE' },
        { id: 'cat_exposure', label: '← Back to Exposure Menu', action: 'NAVIGATE' },
        { id: 'MAIN_MENU', label: '🏠 Main Menu', action: 'MAIN_MENU' },
      ],
    };
  }

  // 13. Alert Actions
  if (actionId && actionId.startsWith('alert_')) {
    const isWhy = actionId === 'alert_why';
    const title = isWhy ? '⚠️ Alert Trigger Explanation' : '🔔 Active Environmental Alerts';
    const message = isWhy
      ? `**Alert Triggered**: Air Quality Index exceeded configured threshold of 150 AQI (Observed: 168 AQI) in Bangalore at 08:30 AM.`
      : `You have **1 active warning alert**: High PM2.5 concentrations detected in your area.`;

    return {
      success: true,
      type: 'ALERT_CARD',
      title,
      breadcrumbs: ['EVA', 'Alerts', locationName],
      message,
      structuredData: { alertId: 'alt-101', trigger: 'PM2.5 > 150', observed: 168, location: locationName, timestamp: new Date().toLocaleTimeString() },
      menuOptions: [
        { id: 'alert_why', label: '❓ Why Did I Get Alert?', action: 'EXECUTE' },
        { id: 'cat_alerts', label: '← Back to Alerts Menu', action: 'NAVIGATE' },
        { id: 'MAIN_MENU', label: '🏠 Main Menu', action: 'MAIN_MENU' },
      ],
    };
  }

  // 14. Free-Text Natural Language AI Processing Fallback
  if (userMessage && userMessage.trim()) {
    const intentResult = routeIntent(userMessage, history, attachmentText);
    const activeLocation = intentResult.extractedLocation || locationName;

    // Handle natural travel questions typed as text
    if (intentResult.intent === 'TRAVEL_PLANNING') {
      const travelRes = await planTravel({ userMessage, extractedDestination: activeLocation, lat, lon });
      return {
        success: true,
        type: 'TRAVEL_CARD',
        title: `🌴 ${activeLocation} Travel Plan`,
        breadcrumbs: ['EVA', 'Travel Query', activeLocation],
        message: travelRes.answerText,
        structuredData: travelRes.travelDataCard,
        menuOptions: [
          { id: 'vac_itinerary_pace', label: '🗓 Create Itinerary', action: 'VACATION_ITINERARY_PROMPT', destination: activeLocation },
          { id: 'MAIN_MENU', label: '🏠 Main Menu', action: 'MAIN_MENU' },
        ],
      };
    }

    // Handle natural hospital search typed as text
    if (intentResult.intent === 'HOSPITAL_SEARCH') {
      const hospRes = await findNearbyHospitals({ userMessage, locationName: activeLocation, lat, lon });
      return {
        success: true,
        type: 'HOSPITAL_CARD',
        title: `🏥 Hospitals near ${activeLocation}`,
        breadcrumbs: ['EVA', 'Hospital Query', activeLocation],
        message: hospRes.answerText,
        structuredData: { hospitals: hospRes.hospitals, locationName: activeLocation },
        menuOptions: [
          { id: 'cat_healthcare', label: '🏥 Healthcare Menu', action: 'NAVIGATE' },
          { id: 'MAIN_MENU', label: '🏠 Main Menu', action: 'MAIN_MENU' },
        ],
      };
    }

    // General AI & Environmental Text fallback
    const envContext = intentResult.requiresEnvTools
      ? await getEnvironmentalContext({ locationName: activeLocation, lat, lon, intent: intentResult.intent })
      : null;

    const aiAnswer = await generateResponse({
      userMessage,
      intentResult,
      envContext,
      history,
      attachmentText,
    });

    return {
      success: true,
      type: envContext ? 'AQI_CARD' : 'TEXT',
      title: envContext ? `🌿 Environmental Intelligence` : `🤖 EVA Assistant`,
      breadcrumbs: ['EVA', 'Custom Query'],
      message: aiAnswer,
      structuredData: envContext,
      menuOptions: [
        { id: 'MAIN_MENU', label: '🏠 Main Menu', action: 'MAIN_MENU' },
      ],
    };
  }

  // Fallback to Main Menu
  return {
    success: true,
    type: 'MENU',
    title: MAIN_MENU.title,
    breadcrumbs: ['EVA'],
    message: MAIN_MENU.greeting,
    menuOptions: MAIN_MENU.options,
  };
};

module.exports = { processEvaRequest };
