import {
    Fila_Checkout,
    Fila_Checkout_Integracao,
    Fila_Click,
    Fila_IpBlock,
    Fila_postBackLinkEnvio,
    Fila_postBackLinkEnvioIntegracao,
    Fila_Visita,
    Fila_Visita_Metrica,
} from "./queueManager";

// Usando @bull-monitor/express
const {BullMonitorExpress} = require('@bull-monitor/express');
const {BullAdapter} = require('@bull-monitor/root/dist/bull-adapter');

// Criar instância do Bull Monitor
const bullMonitor = new BullMonitorExpress({
    queues: [
        new BullAdapter(Fila_Visita),
        new BullAdapter(Fila_IpBlock),
        new BullAdapter(Fila_Click),
        new BullAdapter(Fila_Visita_Metrica),
        new BullAdapter(Fila_postBackLinkEnvio),
        new BullAdapter(Fila_postBackLinkEnvioIntegracao),
        new BullAdapter(Fila_Checkout),
        new BullAdapter(Fila_Checkout_Integracao),
    ],
    // Habilita a introspecção GraphQL (opcional)
    gqlIntrospection: true,
    // Configurações de métricas (opcional)
    metrics: {
        collectInterval: {hours: 1},
        maxMetrics: 100,
    },
});

// Função para inicializar o monitor e retornar o router
export const initBullMonitor = async () => {
    await bullMonitor.init();
    return bullMonitor.router;
};

