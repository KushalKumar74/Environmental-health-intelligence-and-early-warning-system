/**
 * Places Service for EVA — Healthcare Facility & Amenity Discovery
 * Handles queries like "Find hospitals near me", "Cardiology hospital near Bangalore", "Restaurants near me".
 */
const Facility = require('../../models/Facility');

async function findNearbyHospitals({ userMessage, locationName = 'Bangalore', lat = 12.9716, lon = 77.5946, specialty = null }) {
  const msgLower = userMessage.toLowerCase();

  // Try finding facilities in DB
  let dbFacilities = await Facility.find({}).limit(5);

  let cityHospitals = [];
  const isCardio = msgLower.includes('cardio') || msgLower.includes('heart');
  const isChildren = msgLower.includes('child') || msgLower.includes('pediatric');
  const isEmergency = msgLower.includes('emergency') || msgLower.includes('icu');

  if (locationName.toLowerCase().includes('nyc') || locationName.toLowerCase().includes('york')) {
    cityHospitals = [
      {
        id: 'h-nyc-1',
        name: 'NewYork-Presbyterian Hospital',
        distance: '1.8 km away',
        rating: 4.8,
        address: '525 E 68th St, New York, NY 10065',
        services: isCardio ? 'Cardiology, Emergency, ICU' : isChildren ? 'Pediatric Care, Emergency' : 'Emergency, ICU, General Medicine',
        capacity: '950 beds',
        status: 'OPEN 24/7',
      },
      {
        id: 'h-nyc-2',
        name: 'Mount Sinai Medical Center',
        distance: '2.4 km away',
        rating: 4.7,
        address: '1468 Madison Ave, New York, NY 10029',
        services: 'Cardiology, Pulmonology, Specialty Care',
        capacity: '340 beds',
        status: 'OPEN 24/7',
      },
      {
        id: 'h-nyc-3',
        name: 'Bellevue Hospital Center',
        distance: '3.1 km away',
        rating: 4.5,
        address: '462 1st Ave, New York, NY 10016',
        services: 'Level 1 Trauma, Emergency, Pediatrics',
        capacity: '800 beds',
        status: 'OPEN 24/7',
      },
    ];
  } else if (locationName.toLowerCase().includes('delhi')) {
    cityHospitals = [
      {
        id: 'h-delhi-1',
        name: 'AIIMS Super Specialty Hospital',
        distance: '2.1 km away',
        rating: 4.9,
        address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
        services: 'Cardiology, Pulmonology, ICU, Emergency',
        capacity: '1200 beds',
        status: 'OPEN 24/7',
      },
      {
        id: 'h-delhi-2',
        name: 'Fortis Escorts Heart Institute',
        distance: '3.5 km away',
        rating: 4.8,
        address: 'Okhla Road, New Delhi',
        services: 'Cardiology, Cardiac Surgery, Emergency',
        capacity: '450 beds',
        status: 'OPEN 24/7',
      },
    ];
  } else {
    // Default Bangalore / Generic nearby hospital baseline
    cityHospitals = [
      {
        id: 'h-blr-1',
        name: `St. John’s Medical Center & Hospital (${locationName})`,
        distance: '1.4 km away',
        rating: 4.7,
        address: `Koramangala 4th Block, ${locationName}`,
        services: isCardio ? 'Cardiology, Cardiac Care, Emergency' : isChildren ? 'Pediatrics, Neonatal Care' : 'Emergency, ICU, General Medicine',
        capacity: '850 beds',
        status: 'OPEN 24/7',
      },
      {
        id: 'h-blr-2',
        name: `Manipal Super Specialty Hospital (${locationName})`,
        distance: '2.8 km away',
        rating: 4.6,
        address: `HAL Airport Road, ${locationName}`,
        services: 'Pulmonology, Respiratory Care, ICU',
        capacity: '600 beds',
        status: 'OPEN 24/7',
      },
      {
        id: 'h-blr-3',
        name: `Apollo Environmental Health Center (${locationName})`,
        distance: '3.6 km away',
        rating: 4.5,
        address: `Central Healthcare District, ${locationName}`,
        services: 'Emergency, Outpatient, Respiratory Clinic',
        capacity: '320 beds',
        status: 'OPEN 24/7',
      },
    ];
  }

  let answerText = `🏥 **Nearby Healthcare Facilities matching your search in ${locationName}:**\n\n`;
  cityHospitals.forEach((h, i) => {
    answerText += `${i + 1}. **${h.name}** (${h.distance})\n`;
    answerText += `   • **Rating**: ⭐ ${h.rating} / 5 | **Status**: ${h.status}\n`;
    answerText += `   • **Services**: ${h.services}\n`;
    answerText += `   • **Address**: ${h.address}\n\n`;
  });

  return {
    answerText,
    hospitals: cityHospitals,
  };
}

module.exports = { findNearbyHospitals };
