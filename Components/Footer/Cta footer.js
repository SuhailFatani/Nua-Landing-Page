/**
 * =====================================================
 * NUA CTA + FOOTER COMPONENT
 * =====================================================
 * 
 * استخدام الكومبوننت:
 * 1. أضف السكريبت في نهاية الصفحة قبل </body>:
 *    <script src="components/cta-footer.js"></script>
 * 
 * 2. أضف div فاضي في المكان اللي تبي الـ Footer يظهر فيه:
 *    <div id="cta-footer"></div>
 * 
 * 3. (اختياري) تخصيص المحتوى:
 *    <div id="cta-footer" 
 *         data-heading="عنوان مخصص"
 *         data-subheading="وصف مخصص"
 *         data-cta-text="نص الزر"
 *         data-cta-link="رابط الزر"
 *         data-show-cta="true">
 *    </div>
 * 
 * =====================================================
 */

(function() {
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
        { label: 'Company', href: 'company.html' },
        { label: 'Services', href: 'services.html' },
        { label: 'Pricing', href: 'pricing.html' },
        { label: 'Career', href: '#' }
      ],
      resourceLinks: [
        { label: 'Blogs', href: 'blog.html' }
      ]
    };
  
    // ===== SVG ICONS =====
    const icons = {
      nuaLogo: `<svg preserveAspectRatio="none" viewBox="0 0 68.1635 19.96" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g>
          <g>
            <path d="M9.53674e-05 5.06259H5.02596V19.96H9.53674e-05V5.12801C9.53674e-05 5.10598 9.53674e-05 5.08462 9.53674e-05 5.06259Z"/>
            <path d="M23.2637 19.96H17.6177L10.0238 5.09799C10.0125 5.07596 9.98976 5.06261 9.96507 5.06261H5.02665V0.00069738C5.04867 2.98458e-05 5.0707 2.98464e-05 5.09273 2.98464e-05H9.96507C11.8869 2.98464e-05 13.6245 1.09812 14.4996 2.80968L23.2637 19.96Z"/>
          </g>
          <path d="M59.4134 2.80967C58.5383 1.09811 56.8007 1.33682e-05 54.8788 1.33682e-05H50.0072C49.9851 1.33682e-05 49.9624 1.33676e-05 49.9404 0.000680902L49.9404 5.0626H54.8788C54.9035 5.0626 54.9262 5.07595 54.9376 5.09798L57.6157 10.3341L49.9404 13.9949V5.0626H44.9145C44.9139 5.08463 44.9139 5.10665 44.9139 5.12868L44.9052 19.96H49.9317L59.9301 14.8593L62.5174 19.96H68.1634L59.4134 2.80967Z"/>
          <g>
            <path d="M30.9149 14.9735H35.8527L35.8467 19.96C35.8246 19.96 35.8019 19.96 35.7799 19.96H30.9089C30.6339 19.96 30.3642 19.9386 30.0985 19.8959C28.5078 19.6429 27.13 18.693 26.3797 17.2264L17.5709 0.000699361H23.2162L30.8555 14.9381C30.8668 14.9601 30.8895 14.9735 30.9149 14.9735Z"/>
            <path d="M40.8801 0.000686646V14.9081C40.8801 14.9301 40.8801 14.9521 40.8794 14.9735H35.8529V0.000686646H40.8801Z"/>
          </g>
        </g>
      </svg>`,
      
      twitter: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.27 1.59h2.97l-6.49 7.42 7.63 10.09h-5.98l-4.68-6.13-5.36 6.13H.39l6.94-7.93L0 1.59h6.13l4.23 5.6 4.91-5.6Zm-1.04 15.72h1.64L5.88 3.27H4.12l10.11 14.04Z" fill="white"/>
      </svg>`,
      
      linkedin: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.52 0H1.48C.66 0 0 .645 0 1.44v17.12C0 19.355.66 20 1.48 20h17.04c.82 0 1.48-.645 1.48-1.44V1.44C20 .645 19.34 0 18.52 0ZM5.93 17.04H2.96V7.5h2.97v9.54ZM4.45 6.2a1.72 1.72 0 110-3.44 1.72 1.72 0 010 3.44Zm12.59 10.84h-2.97v-4.64c0-1.11-.02-2.53-1.54-2.53-1.54 0-1.78 1.2-1.78 2.45v4.72H7.78V7.5h2.85v1.3h.04c.4-.75 1.37-1.54 2.81-1.54 3.01 0 3.56 1.98 3.56 4.55v5.23Z" fill="white"/>
      </svg>`
    };
  
    // ===== GENERATE HTML =====
    function generateCtaFooterHTML(config) {
      const cfg = { ...defaultConfig, ...config };
      
      // Generate navigation links
      const navLinksHTML = cfg.navLinks.map(link => 
        `<a href="${link.href}" class="footer-link">${link.label}</a>`
      ).join('');
      
      // Generate resource links
      const resourceLinksHTML = cfg.resourceLinks.map(link => 
        `<a href="${link.href}" class="footer-link">${link.label}</a>`
      ).join('');
  
      // CTA Section (optional)
      const ctaSectionHTML = cfg.showCta ? `
        <!-- CTA Card -->
        <div class="cta-card">
          <div class="cta-inner">
            <div class="cta-text-block">
              <h2 class="cta-heading">${cfg.heading}</h2>
              <p class="cta-subheading">${cfg.subheading}</p>
              <a href="${cfg.ctaLink}" class="cta-btn">${cfg.ctaText}</a>
            </div>
            <!-- Shax Lottie Animation -->
            <div class="cta-shax-lottie">
              <iframe src="${cfg.lottieUrl}" allowtransparency="true" loading="lazy"></iframe>
            </div>
          </div>
        </div>
      ` : '';
  
      return `
        <section class="cta-footer-section">
          ${ctaSectionHTML}
  
          <!-- Footer Card -->
          <footer class="footer-card">
            <div class="footer-inner">
              <div class="footer-content">
                <!-- Links Row -->
                <div class="footer-links-row">
                  <div class="footer-left">
                    <!-- NUA Logo -->
                    <a href="index.html" class="footer-logo" aria-label="NUA Home">
                      ${icons.nuaLogo}
                    </a>
                    <!-- Social Icons -->
                    <div class="footer-social">
                      <a href="${cfg.socialLinks.twitter}" target="_blank" rel="noopener noreferrer" class="footer-social-icon" aria-label="X (Twitter)">
                        ${icons.twitter}
                      </a>
                      <a href="${cfg.socialLinks.linkedin}" target="_blank" rel="noopener noreferrer" class="footer-social-icon" aria-label="LinkedIn">
                        ${icons.linkedin}
                      </a>
                    </div>
                  </div>
                  <!-- Link Columns -->
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
  
                <!-- Bottom Row: Badges + Contact -->
                <div class="footer-bottom-row">
                  <div class="footer-badges">
                    <!-- ISO Badge -->
                    <div class="footer-iso">
                      <span class="footer-iso-top">ISO</span>
                      <span class="footer-iso-btm">27001</span>
                    </div>
                    <!-- Gartner Badge -->
                    <div class="footer-gartner">
                      <span class="footer-gartner-top">Gartner<span style="font-size:8px;vertical-align:super;">®</span></span>
                      <div class="footer-gartner-btm">
                        <span class="footer-gartner-peer">Peer</span>
                        <span class="footer-gartner-insights">Insights<span class="footer-gartner-tm">™</span></span>
                      </div>
                    </div>
                  </div>
                  <!-- Contact Info -->
                  <div class="footer-contact">
                    <span class="footer-contact-text">${cfg.email}</span>
                    <span class="footer-contact-text">${cfg.copyright}</span>
                  </div>
                </div>
              </div>
  
              <!-- Big NUA Logo Watermark -->
              <div class="footer-watermark">
                ${icons.nuaLogo}
              </div>
              <div class="footer-fade"></div>
            </div>
          </footer>
        </section>
      `;
    }
  
    // ===== INJECT CSS (if not already present) =====
    function injectStyles() {
      if (document.getElementById('cta-footer-styles')) return;
  
      const styles = document.createElement('style');
      styles.id = 'cta-footer-styles';
      styles.textContent = `
        /* ===== CTA + FOOTER COMPONENT STYLES ===== */
        
        .cta-footer-section {
          width: 100%;
          background-color: #FFFFFF;
          padding: 0 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-top: 72px;
          padding-bottom: 16px;
        }
  
        /* — CTA Card — */
        .cta-card {
          width: 100%;
          background: #060D17;
          border-radius: 9px;
          padding: 20px;
          overflow: hidden;
          position: relative;
        }
  
        .cta-inner {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          padding: 0;
        }
  
        .cta-text-block {
          display: flex;
          flex-direction: column;
          gap: 40px;
          align-items: center;
          text-align: center;
          position: relative;
          z-index: 2;
          padding-top: 56px;
          padding-bottom: 56px;
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
          width: 992px;
          max-width: 100%;
          margin: 0;
        }
  
        .cta-subheading {
          font-family: 'DM Sans', sans-serif;
          font-size: 20px;
          font-weight: 300;
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
          background-color: #0D4CF4;
          color: #FFFFFF;
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          font-weight: 500;
          line-height: 19.2px;
          border: 1px solid #0D4CF4;
          border-radius: 4px;
          box-shadow: 0px 0px 50px 0px rgba(37, 97, 227, 0.5);
          cursor: pointer;
          text-decoration: none;
          transition: background-color 0.2s;
        }
  
        .cta-btn:hover {
          background-color: #063DCD;
        }
  
        .cta-shax-lottie {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-top: -20px;
          position: relative;
          z-index: 1;
        }
  
        .cta-shax-lottie iframe {
          width: 100%;
          height: 599px;
          border: none;
          pointer-events: auto;
        }
  
        /* — Footer Card — */
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
  
        /* Footer Watermark */
        .footer-watermark {
          position: relative;
          z-index: 1;
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 0;
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
  
        /* ===== RESPONSIVE ===== */
        @media (max-width: 991px) {
          .cta-footer-section {
            margin-top: 56px;
          }
  
          .cta-heading {
            font-size: 44px;
            line-height: 52.8px;
            letter-spacing: -1px;
          }
  
          .cta-shax-lottie iframe {
            width: 320px;
            height: 320px;
          }
  
          .footer-inner {
            gap: 80px;
          }
  
          .footer-right {
            gap: 48px;
          }
  
          .footer-contact-text {
            font-size: 16px;
          }
        }
  
        @media (max-width: 767px) {
          .cta-footer-section {
            padding: 0 16px;
            margin-top: 48px;
          }
  
          .cta-card {
            padding: 16px;
          }
  
          .cta-heading {
            font-size: 32px;
            line-height: 38.4px;
            letter-spacing: 0px;
            max-width: 100%;
            width: auto;
          }
  
          .cta-subheading {
            font-size: 16px;
            line-height: 22px;
          }
  
          .cta-text-block {
            gap: 28px;
            padding-top: 40px;
            padding-bottom: 40px;
          }
  
          .cta-shax-lottie iframe {
            width: 260px;
            height: 260px;
          }
  
          .cta-btn {
            padding: 10px 16px;
            font-size: 14px;
            line-height: 16.8px;
          }
  
          .footer-inner {
            gap: 50px;
            padding: 16px 16px 0;
          }
  
          .footer-content {
            gap: 40px;
          }
  
          .footer-links-row {
            flex-direction: column;
            gap: 40px;
          }
  
          .footer-left {
            gap: 28px;
          }
  
          .footer-right {
            gap: 40px;
            width: 100%;
          }
  
          .footer-bottom-row {
            flex-direction: column;
            gap: 32px;
            align-items: flex-start;
          }
  
          .footer-badges {
            gap: 28px;
          }
  
          .footer-iso {
            width: 51px;
            height: 51px;
          }
  
          .footer-iso-top {
            font-size: 14.6px;
            line-height: 17.5px;
          }
  
          .footer-iso-btm {
            font-size: 9.7px;
            line-height: 11.7px;
          }
  
          .footer-gartner-top {
            font-size: 16px;
          }
  
          .footer-gartner-peer,
          .footer-gartner-insights {
            font-size: 18px;
          }
  
          .footer-contact {
            gap: 16px;
          }
  
          .footer-contact-text {
            font-size: 12px;
          }
  
          .footer-fade {
            height: 200px;
            width: 1200px;
          }
        }
  
        @media (max-width: 480px) {
          .cta-heading {
            font-size: 26px;
            line-height: 31.2px;
          }
  
          .cta-text-block {
            gap: 24px;
            padding-top: 32px;
            padding-bottom: 32px;
          }
  
          .cta-shax-lottie iframe {
            width: 200px;
            height: 200px;
          }
  
          .footer-inner {
            gap: 32px;
          }
  
          .footer-content {
            gap: 32px;
          }
  
          .footer-links-row {
            gap: 32px;
          }
  
          .footer-left {
            gap: 24px;
          }
  
          .footer-logo {
            width: 60px;
            height: 18px;
          }
  
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
  
          .footer-bottom-row {
            gap: 24px;
          }
  
          .footer-badges {
            gap: 20px;
          }
  
          .footer-gartner-top {
            font-size: 14px;
          }
  
          .footer-gartner-peer,
          .footer-gartner-insights {
            font-size: 15px;
          }
  
          .footer-fade {
            height: 120px;
            width: 800px;
          }
        }
      `;
      
      document.head.appendChild(styles);
    }
  
    // ===== INITIALIZE COMPONENT =====
    function init() {
      const container = document.getElementById('cta-footer');
      if (!container) {
        console.warn('CTA-Footer: No element with id="cta-footer" found.');
        return;
      }
  
      // Get custom configuration from data attributes
      const config = {
        heading: container.dataset.heading,
        subheading: container.dataset.subheading,
        ctaText: container.dataset.ctaText,
        ctaLink: container.dataset.ctaLink,
        showCta: container.dataset.showCta !== 'false',
        email: container.dataset.email,
        copyright: container.dataset.copyright
      };
  
      // Remove undefined values
      Object.keys(config).forEach(key => {
        if (config[key] === undefined) delete config[key];
      });
  
      // Inject styles
      injectStyles();
  
      // Generate and insert HTML
      container.innerHTML = generateCtaFooterHTML(config);
    }
  
    // Run on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  
    // Expose for manual initialization
    window.NuaCtaFooter = {
      init: init,
      render: generateCtaFooterHTML
    };
  
  })();