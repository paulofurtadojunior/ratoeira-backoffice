import {linkVisitaAcessoParametroProvider} from "../../database/providers/link-visita-acesso-parametro";
import {FirebaseService} from "./firebase.service";
import {FirebaseParameter} from "../models/firebase-parameter";
import {logError, logInfo} from "./logger.service";
import moment from "moment";
import { linkVisitaAcessoProvider } from "../../database/providers/link-visita-acesso";

export const deletarDadosLinkVisitaAcessoParametros = async (dobrarQuantidade: boolean): Promise<void | Error> => {
    try{
        const parametros: FirebaseParameter[] = await FirebaseService.getParametersByGroup('raads-backoffice');

        if (parametros.find(p => p.nome === 'habilitar_drop_data_raads_pg')?.defaultValue !== 'true') {
            return;
        }
        else{
            logInfo(`Inicio do processo de exclusão de dados da link_visita_acesso_parametro ` + moment().format().toString());
            const paramQtdMaxima = Number(parametros.find(p => p.nome === 'qtd_maxima_registros_para_excluir')?.defaultValue) ?? 100000;
            const paramBatch = Number(parametros.find(p => p.nome === 'qtd_registros_batch')?.defaultValue) ?? 5000;
            const limiteLinhasAExcluir = dobrarQuantidade ? paramQtdMaxima * 2 : paramQtdMaxima;
            const LinhasAExcluirPorBatch = dobrarQuantidade ? paramBatch * 2 : paramBatch;

            const registrosExcluidos = await linkVisitaAcessoParametroProvider.deleteByPeriodo(limiteLinhasAExcluir, LinhasAExcluirPorBatch, null);

            if (registrosExcluidos instanceof Error) {
                logError('Erro ao deletar registros antigos ' + registrosExcluidos);
            } else{
                console.log(`Sucesso ao deletar \`${registrosExcluidos}\` registros antigos.`);
                logInfo(`Sucesso ao deletar \`${registrosExcluidos}\` registros antigos.`);
            }
            logInfo(`Fim do processo de exclusão de dados da link_visita_acesso_parametro ` + moment().format().toString());
        }
    } catch (error){
        console.error(error);
        logError(`Erro no serviço de exclusão de dados da link_visita_acess_parametros` + error);
        return new Error(`Erro no serviço de exclusão de dados da link_visita_acess_parametros`)
    }
}

export const deletarDadosLinkVisitaAcesso = async (dobrarQuantidade: boolean, tipoExclusao: string): Promise<void | Error> => {
    try{
        interface DropLva {
            habilitar_drop: boolean;
            qtd_mes: number;
            qtd_max_a_excluir: number;
            qtd_a_excluir_por_batch: number;
        }
        const parametros: FirebaseParameter[] = await FirebaseService.getParametersByGroup('raads-backoffice');

        const drop_lva = parametros.find(p => p.nome === 'drop_link_visita_acesso');

        if (drop_lva && !(drop_lva instanceof Error)){
            const params: DropLva = JSON.parse(drop_lva.defaultValue);
            if (!params.habilitar_drop) {
                return;
            } else{
                logInfo(`Inicio do processo de exclusão de dados da link_visita_acesso ` + moment().format().toString());
                const limiteLinhasAExcluir = dobrarQuantidade ? params.qtd_max_a_excluir * 2 : params.qtd_max_a_excluir;
                const LinhasAExcluirPorBatch = dobrarQuantidade ? params.qtd_a_excluir_por_batch * 2 : params.qtd_a_excluir_por_batch;

                let registrosExcluidos;

                if (tipoExclusao === 'googleBot'){
                    registrosExcluidos = await linkVisitaAcessoProvider.deleteByGoogleBot(limiteLinhasAExcluir, LinhasAExcluirPorBatch, params.qtd_mes);
                } else{
                    registrosExcluidos = await linkVisitaAcessoProvider.deleteByClienteInativo(limiteLinhasAExcluir, LinhasAExcluirPorBatch, params.qtd_mes);
                }

                if (registrosExcluidos instanceof Error) {
                    logError('Erro ao deletar registros antigos da tabela link_visita_acesso' + registrosExcluidos);
                } else {
                    console.log(`Sucesso ao deletar \`${registrosExcluidos}\` registros antigos da tabela link_visita_acesso.`);
                    logInfo(`Sucesso ao deletar \`${registrosExcluidos}\` registros antigos da tabela link_visita_acesso.`);
                }

                logInfo(`Fim do processo de exclusão de dados da link_visita_acesso ` + moment().format().toString());
            }
        } else {
            return;
        }
    } catch (error){
        console.error(error);
        logError(`Erro no serviço de exclusão de dados da link_visita_acess_parametros` + error);
        return new Error(`Erro no serviço de exclusão de dados da link_visita_acess_parametros`)
    }
}

export const LimpezaDaseDadosService = {
    deletarDadosLinkVisitaAcessoParametros,
    deletarDadosLinkVisitaAcesso
}