import moment from "moment";
import { tabelas_particionadas } from "./TablesParticionadas";
import { ParticoesProvider } from "../../../database/providers/Particoes";
import { logError, logInfo } from "../logger.service";

const isPenultimoDiaDoMes = (): boolean => {
    const today = moment();
    const lastDay = today.clone().endOf('month').date();
    return today.date() === lastDay - 1;
};

const proximoMes = (quantidadeMesesParticao: number): {start: string, end: string, suffix: string} => {
    const start = moment().add(1, 'month').startOf('month');
    const end = start.clone().add(quantidadeMesesParticao, 'month');
  
    return {
      start: start.format('YYYY-MM-DD'),
      end: end.format('YYYY-MM-DD'),
      suffix: start.format('YYYY_MM')
    };
  };

export const createPartitions = async (): Promise<void | Error> => {
    try {
        
        if (!isPenultimoDiaDoMes()) {
            return;
        } else {
            tabelas_particionadas.forEach( async (table) => {
                const { start, end, suffix } = proximoMes(table.periodo_particao);
                const partitionName = `${table.table_name}_${suffix}`;
                const result = await ParticoesProvider.create(table.table_name, partitionName, table.base === 'prd' ? true : false, start, end);
                if (result instanceof Error) {
                    console.log(`Erro ao criar partição ${partitionName} para tabela ${table.table_name}`, result);
                    logError(`Erro ao criar partição ${partitionName} para tabela ${table.table_name}: ${result}`);
                } else{
                    console.log(`Partição ${partitionName} criada para tabela ${table.table_name}`);
                    logInfo(`Partição ${partitionName} criada para tabela ${table.table_name}`);
                }
            });
        }
    } catch (error) {
        console.error('Erro ao criar partições:', error);
        logError('Erro ao criar partições: ' + error);
    }
};

export const CriarParticoesService = {
    createPartitions
}