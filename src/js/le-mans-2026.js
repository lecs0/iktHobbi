import { leMans2026 } from "./le_mans_2026.js";

const dataModuleUrl = new URL("./le_mans_2026.js", import.meta.url);
const classLabels = {
    HYPERCAR: "Hypercar",
    LMP2: "LMP2",
    LMGT3: "LMGT3"
};
const entries = Object.entries(leMans2026.classes).flatMap(([classKey, cars]) =>
    cars.map(car => ({ ...car, classKey }))
);
const entryGrid = document.querySelector("#entries");
const resultsBody = document.querySelector("#results");
const pointsRoot = document.querySelector("#points-tables");
const entryCount = document.querySelector("#entry-count");
const searchInput = document.querySelector("#entry-search");

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function normalize(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase();
}

function filteredEntries() {
    const activeClass = document.querySelector(".lm-filter.is-active").dataset.class;
    const query = normalize(searchInput.value.trim());
    return entries.filter(entry => {
        const matchesClass = activeClass === "ALL" || entry.classKey === activeClass;
        const searchable = [
            entry.number,
            entry.team,
            entry.manufacturer,
            entry.car.model,
            ...entry.drivers.map(driver => driver.name)
        ].map(normalize).join(" ");
        return matchesClass && (!query || searchable.includes(query));
    });
}

function driverMarkup(driver) {
    const portrait = driver.image_url
        ? `<img src="${escapeHtml(driver.image_url)}" alt="" loading="lazy" referrerpolicy="no-referrer">`
        : '<span class="lm-avatar-placeholder" aria-label="Portrait unavailable"></span>';
    return `<div class="lm-driver">${portrait}<span class="lm-driver-name">${escapeHtml(driver.name)}</span></div>`;
}

function entryMarkup(entry) {
    const localLivery = new URL(entry.car.image_url, dataModuleUrl).href;
    const model = entry.car.model || "";
    return `
        <article class="lm-entry-card" data-entry-number="${escapeHtml(entry.number)}" data-entry-class="${entry.classKey}">
            <div class="lm-card-top">
                <span class="lm-class-label">${classLabels[entry.classKey]}</span>
                <span class="lm-number">#${escapeHtml(entry.number)}</span>
            </div>
            <p class="lm-team">${escapeHtml(entry.team)}</p>
            <p class="lm-model">${escapeHtml(model)}</p>
            <div class="lm-livery">
                <img src="${escapeHtml(localLivery)}" alt="#${escapeHtml(entry.number)} ${escapeHtml(model)} Le Mans livery" loading="lazy">
            </div>
            <div class="lm-entry-meta">
                <span class="lm-manufacturer">
                    ${entry.manufacturer_logo_url ? `<img src="${escapeHtml(entry.manufacturer_logo_url)}" alt="${escapeHtml(entry.manufacturer)} logo" loading="lazy">` : ""}
                    <span>${escapeHtml(entry.manufacturer)}</span>
                </span>
                <span>${entry.drivers.length} drivers</span>
            </div>
            <div class="lm-drivers" aria-label="Drivers">${entry.drivers.map(driverMarkup).join("")}</div>
        </article>`;
}

function renderEntries() {
    const visibleEntries = filteredEntries();
    const visibleDriverSlots = visibleEntries.reduce((count, entry) => count + entry.drivers.length, 0);
    entryGrid.innerHTML = visibleEntries.length
        ? visibleEntries.map(entryMarkup).join("")
        : '<p class="lm-empty">No entries match this search. Try another car number, team, manufacturer, model or driver.</p>';
    entryCount.textContent = `Showing ${visibleEntries.length} of ${entries.length} entries · ${visibleDriverSlots} driver slots`;
}

function displayPosition(position) {
    return position == null ? "—" : escapeHtml(position);
}

