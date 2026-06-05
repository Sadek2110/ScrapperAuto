import { toAbsoluteUrl } from "../utils/normalizeUrl.js";

export function extractMedia($, baseUrl) {
  const images = $("img")
    .map((_, el) => {
      const src =
        $(el).attr("src") ||
        $(el).attr("data-src") ||
        $(el).attr("data-lazy-src") ||
        "";

      return {
        src: toAbsoluteUrl(src, baseUrl),
        alt: clean($(el).attr("alt")),
        width: Number($(el).attr("width") || 0),
        height: Number($(el).attr("height") || 0)
      };
    })
    .get()
    .filter(img => img.src && !img.src.startsWith("data:"));

  const ogImage = toAbsoluteUrl(
    $('meta[property="og:image"]').attr("content"),
    baseUrl
  );

  const favicons = $('link[rel*="icon"]')
    .map((_, el) => ({
      src: toAbsoluteUrl($(el).attr("href"), baseUrl),
      rel: $(el).attr("rel") || ""
    }))
    .get()
    .filter(icon => icon.src);

  const videos = $("video[src], video source[src], source[src]")
    .map((_, el) => ({
      src: toAbsoluteUrl($(el).attr("src"), baseUrl),
      type: $(el).attr("type") || ""
    }))
    .get()
    .filter(video => video.src && !video.src.startsWith("blob:"));

  const logo =
    findLogoCandidate(images) ||
    (ogImage ? { src: ogImage, alt: "Open Graph image" } : null) ||
    favicons[0] ||
    null;

  return {
    logo,
    images: limitImages(uniqueObjectsBy(images, "src")),
    videos: limitVideos(uniqueObjectsBy(videos, "src")),
    favicons,
    ogImage
  };
}

function findLogoCandidate(images) {
  return images.find(img => {
    const value = `${img.src} ${img.alt}`.toLowerCase();
    return value.includes("logo");
  });
}

function limitImages(images) {
  const max = Number(process.env.MAX_IMAGES || 30);
  return images.slice(0, max);
}

function limitVideos(videos) {
  const max = Number(process.env.MAX_VIDEOS || 5);
  return videos.slice(0, max);
}

function clean(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
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
