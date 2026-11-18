const standingsContainer = document.getElementById('standings');
const classNav = document.getElementById('class-nav');
const escapeHtml = value => String(value ?? '—').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

for (const [className, entries] of Object.entries(imsaTeams.classes)) {
  const classId = `class-${className.toLowerCase().replace(/\s+/g, '-')}`;
  const navLink = document.createElement('a');
  navLink.href = `#${classId}`;
  navLink.textContent = className;
  classNav.appendChild(navLink);

  const section = document.createElement('section');
  section.id = classId;
  section.className = 'class-section';
  section.innerHTML = `
    <div class="class-heading"><h3>${escapeHtml(className)}</h3><span>${entries.length} ENTRIES</span></div>
    <div class="table-wrap"><table><thead><tr><th>POS</th><th>TEAM / CAR</th><th>MANUFACTURER</th><th>DRIVERS</th><th>POINTS</th><th>GAP</th><th><span class="sr-only">Team page</span></th></tr></thead><tbody></tbody></table></div>`;
  const body = section.querySelector('tbody');
  const sortedEntries = [...entries].sort((a, b) => (a.standings?.position ?? Infinity) - (b.standings?.position ?? Infinity));
  for (const entry of sortedEntries) {
    const standing = entry.standings;
    const url = `imsa/imsateampage.html?class=${encodeURIComponent(className)}&team=${encodeURIComponent(entry.team)}&number=${encodeURIComponent(entry.number)}`;
    const row = document.createElement('tr');
    const logo = entry.manufacturer_logo_url ? `<img src="${escapeHtml(entry.manufacturer_logo_url)}" alt="">` : '';
    row.innerHTML = `
      <td class="position">${standing?.position != null ? String(standing.position).padStart(2, '0') : '—'}</td>
      <td><a class="team-link" href="${escapeHtml(url)}"><span class="entry-number">#${escapeHtml(entry.number)}</span><span><strong>${escapeHtml(entry.team)}</strong><small>${escapeHtml(entry.car?.model)}</small></span></a></td>
      <td class="manufacturer">${logo}${escapeHtml(entry.manufacturer)}</td>
      <td class="drivers-cell">${escapeHtml((entry.drivers || []).map(driver => driver.name).join(' / ') || '—')}</td>
      <td class="points">${standing?.points != null ? standing.points.toLocaleString() : '—'}</td>
      <td class="gap">${standing?.gap_to_leader == null ? '—' : (standing.gap_to_leader === 0 ? 'LEADER' : '+' + standing.gap_to_leader)}</td>
      <td class="row-arrow" aria-hidden="true">↗</td>`;
    row.addEventListener('click', event => {
      if (!event.target.closest('a')) window.location.href = url;
    });
    body.appendChild(row);
  }
  standingsContainer.appendChild(section);
}
