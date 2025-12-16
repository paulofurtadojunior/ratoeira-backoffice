import * as deleteByGoogleBot from "./delete-by-google-bot";
import * as deleteByClienteInativo from "./delete-by-cliente-inativo";

export const linkVisitaAcessoProvider = {
    ...deleteByGoogleBot,
    ...deleteByClienteInativo
}