import {linkVisitaAcessoParametroProvider} from "../../database/providers/link-visita-acesso-parametro";
import {FirebaseService} from "./firebase.service";
import {FirebaseParameter} from "../models/firebase-parameter";
import {logError, logInfo} from "./logger.service";

export const deletarDadosLinkVisitaAcessoParametros = async (): Promise<void | Error> => {
    try{
        const parametros: FirebaseParameter[] = await FirebaseService.getParametersByGroup('drop_dado_database');

        if (parametros.find(p => p.nome === 'habilitar_drop_data_raads_pg')?.defaultValue !== 'true') {
            return;
        }
        else{
            logInfo(`Inicio do processo de exclusão de dados da link_visita_acesso_parametro`);
            const limiteLinhasAExcluir = Number(parametros.find(p => p.nome === 'qtd_maxima_registros_para_excluir')?.defaultValue) ?? 1000000;
            const LinhasAExcluirPorBatch = Number(parametros.find(p => p.nome === 'qtd_registros_batch')?.defaultValue) ?? 10000;

            const registrosExcluidos = await linkVisitaAcessoParametroProvider.deleteByPeriodo(limiteLinhasAExcluir, LinhasAExcluirPorBatch, null);

            if (registrosExcluidos instanceof Error) {
                logError('Erro ao deletar registros antigos ' + registrosExcluidos);
            } else{
                console.log(`Sucesso ao deletar \`${registrosExcluidos}\` registros antigos.`);
                logInfo(`Sucesso ao deletar \`${registrosExcluidos}\` registros antigos.`);
            }
            logInfo(`Fim do processo`);
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