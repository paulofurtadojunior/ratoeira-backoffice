import {Router} from 'express';
import {ValidadorPresellController} from "../controllers/validador-presell";
import basicAuth from "express-basic-auth";
import {monitoroRouter} from "../filas/monitoro";

const router = Router();

router.get('/', (req, res) => {
    return res.send('Bem vindo ao backoffice da Ratoeira Ads');
});

router.post('/validar-presell', ValidadorPresellController.validadorPresellValidation, ValidadorPresellController.validadorPresell);

// Rota de dashboard customizado usando monitoro (sem problemas de CSP)
router.use('/dashboard', basicAuth({
    users: {'admin': 'f1L45Rat031rAaDs_'},
    challenge: true
}));
router.use('/dashboard', monitoroRouter);

// A rota /filas usando @bull-monitor/express é configurada no server.ts
export {router};
