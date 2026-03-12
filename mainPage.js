const urlBus5 = chrome.runtime.getURL("assets/5_bus.svg");
const urlBus86 = chrome.runtime.getURL("assets/86_bus.svg");
const transitLogoUrl = chrome.runtime.getURL("assets/transit.png");

const BUS_LINES = ["5", "86"];
const BUS_STOP_ID = "TCLFR:95258";
const BUS_UPDATE_MS = 30000;
const BUS_REFRESH_MS = 300000;
const MAX_DEPARTURES = 10;

const PROFILE_BANNER_STYLE_ID = "orbit-profile-upgrade-style";
const BUS_STYLE_ID = "orbit-bus-style";

const PROFILE_BANNER_CSS = `
    .orbit-profile-upgrade {
        position: relative;
        overflow: visible;
        border-radius: 16px;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.28), 0 2px 6px rgba(0, 0, 0, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.18);
        animation: orbitFadeIn 320ms ease-out;
    }
    .orbit-profile-upgrade::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(
            to bottom,
            rgba(2, 6, 23, 0.08) 0%,
            rgba(2, 6, 23, 0.28) 45%,
            rgba(2, 6, 23, 0.72) 100%
        );
        z-index: 0;
        pointer-events: none;
    }
    .orbit-profile-upgrade::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(ellipse at 80% 15%, rgba(255, 255, 255, 0.10) 0%, transparent 55%);
        z-index: 0;
        pointer-events: none;
    }
    .orbit-profile-upgrade .user-column,
    .orbit-profile-upgrade .user-banner,
    .orbit-profile-upgrade .profile-left-box,
    .orbit-profile-upgrade .user-primary {
        position: relative;
        z-index: 1;
    }
    .orbit-profile-upgrade .user-column.flex.flex-direction-column,
    .orbit-profile-upgrade .user-column,
    .orbit-profile-upgrade .profile-left-box,
    .orbit-profile-upgrade .profile-left-box .user-primary,
    .orbit-profile-upgrade .user-column .user-primary,
    .orbit-profile-upgrade .profile-left-box .user-infos,
    .orbit-profile-upgrade .user-column .user-infos {
        border: 0 !important;
        outline: 0 !important;
        box-shadow: none !important;
    }
    .orbit-profile-upgrade .button-actions,
    .orbit-profile-upgrade .orbit-stat-chip,
    .orbit-profile-upgrade #title-selector,
    .orbit-profile-upgrade .dropdown-menu,
    .orbit-profile-upgrade [data-toggle="tooltip"] {
        position: relative;
        z-index: 6;
    }
    .orbit-profile-upgrade .name,
    .orbit-profile-upgrade .profile-name,
    .orbit-profile-upgrade .login,
    .orbit-profile-upgrade .coalition-name a,
    .orbit-profile-upgrade #coalition-score,
    .orbit-profile-upgrade #coalition-rank {
        color: #f8fafc !important;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
    }
    .orbit-profile-upgrade .coalition-name .coalition-span {
        font-weight: 700;
        letter-spacing: 0.01em;
    }
    .orbit-profile-upgrade .user-column .user-infos,
    .orbit-profile-upgrade .profile-left-box .user-infos {
        padding: 10px 18px 12px 22px;
        border-radius: 0;
        background: transparent;
        overflow: visible;
    }
    .orbit-profile-upgrade .orbit-stat-chip {
        padding: 6px 9px;
        min-width: 70px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.24);
        background: rgba(255, 255, 255, 0.16);
        transition: transform 140ms ease, background 140ms ease;
    }
    .orbit-profile-upgrade .orbit-stat-chip:hover {
        transform: translateY(-1px);
        background: rgba(255, 255, 255, 0.23);
    }
    .orbit-profile-upgrade .orbit-actions {
        position: relative;
        z-index: 30;
        background: transparent !important;
        border: 0 !important;
        box-shadow: none !important;
        padding: 0 !important;
    }
    .orbit-profile-upgrade .orbit-actions a {
        position: relative;
        z-index: 31;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 9px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        background: rgba(255, 255, 255, 0.16);
        color: #ffffff;
        margin-left: 3px;
        transition: transform 140ms ease, background 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
    }
    .orbit-profile-upgrade .orbit-actions a:hover {
        transform: translateY(-1px);
        z-index: 40;
        background: rgba(255, 255, 255, 0.86);
        border-color: rgba(255, 255, 255, 0.92);
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.24);
        color: #0f172a;
    }
    .orbit-profile-upgrade .orbit-actions a .icon,
    .orbit-profile-upgrade .orbit-actions a[class*="iconf-"] {
        position: relative;
        z-index: 41;
    }
    .orbit-profile-upgrade .orbit-title-btn {
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.35);
        background: rgba(15, 23, 42, 0.35);
        color: #f8fafc;
        backdrop-filter: blur(2px);
        transition: border-color 140ms ease, background 140ms ease;
    }
    .orbit-profile-upgrade .orbit-title-btn:hover {
        background: rgba(15, 23, 42, 0.48);
        border-color: rgba(255, 255, 255, 0.62);
    }
    .orbit-profile-upgrade .profile-name,
    .orbit-profile-upgrade #title-selector {
        overflow: visible;
    }
    .orbit-profile-upgrade #title-selector {
        position: relative;
        z-index: 30;
    }
    .orbit-profile-upgrade #title-selector .dropdown-menu {
        position: absolute !important;
        top: calc(100% + 8px);
        left: 0;
        right: auto;
        float: none;
        margin-top: 0;
        min-width: 320px;
        max-width: min(92vw, 460px);
        max-height: 320px;
        overflow: auto;
        padding: 6px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.28);
        background: rgba(15, 23, 42, 0.96);
        box-shadow: 0 18px 36px rgba(2, 6, 23, 0.45);
        z-index: 31;
    }
    .orbit-profile-upgrade #title-selector.open > .dropdown-menu {
        display: block;
    }
    .orbit-profile-upgrade #title-selector .dropdown-menu > li > a {
        color: #e5e7eb;
        border-radius: 8px;
        white-space: normal;
        line-height: 1.35;
        padding: 8px 10px;
    }
    .orbit-profile-upgrade #title-selector .dropdown-menu > li > a:hover,
    .orbit-profile-upgrade #title-selector .dropdown-menu > .active > a,
    .orbit-profile-upgrade #title-selector .dropdown-menu > .active > a:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.14);
    }
    @keyframes orbitFadeIn {
        from { opacity: 0; transform: translateY(3px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 991px) {
        .orbit-profile-upgrade {
            border-radius: 12px;
        }
        .orbit-profile-upgrade .user-column .user-infos {
            padding: 8px 12px;
        }
    }
`;

