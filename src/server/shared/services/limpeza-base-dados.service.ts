import {linkVisitaAcessoParametroProvider} from "../../database/providers/link-visita-acesso-parametro";
import {FirebaseService} from "./firebase.service";
import {FirebaseParameter} from "../models/firebase-parameter";
import {logError, logInfo} from "./logger.service";
import moment from "moment";

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

export const LimpezaDaseDadosService = {
    deletarDadosLinkVisitaAcessoParametros
}