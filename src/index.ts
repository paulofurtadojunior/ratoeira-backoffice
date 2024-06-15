import {server} from './server/server';
import 'dotenv/config';

const startServer = () => {
    server.listen(process.env.PORT || 3333, () => {
        console.log('APP Rodando na porta ' + `${process.env.PORT || 3333}`);
    });
};

startServer();
