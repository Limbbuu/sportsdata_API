import { API_KEY } from './config.js';

//export asyncissä = voidaan käyttää myös muualla
export async function fetchTopScorers(leagueId, season) {
  try {
    const response = await fetch(`https://v3.football.api-sports.io/players/topscorers?league=${leagueId}&season=${season}`, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Virhe maalintekijöiden haussa: ${response.status}`);
    }

    const data = await response.json();
    displayTopScorers(data.response);
  } catch (error) {
    console.error('Virhe haettaessa maalintekijöitä:', error);
  }
}

function displayTopScorers(players) {
  const scorersElement = document.getElementById('topscorers-table');
  scorersElement.innerHTML = `
    <tr>
      <th>Pelaaja</th>
      <th>Joukkue</th>
      <th>Tehdyt Maalit</th>
    </tr>   
    `;

  players.forEach(playerData => {
    const player = playerData.player;
    const stats = playerData.statistics[0];


    const row = document.createElement('tr');
    row.innerHTML = `
    <td><img src="${player.photo}" width="30" style="vertical-align:middle; margin-right: 8px;">${player.name}</td>
    <td>${stats.team.name} </td>
    <td>${stats.goals.total} </td>
    `;
    scorersElement.appendChild(row);
  });
}
