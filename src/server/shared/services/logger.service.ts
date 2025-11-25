import {Logtail} from '@logtail/node';
import winston from 'winston';
import {LogtailTransport} from '@logtail/winston';

// Criar cliente do Logtail
const bearer = process.env.LOGTAIL_BEARER_TOKEN;
const logtail = new Logtail(bearer ?? '');

// Criar logger Winston com transporte Logtail
export const logger = winston.createLogger({
    transports: [new LogtailTransport(logtail)],
});

// Funções auxiliares para logging estruturado
export const logInfo = (message: string, meta?: any) => {
    logger.info(message, meta);
};

export const logError = (message: string, error?: any, meta?: any) => {
    logger.error(message, {error: error?.message || error, stack: error?.stack, ...meta});
};

export const logWarn = (message: string, meta?: any) => {
    logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
    logger.debug(message, meta);
};

// Funções específicas de logging para operações de banco de dados
export const logDatabaseOperation = (operation: string, table: string, success: boolean, meta?: any) => {
    const logData = {
        operation,
        table,
        success,
        timestamp: new Date().toISOString(),
        ...meta
    };

    const clienteId = meta?.cliente_id || meta?.clienteId || '-';
    const campanhaId = meta?.campanha_id || meta?.campanhaId || '-';

    if (success) {
        logger.info(`Operação de banco de dados bem-sucedida: cliente_id:${clienteId} - campanha_id:${campanhaId} - ${operation} na ${table}`, logData);
    } else {
        logger.error(`Operação de banco de dados falhou: cliente_id:${clienteId} - campanha_id:${campanhaId} - ${operation} na ${table}`, logData);
    }
};

// Logging específico para chamadas de API
export const logApiCall = (service: string, method: string, success: boolean, meta?: any) => {
    const logData = {
        service,
        method,
        success,
        timestamp: new Date().toISOString(),
        ...meta
    };

    const clienteId = meta?.cliente_id || meta?.clienteId || '-';
    const campanhaId = meta?.campanha_id || meta?.campanhaId || '-';

    if (success) {
        logger.info(`Chamada de API bem-sucedida: cliente_id:${clienteId} - campanha_id:${campanhaId} - ${service}.${method}`, logData);
    } else {
        logger.error(`Chamada de API falhou: cliente_id:${clienteId} - campanha_id:${campanhaId} - ${service}.${method}`, logData);
    }
};

// Logging específico para processamento de filas
export const logQueueProcessing = (queueName: string, action: string, clienteId: number, success: boolean, meta?: any) => {
    const logData = {
        queueName,
        action,
        clienteId,
        success,
        timestamp: new Date().toISOString(),
        ...meta
    };

    const campanhaId = meta?.campanha_id || meta?.campanhaId || '-';

    if (success) {
        logger.info(`Processamento de fila bem-sucedido: cliente_id:${clienteId} - campanha_id:${campanhaId} - ${queueName} - ${action}`, logData);
    } else {
        logger.error(`Processamento de fila falhou: cliente_id:${clienteId} - campanha_id:${campanhaId} - ${queueName} - ${action}`, logData);
    }
};