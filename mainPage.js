const transitLogoUrl = chrome.runtime.getURL("assets/transit.png");

const BUS_API_URL = "https://transit.gchatain.fr/api/transit/timetable";
const BUS_UPDATE_MS = 30000;
const BUS_REFRESH_MS = 300000;
const BUS_QUOTA_BACKOFF_MS = 1800000;
const BUS_MAX_TIMEOUT_MS = 2147483647;
const BUS_PAST_GRACE_MS = 60000;
const BUS_NEXT_COUNT = 2;
const BUS_CACHE_KEY = "orbit-bus-timetable";
const BUS_TIMEZONE = "Europe/Paris";
const BUS_LINE_ICONS = ["86", "105", "132", "216"];

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
const parisTimeFormat = new Intl.DateTimeFormat("fr-FR", { timeZone: BUS_TIMEZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const parisDayPartsFormat = new Intl.DateTimeFormat("en-US", { timeZone: BUS_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const parisDayLabelFormat = new Intl.DateTimeFormat("fr-FR", { timeZone: BUS_TIMEZONE, weekday: "long", day: "numeric", month: "long" });

let busState = loadBusState() ?? createEmptyBusState();
let busTimer = null;
let busInFlight = false;
let busListenersReady = false;

class BusApiError extends Error {
    constructor(status, message, retryAfterMs = null) {
        super(message);
        this.status = status;
        this.retryAfterMs = retryAfterMs;
    }
}

function createEmptyBusState() {
    return { data: null, stale: false, fetchedAt: 0, lastAttemptAt: 0, blockedUntil: 0, error: null };
}

function loadBusState() {
    try {
        const raw = JSON.parse(localStorage.getItem(BUS_CACHE_KEY));
        if (raw && typeof raw === "object") return { ...createEmptyBusState(), ...raw };
    } catch {
        // cache absent ou illisible : on repart de zéro
    }
    return null;
}

function saveBusState() {
    try {
        localStorage.setItem(BUS_CACHE_KEY, JSON.stringify(busState));
    } catch {
        // stockage plein ou indisponible : l'état reste en mémoire
    }
}

function formatParisTime(ms) {
    return parisTimeFormat.format(ms).replace(":", "h");
}

function getParisDayKey(ms) {
    const parts = Object.fromEntries(parisDayPartsFormat.formatToParts(ms).map((p) => [p.type, p.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
}

function shiftDayKey(key, days) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function getDayLabel(dayKey, todayKey, ms) {
    if (dayKey === todayKey) return "Aujourd'hui";
    if (dayKey === shiftDayKey(todayKey, 1)) return "Demain";
    const label = parisDayLabelFormat.format(ms);
    return label.charAt(0).toUpperCase() + label.slice(1);
}

function safeHexColor(value, fallback) {
    return /^[0-9a-f]{3,8}$/i.test(value || "") ? `#${value}` : fallback;
}

function parseRetryAfterMs(value) {
    if (!value) return null;
    const seconds = Number(value);
    if (Number.isFinite(seconds)) return Math.max(0, seconds) * 1000;
    const date = Date.parse(value);
    return Number.isNaN(date) ? null : Math.max(0, date - Date.now());
}

function getBusErrorMessage(status) {
    if (status === 400) return "service non configuré";
    if (status === 404) return "route introuvable";
    if (status === 429) return "limite de requêtes atteinte";
    if (status === 503) return "quota mensuel épuisé";
    if (status === 502) return "fournisseur indisponible";
    return "service injoignable";
}

function getBusNextAllowedAt() {
    return Math.max(busState.lastAttemptAt + BUS_REFRESH_MS, busState.blockedUntil);
}

// ---------- Alertes ----------
function parseAlertDate(value) {
    if (value === null || value === undefined || value === "") return null;
    const date = new Date(typeof value === "number" && value < 1e12 ? value * 1000 : value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getAlertSeverity(alert) {
    if (["Severe", "Warning", "Info"].includes(alert.severity)) return alert.severity;
    if (["NO_SERVICE", "SIGNIFICANT_DELAYS"].includes(alert.effect)) return "Severe";
    if (["REDUCED_SERVICE", "DETOUR", "MODIFIED_SERVICE", "STOP_MOVED"].includes(alert.effect)) return "Warning";
    return "Info";
}

function normalizeBusAlerts(busAlerts) {
    const seen = new Set();
    const alerts = [];

    (Array.isArray(busAlerts) ? busAlerts : []).forEach((alert) => {
        if (!alert || typeof alert !== "object") return;
        const key = `${alert.title || ""}|${alert.description || ""}`;
        if (seen.has(key)) return;
        seen.add(key);

        const firstPeriod = alert.active_periods?.[0];
        alerts.push({
            severity: getAlertSeverity(alert),
            title: alert.title || "Alerte trafic",
            description: alert.description || "",
            createdAt: parseAlertDate(alert.created_at),
            startsAt: parseAlertDate(firstPeriod?.start),
            endsAt: parseAlertDate(firstPeriod?.end)
        });
    });

    return alerts;
}

function createAlertItem(alert) {
    const theme = getSeverityTheme(alert.severity);
    const details = document.createElement("details");
    details.className = "orbit-alert";
    details.dataset.key = `${alert.title}|${alert.description}`;
    details.style.cssText = `border:1px solid ${theme.border}; border-radius:10px; background:${theme.bg}; overflow:hidden; flex:0 0 auto;`;

    const summary = document.createElement("summary");
    summary.style.cssText = "list-style:none; cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:8px; padding:7px 9px;";
    summary.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; min-width:0;">
            <span style="display:inline-flex; flex-shrink:0; color:${theme.color};">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 3 1 21h22L12 3zm1 14h-2v-2h2v2zm0-4h-2V8h2v5z"/>
                </svg>
            </span>
            <strong class="orbit-alert-title" style="font-size:12px; color:${theme.color}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></strong>
        </div>
        <span class="orbit-alert-severity" style="flex-shrink:0; font-size:10px; color:${theme.color}; background:${theme.badgeBg}; border:1px solid ${theme.border}; border-radius:999px; padding:2px 6px;"></span>
    `;
    summary.querySelector(".orbit-alert-title").textContent = alert.title;
    summary.querySelector(".orbit-alert-severity").textContent = alert.severity;

    let dateLabel = "";
    if (alert.startsAt || alert.endsAt) {
        dateLabel = `Période: ${alert.startsAt ? formatDateTime(alert.startsAt) : "?"} -> ${alert.endsAt ? formatDateTime(alert.endsAt) : "?"}`;
    } else if (alert.createdAt) {
        dateLabel = `Publiée le ${formatDateTime(alert.createdAt)}`;
    }

    const body = document.createElement("div");
    body.style.cssText = "margin:0 9px 9px 9px; padding:7px 8px; border-radius:8px; border:1px solid rgba(0,0,0,0.08); background:#ffffffcc;";
    body.innerHTML = `
        <div class="orbit-alert-date" style="font-size:11px; color:#6b7280; margin-bottom:3px;"></div>
        <div class="orbit-alert-desc" style="font-size:12px; color:#374151;"></div>
    `;
    body.querySelector(".orbit-alert-date").textContent = dateLabel;
    body.querySelector(".orbit-alert-desc").textContent = alert.description;
    if (!dateLabel) body.querySelector(".orbit-alert-date").remove();

    details.appendChild(summary);
    details.appendChild(body);
    return details;
}

function renderBusAlerts(tclContainer) {
    const alertsBtn = tclContainer.querySelector(".orbit-alerts-btn");
    const alertsPanel = tclContainer.querySelector(".orbit-alerts-panel");
    const alerts = normalizeBusAlerts(busState.data?.busAlerts);

    const openKeys = new Set([...alertsPanel.querySelectorAll("details[open]")].map((d) => d.dataset.key));
    alertsPanel.innerHTML = "";
    if (alerts.length === 0) {
        alertsBtn.style.display = "none";
        alertsPanel.style.display = "none";
        return;
    }

    const severity = alerts.reduce((max, a) => (getSeverityRank(a.severity) > getSeverityRank(max) ? a.severity : max), "Info");
    alerts.forEach((alert) => {
        const item = createAlertItem(alert);
        item.open = openKeys.has(item.dataset.key);
        alertsPanel.appendChild(item);
    });

    const theme = getSeverityTheme(severity);
    alertsBtn.style.cssText += `display:flex; color:${theme.color}; background:${theme.bg}; border-color:${theme.border};`;
    alertsBtn.querySelector(".orbit-alerts-count").textContent = `${alerts.length} alerte${alerts.length > 1 ? "s" : ""}`;
}

// ---------- Horaires ----------
const parisWeekdayFormat = new Intl.DateTimeFormat("fr-FR", { timeZone: BUS_TIMEZONE, weekday: "short" });
const busExpanded = new Set();

const SVG_NS = "http://www.w3.org/2000/svg";
const WIFI_ICON_PATHS = ["M2 8.8a15 15 0 0 1 20 0", "M5 12.6a10.5 10.5 0 0 1 14 0", "M8.5 16.3a5.5 5.5 0 0 1 7 0", "M12 20h.01"];

function createWifiIcon() {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", "12");
    svg.setAttribute("height", "12");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2.6");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    WIFI_ICON_PATHS.forEach((d) => {
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", d);
        svg.appendChild(path);
    });

    const icon = document.createElement("span");
    icon.className = "orbit-bus-live";
    icon.style.cssText = "display:inline-flex; flex-shrink:0; animation:pulse 1.5s infinite;";
    icon.appendChild(svg);
    return icon;
}

function getDirectionKey(line, direction) {
    return `${line.routeId}|${direction?.stopId}|${direction?.directionId}`;
}

function getUpcomingDepartures(direction, nowMs) {
    return (direction?.departures || [])
        .filter((dep) => Number.isFinite(dep?.departureTime) && dep.departureTime * 1000 >= nowMs - BUS_PAST_GRACE_MS);
}

// Les N prochains départs réels ; un supprimé qui les précède reste affiché (barré) sans compter.
function pickNextDepartures(departures) {
    const picked = [];
    let valid = 0;
    let cancelled = 0;

    for (const dep of departures) {
        if (dep.cancelled === true) {
            if (cancelled < 1) {
                picked.push(dep);
                cancelled++;
            }
            continue;
        }
        picked.push(dep);
        valid++;
        if (valid >= BUS_NEXT_COUNT) break;
    }

    return picked;
}

function formatDepartureLabel(depMs, nowMs) {
    const diffMin = Math.round((depMs - nowMs) / 60000);
    if (diffMin <= 0) return "<1 min";
    if (diffMin < 60) return `${diffMin} min`;

    const time = formatParisTime(depMs);
    const todayKey = getParisDayKey(nowMs);
    const dayKey = getParisDayKey(depMs);
    if (dayKey === todayKey) return time;
    if (dayKey === shiftDayKey(todayKey, 1)) return `dem. ${time}`;
    return `${parisWeekdayFormat.format(depMs)} ${time}`;
}

function groupDeparturesByDay(departures, nowMs) {
    const todayKey = getParisDayKey(nowMs);
    const groups = [];

    departures.forEach((dep) => {
        const ms = dep.departureTime * 1000;
        const key = getParisDayKey(ms);
        let group = groups[groups.length - 1];
        if (!group || group.key !== key) {
            group = { key, label: getDayLabel(key, todayKey, ms), items: [] };
            groups.push(group);
        }
        group.items.push(dep);
    });

    return groups;
}

function getDepartureStatus(dep) {
    const cancelled = dep.cancelled === true;
    const delaySec = Number.isFinite(dep.scheduledTime) ? dep.departureTime - dep.scheduledTime : 0;
    const delayed = !cancelled && delaySec !== 0;
    return {
        cancelled,
        delayed,
        delayMin: Math.round(delaySec / 60),
        live: !cancelled && dep.realTime === true
    };
}

function getDepartureTitle(dep, status) {
    const clock = formatParisTime(dep.departureTime * 1000);
    if (status.cancelled) return `Supprimé (prévu à ${clock})`;
    if (status.delayed) {
        const scheduled = formatParisTime(dep.scheduledTime * 1000);
        return `${clock} · prévu à ${scheduled}${status.delayMin ? ` (${status.delayMin > 0 ? "+" : ""}${status.delayMin} min)` : ""}`;
    }
    return `${clock} · ${status.live ? "temps réel (bus suivi)" : "horaire théorique"}`;
}

function appendDelayTag(parent, status) {
    if (!status.delayed || !status.delayMin) return;
    const tag = document.createElement("span");
    tag.style.cssText = "font-size:10px; font-weight:700; padding:0 4px; border-radius:4px; background:#fff7ed; color:#c2410c;";
    tag.textContent = `${status.delayMin > 0 ? "+" : ""}${status.delayMin}`;
    parent.appendChild(tag);
}

// Pastille « métro » : temps restant, wifi si le bus est suivi en temps réel.
function createTimePill(dep, nowMs, isFirst) {
    const status = getDepartureStatus(dep);
    const depMs = dep.departureTime * 1000;

    let color = "#374151";
    if (status.cancelled) color = "#9ca3af";
    else if (status.delayed) color = "#c2410c";
    else if (status.live) color = "#15803d";

    const pill = document.createElement("span");
    pill.className = "orbit-bus-pill";
    pill.title = getDepartureTitle(dep, status);
    pill.dataset.cancelled = String(status.cancelled);
    pill.dataset.delayed = String(status.delayed);
    pill.dataset.realTime = String(status.live);
    pill.style.cssText = `display:inline-flex; align-items:center; gap:3px; white-space:nowrap; color:${color}; font-size:${isFirst ? 14 : 12.5}px; font-weight:${isFirst ? 800 : 700}; ${status.cancelled ? "text-decoration:line-through; font-weight:600; font-size:12px;" : ""}`;

    const label = document.createElement("span");
    label.textContent = status.cancelled ? formatParisTime(depMs) : formatDepartureLabel(depMs, nowMs);
    pill.appendChild(label);

    if (status.live) pill.appendChild(createWifiIcon());
    appendDelayTag(pill, status);
    return pill;
}

// Puce de la liste complète : heure exacte.
function createDepartureChip(dep) {
    const status = getDepartureStatus(dep);

    let color = "#111827";
    let background = "#ffffff";
    let border = "#e5e7eb";
    if (status.cancelled) {
        color = "#9ca3af";
        background = "#f3f4f6";
    } else if (status.delayed) {
        color = "#9a3412";
        background = "#fff7ed";
        border = "#fed7aa";
    } else if (status.live) {
        color = "#166534";
        background = "#f0fdf4";
        border = "#bbf7d0";
    }

    const chip = document.createElement("span");
    chip.className = "orbit-bus-departure";
    chip.title = getDepartureTitle(dep, status);
    chip.dataset.cancelled = String(status.cancelled);
    chip.dataset.delayed = String(status.delayed);
    chip.dataset.realTime = String(status.live);
    chip.style.cssText = `display:inline-flex; align-items:center; gap:4px; padding:1px 6px; border-radius:6px; border:1px solid ${border}; background:${background}; color:${color}; font-size:12px; line-height:18px; font-weight:700; ${status.cancelled ? "text-decoration:line-through;" : ""}`;

    const time = document.createElement("span");
    time.textContent = formatParisTime(dep.departureTime * 1000);
    chip.appendChild(time);

    if (status.live) chip.appendChild(createWifiIcon());
    appendDelayTag(chip, status);
    return chip;
}

function createAllDeparturesPanel(departures, nowMs) {
    const panel = document.createElement("div");
    panel.className = "orbit-bus-all";
    panel.style.cssText = "display:flex; flex-direction:column; gap:4px; padding:6px 8px; border-radius:8px; background:#f8fafc;";

    const groups = groupDeparturesByDay(departures, nowMs);
    const showLabels = groups.length > 1 || groups[0].label !== "Aujourd'hui";
    groups.forEach((group) => {
        const row = document.createElement("div");
        row.style.cssText = "display:flex; flex-wrap:wrap; align-items:center; gap:4px;";
        if (showLabels) {
            const label = document.createElement("span");
            label.className = "orbit-bus-day";
            label.style.cssText = "font-size:11px; font-weight:700; color:#6b7280; margin-right:2px;";
            label.textContent = group.label;
            row.appendChild(label);
        }
        group.items.forEach((dep) => row.appendChild(createDepartureChip(dep)));
        panel.appendChild(row);
    });

    return panel;
}

function createInfoButton(headsign, expanded) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "orbit-bus-info";
    button.textContent = "i";
    button.title = "Voir tous les prochains horaires";
    button.setAttribute("aria-label", `Tous les prochains horaires vers ${headsign}`);
    button.setAttribute("aria-expanded", String(expanded));
    button.style.cssText = `flex:0 0 18px; width:18px; height:18px; padding:0; border-radius:50%; border:1px solid ${expanded ? "#00babc" : "#cbd5e1"}; background:${expanded ? "#00babc" : "#fff"}; color:${expanded ? "#fff" : "#64748b"}; font:italic 700 11px/16px Georgia, serif; cursor:pointer; text-align:center;`;
    return button;
}

function createDirectionBlock(line, direction, nowMs) {
    const departures = getUpcomingDepartures(direction, nowMs);
    const picked = pickNextDepartures(departures);
    const key = getDirectionKey(line, direction);
    const headsign = direction?.headsign || "Destination inconnue";
    const hasMore = departures.length > picked.length;
    const expanded = hasMore && busExpanded.has(key);

    const block = document.createElement("div");
    block.className = "orbit-bus-direction";
    block.style.cssText = "display:flex; flex-direction:column; gap:5px; min-width:0;";

    const row = document.createElement("div");
    row.style.cssText = "display:flex; align-items:center; gap:8px; min-width:0;";

    const headsignEl = document.createElement("span");
    headsignEl.style.cssText = "flex:1 1 0; min-width:0; font-size:12px; font-weight:700; color:#202026; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;";
    headsignEl.textContent = headsign;
    headsignEl.title = headsign;
    row.appendChild(headsignEl);

    const pills = document.createElement("div");
    pills.style.cssText = "display:flex; align-items:center; justify-content:flex-end; gap:9px; flex:0 0 auto;";
    if (picked.length === 0) {
        const empty = document.createElement("em");
        empty.style.cssText = "font-size:11px; color:#6b7280;";
        empty.textContent = "Aucun départ";
        pills.appendChild(empty);
    } else {
        let first = true;
        picked.forEach((dep) => {
            pills.appendChild(createTimePill(dep, nowMs, first && dep.cancelled !== true));
            if (dep.cancelled !== true) first = false;
        });
    }
    row.appendChild(pills);

    if (hasMore) {
        const button = createInfoButton(headsign, expanded);
        button.addEventListener("click", () => {
            if (busExpanded.has(key)) busExpanded.delete(key);
            else busExpanded.add(key);
            renderBusDepartures(button.closest("[data-orbit-bus-container]"));
        });
        row.appendChild(button);
    } else {
        const spacer = document.createElement("span");
        spacer.style.cssText = "flex:0 0 18px;";
        row.appendChild(spacer);
    }
    block.appendChild(row);

    if (expanded) block.appendChild(createAllDeparturesPanel(departures, nowMs));

    return { block, hasDepartures: picked.length > 0 };
}

function createLineBadge(line) {
    const badge = document.createElement("span");
    badge.className = "orbit-bus-badge";
    badge.title = line.longName || "";
    badge.style.cssText = `display:inline-block; min-width:34px; text-align:center; padding:3px 8px; border-radius:6px; font-size:14px; font-weight:800; flex-shrink:0; background:${safeHexColor(line.color, "#4b5563")}; color:${safeHexColor(line.textColor, "#ffffff")};`;
    badge.textContent = line.name || "?";
    return badge;
}

// Pictogramme TCL si on l'embarque, sinon (ou s'il ne charge pas) pastille colorée.
function createLineIcon(line) {
    if (!BUS_LINE_ICONS.includes(line.name)) return createLineBadge(line);

    const icon = document.createElement("img");
    icon.className = "orbit-bus-icon";
    icon.src = chrome.runtime.getURL(`assets/${line.name}_bus.svg`);
    icon.alt = `Ligne ${line.name}`;
    icon.title = line.longName || "";
    icon.style.cssText = "height:22px; width:auto; flex-shrink:0;";
    icon.addEventListener("error", () => icon.replaceWith(createLineBadge(line)));
    return icon;
}

function createLineCard(line, nowMs) {
    const card = document.createElement("div");
    card.className = "orbit-bus-line";
    card.style.cssText = "display:flex; align-items:flex-start; gap:10px; padding:7px 0; border-bottom:1px solid #f1f1f1;";

    const iconColumn = document.createElement("div");
    iconColumn.style.cssText = "flex:0 0 66px; width:66px;";
    iconColumn.appendChild(createLineIcon(line));

    const directionsColumn = document.createElement("div");
    directionsColumn.style.cssText = "flex:1 1 auto; min-width:0; display:flex; flex-direction:column; gap:6px;";

    let hasDepartures = false;
    (Array.isArray(line.directions) ? line.directions : []).forEach((direction) => {
        const result = createDirectionBlock(line, direction, nowMs);
        hasDepartures = hasDepartures || result.hasDepartures;
        directionsColumn.appendChild(result.block);
    });

    card.appendChild(iconColumn);
    card.appendChild(directionsColumn);
    return { card, hasDepartures };
}

// Fondu en bas de liste tant qu'il reste des départs à faire défiler.
function updateScrollFade(content) {
    const hasMore = content.scrollHeight - content.scrollTop - content.clientHeight > 4;
    const mask = hasMore ? "linear-gradient(to bottom, #000 calc(100% - 24px), transparent)" : "none";
    content.style.maskImage = mask;
    content.style.webkitMaskImage = mask;
}

function renderBusDepartures(tclContainer) {
    const content = tclContainer.querySelector(".overflowable-item");
    if (!content) return;

    if (!busState.data) {
        if (busState.error) {
            content.textContent = `Impossible de charger les départs (${busState.error.message}).`;
            content.style.fontStyle = "italic";
        }
        return;
    }

    const nowMs = Date.now();
    const scrollTop = content.scrollTop;
    const fragment = document.createDocumentFragment();
    let hasDepartures = false;

    busState.data.lines.forEach((line) => {
        const result = createLineCard(line, nowMs);
        hasDepartures = hasDepartures || result.hasDepartures;
        fragment.appendChild(result.card);
    });

    if (fragment.lastElementChild) fragment.lastElementChild.style.borderBottom = "none";

    content.innerHTML = "";
    content.style.fontStyle = "";
    if (!hasDepartures) {
        const empty = document.createElement("em");
        empty.textContent = "Aucun départ à venir.";
        content.appendChild(empty);
        updateScrollFade(content);
        return;
    }
    content.appendChild(fragment);
    content.scrollTop = scrollTop;
    updateScrollFade(content);
}

function renderBusStatus(tclContainer) {
    const statusEl = tclContainer.querySelector(".orbit-bus-status");
    if (!statusEl) return;

    const parts = [];
    if (busState.error) {
        const retryAt = getBusNextAllowedAt();
        const retryDay = getParisDayKey(retryAt) === getParisDayKey(Date.now()) ? "" : `${parisDayLabelFormat.format(retryAt)} `;
        parts.push(`Mise à jour impossible (${busState.error.message}), nouvel essai ${retryDay}à ${formatParisTime(retryAt)}`);
    } else if (busState.fetchedAt) {
        parts.push(`Mis à jour à ${formatParisTime(busState.fetchedAt)}`);
    }
    if (busState.stale) parts.push("données potentiellement anciennes");

    const text = parts.join(" · ");
    statusEl.textContent = text.charAt(0).toUpperCase() + text.slice(1);
    statusEl.style.color = busState.error ? "#9a3412" : "#9ca3af";
}

function createBusContainer(rowElem) {
    const tclContainer = document.createElement("div");
    tclContainer.className = "col-lg-4 col-md-6 col-xs-12 fixed-height";
    tclContainer.dataset.orbitBusContainer = "true";
    tclContainer.innerHTML = `
        <div class="container-inner-item boxed agenda-container" style="border:0; border-radius:14px; box-shadow:0 10px 24px rgba(0,0,0,0.08); overflow:hidden; display:flex; flex-direction:column; padding-bottom:12px;">
            <h4 class="profile-title" style="justify-content:space-between; gap:8px; margin-bottom:10px;">
                <span>Prochains départs</span>
                <button class="orbit-alerts-btn" style="display:none; align-items:center; gap:5px; padding:4px 9px; border-radius:999px; border:1px solid; font-size:12px; font-weight:600; cursor:pointer; background:none; line-height:1; text-transform:none; transition:opacity 140ms ease;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="flex-shrink:0;">
                        <path d="M12 3 1 21h22L12 3zm1 14h-2v-2h2v2zm0-4h-2V8h2v5z"/>
                    </svg>
                    <span class="orbit-alerts-count"></span>
                </button>
            </h4>
            <div class="orbit-alerts-panel" style="display:none; flex:0 0 auto; max-height:150px; overflow:auto; margin:0 10px 8px 10px; flex-direction:column; gap:6px;"></div>
            <div class="overflowable-item loading" style="flex:1 1 auto; min-height:0; max-height:none; margin-bottom:6px; padding:0 6px 0 10px; font-size:13px; overflow:auto;">Chargement des départs...</div>
            <div class="footer" style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:6px 10px 0 10px; border-top:1px solid #f1f1f1;">
                <span class="orbit-bus-status" style="font-size:10px; color:#9ca3af; min-width:0;"></span>
                <img src="${transitLogoUrl}" alt="Transit Logo" style="width:54px; opacity:0.7; flex-shrink:0;">
            </div>
        </div>
    `;

    const list = tclContainer.querySelector(".overflowable-item");
    list.addEventListener("scroll", () => updateScrollFade(list));

    const btn = tclContainer.querySelector(".orbit-alerts-btn");
    const panel = tclContainer.querySelector(".orbit-alerts-panel");
    btn.addEventListener("click", () => {
        const open = panel.style.display !== "none";
        panel.style.display = open ? "none" : "flex";
        updateScrollFade(list);
    });
    panel.addEventListener("toggle", () => updateScrollFade(list), true);

    rowElem.firstElementChild.insertBefore(tclContainer, rowElem.firstElementChild.firstChild);
    return tclContainer;
}

function getBusContainer() {
    const rowElem = document.querySelector(".container-fullsize.full-width.fixed-height");
    if (!rowElem || !rowElem.firstElementChild) return null;
    return rowElem.querySelector("[data-orbit-bus-container='true']") || createBusContainer(rowElem);
}

// ---------- Appels API ----------
async function fetchTimetable() {
    let response;
    try {
        response = await fetch(BUS_API_URL, { headers: { Accept: "application/json" } });
    } catch {
        throw new BusApiError(0, getBusErrorMessage(0));
    }
    if (!response.ok) {
        throw new BusApiError(response.status, getBusErrorMessage(response.status), parseRetryAfterMs(response.headers.get("Retry-After")));
    }

    const data = await response.json().catch(() => null);
    if (!Array.isArray(data?.lines)) throw new BusApiError(response.status, "réponse invalide");
    return { data, stale: response.headers.get("X-Cache") === "STALE" };
}

function scheduleBusRefresh() {
    clearTimeout(busTimer);
    const delay = Math.min(Math.max(getBusNextAllowedAt() - Date.now(), 1000), BUS_MAX_TIMEOUT_MS);
    busTimer = setTimeout(refreshBus, delay);
}

async function refreshBus() {
    clearTimeout(busTimer);
    // L'onglet caché ne consomme pas de quota : visibilitychange relancera la boucle.
    if (busInFlight || document.hidden) return;

    busState = loadBusState() ?? busState;
    if (Date.now() < getBusNextAllowedAt() || !getBusContainer()) {
        scheduleBusRefresh();
        return;
    }

    busInFlight = true;
    busState.lastAttemptAt = Date.now();
    saveBusState();

    let dataChanged = false;
    try {
        const { data, stale } = await fetchTimetable();
        busState = { ...busState, data, stale, fetchedAt: Date.now(), blockedUntil: 0, error: null };
        dataChanged = true;
    } catch (err) {
        const status = err instanceof BusApiError ? err.status : 0;
        const message = err instanceof BusApiError ? err.message : getBusErrorMessage(0);
        const defaultBackoff = status === 503 ? BUS_QUOTA_BACKOFF_MS : BUS_REFRESH_MS;
        busState = { ...busState, error: { status, message }, blockedUntil: Date.now() + (err.retryAfterMs ?? defaultBackoff) };
    } finally {
        busInFlight = false;
    }

    saveBusState();
    renderBus(dataChanged);
    scheduleBusRefresh();
}

function renderBus(withAlerts = false) {
    const tclContainer = getBusContainer();
    if (!tclContainer) return;

    ensureStyle(BUS_STYLE_ID, BUS_CSS);
    if (withAlerts) renderBusAlerts(tclContainer);
    renderBusDepartures(tclContainer);
    renderBusStatus(tclContainer);
}

function displayBus() {
    renderBus(true);

    if (!busListenersReady) {
        busListenersReady = true;
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) return;
            renderBus();
            refreshBus();
        });
        setInterval(() => {
            if (!document.hidden) renderBus();
        }, BUS_UPDATE_MS);
    }

    refreshBus();
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
        ? `https://matrix.42lyon.fr/?user=${login}`
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
