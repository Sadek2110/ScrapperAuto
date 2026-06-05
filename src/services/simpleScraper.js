import * as cheerio from "cheerio";
import { extractMetadata } from "../utils/extractMetadata.js";
import { extractContact } from "../utils/extractContact.js";
import { extractMedia } from "./mediaExtractor.js";

export async function simpleScraper(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "es-ES,es;q=0.9,en;q=0.8"
    },
    signal: AbortSignal.timeout(30000)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} al descargar la web`);
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) {
    throw new Error(`La URL no parece HTML. Content-Type: ${contentType}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const metadata = extractMetadata($, url);
  const contact = extractContact($.text());
  const media = extractMedia($, url);
  const text = extractVisibleText($);

  return {
    url,
    domain: new URL(url).hostname.replace(/^www\./, ""),
    title: metadata.title,
    description: metadata.description,
    h1: metadata.h1,
    h2: metadata.h2,
    textForAI: limitText(text),
    html,
    contact,
    media,
    links: metadata.links
  };
}

function extractVisibleText($) {
  $("script, style, noscript, svg").remove();

  return $("body")
    .text()
    .replace(/\s+/g, " ")
    .trim();
}

function limitText(text) {
  const max = Number(process.env.MAX_TEXT_LENGTH || 30000);
  return String(text || "").slice(0, max);
}
