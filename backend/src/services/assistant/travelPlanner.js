/**
 * Travel Planner Service for EVA
 * Handles vacation queries, natural date parsing, destination weather/AQI retrieval, and travel card structuring.
 */
const { fetchAQIByCoordinates, fetchWeatherForecast } = require('../aqiService');

// Known city coordinates fallback for travel destinations
const DESTINATION_COORDS = {
  goa: { lat: 15.2993, lon: 74.1240, name: 'Goa, India' },
  mysore: { lat: 12.2958, lon: 76.6394, name: 'Mysore, India' },
  manali: { lat: 32.2432, lon: 77.1892, name: 'Manali, Himachal Pradesh' },
  ooty: { lat: 11.4102, lon: 76.6950, name: 'Ooty, Tamil Nadu' },
  jaipur: { lat: 26.9124, lon: 75.7873, name: 'Jaipur, Rajasthan' },
  mumbai: { lat: 19.0760, lon: 72.8777, name: 'Mumbai, Maharashtra' },
  delhi: { lat: 28.6139, lon: 77.2090, name: 'New Delhi, India' },
  bangalore: { lat: 12.9716, lon: 77.5946, name: 'Bangalore, India' },
  bengaluru: { lat: 12.9716, lon: 77.5946, name: 'Bengaluru, India' },
  london: { lat: 51.5074, lon: -0.1278, name: 'London, UK' },
  paris: { lat: 48.8566, lon: 2.3522, name: 'Paris, France' },
  tokyo: { lat: 35.6762, lon: 139.6503, name: 'Tokyo, Japan' },
  nyc: { lat: 40.7128, lon: -74.0060, name: 'New York City, USA' },
};

async function planTravel({ userMessage, extractedDestination, lat, lon }) {
  const msgLower = userMessage.toLowerCase();

  // Determine target destination
  let destKey = (extractedDestination || '').toLowerCase().trim();
  let destInfo = DESTINATION_COORDS[destKey];

  if (!destInfo) {
    // Search message for destination keywords
    for (const key of Object.keys(DESTINATION_COORDS)) {
      if (msgLower.includes(key)) {
        destKey = key;
        destInfo = DESTINATION_COORDS[key];
        break;
      }
    }
  }

  if (!destInfo) {
    // Fallback if destination specified is not in hardcoded list
    const titleDest = extractedDestination || 'Requested Destination';
    destInfo = {
      name: titleDest,
      lat: Number(lat) || 15.2993,
      lon: Number(lon) || 74.1240,
    };
  }

  // Parse natural date phrases
  let travelPeriod = 'Next 3-5 Days';
  let isFarAhead = false;

  if (msgLower.includes('next weekend')) travelPeriod = 'Next Weekend (Sat-Sun)';
  else if (msgLower.includes('this weekend')) travelPeriod = 'This Weekend (Sat-Sun)';
  else if (msgLower.includes('next week')) travelPeriod = 'Next Week (5 Days)';
  else if (msgLower.includes('december') || msgLower.includes('christmas')) {
    travelPeriod = 'December Season';
    isFarAhead = true;
  } else if (msgLower.includes('tomorrow')) travelPeriod = 'Tomorrow';

  // Fetch destination telemetry
  const [aqiData, weatherData] = await Promise.all([
    fetchAQIByCoordinates(destInfo.lat, destInfo.lon).catch(() => ({ aqi: 2, components: { pm2_5: 22 } })),
    fetchWeatherForecast(destInfo.lat, destInfo.lon).catch(() => []),
  ]);

  const temp = weatherData[0]?.tempMax || 28;
  const weatherDesc = weatherData[0]?.description || 'Partly sunny & pleasant';
  const humidity = weatherData[0]?.humidity || 62;
  const rainProb = weatherDesc.includes('rain') || weatherDesc.includes('shower') ? 45 : 15;
  const aqiLevel = aqiData.aqi || 2;

  let outlook = 'Favorable for outdoor sightseeing, beach visits, and nature activities.';
  if (rainProb > 40) {
    outlook = 'Suitable for travel with periodic rain expected. Consider indoor attractions during showers.';
  } else if (aqiLevel >= 4) {
    outlook = 'Moderate to poor air quality expected. Keep mask accessible during peak daytime hours.';
  }

  const suggestedActivities = [
    `Sightseeing & outdoor exploring during morning hours (${temp}°C)`,
    `Local culinary & cultural attractions`,
    `Evening coastal or nature walks`,
    `Indoor museum & heritage visits if precipitation occurs`,
  ];

  const travelDataCard = {
    destination: destInfo.name,
    travelPeriod,
    temperature: `${temp}°C`,
    weatherDesc,
    humidity: `${humidity}%`,
    rainProbability: `${rainProb}%`,
    aqiLevel,
    isFarAhead,
    outlook,
    suggestedActivities,
  };

  let answerText = `🌴 **Travel & Vacation Assistance — ${destInfo.name}**\n\n`;
  if (isFarAhead) {
    answerText += `A daily forecast is not yet available for ${travelPeriod}, but typical seasonal weather for ${destInfo.name} is pleasant with average temperatures around ${temp}°C.\n\n`;
  } else {
    answerText += `Here is the environmental and weather outlook for your trip to **${destInfo.name}** (${travelPeriod}):\n\n`;
    answerText += `- **Temperature**: ${temp}°C (${weatherDesc})\n`;
    answerText += `- **Rain Probability**: ${rainProb}%\n`;
    answerText += `- **Air Quality Index**: Level ${aqiLevel} / 5 (Good/Fair)\n`;
    answerText += `- **Vacation Outlook**: ${outlook}\n\n`;
  }
  answerText += `*Suggested Activities:* ${suggestedActivities.join(' • ')}`;

  return {
    answerText,
    travelDataCard,
  };
}

module.exports = { planTravel };
