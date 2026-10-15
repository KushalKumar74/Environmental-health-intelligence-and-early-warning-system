const EnvironmentalEvent = require('../models/EnvironmentalEvent');

/**
 * GET /api/events
 */
const getEvents = async (req, res, next) => {
  try {
    let events = await EnvironmentalEvent.find().sort({ startTime: -1 });

    if (events.length === 0) {
      const demoEvent = await EnvironmentalEvent.create({
        eventId: `ENV-2026-0917-001`,
        type: 'Pollution Anomaly',
        locationName: 'Bangalore Zone A',
        latitude: 12.9716,
        longitude: 77.5946,
        pollutant: 'PM2.5',
        startTime: new Date(Date.now() - 2 * 3600 * 1000),
        peakTime: new Date(Date.now() - 1 * 3600 * 1000),
        peakValue: 137,
        baselineValue: 24,
        durationMinutes: 135,
        severity: 'HIGH',
        confidenceScore: 0.89,
        status: 'MONITORING',
        timeline: [
          { stage: 'Detection', timestamp: new Date(Date.now() - 2 * 3600 * 1000), description: 'Anomaly detected by Isolation Forest', pm25Value: 44 },
          { stage: 'Increasing', timestamp: new Date(Date.now() - 1.5 * 3600 * 1000), description: 'PM2.5 rose sharply above threshold', pm25Value: 92 },
          { stage: 'Peak', timestamp: new Date(Date.now() - 1 * 3600 * 1000), description: 'Peak PM2.5 recorded at 137 µg/m³', pm25Value: 137 },
          { stage: 'Monitoring', timestamp: new Date(Date.now() - 0.5 * 3600 * 1000), description: 'Pollution returning toward baseline', pm25Value: 65 },
        ],
      });
      events = [demoEvent];
    }

    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/:id
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await EnvironmentalEvent.findOne({ eventId: req.params.id }) || await EnvironmentalEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEvents, getEventById };
