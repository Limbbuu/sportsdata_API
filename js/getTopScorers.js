import { API_KEY } from './config.js';
import { translations, currentLang } from './i18n.js';

// Export asyncissä = voidaan käyttää myös muualla
export async function fetchTopScorers(leagueId, season) {
  const topscorersTable = document.getElementById('topscorers-table');
  topscorersTable.innerHTML = `<tr><td colspan="6">${translations[currentLang].messages.loading}</td></tr>`;

  const topscorersCacheKey = `topscorers_${leagueId}_${season}`;
  const cachedTopscorers = localStorage.getItem(topscorersCacheKey);

  if (cachedTopscorers) {
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
        topscorersTable.innerHTML = `<tr><td colspan="6">${translations[currentLang].messages.apiLimit}</td></tr>`;
        return;
      }
      throw new Error(`Error while fetching data: ${response.status}`);
    }

    const data = await response.json();
    if (!data.response || data.response.length === 0) {
      topscorersTable.innerHTML = `<tr><td colspan="6">${translations[currentLang].messages.noData}</td></tr>`;
      return;
    }

    const topscorers = data.response;
    localStorage.setItem(topscorersCacheKey, JSON.stringify(topscorers));
    displayTopScorers(topscorers);
  } catch (error) {  
    topscorersTable.innerHTML = `<tr><td colspan="6">${translations[currentLang].messages.error}</td></tr>`;
  }
}

function displayTopScorers(players) {
  const scorersTable = document.getElementById('topscorers-table');
  const t = translations[currentLang].topScorersTable;
  scorersTable.innerHTML = `
    <tr>
      <th>${t.player}</th>
      <th>${t.age}</th>
      <th>${t.team}</th>
      <th>${t.games}</th>
      <th>${t.goals}</th>
      <th>${t.assists}</th>
    </tr>  
  `;

  if (!players || players.length === 0) {
    scorersTable.innerHTML += `<tr><td colspan="6">${translations[currentLang].messages.noData}</td></tr>`;
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