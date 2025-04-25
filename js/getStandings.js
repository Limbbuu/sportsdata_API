import { API_KEY } from './config.js';

async function fetchStandings() {
  const leagueId = document.getElementById('league').value;
  const season = document.getElementById('season').value;

  try {
    const response = await fetch(`https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season}`, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Virhe haussa: ${response.status}`);
    }

    const data = await response.json();
    const standings = data.response[0].league.standings[0];
    displayStandings(standings);
  } catch (error) {
    console.error('Virhe haettaessa sarjataulukkoa:', error);
  }
}

function displayStandings(teams) {
  const tableElement = document.getElementById('standings-table');
  tableElement.innerHTML = `
    <tr>
      <th></th>
      <th>Joukkue</th>
      <th>Ottelut</th>
      <th>Voitot</th>
      <th>Tasapelit</th>
      <th>Tappiot</th>
      <th>Pisteet</th>
    </tr>
  `;

  teams.forEach(team => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${team.rank}</td>
      <td><img src="${team.team.logo}" width="20" style="vertical-align: middle; margin-right: 6px;">${team.team.name}</td>
      <td>${team.all.played}</td>
      <td>${team.all.win}</td>
      <td>${team.all.draw}</td>
      <td>${team.all.lose}</td>
      <td>${team.points}</td>
    `;
    tableElement.appendChild(row);
  });
}

document.getElementById('standings-btn').addEventListener('click', fetchStandings);
