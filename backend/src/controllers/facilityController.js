const Facility = require('../models/Facility');
const FacilityReading = require('../models/FacilityReading');
const EnvironmentalAlert = require('../models/EnvironmentalAlert');

/**
 * GET /api/facilities?locationName=NYC&lat=...&lon=...
 */
const getFacilities = async (req, res, next) => {
  try {
    const { locationName, lat, lon } = req.query;
    const locLower = (locationName || '').toLowerCase().trim();

    let facilities = [];

    if (locLower.includes('nyc') || locLower.includes('york')) {
      facilities = [
        {
          _id: 'fac-nyc-1',
          name: 'NewYork-Presbyterian Hospital & Medical Center',
          type: 'hospital',
          address: '525 E 68th St, New York, NY 10065',
          locationName: 'New York City (Manhattan)',
          latitude: 40.7649,
          longitude: -73.9547,
          capacity: 950,
          monitoringStatus: 'ACTIVE',
          alertStatus: 'MODERATE',
        },
        {
          _id: 'fac-nyc-2',
          name: 'Mount Sinai Environmental Care Specialty Clinic',
          type: 'clinic',
          address: '1468 Madison Ave, New York, NY 10029',
          locationName: 'New York City (Upper East)',
          latitude: 40.7891,
          longitude: -73.9548,
          capacity: 340,
          monitoringStatus: 'ACTIVE',
          alertStatus: 'NORMAL',
        },
        {
          _id: 'fac-nyc-3',
          name: 'Bellevue Senior & Respiratory Healthcare Residence',
          type: 'elderly-care',
          address: '462 1st Ave, New York, NY 10016',
          locationName: 'New York City (Midtown)',
          latitude: 40.7388,
          longitude: -73.9757,
          capacity: 180,
          monitoringStatus: 'ACTIVE',
          alertStatus: 'NORMAL',
        },
      ];
    } else if (locLower.includes('delhi')) {
      facilities = [
        {
          _id: 'fac-delhi-1',
          name: 'AIIMS Environmental Health & Super Specialty Hospital',
          type: 'hospital',
          address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
          locationName: 'New Delhi (South)',
          latitude: 28.5672,
          longitude: 77.2100,
          capacity: 1200,
          monitoringStatus: 'ACTIVE',
          alertStatus: 'HIGH',
        },
        {
          _id: 'fac-delhi-2',
          name: 'Fortis Escorts Respiratory Care Center',
          type: 'clinic',
          address: 'Okhla Road, Sukhdev Vihar, New Delhi',
          locationName: 'New Delhi (East)',
          latitude: 28.5601,
          longitude: 77.2743,
          capacity: 450,
          monitoringStatus: 'ACTIVE',
          alertStatus: 'HIGH',
        },
        {
          _id: 'fac-delhi-3',
          name: 'Max Environmental Healthcare & Elderly Residence',
          type: 'elderly-care',
          address: 'Press Enclave Road, Saket, New Delhi',
          locationName: 'New Delhi (Saket)',
          latitude: 28.5284,
          longitude: 77.2120,
          capacity: 210,
          monitoringStatus: 'ACTIVE',
          alertStatus: 'MODERATE',
        },
      ];
    } else if (locLower.includes('london')) {
      facilities = [
        {
          _id: 'fac-london-1',
          name: "St Thomas' NHS Hospital & Respiratory Center",
          type: 'hospital',
          address: 'Westminster Bridge Rd, London SE1 7EH',
          locationName: 'London (Central)',
          latitude: 51.4988,
          longitude: -0.1186,
          capacity: 880,
          monitoringStatus: 'ACTIVE',
          alertStatus: 'NORMAL',
        },
        {
          _id: 'fac-london-2',
          name: 'Royal London Environmental Health Clinic',
          type: 'clinic',
          address: 'Whitechapel Rd, London E1 1FR',
          locationName: 'London (East)',
          latitude: 51.5186,
          longitude: -0.0594,
          capacity: 310,
          monitoringStatus: 'ACTIVE',
          alertStatus: 'NORMAL',
        },
      ];
    } else if (locationName) {
      const cityTitle = locationName.split(',')[0].trim();
      facilities = [
        {
          _id: `fac-${cityTitle.toLowerCase().replace(/\s+/g, '-')}-1`,
          name: `${cityTitle} Central Hospital & Medical Center`,
          type: 'hospital',
          address: `Main Medical Blvd, ${cityTitle}`,
          locationName: cityTitle,
          latitude: Number(lat) || 12.9716,
          longitude: Number(lon) || 77.5946,
          capacity: 650,
          monitoringStatus: 'ACTIVE',
          alertStatus: 'NORMAL',
        },
        {
          _id: `fac-${cityTitle.toLowerCase().replace(/\s+/g, '-')}-2`,
          name: `${cityTitle} Environmental Specialty Clinic`,
          type: 'clinic',
          address: `Health Hub, ${cityTitle}`,
          locationName: cityTitle,
          latitude: (Number(lat) || 12.9716) + 0.01,
          longitude: (Number(lon) || 77.5946) + 0.01,
          capacity: 250,
          monitoringStatus: 'ACTIVE',
          alertStatus: 'NORMAL',
        },
        {
          _id: `fac-${cityTitle.toLowerCase().replace(/\s+/g, '-')}-3`,
          name: `${cityTitle} Golden Care Elderly Residence`,
          type: 'elderly-care',
          address: `Parkside Ave, ${cityTitle}`,
          locationName: cityTitle,
          latitude: (Number(lat) || 12.9716) - 0.01,
          longitude: (Number(lon) || 77.5946) - 0.01,
          capacity: 140,
          monitoringStatus: 'ACTIVE',
          alertStatus: 'MODERATE',
        },
      ];
    } else {
      // Default to database facilities (Bengaluru baseline)
      facilities = await Facility.find().sort({ name: 1 });

      if (facilities.length === 0) {
        const defaultFacilities = [
          {
            name: 'St. John’s Medical Center & General Hospital',
            type: 'hospital',
            address: 'Koramangala 4th Block, Bangalore',
            locationName: 'Bangalore South',
            latitude: 12.9344,
            longitude: 77.6209,
            capacity: 850,
            monitoringStatus: 'ACTIVE',
            alertStatus: 'HIGH',
          },
          {
            name: 'Manipal Super Specialty Clinic',
            type: 'clinic',
            address: 'HAL Airport Road, Bangalore',
            locationName: 'Bangalore East',
            latitude: 12.9585,
            longitude: 77.6483,
            capacity: 220,
            monitoringStatus: 'ACTIVE',
            alertStatus: 'NORMAL',
          },
          {
            name: 'Golden Years Elderly Care Residence',
            type: 'elderly-care',
            address: 'Indiranagar 100ft Road, Bangalore',
            locationName: 'Bangalore East',
            latitude: 12.9784,
            longitude: 77.6408,
            capacity: 120,
            monitoringStatus: 'ACTIVE',
            alertStatus: 'MODERATE',
          },
        ];
        facilities = await Facility.insertMany(defaultFacilities);
      }
    }

    res.status(200).json({ success: true, count: facilities.length, data: facilities });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/facilities
 */
const createFacility = async (req, res, next) => {
  try {
    const facility = await Facility.create(req.body);
    res.status(201).json({ success: true, data: facility });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/facilities/:id
 */
const getFacilityById = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ success: false, error: 'Facility not found' });
    res.status(200).json({ success: true, data: facility });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/facilities/:id/readings
 */
const getFacilityReadings = async (req, res, next) => {
  try {
    let readings = await FacilityReading.find({ facilityId: req.params.id }).sort({ timestamp: -1 }).limit(48);

    if (readings.length === 0) {
      // Seed dummy reading list for past 24h
      const mockReadings = [];
      const now = Date.now();
      for (let i = 24; i >= 0; i--) {
        mockReadings.push({
          facilityId: req.params.id,
          timestamp: new Date(now - i * 3600 * 1000),
          aqi: Math.min(5, Math.max(1, Math.floor(Math.random() * 3) + 2)),
          pm25: Math.floor(Math.random() * 40) + 35,
          pm10: Math.floor(Math.random() * 50) + 55,
          temperature: 24,
          humidity: 58,
          indoorAirIndex: 22,
          ventilationStatus: 'OPTIMAL',
        });
      }
      readings = await FacilityReading.insertMany(mockReadings);
    }

    res.status(200).json({ success: true, count: readings.length, data: readings });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFacilities,
  createFacility,
  getFacilityById,
  getFacilityReadings,
};
