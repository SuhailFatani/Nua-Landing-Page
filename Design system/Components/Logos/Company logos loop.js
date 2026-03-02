/**
 * =====================================================
 * NUA COMPANY LOGOS LOOP COMPONENT
 * =====================================================
 *
 * Usage:
 * 1. Add the script at the end of the page before </body>:
 *    <script src="../Components/Logos/Company logos loop.js"></script>
 *
 * 2. Add a div where you want the logo marquee to appear:
 *    <div id="logo-marquee"></div>
 *
 * 3. (Optional) Customize:
 *    <div id="logo-marquee"
 *         data-heading="Custom heading text"
 *         data-assets-path="../assets/"
 *         data-theme="dark"
 *         data-speed="20">
 *    </div>
 *
 * Themes:
 *   - "dark"  (default) — white text, dark fade edges (for dark backgrounds)
 *   - "light" — dark text, white fade edges (for light backgrounds)
 *
 * =====================================================
 */

(function() {
  'use strict';

  // ===== DEFAULT CONFIGURATION =====
  const defaultConfig = {
    heading: 'Powering Offensive Security For Industry Leaders',
    assetsPath: '../assets/',
    theme: 'dark',
    speed: 20,
    logos: [
      { file: 'Zid.svg', alt: 'Zid', height: 28 },
      { file: 'IOT.svg', alt: 'IOT', height: 24 },
      { file: 'Jahez.svg', alt: 'Jahez', height: 24 },
      { file: 'Zakat.svg', alt: 'Zakat, Tax and Customs Authority', height: 32 },
      { file: 'STC.svg', alt: 'stc', height: 24 },
      { file: 'Qiddiya.svg', alt: 'Qiddiya', height: 48 },
      { file: 'Tamara.svg', alt: 'Tamara', height: 24 },
      { file: 'Ministry of sport.svg', alt: 'Ministry of Sport', height: 33 },
      { file: 'Elm.svg', alt: 'Elm', height: 34 },
      { file: 'AlibabaCloud.svg', alt: 'Alibaba Cloud', height: 24 },
      { file: 'MoEnergy.svg', alt: 'Ministry of Energy', height: 33 },
      { file: 'FGS.svg', alt: 'FGS Global', height: 28 }
    ]
  };

  // ===== GENERATE HTML =====
  function generateMarqueeHTML(config) {
    const cfg = { ...defaultConfig, ...config };
    const basePath = cfg.assetsPath.endsWith('/') ? cfg.assetsPath : cfg.assetsPath + '/';
    const themeClass = cfg.theme === 'light' ? ' logos-theme-light' : '';

    const logoItems = cfg.logos.map(logo =>
      `<div class="logo-item"><img src="${basePath}${logo.file}" alt="${logo.alt}" style="height: ${logo.height}px; width: auto;"></div>`
    ).join('\n            ');

    return `
      <div class="logos-section${themeClass}">
        <div class="logos-text">
          <h3>${cfg.heading}</h3>
        </div>
        <div class="logos-marquee-wrapper">
          <div class="logos-track" style="animation-duration: ${cfg.speed}s;">
            <!-- First set -->
            ${logoItems}

            <!-- Duplicate set for seamless loop -->
            ${logoItems}
          </div>
        </div>
      </div>
    `;
  }

  // ===== INJECT CSS =====
  function injectStyles() {
    if (document.getElementById('logo-marquee-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'logo-marquee-styles';
    styles.textContent = `
      /* ===== LOGO MARQUEE COMPONENT STYLES ===== */

      .logos-section {
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
        height: 100px;
        position: relative;
        overflow: hidden;
      }

      .logos-text {
        flex-shrink: 0;
        width: 264px;
        z-index: 2;
      }

      .logos-text h3 {
        font-family: 'DM Sans', sans-serif;
        font-size: 16px;
        font-weight: 300;
        line-height: 20px;
        color: #FFFFFF;
        opacity: 0.85;
        margin: 0;
      }

      .logos-marquee-wrapper {
        flex: 1;
        overflow: hidden;
        position: relative;
        height: 68px;
        display: flex;
        align-items: center;
        margin-left: 40px;
      }

      /* Fade masks on edges */
      .logos-marquee-wrapper::before,
      .logos-marquee-wrapper::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        width: 80px;
        z-index: 3;
        pointer-events: none;
      }

      .logos-marquee-wrapper::before {
        left: 0;
        background: linear-gradient(to right, #060d17, transparent);
      }

      .logos-marquee-wrapper::after {
        right: 0;
        background: linear-gradient(to left, #060d17, transparent);
      }

      .logos-track {
        display: flex;
        align-items: center;
        gap: 60px;
        animation: scroll-logos 20s linear infinite;
        white-space: nowrap;
      }

      @keyframes scroll-logos {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-50%);
        }
      }

      .logo-item {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        opacity: 0.55;
      }

      .logo-item img {
        height: 28px;
        width: auto;
        display: block;
      }

      /* ===== LIGHT THEME ===== */
      .logos-theme-light .logos-text h3 {
        color: #1E1E1E;
        opacity: 0.65;
      }

      .logos-theme-light .logos-marquee-wrapper::before {
        background: linear-gradient(to right, #FFFFFF, transparent);
      }

      .logos-theme-light .logos-marquee-wrapper::after {
        background: linear-gradient(to left, #FFFFFF, transparent);
      }

      .logos-theme-light .logo-item {
        opacity: 0.45;
      }

      .logos-theme-light .logo-item img {
        filter: grayscale(100%) brightness(0) invert(62%) sepia(5%) saturate(10%) hue-rotate(345deg) brightness(92%) contrast(87%);
        transition: filter 0.3s ease;
      }

      .logos-theme-light .logo-item img:hover {
        filter: none;
      }

      /* ===== RESPONSIVE ===== */
      @media (max-width: 991px) {
        .logos-section {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
          height: auto;
        }

        .logos-text {
          width: 100%;
        }

        .logos-marquee-wrapper {
          width: 100%;
          margin-left: 0;
        }
      }

      @media (max-width: 767px) {
        .logos-marquee-wrapper {
          height: 56px;
        }

        .logos-track {
          gap: 36px;
        }
      }

      @media (max-width: 480px) {
        .logos-text h3 {
          font-size: 14px;
          line-height: 20px;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  // ===== INITIALIZE COMPONENT =====
  function init() {
    const container = document.getElementById('logo-marquee');
    if (!container) {
      console.warn('Logo-Marquee: No element with id="logo-marquee" found.');
      return;
    }

    // Get custom configuration from data attributes
    const config = {};
    if (container.dataset.heading) config.heading = container.dataset.heading;
    if (container.dataset.assetsPath) config.assetsPath = container.dataset.assetsPath;
    if (container.dataset.theme) config.theme = container.dataset.theme;
    if (container.dataset.speed) config.speed = parseInt(container.dataset.speed, 10);

    // Inject styles
    injectStyles();

    // Generate and insert HTML
    container.innerHTML = generateMarqueeHTML(config);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for manual initialization
  window.NuaLogoMarquee = {
    init: init,
    render: generateMarqueeHTML
  };

})();
