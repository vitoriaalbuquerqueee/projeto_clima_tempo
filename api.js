/**
 * @fileoverview Módulo responsável pela integração com a API do Open-Meteo e manipulação de dados meteorológicos.
 */

/**
 * Dicionário que mapeia os códigos de condição meteorológica da WMO (World Meteorological Organization)
 * para suas respectivas descrições e classes de ícones (dia e noite).
 *
 * @constant {Object.<number, {description: string, iconDay: string, iconNight: string}>}
 */
const weatherMap = {
  0: { description: 'Céu Limpo', iconDay: 'wi-day-sunny', iconNight: 'wi-night-clear' },
  1: { description: 'Predominantemente Ensolarado', iconDay: 'wi-day-sunny-overcast', iconNight: 'wi-night-partly-cloudy' },
  2: { description: 'Parcialmente Nublado', iconDay: 'wi-day-cloudy', iconNight: 'wi-night-alt-cloudy' },
  3: { description: 'Nublado', iconDay: 'wi-cloudy', iconNight: 'wi-cloudy' },
  45: { description: 'Nevoeiro', iconDay: 'wi-fog', iconNight: 'wi-fog' },
  48: { description: 'Nevoeiro com Geada', iconDay: 'wi-fog', iconNight: 'wi-fog' },
  51: { description: 'Garoa Leve', iconDay: 'wi-day-sprinkle', iconNight: 'wi-night-alt-sprinkle' },
  53: { description: 'Garoa Moderada', iconDay: 'wi-sprinkle', iconNight: 'wi-sprinkle' },
  55: { description: 'Garoa Densa', iconDay: 'wi-rain', iconNight: 'wi-rain' },
  61: { description: 'Chuva Leve', iconDay: 'wi-day-rain', iconNight: 'wi-night-alt-rain' },
  63: { description: 'Chuva Moderada', iconDay: 'wi-rain', iconNight: 'wi-rain' },
  65: { description: 'Chuva Forte', iconDay: 'wi-rain-wind', iconNight: 'wi-rain-wind' },
  71: { description: 'Neve Leve', iconDay: 'wi-day-snow', iconNight: 'wi-night-alt-snow' },
  73: { description: 'Neve Moderada', iconDay: 'wi-snow', iconNight: 'wi-snow' },
  75: { description: 'Neve Intensa', iconDay: 'wi-snow', iconNight: 'wi-snow' },
  80: { description: 'Pancadas de Chuva Leves', iconDay: 'wi-day-showers', iconNight: 'wi-night-alt-showers' },
  81: { description: 'Pancadas de Chuva Moderadas', iconDay: 'wi-showers', iconNight: 'wi-showers' },
  82: { description: 'Pancadas de Chuva Violentas', iconDay: 'wi-thunderstorm', iconNight: 'wi-thunderstorm' },
  95: { description: 'Tempestade', iconDay: 'wi-thunderstorm', iconNight: 'wi-thunderstorm' },
  96: { description: 'Tempestade com Granizo Leve', iconDay: 'wi-storm-showers', iconNight: 'wi-storm-showers' },
  99: { description: 'Tempestade com Granizo Forte', iconDay: 'wi-storm-showers', iconNight: 'wi-storm-showers' }
};

/**
 * Busca dados meteorológicos de uma determinada cidade utilizando as APIs Open-Meteo.
 *
 * @async
 * @param {string} cityName - O nome da cidade a ser consultada.
 * @param {Function} [fetchClient=fetch] - Cliente de requisição HTTP utilizado (padrão é o `fetch` nativo).
 * @returns {Promise<{name: string, country: string, temperature: number, isDay: boolean, description: string, iconClass: string}>} Objeto contendo os dados climáticos processados.
 *
 * @throws {Error} Lança exceção se o nome da cidade for inválido, vazio ou não string.
 * @throws {Error} Lança exceção se a requisição estourar o limite de requisições (Status HTTP 429).
 * @throws {Error} Lança exceção se houver falha de comunicação com as APIs.
 * @throws {Error} Lança exceção se a cidade não for encontrada.
 * @throws {Error} Lança exceção se a estrutura do JSON retornado for inesperada.
 *
 * @example
 * const weatherData = await fetchWeatherData('São Paulo');
 * console.log(weatherData.temperature); // Retorna a temperatura formatada em °C
 */
async function fetchWeatherData(cityName, fetchClient = fetch) {
  if (!cityName || typeof cityName !== 'string' || cityName.trim() === '') {
    throw new Error('Nome de cidade inválido ou vazio.');
  }

  // 1. Geocodificação
  const geoResponse = await fetchClient(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=pt&format=json`
  );

  if (!geoResponse.ok) {
    if (geoResponse.status === 429) {
      throw new Error('Limite de requisições excedido. Tente novamente mais tarde.');
    }
    throw new Error('Falha na comunicação com a API de Geocodificação.');
  }

  const geoData = await geoResponse.json();

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error('Cidade não encontrada.');
  }

  const { latitude, longitude, name, country } = geoData.results[0];

  // 2. Consulta de Clima
  const weatherResponse = await fetchClient(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
  );

  if (!weatherResponse.ok) {
    if (weatherResponse.status === 429) {
      throw new Error('Limite de requisições excedido. Tente novamente mais tarde.');
    }
    throw new Error('Falha na comunicação com a API do Clima.');
  }

  const weatherData = await weatherResponse.json();

  if (!weatherData.current_weather || typeof weatherData.current_weather.temperature === 'undefined') {
    throw new Error('Formato de resposta inesperado da API.');
  }

  const current = weatherData.current_weather;
  const isDay = current.is_day === 1;
  const weatherInfo = weatherMap[current.weathercode] || {
    description: 'Condição Desconhecida',
    iconDay: 'wi-day-cloudy',
    iconNight: 'wi-night-cloudy'
  };

  return {
    name,
    country,
    temperature: Math.round(current.temperature),
    isDay,
    description: weatherInfo.description,
    iconClass: isDay ? weatherInfo.iconDay : weatherInfo.iconNight
  };
}

// Manipulação do DOM no navegador
if (typeof document !== 'undefined') {
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const cityInput = document.getElementById('cityInput');
      const cityName = cityInput.value.trim();

      const errorMessage = document.getElementById('errorMessage');
      const weatherResult = document.getElementById('weatherResult');
      const temperatureElement = document.getElementById('temperature');
      const locationNameElement = document.getElementById('locationName');
      const weatherDescriptionElement = document.getElementById('weatherDescription');
      const currentDateElement = document.getElementById('currentDate');
      const weatherIconElement = document.getElementById('weatherIcon');

      errorMessage.classList.add('hidden');
      weatherResult.classList.add('hidden');

      try {
        const data = await fetchWeatherData(cityName);

        if (data.isDay) {
          document.body.classList.remove('night-theme');
          document.body.classList.add('day-theme');
        } else {
          document.body.classList.remove('day-theme');
          document.body.classList.add('night-theme');
        }

        weatherIconElement.className = `wi ${data.iconClass}`;
        temperatureElement.textContent = data.temperature;
        locationNameElement.textContent = `${data.name}, ${data.country}`;
        weatherDescriptionElement.textContent = data.description;

        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        currentDateElement.textContent = new Date().toLocaleDateString('pt-BR', options);

        weatherResult.classList.remove('hidden');
      } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
      }
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fetchWeatherData, weatherMap };
}