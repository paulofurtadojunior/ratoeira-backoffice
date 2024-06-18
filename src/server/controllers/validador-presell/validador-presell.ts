import {ApiResult} from '../../shared/models/api-result';
import {Request, Response} from 'express';
import {object, string} from 'yup';
import {validation} from '../../shared/middlewares';
import {StatusCodes} from 'http-status-codes';

import puppeteer from 'puppeteer';

interface IRequestBody {
    url: string;
}

export const validadorPresellValidation = validation((getSchema) => ({

    body: getSchema<IRequestBody>(
        object({
            url: string().required()
        })
    )
}));


const delay = (time: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time)
    });
}


export const validadorPresell = async (req: Request<{}, {}, IRequestBody>, res: Response) => {

    console.log('rodando aqui 2222');

    const apiResult: ApiResult = {
        data: {},
        errors: {},
        message: 'Validador de Presell',
        success: true
    };
    const {url} = req.body;

    const scriptPart = 'https://api.ratoeiraads.com.br/script-ratoeira/';

    const notifications = [];

    try {

        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();

        // Armazenar mensagens do console
        const consoleMessages: Array<any> = [{}];

        // Monitorar mensagens do console
        page.on('console', msg => {
            consoleMessages.push({type: msg.type(), text: msg.text()});
        });


        await Promise.all([
            page.goto(url, {
                waitUntil: "domcontentloaded",
            }),
            page.waitForNetworkIdle({ idleTime: 250 }),
        ]);


        // console.time("goto");
        // await page.goto(url, {
        //     waitUntil: 'networkidle2',
        //     timeout: 120000 // Tempo limite aumentado (em milissegundos)
        // }).catch((err) => console.log("error loading url", err));
        // console.timeEnd("goto");


        const visitaRegistrada = consoleMessages.find(x => x.text && x.text.includes('VISITA REGISTRADA'));

        if (visitaRegistrada) {
            notifications.push(
                {
                    sucesso: true,
                    mensagem: 'Visita Registrada com sucesso',
                    ordem: 1
                });
            apiResult.data = notifications;
        }

        const ratoeiraDesativada = consoleMessages.find(x => x.text && x.text.includes('RATOEIRA DESATIVADA'));

        if (ratoeiraDesativada) {
            notifications.push(
                {
                    sucesso: true,
                    mensagem: 'ATENÇÃO - A RATOEIRA ESTÁ DESATIVADA',
                    ordem: 1
                });
            apiResult.data = notifications;
        }

        // Verificar se o script contendo a parte da URL foi carregado
        const scriptLoaded = await page.evaluate((scriptPart) => {
            const scripts = Array.from(document.getElementsByTagName('script'));
            return scripts.some(script => script.src.includes(scriptPart));
        }, scriptPart);

        if (!scriptLoaded) {
            await browser.close();
            notifications.push(
                {
                    sucesso: false,
                    mensagem: 'ATENÇÃO - Instalação mal sucedida! O script da Ratoeira não foi encontrado na página',
                    ordem: 2
                });
            apiResult.data = notifications;
            return res.status(StatusCodes.CREATED).json(apiResult);
        } else {
            notifications.push(
                {
                    sucesso: true,
                    mensagem: 'Instalação realizada com sucesso! O script da Ratoeira foi encontrado na página!',
                    ordem: 2
                });
            apiResult.data = notifications;
        }

        console.log('before waiting');
        await delay(10000);
        console.log('after waiting');

        // Verificar se os links e botões contêm um parâmetro específico que começa com 'vst_'
        const validLinks = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('a[href], button[onclick]'));
            return elements.every(el => {
                const href = el.getAttribute('href') || '';

                console.log('href', href);

                const onclick = el.getAttribute('onclick') || '';
                return href.includes('vst_') || onclick.includes('vst_');
            });
        });

        await page.screenshot({ path: `presell.png` });
        await browser.close();

        console.log('validLinks', validLinks);

        if (validLinks) {
            notifications.push(
                {
                    sucesso: true,
                    mensagem: 'Links e botões contêm o parâmetro corretamente',
                    ordem: 3
                });
            apiResult.data = notifications;
        } else {
            notifications.push(
                {
                    sucesso: false,
                    mensagem: 'ATENÇÃO - Links e botões NÃO contêm o parâmetro corretamente',
                    ordem: 3
                });

            apiResult.data = notifications;
        }
    } catch (error) {
        console.log('error', error);
        res.status(500).json({message: 'Erro ao verificar links e botões'});
    }


    return res.status(StatusCodes.CREATED).json(apiResult);
};
