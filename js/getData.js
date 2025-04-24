import { API_KEY } from './config.js';

const LEAGUE_ID = 39; // valioliigaID 
const SEASON = 2023; //kausi

async function fetchTeams() {
  try {
    const response = await fetch(`https://v3.football.api-sports.io/teams?league=${LEAGUE_ID}&season=${SEASON}`, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Virhe haussa: ${response.status}`);
    }

    const data = await response.json();
    const teams = data.response;
    displayTeams(teams);
  } catch (error) {
    console.error('Virhe haettaessa joukkueita:', error);
  }
}

function displayTeams(teams) {
  const listElement = document.getElementById('teams-list');
  listElement.innerHTML = '';

  teams.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="${item.team.logo}" width="30" style="vertical-align:middle; margin-right: 8px;">
      ${item.team.name}
    `;
    listElement.appendChild(li);
  });
}

document.getElementById('fetch-teams').addEventListener('click', fetchTeams);