const BUS_CSS = `
    @keyframes pulse {
        0% { opacity: 0.3; transform: scale(0.9); }
        50% { opacity: 1; transform: scale(1.1); }
        100% { opacity: 0.3; transform: scale(0.9); }
    }
    @keyframes fadeUpdate {
        0% { opacity: 0.5; }
        50% { opacity: 1; }
        100% { opacity: 0.5; }
    }
`;

// ======================== UTILS ========================
function ensureStyle(id, cssText) {
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = cssText;
    document.head.appendChild(style);
}

function logtimeToMinutes(logtime) {
    const parts = logtime?.match(/(\d+)h(\d+)/);
    if (!parts) return 0;
    return parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
}

function formatTime(date) {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}h${m}`;
}

function formatDateTime(date) {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${d}/${m} ${formatTime(date)}`;
}

function minutesToLogtime(min) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h${String(m).padStart(2, "0")}`;
}

function calculateTargetLogtime(currentMinutes, restrictEnabled = false) {
    const targetMinutes = 7 * 60;
    let remaining = targetMinutes - currentMinutes;

    if (restrictEnabled) {
        const now = new Date();
        now.setMinutes(now.getMinutes() + remaining);
        if (now.getHours() < 15) {
            remaining += (15 - now.getHours()) * 60 - now.getMinutes();
        }
    }

    const now = new Date();
    const targetTime = new Date();
    targetTime.setMinutes(now.getMinutes() + remaining);

    const orangeTime = new Date(targetTime.getTime());
    orangeTime.setMinutes(targetTime.getMinutes() - 21);

    return {
        remainingMinutes: remaining,
        targetTimeText: `${formatTime(targetTime)} (6h39 at ${formatTime(orangeTime)})`
    };
}

function normalizeRouteDepartures(data) {
    const source = data?.route_departures ?? data;
    if (Array.isArray(source)) return source;
    if (source && typeof source === "object") return Object.values(source);
    return [];
}

function getSeverityRank(severity) {
    const ranks = {
        Severe: 4,
        Warning: 3,
        Info: 2,
        UNKNOWN_EFFECT: 1
    };
    return ranks[severity] || 1;
}

function getSeverityTheme(severity) {
    if (severity === "Severe") {
        return { color: "#991b1b", bg: "#fef2f2", border: "#fecaca", badgeBg: "#fee2e2" };
    }
    if (severity === "Warning") {
        return { color: "#9a3412", bg: "#fff7ed", border: "#fed7aa", badgeBg: "#ffedd5" };
    }
    return { color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", badgeBg: "#dbeafe" };
}

function getProgressColor(currentMinutes) {
    if (currentMinutes >= 7 * 60) return "#4CAF50";
    if (currentMinutes >= 6 * 60 + 39) return "#fdd201";
    if (currentMinutes >= 6 * 60 + 18) return "#FF9800";
    return "#F44336";
}

function buildBusApiUrl() {
    return `https://api.bitume2000.fr/api/transit/next-bus?stopId=${BUS_STOP_ID}`;
}

