import { translations } from './language.js';
import { populateLeagueSelect } from './getStandings.js';

const defaultLang = 'en'; // Oletuskieli: englanti

// Hae tallennettu kieli tai käytä oletuskieltä
let currentLang = localStorage.getItem('language') || defaultLang;
document.documentElement.lang = currentLang;

// Päivitä tekstit kielen mukaan
function updateTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const keys = key.split('.');
    let translation = translations[currentLang];
    for (const k of keys) {
      translation = translation[k];
    }
    element.textContent = translation;
  });

  // Päivitä dokumentin otsikko (title)
  const titleElement = document.querySelector('title');
  const titleKey = titleElement.getAttribute('data-i18n');
  titleElement.textContent = translations[currentLang][titleKey];

  // Päivitä painikkeen teksti (sisältää ikonin, joten säilytetään ikoni)
  const searchButton = document.getElementById('standings-btn');
  searchButton.innerHTML = `${translations[currentLang].searchButton} <i class="bi bi-search"></i>`;

  // Päivitä liigavalikko (maanosien nimet)
  populateLeagueSelect();
}

// Vaihda kieltä ja tallenna valinta
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);
  document.documentElement.lang = lang;
  updateTranslations();
}

// Alusta kieli sivun latautuessa
document.addEventListener('DOMContentLoaded', () => {
  // Aseta kielivalitsimen arvo
  const langSelect = document.getElementById('language');
  langSelect.value = currentLang;

  // Päivitä tekstit
  updateTranslations();

  // Kuuntele kielivalitsimen muutoksia
  langSelect.addEventListener('change', (event) => {
    setLanguage(event.target.value);
    // Hae uudelleen, jotta taulukot päivittyvät
    fetchStandings();
  });
});

export { translations, currentLang };