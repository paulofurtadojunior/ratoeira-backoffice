import express from 'express';
import cors from 'cors';
import {router} from './routes';
import 'dotenv/config';
import process from 'node:process';
import cron from 'node-cron';
import {LimpezaDaseDadosService} from "./shared/services/limpeza-base-dados.service";

const server = express();
server.use(express.json());

server.use(cors());

process.on('uncaughtException', (error) => {
    console.log('[ERRO FATAL]', error);
});

process.on('exit', (code) => {
    console.log('Process exit event with code: ', code);
});

cron.schedule('0 30 17 * * *', () => {
    console.log('Executando cronjob nos horários 12h, 13h, 14h e 15h...');
    LimpezaDaseDadosService.deletarDadosLinkVisitaAcessoParametros();
});


server.use(router);


export {server};
