// Travel Recommendation App Logic
let travelData = null;

// Fetch travel recommendations from JSON API
async function loadTravelData() {
  try {
    const response = await fetch('./travel_recommendation_api.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    travelData = await response.json();
    console.log("Travel data loaded successfully:", travelData);
  } catch (error) {
    console.error("Failed to load travel recommendations:", error);
  }
}

// Map places to their respective IANA timezones
function getTimeZone(name) {
  const n = name.toLowerCase();
  if (n.includes('sydney') || n.includes('australia')) return 'Australia/Sydney';
  if (n.includes('melbourne')) return 'Australia/Melbourne';
  if (n.includes('tokyo') || n.includes('japan')) return 'Asia/Tokyo';
  if (n.includes('kyoto')) return 'Asia/Tokyo';
  if (n.includes('rio') || n.includes('são paulo') || n.includes('brazil') || n.includes('copacabana')) return 'America/Sao_Paulo';
  if (n.includes('angkor') || n.includes('cambodia')) return 'Asia/Phnom_Penh';
  if (n.includes('taj') || n.includes('india')) return 'Asia/Kolkata';
  if (n.includes('bora bora')) return 'Pacific/Tahiti';
  return null;
}

function getLocalTime(tz) {
  if (!tz) return '';
  try {
    const options = { timeZone: tz, hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return new Date().toLocaleTimeString('en-US', options);
  } catch (e) {
    return '';
  }
}

// Search Handler
function handleSearch() {
  const searchInput = document.getElementById('search-input');
  const resultsContainer = document.getElementById('results-container');
  if (!searchInput || !resultsContainer) return;

  const query = searchInput.value.trim().toLowerCase();
  resultsContainer.innerHTML = '';

  if (!query) {
    alert("Please enter a destination, keyword (beach, temple, country), or country name!");
    return;
  }

  if (!travelData) {
    alert("Data is still loading, please try again in a moment.");
    return;
  }

  let results = [];

  // 1. Keyword: Beach / Beaches
  if (query === 'beach' || query === 'beaches') {
    results = travelData.beaches || [];
  }
  // 2. Keyword: Temple / Temples
  else if (query === 'temple' || query === 'temples') {
    results = travelData.temples || [];
  }
  // 3. Keyword: Country / Countries
  else if (query === 'country' || query === 'countries') {
    if (travelData.countries) {
      travelData.countries.forEach(country => {
        if (country.cities) {
          results.push(...country.cities);
        }
      });
    }
  }
  // 4. Specific Country search (Australia, Japan, Brazil)
  else {
    const matchedCountry = travelData.countries.find(
      c => c.name.toLowerCase() === query
    );
    if (matchedCountry && matchedCountry.cities) {
      results = matchedCountry.cities;
    } else {
      // General city / place match
      travelData.countries.forEach(c => {
        c.cities.forEach(city => {
          if (city.name.toLowerCase().includes(query)) results.push(city);
        });
      });
      travelData.temples.forEach(t => {
        if (t.name.toLowerCase().includes(query)) results.push(t);
      });
      travelData.beaches.forEach(b => {
        if (b.name.toLowerCase().includes(query)) results.push(b);
      });
    }
  }

  // Render cards
  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div class="card" style="grid-column: 1 / -1; padding: 24px; text-align: center;">
        <h2 style="color: #f87171;">No destinations found</h2>
        <p style="color: #cbd5e1; margin-top: 8px;">Try searching for "beach", "temple", "country", "Australia", "Japan", or "Brazil".</p>
      </div>`;
    return;
  }

  results.forEach(place => {
    const tz = getTimeZone(place.name);
    const timeStr = tz ? `Local Time: ${getLocalTime(tz)}` : '';

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${place.imageUrl}" alt="${place.name}" onerror="this.src='assets/sydney.jpg'">
      <div class="card-body">
        <h3 class="card-title">${place.name}</h3>
        ${timeStr ? `<div class="card-time">${timeStr}</div>` : ''}
        <p class="card-text">${place.description}</p>
        <button class="card-btn">Visit</button>
      </div>
    `;
    resultsContainer.appendChild(card);
  });
}

// Clear Handler
function handleClear() {
  const searchInput = document.getElementById('search-input');
  const resultsContainer = document.getElementById('results-container');
  if (searchInput) searchInput.value = '';
  if (resultsContainer) resultsContainer.innerHTML = '';
}

// Attach event listeners upon DOM load
document.addEventListener('DOMContentLoaded', () => {
  loadTravelData();

  const searchBtn = document.getElementById('btn-search');
  const clearBtn = document.getElementById('btn-clear');
  const searchInput = document.getElementById('search-input');

  if (searchBtn) searchBtn.addEventListener('click', handleSearch);
  if (clearBtn) clearBtn.addEventListener('click', handleClear);
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
  }
});
