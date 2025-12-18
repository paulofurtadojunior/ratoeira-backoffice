import {ETableNames} from '../../ETableNames';
import {knexBaseTeste} from '../../knex';


export const createLvaP = async (rows: any): Promise<any | Error> => {

    try {

        const result = await knexBaseTeste(ETableNames.link_visita_acesso_parametro).insert(rows).select('id');

        if (result) return result;
        return new Error('Erro ao cadastrar os parametros');

    } catch (error) {
        return new Error('Erro Fatal ao cadastrar os parametros' + error);
    }


};