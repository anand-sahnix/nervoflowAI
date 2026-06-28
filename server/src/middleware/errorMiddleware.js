export function notFound(req, res) {
  res.status(404).json({ message: "Route not found" });
}

export function errorMiddleware(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ message });
}
