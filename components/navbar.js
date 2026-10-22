// RHODVICK TECH Navigation Component

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
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
                
                * { margin: 0; padding: 0; box-sizing: border-box; }

                :host { display: block; position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }

                .nav-container {
                    background: rgba(0, 0, 0, 0.9);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(0, 240, 255, 0.2);
                    transition: all 0.3s ease;
                }

                .nav-container.scrolled {
                    background: rgba(0,0,0,0.98);
                    border-bottom-color: rgba(0,240,255,0.5);
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

                /* ✅ Logo updated to local image */
                .logo-img {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    border: 2px solid #00f0ff;
                    box-shadow: 0 0 10px rgba(0,240,255,0.5);
                    object-fit: cover;
                }

                .logo-text {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.25rem;
                    font-weight: 800;
                    background: linear-gradient(90deg, #00f0ff, #ff00a0);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    list-style: none;
                }

                .nav-link {
                    color: #9ca3af;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
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
                    background: linear-gradient(90deg, #00f0ff, #ff00a0);
                    transition: width 0.3s ease;
                }

                .nav-link:hover { color: #00f0ff; }
                .nav-link:hover::after { width: 100%; }

                .nav-actions { display: flex; align-items: center; gap: 1rem; }

                .search-btn, .menu-btn {
                    background: transparent;
                    border: 1px solid rgba(0,240,255,0.3);
                    color: #00f0ff;
                    padding: 0.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .search-btn:hover, .menu-btn:hover {
                    background: rgba(0,240,255,0.1);
                    border-color: #00f0ff;
                    box-shadow: 0 0 15px rgba(0,240,255,0.3);
                }

                .contact-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: 1px solid #ff00a0;
                    color: #ff00a0;
                    text-decoration: none;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .contact-btn:hover {
                    background: #ff00a0;
                    color: #000;
                    box-shadow: 0 0 20px rgba(255,0,160,0.4);
                }

                .mobile-menu { display: none; position: absolute; top: 100%; left: 0; right: 0; background: rgba(0,0,0,0.98); border-bottom:1px solid rgba(0,240,255,0.3); padding:1.5rem; transform: translateY(-100%); opacity:0; pointer-events:none; transition: all 0.3s ease; }
                .mobile-menu.open { transform: translateY(0); opacity:1; pointer-events:auto; }
                .mobile-links { list-style:none; display:flex; flex-direction:column; gap:1rem; }
                .mobile-link { color:#fff; text-decoration:none; font-size:1.125rem; font-weight:600; padding:0.75rem; border-radius:8px; transition: all 0.3s ease; display:flex; align-items:center; gap:0.75rem; }
                .mobile-link:hover { background: rgba(0,240,255,0.1); color:#00f0ff; }

                .live-indicator { display:flex; align-items:center; gap:0.5rem; padding:0.25rem 0.75rem; background: rgba(57,255,20,0.1); border:1px solid #39ff14; border-radius:20px; font-size:0.75rem; font-weight:600; color:#39ff14; text-transform:uppercase; }
                .live-dot { width:8px; height:8px; background:#39ff14; border-radius:50%; animation:pulse 2s infinite; }
                @keyframes pulse { 0%,100%{opacity:1; transform:scale(1);} 50%{opacity:0.5; transform:scale(1.2);} }

                @media (max-width:1024px) { .nav-links, .contact-btn{display:none;} .menu-btn{display:flex;} .mobile-menu{display:block;} }
                @media (min-width:1025px){ .menu-btn{display:none;} }

                .search-overlay { position: fixed; inset:0; background: rgba(0,0,0,0.95); display:none; align-items:center; justify-content:center; z-index:2000; }
                .search-overlay.open{ display:flex; }
                .search-container{ width:90%; max-width:600px; }
                .search-input{ width:100%; padding:1.5rem; font-size:1.5rem; background:transparent; border:none; border-bottom:2px solid #00f0ff; color:#fff; outline:none; }
                .search-input::placeholder{ color:#6b7280; }
                .search-close{ position:absolute; top:2rem; right:2rem; background:transparent; border:none; color:#00f0ff; cursor:pointer; }
            </style>

            <nav class="nav-container" id="nav">
                <div class="nav-inner">
                    <a href="index.html" class="logo-section">
                        <img src="/images/rhodvicklogo.png" alt="RHODVICK TECH" class="logo-img">
                        <span class="logo-text">RHODVICK TECH</span>
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </button>
                        <a href="mailto:rhodvicktech@gmail.com" class="contact-btn">Contact</a>
                        <button class="menu-btn" id="menuBtn" aria-label="Menu">
                            <svg id="menuIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
