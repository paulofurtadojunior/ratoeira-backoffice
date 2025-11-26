import express from 'express';
import cors from 'cors';
import {router} from './routes';
import 'dotenv/config';
import process from 'node:process';
import cron from 'node-cron';
import {LimpezaDaseDadosService} from "./shared/services/limpeza-base-dados.service";
import {logInfo} from "./shared/services/logger.service";
import moment from "moment";

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


cron.schedule('0 */30 3,4,5,8,9,10 * * *', () => {
    console.log('Executando cronjob de exclusão de dados da tabela link_visita_acesso_parametro: ' + moment().format().toString());
    LimpezaDaseDadosService.deletarDadosLinkVisitaAcessoParametros(true);
});

cron.schedule('0 */30 11-23,0-2 * * *', () => {
    console.log('Executando cronjob de exclusão de dados da tabela link_visita_acesso_parametro: ' + moment().format().toString());
    LimpezaDaseDadosService.deletarDadosLinkVisitaAcessoParametros(false);
});


server.use(router);


export {server};
