/**
 * NUA DESIGN SYSTEM — Footer Component (Variant 2: Orb Edition)
 * =====================================================================
 * Drop <div id="nua-site-footer"></div> on any page and load this script.
 * The component auto-injects footer.css + button.css and renders the
 * canonical footer: CTA heading + button + Lottie animation + links.
 *
 * Edit this file once → every page updates automatically.
 *
 * Usage:
 *   <div id="nua-site-footer"></div>
 *   <script src="../Design system/Components/Footer/footer.js"></script>
 * =====================================================================
 */
(function () {
  'use strict';

  /* ── 1. Auto-inject CSS files relative to this script ───── */
  var script = document.currentScript;
  if (script) {
    var base = script.src.substring(0, script.src.lastIndexOf('/') + 1);

    if (!document.querySelector('link[data-nua-footer]')) {
      var linkFooter = document.createElement('link');
      linkFooter.rel = 'stylesheet';
      linkFooter.setAttribute('data-nua-footer', '');
      linkFooter.href = base + '../Foundations/footer/footer.css';
      document.head.appendChild(linkFooter);
    }

    if (!document.querySelector('link[data-nua-btn]')) {
      var linkBtn = document.createElement('link');
      linkBtn.rel = 'stylesheet';
      linkBtn.setAttribute('data-nua-btn', '');
      linkBtn.href = base + '../Foundations/button/button.css';
      document.head.appendChild(linkBtn);
    }
  }

  /* ── 2. Footer HTML ──────────────────────────────────────── */
  var FOOTER_HTML = [
    '<div class="nua-ctaf-wrap">',
    '  <div class="nua-ctaf">',

    '    <!-- ── CTA Hero Zone ────────────────────────────── -->',
    '    <div class="nua-ctaf__hero">',

    '      <!-- Heading + CTA button -->',
    '      <div class="nua-ctaf__text-group">',
    '        <h2 class="nua-ctaf__heading">Be Among The First To Use Nua Cybersecurity Digital Employees</h2>',
    '        <a href="book-a-demo.html" class="nua-btn nua-btn--primary nua-btn--xl">Book a demo</a>',
    '      </div>',

    '      <!-- Lottie animation -->',
    '      <div class="nua-ctaf__lottie-wrap" aria-hidden="true">',
    '        <iframe',
    '          src="https://cdn.lottielab.com/l/59mGokKhxq8TV5.html"',
    '          class="nua-ctaf__lottie-frame"',
    '          loading="lazy"',
    '          allowtransparency="true"',
    '          scrolling="no"',
    '          frameborder="0"',
    '        ></iframe>',
    '      </div>',

    '    </div>',

    '    <!-- ── Footer Zone ──────────────────────────────── -->',
    '    <div class="nua-ctaf__footer-zone">',
    '      <div class="nua-footer__inner">',
    '        <div class="nua-footer__content">',

    '          <!-- Links row -->',
    '          <div class="nua-footer__links-row">',

    '            <!-- Brand: logo + social -->',
    '            <div class="nua-footer__brand">',
    '              <a href="index.html" class="nua-footer__logo" aria-label="NUA Home">',
    '                <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 68.1635 19.96" fill="none" xmlns="http://www.w3.org/2000/svg">',
    '                  <path d="M9.53674e-05 5.06259H5.02596V19.96H9.53674e-05V5.12801C9.53674e-05 5.10598 9.53674e-05 5.08462 9.53674e-05 5.06259Z" fill="white"/>',
    '                  <path d="M23.2637 19.96H17.6177L10.0238 5.09799C10.0125 5.07596 9.98976 5.06261 9.96507 5.06261H5.02665V0.00069738C5.04867 2.98458e-05 5.0707 2.98464e-05 5.09273 2.98464e-05H9.96507C11.8869 2.98464e-05 13.6245 1.09812 14.4996 2.80968L23.2637 19.96Z" fill="white"/>',
    '                  <path d="M59.4134 2.80967C58.5383 1.09811 56.8007 1.33682e-05 54.8788 1.33682e-05H50.0072C49.9851 1.33682e-05 49.9624 1.33676e-05 49.9404 0.000680902L49.9404 5.0626H54.8788C54.9035 5.0626 54.9262 5.07595 54.9376 5.09798L57.6157 10.3341L49.9404 13.9949V5.0626H44.9145C44.9139 5.08463 44.9139 5.10665 44.9139 5.12868L44.9052 19.96H49.9317L59.9301 14.8593L62.5174 19.96H68.1634L59.4134 2.80967Z" fill="white"/>',
    '                  <path d="M30.9149 14.9735H35.8527L35.8467 19.96C35.8246 19.96 35.8019 19.96 35.7799 19.96H30.9089C30.6339 19.96 30.3642 19.9386 30.0985 19.8959C28.5078 19.6429 27.13 18.693 26.3797 17.2264L17.5709 0.000699361H23.2162L30.8555 14.9381C30.8668 14.9601 30.8895 14.9735 30.9149 14.9735Z" fill="white"/>',
    '                  <path d="M40.8801 0.000686646V14.9081C40.8801 14.9301 40.8801 14.9521 40.8794 14.9735H35.8529V0.000686646H40.8801Z" fill="white"/>',
    '                </svg>',
    '              </a>',
    '              <div class="nua-footer__social">',
    '                <a href="https://x.com/Nuasecurity" target="_blank" rel="noopener noreferrer" class="nua-footer__social-icon" aria-label="X (Twitter)">',
    '                  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">',
    '                    <path d="M15.27 1.59h2.97l-6.49 7.42 7.63 10.09h-5.98l-4.68-6.13-5.36 6.13H.39l6.94-7.93L0 1.59h6.13l4.23 5.6 4.91-5.6Zm-1.04 15.72h1.64L5.88 3.27H4.12l10.11 14.04Z" fill="white"/>',
    '                  </svg>',
    '                </a>',
    '                <a href="https://www.linkedin.com/company/nuasecurity/" target="_blank" rel="noopener noreferrer" class="nua-footer__social-icon" aria-label="LinkedIn">',
    '                  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">',
    '                    <path d="M18.52 0H1.48C.66 0 0 .645 0 1.44v17.12C0 19.355.66 20 1.48 20h17.04c.82 0 1.48-.645 1.48-1.44V1.44C20 .645 19.34 0 18.52 0ZM5.93 17.04H2.96V7.5h2.97v9.54ZM4.45 6.2a1.72 1.72 0 110-3.44 1.72 1.72 0 010 3.44Zm12.59 10.84h-2.97v-4.64c0-1.11-.02-2.53-1.54-2.53-1.54 0-1.78 1.2-1.78 2.45v4.72H7.78V7.5h2.85v1.3h.04c.4-.75 1.37-1.54 2.81-1.54 3.01 0 3.56 1.98 3.56 4.55v5.23Z" fill="white"/>',
    '                  </svg>',
    '                </a>',
    '              </div>',
    '            </div>',

    '            <!-- Nav columns -->',
    '            <div class="nua-footer__nav">',
    '              <div class="nua-footer__nav-col">',
    '                <span class="nua-footer__nav-label">Links</span>',
    '                <a href="company.html" class="nua-footer__nav-link">Company</a>',
    '                <a href="services.html" class="nua-footer__nav-link">Services</a>',
    '                <a href="pricing.html" class="nua-footer__nav-link">Pricing</a>',
    '                <a href="#" class="nua-footer__nav-link">Career</a>',
    '                <a href="terms.html" class="nua-footer__nav-link">Terms &amp; Conditions</a>',
    '              </div>',
    '              <div class="nua-footer__nav-col">',
    '                <span class="nua-footer__nav-label">Resources</span>',
    '                <a href="blog.html" class="nua-footer__nav-link">Blogs</a>',
    '              </div>',
    '            </div>',

    '          </div>',

    '          <!-- Bottom row: badges + contact -->',
    '          <div class="nua-footer__bottom">',
    '            <div class="nua-footer__badges">',
    '              <div class="nua-footer__iso">',
    '                <span class="nua-footer__iso-top">ISO</span>',
    '                <span class="nua-footer__iso-btm">27001</span>',
    '              </div>',
    '              <div class="nua-footer__gartner">',
    '                <span class="nua-footer__gartner-top">Gartner<span style="font-size:8px;vertical-align:super;">&#174;</span></span>',
    '                <div class="nua-footer__gartner-row">',
    '                  <span class="nua-footer__gartner-peer">Peer</span>',
    '                  <span class="nua-footer__gartner-insights">Insights<span class="nua-footer__gartner-tm">&#8482;</span></span>',
    '                </div>',
    '              </div>',
    '            </div>',
    '            <div class="nua-footer__contact">',
    '              <span class="nua-footer__contact-text">info@nuasecurity.com</span>',
    '              <span class="nua-footer__contact-text">&copy; 2026 NUA USA.</span>',
    '            </div>',
    '          </div>',

    '        </div>',

    '        <!-- Watermark -->',
    '        <div class="nua-footer__watermark" aria-hidden="true">',
    '          <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 68.1635 19.96" fill="none" xmlns="http://www.w3.org/2000/svg">',
    '            <path d="M9.53674e-05 5.06259H5.02596V19.96H9.53674e-05V5.12801C9.53674e-05 5.10598 9.53674e-05 5.08462 9.53674e-05 5.06259Z"/>',
    '            <path d="M23.2637 19.96H17.6177L10.0238 5.09799C10.0125 5.07596 9.98976 5.06261 9.96507 5.06261H5.02665V0.00069738C5.04867 2.98458e-05 5.0707 2.98464e-05 5.09273 2.98464e-05H9.96507C11.8869 2.98464e-05 13.6245 1.09812 14.4996 2.80968L23.2637 19.96Z"/>',
    '            <path d="M59.4134 2.80967C58.5383 1.09811 56.8007 1.33682e-05 54.8788 1.33682e-05H50.0072C49.9851 1.33682e-05 49.9624 1.33676e-05 49.9404 0.000680902L49.9404 5.0626H54.8788C54.9035 5.0626 54.9262 5.07595 54.9376 5.09798L57.6157 10.3341L49.9404 13.9949V5.0626H44.9145C44.9139 5.08463 44.9139 5.10665 44.9139 5.12868L44.9052 19.96H49.9317L59.9301 14.8593L62.5174 19.96H68.1634L59.4134 2.80967Z"/>',
    '            <path d="M30.9149 14.9735H35.8527L35.8467 19.96C35.8246 19.96 35.8019 19.96 35.7799 19.96H30.9089C30.6339 19.96 30.3642 19.9386 30.0985 19.8959C28.5078 19.6429 27.13 18.693 26.3797 17.2264L17.5709 0.000699361H23.2162L30.8555 14.9381C30.8668 14.9601 30.8895 14.9735 30.9149 14.9735Z"/>',
    '            <path d="M40.8801 0.000686646V14.9081C40.8801 14.9301 40.8801 14.9521 40.8794 14.9735H35.8529V0.000686646H40.8801Z"/>',
    '          </svg>',
    '        </div>',
    '        <div class="nua-footer__fade"></div>',

    '      </div>',
    '    </div>',

    '  </div>',
    '</div>'
  ].join('\n');

  /* ── 3. Mount into #nua-site-footer ─────────────────────── */
  function mount() {
    var el = document.getElementById('nua-site-footer');
    if (el) el.innerHTML = FOOTER_HTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
