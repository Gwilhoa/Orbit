(function() {
    'use strict';

    let debounceTimer;
    const EXAM_SEAT_COUNT = 0;

    function getGradient(rate) {
        if (rate > 90) return 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)';
        if (rate > 70) return 'linear-gradient(135deg, #dd6b20 0%, #c05621 100%)';
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    function detectExamMode() {
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();

        // MARDI : 9h → 13h
        if (day === 2 && hour >= 9 && hour < 13) {
            return true;
        }

        // JEUDI : 13h → 17h
        if (day === 4 && hour >= 13 && hour < 17) {
            return true;
        }

        return false;
    }

    function markZ2PostsAsPossiblyAvailable() {
        const z2Groups = document.querySelectorAll('g[class^="z2r"]');
        z2Groups.forEach(group => {
            const availablePosts = group.querySelectorAll('rect:not(.used):not(.dead-spot):not(.exam)');
            availablePosts.forEach(post => {
                post.classList.add('possibly-available');
            });
        });
    }

    function updateTabsFromSidebar(isExamMode) {
        const sidebarItems = document.querySelectorAll('.cluster-sidebar-right .clusters-state li');
        const clusterStats = {};

        sidebarItems.forEach(item => {
            const codeEl = item.querySelector('code');
            if (codeEl) {
                let name = item.getAttribute('id');
                if (!name) name = item.firstChild.textContent.trim();
                const match = codeEl.textContent.match(/(\d+)/);
                if (name && match) {
                    let count = parseInt(match[1]);
                    console.log('Cluster:', name, 'Vacant posts:', count);

                    if (isExamMode && name.toLowerCase().includes('io')) {
                        count = Math.max(0, count - EXAM_SEAT_COUNT);
                        codeEl.innerHTML = `${count} vacant posts. <small class="exam-note">(${EXAM_SEAT_COUNT} réservés examen)</small>`;
                    }

                    clusterStats[name.toLowerCase()] = count;
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

        return clusterStats;
    }

    function createLiveComponents() {
        if (!document.querySelector('.live-bubble-btn')) {
            const btn = document.createElement('div');
            btn.className = 'live-bubble-btn';
            btn.innerHTML = '<span class="live-bubble-text">LIVE</span>';
            btn.onclick = toggleLiveModal;
            document.body.appendChild(btn);
        }

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

        setTimeout(() => {
            toast.classList.add('toast-hide');
            setTimeout(() => toast.remove(), 400);
        }, 5000);
    }

    function updateUI() {
        const isExamMode = detectExamMode();

        const clusterStats = updateTabsFromSidebar(isExamMode);
        console.log(clusterStats)

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

        // ======= CALCUL DES POSTES DISPONIBLES =======
        const currentTab = document.querySelector('.nav-pills li.active a');
        let availableSeats = 0;

            Object.keys(clusterStats).forEach(key => {
                availableSeats = availableSeats + clusterStats[key];
            });

        if (isExamMode) {
            document.body.classList.add('exam-mode');
            markZ2PostsAsPossiblyAvailable();
        } else {
            document.body.classList.remove('exam-mode');
        }

        const occupied = iMacCount - availableSeats;
        const occupancyRate = iMacCount > 0
            ? ((occupied / iMacCount) * 100).toFixed(0)
            : 0;
        // ======= INFO BAR + BANDEAU EXAM =======
        const infoBar = document.createElement('div');
        infoBar.className = 'cluster-info-bar';
        if (isExamMode) infoBar.classList.add('exam-active');

        infoBar.innerHTML = `
${isExamMode ? `
<div class="exam-warning-banner">
    <span class="exam-warning-icon">⚠️</span>
    <span class="exam-warning-text">EXAMEN EN COURS – PLACES RÉSERVÉES ET VISIBILITÉ RÉDUITE</span>
</div>
` : ''}
      <div class="cluster-info-section">
        <div class="info-item">
          <span class="info-icon available"></span>
          <span class="info-label">Disponible</span>
        </div>
        <div class="info-item">
          <span class="info-icon occupied"></span>
          <span class="info-label">Occupé</span>
        </div>
        ${isExamMode ? `
        <div class="exam-legend">
          <span class="info-icon possibly-available"></span>
          <span class="info-label">Possiblement dispo (Z2)</span>
        </div>` : ''}
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
        if (navPills) navPills.parentNode.insertBefore(infoBar, navPills);

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

                if (this.classList.contains('possibly-available')) {
                    text = `🟠 Poste ${id} (possiblement disponible)`;
                }

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
    // INITIALISATION
    // ============================================
    function init() {
        if (!document.querySelector('.map-container')) return;

        setTimeout(updateUI, 500);

        document.querySelectorAll('.nav-pills a').forEach(tab => {
            tab.addEventListener('click', () => setTimeout(updateUI, 400));
        });

        const observer = new MutationObserver((mutations) => {
            let shouldUpdateUI = false;

            mutations.forEach(m => {
                if (m.target.className !== 'activity-list') {
                    shouldUpdateUI = true;
                }

                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains('activity-log')) {

                        if (node.classList.contains('off')) {
                            const userLink = node.querySelector('a');
                            const hostCode = node.querySelector('.activity-log-host');

                            if (userLink && hostCode) {
                                showToast(userLink.textContent.trim(), hostCode.textContent.trim());
                            }
                        }

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
                debounceTimer = setTimeout(updateUI, 2000);
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