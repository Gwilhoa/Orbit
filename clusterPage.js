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
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      justify-content: center !important;
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

    /* Badge dans l'onglet */
    .tab-badge {
      background: rgba(255, 255, 255, 0.25);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 700;
      border: 1px solid rgba(255,255,255,0.4);
      min-width: 20px;
      text-align: center;
    }
    .nav-pills > li:not(.active) .tab-badge {
      background: #edf2f7;
      color: #4a5568;
      border: 1px solid #cbd5e0;
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

    /* --- Postes --- */
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
    .posts rect.laptop-spot {
      fill: #edf2f7 !important;
      stroke: #cbd5e0 !important;
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
    .posts rect.dead-spot {
      fill: #2d3748 !important;
      stroke: #1a202c !important;
      stroke-width: 1 !important;
      cursor: not-allowed !important;
      opacity: 0.6 !important;
      animation: none !important;
    }

    /* --- Labels --- */
    .post-label {
      fill: white !important;
      font-size: 8px !important;
      font-weight: 700 !important;
      pointer-events: none !important;
      text-anchor: middle !important;
      dominant-baseline: middle !important;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
    }

    /* --- Animations --- */
    @keyframes pulse-cluster {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
    @keyframes glow-cluster {
      0%, 100% { filter: drop-shadow(0 0 8px #f56565); }
      50% { filter: drop-shadow(0 0 15px #f56565); }
    }
    
    .posts image { cursor: pointer !important; transition: all 0.3s ease !important; border-radius: 3px !important; }
    .posts image:hover { filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3)) !important; }
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
    .info-value { color: #2d3748; font-weight: 700; }
    .stat-badge { color: white; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }

    /* ========================================= */
    /* --- NEW: LIVE BUBBLE & MODAL STYLES --- */
    /* ========================================= */
    
    .live-bubble-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
      border-radius: 50%;
      box-shadow: 0 4px 15px rgba(56, 161, 105, 0.4);
      cursor: pointer;
      z-index: 9990;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      animation: live-pulse 2s infinite;
      border: 2px solid white;
    }
    .live-bubble-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(56, 161, 105, 0.6);
    }
    .live-bubble-text {
      color: white;
      font-weight: 800;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    @keyframes live-pulse {
      0% { box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.7); }
      70% { box-shadow: 0 0 0 15px rgba(72, 187, 120, 0); }
      100% { box-shadow: 0 0 0 0 rgba(72, 187, 120, 0); }
    }

    .live-modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(26, 32, 44, 0.6);
      backdrop-filter: blur(4px);
      z-index: 9998;
      display: none;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .live-modal-overlay.open { display: flex; opacity: 1; }

    .live-modal {
      background: white;
      width: 90%;
      max-width: 500px;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      transform: translateY(20px);
      transition: transform 0.3s ease;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .live-modal-overlay.open .live-modal { transform: translateY(0); }
    
    .live-header {
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f7fafc;
    }
    .live-title { font-weight: 700; color: #2d3748; font-size: 18px; display: flex; align-items: center; gap: 8px; }
    .live-close { cursor: pointer; color: #a0aec0; font-size: 24px; line-height: 1; }
    .live-close:hover { color: #e53e3e; }

    .live-body { padding: 0; overflow-y: auto; }
    
    .live-item {
      padding: 16px 20px;
      border-bottom: 1px solid #edf2f7;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: background 0.2s;
    }
    .live-item:hover { background: #fafcff; }
    
    .live-status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .live-status-dot.on { background: #48bb78; box-shadow: 0 0 6px #48bb78; }
    .live-status-dot.off { background: #e53e3e; box-shadow: 0 0 6px #e53e3e; }
    
    .live-content { flex-grow: 1; }
    .live-line-1 { font-size: 14px; color: #2d3748; margin-bottom: 2px; }
    .live-line-1 a { color: #4299e1; font-weight: 700; text-decoration: none; }
    .live-line-1 a:hover { text-decoration: underline; }
    .live-host { background: #edf2f7; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #4a5568; margin-left: 6px; }
    .live-line-2 { font-size: 11px; color: #a0aec0; font-weight: 500; }

    /* ========================================= */
    /* --- NEW: TOAST NOTIFICATIONS STYLES --- */
    /* ========================================= */
    
    .cluster-toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10001;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none; /* Allows click-through */
    }

    .cluster-toast {
      background: white;
      border-left: 4px solid #48bb78;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 16px;
      min-width: 280px;
      display: flex;
      flex-direction: column;
      animation: toast-slide-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      pointer-events: auto;
      transition: opacity 0.3s, transform 0.3s;
    }
    
    .cluster-toast.toast-hide {
        opacity: 0;
        transform: translateX(100%);
    }

    .toast-title {
        font-weight: 800;
        font-size: 13px;
        color: #2f855a;
        margin-bottom: 4px;
        display: flex;
        justify-content: space-between;
    }
    
    .toast-message {
        font-size: 14px;
        color: #2d3748;
    }
    .toast-host {
        font-family: monospace;
        font-weight: 700;
        background: #f0fff4;
        color: #22543d;
        padding: 2px 4px;
        border-radius: 3px;
    }

    @keyframes toast-slide-in {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
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

    function getGradient(rate) {
        if (rate > 90) return 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)';
        if (rate > 70) return 'linear-gradient(135deg, #dd6b20 0%, #c05621 100%)';
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    // ============================================
    // C. EXTRACTION DES DONNÉES (SIDEBAR & MAP)
    // ============================================

    function updateTabsFromSidebar() {
        const sidebarItems = document.querySelectorAll('.cluster-sidebar-right .clusters-state li');
        const clusterStats = {};

        sidebarItems.forEach(item => {
            const codeEl = item.querySelector('code');
            if (codeEl) {
                let name = item.getAttribute('id');
                if (!name) name = item.firstChild.textContent.trim();
                const match = codeEl.textContent.match(/(\d+)/);
                if (name && match) {
                    clusterStats[name.toLowerCase()] = match[1];
                }
            }
        });

        document.querySelectorAll('.nav-pills > li > a').forEach(tab => {
            const oldBadge = tab.querySelector('.tab-badge');
            if (oldBadge) oldBadge.remove();

            const tabName = tab.textContent.trim().toLowerCase();
            Object.keys(clusterStats).forEach(key => {
                if (tabName.includes(key)) {
                    const badge = document.createElement('span');
                    badge.className = 'tab-badge';
                    badge.textContent = clusterStats[key];
                    tab.appendChild(badge);
                }
            });
        });
    }

    // ============================================
    // D. GESTION LIVE, MODAL & TOASTS
    // ============================================

    function createLiveComponents() {
        // Bouton
        if (!document.querySelector('.live-bubble-btn')) {
            const btn = document.createElement('div');
            btn.className = 'live-bubble-btn';
            btn.innerHTML = '<span class="live-bubble-text">LIVE</span>';
            btn.onclick = toggleLiveModal;
            document.body.appendChild(btn);
        }

        // Modal
        if (!document.querySelector('.live-modal-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'live-modal-overlay';
            overlay.innerHTML = `
                <div class="live-modal">
                    <div class="live-header">
                        <div class="live-title">🔴 Live Feed</div>
                        <div class="live-close">&times;</div>
                    </div>
                    <div class="live-body" id="live-feed-content"></div>
                </div>
            `;

            overlay.querySelector('.live-close').onclick = toggleLiveModal;
            overlay.onclick = (e) => {
                if (e.target === overlay) toggleLiveModal();
            };
            document.body.appendChild(overlay);
        }

        // Toast Container
        if (!document.querySelector('.cluster-toast-container')) {
            const container = document.createElement('div');
            container.className = 'cluster-toast-container';
            document.body.appendChild(container);
        }
    }

    function toggleLiveModal() {
        const overlay = document.querySelector('.live-modal-overlay');
        const contentDiv = document.getElementById('live-feed-content');

        if (!overlay) return;

        if (overlay.classList.contains('open')) {
            overlay.classList.remove('open');
            setTimeout(() => { overlay.style.display = 'none'; }, 300);
        } else {
            overlay.style.display = 'flex';
            void overlay.offsetWidth;
            overlay.classList.add('open');
            updateLiveContent(contentDiv);
        }
    }

    function updateLiveContent(container) {
        const rawItems = document.querySelectorAll('.cluster-sidebar-right .activity-list li');

        if (rawItems.length === 0) {
            container.innerHTML = '<div style="padding:20px; text-align:center; color:#a0aec0;">Aucune activité récente.</div>';
            return;
        }

        let html = '';
        rawItems.forEach(item => {
            const isOff = item.classList.contains('off');
            const statusClass = isOff ? 'off' : 'on';
            const userLink = item.querySelector('a');
            const userName = userLink ? userLink.textContent.trim() : 'Unknown';
            const userUrl = userLink ? userLink.getAttribute('href') : '#';
            const hostCode = item.querySelector('.activity-log-host');
            const hostName = hostCode ? hostCode.textContent.trim() : '???';
            const timeSmall = item.querySelector('small');
            const timeText = timeSmall ? timeSmall.textContent.trim() : '';

            html += `
                <div class="live-item">
                    <div class="live-status-dot ${statusClass}"></div>
                    <div class="live-content">
                        <div class="live-line-1">
                            <a href="${userUrl}" target="_blank">${userName}</a> 
                            <span style="color:#718096; font-size:12px;">${isOff ? 'a quitté' : 'a rejoint'}</span>
                            <span class="live-host">${hostName}</span>
                        </div>
                        <div class="live-line-2">${timeText}</div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    function showToast(user, host) {
        const container = document.querySelector('.cluster-toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'cluster-toast';
        toast.innerHTML = `
            <div class="toast-title">PLACE LIBÉRÉE !</div>
            <div class="toast-message">
                <b>${user}</b> a libéré <span class="toast-host">${host}</span>
            </div>
        `;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.classList.add('toast-hide');
            setTimeout(() => toast.remove(), 400); // Wait for transition
        }, 5000);
    }

    // ============================================
    // E. CORE MAP LOGIC
    // ============================================

    function updateUI() {
        updateTabsFromSidebar();

        const oldBar = document.querySelector('.cluster-info-bar');
        if (oldBar) oldBar.remove();
        document.querySelectorAll('.post-label').forEach(el => el.remove());

        const allRects = document.querySelectorAll('.posts rect');
        let iMacCount = 0;
        let usedImacCount = 0;

        allRects.forEach(rect => {
            const id = rect.getAttribute('id');
            if (!id || id === '----') {
                rect.classList.add('dead-spot');
                rect.classList.remove('used');
                return;
            } else {
                rect.classList.remove('laptop-spot');
                rect.classList.remove('dead-spot');
                iMacCount++;
                if (rect.classList.contains('used')) usedImacCount++;
            }

            const x = parseFloat(rect.getAttribute('x'));
            const y = parseFloat(rect.getAttribute('y'));
            const width = parseFloat(rect.getAttribute('width'));
            const height = parseFloat(rect.getAttribute('height'));
            const postNumberMatch = id.match(/p(\d+)$/);

            if (postNumberMatch && !rect.classList.contains('used')) {
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', x + width / 2);
                label.setAttribute('y', y + height / 2);
                label.setAttribute('class', 'post-label');
                label.textContent = postNumberMatch[1];
                rect.parentNode.appendChild(label);
            }
        });

        const availableSeats = iMacCount - usedImacCount;
        const occupancyRate = iMacCount > 0 ? ((usedImacCount / iMacCount) * 100).toFixed(0) : 0;

        const infoBar = document.createElement('div');
        infoBar.className = 'cluster-info-bar';
        infoBar.innerHTML = `
          <div class="cluster-info-section">
            <div class="info-item">
              <span class="info-icon available"></span>
              <span class="info-label">Disponible</span>
            </div>
            <div class="info-item">
              <span class="info-icon occupied"></span>
              <span class="info-label">Occupé</span>
            </div>
          </div>
          <div class="cluster-info-section">
            <div class="info-item">
              <span class="info-value">${availableSeats}</span>
              <span class="info-label">libres ici</span>
            </div>
            <div class="stat-badge" style="background: ${getGradient(occupancyRate)}">
              ${occupancyRate}%
            </div>
          </div>
        `;

        const navPills = document.querySelector('.nav-pills');
        if (navPills) {
            navPills.parentNode.insertBefore(infoBar, navPills);
        }

        addTooltips();
        createLiveComponents();
    }

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
            if (rect.classList.contains('used') && !rect.classList.contains('dead-spot')) return;
            rect.onmouseenter = function() {
                const id = this.getAttribute('id');
                let text = (!id || id === '----') ? '🚫 Place indisponible' : `📍 Poste ${id}`;
                tooltip.textContent = text;
                tooltip.classList.add('show');
            };
            rect.onmousemove = (e) => {
                tooltip.style.left = (e.pageX + 10) + 'px';
                tooltip.style.top = (e.pageY + 10) + 'px';
            };
            rect.onmouseleave = () => tooltip.classList.remove('show');
        });
    }

    // ============================================
    // F. INITIALISATION
    // ============================================
    function init() {
        if (!document.querySelector('.map-container')) return;

        console.log('🚀 42 Cluster UI v2.2 (Live + Toast) Active');
        injectStyles();

        setTimeout(updateUI, 500);

        document.querySelectorAll('.nav-pills a').forEach(tab => {
            tab.addEventListener('click', () => setTimeout(updateUI, 400));
        });

        const observer = new MutationObserver((mutations) => {
            let shouldUpdateUI = false;

            mutations.forEach(m => {
                // UI Update standard
                if (m.target.className !== 'activity-list') {
                    shouldUpdateUI = true;
                }

                // Détection de logs dans la sidebar
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains('activity-log')) {

                        // Si quelqu'un est parti (class 'off') -> Trigger TOAST
                        if (node.classList.contains('off')) {
                            const userLink = node.querySelector('a');
                            const hostCode = node.querySelector('.activity-log-host');

                            if (userLink && hostCode) {
                                showToast(userLink.textContent.trim(), hostCode.textContent.trim());
                            }
                        }

                        // Si la modal est ouverte, mettre à jour son contenu
                        const modal = document.querySelector('.live-modal-overlay');
                        if (modal && modal.classList.contains('open')) {
                            const contentDiv = document.getElementById('live-feed-content');
                            updateLiveContent(contentDiv);
                        }
                    }
                });
            });

            if (shouldUpdateUI) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(updateUI, 200);
            }
        });

        const container = document.querySelector('.tab-content');
        if (container) observer.observe(container, { childList: true, subtree: true });

        const sidebar = document.querySelector('.cluster-sidebar-right');
        if (sidebar) observer.observe(sidebar, { childList: true, subtree: true, characterData: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();