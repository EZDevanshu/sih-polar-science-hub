const datasetRepository = require('../Repositories/DatasetRepository');
const publicationRepository = require('../Repositories/PublicationRepository');
const projectRepository = require('../Repositories/ProjectRepository');
const { getDb } = require('../Configuration/database');

class DatasetService {
  async getDatasets(query = {}) {
    const { search, discipline, station, region, limit = 50, page = 1 } = query;
    const filter = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { dataset_id: regex },
        { title: regex },
        { description: regex },
        { parameters: regex },
        { source: regex }
      ];
    }
    if (discipline && discipline.trim()) {
      filter.discipline = { $regex: discipline.trim(), $options: 'i' };
    }
    if (station && station.trim()) {
      filter.station_id = station.trim();
    }
    if (region && region.trim()) {
      filter.region = { $regex: region.trim(), $options: 'i' };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const [datasets, total] = await Promise.all([
      datasetRepository.find(filter, { skip, limit: parsedLimit, sort: { dataset_id: 1 } }),
      datasetRepository.count(filter)
    ]);

    return { datasets, total, page: parseInt(page, 10), limit: parsedLimit };
  }

  async getDatasetById(id) {
    const dataset = await datasetRepository.findByDatasetId(id);
    if (!dataset) {
      throw { statusCode: 404, message: `Dataset not found for id: ${id}` };
    }

    // Dynamic record count from underlying collection if linked
    let liveRecordCount = null;
    if (dataset.related_collection) {
      try {
        const db = getDb();
        liveRecordCount = await db.collection(dataset.related_collection).countDocuments();
      } catch (e) {}
    }

    return {
      ...dataset,
      live_records_count: liveRecordCount
    };
  }

  async getDatasetMetadata(id) {
    const dataset = await this.getDatasetById(id);
    return {
      dataset_id: dataset.dataset_id,
      title: dataset.title,
      description: dataset.description,
      source: dataset.source,
      creator: dataset.creator,
      station_id: dataset.station_id,
      region: dataset.region,
      discipline: dataset.discipline,
      parameters: dataset.parameters,
      temporal_coverage: dataset.temporal_coverage,
      spatial_coverage: dataset.spatial_coverage,
      file_format: dataset.file_format,
      size_mb: dataset.size_mb,
      access_level: dataset.access_level,
      license: dataset.license,
      citation_text: dataset.citation_text
    };
  }

  async getRelatedDatasets(id) {
    const dataset = await this.getDatasetById(id);
    return datasetRepository.find({
      dataset_id: { $ne: dataset.dataset_id },
      $or: [
        { discipline: dataset.discipline },
        { station_id: dataset.station_id },
        { region: dataset.region }
      ]
    }, { limit: 5 });
  }

  async searchDatasets(q) {
    return datasetRepository.search(q);
  }

  async submitDataset(data, userId) {
    if (!data.title || !data.discipline) {
      throw { statusCode: 400, message: 'Dataset title and scientific discipline are required.' };
    }
    const autoId = `DS-SUB-${Date.now().toString().slice(-6)}`;
    const newDoc = {
      dataset_id: data.dataset_id || autoId,
      title: data.title,
      description: data.description || '',
      source: data.source || 'Submitted by Researcher',
      creator: data.creator || 'Verified Contributor',
      station_id: data.station_id || 'unspecified',
      region: data.region || 'Polar',
      discipline: data.discipline,
      parameters: data.parameters || [],
      temporal_coverage: data.temporal_coverage || 'N/A',
      spatial_coverage: data.spatial_coverage || 'N/A',
      file_format: data.file_format || 'CSV',
      access_level: 'Under Review',
      license: data.license || 'CC BY 4.0',
      submitted_by: userId,
      submission_status: 'PendingReview'
    };

    return datasetRepository.insertOne(newDoc);
  }
}

module.exports = new DatasetService();
