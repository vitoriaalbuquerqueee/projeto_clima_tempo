document.getElementById('searchForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const cityInput = document.getElementById('cityInput');
  const cityName = cityInput.value.trim();

  const errorMessage = document.getElementById('errorMessage');
  const weatherResult = document.getElementById('weatherResult');
  const temperatureElement = document.getElementById('temperature');
  const locationNameElement = document.getElementById('locationName');

  errorMessage.classList.add('hidden');
  weatherResult.classList.add('hidden');

  if (!cityName) return;

  try {
    // 1. Busca coordenadas geográficas
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=pt&format=json`
    );
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      errorMessage.textContent = 'Cidade não encontrada. Tente novamente.';
      errorMessage.classList.remove('hidden');
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // 2. Busca dados meteorológicos
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const weatherData = await weatherResponse.json();

    const current = weatherData.current_weather;

    // 3. Altera o tema conforme is_day (1 = Dia, 0 = Noite)
    if (current.is_day === 1) {
      document.body.classList.remove('night-theme');
      document.body.classList.add('day-theme');
    } else {
      document.body.classList.remove('day-theme');
      document.body.classList.add('night-theme');
    }

    temperatureElement.textContent = Math.round(current.temperature);
    locationNameElement.textContent = `${name}, ${country}`;

    weatherResult.classList.remove('hidden');
  } catch (error) {
    errorMessage.textContent = 'Erro ao buscar dados do clima. Tente novamente mais tarde.';
    errorMessage.classList.remove('hidden');
  }
});