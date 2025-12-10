import {ETableNames} from "../../ETableNames";
import {knexBaseTeste} from "../../knex";
import moment from "moment";

export const deleteByClienteInativo = async (batchMax: number, batchSize: number, month: number): Promise<number | Error> => {
    try {

        const MAX_DAILY = batchMax;
        const BATCH_SIZE = batchSize;
        const WAIT_MS = 100;
        const cutoff = moment().subtract(month, 'months').format('YYYY-MM-DD');

        let deletedCount = 0;
        const consulta = `WITH registros AS (
                SELECT id, cliente_id
                FROM ${ETableNames.link_visita_acesso}
                WHERE created_at < '${cutoff}' 
                  AND teve_venda = '0'
                  AND teve_checkout = 0
                  AND cliente_id IN (
                    SELECT id FROM ${ETableNames.cliente}
                    WHERE status = 0
                      AND (deleted_at < '${cutoff}'
                        OR updated_at < '${cutoff}')
                )
                ORDER BY created_at ASC
                                  LIMIT ${batchSize}
                ),
                del_rato AS (
                  DELETE FROM ${ETableNames.link_visita_acesso_rato} r
                  USING registros l
                  WHERE r.link_visita_acesso_id = l.id
                  AND r.cliente_id = l.cliente_id
                )
            DELETE FROM ${ETableNames.link_visita_acesso} a
            WHERE a.id IN (SELECT id FROM registros);`;

        while (deletedCount < MAX_DAILY) {

            const ret = await knexBaseTeste.transaction(async (trx) => {
                const result = await trx.raw(consulta);
                const rows = result.rowCount;

                if (rows === 0) return;

                deletedCount += rows;

                console.log(`Deletados ${rows} da tabela link_visita_acesso| Total: ${deletedCount}`);

                await new Promise(r => setTimeout(r, WAIT_MS));
            });
        }

        return deletedCount;

    } catch (error) {
        return new Error('Erro ao deletar o registro ' + error);
    }
}