// config.js

const API_CONFIGS = [
    {
       name: 'JSON Placeholder - Teste de GET Básico',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    method: 'GET',
    expectedStatus: 500, // <--- MUDANÇA TEMPORÁRIA para forçar o alerta
    expectedBody: {
        },
        timeout: 5000 // Timeout em ms (5 segundos)
    },
    {
        name: 'API de Alertas de Clima (Real - Simulação de Terceiro)',
        url: 'https://api.weather.gov/alerts', 
        method: 'GET',
        expectedStatus: 200,
        expectedBody: null, 
        timeout: 8000
    },
    {
        name: 'API Simulação de Falha (Endpoint Inexistente)',
        url: 'https://jsonplaceholder.typicode.com/erro-404', 
        method: 'GET',
        expectedStatus: 404, 
        expectedBody: null,
        timeout: 5000 
    }
];

// Exporta o array API_CONFIGS DENTRO de um objeto.
module.exports = {
    API_CONFIGS
};