import { API_KEY } from './config.js';
import { fetchTopScorers } from './getTopScorers.js';

const leagues = [
  { id: 39, name: 'English Premier League 🇬🇧' },
  { id: 140, name: 'Spanish La Liga 🇪🇸' },
  { id: 135, name: 'Italian Serie A 🇮🇹' },
  { id: 78, name: 'German Bundesliga 🇩🇪' },
  { id: 61, name: 'French Ligue 1 🇫🇷' },
  { id: 203, name: 'Turkish Süper Lig 🇹🇷' },
  { id: 128, name: 'Argentine Primera División 🇦🇷' },
  { id: 262, name: 'Mexican Liga MX 🇲🇽' },
];

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

    // Hae vain maalintekijätilastot
    await fetchTopScorers(leagueId, season);

  } catch (error) {
    console.error('Virhe haettaessa sarjataulukkoa:', error);
    document.getElementById('standings-table').innerHTML = '<tr><td colspan="9">Virhe ladattaessa sarjataulukkoa.</td></tr>';
  }
}

function displayStandings(teams, sortKey = 'points', sortDirection = false) {
  const tableElement = document.getElementById('standings-table');
  tableElement.innerHTML = `
    <tr>
      <th data-sort="rank"></th>
      <th data-sort="team">Joukkue <span class="sort-arrow"></span></th>
      <th data-sort="win">Voitot <span class="sort-arrow"></span></th>
      <th data-sort="draw">Tasapelit <span class="sort-arrow"></span></th>
      <th data-sort="lose">Tappiot <span class="sort-arrow"></span></th>
      <th data-sort="goalsFor">Tehdyt Maalit <span class="sort-arrow"></span></th>
      <th data-sort="goalsAgainst">Päästetyt Maalit <span class="sort-arrow"></span></th>
      <th data-sort="points">Pisteet <span class="sort-arrow"></span></th>
    </tr>
  `;

  let currentSortKey = sortKey;
  let currentSortDirection = sortDirection;

  const updateSortArrow = () => {
    const thElements = tableElement.getElementsByTagName('th');
    for (let th of thElements) {
      const arrow = th.querySelector('.sort-arrow');
      if (arrow) {
        if (th.getAttribute('data-sort') === currentSortKey) {
          arrow.textContent = currentSortDirection ? '↑' : '↓';
        } else {
          arrow.textContent = '';
        }
      }
    }
  };

  const sortedTeams = [...teams].sort((a, b) => {
    let valueA, valueB;

    switch (currentSortKey) {
      case 'team':
        valueA = a.team.name.toLowerCase();
        valueB = b.team.name.toLowerCase();
        return currentSortDirection ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      case 'win':
        valueA = a.all.win;
        valueB = b.all.win;
        return currentSortDirection ? valueA - valueB : valueB - valueA;
      case 'draw':
        valueA = a.all.draw;
        valueB = b.all.draw;
        return currentSortDirection ? valueA - valueB : valueB - valueA;
      case 'lose':
        valueA = a.all.lose;
        valueB = b.all.lose;
        return currentSortDirection ? valueA - valueB : valueB - valueA;
      case 'goalsFor':
        valueA = a.all.goals.for;
        valueB = b.all.goals.for;
        return currentSortDirection ? valueA - valueB : valueB - valueA;
      case 'goalsAgainst':
        valueA = a.all.goals.against;
        valueB = b.all.goals.against;
        return currentSortDirection ? valueA - valueB : valueB - valueA;
      case 'points':
        valueA = a.points;
        valueB = b.points;
        return currentSortDirection ? valueA - valueB : valueB - valueA;
      default:
        return 0;
    }
  });

  sortedTeams.forEach(team => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${team.rank}</td>
      <td><img src="${team.team.logo}" width="20" style="vertical-align: middle; margin-right: 6px;">${team.team.name}</td>
      <td>${team.all.win}</td>
      <td>${team.all.draw}</td>
      <td>${team.all.lose}</td>
      <td>${team.all.goals.for}</td>
      <td>${team.all.goals.against}</td>
      <td>${team.points}</td>
    `;
    tableElement.appendChild(row);
  });

  updateSortArrow();

  const thElements = tableElement.getElementsByTagName('th');
  for (let th of thElements) {
    th.addEventListener('click', () => {
      const newSortKey = th.getAttribute('data-sort');
      if (newSortKey === currentSortKey) {
        currentSortDirection = !currentSortDirection;
      } else {
        currentSortKey = newSortKey;
        currentSortDirection = false;
      }
      displayStandings(teams, currentSortKey, currentSortDirection);
    });
  }
}

document.getElementById('standings-btn').addEventListener('click', fetchStandings);

window.addEventListener('DOMContentLoaded', () => {
  const leagueSelect = document.getElementById('league');
  leagues.forEach(league => {
    const option = document.createElement('option');
    option.value = league.id;
    option.textContent = league.name;
    leagueSelect.appendChild(option);
  });
  document.getElementById('league').value = '39'; // valioliiga oletuksena
  document.getElementById('season').value = '2023'; //kausi oletus
  fetchStandings();
});