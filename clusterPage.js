// cluster.js - Extension Chrome complète pour améliorer l'UI des clusters 42
// Version 1.3 - Gestion des places Laptop (Gris clair) + Places sans numéro (Gris foncé)
// Installation : chrome://extensions/ → Mode développeur → Charger l'extension

// ============================================
// 1. LOGIQUE PRINCIPALE
// ============================================
(function() {
    'use strict';

    let debounceTimer;

    // ============================================
    // A. STYLES CSS
    // ============================================
    const styles = `
    /* --- Container Global --- */
    .flex-item {
      background: #f7fafc !important;
      border-radius: 12px !important;
      padding: 20px !important;
      box-shadow: none !important;
      margin: 20px !important;
    }

    /* --- Onglets --- */
    .nav-pills {
      background: white !important;
      border-radius: 10px !important;
      padding: 6px !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important;
      display: flex !important;
      gap: 6px !important;
      margin-bottom: 16px !important;
      border: 1px solid #e2e8f0 !important;
    }

    .nav-pills > li > a {
      color: #4a5568 !important;
      font-weight: 600 !important;
      padding: 12px 32px !important;
      border-radius: 8px !important;
      transition: all 0.3s ease !important;
      border: none !important;
      background: transparent !important;
    }

    .nav-pills > li > a:hover {
      background: rgba(102, 126, 234, 0.1) !important;
      color: #667eea !important;
      transform: translateY(-2px) !important;
    }

    .nav-pills > li.active > a {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3) !important;
    }

    /* --- Carte --- */
    .map-container {
      background: white !important;
      border-radius: 10px !important;
      padding: 24px !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important;
      overflow: auto !important;
      max-height: 85vh !important;
      border: 1px solid #e2e8f0 !important;
    }

    /* --- 1. Postes iMac (Standard) --- */
    .posts rect {
      stroke: #3182ce !important;
      stroke-width: 2 !important;
      fill: #4299e1 !important;
      transition: all 0.3s ease !important;
      cursor: pointer !important;
      rx: 3 !important;
      ry: 3 !important;
    }

    .posts rect:hover {
      fill: #2b6cb0 !important;
      stroke: #2c5282 !important;
      stroke-width: 3 !important;
      filter: drop-shadow(0 4px 8px rgba(49, 130, 206, 0.4)) !important;
    }

    .posts rect.used {
      fill: #48bb78 !important;
      stroke: #38a169 !important;
      animation: pulse-cluster 2s infinite !important;
    }

    .posts rect.used:hover {
      fill: #68d391 !important;
      stroke: #2f855a !important;
    }

    .posts rect.my-location {
      fill: #f56565 !important;
      stroke: #e53e3e !important;
      animation: glow-cluster 1.5s infinite !important;
    }

    /* --- 2. PLACES LAPTOP (Gris Clair) --- */
    .posts rect.laptop-spot {
      fill: #edf2f7 !important;     /* Gris très clair */
      stroke: #cbd5e0 !important;   /* Bordure grise */
      stroke-width: 1.5 !important;
      stroke-dasharray: 4 !important;
      cursor: default !important;
      animation: none !important;
    }
    
    .posts rect.laptop-spot:hover {
      fill: #e2e8f0 !important;
      filter: none !important;
      transform: none !important;
    }

    /* --- 3. PLACES MORTES / SANS NUMÉRO (Gris Foncé) --- */
    /* Pour les ID '----' */
    .posts rect.dead-spot {
      fill: #2d3748 !important;     /* Gris Foncé */
      stroke: #1a202c !important;   /* Bordure presque noire */
      stroke-width: 1 !important;
      cursor: not-allowed !important; /* Curseur interdit */
      opacity: 0.6 !important;
      animation: none !important;
    }
    .posts rect.dead-spot:hover {
      fill: #1a202c !important;
      filter: none !important;
      transform: none !important;
    }

    /* --- Labels (Numéros de poste) --- */
    .post-label {
      fill: white !important;
      font-size: 8px !important;
      font-weight: 700 !important;
      pointer-events: none !important;
      text-anchor: middle !important;
      dominant-baseline: middle !important;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
    }

    .post-label.laptop-text {
      fill: #718096 !important;
      text-shadow: none !important;
      font-weight: 600 !important;
    }

    /* --- Animations & UI --- */
    @keyframes pulse-cluster {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
    @keyframes glow-cluster {
      0%, 100% { filter: drop-shadow(0 0 8px #f56565); }
      50% { filter: drop-shadow(0 0 15px #f56565); }
    }
    
    .posts image {
      cursor: pointer !important;
      transition: all 0.3s ease !important;
      border-radius: 3px !important;
    }
    .posts image:hover {
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3)) !important;
    }
    
    text[fill="#b2b2b2"] { fill: #718096 !important; font-weight: 600 !important; font-size: 11px !important; }
    .text text[fill="#cccccc"] { fill: #4a5568 !important; font-weight: 700 !important; }
    .map-container svg { background: transparent !important; border-radius: 8px !important; }

    /* --- Tooltip --- */
    .cluster-tooltip {
      position: fixed;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      pointer-events: none;
      z-index: 10000;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .cluster-tooltip.show { opacity: 1; }

    /* --- Info Bar --- */
    .cluster-info-bar {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      padding: 12px 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .cluster-info-section { display: flex; align-items: center; gap: 24px; }
    .info-item { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; }
    .info-icon { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    
    .info-icon.available { background: #4299e1; box-shadow: 0 0 8px rgba(66, 153, 225, 0.4); }
    .info-icon.occupied { background: #48bb78; box-shadow: 0 0 8px rgba(72, 187, 120, 0.4); }
    .info-icon.you { background: #f56565; box-shadow: 0 0 8px rgba(245, 101, 101, 0.4); }
    
    .info-value { color: #2d3748; font-weight: 700; }
    .stat-badge {
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
  `;

    // ============================================
    // B. FONCTIONS UTILITAIRES
    // ============================================

    function injectStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }

    function isLaptopSpot(id) {
        if (!id) return false;
        return /^z[1-4]r1p/.test(id);
    }

    function getGradient(rate) {
        if (rate > 90) return 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)';
        if (rate > 70) return 'linear-gradient(135deg, #dd6b20 0%, #c05621 100%)';
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    // ============================================
    // C. CORE LOGIC
    // ============================================

    function updateUI() {
        // Nettoyer l'interface
        const oldBar = document.querySelector('.cluster-info-bar');
        if (oldBar) oldBar.remove();
        document.querySelectorAll('.post-label').forEach(el => el.remove());

        // --- 1. PARCOURS DES RECTANGLES ---
        const allRects = document.querySelectorAll('.posts rect');
        let iMacCount = 0;
        let usedImacCount = 0;

        allRects.forEach(rect => {
            const id = rect.getAttribute('id');

            // CAS 1: Place Morte / Sans numéro (----)
            if (!id || id === '----') {
                rect.classList.add('dead-spot');
                rect.classList.remove('used');
                // On arrête ici pour cette place (pas de label, pas de stats)
                return;
            }

            // CAS 2: Place Laptop (Gris Clair)
            if (isLaptopSpot(id)) {
                rect.classList.add('laptop-spot');
                rect.classList.remove('used');
                rect.classList.remove('dead-spot');
            }
            // CAS 3: Vrai iMac (Bleu/Vert)
            else {
                rect.classList.remove('laptop-spot');
                rect.classList.remove('dead-spot');
                iMacCount++;

                if (rect.classList.contains('used')) {
                    usedImacCount++;
                }
            }

            // --- 2. AJOUT DES LABELS (Seulement si ID valide) ---
            const x = parseFloat(rect.getAttribute('x'));
            const y = parseFloat(rect.getAttribute('y'));
            const width = parseFloat(rect.getAttribute('width'));
            const height = parseFloat(rect.getAttribute('height'));

            // On n'ajoute pas de texte si c'est une place morte, sauf si l'ID existe mais est cassé
            const postNumberMatch = id.match(/p(\d+)$/);

            if (postNumberMatch) {
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', x + width / 2);
                label.setAttribute('y', y + height / 2);

                const labelClass = isLaptopSpot(id) ? 'post-label laptop-text' : 'post-label';
                label.setAttribute('class', labelClass);
                label.textContent = postNumberMatch[1];

                rect.parentNode.appendChild(label);
            }
        });

        // --- 3. BARRE D'INFO ---
        const availableSeats = iMacCount - usedImacCount;
        const occupancyRate = iMacCount > 0
            ? ((usedImacCount / iMacCount) * 100).toFixed(0)
            : 0;

        const infoBar = document.createElement('div');
        infoBar.className = 'cluster-info-bar';
        infoBar.innerHTML = `
      <div class="cluster-info-section">
        <div class="info-item">
          <span class="info-icon available"></span>
          <span class="info-label">iMac Dispo</span>
        </div>
        <div class="info-item">
          <span class="info-icon occupied"></span>
          <span class="info-label">Occupé</span>
        </div>
        <div class="info-item">
          <span class="info-icon you"></span>
          <span class="info-label">Vous</span>
        </div>
        <div class="info-item" style="opacity: 0.6; margin-left: 8px;">
          <span style="border: 1px dashed #cbd5e0; width: 10px; height: 10px; display: inline-block; background: #edf2f7; border-radius: 2px; margin-right: 4px;"></span>
          <span class="info-label" style="font-size: 12px;">Laptop</span>
        </div>
      </div>
      <div class="cluster-info-section">
        <div class="info-item">
          <span class="info-value">${availableSeats}</span>
          <span class="info-label">postes libres</span>
        </div>
        <div class="stat-badge" style="background: ${getGradient(occupancyRate)}">
          ${occupancyRate}% occupé
        </div>
      </div>
    `;

        const navPills = document.querySelector('.nav-pills');
        if (navPills) {
            navPills.parentNode.insertBefore(infoBar, navPills);
        }

        addTooltips();
    }

    // --- 4. TOOLTIPS ---
    function addTooltips() {
        let tooltip = document.querySelector('.cluster-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'cluster-tooltip';
            document.body.appendChild(tooltip);
        }

        document.querySelectorAll('.posts image[data-tooltip-login]').forEach(img => {
            img.onmouseenter = function() {
                tooltip.textContent = `👤 ${this.getAttribute('data-tooltip-login')}`;
                tooltip.classList.add('show');
            };
            img.onmousemove = (e) => {
                tooltip.style.left = (e.pageX + 10) + 'px';
                tooltip.style.top = (e.pageY + 10) + 'px';
            };
            img.onmouseleave = () => tooltip.classList.remove('show');
        });

        document.querySelectorAll('.posts rect').forEach(rect => {
            // Pas de tooltip pour les places déjà occupées par quelqu'un (le rect est sous l'image)
            if (rect.classList.contains('used') && !rect.classList.contains('dead-spot')) return;

            rect.onmouseenter = function() {
                const id = this.getAttribute('id');
                let text = '';

                if (!id || id === '----') {
                    text = '🚫 Place indisponible';
                } else if (isLaptopSpot(id)) {
                    text = `💻 Zone Laptop ${id}`;
                } else {
                    text = `📍 Poste iMac ${id}`;
                }

                if (text) {
                    tooltip.textContent = text;
                    tooltip.classList.add('show');
                }
            };
            rect.onmousemove = (e) => {
                tooltip.style.left = (e.pageX + 10) + 'px';
                tooltip.style.top = (e.pageY + 10) + 'px';
            };
            rect.onmouseleave = () => tooltip.classList.remove('show');
        });
    }

    // ============================================
    // D. INITIALISATION
    // ============================================
    function init() {
        if (!document.querySelector('.map-container')) return;

        console.log('🚀 42 Cluster UI v1.3 Active');
        injectStyles();

        setTimeout(updateUI, 500);

        document.querySelectorAll('.nav-pills a').forEach(tab => {
            tab.addEventListener('click', () => setTimeout(updateUI, 400));
        });

        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            mutations.forEach(m => {
                if (m.addedNodes.length || m.removedNodes.length) shouldUpdate = true;
            });

            if (shouldUpdate) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(updateUI, 200);
            }
        });

        const container = document.querySelector('.tab-content');
        if (container) {
            observer.observe(container, { childList: true, subtree: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();