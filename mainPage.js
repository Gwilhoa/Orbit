const urlBus5 = chrome.runtime.getURL("assets/5_bus.svg");
const urlBus86 = chrome.runtime.getURL("assets/86_bus.svg");
const transitLogoUrl = chrome.runtime.getURL("assets/transit.png");

// ======================== UTILS ========================
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

// ======================== DISPLAY LOGTIME ========================
async function displayLogtime(depth = 0) {
    const container = document.getElementById("user-locations");
    if (!container) return;

    const element = container.lastElementChild;
    const logtimeValue = element?.getAttribute("data-original-title");

    if (depth < 10 && (!element || logtimeValue === "0h00 (0h00)" || logtimeValue === "0h00")) {
        setTimeout(() => displayLogtime(depth + 1), 1000);
        return;
    }

    const displayContainer = document.querySelector(".user-data");
    if (!displayContainer) return;

    const currentMinutes = logtimeToMinutes(logtimeValue);
    const restrictEnabled = localStorage.getItem("restrict_time") === "true";
    const { remainingMinutes, targetTimeText } = calculateTargetLogtime(currentMinutes, restrictEnabled);

    let progressColor;
    if (currentMinutes >= 7 * 60) {
        progressColor = "#4CAF50"; // vert
    } else if (currentMinutes >= 6 * 60 + 39) {
        progressColor = "#fdd201"; // jaune
    } else if (currentMinutes >= 6 * 60 + 18) {
        progressColor = "#FF9800"; // orange
    } else {
        progressColor = "#F44336"; // rouge
    }

    const percent = Math.min((currentMinutes / (7 * 60)) * 100, 100);

    const logDiv = document.createElement("div");
    logDiv.classList.add("user-header-box", "location");

    logDiv.innerHTML = `
        <div style="color: ${progressColor}" >Current Logtime</div>
        <div style="color: ${progressColor}">${logtimeValue || "N/A"}</div>
        <div class="progress-bar" style="
            background:#eee;
            height:10px;
            width:100%;
            max-width:220px;
            border-radius:4px;
            overflow:hidden;
            margin:6px 0;
        ">
            <div class="progress" style="
                height:100%;
                width:${percent}%;
                background:${progressColor};
                transition: width 0.6s ease, background 0.6s ease;
            "></div>
        </div>
        <div class="target-time" style="font-size:12px; color:grey;">
            ${remainingMinutes <= 0 ? "7h reached!" : "7h reached at " + targetTimeText}
        </div>
    `;

    // Switch "begin at 8h"
    const switchContainer = document.createElement("div");
    switchContainer.className = "logtime-switch";
    switchContainer.style = "margin-top:8px; font-size:12px;";
    switchContainer.innerHTML = `
        <input type="checkbox" id="restrictSwitch" ${restrictEnabled ? "checked" : ""}/>
        <label for="restrictSwitch">begin at 8h</label>
    `;
    switchContainer.querySelector("#restrictSwitch").addEventListener("change", (e) => {
        localStorage.setItem("restrict_time", e.target.checked);
        location.reload();
    });

    logDiv.appendChild(switchContainer);
    displayContainer.appendChild(logDiv);
}

