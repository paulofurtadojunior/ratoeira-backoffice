import {ETableNames} from "../../ETableNames";
import {knexBaseTeste} from "../../knex";

export const deleteByPeriodo = async (batchMax: number, batchSize: number, listaClientes: Array<number> | null): Promise<number | Error> => {
    try {

        let filtroCliente = '';
        if (listaClientes instanceof Array) {
            filtroCliente = ' AND ' + listaClientes.join(',');
        }
        const MAX_DAILY = batchMax;
        const BATCH_SIZE = batchSize;
        const WAIT_MS = 100;

        let deletedCount = 0;

        while (deletedCount < MAX_DAILY) {
            const result = await knexBaseTeste.raw(
               ` WITH apagar AS (
                            SELECT id
                            FROM ${ETableNames.link_visita_acesso_parametro}
                            WHERE created_at < (now() - interval '6 months')
                            ORDER BY created_at ASC
                            LIMIT ?
                                    )
                            DELETE FROM ${ETableNames.link_visita_acesso_parametro} p
                            USING apagar
                            WHERE p.id = apagar.id;
                            `, [BATCH_SIZE]);

            const rows = result.rows.length;

            if (rows === 0) break;

            deletedCount += rows;

            console.log(`Deletados ${rows} | Total: ${deletedCount}`);

            await new Promise(r => setTimeout(r, WAIT_MS));
        }

        return deletedCount;

        // while (true) {
        //     const ids = await knexBaseTeste(`${ETableNames.link_visita_acesso_parametro}`)
        //         .where('created_at', '<', knexBaseTeste.raw(`now() - interval '6 months'`))
        //         .orderBy('created_at')
        //         .limit(BATCH)
        //         .pluck('id');
        //
        //     if (ids.length === 0) break;
        //
        //     await knexBaseTeste(`${ETableNames.link_visita_acesso_parametro}`).whereIn('id', ids).delete();
        //     // await knexBaseTeste.raw('VACUUM (ANALYZE) minha_tabela'); // opcional, não faça a cada lote se ficar pesado
        //     await new Promise(r => setTimeout(r, 100)); // respiro
        // }


        // const consulta = `WITH apagar AS (
        //                         SELECT id
        //                         FROM ${ETableNames.link_visita_acesso_parametro}
        //                         WHERE created_at < ${database}
        //                         ${filtroCliente}
        //                         ORDER BY created_at ASC
        //                         LIMIT ${limite}
        //                         )
        //                   DELETE FROM ${ETableNames.link_visita_acesso_parametro} p
        //                   USING apagar
        //                   WHERE p.id = apagar.id;`;
        // const result = await knexBaseTeste.raw(consulta);
        //
        // return result.rows > 0;

    } catch (error) {
        return new Error('Erro ao deletar o registro');
    }
}