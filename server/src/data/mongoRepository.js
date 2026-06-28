import { User } from "../models/User.js";
import { Workspace } from "../models/Workspace.js";
import { Document } from "../models/Document.js";
import { DocumentChunk } from "../models/DocumentChunk.js";
import { ChatThread } from "../models/ChatThread.js";
import { ChatMessage } from "../models/ChatMessage.js";
import { WorkflowRun } from "../models/WorkflowRun.js";

const models = {
  users: User,
  workspaces: Workspace,
  documents: Document,
  document_chunks: DocumentChunk,
  chat_threads: ChatThread,
  chat_messages: ChatMessage,
  workflow_runs: WorkflowRun
};

function normalize(record) {
  if (!record) return null;
  const json = record.toJSON ? record.toJSON() : record;
  delete json._id;
  return json;
}

export function createMongoRepository() {
  return {
    mode: "mongo",
    async getAll(collection, filter = {}, sort = {}) {
      const docs = await models[collection].find(filter).sort(sort).lean({ virtuals: true });
      return docs.map((doc) => ({ ...doc, id: doc._id?.toString?.() || doc.id }));
    },
    async getById(collection, id) {
      return normalize(await models[collection].findById(id));
    },
    async getOne(collection, filter = {}) {
      return normalize(await models[collection].findOne(filter));
    },
    async create(collection, data) {
      return normalize(await models[collection].create(data));
    },
    async updateById(collection, id, updates) {
      return normalize(await models[collection].findByIdAndUpdate(id, updates, { new: true }));
    },
    async upsert(collection, filter, createData, updateData) {
      return normalize(
        await models[collection].findOneAndUpdate(filter, { $set: updateData, $setOnInsert: createData }, { new: true, upsert: true })
      );
    },
    async deleteById(collection, id) {
      const result = await models[collection].findByIdAndDelete(id);
      return Boolean(result);
    },
    async deleteWhere(collection, filter = {}) {
      const result = await models[collection].deleteMany(filter);
      return result.deletedCount || 0;
    },
    async count(collection, filter = {}) {
      return models[collection].countDocuments(filter);
    }
  };
}
