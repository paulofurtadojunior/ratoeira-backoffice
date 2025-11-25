import express from 'express';
import cors from 'cors';
import {router} from './routes';
import 'dotenv/config';
import process from 'node:process';
import cron from 'node-cron';
import {LimpezaDaseDadosService} from "./shared/services/limpeza-base-dados.service";
import {logInfo} from "./shared/services/logger.service";

const server = express();
server.use(express.json());

server.use(cors());

logInfo('Iniciando o Raads-Backoffice');
process.on('uncaughtException', (error) => {
    console.log('[ERRO FATAL]', error);
});

process.on('exit', (code) => {
    console.log('Process exit event with code: ', code);
});


cron.schedule('0 0 0,1,2,3,4,5,6,7,8,9 * * *', () => {
    console.log('Executando cronjob nos horários 12h, 13h, 14h e 15h...');
    LimpezaDaseDadosService.deletarDadosLinkVisitaAcessoParametros();
});


server.use(router);


export {server};
