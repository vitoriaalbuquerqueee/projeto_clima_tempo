const { fetchWeatherData } = require('../api');

describe('Suíte de Testes da API do Clima (Open-Meteo)', () => {
  let mockFetch;

  beforeEach(() => {
    mockFetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('3.6 Testes Básicos', () => {
    test('1. Deve retornar dados meteorológicos para um nome de cidade válido', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            results: [{ latitude: -23.55, longitude: -46.63, name: 'São Paulo', country: 'Brasil' }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            current_weather: { temperature: 21.4, is_day: 1, weathercode: 0 }
          })
        });

      const result = await fetchWeatherData('São Paulo', mockFetch);

      expect(result.name).toBe('São Paulo');
      expect(result.temperature).toBe(21);
      expect(result.description).toBe('Céu Limpo');
      expect(result.isDay).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    test('2. Deve lançar exceção tratada para cidade inexistente', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      });

      await expect(fetchWeatherData('CidadeInexistenteXYZ', mockFetch)).rejects.toThrow('Cidade não encontrada.');
    });

    test('3. Deve retornar erro de validação para entrada vazia ou inválida', async () => {
      await expect(fetchWeatherData('', mockFetch)).rejects.toThrow('Nome de cidade inválido ou vazio.');
      await expect(fetchWeatherData('   ', mockFetch)).rejects.toThrow('Nome de cidade inválido ou vazio.');
    });

    test('4. Deve tratar falhas/erros da API com mensagem adequada', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(fetchWeatherData('São Paulo', mockFetch)).rejects.toThrow(
        'Falha na comunicação com a API de Geocodificação.'
      );
    });
  });

  describe('3.7 Casos Extremos', () => {
    test('5. Deve tratar o limite de requisições excedido (HTTP 429)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429
      });

      await expect(fetchWeatherData('São Paulo', mockFetch)).rejects.toThrow(
        'Limite de requisições excedido. Tente novamente mais tarde.'
      );
    });

    test('6. Deve tratar conexão de rede lenta/instável (Network Error/Timeout)', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

      await expect(fetchWeatherData('São Paulo', mockFetch)).rejects.toThrow('Network request failed');
    });

    test('7. Deve tratar mudança inesperada no formato do JSON da resposta', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            results: [{ latitude: -23.55, longitude: -46.63, name: 'São Paulo', country: 'Brasil' }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            payload_diferente: {}
          })
        });

      await expect(fetchWeatherData('São Paulo', mockFetch)).rejects.toThrow('Formato de resposta inesperado da API.');
    });
  });
});