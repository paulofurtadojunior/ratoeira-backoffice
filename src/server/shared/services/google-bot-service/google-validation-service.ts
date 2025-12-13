import ipaddr from 'ipaddr.js';
import {RedisClient} from '../../../redis';

// URLs oficiais do Google
const GOOGLE_SOURCES = {
    BOT: 'https://developers.google.com/search/apis/ipranges/googlebot.json',
    SPECIAL: 'https://developers.google.com/search/apis/ipranges/special-crawlers.json',
    USER_FETCH: 'https://developers.google.com/search/apis/ipranges/user-triggered-fetchers-google.json',
    INFRA: 'https://www.gstatic.com/ipranges/goog.json',
};

// Se quiser adicionar ranges manuais:
const CUSTOM_BOT_CIDRS: string[] = [
    // exemplo:
    // '2001:4860:4801:10::/64',
];

const CUSTOM_INFRA_CIDRS: string[] = [
    // exemplo:
    // '2001:4860::/32',
];

// Armazenamento em memória
let googleBotCidrs: string[] = [];
let googleInfraCidrs: string[] = [];
let googleAllCidrs: string[] = [];

// Tipos dos JSONs do Google
type GooglePrefix = {
    ipv4Prefix?: string;
    ipv6Prefix?: string;
};

type GoogleIpRangesJson = {
    prefixes?: GooglePrefix[];
};

// ------------------ Helpers ------------------ //

/**
 * Extrai uma lista de strings CIDR (ipv4Prefix/ipv6Prefix) de um JSON padrão do Google.
 */
const extractCidrsFromGoogleJson = (data: GoogleIpRangesJson): string[] => {
    if (!data.prefixes) return [];
    return data.prefixes
        .map((p) => p.ipv4Prefix || p.ipv6Prefix || '')
        .filter(Boolean)
        .map((cidr) => cidr.toLowerCase());
};

/**
 * Remove entradas inválidas (sem "/" ou com formato inválido) para evitar erro no ipaddr.parseCIDR.
 */
const normalizeCidrs = (cidrs: string[]): string[] => {
    const valid: string[] = [];

    for (const cidr of cidrs) {
        if (!cidr.includes('/')) {
            console.warn('[CIDR INVALIDO] Sem máscara, ignorando:', cidr);
            continue;
        }
        try {
            ipaddr.parseCIDR(cidr);
            valid.push(cidr);
        } catch (e) {
            console.warn('[CIDR INVALIDO] parseCIDR falhou, ignorando:', cidr, e);
        }
    }

    return valid;
};

// ------------------ Loader ------------------ //

/**
 * Carrega e normaliza os ranges de IP da Google:
 *  - Bots/fetchers: googlebot.json, special-crawlers.json, user-triggered-fetchers-google.json
 *  - Infraestrutura geral: goog.json
 */
export const loadGoogleIpRanges = async (): Promise<void> => {
    try {
        const redisClient = await RedisClient.getClient();
        const chaveGooglebot = 'range_ip_googlebot';
        const chaveGoogleInfra = 'range_ip_googleinfra';
        const chaveGoogleAll = 'range_ip_googleall';
        const googleBotCached = await redisClient.get(chaveGooglebot);
        const googleIngraCached = await redisClient.get(chaveGoogleInfra);

        if (googleBotCached && googleIngraCached) {
            googleBotCidrs = JSON.parse(googleBotCached);
            googleInfraCidrs = JSON.parse(googleIngraCached);
            googleAllCidrs = normalizeCidrs([...googleBotCidrs, ...googleInfraCidrs]);

            console.log('[GOOGLE IP RANGES] Listas carregadas do cache Redis. Bot CIDRs:', googleBotCidrs.length, 'Infra CIDRs:', googleInfraCidrs.length);
            return;
        } else{
            const [
                botRes,
                specialRes,
                userFetchRes,
                infraRes,
            ] = await Promise.all([
                fetch(GOOGLE_SOURCES.BOT),
                fetch(GOOGLE_SOURCES.SPECIAL),
                fetch(GOOGLE_SOURCES.USER_FETCH),
                fetch(GOOGLE_SOURCES.INFRA),
            ]);
    
            if (!botRes.ok) throw new Error(`Erro HTTP ${botRes.status} em BOT`);
            if (!specialRes.ok) throw new Error(`Erro HTTP ${specialRes.status} em SPECIAL`);
            if (!userFetchRes.ok) throw new Error(`Erro HTTP ${userFetchRes.status} em USER_FETCH`);
            if (!infraRes.ok) throw new Error(`Erro HTTP ${infraRes.status} em INFRA`);
    
            const [botJson, specialJson, userFetchJson, infraJson] = await Promise.all([
                botRes.json() as Promise<GoogleIpRangesJson>,
                specialRes.json() as Promise<GoogleIpRangesJson>,
                userFetchRes.json() as Promise<GoogleIpRangesJson>,
                infraRes.json() as Promise<GoogleIpRangesJson>,
            ]);
    
            const rawBotCidrs = [
                ...extractCidrsFromGoogleJson(botJson),
                ...extractCidrsFromGoogleJson(specialJson),
                ...extractCidrsFromGoogleJson(userFetchJson),
                ...CUSTOM_BOT_CIDRS,
            ];
    
            const rawInfraCidrs = [
                ...extractCidrsFromGoogleJson(infraJson),
                ...CUSTOM_INFRA_CIDRS,
            ];
    
            googleBotCidrs = normalizeCidrs(rawBotCidrs);
            googleInfraCidrs = normalizeCidrs(rawInfraCidrs);
            googleAllCidrs = normalizeCidrs([...googleBotCidrs, ...googleInfraCidrs]);

            const time = 12 * 3600;
            await redisClient.set(chaveGooglebot, JSON.stringify(googleBotCidrs), { EX: time });
            await redisClient.set(chaveGoogleInfra, JSON.stringify(googleInfraCidrs), { EX: time });
            await redisClient.set(chaveGoogleAll, JSON.stringify(googleAllCidrs), { EX: time });
            console.log('[GOOGLE IP RANGES] Listas adicionadas no cache Redis. Bot CIDRs:', googleBotCidrs.length, 'Infra CIDRs:', googleInfraCidrs.length);
    
            console.log('[GOOGLE IP RANGES] Bot CIDRs:', googleBotCidrs.length);
            console.log('[GOOGLE IP RANGES] Infra CIDRs:', googleInfraCidrs.length);
            console.log('[GOOGLE IP RANGES] Total CIDRs:', googleAllCidrs.length);
        }
        
    } catch (err) {
        console.error('[GOOGLE IP RANGES] Erro ao carregar listas de IPs:', err);
        // Se quiser, pode manter listas antigas em memória e não zerar nada aqui.
    }
};

export const GoogleBotValidationService = {
    loadGoogleIpRanges
}