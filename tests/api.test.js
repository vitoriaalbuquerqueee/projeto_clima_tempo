const { fetchWeatherData, fetchMultipleCities, mapWeatherCode } = require('../api.js');

describe('Suíte de Testes da API de Clima', () => {

  test('mapWeatherCode deve mapear corretamente o código 0 para dia e noite', () => {
    expect(mapWeatherCode(0, true)).toEqual({
      description: 'Céu limpo',
      iconClass: 'wi-day-sunny'
    });

    expect(mapWeatherCode(0, false)).toEqual({
      description: 'Céu limpo',
      iconClass: 'wi-night-clear'
    });
  });

  test('mapWeatherCode deve retornar fallback para código desconhecido', () => {
    expect(mapWeatherCode(999, true)).toEqual({
      description: 'Variável',
      iconClass: 'wi-day-cloudy'
    });
  });

  test('fetchWeatherData deve lançar erro se a cidade for inválida', async () => {
    await expect(fetchWeatherData('')).rejects.toThrow('Nome de cidade inválido ou vazio.');
    await expect(fetchWeatherData(null)).rejects.toThrow('Nome de cidade inválido ou vazio.');
  });

  test('fetchWeatherData deve lançar erro quando a cidade não for encontrada', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ results: [] })
    });

    await expect(fetchWeatherData('CidadeInexistente123', mockFetch)).rejects.toThrow('Cidade não encontrada.');
  });

  test('fetchWeatherData deve retornar os dados formatados corretamente', async () => {
    const mockFetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          results: [{ latitude: -23.55, longitude: -46.63, name: 'São Paulo', country: 'Brasil' }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          current: {
            temperature_2m: 22.4,
            relative_humidity_2m: 81,
            is_day: 1,
            precipitation: 0,
            weather_code: 3,
            wind_speed_10m: 12
          }
        })
      });

    const result = await fetchWeatherData('São Paulo', mockFetch);

    expect(result).toEqual({
      name: 'São Paulo',
      country: 'Brasil',
      temperature: 22,
      isDay: true,
      description: 'Nublado',
      iconClass: 'wi-cloudy',
      humidity: 81,
      windSpeed: 12,
      precipitation: 0
    });
  });

  test('fetchWeatherData deve lidar com rate limit (429)', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429
    });

    await expect(fetchWeatherData('São Paulo', mockFetch)).rejects.toThrow('Limite de requisições excedido. Tente novamente mais tarde.');
  });

  test('fetchMultipleCities deve buscar dados para várias cidades em paralelo', async () => {
    const mockFetch = jest.fn((url) => {
      if (url.includes('geocoding-api.open-meteo.com')) {
        if (url.includes('Cidade%20A')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ results: [{ latitude: 10, longitude: 10, name: 'Cidade A', country: 'Pais A' }] })
          });
        }
        if (url.includes('Cidade%20B')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ results: [{ latitude: 20, longitude: 20, name: 'Cidade B', country: 'Pais B' }] })
          });
        }
      }

      if (url.includes('api.open-meteo.com/v1/forecast')) {
        if (url.includes('latitude=10')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ current: { temperature_2m: 20, relative_humidity_2m: 50, is_day: 1, precipitation: 0, weather_code: 0, wind_speed_10m: 5 } })
          });
        }
        if (url.includes('latitude=20')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ current: { temperature_2m: 15, relative_humidity_2m: 60, is_day: 0, precipitation: 1, weather_code: 61, wind_speed_10m: 10 } })
          });
        }
      }

      return Promise.resolve({ ok: false, status: 404 });
    });

    const results = await fetchMultipleCities(['Cidade A', 'Cidade B'], mockFetch);

    expect(results).toHaveLength(2);
    expect(results[0].name).toBe('Cidade A');
    expect(results[1].name).toBe('Cidade B');
  });

});