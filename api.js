// Dicionário de códigos WMO da Open-Meteo para texto e ícones Weather Icons
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

document.getElementById('searchForm').addEventListener('submit', async function (event) {
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

  if (!cityName) {
    errorMessage.textContent = 'Por favor, digite o nome de uma cidade.';
    errorMessage.classList.remove('hidden');
    return;
  }

  try {
    // 1. Busca coordenadas geográficas
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=pt&format=json`
    );

    if (!geoResponse.ok) {
      throw new Error('Falha na comunicação com o serviço de geocodificação.');
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      errorMessage.textContent = 'Cidade não encontrada. Tente novamente.';
      errorMessage.classList.remove('hidden');
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // 2. Consulta os dados do clima usando as coordenadas obtidas
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );

    if (!weatherResponse.ok) {
      throw new Error('Falha na comunicação com o serviço de meteorologia.');
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current_weather;

    // 3. Define o tema (Dia ou Noite)
    const isDay = current.is_day === 1;
    if (isDay) {
      document.body.classList.remove('night-theme');
      document.body.classList.add('day-theme');
    } else {
      document.body.classList.remove('day-theme');
      document.body.classList.add('night-theme');
    }

    // 4. Mapeia o código do clima para ícone e descrição
    const weatherInfo = weatherMap[current.weathercode] || {
      description: 'Condição Desconhecida',
      iconDay: 'wi-day-cloudy',
      iconNight: 'wi-night-cloudy'
    };

    const iconClass = isDay ? weatherInfo.iconDay : weatherInfo.iconNight;
    weatherIconElement.className = `wi ${iconClass}`;

    // 5. Formata a data atual por extenso (ex: segunda-feira, 13 de outubro de 2025)
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = new Date().toLocaleDateString('pt-BR', options);

    // 6. Atualiza a interface
    temperatureElement.textContent = Math.round(current.temperature);
    locationNameElement.textContent = `${name}, ${country}`;
    weatherDescriptionElement.textContent = weatherInfo.description;
    currentDateElement.textContent = formattedDate;

    weatherResult.classList.remove('hidden');
  } catch (error) {
    errorMessage.textContent = 'Erro de rede ou falha no serviço. Verifique sua conexão e tente novamente.';
    errorMessage.classList.remove('hidden');
  }
});