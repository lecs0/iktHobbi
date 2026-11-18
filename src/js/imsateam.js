const params = new URLSearchParams(window.location.search);
const teamName = params.get('team');
const carNumber = params.get('number');
const team = imsaGTPTeams.entries.find(entry =>
  carNumber ? entry.number === carNumber && (!teamName || entry.team === teamName) : entry.team === teamName
);

if (!team) {
  document.getElementById('team-name').textContent = 'Team not found';
  document.getElementById('team-manufacturer-logo').hidden = true;
  document.getElementById('team-car-image').hidden = true;
  document.getElementById('team-official-page').hidden = true;
} else {
  const standing = imsaGTPStandings.entries.find(entry => entry.number === team.number);
  document.getElementById('team-name').textContent = team.team;
  document.getElementById('team-number').textContent = `#${team.number}`;
  document.getElementById('team-manufacturer').textContent = team.manufacturer;
  document.getElementById('team-car-model').textContent = team.car.model;
  document.getElementById('team-engine').textContent = team.car.engine;
  document.getElementById('team-power').textContent = `${team.car.max_power_hp} hp`;
  document.getElementById('team-tires').textContent = team.car.tire_supplier;
  if (standing) {
    document.getElementById('team-points').textContent = standing.points.toLocaleString();
    document.getElementById('team-gap-to-leader').textContent = standing.gap_to_leader ? `+${standing.gap_to_leader}` : 'Leader';
  }
  const drivers = document.getElementById('team-drivers');
  for (const driver of team.drivers) {
    const item = document.createElement('li');
    const image = document.createElement('img');
    image.src = driver.image_url;
    image.alt = driver.name;
    image.width = 80;
    const details = document.createElement('span');
    const name = document.createElement('strong');
    const country = document.createElement('small');
    name.textContent = driver.name;
    country.textContent = driver.country;
    details.append(name, country);
    item.append(image, details);
    drivers.appendChild(item);
  }
  const logo = document.getElementById('team-manufacturer-logo');
  logo.src = team.manufacturer_logo_url;
  logo.alt = `${team.manufacturer} logo`;
  const carImage = document.getElementById('team-car-image');
  carImage.src = team.car.image_url;
  carImage.alt = team.car.model;
  document.getElementById('team-official-page').href = team.team_page_url;
}
