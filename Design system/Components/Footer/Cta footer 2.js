/**
 * =====================================================
 * NUA CTA + FOOTER COMPONENT — Variant 2 (Orb Edition)
 * =====================================================
 *
 * Difference from Variant 1:
 *   CTA section shows the Shax Lottie animation inside
 *   a frosted-glass orb with a blue radial glow, instead
 *   of a full-width iframe strip.
 *
 * Usage:
 *   1. Add mount point before </body>:
 *      <div id="cta-footer-2"></div>
 *
 *   2. Load the script:
 *      <script src="Design system/Components/Footer/Cta footer 2.js"></script>
 *
 *   3. Optional data attributes (same API as Variant 1):
 *      <div id="cta-footer-2"
 *           data-heading="Custom Heading"
 *           data-subheading="Custom subheading"
 *           data-cta-text="Book a demo"
 *           data-cta-link="book-a-demo.html"
 *           data-show-cta="true"
 *           data-email="info@example.com"
 *           data-copyright="© 2025 NUA USA.">
 *      </div>
 * =====================================================
 */

(function () {
  'use strict';

  // ===== DEFAULT CONFIGURATION =====
  const defaultConfig = {
    heading: 'Get Ahead Of Threats',
    subheading: 'Find and fix vulnerabilities early to strengthen your security posture and show clear commitment to industry standards and compliance requirements.',
    ctaText: 'Book a demo',
    ctaLink: 'book-a-demo.html',
    showCta: true,
    email: 'info@nuasecurity.com',
    copyright: '© 2025 NUA USA.',
    lottieUrl: 'https://cdn.lottielab.com/l/59mGokKhxq8TV5.html',
    socialLinks: {
      twitter: 'https://x.com/Nuasecurity',
      linkedin: 'https://www.linkedin.com/company/nuasecurity/'
    },
    navLinks: [
      { label: 'Company',  href: 'company.html'  },
      { label: 'Services', href: 'services.html' },
      { label: 'Pricing',  href: 'pricing.html'  },
      { label: 'Career',   href: '#'              }
    ],
    resourceLinks: [
      { label: 'Blogs', href: 'blog.html' }
    ]
  };

  // ===== SVG ICONS =====
  const icons = {
    nuaLogo: `<svg preserveAspectRatio="none" viewBox="0 0 68.1635 19.96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.53674e-05 5.06259H5.02596V19.96H9.53674e-05V5.12801C9.53674e-05 5.10598 9.53674e-05 5.08462 9.53674e-05 5.06259Z"/>
      <path d="M23.2637 19.96H17.6177L10.0238 5.09799C10.0125 5.07596 9.98976 5.06261 9.96507 5.06261H5.02665V0.00069738C5.04867 2.98458e-05 5.0707 2.98464e-05 5.09273 2.98464e-05H9.96507C11.8869 2.98464e-05 13.6245 1.09812 14.4996 2.80968L23.2637 19.96Z"/>
      <path d="M59.4134 2.80967C58.5383 1.09811 56.8007 1.33682e-05 54.8788 1.33682e-05H50.0072C49.9851 1.33682e-05 49.9624 1.33676e-05 49.9404 0.000680902L49.9404 5.0626H54.8788C54.9035 5.0626 54.9262 5.07595 54.9376 5.09798L57.6157 10.3341L49.9404 13.9949V5.0626H44.9145C44.9139 5.08463 44.9139 5.10665 44.9139 5.12868L44.9052 19.96H49.9317L59.9301 14.8593L62.5174 19.96H68.1634L59.4134 2.80967Z"/>
      <path d="M30.9149 14.9735H35.8527L35.8467 19.96C35.8246 19.96 35.8019 19.96 35.7799 19.96H30.9089C30.6339 19.96 30.3642 19.9386 30.0985 19.8959C28.5078 19.6429 27.13 18.693 26.3797 17.2264L17.5709 0.000699361H23.2162L30.8555 14.9381C30.8668 14.9601 30.8895 14.9735 30.9149 14.9735Z"/>
      <path d="M40.8801 0.000686646V14.9081C40.8801 14.9301 40.8801 14.9521 40.8794 14.9735H35.8529V0.000686646H40.8801Z"/>
    </svg>`,

    twitter: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.27 1.59h2.97l-6.49 7.42 7.63 10.09h-5.98l-4.68-6.13-5.36 6.13H.39l6.94-7.93L0 1.59h6.13l4.23 5.6 4.91-5.6Zm-1.04 15.72h1.64L5.88 3.27H4.12l10.11 14.04Z" fill="white"/>
    </svg>`,

    linkedin: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.52 0H1.48C.66 0 0 .645 0 1.44v17.12C0 19.355.66 20 1.48 20h17.04c.82 0 1.48-.645 1.48-1.44V1.44C20 .645 19.34 0 18.52 0ZM5.93 17.04H2.96V7.5h2.97v9.54ZM4.45 6.2a1.72 1.72 0 110-3.44 1.72 1.72 0 010 3.44Zm12.59 10.84h-2.97v-4.64c0-1.11-.02-2.53-1.54-2.53-1.54 0-1.78 1.2-1.78 2.45v4.72H7.78V7.5h2.85v1.3h.04c.4-.75 1.37-1.54 2.81-1.54 3.01 0 3.56 1.98 3.56 4.55v5.23Z" fill="white"/>
    </svg>`
  };

  // ===== GENERATE HTML =====
  function generateHTML(config) {
    const cfg = { ...defaultConfig, ...config };

    const navLinksHTML = cfg.navLinks.map(link =>
      `<a href="${link.href}" class="footer-link">${link.label}</a>`
    ).join('');

    const resourceLinksHTML = cfg.resourceLinks.map(link =>
      `<a href="${link.href}" class="footer-link">${link.label}</a>`
    ).join('');

    // ── CTA section with orb animation ──────────────────────
    const ctaSectionHTML = cfg.showCta ? `
      <div class="cta-card">
        <div class="cta-inner">

          <!-- Text block: heading + sub + button -->
          <div class="cta-text-block">
            <h2 class="cta-heading">${cfg.heading}</h2>
            <p class="cta-subheading">${cfg.subheading}</p>
            <a href="${cfg.ctaLink}" class="cta-btn">${cfg.ctaText}</a>
          </div>

          <!-- Orb animation ──────────────────────────────── -->
          <div class="cta-orb-wrap">
            <!-- Outer ambient glow -->
            <div class="cta-orb-glow cta-orb-glow--outer" aria-hidden="true"></div>
            <!-- Inner concentrated glow -->
            <div class="cta-orb-glow cta-orb-glow--inner" aria-hidden="true"></div>
            <!-- Frosted-glass card housing the Lottie animation -->
            <div class="cta-orb-glass">
              <iframe
                src="${cfg.lottieUrl}"
                allowtransparency="true"
                loading="lazy"
                title="Shax animation"
              ></iframe>
            </div>
            <!-- Cursor accent icon -->
            <div class="cta-orb-cursor" aria-hidden="true">
              <svg width="26" height="32" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L1 27.5L8.5 20L13.5 33L17.5 31.5L12.5 18.5L22.5 18.5L1 1Z" fill="white" fill-opacity="0.6" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>

        </div>
      </div>
    ` : '';

    // ── Footer card (identical to Variant 1) ────────────────
    return `
      <section class="cta-footer-section">
        ${ctaSectionHTML}

        <footer class="footer-card">
          <div class="footer-inner">
            <div class="footer-content">

              <div class="footer-links-row">
                <!-- Left: logo + social -->
                <div class="footer-left">
                  <a href="index.html" class="footer-logo" aria-label="NUA Home">
                    ${icons.nuaLogo}
                  </a>
                  <div class="footer-social">
                    <a href="${cfg.socialLinks.twitter}" target="_blank" rel="noopener noreferrer" class="footer-social-icon" aria-label="X (Twitter)">
                      ${icons.twitter}
                    </a>
                    <a href="${cfg.socialLinks.linkedin}" target="_blank" rel="noopener noreferrer" class="footer-social-icon" aria-label="LinkedIn">
                      ${icons.linkedin}
                    </a>
                  </div>
                </div>

                <!-- Right: nav columns -->
                <div class="footer-right">
                  <div class="footer-link-col">
                    <span class="footer-link-label">Links</span>
                    ${navLinksHTML}
                  </div>
                  <div class="footer-link-col">
                    <span class="footer-link-label">Resources</span>
                    ${resourceLinksHTML}
                  </div>
                </div>
              </div>

              <!-- Bottom: badges + contact -->
              <div class="footer-bottom-row">
                <div class="footer-badges">
                  <div class="footer-iso">
                    <span class="footer-iso-top">ISO</span>
                    <span class="footer-iso-btm">27001</span>
                  </div>
                  <div class="footer-gartner">
                    <span class="footer-gartner-top">Gartner<span style="font-size:8px;vertical-align:super;">®</span></span>
                    <div class="footer-gartner-btm">
                      <span class="footer-gartner-peer">Peer</span>
                      <span class="footer-gartner-insights">Insights<span class="footer-gartner-tm">™</span></span>
                    </div>
                  </div>
                </div>
                <div class="footer-contact">
                  <span class="footer-contact-text">${cfg.email}</span>
                  <span class="footer-contact-text">${cfg.copyright}</span>
                </div>
              </div>

            </div>

            <!-- Watermark -->
            <div class="footer-watermark">
              ${icons.nuaLogo}
            </div>
            <div class="footer-fade"></div>
          </div>
        </footer>
      </section>
    `;
  }

  // ===== INJECT CSS =====
  function injectStyles() {
    if (document.getElementById('cta-footer-2-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'cta-footer-2-styles';
    styles.textContent = `

      /* ===== SHARED SECTION WRAPPER ===== */
      .cta-footer-section {
        width: 100%;
        background-color: #FFFFFF;
        padding: 0 16px 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        margin-top: 72px;
      }

      /* ===== CTA CARD ===== */
      .cta-card {
        width: 100%;
        background: #060D17;
        border-radius: 9px;
        overflow: hidden;
        position: relative;
      }

      .cta-inner {
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 52px 20px 0;
        gap: 0;
        position: relative;
      }

      /* ── Text block ── */
      .cta-text-block {
        display: flex;
        flex-direction: column;
        gap: 20px;
        align-items: center;
        text-align: center;
        position: relative;
        z-index: 2;
        width: 100%;
      }

      .cta-heading {
        font-family: 'DM Sans', sans-serif;
        font-size: 56px;
        font-weight: 500;
        line-height: 67.2px;
        color: #FFFFFF;
        text-transform: capitalize;
        letter-spacing: -1.68px;
        max-width: 992px;
        width: 100%;
        margin: 0;
        font-variation-settings: 'opsz' 14;
      }

      .cta-subheading {
        font-family: 'DM Sans', sans-serif;
        font-size: 20px;
        font-weight: 400;
        line-height: 24px;
        color: #bdbdbd;
        max-width: 600px;
        font-variation-settings: 'opsz' 9;
        text-align: center;
        margin: 0;
      }

      .cta-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 20px;
        background-color: rgba(13, 76, 244, 1);
        color: #FFFFFF;
        font-family: 'DM Sans', sans-serif;
        font-size: 16px;
        font-weight: 600;
        line-height: 19.2px;
        border: 1px solid rgba(13, 76, 244, 1);
        border-radius: 4px;
        box-shadow: 0px 0px 50px 0px rgba(37, 97, 227, 0.5);
        cursor: pointer;
        text-decoration: none;
        transition: background-color 0.2s;
        font-variation-settings: 'opsz' 14;
      }

      .cta-btn:hover {
        background-color: #1A5FD4;
      }

      /* ── Orb animation ── */
      .cta-orb-wrap {
        position: relative;
        width: 350px;
        height: 350px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 10px auto 0;
        flex-shrink: 0;
      }

      /* Outer ambient radial glow (big, soft, deep blue) */
      .cta-orb-glow--outer {
        position: absolute;
        inset: -48%;
        background: radial-gradient(
          ellipse at center,
          rgba(37, 97, 227, 0.40) 0%,
          rgba(20, 60, 180, 0.20) 35%,
          rgba(6, 13, 23, 0.00) 70%
        );
        border-radius: 50%;
        pointer-events: none;
        filter: blur(8px);
      }

      /* Inner concentrated glow (smaller, brighter) */
      .cta-orb-glow--inner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 280px;
        height: 280px;
        background: radial-gradient(
          ellipse at center,
          rgba(130, 180, 255, 0.55) 0%,
          rgba(37, 97, 227, 0.30) 40%,
          rgba(6, 13, 23, 0.00) 75%
        );
        border-radius: 50%;
        pointer-events: none;
        filter: blur(4px);
      }

      /* Frosted-glass card */
      .cta-orb-glass {
        position: relative;
        z-index: 2;
        width: 155px;
        height: 155px;
        border-radius: 38px;
        background: rgba(138, 170, 255, 0.30);
        border: 0.42px solid rgba(255, 255, 255, 0.40);
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
        box-shadow:
          0px 3.4px 59px 0px rgba(255, 255, 255, 0.25),
          inset 1.68px -1.68px 0px 0px rgba(160, 227, 255, 0.49);
        transform: rotate(3.75deg) skewX(7.54deg) scaleY(0.99);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .cta-orb-glass iframe {
        width: 220px;
        height: 220px;
        border: none;
        pointer-events: auto;
        /* Scale the animation down to fit inside the card */
        transform: scale(0.65);
        transform-origin: center center;
        flex-shrink: 0;
      }

      /* Cursor accent */
      .cta-orb-cursor {
        position: absolute;
        right: -14px;
        bottom: 76px;
        z-index: 3;
        opacity: 0.7;
        pointer-events: none;
      }

      /* ===== FOOTER CARD ===== */
      .footer-card {
        width: 100%;
        background: #060D17;
        border-radius: 8px;
        overflow: hidden;
        position: relative;
      }

      .footer-inner {
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
        padding: 40px 20px 0;
        display: flex;
        flex-direction: column;
        gap: 146px;
        position: relative;
        z-index: 2;
      }

      .footer-content {
        display: flex;
        flex-direction: column;
        gap: 28px;
        width: 100%;
      }

      .footer-links-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        width: 100%;
      }

      .footer-left {
        display: flex;
        flex-direction: column;
        gap: 40px;
      }

      .footer-logo {
        width: 68.17px;
        height: 20px;
        display: block;
        cursor: pointer;
        text-decoration: none;
      }

      .footer-logo svg {
        width: 100%;
        height: 100%;
      }

      .footer-logo svg path {
        fill: white;
      }

      .footer-social {
        display: flex;
        gap: 12px;
      }

      .footer-social-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: #0a1526;
        border-radius: 8px;
        text-decoration: none;
      }

      .footer-social-icon svg {
        width: 20px;
        height: 20px;
      }

      .footer-social-icon svg path {
        fill: white;
        transition: fill 0.3s ease;
      }

      .footer-social-icon:hover svg path {
        fill: #FF7B0A;
      }

      .footer-right {
        display: flex;
        gap: 72px;
      }

      .footer-link-col {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .footer-link-label {
        font-family: 'DM Sans', sans-serif;
        font-size: 14px;
        font-weight: 300;
        line-height: 16.8px;
        color: #bdbdbd;
        padding: 8px 14px;
        font-variation-settings: 'opsz' 9;
      }

      .footer-link {
        font-family: 'DM Sans', sans-serif;
        font-size: 14px;
        font-weight: 400;
        line-height: 16.8px;
        color: white;
        text-decoration: none;
        padding: 8px 14px;
        border-radius: 12px;
        transition: opacity 0.2s;
      }

      .footer-link:hover {
        opacity: 0.7;
      }

      .footer-bottom-row {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        width: 100%;
      }

      .footer-badges {
        display: flex;
        align-items: center;
        gap: 40px;
      }

      .footer-iso {
        width: 68px;
        height: 68px;
        border-radius: 50%;
        border: 1.5px solid rgba(255, 255, 255, 0.25);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .footer-iso-top {
        font-family: 'DM Sans', sans-serif;
        font-size: 19.4px;
        font-weight: 500;
        line-height: 23.3px;
        color: white;
      }

      .footer-iso-btm {
        font-family: 'DM Sans', sans-serif;
        font-size: 13px;
        font-weight: 500;
        line-height: 15.5px;
        color: white;
      }

      .footer-gartner {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .footer-gartner-top {
        font-family: 'DM Sans', sans-serif;
        font-size: 20px;
        font-weight: 700;
        color: white;
        line-height: 1.2;
      }

      .footer-gartner-btm {
        display: flex;
        align-items: baseline;
        gap: 4px;
      }

      .footer-gartner-peer {
        font-family: 'DM Sans', sans-serif;
        font-size: 22px;
        font-weight: 300;
        color: white;
      }

      .footer-gartner-insights {
        font-family: 'DM Sans', sans-serif;
        font-size: 22px;
        font-weight: 300;
        color: #4db8b8;
      }

      .footer-gartner-tm {
        font-size: 10px;
        color: #4db8b8;
        vertical-align: super;
      }

      .footer-contact {
        display: flex;
        align-items: center;
        gap: 24px;
      }

      .footer-contact-text {
        font-family: 'DM Sans', sans-serif;
        font-size: 18px;
        font-weight: 300;
        line-height: 24px;
        color: white;
      }

      /* Watermark */
      .footer-watermark {
        position: relative;
        z-index: 1;
        width: 100%;
        display: flex;
        justify-content: center;
        overflow: hidden;
        cursor: pointer;
      }

      .footer-watermark svg {
        width: 100%;
        max-width: 1280px;
        height: auto;
        margin-top: 146px;
      }

      .footer-watermark svg path {
        fill: #0a1526;
        transition: fill 0.4s ease;
      }

      .footer-watermark:hover svg path {
        fill: #FF7B0A;
      }

      .footer-fade {
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 2048px;
        height: 318px;
        background: linear-gradient(to bottom, rgba(6, 13, 23, 0), #060d17);
        pointer-events: none;
        z-index: 3;
      }

      /* ===== RESPONSIVE — Tablet (≤991px) ===== */
      @media (max-width: 991px) {
        .cta-footer-section { margin-top: 56px; }

        .cta-heading {
          font-size: 40px;
          line-height: 48px;
          letter-spacing: -1.2px;
        }

        .cta-orb-wrap {
          width: 280px;
          height: 280px;
        }

        .cta-orb-glow--inner {
          width: 220px;
          height: 220px;
        }

        .cta-orb-glass {
          width: 128px;
          height: 128px;
          border-radius: 30px;
        }

        .footer-inner { gap: 80px; }
        .footer-right { gap: 48px; }
        .footer-contact-text { font-size: 16px; }
      }

      /* ===== RESPONSIVE — Mobile (≤767px) ===== */
      @media (max-width: 767px) {
        .cta-footer-section {
          padding: 0 16px 16px;
          margin-top: 48px;
        }

        .cta-card { padding: 0; }

        .cta-inner { padding: 40px 16px 0; }

        .cta-heading {
          font-size: 26px;
          line-height: 31.2px;
          letter-spacing: -0.78px;
        }

        .cta-subheading {
          font-size: 12px;
          line-height: 15.4px;
        }

        .cta-btn {
          padding: 8px 14px;
          font-size: 14px;
        }

        .cta-orb-wrap {
          width: 200px;
          height: 200px;
          margin-top: 8px;
        }

        .cta-orb-glow--outer { filter: blur(6px); }

        .cta-orb-glow--inner {
          width: 160px;
          height: 160px;
        }

        .cta-orb-glass {
          width: 90px;
          height: 90px;
          border-radius: 22px;
        }

        .cta-orb-glass iframe {
          width: 160px;
          height: 160px;
          transform: scale(0.55);
        }

        .cta-orb-cursor { display: none; }

        .footer-inner {
          gap: 50px;
          padding: 16px 16px 0;
        }

        .footer-content { gap: 40px; }

        .footer-links-row {
          flex-direction: column;
          gap: 40px;
        }

        .footer-left { gap: 28px; }

        .footer-right {
          gap: 40px;
          width: 100%;
        }

        .footer-bottom-row {
          flex-direction: column;
          gap: 32px;
          align-items: flex-start;
        }

        .footer-badges { gap: 28px; }

        .footer-iso {
          width: 51px;
          height: 51px;
        }

        .footer-iso-top { font-size: 14.6px; }
        .footer-iso-btm { font-size: 9.7px; }

        .footer-gartner-top { font-size: 16px; }

        .footer-gartner-peer,
        .footer-gartner-insights { font-size: 18px; }

        .footer-contact { gap: 16px; }
        .footer-contact-text { font-size: 12px; }

        .footer-fade {
          height: 200px;
          width: 1200px;
        }
      }

      /* ===== RESPONSIVE — Small mobile (≤480px) ===== */
      @media (max-width: 480px) {
        .cta-orb-wrap {
          width: 180px;
          height: 180px;
        }

        .cta-orb-glass {
          width: 80px;
          height: 80px;
          border-radius: 18px;
        }

        .footer-logo { width: 60px; height: 18px; }

        .footer-social-icon {
          width: 32px;
          height: 32px;
        }

        .footer-social-icon svg {
          width: 16px;
          height: 16px;
        }

        .footer-link-label,
        .footer-link {
          font-size: 13px;
          padding: 6px 10px;
        }

        .footer-fade {
          height: 120px;
          width: 800px;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  // ===== INITIALIZE =====
  function init() {
    const container = document.getElementById('cta-footer-2');
    if (!container) {
      console.warn('NuaCtaFooter2: No element with id="cta-footer-2" found.');
      return;
    }

    const config = {
      heading:   container.dataset.heading,
      subheading: container.dataset.subheading,
      ctaText:   container.dataset.ctaText,
      ctaLink:   container.dataset.ctaLink,
      showCta:   container.dataset.showCta !== 'false',
      email:     container.dataset.email,
      copyright: container.dataset.copyright
    };

    // Remove undefined values so defaults apply
    Object.keys(config).forEach(k => {
      if (config[k] === undefined) delete config[k];
    });

    injectStyles();
    container.innerHTML = generateHTML(config);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.NuaCtaFooter2 = { init, render: generateHTML };

})();
