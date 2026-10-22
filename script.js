/* =========================================================
   RHODVICK TECH — LIVE TECHNOLOGY NEWS
   RSS-powered news + internal article pages
   Brand colors: Red & Blue
========================================================= */

const RSS_FEEDS = [
  { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
  { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index" },
  { name: "Engadget", url: "https://www.engadget.com/rss.xml" },
  { name: "WIRED", url: "https://www.wired.com/feed/rss" },
  { name: "NASA", url: "https://www.nasa.gov/feed/" },
  { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
  { name: "BleepingComputer", url: "https://www.bleepingcomputer.com/feed/" }
];

const RSS_API = "https://api.rss2json.com/v1/api.json?rss_url=";
const PAGE_SIZE = 12;
const REFRESH_INTERVAL = 10 * 60 * 1000;

// Colour used for each category badge / Read More link
const CATEGORY_COLORS = {
  "AI & ML": "#22d3ee",
  "Crypto": "#f59e0b",
  "Security": "#fb923c",
  "Gaming": "#a855f7",
  "Hardware": "#34d399",
  "Mobile": "#60a5fa",
  "Science & Space": "#818cf8",
  "Software": "#f472b6",
  "Technology": "#ff303b"
};

let currentNews = [];
let filteredNews = [];
let visibleCount = PAGE_SIZE;
let isLoading = false;
let activeFilter = "all";
let searchQuery = "";

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

// Uses DOMParser so nothing in the feed HTML can load or run while cleaning
function cleanText(value = "") {
  const doc = new DOMParser().parseFromString(String(value), "text/html");

  return (doc.body.textContent || "")
    .replace(/\s+/g, " ")
    .trim();
}

function getElement(id) {
  return document.getElementById(id);
}

// rss2json dates look like "2026-10-22 14:05:00" (UTC, no timezone)
function parseDate(value) {
  if (!value) return null;

  let text = String(value);

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(text)) {
    text = text.replace(" ", "T") + "Z";
  }

  const date = new Date(text);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDate(value);

  if (!date) return "";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function timeAgo(value) {
  const date = parseDate(value);

  if (!date) return "";

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return formatDate(value);
}

function estimateReadTime(html = "") {
  const words = cleanText(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function getCategory(title, description = "") {
  const text = `${title} ${description}`.toLowerCase();

  if (/artificial intelligence|\bai\b|chatgpt|openai|machine learning|llm/.test(text)) {
    return "AI & ML";
  }

  if (/bitcoin|crypto|cryptocurrency|blockchain|coindesk/.test(text)) {
    return "Crypto";
  }

  if (/hack|cybersecurity|malware|ransomware|data breach|scam|vulnerability/.test(text)) {
    return "Security";
  }

  if (/gaming|\bgames?\b|playstation|xbox|nintendo|steam|esports|\bvr\b/.test(text)) {
    return "Gaming";
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
    content: item.content || "",
    readTime: estimateReadTime(item.content || item.description || ""),
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
   FILTER + SEARCH + STATS
========================================================= */

function applyFilter() {
  const query = searchQuery.toLowerCase();

  filteredNews = currentNews.filter(article => {
    const matchesCategory =
      activeFilter === "all" || article.category === activeFilter;

    const matchesSearch =
      !query ||
      `${article.title} ${article.description}`.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  visibleCount = PAGE_SIZE;
}

function readSearchFromHash() {
  const match = window.location.hash.match(/[?&]search=([^&]*)/);

  try {
    searchQuery = match
      ? decodeURIComponent(match[1].replace(/\+/g, " ")).trim()
      : "";
  } catch (error) {
    searchQuery = "";
  }
}

function updateStats() {
  const articlesEl = getElement("stat-articles");
  const sourcesEl = getElement("stat-sources");

  if (articlesEl) {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;

    const today = currentNews.filter(article => {
      const date = parseDate(article.date);
      return date && date.getTime() >= dayAgo;
    }).length;

    articlesEl.textContent = today || currentNews.length;
  }

  if (sourcesEl) sourcesEl.textContent = RSS_FEEDS.length;
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
        const dateA = parseDate(a.date)?.getTime() || 0;
        const dateB = parseDate(b.date)?.getTime() || 0;
        return dateB - dateA;
      });

    applyFilter();

    renderNewsPage();
    renderSources();
    updateStats();

  } catch (error) {
    console.error("RHODVICK TECH news error:", error);

    if (grid && currentNews.length === 0) {
      grid.innerHTML = `
        <div class="rt-empty">
          <h3 style="color:#fff;font-size:20px;margin-bottom:8px;">
            Unable to load the news right now.
          </h3>
          <p style="margin-bottom:16px;">
            Please check your internet connection and try again.
          </p>
          <button id="retry-news" class="rt-btn">TRY AGAIN</button>
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
  const ago = escapeHTML(timeAgo(item.date));
  const description = escapeHTML(item.description);
  const url = escapeHTML(item.url);
  const color = CATEGORY_COLORS[item.category] || "#ff303b";
  const readTime = Number(item.readTime) || 1;

  const imageHTML = item.image
    ? `<img src="${escapeHTML(item.image)}" alt="${title}" loading="lazy" onerror="this.remove()">`
    : "";

  return `
    <article class="rt-card" style="--c:${color}">

      <div class="rt-card-media">
        ${imageHTML}
        <span class="rt-badge">${category}</span>
      </div>

      <div class="rt-card-body">

        <div class="rt-meta">
          <span><i data-feather="globe"></i>${source}</span>
          <span><i data-feather="clock"></i>${ago}</span>
        </div>

        <h3>${title}</h3>

        <p class="rt-desc">
          ${description || "Read this technology news story on RHODVICK TECH."}
        </p>

        <div class="rt-foot">
          <span class="rt-read">
            <i data-feather="book-open"></i>${readTime} min read
          </span>

          <button type="button"
                  class="rt-read-more"
                  data-article-url="${url}">
            Read More <i data-feather="arrow-right"></i>
          </button>
        </div>

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

  let html = "";

  if (searchQuery) {
    html += `
      <div class="rt-search-info">
        <span>Results for “${escapeHTML(searchQuery)}” (${filteredNews.length})</span>
        <a href="#news">Clear search ✕</a>
      </div>
    `;
  }

  if (articlesToShow.length === 0) {
    html += `<p class="rt-empty">No articles found.</p>`;
  } else {
    html += articlesToShow.map(createNewsCard).join("");
  }

  grid.innerHTML = html;

  if (window.feather) window.feather.replace();

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
   CATEGORY FILTER BUTTONS
========================================================= */

document.addEventListener("click", function (event) {
  const filterButton = event.target.closest(".rt-filter");

  if (!filterButton) return;

  document
    .querySelectorAll(".rt-filter")
    .forEach(button => button.classList.remove("active"));

  filterButton.classList.add("active");

  activeFilter = filterButton.dataset.filter || "all";

  applyFilter();
  renderNewsPage();
});

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
    content: article.content || "",
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
    <a class="rt-source"
       href="${escapeHTML(feed.url)}"
       target="_blank"
       rel="noopener noreferrer">
      <strong>${escapeHTML(feed.name)}</strong>
      <div>Visit source →</div>
    </a>
  `).join("");
}

/* =========================================================
   INITIALIZE
========================================================= */

window.addEventListener("hashchange", function () {
  readSearchFromHash();
  applyFilter();
  renderNewsPage();

  if (searchQuery) {
    const news = getElement("news");
    if (news) news.scrollIntoView({ behavior: "smooth" });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  readSearchFromHash();
  loadNews();

  // Automatically refresh the news every 10 minutes.
  setInterval(() => {
    if (!document.hidden) {
      loadNews();
    }
  }, REFRESH_INTERVAL);
});