// ======================== PROFILE BANNER UPGRADE ========================
function upgradeProfileBanner() {
    const banner = document.querySelector(".container-inner-item.profile-item-top.profile-banner");
    if (!banner) return;

    ensureStyle(PROFILE_BANNER_STYLE_ID, PROFILE_BANNER_CSS);

    banner.classList.add("orbit-profile-upgrade");
    banner.style.backgroundSize = "cover";
    banner.style.backgroundPosition = "center";

    banner.querySelectorAll("#coalition-score, #coalition-rank").forEach((el) => {
        el.classList.add("orbit-stat-chip");
    });

    banner.querySelectorAll(".button-actions").forEach((el) => {
        el.classList.add("orbit-actions");
    });

    banner.querySelectorAll("#title-selector .btn").forEach((el) => {
        el.classList.add("orbit-title-btn");
    });
}

// ======================== LOGTIME ========================
async function displayLogtime(depth = 0) {
    const container = document.getElementById("user-locations");
    if (!container) return;

    const element = container.lastElementChild;
    const logtimeValue = element?.getAttribute("data-original-title");
    const loadingLogtime = !element || logtimeValue === "0h00 (0h00)" || logtimeValue === "0h00";

    if (depth < 10 && loadingLogtime) {
        setTimeout(() => displayLogtime(depth + 1), 1000);
        return;
    }

    const displayContainer = document.querySelector(".user-data");
    if (!displayContainer) return;
    if (displayContainer.querySelector("[data-orbit-logtime='true']")) return;

    const initialMinutes = logtimeToMinutes(logtimeValue);
    const restrictEnabled = localStorage.getItem("restrict_time") === "true";
    const pageLoadTime = Date.now();

    const logDiv = document.createElement("div");
    logDiv.classList.add("user-header-box", "location");
    logDiv.dataset.orbitLogtime = "true";

    const initialColor = getProgressColor(initialMinutes);
    const initialPercent = Math.min((initialMinutes / (7 * 60)) * 100, 100);
    const { remainingMinutes: initRemaining, targetTimeText: initTarget } = calculateTargetLogtime(initialMinutes, restrictEnabled);

    logDiv.innerHTML = `
        <div class="orbit-logtime-label" style="color: ${initialColor}">Temps de travail</div>
        <div class="orbit-logtime-value" style="color: ${initialColor}">${minutesToLogtime(initialMinutes) || "N/A"}</div>
        <div style="background:#eee;height:10px;width:100%;max-width:220px;border-radius:4px;overflow:hidden;margin:6px 0;">
            <div class="orbit-logtime-bar" style="height:100%;width:${initialPercent}%;background:${initialColor};transition:width 0.6s ease, background 0.6s ease;"></div>
        </div>
        <div class="orbit-logtime-target" style="font-size:12px; color:grey;">
            ${initRemaining <= 0 ? "7h atteint !" : "7h atteint à " + initTarget}
        </div>
    `;

    displayContainer.appendChild(logDiv);

    const labelEl = logDiv.querySelector(".orbit-logtime-label");
    const valueEl = logDiv.querySelector(".orbit-logtime-value");
    const barEl = logDiv.querySelector(".orbit-logtime-bar");
    const targetEl = logDiv.querySelector(".orbit-logtime-target");

    setInterval(() => {
        const elapsed = Math.floor((Date.now() - pageLoadTime) / 60000);
        const minutes = initialMinutes + elapsed;
        const color = getProgressColor(minutes);
        const percent = Math.min((minutes / (7 * 60)) * 100, 100);
        const { remainingMinutes, targetTimeText } = calculateTargetLogtime(minutes, restrictEnabled);

        labelEl.style.color = color;
        valueEl.style.color = color;
        valueEl.textContent = minutesToLogtime(minutes);
        barEl.style.width = `${percent}%`;
        barEl.style.background = color;
        targetEl.textContent = remainingMinutes <= 0 ? "7h atteint !" : `7h atteint à ${targetTimeText}`;
    }, 60000);
}

