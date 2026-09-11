const scienceService = require('../Services/ScienceService');
const { success } = require('../Utilities/responseFormatter');

class ScienceController {
  async getDisciplines(req, res, next) {
    try {
      const disciplines = await scienceService.getDisciplines();
      return success(res, disciplines, 'Science disciplines retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getDisciplineById(req, res, next) {
    try {
      const discipline = await scienceService.getDisciplineById(req.params.id);
      return success(res, discipline, 'Science discipline details and linked resources retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getProjectsByDiscipline(req, res, next) {
    try {
      const projects = await scienceService.getProjectsByDiscipline(req.params.id);
      return success(res, projects, 'Projects in discipline retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getDatasetsByDiscipline(req, res, next) {
    try {
      const datasets = await scienceService.getDatasetsByDiscipline(req.params.id);
      return success(res, datasets, 'Datasets in discipline retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ScienceController();
