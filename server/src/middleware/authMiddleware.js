import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { httpError } from "../utils/httpError.js";
import { repository } from "../data/repository.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) throw httpError(401, "Invalid token");

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await repository.getById("users", payload.sub);
    if (!user) throw httpError(401, "Invalid token");

    req.user = { id: user.id, name: user.name, email: user.email };
    next();
  } catch (error) {
    next(httpError(401, "Invalid token"));
  }
}
