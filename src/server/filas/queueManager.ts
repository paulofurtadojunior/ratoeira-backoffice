import {EFilaNames} from "../shared/enums/EFilaName";
import 'dotenv/config';

const Queue = require('bull');

const redisVisita = {
    port: process.env.REDIS_FILA_VISITA_PORT,
    host: process.env.REDIS_FILA_VISITA_HOST,
    password: process.env.REDIS_FILA_VISITA_PASSWORD
};

const redisFilaS2s = {
    port: process.env.RADIS_FILA_PORT,
    host: process.env.RADIS_FILA_HOST,
    password: process.env.RADIS_FILA_PASSWORD
};


export const Fila_Visita = new Queue(EFilaNames.filaVisita, {
    redis: redisVisita
});

export const Fila_IpBlock = new Queue(EFilaNames.filaIpBlock, {
    redis: redisVisita
});

export const Fila_Click = new Queue(EFilaNames.filaClick, {
    redis: redisVisita
});

export const Fila_Visita_Metrica = new Queue(EFilaNames.filaVisitaMetrica, {
    redis: redisVisita
});

// Crie uma nova fila chamada 'postbackLinkEnviosIntegracao'
export const Fila_postBackLinkEnvioIntegracao = new Queue(EFilaNames.postbackLinkEnviosIntegracao, {
    redis: redisFilaS2s
});

// Crie uma nova fila chamada 'postbackLinkEnvios'
export const Fila_postBackLinkEnvio = new Queue(EFilaNames.postbackLinkEnvios, {
    redis: redisFilaS2s
});

// Crie uma nova fila chamada 'checkout'
export const Fila_Checkout = new Queue(EFilaNames.checkout, {
    redis: redisFilaS2s
});

// Crie uma nova fila chamada 'checkout-integracao'
export const Fila_Checkout_Integracao = new Queue(EFilaNames.checkoutIntegracao, {
    redis: redisFilaS2s
});

