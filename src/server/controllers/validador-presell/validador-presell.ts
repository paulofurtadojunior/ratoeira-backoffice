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

        const startTime = Date.now(); // Captura o timestamp inicial
        await Promise.all([
            page.goto(url, {
                waitUntil: "networkidle2",
            }),
            page.waitForNetworkIdle({idleTime: 250}),
        ]);
        const loadTime = Date.now() - startTime; // Calcula o tempo de carregamento em milissegundos
        console.log(`Tempo de carregamento: ${loadTime} ms`);

        notifications.push(
            {
                tipo: 'url',
                status: true,
                mensagem: url,
            });
        notifications.push(
            {
                status: true,
                tipo: 'page_load',
                mensagem: loadTime,
            });


        // Verificar se o script contendo a parte da URL foi carregado
        const scriptLoaded = await page.evaluate((scriptPart) => {
            const scripts = Array.from(document.getElementsByTagName('script'));
            return scripts.some(script => script.src.includes(scriptPart));
        }, scriptPart);

        if (!scriptLoaded) {
            notifications.push(
                {
                    status: false,
                    tipo: 'msg',
                    mensagem: 'ATENÇÃO - Instalação mal sucedida! O script da Ratoeira não foi encontrado na página',
                });
            apiResult.data = notifications;
            return res.status(StatusCodes.CREATED).json(apiResult);
        } else {
            notifications.push(
                {
                    status: true,
                    tipo: 'msg',
                    mensagem: 'Instalação realizada com sucesso! O script da Ratoeira foi encontrado na página!',
                });
        }

        const visitaRegistrada = consoleMessages.find(x => x.text && x.text.includes('VISITA REGISTRADA'));
        if (visitaRegistrada) {
            notifications.push(
                {
                    status: true,
                    tipo: 'msg',
                    mensagem: 'Visita Registrada com sucesso',
                });
        }

        const ratoeiraDesativada = consoleMessages.find(x => x.text && x.text.includes('RATOEIRA DESATIVADA'));

        if (ratoeiraDesativada) {
            notifications.push(
                {
                    status: false,
                    tipo: 'msg',
                    mensagem: 'ATENÇÃO - A RATOEIRA ESTÁ DESATIVADA',
                });
        }

        const variableToCheck: string = 'idVisita';

        // Verifica se a variável específica está definida no contexto da página
        const variableLoaded = await page.evaluate((variableToCheck) => {
            return typeof (window as any)[variableToCheck] !== 'undefined';
        }, variableToCheck);

        console.log('variableLoaded', variableLoaded);

        // Obtém todos os botões e links
        const elements = await page.evaluate(() => {
            const elements: any[] = [];
            // Seleciona todos os links
            const links = document.querySelectorAll('a');
            links.forEach(link => {
                elements.push({
                    type: 'link',
                    href: link.href
                });
            });

            // Seleciona todos os botões
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
                const onClick = button.getAttribute('onclick');
                if (onClick) {
                    elements.push({
                        type: 'button',
                        onclick: onClick
                    });
                }
            });

            return elements;
        });

        // Verifica se 'vst_' está presente na URL dos links ou no atributo onclick dos botões
        const filteredElements = elements.filter(element => {
            if (element.type === 'link') {
                return element.href.includes('vst_');
            } else if (element.type === 'button') {
                return element.onclick.includes('vst_');
            }
        });

        // Exibe os elementos encontrados
        console.log('Elementos com "vst_" na URL ou onclick:', filteredElements);

        if (filteredElements && filteredElements.length > 0) {
            notifications.push(
                {
                    status: true,
                    tipo: 'link',
                    mensagem: JSON.stringify(filteredElements),
                });
            notifications.push(
                {
                    status: true,
                    tipo: 'msg',
                    mensagem: 'Links e botões contêm o parâmetro corretamente',
                });
        } else {
            notifications.push(
                {
                    status: false,
                    tipo: 'msg',
                    mensagem: 'ATENÇÃO - Links e botões NÃO contêm o parâmetro corretamente',
                });
        }

        // Tira o screenshot
        const screenshotBuffer = await page.screenshot({ quality: 20, type: 'jpeg'});
        // Converte a imagem para base64
        const screenshotBase64 = screenshotBuffer.toString('base64');

        if (screenshotBase64) {
            notifications.push(
                {
                    status: true,
                    tipo: 'screenshot',
                    mensagem: screenshotBase64,
                });
        }


        await browser.close();

    } catch (error) {
        console.log('error', error);
        res.status(500).json({message: 'Erro ao verificar a URL'});
    }


    apiResult.data = notifications;
    return res.status(StatusCodes.CREATED).json(apiResult);
};
