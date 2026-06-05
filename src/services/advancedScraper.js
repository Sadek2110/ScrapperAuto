import { chromium } from "playwright";

export async function advancedScraper(url) {
  let browser;

  try {
    browser = await chromium.launch({
      headless: true
    });

    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      viewport: {
        width: 1366,
        height: 768
      }
    });

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 45000
    });

    await page.waitForTimeout(1500);

    const data = await page.evaluate(() => {
      const clean = value =>
        String(value || "")
          .replace(/\s+/g, " ")
          .trim();

      const getMeta = selector => {
        const el = document.querySelector(selector);
        return el ? el.getAttribute("content") || "" : "";
      };

      const links = Array.from(document.querySelectorAll("a[href]"))
        .map(a => ({
          text: clean(a.innerText),
          href: a.href
        }))
        .filter(link => link.href);

      const images = Array.from(document.querySelectorAll("img"))
        .map(img => ({
          src:
            img.currentSrc ||
            img.src ||
            img.getAttribute("data-src") ||
            img.getAttribute("data-lazy-src") ||
            "",
          alt: clean(img.alt),
          width: img.naturalWidth || 0,
          height: img.naturalHeight || 0
        }))
        .filter(img => img.src);

      const videos = Array.from(
        document.querySelectorAll("video[src], video source[src], source[src]")
      )
        .map(video => ({
          src: video.src,
          type: video.getAttribute("type") || ""
        }))
        .filter(video => video.src);

      const logoCandidates = images.filter(img => {
        const value = `${img.src} ${img.alt}`.toLowerCase();
        return value.includes("logo");
      });

      const bodyText = clean(document.body.innerText || "");

      const emails = Array.from(
        bodyText.matchAll(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/gi)
      ).map(match => match[0]);

      const phones = Array.from(
        bodyText.matchAll(/(\+34[\s-]?)?(\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{3})/g)
      ).map(match => match[0]);

      return {
        title: document.title || "",
        description:
          getMeta('meta[name="description"]') ||
          getMeta('meta[property="og:description"]'),
        ogImage: getMeta('meta[property="og:image"]'),
        h1: Array.from(document.querySelectorAll("h1")).map(h =>
          clean(h.innerText)
        ),
        h2: Array.from(document.querySelectorAll("h2")).map(h =>
          clean(h.innerText)
        ),
        textForAI: bodyText,
        html: document.documentElement.outerHTML,
        contact: {
          emails: [...new Set(emails)],
          phones: [...new Set(phones)]
        },
        media: {
          logo: logoCandidates[0] || null,
          images,
          videos
        },
        links
      };
    });

    return {
      url,
      domain: new URL(url).hostname.replace(/^www\./, ""),
      ...data,
      textForAI: limitText(data.textForAI)
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function limitText(text) {
  const max = Number(process.env.MAX_TEXT_LENGTH || 30000);
  return String(text || "").slice(0, max);
}
