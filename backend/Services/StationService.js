const stationRepository = require('../Repositories/StationRepository');
const researcherRepository = require('../Repositories/ResearcherRepository');
const projectRepository = require('../Repositories/ProjectRepository');
const expeditionRepository = require('../Repositories/ExpeditionRepository');
const datasetRepository = require('../Repositories/DatasetRepository');
const publicationRepository = require('../Repositories/PublicationRepository');

class StationService {
  async getStations(query = {}) {
    const { country, status, region, search, limit = 100, page = 1 } = query;
    const filter = {};

    if (country && country !== 'all' && country.trim()) {
      filter.country = { $regex: `^${country.trim()}$`, $options: 'i' };
    }
    if (status && status !== 'all' && status.trim()) {
      filter.status = { $regex: `^${status.trim()}$`, $options: 'i' };
    }
    if (region && region !== 'all' && region.trim()) {
      filter.region = { $regex: `^${region.trim()}$`, $options: 'i' };
    }
    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [
        { name: regex },
        { location: regex },
        { operator: regex },
        { country: regex }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const [stations, total, countries, statuses, regions] = await Promise.all([
      stationRepository.find(filter, {
        sort: { is_indian_station: -1, name: 1 },
        skip,
        limit: parsedLimit
      }),
      stationRepository.count(filter),
      stationRepository.distinct('country'),
      stationRepository.distinct('status'),
      stationRepository.distinct('region')
    ]);

    return {
      stations,
      total,
      page: parseInt(page, 10),
      limit: parsedLimit,
      available_countries: (countries || []).sort(),
      available_statuses: (statuses || []).sort(),
      available_regions: (regions || []).sort()
    };
  }

  async getStationById(id) {
    const station = await stationRepository.findBySlugOrId(id);
    if (!station) {
      throw { statusCode: 404, message: `Station not found for id: ${id}` };
    }
    return station;
  }

  async getIndianStations() {
    return stationRepository.findIndianStations();
  }

  async getResearchersForStation(id) {
    const station = await this.getStationById(id);
    const stnId = station.station_id || id;
    return researcherRepository.find({
      $or: [
        { stations: stnId },
        { stations: station.name }
      ]
    });
  }

  async getProjectsForStation(id) {
    const station = await this.getStationById(id);
    const stnId = station.station_id || id;
    return projectRepository.find({
      $or: [
        { station_ids: stnId },
        { station_ids: station.name }
      ]
    });
  }

  async getExpeditionsForStation(id) {
    const station = await this.getStationById(id);
    const stnName = station.name;
    return expeditionRepository.find({
      $or: [
        { ports: { $regex: stnName, $options: 'i' } },
        { route: { $regex: stnName, $options: 'i' } },
        { operational_highlights: { $regex: stnName, $options: 'i' } }
      ]
    });
  }

  async getDatasetsForStation(id) {
    const station = await this.getStationById(id);
    const stnId = station.station_id || id;
    return datasetRepository.find({
      $or: [
        { station_id: stnId },
        { location: { $regex: station.name, $options: 'i' } }
      ]
    });
  }

  async getPublicationsForStation(id) {
    const station = await this.getStationById(id);
    const stnId = station.station_id || id;
    return publicationRepository.find({
      $or: [
        { station_ids: stnId },
        { title: { $regex: station.name, $options: 'i' } },
        { abstract: { $regex: station.name, $options: 'i' } }
      ]
    });
  }
}

module.exports = new StationService();
