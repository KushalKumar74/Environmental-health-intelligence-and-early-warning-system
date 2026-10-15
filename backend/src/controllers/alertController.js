const EnvironmentalAlert = require('../models/EnvironmentalAlert');

/**
 * GET /api/alerts
 */
const getAlerts = async (req, res, next) => {
  try {
    const { status, severity } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    let alerts = await EnvironmentalAlert.find(filter).sort({ createdAt: -1 });

    // Seed dummy alert if empty so UI is never blank
    if (alerts.length === 0) {
      const demoAlert = await EnvironmentalAlert.create({
        alertId: `ALT-DEMO-${Date.now()}`,
        type: 'Pollution Spike',
        severity: 'HIGH',
        locationName: 'Bangalore Central',
        observedValue: 88,
        thresholdValue: 60,
        message: 'Rapid increase in PM2.5 detected (88 µg/m³).',
        recommendedMonitoringAction: 'Limit outdoor exertion for sensitive groups.',
        status: 'ACTIVE',
      });
      alerts = [demoAlert];
    }

    res.status(200).json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/alerts/:id/acknowledge
 */
const acknowledgeAlert = async (req, res, next) => {
  try {
    const alert = await EnvironmentalAlert.findByIdAndUpdate(
      req.params.id,
      {
        status: 'ACKNOWLEDGED',
        acknowledgedBy: req.user?._id || null,
        acknowledgedAt: new Date(),
      },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });
    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/alerts/:id/dismiss
 */
const dismissAlert = async (req, res, next) => {
  try {
    const alert = await EnvironmentalAlert.findByIdAndUpdate(
      req.params.id,
      { status: 'DISMISSED', resolvedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });
    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  acknowledgeAlert,
  dismissAlert,
};