// ======================== DISPLAY BUS ========================
async function displayBus() {
    const rowElem = document.querySelector(".container-fullsize.full-width.fixed-height");
    if (!rowElem) return;

    const tclContainer = document.createElement("div");
    tclContainer.className = "col-lg-4 col-md-6 col-xs-12 fixed-height";
    tclContainer.innerHTML = `
        <div class="container-inner-item boxed agenda-container">
            <h4 class="profile-title">Prochains départs</h4>
            <div class="overflowable-item loading" style="width:100%;height:100%;font-size:13px;padding:5px;">Loading departures...</div>
            <div class="footer" style="text-align:right; padding:8px 10px 5px 0; border-top:1px solid #eee; margin-top:5px;">
                <img src="${transitLogoUrl}" alt="Transit Logo" style="width:60px; opacity:0.7;">
            </div>
        </div>
    `;
    rowElem.firstElementChild.insertBefore(tclContainer, rowElem.firstElementChild.firstChild);

    const content = tclContainer.querySelector(".overflowable-item");

    const lignes = ["5", "86"];
    const stopId = "TCLFR:95258";
    const url = `https://api.bitume2000.fr/api/transit/next-bus?stopId=${stopId}`;

    try {
        const response = await fetch(url, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        const departures = [];
        data.route_departures.forEach(route => {
            if (lignes.includes(route.route_short_name)) {
                route.itineraries.forEach(itinerary => {
                    itinerary.schedule_items.forEach(item => {
                        const date = new Date(item.departure_time * 1000);
                        const diffMin = Math.round((date - new Date()) / 60000);
                        if (diffMin >= 0 && diffMin <= 60) {
                            departures.push({
                                ligne: route.route_short_name,
                                direction: itinerary.direction_headsign,
                                depart: date,
                                temps_reel: item.is_real_time,
                                annule: item.is_cancelled
                            });
                        }
                    });
                });
            }
        });

        if (departures.length === 0) {
            content.innerHTML = "<em>No departures within the next hour.</em>";
            return;
        }

        departures.sort((a, b) => a.depart - b.depart);
        const fragment = document.createDocumentFragment();
        const now = new Date();

        departures.slice(0, 6).forEach(dep => {
            const li = document.createElement("li");
            li.className = "departure-item";
            li.dataset.departure = dep.depart.toISOString();
            li.dataset.annule = dep.annule;
            li.dataset.tempsReel = dep.temps_reel;

            const diffMin = Math.round((dep.depart - now) / 60000);

            li.innerHTML = `
                <div class="departure-left" style="display:flex; gap:8px; align-items:center;">
                    <img src="${dep.ligne === "86" ? urlBus86 : urlBus5}" alt="Ligne ${dep.ligne}" width="48" height="48">
                    <span style="font-weight:bold;">→ ${dep.direction}</span>
                <div class="departure-right" style="display:flex; align-items:center; gap:6px; font-weight:bold;">
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
                </div>
            `;

            fragment.appendChild(li);
            updateTimeDisplay(li.querySelector(".departure-time"), diffMin, dep.annule);
        });

        content.innerHTML = "";
        content.appendChild(fragment);

        const style = document.createElement("style");
        style.textContent = `
            @keyframes pulse {0%{opacity:0.3;transform:scale(0.9);}50%{opacity:1;transform:scale(1.1);}100%{opacity:0.3;transform:scale(0.9);}}
            @keyframes fadeUpdate {0%{opacity:0.5;}50%{opacity:1;}100%{opacity:0.5;}}
        `;
        document.head.appendChild(style);

        setInterval(() => {
            const now = new Date();
            content.querySelectorAll(".departure-item").forEach(li => {
                const departTime = new Date(li.dataset.departure);
                const annule = li.dataset.annule === "true";
                const diffMin = Math.round((departTime - now) / 60000);
                updateTimeDisplay(li.querySelector(".departure-time"), diffMin, annule, true);
            });
        }, 60000);

    } catch (err) {
        console.error(err);
        content.innerHTML = `<em>Failed to load departures (${err.message}).</em>`;
    }
}

// ======================== UPDATE TIME DISPLAY ========================
function updateTimeDisplay(span, diffMin, annule, animate = false) {
    let text = "";
    let color = "";

    if (annule) {
        text = "Annulé"; color = "red";
    } else if (diffMin <= -5) {
        text = "Parti ou en retard"; color = "gray";
    } else if (diffMin <= 1) {
        text = "à l'approche"; color = "orange";
    } else if (diffMin <= 5) {
        text = `Dans ${diffMin} min`; color = "orange";
    } else if (diffMin <= 10) {
        text = `Dans ${diffMin} min`; color = "DodgerBlue";
    } else {
        text = `Dans ${diffMin} min`; color = "green";
    }

    span.textContent = text;
    span.style.color = color;
    span.style.textDecoration = annule ? "line-through" : "none";

    if (animate) {
        span.style.animation = "fadeUpdate 1s";
        setTimeout(() => (span.style.animation = ""), 1000);
    }
}


// ======================== CLUSTER LINK ========================
function addCustomLink() {
    const buttonContainer = document.querySelector(".pull-right.button-actions.margin-right-42");
    if (!buttonContainer) return;

    const customLink = document.createElement("a");
    customLink.href = "https://meta.intra.42.fr/clusters";
    customLink.className = "iconf-map-location"; // Ajustez les classes selon votre design
    customLink.style.marginLeft = "10px";

    buttonContainer.appendChild(customLink);
}

// ======================== EXEC ========================
displayLogtime();
displayBus();
addCustomLink();
