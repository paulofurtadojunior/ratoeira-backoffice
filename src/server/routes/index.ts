import {Router} from 'express';

const router = Router();

router.get('/', (req, res) => {
    return res.send('Bem vindo ao backoffice da Ratoeira Ads');
});

export {router};
