import { API_KEY } from './config.js';
import { fetchTopScorers } from './getTopScorers.js';
import { translations, currentLang  } from '././i18n.js';

const leagues = [
  { id: 39, name: 'English Premier League 🇬🇧', continent: 'Europe' },
  { id: 140, name: 'Spanish La Liga 🇪🇸', continent: 'Europe' },
  { id: 135, name: 'Italian Serie A 🇮🇹', continent: 'Europe' },
  { id: 78, name: 'German Bundesliga 🇩🇪', continent: 'Europe' },
  { id: 61, name: 'French Ligue 1 🇫🇷', continent: 'Europe' },
  { id: 203, name: 'Turkish Süper Lig 🇹🇷', continent: 'Europe' },
  { id: 128, name: 'Argentine Primera División 🇦🇷', continent: 'South-America' },
  { id: 262, name: 'Mexican Liga MX 🇲🇽', continent: 'North-America' },
  { id: 253, name: 'Major League Soccer 🇺🇸', continent: 'North-America' },
  { id: 386, name: 'Premiere Division 🇨🇮', continent: 'Africa' },
];

async function fetchStandings() {
  const leagueId = document.getElementById('league').value;
  const season = document.getElementById('season').value;
  const tableElement = document.getElementById('standings-table');
  tableElement.innerHTML = `<tr><td colspan="9">${translations[currentLang].messages.loading}tr</td></tr>`; //latausindikaattori dataa hakiessa

    //tallennetaan hakuja lokalstorageen, jotta vähennetään API-kutsujan määrää
  const standingsCacheKey = `standings_${leagueId}_${season}`;
  const cachedStandings = localStorage.getItem(standingsCacheKey);

  if (cachedStandings) {
    const standings = JSON.parse(cachedStandings);
    displayStandings(standings);
    await fetchTopScorers(leagueId,season);
    return;
  }

  try {
    const response = await fetch(`https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season}`, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        //API-rajan ylityksen ilmoitus
        tableElement.innerHTML = `<tr><td colspan="9">${translations[currentLang].messages.apiLimit}</td></tr>`;
        return;
      }
      throw new Error(`Error on response: ${response.status}`);
    }

    const data = await response.json();
    const standings = data.response[0].league.standings[0];
    localStorage.setItem(standingsCacheKey, JSON.stringify(standings));
    displayStandings(standings);

    await fetchTopScorers(leagueId, season);

  } catch (error) {
    console.error('Error while fetching standings:', error);
    tableElement.innerHTML = `<tr><td colspan="9">${translations[currentLang].messages.error}</td></tr>`;
  }
}

function displayStandings(teams, sortKey = 'points', sortDirection = false) {
  const tableElement = document.getElementById('standings-table');
  const t = translations[currentLang].standingsTable;
  tableElement.innerHTML = `
    <tr>
      <th data-sort="rank"></th>
      <th data-sort="team">${t.team} <span class="sort-arrow"></span></th>
      <th data-sort="played">${t.played}<span class="sort-arrow"></span></th>
      <th data-sort="win">${t.wins}<span class="sort-arrow"></span></th>
      <th data-sort="draw">${t.draws}<span class="sort-arrow"></span></th>
      <th data-sort="lose">${t.losses}<span class="sort-arrow"></span></th>
      <th data-sort="goalsFor">${t.goalsFor}<span class="sort-arrow"></span></th>
      <th data-sort="goalsAgainst">${t.goalsAgainst}<span class="sort-arrow"></span></th>
      <th data-sort="goalDiff">${t.goalDiff}<span class="sort-arrow"></span></th>
      <th data-sort="points">${t.points}<span class="sort-arrow"></span></th>
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
      case 'playedGames': //lasketaa otteluiden määrä yhteenlaskemalla W/D/L
      valueA = a.all.win + a.all.draw + a.all.lose;
        valueB = b.all.win + b.all.draw + b.all.lose;
        return currentSortDirection ? valueA - valueB : valueB - valueA;
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
      case 'goalDiff':
        valueA = a.all.goals.for - a.all.goals.against;
        valueB = b.all.goals.for - b.all.goals.against;
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
    const playedMatches = team.all.win + team.all.draw + team.all.lose;
    const goalDifference = team.all.goals.for - team.all.goals.against;
    const goalDifferenceDisplay = goalDifference > 0 ? `+${goalDifference}` : goalDifference;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${team.rank}</td>
      <td><img src="${team.team.logo}" width="20" style="vertical-align: middle; margin-right: 6px;">${team.team.name}</td>
      <td>${playedMatches}</td>
      <td>${team.all.win}</td>
      <td>${team.all.draw}</td>
      <td>${team.all.lose}</td>
      <td>${team.all.goals.for}</td>
      <td>${team.all.goals.against}</td>
      <td>${goalDifferenceDisplay}</td>
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
  
  const continents = [...new Set(leagues.map(league => league.continent))];
  
  continents.forEach(continent => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = continent;
    
    const continentLeagues = leagues.filter(league => league.continent === continent);
    continentLeagues.forEach(league => {
      const option = document.createElement('option');
      option.value = league.id;
      option.textContent = league.name;
      optgroup.appendChild(option);
    });
    
    leagueSelect.appendChild(optgroup);
  });

  document.getElementById('league').value = '39';
  fetchStandings();
});