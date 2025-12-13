import express from 'express';
import cors from 'cors';
import {router} from './routes';
import {initBullMonitor} from './filas/bull-monitor';
import 'dotenv/config';
import process from 'node:process';
import cron from 'node-cron';
import {LimpezaDaseDadosService} from "./shared/services/limpeza-base-dados.service";
import {logInfo} from "./shared/services/logger.service";
import moment from "moment";
import { GoogleBotValidationService } from './shared/services/google-bot-service/google-validation-service';

const server = express();
server.use(cors());

logInfo('Iniciando o Raads-Backoffice');
process.on('uncaughtException', (error) => {
    console.log('[ERRO FATAL]', error);
});

process.on('exit', (code) => {
    console.log('Process exit event with code: ', code);
});

cron.schedule('0 */30 3,15 * * *', () => {
    console.log('Executando cronjob de exclusão de busca de range de ips de bot do google: ' + moment().format().toString());
    GoogleBotValidationService.loadGoogleIpRanges();
});

cron.schedule('0 */30 3,4,5,8,9,10 * * *', () => {
    console.log('Executando cronjob de exclusão de dados da tabela link_visita_acesso_parametro: ' + moment().format().toString());
    LimpezaDaseDadosService.deletarDadosLinkVisitaAcessoParametros(true);
});

cron.schedule('0 */30 11-23,0-2 * * *', () => {
    console.log('Executando cronjob de exclusão de dados da tabela link_visita_acesso_parametro: ' + moment().format().toString());
    LimpezaDaseDadosService.deletarDadosLinkVisitaAcessoParametros(false);
});

server.use(express.json());

// Inicializar Bull Monitor e adicionar rota com autenticação
(async () => {
    try {
        const basicAuth = require('express-basic-auth');
        const bullMonitorRouter = await initBullMonitor();
        
        // Adicionar autenticação básica antes do router do bull-monitor
        server.use('/filas', basicAuth({
            users: {'admin': 'f1L45Rat031rAaDs_'},
            challenge: true
        }));
        
        server.use('/filas', bullMonitorRouter);
        logInfo('Bull Monitor inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar Bull Monitor:', error);
    }
})();

server.use(router);


export {server};
