import path from 'node:path'
import fs from 'node:fs/promises'

/**
 * ModelTools
 * ----------
 * Lightweight JSON-file data access layer.
 * Provides CRUD operations with predictable return shapes.
 *
 * Data format:
 * {
 *   "entityName": [{ _id: 1, ... }]
 * }
 */
class ModelTools {

  //==================================================
  //  PUBLIC METHODS
  //==================================================

  /**
   * Fetch all documents for an entity
   * @param {string} filePath
   * @returns {Promise<Object>}
   */
  async findAll(filePath) {
    this._validatePath(filePath)
    const entity = this._extractEntityFromPath(filePath)

    try {
      await this._createDirIfNotExists(filePath)
      const data = await fs.readFile(filePath, 'utf-8')
      return this._parse(data)
    } catch (error) {
      if (error.code === 'ENOENT') {
        const empty = { [entity]: [] }
        await fs.writeFile(filePath, this._serialize(empty))
        return empty
      }
      throw error
    }
  }

  /**
   * Fetch a single document by ID
   */
  async findOne(filePath, _id) {
    this._validatePath(filePath)
    this._validateID(_id)

    const entity = this._extractEntityFromPath(filePath)
    const raw = await this.findAll(filePath)

    const found = raw[entity].find(ex => ex._id === Number(_id))
    return { [entity]: found ? [found] : [] }
  }

  /**
   * Create new documents
   */
  async create(filePath, data) {
    this._validatePath(filePath)
    this._validateData(data)

    const entity = this._extractEntityFromPath(filePath)
    const raw = await this.findAll(filePath)
    const existing = raw[entity]

    // Safe next ID calculation
    let nextId =
      existing.length === 0
        ? 1
        : Math.max(...existing.map(ex => ex._id)) + 1

    const created = []

    for (const item of data) {
      const saved = {
        _id: nextId++,
        ...item
      }
      existing.push(saved)
      created.push(saved)
    }

    await fs.writeFile(filePath, this._serialize(raw))
    return { [entity]: created }
  }

  /**
   * Update a document by ID
   */
  async update(filePath, data, _id) {
    this._validatePath(filePath)
    this._validateID(_id)
    this._validateData(data)

    const entity = this._extractEntityFromPath(filePath)
    const raw = await this.findAll(filePath)
    const existing = raw[entity]

    const index = existing.findIndex(ex => ex._id === Number(_id))
    if (index === -1) {
      return { [entity]: [] }
    }

    // Only first update object is applied
    const { _id: ignored, ...safeUpdates } = data[0]

    existing[index] = {
      ...existing[index],
      ...safeUpdates
    }

    await fs.writeFile(filePath, this._serialize(raw))
    return { [entity]: [existing[index]] }
  }

  /**
   * Delete a document by ID
   */
  async delete(filePath, _id) {
    this._validatePath(filePath)
    this._validateID(_id)

    const entity = this._extractEntityFromPath(filePath)
    const raw = await this.findAll(filePath)
    const existing = raw[entity]

    const index = existing.findIndex(ex => ex._id === Number(_id))
    if (index === -1) {
      return { [entity]: [] }
    }

    const [deleted] = existing.splice(index, 1)

    await fs.writeFile(filePath, this._serialize(raw))
    return { [entity]: [deleted] }
  }

  //==================================================
  //  PRIVATE METHODS
  //==================================================

  /**
   * Ensure directory exists for filePath
   */
    async _createDirIfNotExists(filePath) {
        const dir = path.dirname(filePath)
        try {
            await fs.access(dir)
        } catch {
            await fs.mkdir(dir, { recursive: true })
        }
    }

  /**
   * Extract entity name from file path
   */
  _extractEntityFromPath(filePath) {
    return path.parse(filePath).name
  }

  /**
   * Validate file path
   */
  _validatePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('filePath is required and must be a string')
    }
  }

  /**
   * Validate numeric ID
   */
  _validateID(_id) {
    const id = Number(_id)
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Valid numeric _id is required')
    }
  }

  /**
   * Validate data payload
   */
  _validateData(data) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid data shape. Expected non-empty array')
    }
  }

  /**
   * Serialize data safely
   */
  _serialize(data) {
    return JSON.stringify(data, null, 2)
  }

    _parse(data) {
        return JSON.parse(data)
    }

    _isSerialized(data) {
        return typeof data === 'string'
    }
}

export const modelTools = new ModelTools()
