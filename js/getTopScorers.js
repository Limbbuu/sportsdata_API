import { API_KEY } from './config.js';

// Export asyncissä = voidaan käyttää myös muualla
export async function fetchTopScorers(leagueId, season) {
  console.log('Fetching scorers for league:', leagueId, 'season:', season); // Debug
  try {
    const response = await fetch(`https://v3.football.api-sports.io/players/topscorers?league=${leagueId}&season=${season}`, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Virhe tilastojen hakemisessa: ${response.status}`);
    }

    const data = await response.json();
    console.log('Scorers API response:', data); // Debug
    if (!data.response || data.response.length === 0) {
      console.warn('No player data returned from API');
      document.getElementById('topscorers-table').innerHTML = '<tr><td colspan="4">Ei tilastoja saatavilla.</td></tr>';
      return;
    }

    displayTopScorers(data.response);
  } catch (error) {
    console.error('Virhe haettaessa tilastoja:', error);  
    document.getElementById('topscorers-table').innerHTML = '<tr><td colspan="4">Virhe ladattaessa tilastoja.</td></tr>';
  }
}

function displayTopScorers(players) {
  const scorersTable = document.getElementById('topscorers-table');
  scorersTable.innerHTML = `
    <tr>
      <th>Pelaaja</th>
      <th>Joukkue</th>
      <th>Tehdyt Maalit</th>
      <th>Syötöt</th>
    </tr>   
  `;

  if (!players || players.length === 0) {
    scorersTable.innerHTML += '<tr><td colspan="4">Ei tilastoja saatavilla.</td></tr>';
    return;
  }

  players.forEach(playerData => {
    const player = playerData.player;
    const stats = playerData.statistics[0];

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><img src="${player.photo}" width="30" style="vertical-align:middle; margin-right: 8px;">${player.name}</td>
      <td>${stats.team.name || 'Ei tiedossa'}</td>
      <td>${stats.goals.total || 0}</td>
      <td>${stats.goals.assists || 0}</td>
    `;
    scorersTable.appendChild(row);
  });
}