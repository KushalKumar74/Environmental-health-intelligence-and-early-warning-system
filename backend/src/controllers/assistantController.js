const { processEvaRequest } = require('../services/eva/evaOrchestrator');

/**
 * POST /api/assistant/query
 * EVA — Menu-Driven Conversational AI Assistant Endpoint
 */
const queryAssistant = async (req, res, next) => {
  try {
    const {
      actionId,
      question = '',
      locationName = 'Bangalore',
      lat = 12.9716,
      lon = 77.5946,
      history = [],
      attachmentText = '',
      pageContext = 'Dashboard',
      vacationParams = {},
    } = req.body;

    const evaResult = await processEvaRequest({
      actionId,
      userMessage: question,
      locationName,
      lat,
      lon,
      history,
      attachmentText,
      pageContext,
      vacationParams,
    });

    res.status(200).json({
      success: true,
      answer: evaResult.message || '',
      responseType: evaResult.type || 'TEXT',
      title: evaResult.title,
      breadcrumbs: evaResult.breadcrumbs,
      structuredData: evaResult.structuredData,
      menuOptions: evaResult.menuOptions,
      quickActions: evaResult.quickActions,
      badge: evaResult.title ? `🌿 ${evaResult.title}` : '🌿 EVA',
    });
  } catch (error) {
    console.error('EVA orchestrator error:', error);
    res.status(200).json({
      success: true,
      answer: "I experienced a brief connection issue. Please try your selection again.",
      responseType: 'TEXT',
      badge: '🌿 EVA',
    });
  }
};

module.exports = { queryAssistant };



