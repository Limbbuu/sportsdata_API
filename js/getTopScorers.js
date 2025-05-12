import { API_KEY } from './config.js';

// Export asyncissä = voidaan käyttää myös muualla
export async function fetchTopScorers(leagueId, season) {
  console.log('Fetching scorers for league:', leagueId, 'season:', season); // Debug
  const topscorersTable = document.getElementById('topscorers-table');
  topscorersTable.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

  const topscorersCacheKey = `topscorers_${leagueId}_${season}`;
  const cachedTopscorers = localStorage.getItem(topscorersCacheKey);

  if (cachedTopscorers) {
    console.log('Using cached scorers data'); // Debug
    const topscorers = JSON.parse(cachedTopscorers);
    displayTopScorers(topscorers);
    return;
  }

  try {
    const response = await fetch(`https://v3.football.api-sports.io/players/topscorers?league=${leagueId}&season=${season}`, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        topscorersTable.innerHTML = '<tr><td colspan="4">API-requests used. Try again later.</td></tr>';
        return;
      }
      throw new Error(`Error while fetching data: ${response.status}`);
    }

    const data = await response.json();
    console.log('Scorers API response:', data); // Debug
    if (!data.response || data.response.length === 0) {
      console.warn('No player data returned from API');
      topscorersTable.innerHTML = '<tr><td colspan="4">No data available.</td></tr>';
      return;
    }

    const topscorers = data.response;
    localStorage.setItem(topscorersCacheKey, JSON.stringify(topscorers));
    displayTopScorers(topscorers);
  } catch (error) {
    console.error('VError while fetching data.', error);  
    topscorersTable.innerHTML = '<tr><td colspan="4">Error while loading data.</td></tr>';
  }
}

function displayTopScorers(players) {
  const scorersTable = document.getElementById('topscorers-table');
  scorersTable.innerHTML = `
    <tr>
      <th>Player</th>
      <th>Age</th>
      <th>Team</th>
      <th>Matches</th>
      <th>Goals</th>
      <th>Assists</th>
    </tr>   
  `;

  if (!players || players.length === 0) {
    scorersTable.innerHTML += '<tr><td colspan="4">No data available.</td></tr>';
    return;
  }

  players.forEach(playerData => {
    const player = playerData.player;
    const stats = playerData.statistics[0];

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><img src="${player.photo}" width="30" style="vertical-align:middle; margin-right: 8px;">${player.name}</td>
      <td>${player.age || 'Not known.'}</td>
      <td>${stats.team.name || 'Not known.'}</td>
      <td>${stats.games.appearences || '0'}</td>
      <td>${stats.goals.total || 0}</td>
      <td>${stats.goals.assists || 0}</td>
    `;
    scorersTable.appendChild(row);
  });
}