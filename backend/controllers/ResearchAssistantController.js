const researchAssistantService = require('../Services/ResearchAssistantService');
const { success } = require('../Utilities/responseFormatter');

class ResearchAssistantController {
  async ask(req, res, next) {
    try {
      const { question, query, conversationId, filters = {} } = req.body;
      const q = question || query;
      const result = await researchAssistantService.ask(q, conversationId, filters);
      return success(res, result, 'Grounded AI answer generated successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ResearchAssistantController();
