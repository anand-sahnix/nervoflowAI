import path from "path";
import fs from "fs";
import multer from "multer";
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { allowedMimeTypes } from "../services/documentService.js";
import { getDocument, listDocuments, removeDocument, reprocessDocument, uploadDocument } from "../controllers/documentController.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", req.user.id, req.params.workspaceId);
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype) && !file.originalname.toLowerCase().endsWith(".md")) {
      cb(httpError(400, "Unsupported file type"));
      return;
    }
    cb(null, true);
  }
});

export const documentRoutes = Router();

documentRoutes.get("/workspaces/:workspaceId/documents", asyncHandler(listDocuments));
documentRoutes.post("/workspaces/:workspaceId/documents/upload", upload.single("file"), asyncHandler(uploadDocument));
documentRoutes.get("/documents/:id", asyncHandler(getDocument));
documentRoutes.post("/documents/:id/reprocess", asyncHandler(reprocessDocument));
documentRoutes.delete("/documents/:id", asyncHandler(removeDocument));
