export interface ILinkVisitaAcessoParametro {

    id?: number;
    hash_url: string;
    parametro_nome: string;
    parametro_valor: string;

    link_visita_configuration_id: number;
    cliente_id: number;

    created_at?: string;
    updated_at?: string;
    deleted_at?: string;

}