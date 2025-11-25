import {
    IPlataforma,
    IPostbackLink,
    ICliente,
    ITemplate,
    IPostbackLinkEnvio,
    IGoogleProfile,
    IShieldConfiguration,
    ILinkVisitaConfiguration,
    ILinkVisitaAcesso
} from '../../models';

declare module 'knex/types/tables' {
    interface Tables {
        plataforma: IPlataforma
        postback_link: IPostbackLink
        postback_link_envio: IPostbackLinkEnvio
        cliente: ICliente,
        emailTemplate: ITemplate,
        shield_configuration: IShieldConfiguration,
        link_visita_configuration: ILinkVisitaConfiguration,
        link_visita_acesso: ILinkVisitaAcesso,
        google_profile: IGoogleProfile,
    }
}