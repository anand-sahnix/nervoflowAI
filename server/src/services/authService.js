import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { repository } from "../data/repository.js";
import { httpError } from "../utils/httpError.js";

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function signToken(user) {
  return jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export async function registerUser({ name, email, password }) {
  if (!name || !email || !password) throw httpError(400, "Name, email, and password are required");
  if (password.length < 6) throw httpError(400, "Password must be at least 6 characters");

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await repository.getOne("users", { email: normalizedEmail });
  if (existing) throw httpError(409, "Email already registered");

  const user = await repository.create("users", {
    name: name.trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 10)
  });

  return { user: publicUser(user), token: signToken(user) };
}

export async function loginUser({ email, password }) {
  const user = await repository.getOne("users", { email: String(email || "").toLowerCase().trim() });
  if (!user) throw httpError(401, "Invalid email or password");

  const isValid = await bcrypt.compare(password || "", user.password);
  if (!isValid) throw httpError(401, "Invalid email or password");

  return { user: publicUser(user), token: signToken(user) };
}