// ======================== BUS ========================
function extractAlertsByLine(routes, linesFilter = []) {
    const byLine = new Map();

    routes.forEach((route) => {
        const line = route?.route_short_name;
        if (!line || (linesFilter.length > 0 && !linesFilter.includes(line))) return;
        if (!route?.alerts?.length) return;

        const group = byLine.get(line) || { line, severity: "Info", alerts: [], seen: new Set() };
        route.alerts.forEach((alert) => {
            const key = `${alert.title || ""}|${alert.description || ""}`;
            if (group.seen.has(key)) return;
            group.seen.add(key);

            const firstPeriod = alert.active_periods?.[0];
            const startsAt = firstPeriod?.start ? new Date(firstPeriod.start * 1000) : null;
            const endsAt = firstPeriod?.end ? new Date(firstPeriod.end * 1000) : null;
            const severity = alert.severity || "Info";

            if (getSeverityRank(severity) > getSeverityRank(group.severity)) {
                group.severity = severity;
            }

            group.alerts.push({
                severity,
                title: alert.title || "Alerte trafic",
                description: alert.description || "",
                startsAt,
                endsAt
            });
        });

        if (group.alerts.length > 0) {
            byLine.set(line, group);
        }
    });

    return Array.from(byLine.values())
        .map((group) => ({ ...group, seen: undefined }))
        .sort((a, b) => getSeverityRank(b.severity) - getSeverityRank(a.severity));
}

function collectDepartures(routeDepartures) {
    const departures = [];
    const now = new Date();

    routeDepartures.forEach((route) => {
        if (!BUS_LINES.includes(route?.route_short_name)) return;

        (route.itineraries || []).forEach((itinerary) => {
            (itinerary.schedule_items || []).forEach((item) => {
                const depart = new Date(item.departure_time * 1000);
                const diffMin = Math.round((depart - now) / 60000);
                if (diffMin < 0 || diffMin > 60) return;

                departures.push({
                    ligne: route.route_short_name,
                    direction: itinerary.direction_headsign,
                    depart,
                    temps_reel: item.is_real_time,
                    annule: item.is_cancelled
                });
            });
        });
    });

    departures.sort((a, b) => a.depart - b.depart);
    return departures;
}

