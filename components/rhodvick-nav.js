// RHODVICK TECH Navigation Component (red theme)

class RhodvickNav extends HTMLElement {
    constructor() {
        super();
        this.isMenuOpen = false;
    }

    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@500;600;700&display=swap');

                * { margin: 0; padding: 0; box-sizing: border-box; }

                :host { display: block; position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }

                .nav-container {
                    background: rgba(5, 6, 11, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255, 48, 59, 0.25);
                    transition: all 0.3s ease;
                }

                .nav-container.scrolled {
                    background: rgba(5, 6, 11, 0.97);
                    border-bottom-color: rgba(255, 48, 59, 0.5);
                }

                .nav-inner {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 1rem 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .logo-section { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }

                .logo-section { animation: navIn 0.9s cubic-bezier(.2,.7,.2,1) both; }

                .logo-img {
                    width: 42px;
                    height: 42px;
                    object-fit: contain;
                    transition: transform 0.35s ease;
                    animation: logoGlow 3s ease-in-out infinite, logoFloat 4s ease-in-out infinite;
                }

                .logo-section:hover .logo-img { transform: rotate(-8deg) scale(1.12); }

                .logo-text {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.25rem;
                    font-weight: 800;
                    white-space: nowrap;
                }

                /* light sweeping across RHODVICK */
                .logo-name {
                    background: linear-gradient(100deg, #fff 0%, #fff 40%, #ff9aa0 50%, #fff 60%, #fff 100%);
                    background-size: 250% 100%;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: nameShine 5s linear infinite;
                }

                /* neon flicker on TECH */
                .logo-text em {
                    font-style: normal;
                    color: #ff303b;
                    text-shadow: 0 0 12px rgba(255, 48, 59, 0.75);
                    animation: neonFlicker 6s infinite;
                }

                @keyframes navIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: none; } }
                @keyframes logoGlow {
                    0%, 100% { filter: drop-shadow(0 0 5px rgba(255, 48, 59, 0.45)); }
                    50%      { filter: drop-shadow(0 0 16px rgba(255, 48, 59, 0.95)); }
                }
                @keyframes logoFloat { 0%, 100% { translate: 0 0; } 50% { translate: 0 -3px; } }
                @keyframes nameShine { 0% { background-position: 120% 0; } 100% { background-position: -120% 0; } }
                @keyframes neonFlicker {
                    0%, 18%, 22%, 60%, 63%, 100% { opacity: 1; text-shadow: 0 0 12px rgba(255, 48, 59, 0.8), 0 0 26px rgba(255, 48, 59, 0.4); }
                    20%, 61.5%                   { opacity: 0.65; text-shadow: none; }
                }

