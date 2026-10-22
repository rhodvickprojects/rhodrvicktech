// RHODVICK TECH - Main JavaScript

// ===============================
// TECH SOURCES
// ===============================
const TECH_SOURCES = [
    { name: 'TechCrunch', domain: 'techcrunch.com', category: 'general' },
    { name: 'The Verge', domain: 'theverge.com', category: 'general' },
    { name: 'Wired', domain: 'wired.com', category: 'general' },
    { name: 'Ars Technica', domain: 'arstechnica.com', category: 'general' },
    { name: 'Engadget', domain: 'engadget.com', category: 'gadgets' },
    { name: 'CNET', domain: 'cnet.com', category: 'gadgets' },
    { name: 'Gizmodo', domain: 'gizmodo.com', category: 'gadgets' },
    { name: 'VentureBeat', domain: 'venturebeat.com', category: 'ai' },
    { name: 'AI News', domain: 'artificialintelligence-news.com', category: 'ai' },
    { name: 'CoinDesk', domain: 'coindesk.com', category: 'crypto' },
    { name: 'CoinTelegraph', domain: 'cointelegraph.com', category: 'crypto' },
    { name: 'Space.com', domain: 'space.com', category: 'space' },
    { name: 'NASA', domain: 'nasa.gov', category: 'space' },
    { name: 'Krebs on Security', domain: 'krebsonsecurity.com', category: 'security' },
    { name: 'Bleeping Computer', domain: 'bleepingcomputer.com', category: 'security' }
];

// ===============================
// GENERATE NEWS (FIXED URL)
// ===============================
const generateNewsData = () => {
    const categories = ['ai', 'crypto', 'gadgets', 'space', 'security'];

    const titles = [
        'OpenAI Announces GPT-5 with Revolutionary Multimodal Capabilities',
        'Bitcoin Surges Past $100K as Institutional Adoption Accelerates',
        'Apple Unveils Foldable iPhone Pro with Holographic Display',
        'SpaceX Successfully Launches First Commercial Mars Mission',
        'Critical Zero-Day Vulnerability Found in Popular VPN Services',
        'Google DeepMind Achieves Human-Level Reasoning in AI Benchmarks',
        'Ethereum 3.0 Upgrade Promises 100,000 TPS Throughput',
        'Samsung Galaxy S25 Features Neural Interface Control',
        'NASA Discovers Potentially Habitable Exoplanet 12 Light Years Away',
        'Ransomware Gang Demands $50M from Healthcare Giant'
    ];

    const news = [];
    const now = new Date();

    for (let i = 0; i < 24; i++) {
        const date = new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const category = categories[Math.floor(Math.random() * categories.length)];
        const source = TECH_SOURCES[Math.floor(Math.random() * TECH_SOURCES.length)];

        news.push({
            id: i,
            title: titles[Math.floor(Math.random() * titles.length)],
            excerpt: `Breaking developments in ${category} reshape the industry landscape.`,
            category,
            source: source.name,
            publishedAt: date.toISOString(),
            image: `https://picsum.photos/640/360?random=${i}`,

            // ⭐⭐⭐ FIXED HERE
            url: `https://${source.domain}`,

            readTime: Math.floor(Math.random() * 10) + 2
        });
    }

    return news.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
};

// ===============================
// STATE
// ===============================
let currentNews = [];
let filteredNews = [];
let currentPage = 1;
const itemsPerPage = 9;

const newsGrid = document.getElementById('news-grid');
const loadingElement = document.getElementById('news-loading');
const loadMoreBtn = document.getElementById('load-more');

// ===============================
// INIT
// ===============================
document.addEventListener('DOMContentLoaded', async () => {
    await loadNews();

    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        renderNewsPage();
    });
});

// ===============================
// LOAD NEWS
// ===============================
async function loadNews() {
    await new Promise(r => setTimeout(r, 800));

    currentNews = generateNewsData();
    filteredNews = [...currentNews];

    loadingElement.style.display = 'none';
    renderNewsPage();
}

// ===============================
// RENDER PAGE
// ===============================
function renderNewsPage() {
    const end = currentPage * itemsPerPage;
    const items = filteredNews.slice(0, end);

    newsGrid.innerHTML = items.map(createNewsCard).join('');

    loadMoreBtn.style.display =
        end >= filteredNews.length ? 'none' : 'flex';

    if (window.feather) feather.replace();
}

// ===============================
// CARD TEMPLATE (FIXED READ MORE)
// ===============================
function createNewsCard(item) {
    const date = new Date(item.publishedAt).toLocaleDateString();

    return `
        <article class="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-neon-cyan transition">

            <img src="${item.image}" class="w-full h-48 object-cover">

            <div class="p-5">
                <div class="text-xs text-gray-500 mb-2">${date} • ${item.readTime} min</div>

                <h3 class="font-bold mb-2">${item.title}</h3>

                <p class="text-gray-400 text-sm mb-4">${item.excerpt}</p>

                <a
                    href="${item.url}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-neon-cyan font-semibold hover:underline cursor-pointer"
                >
                    Read More →
                </a>
            </div>
        </article>
    `;
}
