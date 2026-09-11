const { getDb } = require('../Configuration/database');
const BaseRepository = require('./BaseRepository');

class KnowledgeRepository extends BaseRepository {
  constructor() {
    super('knowledge_nodes');
  }

  get edgesCollection() {
    return getDb().collection('knowledge_edges');
  }

  async getAllNodes(filter = {}) {
    return this.collection.find(filter).toArray();
  }

  async getAllEdges(filter = {}) {
    return this.edgesCollection.find(filter).toArray();
  }

  async findNodeById(nodeId) {
    return this.collection.findOne({
      $or: [
        { id: nodeId },
        { node_id: nodeId },
        { entity_id: nodeId }
      ]
    });
  }

  async findAdjacentEdges(nodeId) {
    return this.edgesCollection.find({
      $or: [
        { source: nodeId },
        { target: nodeId },
        { source_id: nodeId },
        { target_id: nodeId }
      ]
    }).toArray();
  }

  async insertEdge(edge) {
    const now = new Date().toISOString();
    return this.edgesCollection.insertOne({
      ...edge,
      created_at: now
    });
  }
}

module.exports = new KnowledgeRepository();