                @media (prefers-reduced-motion: reduce) {
                    .logo-section, .logo-img, .logo-name, .logo-text em { animation: none !important; }
                }

                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    list-style: none;
                }

                .nav-link {
                    font-family: 'Rajdhani', sans-serif;
                    color: #9ca3af;
                    text-decoration: none;
                    font-size: 0.95rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    position: relative;
                    padding: 0.5rem 0;
                    transition: all 0.3s ease;
                }

                .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: #ff303b;
                    transition: width 0.3s ease;
                }

                .nav-link:hover { color: #fff; }
                .nav-link:hover::after { width: 100%; }

                .nav-actions { display: flex; align-items: center; gap: 1rem; }

                .search-btn, .menu-btn {
                    background: transparent;
                    border: none;
                    color: #e5e7eb;
                    padding: 0.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .search-btn:hover, .menu-btn:hover {
                    background: rgba(255, 48, 59, 0.12);
                    color: #ff303b;
                }

                .contact-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1.1rem;
                    background: transparent;
                    border: 1px solid #ff303b;
                    color: #ff303b;
                    text-decoration: none;
                    border-radius: 8px;
                    font-family: 'Rajdhani', sans-serif;
                    font-size: 0.95rem;
                    font-weight: 700;
                    transition: all 0.3s ease;
                }

                .contact-btn:hover {
                    background: #ff303b;
                    color: #fff;
                    box-shadow: 0 0 20px rgba(255, 48, 59, 0.45);
                }

                .mobile-menu { display: none; position: absolute; top: 100%; left: 0; right: 0; background: rgba(5,6,11,0.98); border-bottom:1px solid rgba(255,48,59,0.3); padding:1.5rem; transform: translateY(-100%); opacity:0; pointer-events:none; transition: all 0.3s ease; }
                .mobile-menu.open { transform: translateY(0); opacity:1; pointer-events:auto; }
                .mobile-links { list-style:none; display:flex; flex-direction:column; gap:1rem; }
                .mobile-link { font-family:'Rajdhani',sans-serif; color:#fff; text-decoration:none; font-size:1.2rem; font-weight:600; padding:0.75rem; border-radius:8px; transition: all 0.3s ease; display:flex; align-items:center; gap:0.75rem; }
                .mobile-link:hover { background: rgba(255,48,59,0.12); color:#ff303b; }

                .live-indicator { display:flex; align-items:center; gap:0.5rem; padding:0.25rem 0.75rem; background: rgba(255,48,59,0.1); border:1px solid rgba(255,48,59,0.6); border-radius:20px; font-family:'Rajdhani',sans-serif; font-size:0.8rem; font-weight:700; color:#ff5a63; text-transform:uppercase; }
                .live-dot { width:8px; height:8px; background:#ff303b; border-radius:50%; box-shadow:0 0 8px #ff303b; animation:pulse 2s infinite; }
                @keyframes pulse { 0%,100%{opacity:1; transform:scale(1);} 50%{opacity:0.5; transform:scale(1.2);} }

                @media (max-width:1024px) { .nav-links, .contact-btn{display:none;} .menu-btn{display:flex;} .mobile-menu{display:block;} }
                @media (min-width:1025px){ .menu-btn{display:none;} }

                .search-overlay { position: fixed; inset:0; background: rgba(5,6,11,0.96); display:none; align-items:center; justify-content:center; z-index:2000; }
                .search-overlay.open{ display:flex; }
                .search-container{ width:90%; max-width:600px; }
                .search-input{ width:100%; padding:1.5rem; font-family:'Rajdhani',sans-serif; font-size:1.5rem; background:transparent; border:none; border-bottom:2px solid #ff303b; color:#fff; outline:none; }
                .search-input::placeholder{ color:#6b7280; }
                .search-close{ position:absolute; top:2rem; right:2rem; background:transparent; border:none; color:#ff303b; font-size:1.5rem; cursor:pointer; }
            </style>

            <nav class="nav-container" id="nav">
                <div class="nav-inner">
                    <a href="index.html" class="logo-section">
                        <img src="/images/rhodvicklogo.png" alt="RHODVICK TECH" class="logo-img">
                        <span class="logo-text"><span class="logo-name">RHODVICK</span> <em>TECH</em></span>
                    </a>

                    <ul class="nav-links">
                        <li><a href="index.html#news" class="nav-link">News</a></li>
                        <li><a href="index.html#sources" class="nav-link">Sources</a></li>
                        <li><a href="trends.html" class="nav-link">Trends</a></li>
                        <li><a href="about.html" class="nav-link">About</a></li>
                        <li>
                            <span class="live-indicator">
                                <span class="live-dot"></span>Live
                            </span>
                        </li>
                    </ul>

                    <div class="nav-actions">
                        <button class="search-btn" id="searchBtn" aria-label="Search">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </button>
                        <a href="mailto:rhodvicktech@gmail.com" class="contact-btn">Contact</a>
                        <button class="menu-btn" id="menuBtn" aria-label="Menu">
                            <svg id="menuIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="mobile-menu" id="mobileMenu">
                    <ul class="mobile-links">
                        <li><a href="index.html#news" class="mobile-link">News</a></li>
                        <li><a href="index.html#sources" class="mobile-link">Sources</a></li>
                        <li><a href="trends.html" class="mobile-link">Trends</a></li>
                        <li><a href="about.html" class="mobile-link">About</a></li>
                        <li><a href="mailto:rhodvicktech@gmail.com" class="mobile-link">Contact Us</a></li>
                    </ul>
                </div>
            </nav>

            <div class="search-overlay" id="searchOverlay">
                <button class="search-close" id="searchClose">✕</button>
                <div class="search-container">
                    <input type="text" class="search-input" id="searchInput" placeholder="Search tech news...">
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const nav = this.shadowRoot.getElementById('nav');
        const menuBtn = this.shadowRoot.getElementById('menuBtn');
        const mobileMenu = this.shadowRoot.getElementById('mobileMenu');
        const menuIcon = this.shadowRoot.getElementById('menuIcon');
        const searchBtn = this.shadowRoot.getElementById('searchBtn');
        const searchOverlay = this.shadowRoot.getElementById('searchOverlay');
        const searchClose = this.shadowRoot.getElementById('searchClose');
        const searchInput = this.shadowRoot.getElementById('searchInput');

        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 50);
        });

        menuBtn.addEventListener('click', () => {
            this.isMenuOpen = !this.isMenuOpen;
            mobileMenu.classList.toggle('open', this.isMenuOpen);
            menuIcon.innerHTML = this.isMenuOpen
                ? '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'
                : '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>';
        });

        searchBtn.addEventListener('click', () => { searchOverlay.classList.add('open'); searchInput.focus(); });
        searchClose.addEventListener('click', () => searchOverlay.classList.remove('open'));
        searchOverlay.addEventListener('click', (e) => { if(e.target===searchOverlay) searchOverlay.classList.remove('open'); });
        searchInput.addEventListener('keypress', (e)=>{ if(e.key==='Enter'){ const query=searchInput.value.trim(); if(query){ window.location.href=`index.html#news?search=${encodeURIComponent(query)}`; searchOverlay.classList.remove('open'); }}});

        this.shadowRoot.querySelectorAll('.mobile-link').forEach(link=>{
            link.addEventListener('click', ()=>{
                this.isMenuOpen=false;
                mobileMenu.classList.remove('open');
                menuIcon.innerHTML='<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>';
            });
        });
    }
}

customElements.define('rhodvick-nav', RhodvickNav);
