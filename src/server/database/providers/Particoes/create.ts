import { knexMetricas, myKnex } from "../../knex";

export const create = async (tableName: string, partitionName: string, bancoPrd: boolean, startPartition: string, endPartition: string): Promise<void | Error> => {
    try {

        const existsQuery = `SELECT to_regclass('${partitionName}') IS NOT NULL AS exists;`;

        const createPartition = `
                    CREATE TABLE ${partitionName}
                    PARTITION OF ${tableName}
                    FOR VALUES FROM ('${startPartition}') TO ('${endPartition}');`;

        if (bancoPrd) {
            const existPartition = await myKnex.raw(existsQuery);
            if (!existPartition)
                await myKnex.raw(createPartition);
        } else{
            const existPartition = await knexMetricas.raw(existsQuery);
            if (!existPartition.rows[0].exists) {
                const result = await knexMetricas.raw(createPartition);
                if (result.rowCount === 0) {
                    return new Error(`Falha ao criar partição ${partitionName} para a tabela ${tableName}`);
                }
            }
        }

        console.log('Partições criadas com sucesso.');
    } catch (error) {
        console.error('Erro ao criar partições:', error);
        return new Error('Erro ao criar partições: ' + error);
    }
}