function renderResults() {
    const resultEntries = filteredEntries().slice().sort((first, second) => {
        const firstClassified = first.result.status === "classified";
        const secondClassified = second.result.status === "classified";
        if (firstClassified !== secondClassified) return firstClassified ? -1 : 1;
        return (first.result.overall_position ?? Number.MAX_SAFE_INTEGER)
            - (second.result.overall_position ?? Number.MAX_SAFE_INTEGER);
    });
    resultsBody.innerHTML = resultEntries.map(entry => {
        const result = entry.result;
        const retired = result.status !== "classified";
        return `<tr class="${retired ? "lm-result-retired" : ""}">
            <td class="lm-result-position">${displayPosition(result.overall_position)}</td>
            <td>${classLabels[entry.classKey]} ${displayPosition(result.class_position)}</td>
            <td class="lm-result-car">#${escapeHtml(entry.number)} · ${escapeHtml(entry.team)}</td>
            <td>${escapeHtml(result.status)}</td>
            <td>${displayPosition(result.laps)}</td>
            <td>${displayPosition(result.total_time)}</td>
            <td>${displayPosition(result.best_lap)}</td>
            <td>${displayPosition(result.pit_stops)}</td>
        </tr>`;
    }).join("");
}

function pointRows(title, rows, labelField) {
    const body = rows.map(row => {
        const label = labelField === "number" ? `#${row.number}` : row[labelField] || `#${row.number}`;
        const detail = row.number && labelField !== "number" ? `#${row.number}` : "";
        const drivers = row.drivers?.length ? `<small>${row.drivers.map(escapeHtml).join(" · ")}</small>` : "";
        return `<tr>
            <td><strong>${escapeHtml(label)}</strong>${detail ? `<small>${escapeHtml(detail)}</small>` : ""}${drivers}</td>
            <td class="lm-point-value">${escapeHtml(row.race_points)}</td>
            <td class="lm-point-value">${escapeHtml(row.bonus_points)}</td>
        </tr>`;
    }).join("");
    return `<section class="lm-points-group" aria-label="${escapeHtml(title)}">
        <h3>${escapeHtml(title)}</h3>
        <div class="lm-table-wrap">
            <table class="lm-table">
                <thead><tr><th scope="col">Entry</th><th scope="col">Race points</th><th scope="col">Pole bonus</th></tr></thead>
                <tbody>${body}</tbody>
            </table>
        </div>
    </section>`;
}

function renderPoints() {
    const points = leMans2026.wec_points;
    pointsRoot.innerHTML = [
        pointRows("Hypercar manufacturers", points.hypercar_manufacturers, "manufacturer"),
        pointRows("Hypercar drivers", points.hypercar_drivers, "number"),
        pointRows("LMGT3 teams", points.lmgt3_teams, "team"),
        pointRows("LMGT3 drivers", points.lmgt3_drivers, "number")
    ].join("");
}

function renderOfficialLinks() {
    const links = [
        ["Official Le Mans entry guide", leMans2026.source_entry_guide],
        ["Final race classification", leMans2026.source_race_classification],
        ["Official WEC points", leMans2026.source_wec_points]
    ];
    document.querySelector("#source-links").innerHTML = links.map(([label, url]) =>
        `<a class="lm-source-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ↗</a>`
    ).join("");
}

if (entryGrid && resultsBody && pointsRoot && entryCount && searchInput) {
    document.querySelectorAll(".lm-filter").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".lm-filter").forEach(filter => {
                const selected = filter === button;
                filter.classList.toggle("is-active", selected);
                filter.setAttribute("aria-pressed", String(selected));
            });
            renderEntries();
            renderResults();
        });
    });

    document.querySelectorAll(".lm-view-tab").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".lm-view-tab").forEach(tab => {
                const selected = tab === button;
                tab.classList.toggle("is-active", selected);
                tab.setAttribute("aria-pressed", String(selected));
            });
            document.querySelectorAll(".lm-view").forEach(panel => {
                panel.hidden = panel.dataset.panel !== button.dataset.view;
            });
        });
    });

    searchInput.addEventListener("input", () => {
        renderEntries();
        renderResults();
    });

    renderEntries();
    renderResults();
    renderPoints();
    renderOfficialLinks();
}
