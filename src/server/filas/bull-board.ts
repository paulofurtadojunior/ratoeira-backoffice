import {
    Fila_Click,
    Fila_IpBlock,
    Fila_Visita,
    Fila_Visita_Metrica,
} from "./queueManager";

const {createBullBoard} = require('@bull-board/api');
const {BullAdapter} = require('@bull-board/api/bullAdapter');
const {ExpressAdapter} = require('@bull-board/express');

export const serverAdapter = new ExpressAdapter();

export const bullBorad = () => {
    serverAdapter.setBasePath('/filas');
    createBullBoard({
        queues: [
            new BullAdapter(Fila_Visita),
            new BullAdapter(Fila_IpBlock),
            new BullAdapter(Fila_Click),
            new BullAdapter(Fila_Visita_Metrica)
        ],
        serverAdapter: serverAdapter,
    });
};


