const standingsBody = document.getElementById('standings');

for (const entry of imsaGTPStandings.entries) {
  const url = `imsa/imsateampage.html?team=${encodeURIComponent(entry.team)}&number=${encodeURIComponent(entry.number)}`;
  const row = document.createElement('tr');
  row.innerHTML = `
    <td class="position">${String(entry.position).padStart(2, '0')}</td>
    <td><a class="team-link" href="${url}"><span class="entry-number">#${entry.number}</span><span><strong>${entry.team}</strong><small>${entry.car_model}</small></span></a></td>
    <td class="manufacturer"><img src="${entry.manufacturer_logo_url}" alt="">${entry.manufacturer}</td>
    <td class="drivers-cell">${entry.drivers_listed_on_team_page.join(' / ')}</td>
    <td class="points">${entry.points.toLocaleString()}</td>
    <td class="gap">${entry.gap_to_leader === 0 ? 'LEADER' : '+' + entry.gap_to_leader}</td>
    <td class="row-arrow" aria-hidden="true">↗</td>`;
  row.addEventListener('click', event => {
    if (!event.target.closest('a')) window.location.href = url;
  });
  standingsBody.appendChild(row);
}
