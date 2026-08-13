🌤️ Previsão do Tempo

Aplicação web para consultar o clima atual, ver a previsão dos próximos dias e comparar o clima entre várias cidades ao mesmo tempo.

Descrição
O projeto foi construído com HTML5, CSS3 e JavaScript (ES6+), consumindo as APIs públicas do Open-Meteo para buscar dados de geocodificação e previsão do tempo.

Como funciona

Busca por cidade — o usuário digita o nome da cidade e clica em Buscar.

Geocodificação — o api.js envia esse nome para a API de Geocoding do Open-Meteo, que retorna as coordenadas (latitude/longitude) da cidade.

Clima atual — com as coordenadas, a aplicação consulta a Forecast API e exibe temperatura, condição do tempo, umidade, vento e chuva.

Previsão de 7 dias — logo abaixo é exibida a previsão para os próximos dias, com temperatura máxima e mínima de cada um.

Comparar cidades — é possível adicionar até 5 cidades e comparar o clima de todas ao mesmo tempo em uma tabela, com clima, temperatura, umidade, vento e chuva lado a lado.


Funcionalidades
Busca de clima em tempo real por nome de cidade
Previsão meteorológica diária para 7 dias
Comparador de clima entre até 5 cidades em paralelo

Temas visuais dinâmicos (Dia / Noite) com estrelas animadas

Layout responsivo e adaptável

Testes unitários automatizados com Jest

Tecnologias Utilizadas
Front-end: HTML5, CSS3, JavaScript (ES6+), Weather Icons
APIs Externas: Open-Meteo Forecast API & Geocoding API
Testes: Node.js, Jest

Instalação e Execução

Clonar o repositório:
bash
   git clone https://github.com/seu-usuario/projeto_clima_tempo.git
   cd projeto_clima_tempo

Instalar dependências:
bash
   npm install

Executar a suíte de testes:
bash
   npm test

Executar a aplicação: Abra o arquivo index.html diretamente no navegador ou utilize a extensão Live Server no VS Code.


Licença e Privacidade
Este projeto está licenciado sob a Licença MIT — veja o arquivo LICENSE para mais detalhes. As atribuições de terceiros estão detalhadas no arquivo NOTICE.md.