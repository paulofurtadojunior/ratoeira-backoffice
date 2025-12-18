import { ILinkVisitaAcesso } from '../../../shared/models/link-visita-acesso';
import {ETableNames} from '../../ETableNames';
import {knexBaseTeste} from '../../knex';


export const createLva = async (newLinkVisitaAcesso: Omit<ILinkVisitaAcesso, 'id'>): Promise<ILinkVisitaAcesso | Error> => {

    try {
        
        delete newLinkVisitaAcesso.quantidade_visita;
        delete newLinkVisitaAcesso.link_visita_configuration_idd;

        return await knexBaseTeste.transaction(async (trx) => {
            const result: any = await trx(ETableNames.link_visita_acesso)
                .insert(newLinkVisitaAcesso)
                .returning('*');
            return result[0];
        }, {isolationLevel: 'read committed'});
        
    } catch (error) {
        return new Error('Erro ao cadastrar o registro');
    }


};