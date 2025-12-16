import * as ipaddr from 'ipaddr.js';
import {RedisClient} from '../../../redis';

export let googleCidrs: string[] = [];

// Lista de CIDRs customizados (manualmente definidos)
const CUSTOM_CIDRS = [
    '74.125.0.0/16'
];

// URLs oficiais do Google
const GOOGLE_IP_RANGES = [
    'https://developers.google.com/search/apis/ipranges/googlebot.json',
    'https://developers.google.com/search/apis/ipranges/special-crawlers.json',
    'https://developers.google.com/search/apis/ipranges/user-triggered-fetchers-google.json',
    'https://www.gstatic.com/ipranges/goog.json'
];

// Carrega CIDRs do Google + sua lista personalizada
export const loadAllGoogleCidrs = async (): Promise<void> => {
    try {
        const redisClient = await RedisClient.getClient();
        //const ipFormated = ip.replace(/:/g, '_');
        const chaveGooglebot = 'googlebot_';// + ipFormated;
        const cidrSets = await Promise.all(
            GOOGLE_IP_RANGES.map(async (url) => {
                try {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`Erro HTTP: ${res.status} ao buscar ${url}`);
                    const data = await res.json();

                    const ipv4 = data.prefixes?.filter((p: any) => p.ipv4Prefix).map((p: any) => p.ipv4Prefix.toLowerCase()) || [];
                    const ipv6 = data.prefixes?.filter((p: any) => p.ipv6Prefix).map((p: any) => p.ipv6Prefix.toLowerCase()) || [];
                    return [...ipv4, ...ipv6];

                } catch (err) {
                    console.error(`[CIDR ERROR] Falha ao buscar ${url}:`, err);
                    return []; // Se uma falhar, continua com as outras
                }
            })
        );

        const flattened = cidrSets.flat();
        const totalCidrs = [...flattened, ...CUSTOM_CIDRS];

        if (totalCidrs.length === 0) {
            console.warn('[CIDR WARNING] Nenhum CIDR foi carregado.');
        } else {
            await redisClient.set(chaveGooglebot, JSON.stringify(totalCidrs));
            console.log(`[CIDR] ${googleCidrs.length} faixas IP do Google + customizadas carregadas.`);
        }

    } catch (err) {
        console.error('[CIDR ERROR] Erro inesperado ao carregar listas de IPs do Google:', err);
    }
};

// Verifica se o IP pertence a alguma faixa carregada
export const isGoogleIp = (ip: string): boolean => {
    try {
        const parsedIp = ipaddr.parse(ip);
        return googleCidrs.some((cidr) => {
            const [range, bits] = cidr.split('/');
            const parsedRange = ipaddr.parse(range);
            return parsedIp.match(parsedRange, parseInt(bits));
        });
    } catch {
        return false;
    }
};

export const ipEstaDentroDeAlgumCidr = (ip: string): boolean => {
    let endereco: ipaddr.IPv4 | ipaddr.IPv6;

    try {
        endereco = ipaddr.parse(ip);
    } catch (error) {
        console.error(`IP inválido: ${ip}`, error);
        return false;
    }

    return googleCidrs.some((cidr) => {
        // proteção extra, caso apareça algo estranho na lista
        if (!cidr.includes('/')) {
            console.warn('CIDR sem máscara, ignorando:', cidr);
            return false;
        }

        try {
            const [baseIp, prefix] = ipaddr.parseCIDR(cidr);

            if (endereco.kind() !== baseIp.kind()) return false;

            return endereco.match([baseIp, prefix]);
        } catch (e) {
            console.warn('CIDR inválido na lista, ignorando:', cidr, e);
            return false;
        }
    });
};

// Função para verificar se o IP é do Googlebot
export const isGooglebot = async (ip: string) => {

    let isPrefix = false;

    if (googleCidrs && googleCidrs.length > 0) {
        isPrefix = ipEstaDentroDeAlgumCidr(ip);
        console.log('isPrefix', isPrefix);
    }

    try {

        if (isPrefix) {
            console.log('É PREFIXO - NAO VAI FAZER DNS REVERSO');
            return true;
        }

        console.log('VAI FAZER O DNS REVERSO');

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const dns = require('dns');

        // 1. Reverse DNS (PTR) - IP → hostname
        const hostnames = await dns.promises.reverse(ip);
        const googlebotHostname = hostnames.find((hn: string) =>
            hn.endsWith('.googlebot.com') || hn.endsWith('.google.com') || hn.endsWith('.googleusercontent.com')
        );

        if (!googlebotHostname) return false;

        // 2. Forward DNS (A) - hostname → IP
        const addresses = await dns.promises.lookup(googlebotHostname, {all: true});
        return addresses.some((addr: { address: string; }) => addr.address === ip);
    } catch (err) {
        console.error('Erro na verificação do Googlebot:', err);
        if (isPrefix) {
            return true;
        }
        return false;
    }
};

export const GoogleBotService = {
    loadAllGoogleCidrs
}
