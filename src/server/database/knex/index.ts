import {knex} from 'knex';
import 'dotenv/config';
import pg from 'pg';

import {development, production, productionReadOnly, productionDatabaseMetricas, local, productionBaseTeste} from './Environment';


if (process.env.NODE_ENV === 'production') {
    pg.types.setTypeParser(28, 'text', parseInt);
}


const getEnvironment = () => {
    console.log('<- RODANDO ->', process.env.NODE_ENV);

    switch (process.env.NODE_ENV) {
        case 'production':
            return production;
        case 'local':
            return local;
        default:
            return development;
    }
};

// READ-ONLY
const getEnvironmentReadOnly = () => {

    console.log('<- RODANDO [ReadOnly]->', process.env.NODE_ENV);

    switch (process.env.NODE_ENV) {
        case 'production':
            return productionReadOnly;
        case 'local':
            return local;
        default:
            return development;
    }
};
// READ-ONLY

const getEnvironmentDatabaseMetricas = () => {

    switch (process.env.NODE_ENV) {
        case 'production':
            console.log('[ PRODUÇÃO ]');
            return productionDatabaseMetricas;
        case 'local':
            return local;
        default:
            console.log('[ LOCALHOST ]');
            return development;
    }
};

const getEnvironmentBaseTeste = () => {

    switch (process.env.NODE_ENV) {
        case 'production':
            console.log('[ PRODUÇÃO ]');
            return productionBaseTeste;
        case 'local':
            return local;
        default:
            console.log('[ LOCALHOST ]');
            return development;
    }
};
export const myKnex = knex(getEnvironment());

export const myKnexReadOnly = knex(getEnvironmentReadOnly());

export const knexMetricas = knex(getEnvironmentDatabaseMetricas());

export const knexBaseTeste = knex(getEnvironmentBaseTeste());