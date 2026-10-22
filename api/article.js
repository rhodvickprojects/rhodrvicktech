// RHODVICK TECH — full article extractor (Vercel serverless function)
// GET /api/article?url=https://techcrunch.com/...
// Fetches the publisher's page, extracts the readable article, returns JSON.

const { parseHTML } = require("linkedom");
const { Readability } = require("@mozilla/readability");

// Only these publishers can be fetched (prevents abuse / SSRF).
const ALLOWED_DOMAINS = [
  "techcrunch.com",
  "theverge.com",
  "arstechnica.com",
  "engadget.com",
  "wired.com",
  "nasa.gov",
  "coindesk.com",
  "bleepingcomputer.com"
];

const MAX_HTML_BYTES = 4 * 1024 * 1024;
const MAX_REDIRECTS = 4;

function isAllowed(value) {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") return false;

    const host = url.hostname.toLowerCase();

    return ALLOWED_DOMAINS.some(
      domain => host === domain || host.endsWith("." + domain)
    );
  } catch (error) {
    return false;
  }
}

// Follows redirects manually so every hop is checked against the allow-list.
async function fetchPage(startUrl) {
  let current = startUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!isAllowed(current)) throw new Error("Blocked redirect target");

    const response = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RhodvickTechReader/1.0; +https://rhodvicktech.vercel.app)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en"
      }
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Redirect without location");
      current = new URL(location, current).href;
      continue;
    }

    if (!response.ok) throw new Error(`Publisher returned ${response.status}`);

    const type = response.headers.get("content-type") || "";
    if (!type.includes("text/html")) throw new Error("Not an HTML page");

    const html = await response.text();
    if (html.length > MAX_HTML_BYTES) throw new Error("Page too large");

    return { html, finalUrl: current };
  }

  throw new Error("Too many redirects");
}

function toAbsolute(value, base) {
  try {
    return new URL(value, base).href;
  } catch (error) {
    return "";
  }
}

module.exports = async function handler(req, res) {
  const target = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;

  if (!target || !isAllowed(target)) {
    return res.status(400).json({ error: "Invalid or unsupported URL" });
  }

  try {
    const { html, finalUrl } = await fetchPage(target);

    const { document } = parseHTML(html);
    const parsed = new Readability(document).parse();

    if (!parsed || !parsed.content) {
      return res.status(422).json({ error: "Could not extract the article" });
    }

    // Clean up the extracted HTML and make links/images absolute
    const { document: out } = parseHTML(
      `<html><body>${parsed.content}</body></html>`
    );

    out
      .querySelectorAll("script,style,iframe,form,source,noscript")
      .forEach(el => el.remove());

    out.querySelectorAll("a[href]").forEach(link => {
      link.setAttribute("href", toAbsolute(link.getAttribute("href"), finalUrl));
    });

    out.querySelectorAll("img").forEach(img => {
      const src =
        img.getAttribute("src") || img.getAttribute("data-src") || "";

      img.setAttribute("src", toAbsolute(src, finalUrl));

      ["srcset", "data-src", "data-srcset", "sizes"].forEach(name =>
        img.removeAttribute(name)
      );
    });

    // Cache at Vercel's edge for an hour so repeat reads are instant
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );

    return res.status(200).json({
      title: parsed.title || "",
      byline: parsed.byline || "",
      content: out.body.innerHTML,
      length: parsed.length || 0
    });
  } catch (error) {
    console.error("article api error:", error && error.message);
    return res.status(502).json({ error: "Could not load the article" });
  }
};
