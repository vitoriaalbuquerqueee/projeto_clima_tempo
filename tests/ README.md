# 🌤️ Aplicativo de Previsão do Tempo (Weather App)

Aplicação web simples, moderna e responsiva para consulta de previsão do tempo em tempo real para qualquer cidade do mundo, desenvolvida com **HTML5, CSS3, JavaScript puro (Vanilla JS)** e a API pública **Open-Meteo**.

---

## 📌 Sumário
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação e Execução](#-instalação-e-execução)
- [Execução dos Testes](#-execução-dos-testes)
- [Documentação do Código (JSDoc)](#-documentação-do-código-jsdoc)
- [Licença](#-licença)

---

## ✨ Funcionalidades

- **Consulta em Tempo Real:** Pesquisa de clima por nome de cidade utilizando geocodificação da Open-Meteo.
- **Ícones Meteorológicos Dinâmicos:** Mapeamento de códigos WMO para ícones visuais usando Weather Icons.
- **Temas Dinâmicos (Dia / Noite):** Transição de fundo baseada na indicação do período do dia (`is_day`).
- **Tratamento Amigável de Erros:** Exibição clara de mensagens para cidade não encontrada, entrada vazia, falha de rede e limite de requisições.
- **Suíte de Testes Automatizados:** Testes unitários com mocks via Jest garantindo a estabilidade da função principal e cobertura de cenários de borda.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estrutura semântica da página.
- **CSS3:** Estilização responsiva, layout flexbox e variáveis para alternância de temas.
- **JavaScript (ES6+):** Consumo assíncrono de API via `fetch`, manipulação da DOM e lógica de aplicação.
- **Open-Meteo API:**
  - *Geocoding API* (`geocoding-api.open-meteo.com`)
  - *Weather Forecast API* (`api.open-meteo.com`)
- **Weather Icons:** Biblioteca de ícones vetoriais específicos para condições climáticas.
- **Jest:** Framework de testes automatizados em ambiente Node.js.

---

## 📁 Estrutura do Projeto

```text
projeto_clima_tempo/
├── css/
│   ├── style.css
│   └── weather-icons.min.css
├── font/
│   └── (arquivos de fontes do Weather Icons)
├── tests/
│   └── api.test.js
├── index.html
├── api.js
├── package.json
└── README.md
🚀 Instalação e Execução
Pré-requisitos
Node.js instalado (versão 14 ou superior)
Navegador web moderno ou extensão Live Server no VS Code
Passo a Passo
Clonar o Repositório:
Bash
git clone [https://github.com/vitoriaalbuquerqueee/projeto_clima_tempo.git](https://github.com/vitoriaalbuquerqueee/projeto_clima_tempo.git)
cd projeto_clima_tempo
Instalar Dependências de Desenvolvimento:
Bash
npm install
Executar a Aplicação no Navegador:

Abra o arquivo index.html diretamente no navegador de sua preferência ou utilizando a extensão Live Server no VS Code.


🧪 Execução dos Testes
Para executar a suíte de testes unitários com o Jest:
Bash
npm test

Cenários Testados:
Retorno de dados válidos para uma cidade existente.

Lançamento de erro para cidade não encontrada.
Validação de campos vazios ou inválidos.

Tratamento de erro 500/falha de servidor.

Tratamento de limite de requisições excedido (HTTP 429).

Falha de rede e inconsistências de conexão.

Tratamento de estrutura JSON inesperada.

📄 Documentação do Código (JSDoc)
A função principal do projeto (fetchWeatherData) foi totalmente documentada com o padrão JSDoc.

Exemplo de utilização:

JavaScript
import { fetchWeatherData } from './api.js';

try {
  const weather = await fetchWeatherData('São Paulo');
  console.log(`Temperatura atual em ${weather.name}: ${weather.temperature}°C`);
} catch (error) {
  console.error(error.message);
}



📜 Licença
Este projeto foi desenvolvido como parte de atividade prática de desenvolvimento de software. Livre para fins educacionais.


