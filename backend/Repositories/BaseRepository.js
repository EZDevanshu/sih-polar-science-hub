const { ObjectId } = require('mongodb');
const { getDb } = require('../Configuration/database');

class BaseRepository {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  get collection() {
    return getDb().collection(this.collectionName);
  }

  toObjectId(id) {
    if (!id) return null;
    if (typeof id === 'string' && ObjectId.isValid(id) && id.length === 24) {
      return new ObjectId(id);
    }
    return id;
  }

  async find(filter = {}, options = {}) {
    let query = this.collection.find(filter);
    if (options.sort) query = query.sort(options.sort);
    if (options.skip) query = query.skip(options.skip);
    if (options.limit) query = query.limit(options.limit);
    if (options.projection) query = query.project(options.projection);
    return query.toArray();
  }

  async findOne(filter, projection = null) {
    const options = projection ? { projection } : {};
    return this.collection.findOne(filter, options);
  }

  async findById(id, projection = null) {
    const objId = this.toObjectId(id);
    const filter = {
      $or: [
        { _id: objId },
        { id: id },
        { document_id: id },
        { station_id: id },
        { researcher_id: id },
        { project_code: id },
        { publication_id: id },
        { dataset_id: id },
        { facility_id: id }
      ]
    };
    return this.findOne(filter, projection);
  }

  async count(filter = {}) {
    return this.collection.countDocuments(filter);
  }

  async insertOne(doc) {
    const now = new Date().toISOString();
    const docToInsert = {
      ...doc,
      created_at: doc.created_at || now,
      updated_at: now
    };
    const result = await this.collection.insertOne(docToInsert);
    return { ...docToInsert, _id: result.insertedId };
  }

  async insertMany(docs) {
    const now = new Date().toISOString();
    const docsToInsert = docs.map(d => ({
      ...d,
      created_at: d.created_at || now,
      updated_at: now
    }));
    return this.collection.insertMany(docsToInsert);
  }

  async updateOne(filter, updateData) {
    const update = {
      $set: {
        ...updateData,
        updated_at: new Date().toISOString()
      }
    };
    return this.collection.updateOne(filter, update);
  }

  async deleteOne(filter) {
    return this.collection.deleteOne(filter);
  }

  async distinct(field, filter = {}) {
    return this.collection.distinct(field, filter);
  }
}

module.exports = BaseRepository;
