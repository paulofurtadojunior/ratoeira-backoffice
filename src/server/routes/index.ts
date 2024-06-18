import {Router} from 'express';
import {ValidadorPresellController} from "../controllers/validador-presell";

const router = Router();

router.get('/', (req, res) => {
    return res.send('Bem vindo ao backoffice da Ratoeira Ads');
});

router.post('/validar-presell', ValidadorPresellController.validadorPresellValidation, ValidadorPresellController.validadorPresell);

export {router};
