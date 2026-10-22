
/* ==========================================
   RHODVICK TECH — REAL TECH NEWS
========================================== */

const RSS_FEEDS = [
    {
        name: "TechCrunch",
        url: "https://techcrunch.com/feed/",
        category: "general"
    },
    {
        name: "The Verge",
        url: "https://www.theverge.com/rss/index.xml",
        category: "general"
    },
    {
        name: "Wired",
        url: "https://www.wired.com/feed/rss",
        category: "general"
    },
    {
        name: "Ars Technica",
        url: "https://feeds.arstechnica.com/arstechnica/index",
        category: "general"
    },
    {
        name: "Engadget",
        url: "https://www.engadget.com/rss.xml",
        category: "gadgets"
    },
    {
        name: "NASA",
        url: "https://www.nasa.gov/feed/",
        category: "space"
    },
    {
        name: "CoinDesk",
        url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
        category: "crypto"
    },
    {
        name: "BleepingComputer",
        url: "https://www.bleepingcomputer.com/feed/",
        category: "security"
    }
];

let currentNews = [];
let filteredNews = [];
let currentPage = 1;

const itemsPerPage = 9;

const newsGrid = document.getElementById("news-grid");
const loadingElement = document.getElementById("news-loading");
const loadMoreBtn = document.getElementById("load-more");
const sourcesGrid = document.getElementById("sources-grid");

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function cleanText(value = "") {
    const doc = new DOMParser().parseFromString(
        String(value),
        "text/html"
    );

    return (doc.body.textContent || "").trim();
}

function renderSources() {
    if (!sourcesGrid) return;

    sourcesGrid.innerHTML = RSS_FEEDS.map(feed => `
        <div class="p-4 rounded-xl border border-gray-800 bg-gray-900">
            <p class="font-bold text-neon-cyan">
                ${escapeHTML(feed.name)}
            </p>
            <p class="text-xs text-gray-400 mt-2">
                ${escapeHTML(feed.category)}
            </p>
        </div>
    `).join("");
}

async function fetchRSSFeed(feed) {
    const endpoint =
        "https://api.rss2json.com/v1/api.json?rss_url=" +
        encodeURIComponent(feed.url);

    const response = await fetch(endpoint);

    if (!response.ok) {
        throw new Error(feed.name + " request failed");
    }

    const data = await response.json();

    if (data.status !== "ok") {
        throw new Error(feed.name + " feed unavailable");
    }

    return (data.items || []).map((item, index) => {
        const description = cleanText(item.description || "");

        let image = item.thumbnail || "";

        if (!image && item.enclosure && item.enclosure.link) {
            image = item.enclosure.link;
        }

        return {
            id: feed.name + "-" + index + "-" + item.link,
            title: item.title || "Technology News",
            excerpt: description.slice(0, 240) ||
                "Read the latest technology update.",
            category: feed.category,
            source: feed.name,
            publishedAt: item.pubDate || "",
            image,
            url: item.link || "",
            readTime: 3
        };
    }).filter(item =>
        item.title && /^https?:\/\//i.test(item.url)
    );
}

async function loadNews() {
    if (!newsGrid) return;

    if (loadingElement) {
        loadingElement.style.display = "block";
    }

    newsGrid.innerHTML = "";

    const results = await Promise.allSettled(
        RSS_FEEDS.map(fetchRSSFeed)
    );

    currentNews = results
        .filter(result => result.status === "fulfilled")
        .flatMap(result => result.value);

    const failedFeeds = results.filter(
        result => result.status === "rejected"
    ).length;

    const seen = new Set();

    currentNews = currentNews
        .filter(item => {
            if (seen.has(item.url)) return false;
            seen.add(item.url);
            return true;
        })
        .sort((a, b) =>
            (Date.parse(b.publishedAt) || 0) -
            (Date.parse(a.publishedAt) || 0)
        );

    filteredNews = [...currentNews];
    currentPage = 1;

    if (loadingElement) {
        loadingElement.style.display = "none";
    }

    if (currentNews.length === 0) {
        newsGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <h3 class="text-xl font-bold mb-3">
                    News is temporarily unavailable
                </h3>
                <p class="text-gray-400 mb-5">
                    Please check your connection and try again.
                </p>
                <button id="retry-news"
                    class="px-6 py-3 rounded-lg font-bold"
                    style="background:#168bff;color:white">
                    Try Again
                </button>
            </div>
        `;

        if (loadMoreBtn) loadMoreBtn.style.display = "none";

        document.getElementById("retry-news")
            ?.addEventListener("click", loadNews);

        return;
    }

    renderNewsPage();

    if (failedFeeds > 0) {
        console.warn(
            failedFeeds + " RSS feed(s) could not be loaded."
        );
    }
}

function renderNewsPage() {
    if (!newsGrid) return;

    const end = currentPage * itemsPerPage;

    newsGrid.innerHTML = filteredNews
        .slice(0, end)
        .map(createNewsCard)
        .join("");

    if (loadMoreBtn) {
        loadMoreBtn.style.display =
            end >= filteredNews.length ? "none" : "inline-block";
    }

    if (window.feather) {
        window.feather.replace();
    }
}

function createNewsCard(item) {
    const title = escapeHTML(item.title);
    const excerpt = escapeHTML(item.excerpt);
    const source = escapeHTML(item.source);
    const category = escapeHTML(item.category);
    const date = item.publishedAt
        ? new Date(item.publishedAt).toLocaleDateString()
        : "Latest";

    const image = item.image &&
        /^https?:\/\//i.test(item.image)
        ? `
            <img src="${escapeHTML(item.image)}"
                 alt="${title}"
                 loading="lazy"
                 class="w-full h-48 object-cover"
                 onerror="this.style.display='none'">
          `
        : `
            <div class="h-48 flex items-center justify-center
                        bg-gray-800 text-neon-cyan font-bold">
                RHODVICK TECH
            </div>
          `;

    return `
        <article class="bg-gray-900 rounded-xl overflow-hidden
                        border border-gray-800 hover:border-blue-500
                        transition">

            ${image}

            <div class="p-5">
                <div class="text-xs text-gray-500 mb-2">
                    ${source} • ${date}
                </div>

                <span class="text-xs uppercase text-blue-400">
                    ${category}
                </span>

                <h3 class="font-bold my-3">${title}</h3>

                <p class="text-gray-400 text-sm mb-5">
                    ${excerpt}
                </p>

                <a href="${escapeHTML(item.url)}"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="font-semibold hover:underline"
                   style="color:#168bff">
                    Read Original Story →
                </a>
            </div>
        </article>
    `;
}

if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
        currentPage++;
        renderNewsPage();
    });
}

renderSources();
loadNews();

// Refresh the news every 10 minutes.
setInterval(loadNews, 10 * 60 * 1000);
