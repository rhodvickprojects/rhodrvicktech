
/* =========================================================
   RHODVICK TECH — LIVE TECHNOLOGY NEWS
   RSS-powered news + internal article pages
   Brand colors: Red & Blue
========================================================= */

const RSS_FEEDS = [
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/"
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml"
  },
  {
    name: "Ars Technica",
    url: "https://feeds.arstechnica.com/arstechnica/index"
  },
  {
    name: "Engadget",
    url: "https://www.engadget.com/rss.xml"
  },
  {
    name: "WIRED",
    url: "https://www.wired.com/feed/rss"
  },
  {
    name: "NASA",
    url: "https://www.nasa.gov/feed/"
  },
  {
    name: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/"
  },
  {
    name: "BleepingComputer",
    url: "https://www.bleepingcomputer.com/feed/"
  }
];

const RSS_API = "https://api.rss2json.com/v1/api.json?rss_url=";
const PAGE_SIZE = 12;
const REFRESH_INTERVAL = 10 * 60 * 1000;

let currentNews = [];
let filteredNews = [];
let visibleCount = PAGE_SIZE;
let isLoading = false;

/* =========================================================
   SAFE HELPERS
========================================================= */

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, character => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function cleanText(value = "") {
  const element = document.createElement("div");
  element.innerHTML = String(value);

  return (element.textContent || element.innerText || "")
    .replace(/\s+/g, " ")
    .trim();
}

