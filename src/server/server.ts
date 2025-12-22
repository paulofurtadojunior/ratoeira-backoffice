import express from 'express';
import cors from 'cors';
import {router} from './routes';
import {initBullMonitor} from './filas/bull-monitor';
import 'dotenv/config';
import process from 'node:process';
import cron from 'node-cron';
import {deletarDadosLinkVisitaAcesso, LimpezaDaseDadosService} from "./shared/services/limpeza-base-dados.service";
import {logInfo} from "./shared/services/logger.service";
import moment from "moment";
import { GoogleBotValidationService } from './shared/services/google-bot-service/google-validation-service';
import { CriarParticoesService } from './shared/services/criar-particoes/criar-particoes.service';

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

LimpezaDaseDadosService.deletarDadosLinkVisitaAcessoParametros(false);

// cron.schedule('0 */30 6 * * *', () => {
//     console.log('Executando cronjob de criação de partições no banco de dados para tabelas particionadas');
//     CriarParticoesService.createPartitions();
// });

// cron.schedule('0 */30 5,6,7,8,9,10 * * *', () => {
//     console.log('Executando cronjob de exclusão de dados da tabela link_visita_acesso_parametro: ' + moment().format().toString());
//     LimpezaDaseDadosService.deletarDadosLinkVisitaAcessoParametros(false);
// });

// cron.schedule('0 */30 11-23,0-2 * * *', () => {
//     console.log('Executando cronjob de exclusão de dados da tabela link_visita_acesso_parametro: ' + moment().format().toString());
//     LimpezaDaseDadosService.deletarDadosLinkVisitaAcessoParametros(false);
// });

// TODO: Link_vista_acesso não será excluida nesse momento.

// cron.schedule('0 */40 3,4,5,8,9,10 * * *', () => {
//     console.log('Executando cronjob de exclusão de dados da tabela link_visita_acesso: ' + moment().format().toString());
//     LimpezaDaseDadosService.deletarDadosLinkVisitaAcesso(true, 'googleBot');
// });

// let ultimaExecucaoDeleteGoogleBot = 0;

// cron.schedule('*/20 * * * *', () => {
//     const agora = moment();
//     const horaAtual = agora.hour();
//     let dobrarQuantidade = false;
//     if (horaAtual >= 3 && horaAtual < 10) {
//         dobrarQuantidade = true;
//     }

//     // Se estiver entre 3h e 4h, NÃO executar
//     if (horaAtual >= 6 && horaAtual < 7) {
//         return;
//     }

//     // Executa somente se passou 1h20 (80 min)
//     if (Date.now() - ultimaExecucaoDeleteGoogleBot >= 80 * 60 * 1000) {
//         ultimaExecucaoDeleteGoogleBot = Date.now();
//         console.log('🚀 Executando cron de exclusão de dados da tabela link_visita_acesso (intervalo 1h20): ' + agora.format());
//         LimpezaDaseDadosService.deletarDadosLinkVisitaAcesso(dobrarQuantidade, 'googleBot');
//     }
// });

// let ultimaExecucaoDeleteClienteInativo= 0;

// cron.schedule('*/20 * * * *', () => {
//     const agora = moment();
//     const horaAtual = agora.hour();
//     let dobrarQuantidade = false;
//     if (horaAtual >= 3 && horaAtual < 10) {
//         dobrarQuantidade = true;
//     }

//     // Se estiver entre 3h e 4h, NÃO executar
//     if (horaAtual >= 6 && horaAtual < 7) {
//         return;
//     }

//     // Executa somente se passou 1h40 (100 min)
//     if (Date.now() - ultimaExecucaoDeleteClienteInativo >= 100 * 60 * 1000) {
//         ultimaExecucaoDeleteClienteInativo = Date.now();
//         console.log('🚀 Executando cron de exclusão de dados da tabela link_visita_acesso (intervalo 1h40): ' + agora.format());
//         LimpezaDaseDadosService.deletarDadosLinkVisitaAcesso(dobrarQuantidade, 'clienteInativo');
//     }
// });

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