function createAlertAccordion(group) {
    const theme = getSeverityTheme(group.severity);
    const details = document.createElement("details");
    details.style.cssText = `border:1px solid ${theme.border}; border-radius:10px; background:${theme.bg}; overflow:hidden;`;

    const summary = document.createElement("summary");
    summary.style.cssText = "list-style:none; cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 9px;";
    summary.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; min-width:0;">
            <span style="display:inline-flex; color:${theme.color};">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 3 1 21h22L12 3zm1 14h-2v-2h2v2zm0-4h-2V8h2v5z"/>
                </svg>
            </span>
            <strong style="font-size:12px; color:${theme.color}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                Ligne ${group.line} - ${group.alerts.length} alerte${group.alerts.length > 1 ? "s" : ""}
            </strong>
        </div>
        <span style="font-size:10px; color:${theme.color}; background:${theme.badgeBg}; border:1px solid ${theme.border}; border-radius:999px; padding:3px 6px;">
            ${group.severity}
        </span>
    `;

    const panel = document.createElement("div");
    panel.style.cssText = "padding:0 9px 9px 9px; display:flex; flex-direction:column; gap:7px;";

    group.alerts.forEach((alert) => {
        const periodLabel = alert.startsAt || alert.endsAt
            ? `Période: ${alert.startsAt ? formatDateTime(alert.startsAt) : "?"} -> ${alert.endsAt ? formatDateTime(alert.endsAt) : "?"}`
            : "";

        const alertItem = document.createElement("div");
        alertItem.style.cssText = "padding:7px 8px; border-radius:8px; border:1px solid rgba(0,0,0,0.08); background:#ffffffcc;";
        alertItem.innerHTML = `
            <div style="font-size:12px; font-weight:700; color:#111827; margin-bottom:2px;">${alert.title}</div>
            ${periodLabel ? `<div style="font-size:11px; color:#6b7280; margin-bottom:3px;">${periodLabel}</div>` : ""}
            <div style="font-size:12px; color:#374151;">${alert.description}</div>
        `;
        panel.appendChild(alertItem);
    });

    details.appendChild(summary);
    details.appendChild(panel);
    return details;
}


function createDepartureCard(dep, now) {
    const card = document.createElement("div");
    card.className = "departure-item";
    card.dataset.departure = dep.depart.toISOString();
    card.dataset.annule = dep.annule;
    card.dataset.tempsReel = dep.temps_reel;
    card.style.cssText = "display:flex; justify-content:space-between; align-items:center; gap:10px; border:1px solid #edf1f5; border-radius:10px; padding:8px 9px; margin-bottom:7px; background:#fff;";

    const diffMin = Math.round((dep.depart - now) / 60000);
    card.innerHTML = `
        <div class="departure-left" style="display:flex; gap:9px; align-items:center; min-width:0;">
            <img src="${dep.ligne === "86" ? urlBus86 : urlBus5}" alt="Ligne ${dep.ligne}" width="48" height="48">
            <div style="display:flex; flex-direction:column; gap:2px; min-width:0;">
                <span style="font-weight:700; color:#111827;">Ligne ${dep.ligne}</span>
                <span style="font-size:12px; color:#4b5563; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">→ ${dep.direction}</span>
            </div>
        </div>
        <div class="departure-right" style="display:flex; align-items:center; gap:7px; font-weight:bold; flex-shrink:0;">
            <span class="departure-time"></span>
            ${dep.temps_reel ? `
                <div class="wifi-icon" style="color:green; animation:pulse 1.5s infinite;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                        <path d="M8.5 16.05a6 6 0 0 1 7 0"/>
                        <line x1="12" y1="20" x2="12" y2="20"/>
                    </svg>
                </div>` : ""}
        </div>
    `;

    updateTimeDisplay(card.querySelector(".departure-time"), diffMin, dep.annule);
    return card;
}

function updateDepartureTimes(container) {
    const now = new Date();
    container.querySelectorAll(".departure-item").forEach((card) => {
        const departTime = new Date(card.dataset.departure);
        const annule = card.dataset.annule === "true";
        const diffMin = Math.round((departTime - now) / 60000);
        updateTimeDisplay(card.querySelector(".departure-time"), diffMin, annule, true);
    });
}

function createBusContainer(rowElem) {
    const tclContainer = document.createElement("div");
    tclContainer.className = "col-lg-4 col-md-6 col-xs-12 fixed-height";
    tclContainer.dataset.orbitBusContainer = "true";
    tclContainer.innerHTML = `
        <div class="container-inner-item boxed agenda-container" style="border:0; border-radius:14px; box-shadow:0 10px 24px rgba(0,0,0,0.08); overflow:hidden;">
            <div style="padding:12px 12px 8px 12px; background:linear-gradient(135deg,#f8fafc 0%,#eef6ff 100%); border-bottom:1px solid #e8edf5; display:flex; align-items:center; justify-content:space-between; gap:8px;">
                <h4 class="profile-title" style="margin:0; font-size:16px;">Prochains départs</h4>
                <button class="orbit-alerts-btn" style="display:none; align-items:center; gap:5px; padding:4px 9px; border-radius:999px; border:1px solid; font-size:12px; font-weight:600; cursor:pointer; background:none; line-height:1; transition:opacity 140ms ease;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="flex-shrink:0;">
                        <path d="M12 3 1 21h22L12 3zm1 14h-2v-2h2v2zm0-4h-2V8h2v5z"/>
                    </svg>
                    <span class="orbit-alerts-count"></span>
                </button>
            </div>
            <div class="orbit-alerts-panel" style="display:none; padding:8px 10px; border-bottom:1px solid #e8edf5; background:#fff; flex-direction:column; gap:6px;"></div>
            <div class="overflowable-item loading" style="width:100%;font-size:13px;padding:10px 10px 6px 10px; background:#fff;">Chargement des départs...</div>
            <div class="footer" style="text-align:right; padding:8px 10px 7px 0; border-top:1px solid #eee; margin-top:4px; background:#fff;">
                <img src="${transitLogoUrl}" alt="Transit Logo" style="width:60px; opacity:0.7;">
            </div>
        </div>
    `;

    const btn = tclContainer.querySelector(".orbit-alerts-btn");
    const panel = tclContainer.querySelector(".orbit-alerts-panel");
    btn.addEventListener("click", () => {
        const open = panel.style.display !== "none";
        panel.style.display = open ? "none" : "flex";
    });

    rowElem.firstElementChild.insertBefore(tclContainer, rowElem.firstElementChild.firstChild);
    return tclContainer;
}

async function displayBus() {
    const rowElem = document.querySelector(".container-fullsize.full-width.fixed-height");
    if (!rowElem || !rowElem.firstElementChild) return;

    ensureStyle(BUS_STYLE_ID, BUS_CSS);

    const existingContainer = rowElem.querySelector("[data-orbit-bus-container='true']");
    const tclContainer = existingContainer || createBusContainer(rowElem);
    const content = tclContainer.querySelector(".overflowable-item");
    if (!content) return;

    try {
        const response = await fetch(buildBusApiUrl(), { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const routeDepartures = normalizeRouteDepartures(data);
        const alertsByLine = extractAlertsByLine(routeDepartures, BUS_LINES);
        const departures = collectDepartures(routeDepartures);

        const alertsBtn = tclContainer.querySelector(".orbit-alerts-btn");
        const alertsPanel = tclContainer.querySelector(".orbit-alerts-panel");
        alertsPanel.innerHTML = "";
        if (alertsByLine.length > 0) {
            const totalAlerts = alertsByLine.reduce((sum, g) => sum + g.alerts.length, 0);
            const theme = getSeverityTheme(alertsByLine[0].severity);
            alertsBtn.style.cssText += `display:flex; color:${theme.color}; background:${theme.bg}; border-color:${theme.border};`;
            alertsBtn.querySelector(".orbit-alerts-count").textContent = `${totalAlerts} alerte${totalAlerts > 1 ? "s" : ""}`;
            alertsByLine.forEach((group) => alertsPanel.appendChild(createAlertAccordion(group)));
        } else {
            alertsBtn.style.display = "none";
            alertsPanel.style.display = "none";
        }

        const fragment = document.createDocumentFragment();

        if (departures.length === 0) {
            const empty = document.createElement("em");
            empty.textContent = "Aucun départ dans l'heure qui vient.";
            fragment.appendChild(empty);
            content.innerHTML = "";
            content.appendChild(fragment);
            return;
        }

        const now = new Date();
        departures.slice(0, MAX_DEPARTURES).forEach((dep) => {
            fragment.appendChild(createDepartureCard(dep, now));
        });

        content.innerHTML = "";
        content.appendChild(fragment);

        if (!tclContainer.dataset.orbitBusTimer) {
            setInterval(() => updateDepartureTimes(content), BUS_UPDATE_MS);
            setInterval(() => displayBus(), BUS_REFRESH_MS);
            tclContainer.dataset.orbitBusTimer = "true";
        }
    } catch (err) {
        console.error(err);
        content.innerHTML = `<em>Impossible de charger les départs (${err.message}).</em>`;
    }
}

// ======================== UPDATE TIME DISPLAY ========================
function updateTimeDisplay(span, diffMin, annule, animate = false) {
    let text = "";
    let color = "";

    if (annule) {
        text = "Annulé";
        color = "red";
    } else if (diffMin <= -5) {
        text = "Parti ou en retard";
        color = "gray";
    } else if (diffMin <= 1) {
        text = "à l'approche";
        color = "orange";
    } else if (diffMin <= 5) {
        text = `Dans ${diffMin} min`;
        color = "orange";
    } else if (diffMin <= 10) {
        text = `Dans ${diffMin} min`;
        color = "DodgerBlue";
    } else {
        text = `Dans ${diffMin} min`;
        color = "green";
    }

    span.textContent = text;
    span.style.color = color;
    span.style.textDecoration = annule ? "line-through" : "none";

    if (animate) {
        span.style.animation = "fadeUpdate 1s";
        setTimeout(() => {
            span.style.animation = "";
        }, 1000);
    }
}

// ======================== MATRIX LINK ========================
function getProfileLogin() {
    const match = window.location.pathname.match(/\/users\/([^/?#]+)/);
    return match ? match[1] : null;
}

function addCustomLink() {
    const buttonContainer = document.querySelector(".pull-right.button-actions.margin-right-42");
    if (!buttonContainer) return;
    if (buttonContainer.querySelector("a[href='https://matrix.42lyon.fr/']")) return;

    const customLink = document.createElement("a");
    customLink.href = "https://matrix.42lyon.fr/";
    customLink.className = "iconf-map-location";
    customLink.style.marginLeft = "10px";
    buttonContainer.appendChild(customLink);
}

function makeUserPosteClickable() {
    const poste = document.querySelector(".user-poste-infos");
    if (!poste || poste.dataset.orbitMatrix) return;

    const login = getProfileLogin();
    const url = login
        ? `https://matrix.42lyon.fr/#/user/@${login}:42lyon.fr`
        : "https://matrix.42lyon.fr/";

    poste.dataset.orbitMatrix = "true";
    poste.style.cssText += "cursor:pointer; transition:opacity 140ms ease;";
    poste.title = `Ouvrir sur Matrix (${login ?? "matrix.42lyon.fr"})`;
    poste.addEventListener("mouseenter", () => { poste.style.opacity = "0.7"; });
    poste.addEventListener("mouseleave", () => { poste.style.opacity = ""; });
    poste.addEventListener("click", () => { window.open(url, "_blank", "noopener"); });
}

// ======================== EXEC ========================
displayLogtime();
displayBus();
addCustomLink();
upgradeProfileBanner();
makeUserPosteClickable();

document.querySelectorAll(".container-inner-item.boxed[data-turbolinks-scaffold='inside']").forEach((el) => {
    el.style.border = "0";
    el.style.borderRadius = "14px";
    el.style.boxShadow = "0 10px 24px rgba(0,0,0,0.08)";
    el.style.overflow = "hidden";
});
