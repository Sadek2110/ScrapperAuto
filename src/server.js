import Fastify from "fastify";
import dotenv from "dotenv";
import { scrapeRoutes } from "./routes/scrape.routes.js";

dotenv.config();

const app = Fastify({
  logger: true
});

app.get("/health", async () => {
  return {
    ok: true,
    service: "scraper-api",
    timestamp: new Date().toISOString()
  };
});

app.register(scrapeRoutes);

const PORT = Number(process.env.PORT || 3000);

try {
  await app.listen({
    port: PORT,
    host: "0.0.0.0"
  });

  console.log(`Scraper API funcionando en puerto ${PORT}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
