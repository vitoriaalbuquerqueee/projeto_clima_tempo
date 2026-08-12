document.getElementById('searchForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const cityInput = document.getElementById('cityInput');
  const cityName = cityInput.value.trim();

  const errorMessage = document.getElementById('errorMessage');
  const weatherResult = document.getElementById('weatherResult');
  const temperatureElement = document.getElementById('temperature');
  const locationNameElement = document.getElementById('locationName');

  // Esconde mensagens anteriores a cada nova busca
  errorMessage.classList.add('hidden');
  weatherResult.classList.add('hidden');

  if (!cityName) return;

  try {
    // 1. Converte o nome da cidade em latitude e longitude via API de Geocodificação
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=pt&format=json`
    );
    const geoData = await geoResponse.json();

    // Se não encontrar nenhuma cidade correspondente
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
    const weatherData = await weatherResponse.json();

    // Exibe a temperatura e o nome do local formatado
    temperatureElement.textContent = Math.round(weatherData.current_weather.temperature);
    locationNameElement.textContent = `${name}, ${country}`;

    weatherResult.classList.remove('hidden');
  } catch (error) {
    errorMessage.textContent = 'Erro ao buscar dados do clima. Tente novamente mais tarde.';
    errorMessage.classList.remove('hidden');
  }
});