function getElement(id) {
  return document.getElementById(id);
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function getCategory(title, description = "") {
  const text = `${title} ${description}`.toLowerCase();

  if (/artificial intelligence|\bai\b|chatgpt|openai|machine learning|llm/.test(text)) {
    return "AI";
  }

  if (/bitcoin|crypto|cryptocurrency|blockchain|coindesk/.test(text)) {
    return "Crypto";
  }

  if (/hack|cybersecurity|malware|ransomware|data breach|scam/.test(text)) {
    return "Cybersecurity";
  }

  if (/phone|smartphone|iphone|android|samsung|pixel/.test(text)) {
    return "Mobile";
  }

  if (/nasa|space|satellite|astronomy|planet|rocket/.test(text)) {
    return "Science & Space";
  }

  if (/laptop|computer|processor|chip|gpu|hardware/.test(text)) {
    return "Hardware";
  }

  if (/app|software|windows|linux|google|microsoft|apple/.test(text)) {
    return "Software";
  }

  return "Technology";
}

function getImage(item) {
  if (item.thumbnail) return item.thumbnail;

  if (Array.isArray(item.enclosure) && item.enclosure[0]?.link) {
    return item.enclosure[0].link;
  }

  if (item.enclosure?.link) return item.enclosure.link;

  const html = item.description || item.content || "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);

  return match ? match[1] : "";
}

/* =========================================================
   NORMALIZE RSS ITEMS
========================================================= */

function normalizeArticle(item, feedName) {
  const url = item.link || item.guid || "";

  if (!url || !/^https?:\/\//i.test(url)) return null;

  const title = cleanText(item.title || "Technology News");
  const description = cleanText(
    item.description || item.content || item.contentSnippet || ""
  );

  return {
    id: url,
    title,
    description: description || "Open the original report for more details.",
    summary: description,
    source: feedName,
    author: item.author || feedName,
    date: item.pubDate || item.isoDate || "",
    url,
    image: getImage(item),
    category: getCategory(title, description)
  };
}

/* =========================================================
   FETCH ONE RSS FEED
========================================================= */

async function fetchFeed(feed) {
  const endpoint = RSS_API + encodeURIComponent(feed.url);

  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Could not load ${feed.name}`);
  }

  const result = await response.json();

  if (result.status !== "ok" || !Array.isArray(result.items)) {
    throw new Error(`Invalid RSS response from ${feed.name}`);
  }

  return result.items
    .map(item => normalizeArticle(item, feed.name))
    .filter(Boolean);
}

/* =========================================================
   LOAD ALL NEWS
========================================================= */

async function loadNews() {
  if (isLoading) return;

  isLoading = true;

  const loading = getElement("news-loading");
  const grid = getElement("news-grid");

  if (loading) loading.style.display = "block";

  if (grid && currentNews.length === 0) {
    grid.innerHTML = "";
  }

  try {
    const results = await Promise.allSettled(
      RSS_FEEDS.map(fetchFeed)
    );

    const successfulFeeds = results
      .filter(result => result.status === "fulfilled")
      .map(result => result.value);

    const articles = successfulFeeds.flat();

    if (articles.length === 0 && currentNews.length === 0) {
      throw new Error("No news feeds could be loaded.");
    }

    const uniqueArticles = new Map();

    [...articles, ...currentNews].forEach(article => {
      if (article && article.url && !uniqueArticles.has(article.url)) {
        uniqueArticles.set(article.url, article);
      }
    });

    currentNews = Array.from(uniqueArticles.values())
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime() || 0;
        const dateB = new Date(b.date).getTime() || 0;
        return dateB - dateA;
      });

    filteredNews = [...currentNews];
    visibleCount = PAGE_SIZE;

    renderNewsPage();
    renderSources();

  } catch (error) {
    console.error("RHODVICK TECH news error:", error);

    if (grid && currentNews.length === 0) {
      grid.innerHTML = `
        <div class="news-error"
             style="grid-column:1/-1;padding:24px;text-align:center;">
          <h3>Unable to load the news right now.</h3>
          <p>Please check your internet connection and try again.</p>
          <button id="retry-news"
                  style="background:#168bff;color:white;border:0;
                         padding:10px 18px;border-radius:6px;
                         cursor:pointer;">
            Try Again
          </button>
        </div>
      `;

      const retry = getElement("retry-news");
      if (retry) retry.addEventListener("click", loadNews);
    }

  } finally {
    isLoading = false;

    if (loading) loading.style.display = "none";
  }
}

/* =========================================================
   NEWS CARD
========================================================= */

function createNewsCard(item) {
  const title = escapeHTML(item.title);
  const source = escapeHTML(item.source);
  const category = escapeHTML(item.category);
  const date = escapeHTML(formatDate(item.date));
  const description = escapeHTML(item.description);
  const url = escapeHTML(item.url);

  const imageHTML = item.image
    ? `
      <img
        src="${escapeHTML(item.image)}"
        alt="${title}"
        loading="lazy"
        onerror="this.style.display='none'"
        style="width:100%;height:190px;object-fit:cover;
               display:block;background:#111724;"
      >
    `
    : `
      <div style="height:190px;display:flex;align-items:center;
                  justify-content:center;background:#111724;
                  color:#168bff;font-size:42px;font-weight:bold;">
        RT
      </div>
    `;

  return `
    <article class="news-card"
      style="background:#111724;border:1px solid #263246;
             border-radius:12px;overflow:hidden;
             display:flex;flex-direction:column;">

      ${imageHTML}

      <div style="padding:18px;display:flex;flex-direction:column;
                  flex:1;">

        <div style="display:flex;justify-content:space-between;
                    align-items:center;gap:8px;flex-wrap:wrap;
                    margin-bottom:12px;">

          <span style="color:#ff303b;font-size:12px;
                       font-weight:bold;text-transform:uppercase;">
            ${category}
          </span>

          <span style="color:#a5afc2;font-size:12px;">
            ${date}
          </span>
        </div>

        <h3 style="font-size:19px;line-height:1.45;margin:0 0 12px;
                   color:#f4f7ff;">
          ${title}
        </h3>

        <p style="color:#b8c2d4;font-size:14px;line-height:1.7;
                  margin:0 0 18px;flex:1;">
          ${description || "Read this technology news story on RHODVICK TECH."}
        </p>

        <div style="color:#a5afc2;font-size:12px;margin-bottom:15px;">
          Source: ${source}
        </div>

        <button
          type="button"
          data-article-url="${url}"
          class="read-more-btn"
          style="background:#168bff;color:white;padding:11px 15px;
                 border:0;border-radius:6px;cursor:pointer;
                 font-weight:bold;width:100%;">
          Read More →
        </button>
      </div>
    </article>
  `;
}

/* =========================================================
   RENDER NEWS + LOAD MORE
========================================================= */

function renderNewsPage() {
  const grid = getElement("news-grid");
  const loadMoreButton = getElement("load-more");

  if (!grid) {
    console.warn("The #news-grid element was not found in index.html.");
    return;
  }

  const articlesToShow = filteredNews.slice(0, visibleCount);

  if (articlesToShow.length === 0) {
    grid.innerHTML = `
      <p style="color:#a5afc2;padding:20px;">
        No articles available at the moment.
      </p>
    `;
  } else {
    grid.innerHTML = articlesToShow.map(createNewsCard).join("");
  }

  if (loadMoreButton) {
    const hasMore = visibleCount < filteredNews.length;

    loadMoreButton.style.display = hasMore ? "inline-block" : "none";

    if (!loadMoreButton.dataset.listenerAdded) {
      loadMoreButton.addEventListener("click", () => {
        visibleCount += PAGE_SIZE;
        renderNewsPage();
      });

      loadMoreButton.dataset.listenerAdded = "true";
    }
  }
}

/* =========================================================
   INTERNAL ARTICLE NAVIGATION
========================================================= */

document.addEventListener("click", function (event) {
  const button = event.target.closest("[data-article-url]");

  if (!button) return;

  const articleUrl = button.dataset.articleUrl;

  const article = currentNews.find(
    item => item.url === articleUrl
  );

  if (!article) {
    alert("Article not found. Please refresh the news and try again.");
    return;
  }

  const articleData = {
    title: article.title || "Technology News",
    source: article.source || article.author || "News Publisher",
    date: formatDate(article.date),
    description: article.description || article.summary || "",
    image: article.image || "",
    url: article.url
  };

  try {
    sessionStorage.setItem(
      "rhodvickCurrentArticle",
      JSON.stringify(articleData)
    );

    window.location.href = "article.html";
  } catch (error) {
    console.error("Unable to open the article:", error);
    alert("Unable to open this article. Please try again.");
  }
});

/* =========================================================
   NEWS SOURCES SECTION
========================================================= */

function renderSources() {
  const sourcesGrid = getElement("sources-grid");

  if (!sourcesGrid) return;

  sourcesGrid.innerHTML = RSS_FEEDS.map(feed => `
    <a href="${escapeHTML(feed.url)}"
       target="_blank"
       rel="noopener noreferrer"
       style="display:block;padding:15px;background:#111724;
              border:1px solid #263246;border-radius:8px;
              color:#f4f7ff;text-decoration:none;">
      <strong>${escapeHTML(feed.name)}</strong>
      <div style="font-size:12px;color:#168bff;margin-top:6px;">
        Visit source →
      </div>
    </a>
  `).join("");
}

/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  loadNews();

  // Automatically refresh the news every 10 minutes.
  setInterval(() => {
    if (!document.hidden) {
      loadNews();
    }
  }, REFRESH_INTERVAL);
});
