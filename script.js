const cityInput = document.getElementById('cityInput');
const suggestionsList = document.getElementById('suggestions');
const cityEl = document.getElementById('city');
const tempEl = document.getElementById('temperature');
const weatherEl = document.getElementById('weather');
const weatherIconEl = document.getElementById('weatherIcon');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const localtimeEl = document.getElementById('localtime');
const errorEl = document.getElementById('error');
const loadingEl = document.getElementById('loading');
const weatherDetailsEl = document.getElementById('weatherDetails');
const cardEl = document.querySelector('.card');

const apiKey = 'b8e3a6afc7a145218d295942250106'; // your key

const weatherBackgrounds = {
  Clear: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  Mist: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=800&q=80',
  Rain: 'https://images.unsplash.com/photo-1526676037889-2cc4de9b1c8b?auto=format&fit=crop&w=800&q=80',
  Snow: 'https://images.unsplash.com/photo-1603782935327-7b6475a2c89f?auto=format&fit=crop&w=800&q=80',
  Cloudy: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80',
  Thunderstorm: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80',
};

let debounceTimeout;

cityInput.addEventListener('input', () => {
  clearTimeout(debounceTimeout);
  const query = cityInput.value.trim();
  if (query.length < 2) {
    suggestionsList.innerHTML = '';
    suggestionsList.style.display = 'none';
    return;
  }
  debounceTimeout = setTimeout(() => {
    fetchCitySuggestions(query);
  }, 300);
});

function fetchCitySuggestions(query) {
  fetch(`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${encodeURIComponent(query)}`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch city suggestions');
      return res.json();
    })
    .then(data => {
      displaySuggestions(data);
    })
    .catch(err => {
      suggestionsList.innerHTML = '';
      suggestionsList.style.display = 'none';
      console.error(err);
    });
}

function displaySuggestions(cities) {
  if (cities.length === 0) {
    suggestionsList.innerHTML = '';
    suggestionsList.style.display = 'none';
    return;
  }
  suggestionsList.innerHTML = cities
    .map(city => `<li data-city="${city.name}" data-country="${city.country}">${city.name}, ${city.region ? city.region + ', ' : ''}${city.country}</li>`)
    .join('');
  suggestionsList.style.display = 'block';

  // Add click listeners
  suggestionsList.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', () => {
      const selectedCity = item.getAttribute('data-city');
      cityInput.value = selectedCity;
      suggestionsList.innerHTML = '';
      suggestionsList.style.display = 'none';
      getWeather(selectedCity);
    });
  });
}

function getWeather(cityName = null) {
  errorEl.textContent = '';
  weatherDetailsEl.style.display = 'none';

  const city = cityName || cityInput.value.trim();
  if (!city) {
    errorEl.textContent = 'Please enter a city name!';
    return;
  }

  loadingEl.style.display = 'block';

  fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`)
    .then(res => {
      if (!res.ok) throw new Error('City not found');
      return res.json();
    })
    .then(data => {
      cityEl.textContent = `${data.location.name}, ${data.location.country}`;
      tempEl.textContent = `${data.current.temp_c}°C`;
      weatherEl.textContent = data.current.condition.text;
      weatherIconEl.src = data.current.condition.icon;
      weatherIconEl.alt = data.current.condition.text;
      humidityEl.textContent = `${data.current.humidity}%`;
      windEl.textContent = `${data.current.wind_kph} km/h`;
      localtimeEl.textContent = data.location.localtime;
      weatherDetailsEl.style.display = 'block';
      errorEl.textContent = '';
      cityInput.value = '';

      // Change background based on weather condition text keyword
      const condition = data.current.condition.text;
      let bgKey = 'Clear'; // fallback

      // Check if condition matches any known background key (ignore case)
      for (const key of Object.keys(weatherBackgrounds)) {
        if (condition.toLowerCase().includes(key.toLowerCase())) {
          bgKey = key;
          break;
        }
      }

      cardEl.style.backgroundImage = `url(${weatherBackgrounds[bgKey]})`;
    })
    .catch(err => {
      errorEl.textContent = err.message;
      cardEl.style.backgroundImage = 'none';
    })
    .finally(() => {
      loadingEl.style.display = 'none';
    });
}
