
/* ==========================================
   RHODVICK TECH — NEON FOOTER COMPONENT
========================================== */

class RhodvickFooter extends HTMLElement {
    connectedCallback() {
        // Prevent rendering the component more than once.
        if (this.shadowRoot) return;

        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

                :host {
                    display: block;
                    font-family: 'Inter', sans-serif;
                    color: #dce7f7;
                }

                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                .footer {
                    position: relative;
                    overflow: hidden;
                    padding: 60px 24px 20px;
                    background:
                        radial-gradient(
                            ellipse at 0% 0%,
                            rgba(0, 191, 255, 0.09),
                            transparent 45%
                        ),
                        radial-gradient(
                            ellipse at 100% 100%,
                            rgba(255, 36, 72, 0.07),
                            transparent 45%
                        ),
                        #05070c;
                    border-top: 1px solid rgba(0, 191, 255, 0.3);
                }

                .footer::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 15%;
                    right: 15%;
                    height: 1px;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        #00bfff,
                        #ff2448,
                        transparent
                    );
                    box-shadow: 0 0 15px rgba(0, 191, 255, 0.5);
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .footer-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1fr;
                    gap: 48px;
                    padding-bottom: 45px;
                }

                .brand {
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 20px;
                    text-decoration: none;
                }

                .logo {
                    width: 48px;
                    height: 48px;
                    object-fit: cover;
                    border-radius: 10px;
                    border: 1px solid #00bfff;
                    box-shadow: 0 0 15px rgba(0, 191, 255, 0.25);
                }

                .brand-name {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.1rem;
                    font-weight: 800;
                    letter-spacing: -0.04em;
                    color: #fff;
                }

                .brand-name span {
                    color: #00bfff;
                    text-shadow: 0 0 12px rgba(0, 191, 255, 0.3);
                }

                .description {
                    max-width: 390px;
                    color: #93a2b8;
                    font-size: 0.9rem;
                    line-height: 1.9;
                    margin-bottom: 22px;
                }

                .status {
                    display: inline-flex;
                    align-items: center;
                    gap: 9px;
                    padding: 7px 12px;
                    border: 1px solid rgba(0, 191, 255, 0.22);
                    border-radius: 30px;
                    background: rgba(0, 191, 255, 0.05);
                    color: #00bfff;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .status-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #00bfff;
                    box-shadow: 0 0 10px #00bfff;
                }

                .heading {
                    margin-bottom: 20px;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    color: #fff;
                }

                .heading::after {
                    content: '';
                    display: block;
                    width: 38px;
                    height: 2px;
                    margin-top: 10px;
                    background: linear-gradient(
                        90deg,
                        #00bfff,
                        #ff2448
                    );
                }

                .links {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 13px;
                    list-style: none;
                }

                .links a {
                    color: #93a2b8;
                    font-size: 0.9rem;
                    text-decoration: none;
                    transition: color 0.25s ease,
                                transform 0.25s ease;
                }

                .links a:hover {
                    color: #00bfff;
                    transform: translateX(4px);
                }

                .contact-link {
                    display: inline-block;
                    margin-top: 4px;
                    overflow-wrap: anywhere;
                }

                .youtube {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 18px;
                    padding: 11px 15px;
                    border: 1px solid rgba(255, 36, 72, 0.5);
                    border-radius: 8px;
                    background: rgba(255, 36, 72, 0.05);
                    color: #ff4565;
                    font-size: 0.85rem;
                    font-weight: 700;
                    text-decoration: none;
                    transition: all 0.3s ease;
                }

                .youtube:hover {
                    background: #ff2448;
                    color: white;
                    box-shadow: 0 0 20px rgba(255, 36, 72, 0.25);
                    transform: translateY(-2px);
                }

                .bottom {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 18px;
                    padding-top: 22px;
                    border-top: 1px solid rgba(0, 191, 255, 0.13);
                }

                .copyright {
                    color: #718096;
                    font-size: 0.8rem;
                    line-height: 1.8;
                }

                .signature {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 0.72rem;
                    font-weight: 600;
                    letter-spacing: 0.06em;
                    text-align: right;
                    color: #93a2b8;
                }

                .signature span {
                    color: #ff4565;
                }

                @media (max-width: 760px) {
                    .footer {
                        padding: 45px 20px 20px;
                    }

                    .footer-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 35px 24px;
                    }

                    .brand-column {
                        grid-column: 1 / -1;
                    }

                    .description {
                        max-width: 100%;
                    }
                }

                @media (max-width: 420px) {
                    .footer-grid {
                        grid-template-columns: 1fr;
                        gap: 30px;
                    }

                    .brand-column {
                        grid-column: auto;
                    }

                    .bottom {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .signature {
                        text-align: left;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    *,
                    *::before,
                    *::after {
                        transition: none !important;
                    }
                }
            </style>

            <footer class="footer">
                <div class="container">

                    <div class="footer-grid">

                        <!-- BRAND -->
                        <div class="brand-column">
                            <a href="index.html" class="brand">
                                <img
                                    src="/images/rhodvicklogo.png"
                                    alt="Rhodvick Tech logo"
                                    class="logo"
                                >
                                <span class="brand-name">
                                    RHODVICK <span>TECH</span>
                                </span>
                            </a>

                            <p class="description">
                                Your portal to the future. Discover
                                technology news, artificial intelligence,
                                gadgets, cybersecurity, space discoveries
                                and the innovations shaping tomorrow.
                            </p>

                            <div class="status">
                                <span class="status-dot"></span>
                                Exploring the digital universe
                            </div>
                        </div>

                        <!-- QUICK LINKS -->
                        <div>
                            <h3 class="heading">EXPLORE</h3>

                            <ul class="links">
                                <li>
                                    <a href="index.html">Home</a>
                                </li>
                                <li>
                                    <a href="index.html#news">Tech News</a>
                                </li>
                                <li>
                                    <a href="index.html#sources">News Sources</a>
                                </li>
                                <li>
                                    <a href="trends.html">Tech Trends</a>
                                </li>
                                <li>
                                    <a href="about.html">About Us</a>
                                </li>
                            </ul>
                        </div>

                        <!-- CONTACT -->
                        <div>
                            <h3 class="heading">CONNECT</h3>

                            <ul class="links">
                                <li>
                                    <a
                                        class="contact-link"
                                        href="mailto:rhodvicktech@gmail.com"
                                    >
                                        rhodvicktech@gmail.com
                                    </a>
                                </li>
                            </ul>

                            <a
                                class="youtube"
                                href="https://www.youtube.com/@Rhodvick"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                ▶ Visit Our YouTube
                            </a>
                        </div>

                    </div>

                    <div class="bottom">
                        <p class="copyright">
                            © <span id="footerYear"></span>
                            RHODVICK TECH. All rights reserved.
                        </p>

                        <p class="signature">
                            BUILT FOR THE <span>FUTURE</span>.
                        </p>
                    </div>

                </div>
            </footer>
        `;

        this.shadowRoot.getElementById('footerYear').textContent =
            new Date().getFullYear();
    }
}

if (!customElements.get('rhodvick-footer')) {
    customElements.define('rhodvick-footer', RhodvickFooter);
}
