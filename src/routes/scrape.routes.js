import { z } from "zod";
import { validatePublicUrl } from "../utils/validateUrl.js";
import { simpleScraper } from "../services/simpleScraper.js";
import { advancedScraper } from "../services/advancedScraper.js";
import { detectPageType } from "../utils/detectPageType.js";
import { generatePrompts } from "../services/promptGenerator.js";

const ScrapeBodySchema = z.object({
  url: z.string().url(),
  downloadMedia: z.boolean().optional().default(false),
  generatePrompts: z.boolean().optional().default(true)
});

function checkApiKey(request, reply) {
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    return;
  }

  const receivedKey = request.headers["x-api-key"];

  if (receivedKey !== expectedKey) {
    reply.code(401);
    throw new Error("API key no válida");
  }
}

export async function scrapeRoutes(app) {
  app.post("/scrape", async (request, reply) => {
    checkApiKey(request, reply);

    const parsedBody = ScrapeBodySchema.safeParse(request.body);

    if (!parsedBody.success) {
      reply.code(400);
      return {
        ok: false,
        error: "Body no válido",
        details: parsedBody.error.flatten()
      };
    }

    const { url, generatePrompts: shouldGeneratePrompts } = parsedBody.data;

    const urlValidation = validatePublicUrl(url);

    if (!urlValidation.ok) {
      reply.code(400);
      return {
        ok: false,
        error: urlValidation.error
      };
    }

    try {
      const simpleResult = await simpleScraper(urlValidation.url);
      const detection = detectPageType(simpleResult.html);

      let scrapeResult = {
        ...simpleResult,
        mode: "simple",
        detection
      };

      if (detection.isAdvanced) {
        scrapeResult = {
          ...(await advancedScraper(urlValidation.url)),
          mode: "advanced",
          detection
        };
      }

      const prompts = shouldGeneratePrompts
        ? generatePrompts(scrapeResult)
        : {};

      return {
        ok: true,
        jobId: createJobId(scrapeResult.domain),
        scrapedAt: new Date().toISOString(),
        result: scrapeResult,
        prompts
      };
    } catch (error) {
      request.log.error(error);

      reply.code(500);

      return {
        ok: false,
        error: "Error durante el scraping",
        details: error.message
      };
    }
  });
}

function createJobId(domain) {
  const safeDomain = String(domain || "unknown")
    .replace(/^www\./, "")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

  const date = new Date().toISOString().slice(0, 10);

  return `${date}_${safeDomain}`;
}
