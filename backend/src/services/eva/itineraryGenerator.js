/**
 * EVA Itinerary Generator Service
 * Creates structured day-by-day vacation itineraries based on destination, weather, rain %, trip theme, pace, and length.
 */
const { generateResponse } = require('../assistant/aiProvider');

const generateItinerary = async ({ destination, travelPeriod, weatherData, activityTheme, pace = 'Balanced', daysCount = 3 }) => {
  const rainProb = weatherData?.rainProbability || '20%';
  const temp = weatherData?.temperature || '26°C';

  // Construct structured day activities fallback / baseline
  const dayTemplates = [
    {
      day: 1,
      title: 'Arrival & Scenic Exploration',
      morning: `Arrive in ${destination}, check in to accommodations, and enjoy a gentle orientation walk.`,
      afternoon: `Visit central highlights and local viewpoint. Enjoy local cuisine lunch.`,
      evening: `Sunset stroll along the main promenade / scenic viewpoint followed by relaxing dinner.`,
      rainContingency: `If raining (${rainProb} chance), visit local indoor museum or heritage art gallery.`,
    },
    {
      day: 2,
      title: `${activityTheme || 'Main'} Highlights & Outdoor Tour`,
      morning: `Early morning start for top outdoor attraction in ${destination}.`,
      afternoon: `Guided sightseeing tour, local shopping markets, and traditional cafes.`,
      evening: `Cultural evening show or waterfront dinner experience.`,
      rainContingency: `Covered market exploration and indoor culinary workshop if rain occurs.`,
    },
    {
      day: 3,
      title: 'Nature, Relaxation & Farewell Sunset',
      morning: `Relaxed breakfast followed by nearby nature garden or viewpoint visit.`,
      afternoon: `Leisurely souvenir shopping and relaxation at local recommended cafe.`,
      evening: `Farewell dinner experience celebrating the trip to ${destination}.`,
      rainContingency: `Indoor spa experience or craft museum tour.`,
    },
    {
      day: 4,
      title: 'Extended Regional Excursion',
      morning: `Day trip to nearby scenic spot or historic village.`,
      afternoon: `Outdoor picnic or traditional lunch overlooking landscape.`,
      evening: `Return to central ${destination} for evening relaxation.`,
      rainContingency: `Historic indoor palace / heritage building tour.`,
    },
    {
      day: 5,
      title: 'Leisure & Final Departure',
      morning: `Leisurely breakfast, final photos, and souvenir pickups.`,
      afternoon: `Check out and transfer to airport/station for departure.`,
      evening: 'Safe travel home.',
      rainContingency: 'Cozy indoor departure lounge relaxation.',
    },
  ];

  const days = dayTemplates.slice(0, Math.min(daysCount, 5));

  const structuredData = {
    destination,
    travelPeriod: travelPeriod || 'Upcoming Trip',
    pace,
    daysCount,
    activityTheme: activityTheme || 'General Sightseeing',
    weatherSummary: `${temp}, ${weatherData?.weatherDesc || 'Partly Cloudy'}, Rain chance: ${rainProb}`,
    days,
  };

  const answerText = `Here is your custom **${daysCount}-Day ${pace} Itinerary** for **${destination}** (${activityTheme || 'Sightseeing'} focus):\n\n` +
    days.map(d => `**Day ${d.day}: ${d.title}**\n- 🌅 Morning: ${d.morning}\n- ☀️ Afternoon: ${d.afternoon}\n- 🌙 Evening: ${d.evening}\n- ☔ Rain Backup: ${d.rainContingency}`).join('\n\n');

  return {
    answerText,
    structuredData,
  };
};

module.exports = { generateItinerary };
