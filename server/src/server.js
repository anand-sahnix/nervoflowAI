import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { initializeRepository } from "./data/repository.js";

await initializeRepository();

const app = createApp();

app.listen(env.port, () => {
  console.log(`NeuroFlow API running on http://localhost:${env.port}`);
});
