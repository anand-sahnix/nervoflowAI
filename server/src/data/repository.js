import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { createMemoryRepository } from "./memoryRepository.js";
import { createMongoRepository } from "./mongoRepository.js";

export let repository = createMemoryRepository();

export async function initializeRepository() {
  if (env.mongoUri) {
    try {
      await mongoose.connect(env.mongoUri);
      repository = createMongoRepository();
      console.log("Repository mode: mongo");
    } catch (error) {
      console.warn("MongoDB unavailable, using memory repository:", error.message);
      repository = createMemoryRepository();
    }
  } else {
    console.log("Repository mode: memory");
  }

  if (env.seedSampleData) await seedDemoData();
  return repository;
}

async function seedDemoData() {
  const existing = await repository.getOne("users", { email: "demo@neuroflow.ai" });
  if (existing) return;

  const user = await repository.create("users", {
    name: "Demo User",
    email: "demo@neuroflow.ai",
    password: await bcrypt.hash("Password@123", 10)
  });

  const workspace = await repository.create("workspaces", {
    userId: user.id,
    name: "Demo Workspace",
    description: "A sample workspace ready for local document intelligence.",
    color: "#0f766e"
  });

  const document = await repository.create("documents", {
    userId: user.id,
    workspaceId: workspace.id,
    originalName: "demo-notes.txt",
    storedName: "demo-notes.txt",
    mimeType: "text/plain",
    size: 380,
    fileType: "txt",
    status: "ready",
    extractedText: "NeuroFlow AI turns uploaded documents into searchable chunks. The workspace stores citations, run history, and agent traces. Action items should identify owners and priorities when the text provides them.",
    summary: "Demo notes about NeuroFlow AI capabilities.",
    metadata: { seeded: true }
  });

  await repository.create("document_chunks", {
    userId: user.id,
    workspaceId: workspace.id,
    documentId: document.id,
    chunkIndex: 0,
    text: document.extractedText,
    tokenCountApprox: 30,
    embedding: [],
    metadata: { documentName: document.originalName }
  });
}
