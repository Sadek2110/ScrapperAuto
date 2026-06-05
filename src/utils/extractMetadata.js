import { toAbsoluteUrl } from "./normalizeUrl.js";

export function extractMetadata($, baseUrl) {
  const title = clean($("title").first().text());

  const description =
    clean($('meta[name="description"]').attr("content")) ||
    clean($('meta[property="og:description"]').attr("content"));

  const h1 = $("h1")
    .map((_, el) => clean($(el).text()))
    .get()
    .filter(Boolean);

  const h2 = $("h2")
    .map((_, el) => clean($(el).text()))
    .get()
    .filter(Boolean);

  const links = $("a[href]")
    .map((_, el) => ({
      text: clean($(el).text()),
      href: toAbsoluteUrl($(el).attr("href"), baseUrl)
    }))
    .get()
    .filter(link => link.href);

  return {
    title,
    description,
    h1: unique(h1),
    h2: unique(h2),
    links: uniqueObjectsBy(links, "href")
  };
}

function clean(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(arr) {
  return [...new Set(arr)];
}

function uniqueObjectsBy(arr, key) {
  const map = new Map();

  for (const item of arr) {
    if (item[key] && !map.has(item[key])) {
      map.set(item[key], item);
    }
  }

  return [...map.values()];
}
