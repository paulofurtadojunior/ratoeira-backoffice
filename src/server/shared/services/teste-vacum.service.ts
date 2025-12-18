import { createLvaP } from "../../database/providers/link-visita-acesso-parametro/create";
import { createLva } from "../../database/providers/link-visita-acesso/create";
import { ILinkVisitaAcesso } from "../models/link-visita-acesso";

export const testeVacum = async (): Promise<void> => {

    try{
        for (let i = 0; i < 50000; i++) {
        
            const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
            const lva = {
                url: `https://eevolua.com.br/teste-vacum?utm_id=${i}`,
                cliente_id: 2,
                link_visita_configuration_id: 95534
            } as ILinkVisitaAcesso;

            const lvap = {
                hash_url: 'teste-vacum',
                parametro_nome: 'parametro-teste',
                parametro_valor: `valor-teste-${i}`,
                link_visita_configuration_id: 95534,
                cliente_id: 2
            };
    
            await sleep(500);
    
            await createLva(lva);
            await createLvaP(lvap);
    
        }
    }catch(error){
        console.log(error);
    }
};

export const TesteVacumService = {
    testeVacum
}