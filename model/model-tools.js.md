import path from 'node:path'
import fs from 'node:fs/promises'

class ModelTools {

    async findAll(filePath) {
        try {
            this._createDirIfNotExists(filePath)
            const data = await fs.readFile(filePath, 'utf-8')
            return JSON.parse(data)
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(filePath, this._serialize(
                    { [this._extractEntityFromPath(filePath)]: [] }
                ))
            }
            throw error 
        }
    }

    async findOne(filePath, _id) {
        this._validateID(_id)
        this._validatePath(filePath)
        const entity = this._extractEntityFromPath(filePath)
        try {
            const raw = await this.findAll(filePath)
            const existing = raw[entity]
            const index = existing.findIndex(ex => ex._id === Number(_id))
            if (index === -1) {
                return { [entity]: [] }
            }
            return { [entity]: [existing[index]] }
        } catch(error) {
            throw error
        }
    }

    async create(filePath, data) {
        this._validateData(data)
        this._validatePath(filePath)
        const entity = this._extractEntityFromPath(filePath)
        try {
            const raw = await this.findAll(filePath)
            const existing = raw[entity]
            const isFirstDoc = existing.length === 0

            let docId = Math.max(...existing.map(ex => ex._id))
            const createdDoc = []
            for (const item of data) {
                docId += 1
                const saved = {
                    _id: isFirstDoc ? 1 : docId,
                    ...item
                }
             existing.push(saved)
             createdDoc.push(saved)
            }

            this._createDirIfNotExists(filePath)
            await fs.writeFile(filePath, this._serialize(raw))
            return { [entity]: createdDoc }
        } catch(error) {
            throw error
        }
    }

    async update(filePath, data, _id) {
        this._validatePath(filePath)
        this._validateID(_id)
        this._validateData(data)

        const entity = this._extractEntityFromPath(filePath)

        try {
            const raw = await this.findAll(filePath)
            const existing = raw[entity]

            const index = existing.findIndex(ex => ex._id === Number(_id))
            if (index === -1) {
                return { [entity]: [] }
            }          

            for (const item of data) {
                  //remove _id in update for data integrity
                const { _id: ignored, ...safeUpdates } = item
                console.log('safe data', safeUpdates)
                const save = { ...existing[index], ...safeUpdates }
                existing[index] = save
            }
            
            await this._createDirIfNotExists(filePath)
            await fs.writeFile(filePath, this._serialize(raw))
            return { [entity]: [existing[index]] }
        } catch(error) {
            throw error
        }
    }

    async delete(filePath, _id) {
        this._validatePath(filePath)
        this._validateID(_id)
        const entity = this._extractEntityFromPath(filePath)
        try {
            const raw = await this.findAll(filePath)
            const existing = raw[entity]
            if (!existing.length) {
                return { [entity]: [] }
            }
            const index = existing.findIndex(ex => ex._id === Number(_id))
            if (index === -1) {
                return { [entity]: [] }
            }
            const savedForReturn = existing[index]
            const freshData = existing.filter(ex => ex._id !== Number(_id))
            await fs.writeFile(filePath, this._serialize({ [entity]: freshData }))
            return { [entity]: [savedForReturn] }
        } catch (error) {
            throw error
        }
    }
    //==================================================================
    //  PRIVATE METHODS
    //====================================================================
    async _createDirIfNotExists(filePath) {
        const dir = path.dirname(filePath)
        try {
            await fs.access(dir)
        } catch {
            await fs.mkdir(filePath, { recursive: true })
        }
    }

    _extractEntityFromPath(filePath) {
        return path.parse(filePath).name || path.basename(filePath, '.json')
    }

    _validatePath(filePath) {
        if (!filePath) {
            throw new Error('filePath is required')
        }
    }

    _validateID(_id) {
        if (!_id) {
            throw new Error('_id is required')
        }
    }

    _validateData(data) {
          if (!data || !Array.isArray(data)) {
            throw new Error('Invalid data shape. Expected Array of object')
        }
    }

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