// Consome a API de geocodificação para obter as coordenadas e requisita os dados climáticos atuais e diários
async function fetchWeatherData(city, fetchFn = (typeof window !== 'undefined' ? window.fetch : fetch)) {
  if (!city || typeof city !== 'string' || !city.trim()) {
    throw new Error('Nome de cidade inválido ou vazio.');
  }

  const cleanCity = city.trim();
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanCity)}&count=1&language=pt&format=json`;
  
  let geoResponse;
  try {
    geoResponse = await fetchFn(geoUrl);
  } catch (err) {
    throw new Error('Falha na comunicação com a API de Geocodificação.');
  }

  if (geoResponse.status === 429) {
    throw new Error('Limite de requisições excedido. Tente novamente mais tarde.');
  }

  if (!geoResponse.ok) {
    throw new Error('Falha na comunicação com a API de Geocodificação.');
  }

  const geoData = await geoResponse.json();
  if (!geoData || !geoData.results || geoData.results.length === 0) {
    throw new Error('Cidade não encontrada.');
  }

  const { latitude, longitude, name, country } = geoData.results[0];
  
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;

  let weatherResponse;
  try {
    weatherResponse = await fetchFn(weatherUrl);
  } catch (err) {
    throw new Error('Falha na comunicação com a API do Clima.');
  }

  if (weatherResponse.status === 429) {
    throw new Error('Limite de requisições excedido. Tente novamente mais tarde.');
  }

  if (!weatherResponse.ok) {
    throw new Error('Falha na comunicação com a API do Clima.');
  }

  const weatherData = await weatherResponse.json();
  if (!weatherData || !weatherData.current || typeof weatherData.current.temperature_2m === 'undefined') {
    throw new Error('Formato de resposta inesperado da API.');
  }

  const current = weatherData.current;
  const isDay = current.is_day === 1 || current.is_day === true;
  const weatherInfo = mapWeatherCode(current.weather_code, isDay);

  const result = {
    name,
    country,
    temperature: Math.round(current.temperature_2m),
    isDay,
    description: weatherInfo.description,
    iconClass: weatherInfo.iconClass,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    precipitation: current.precipitation
  };

  if (weatherData.daily && Array.isArray(weatherData.daily.time) && weatherData.daily.time.length > 0) {
    const { time, weather_code, temperature_2m_max, temperature_2m_min } = weatherData.daily;
    result.dailyForecast = [];
    for (let i = 0; i < time.length; i++) {
      const dayInfo = mapWeatherCode(weather_code[i], true);
      result.dailyForecast.push({
        date: time[i],
        maxTemp: Math.round(temperature_2m_max[i]),
        minTemp: Math.round(temperature_2m_min[i]),
        description: dayInfo.description,
        iconClass: dayInfo.iconClass
      });
    }
  }

  return result;
}

// Executa requisições em paralelo para a funcionalidade de comparação
async function fetchMultipleCities(cities, fetchFn = (typeof window !== 'undefined' ? window.fetch : fetch)) {
  const promises = cities.map(city => fetchWeatherData(city, fetchFn));
  return Promise.all(promises);
}

// Mapeia o código meteorológico para a descrição e classe de ícone correspondente
function mapWeatherCode(code, isDay) {
  const timePrefix = isDay ? 'day' : 'night';
  switch (code) {
    case 0:
      return { description: 'Céu limpo', iconClass: isDay ? 'wi-day-sunny' : 'wi-night-clear' };
    case 1:
    case 2:
      return { description: 'Parcialmente nublado', iconClass: `wi-${timePrefix}-cloudy` };
    case 3:
      return { description: 'Nublado', iconClass: 'wi-cloudy' };
    case 61:
    case 63:
    case 65:
      return { description: 'Chuva', iconClass: `wi-${timePrefix}-rain` };
    case 95:
      return { description: 'Tempestade', iconClass: `wi-${timePrefix}-thunderstorm` };
    default:
      return { description: 'Variável', iconClass: `wi-${timePrefix}-cloudy` };
  }
}

// Converte a string de data YYYY-MM-DD em um rótulo do dia da semana
function formatDateLabel(dateString, index) {
  if (index === 0) return 'Hoje';
  const date = new Date(dateString + 'T00:00:00');
  const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
  return dayName.replace('.', '');
}

// Manipulação de eventos e atualização do DOM
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const cityInput = document.getElementById('cityInput');
    const errorMessage = document.getElementById('errorMessage');
    const weatherCard = document.getElementById('weatherCard');
    const toggleCompareBtn = document.getElementById('toggleCompareBtn');
    const forecastContainer = document.getElementById('forecastContainer');
    
    const compareSection = document.getElementById('compareSection');
    const compareInput = document.getElementById('compareInput');
    const addCompareBtn = document.getElementById('addCompareBtn');
    const compareList = document.getElementById('compareList');
    const runCompareBtn = document.getElementById('runCompareBtn');
    const clearCompareBtn = document.getElementById('clearCompareBtn');
    const comparisonTable = document.getElementById('comparisonTable');
    const comparisonBody = document.getElementById('comparisonBody');
    const starsContainer = document.getElementById('starsContainer');

    let currentMainCity = '';
    let compareCitiesList = [];

    function generateStars() {
      if (!starsContainer) return;
      starsContainer.innerHTML = '';
      const starCount = 60;
      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        starsContainer.appendChild(star);
      }
    }

    function applyInitialTheme() {
      const currentHour = new Date().getHours();
      const isDaytime = currentHour >= 6 && currentHour < 18;
      setTheme(isDaytime);
    }

    function setTheme(isDay) {
      if (isDay) {
        document.body.classList.remove('night-theme');
        document.body.classList.add('day-theme');
      } else {
        document.body.classList.remove('day-theme');
        document.body.classList.add('night-theme');
        generateStars();
      }
    }

    applyInitialTheme();

    if (searchForm) {
      searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const city = cityInput.value.trim();
        if (!city) return;

        errorMessage.classList.add('hidden');
        
        try {
          const data = await fetchWeatherData(city);
          currentMainCity = data.name;

          setTheme(data.isDay);
          
          document.getElementById('cityName').textContent = `${data.name}, ${data.country}`;
          document.getElementById('tempValue').textContent = data.temperature;
          document.getElementById('weatherIcon').className = `wi ${data.iconClass}`;
          document.getElementById('weatherDesc').textContent = data.description;
          document.getElementById('humidityVal').textContent = `${data.humidity}%`;
          document.getElementById('windVal').textContent = `${data.windSpeed} km/h`;
          document.getElementById('precipVal').textContent = `${data.precipitation} mm`;

          if (forecastContainer) {
            if (data.dailyForecast && data.dailyForecast.length > 0) {
              forecastContainer.innerHTML = data.dailyForecast.map((day, index) => `
                <div class="forecast-day-card">
                  <div class="forecast-date">${formatDateLabel(day.date, index)}</div>
                  <i class="wi ${day.iconClass} forecast-icon" title="${day.description}"></i>
                  <div class="forecast-temps">
                    <span class="forecast-max">${day.maxTemp}°</span>
                    <span class="forecast-min">${day.minTemp}°</span>
                  </div>
                </div>
              `).join('');
            } else {
              forecastContainer.innerHTML = '';
            }
          }

          weatherCard.classList.remove('hidden');
        } catch (err) {
          errorMessage.textContent = err.message;
          errorMessage.classList.remove('hidden');
          weatherCard.classList.add('hidden');
        }
      });
    }

    if (toggleCompareBtn) {
      toggleCompareBtn.addEventListener('click', () => {
        compareSection.classList.remove('hidden');
        if (currentMainCity && !compareCitiesList.includes(currentMainCity)) {
          compareCitiesList.push(currentMainCity);
          renderCompareTags();
        }
      });
    }

    if (addCompareBtn) {
      addCompareBtn.addEventListener('click', () => {
        const city = compareInput.value.trim();
        if (!city) return;
        if (compareCitiesList.length >= 5) {
          alert('Limite de 5 cidades atingido.');
          return;
        }
        if (!compareCitiesList.includes(city)) {
          compareCitiesList.push(city);
          renderCompareTags();
          compareInput.value = '';
        }
      });
    }

    function renderCompareTags() {
      compareList.innerHTML = compareCitiesList
        .map(c => `<li>${c}</li>`)
        .join('');
    }

    if (runCompareBtn) {
      runCompareBtn.addEventListener('click', async () => {
        if (compareCitiesList.length < 2) {
          alert('Adicione pelo menos 2 cidades para comparar.');
          return;
        }

        try {
          const results = await fetchMultipleCities(compareCitiesList);
          comparisonBody.innerHTML = results.map(data => `
            <tr>
              <td><strong>${data.name}</strong></td>
              <td><i class="wi ${data.iconClass}"></i> ${data.description}</td>
              <td><strong>${data.temperature}°C</strong></td>
              <td>${data.humidity}%</td>
              <td>${data.windSpeed} km/h</td>
              <td>${data.precipitation} mm</td>
            </tr>
          `).join('');
          
          comparisonTable.classList.remove('hidden');
        } catch (err) {
          alert('Erro ao buscar dados de comparação: ' + err.message);
        }
      });
    }

    if (clearCompareBtn) {
      clearCompareBtn.addEventListener('click', () => {
        compareCitiesList = [];
        renderCompareTags();
        comparisonTable.classList.add('hidden');
      });
    }
  });
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = { fetchWeatherData, fetchMultipleCities, mapWeatherCode };
}

// Exporta as funções para suportar testes com o framework Jest
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = { fetchWeatherData, fetchMultipleCities, mapWeatherCode };
}