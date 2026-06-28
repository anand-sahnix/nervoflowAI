import crypto from "crypto";

const collections = [
  "users",
  "workspaces",
  "documents",
  "document_chunks",
  "chat_threads",
  "chat_messages",
  "workflow_runs"
];

function matches(record, filter = {}) {
  return Object.entries(filter).every(([key, value]) => {
    if (Array.isArray(value)) return value.includes(record[key]);
    return record[key] === value;
  });
}

function sortRecords(records, sort = {}) {
  const entries = Object.entries(sort);
  if (!entries.length) return records;
  return [...records].sort((a, b) => {
    for (const [key, direction] of entries) {
      if (a[key] === b[key]) continue;
      return a[key] > b[key] ? direction : -direction;
    }
    return 0;
  });
}

export function createMemoryRepository() {
  const db = Object.fromEntries(collections.map((name) => [name, []]));

  return {
    mode: "memory",
    async getAll(collection, filter = {}, sort = {}) {
      return sortRecords(db[collection].filter((record) => matches(record, filter)), sort);
    },
    async getById(collection, id) {
      return db[collection].find((record) => record.id === id) || null;
    },
    async getOne(collection, filter = {}) {
      return db[collection].find((record) => matches(record, filter)) || null;
    },
    async create(collection, data) {
      const now = new Date().toISOString();
      const record = { id: crypto.randomUUID(), ...data, createdAt: now, updatedAt: now };
      db[collection].push(record);
      return record;
    },
    async updateById(collection, id, updates) {
      const index = db[collection].findIndex((record) => record.id === id);
      if (index === -1) return null;
      db[collection][index] = { ...db[collection][index], ...updates, updatedAt: new Date().toISOString() };
      return db[collection][index];
    },
    async upsert(collection, filter, createData, updateData) {
      const existing = await this.getOne(collection, filter);
      if (existing) return this.updateById(collection, existing.id, updateData);
      return this.create(collection, { ...filter, ...createData });
    },
    async deleteById(collection, id) {
      const before = db[collection].length;
      db[collection] = db[collection].filter((record) => record.id !== id);
      return before !== db[collection].length;
    },
    async deleteWhere(collection, filter = {}) {
      const before = db[collection].length;
      db[collection] = db[collection].filter((record) => !matches(record, filter));
      return before - db[collection].length;
    },
    async count(collection, filter = {}) {
      return db[collection].filter((record) => matches(record, filter)).length;
    }
  };
}
