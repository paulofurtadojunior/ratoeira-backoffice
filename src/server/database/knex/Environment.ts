import {Knex} from 'knex';
import path from 'path';

// banco homologa
export const development: Knex.Config = {
    client: 'pg',
    migrations: {
        tableName: 'knex_migrations',
        directory: path.resolve(__dirname, '..', 'migrations'),
        extension: 'ts'
    },
    connection: {
        host: process.env.HOMOLOGA_DATABASE_HOST,
        user: process.env.HOMOLOGA_DATABASE_USER,
        database: process.env.HOMOLOGA_DATABASE_NAME,
        password: process.env.HOMOLOGA_DATABASE_PASSWORD,
        port: Number(process.env.HOMOLOGA_DATABASE_PORT || 5432),
        ssl: {rejectUnauthorized: false}
    },
    pool: {
        min: 0,
        max: 1,
        idleTimeoutMillis: 30000
    }
};

export const developmentReadOnly: Knex.Config = {
    client: 'pg',
    migrations: {
        tableName: 'knex_migrations',
        directory: path.resolve(__dirname, '..', 'migrations'),
        extension: 'ts'
    },
    connection: {
        host: process.env.READONLY_HOMOLOGA_DATABASE_HOST,
        user: process.env.READONLY_HOMOLOGA_DATABASE_USER,
        database: process.env.READONLY_HOMOLOGA_DATABASE_NAME,
        password: process.env.READONLY_HOMOLOGA_DATABASE_PASSWORD,
        port: Number(process.env.READONLY_HOMOLOGA_DATABASE_PORT || 25060),
        ssl: {rejectUnauthorized: false}
    },
    pool: {
        min: 0,
        max: 1,
        idleTimeoutMillis: 30000
    }
};
// final banco homologa


// inicio banco producao
export const production: Knex.Config = {
    client: 'pg',
    migrations: {
        tableName: 'knex_migrations',
        directory: path.resolve(__dirname, '..', 'migrations'),
        extension: 'ts'
    },
    seeds: {
        directory: path.resolve(__dirname, '..', 'seeds')
    },
    connection: {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
        port: Number(process.env.DATABASE_PORT || 5432),
        ssl: {rejectUnauthorized: false},
        application_name: 'raads-backoffice'
    }
};

export const productionReadOnly: Knex.Config = {
    client: 'pg',
    migrations: {
        tableName: 'knex_migrations',
        directory: path.resolve(__dirname, '..', 'migrations'),
        extension: 'ts'
    },
    seeds: {
        directory: path.resolve(__dirname, '..', 'seeds')
    },
    connection: {
        host: process.env.READONLY_DATABASE_HOST,
        user: process.env.READONLY_DATABASE_USER,
        database: process.env.READONLY_DATABASE_NAME,
        password: process.env.READONLY_DATABASE_PASSWORD,
        port: Number(process.env.READONLY_DATABASE_PORT || 5432),
        ssl: {rejectUnauthorized: false}
    },
};

// final banco producao


// inicio banco métricas de producao
export const productionDatabaseMetricas: Knex.Config = {
    client: 'pg',
    connection: {
        host: process.env.DATABASE_METRICA_HOST,
        user: process.env.DATABASE_METRICA_USER,
        database: process.env.DATABASE_METRICA_NAME,
        password: process.env.DATABASE_METRICA_PASSWORD,
        port: Number(process.env.DATABASE_METRICA_PORT || 5432),
        ssl: {rejectUnauthorized: false}
    },
};
// final banco métricas de producao


// inicio banco teste
export const productionBaseTeste: Knex.Config = {
    client: 'pg',
    connection: {
        host: process.env.DATABASE_TESTE_HOST,
        user: process.env.DATABASE_TESTE_USER,
        database: process.env.DATABASE_TESTE_NAME,
        password: process.env.DATABASE_TESTE_PASSWORD,
        port: Number(process.env.DATABASE_TESTE_PORT || 5432),
        ssl: {rejectUnauthorized: false}
    },
};
// final banco teste

// inicio banco local
export const local: Knex.Config = {
    client: 'pg',
    migrations: {
        tableName: 'knex_migrations',
        directory: path.resolve(__dirname, '..', 'migrations'),
        extension: 'ts'
    },
    connection: {
        host: process.env.LOCAL_DATABASE_HOST,
        user: process.env.LOCAL_DATABASE_USER,
        database: process.env.LOCAL_DATABASE_NAME,
        password: process.env.LOCAL_DATABASE_PASSWORD,
        port: Number(process.env.LOCAL_DATABASE_PORT || 5432),
        ssl: false
    },
    pool: {
        min: 0,
        max: 1,
        idleTimeoutMillis: 30000
    }
};
// final banco local