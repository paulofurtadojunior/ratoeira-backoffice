import {ETableNames} from "../../ETableNames";
import {knexBaseTeste, myKnex} from "../../knex";
import moment from "moment";

export const deleteByPeriodo = async (batchMax: number, batchSize: number, listaClientes: Array<number> | null): Promise<number | Error> => {
    try {

        const MAX_DAILY = batchMax;
        const BATCH_SIZE = batchSize;
        const WAIT_MS = 100;
        const cutoff = moment().subtract(6, 'months').format('YYYY-MM-DD');//seta a data para 6 meses atrás

        let deletedCount = 0;

        console.log('Entrou no método de deleteByPeriodo do link_visita_acesso_parametro');

        while (deletedCount < MAX_DAILY) {
            const result = await myKnex.raw(
              `
              WITH apagar AS (
                SELECT id
                FROM ${ETableNames.link_visita_acesso_parametro}
                WHERE created_at < ?
                ORDER BY created_at ASC
                LIMIT ?
              )
              DELETE FROM ${ETableNames.link_visita_acesso_parametro} p
              USING apagar
              WHERE p.id = apagar.id;`,
              [cutoff, BATCH_SIZE]
            );
        
            const rows = result.rowCount ?? result.rows?.length ?? 0;
  
            if (rows === 0) break;
        
            deletedCount += rows;
            console.log(`Deletados ${rows} registros. Total: ${deletedCount}`);
            // Aguarda antes de continuar para evitar sobrecarregar o banco
            await new Promise(r => setTimeout(r, WAIT_MS));
          }
        
          return deletedCount;
      
          // Cria uma única transação
        //   await myKnex.transaction(async (trx) => {
        //       while (deletedCount < MAX_DAILY) {
        //           const result = await trx.raw(
        //               `
        //               WITH apagar AS (
        //                 SELECT id
        //                 FROM ${ETableNames.link_visita_acesso_parametro}
        //                 WHERE created_at < ?
        //                 ORDER BY created_at ASC
        //                 LIMIT ?
        //               )
        //               DELETE FROM ${ETableNames.link_visita_acesso_parametro} p
        //               USING apagar
        //               WHERE p.id = apagar.id
        //               RETURNING 1;`,
        //               [cutoff, BATCH_SIZE]
        //           );
  
        //           const rows = result.rowCount ?? result.rows?.length ?? 0;
  
        //           if (rows === 0) break;
  
        //           deletedCount += rows;
  
        //           console.log(`Deletados ${rows} registros. Total: ${deletedCount}`);
  
        //           // Aguarda antes de continuar para evitar sobrecarregar o banco
        //           await new Promise((resolve) => setTimeout(resolve, WAIT_MS));
        //       }
        //   });
  
        //   return deletedCount;        

    } catch (error) {
        return new Error('Erro ao deletar o registro ' + error);
    }
}