import express from 'express';
import cors from 'cors';
import {router} from './routes';
import 'dotenv/config';
import process from 'node:process';

const server = express();
server.use(express.json());

server.use(cors());

process.on('uncaughtException', (error) => {
    console.log('[ERRO FATAL]', error);
});

process.on('exit', (code) => {
    console.log('Process exit event with code: ', code);
});

server.use(router);


export {server};
