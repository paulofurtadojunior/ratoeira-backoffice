import {ETableNames} from "../../ETableNames";
import {knexBaseTeste, myKnex} from "../../knex";
import moment from "moment";

export const deleteByPeriodo = async (batchMax: number, batchSize: number, listaClientes: Array<number> | null): Promise<number | Error> => {
    try {

        let filtroCliente = '';
        if (listaClientes instanceof Array) {
            filtroCliente = ' AND ' + listaClientes.join(',');
        }
        const MAX_DAILY = batchMax;
        const BATCH_SIZE = batchSize;
        const WAIT_MS = 100;
        const cutoff = moment().subtract(6, 'months').format('YYYY-MM-DD');//seta a data para 6 meses atrás

        let deletedCount = 0;

        while (deletedCount < MAX_DAILY) {
            const consulta = `WITH apagar AS (
                                    SELECT id
                                    FROM ${ETableNames.link_visita_acesso_parametro}
                                    WHERE created_at < '${cutoff}'
                                    ORDER BY created_at ASC
                                    LIMIT ${BATCH_SIZE}
                                    )
                              DELETE FROM ${ETableNames.link_visita_acesso_parametro} p
                              USING apagar
                              WHERE p.id = apagar.id;`;

            const result = await myKnex.raw(consulta);

            const rows = result.rowCount;

            if (rows === 0) break;

            deletedCount += rows;

            console.log(`Deletados ${rows} | Total: ${deletedCount}`);

            await new Promise(r => setTimeout(r, WAIT_MS));
        }

        return deletedCount;

    } catch (error) {
        return new Error('Erro ao deletar o registro ' + error);
    }
}