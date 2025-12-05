import {Router, Request, Response} from 'express';
import {
    Fila_Click,
    Fila_IpBlock,
    Fila_Visita,
    Fila_Visita_Metrica,
    Fila_postBackLinkEnvio,
    Fila_postBackLinkEnvioIntegracao,
    Fila_Checkout,
    Fila_Checkout_Integracao,
} from "./queueManager";

const router = Router();

// Interface para dados da fila
interface QueueStats {
    name: string;
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
}

// Função para obter estatísticas de uma fila
async function getQueueStats(queue: any, name: string): Promise<QueueStats> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
    ]);

    const isPaused = await queue.isPaused();

    return {
        name,
        waiting,
        active,
        completed,
        failed,
        delayed,
        paused: isPaused,
    };
}

// Rota principal - Dashboard
router.get('/', async (req: Request, res: Response) => {
    try {
        const queues = [
            {queue: Fila_Visita, name: 'Visita'},
            {queue: Fila_IpBlock, name: 'IpBlock'},
            {queue: Fila_Click, name: 'Click'},
            {queue: Fila_Visita_Metrica, name: 'Visita Metrica'},
            {queue: Fila_postBackLinkEnvio, name: 'PostBack Link Envio'},
            {queue: Fila_postBackLinkEnvioIntegracao, name: 'PostBack Link Envio Integracao'},
            {queue: Fila_Checkout, name: 'Checkout'},
            {queue: Fila_Checkout_Integracao, name: 'Checkout Integracao'},
        ];

        const stats = await Promise.all(
            queues.map(({queue, name}) => getQueueStats(queue, name))
        );

        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard de Filas - Ratoeira Ads</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        h1 {
            color: white;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .queue-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .queue-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        }
        .queue-name {
            font-size: 1.5em;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }
        .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .stat-item:last-child {
            border-bottom: none;
        }
        .stat-label {
            color: #666;
            font-weight: 500;
        }
        .stat-value {
            font-weight: bold;
            color: #333;
        }
        .stat-value.waiting { color: #f39c12; }
        .stat-value.active { color: #3498db; }
        .stat-value.completed { color: #27ae60; }
        .stat-value.failed { color: #e74c3c; }
        .stat-value.delayed { color: #9b59b6; }
        .paused-badge {
            display: inline-block;
            background: #e74c3c;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.8em;
            margin-top: 10px;
        }
        .refresh-btn {
            display: block;
            margin: 20px auto;
            padding: 12px 30px;
            background: white;
            color: #667eea;
            border: none;
            border-radius: 8px;
            font-size: 1em;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        }
        .refresh-btn:hover {
            background: #667eea;
            color: white;
            transform: scale(1.05);
        }
        .auto-refresh {
            text-align: center;
            color: white;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Dashboard de Filas</h1>
        <div class="stats-grid">
            ${stats.map(stat => `
                <div class="queue-card">
                    <div class="queue-name">${stat.name}</div>
                    <div class="stat-item">
                        <span class="stat-label">Aguardando:</span>
                        <span class="stat-value waiting">${stat.waiting}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Em Processamento:</span>
                        <span class="stat-value active">${stat.active}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Concluídos:</span>
                        <span class="stat-value completed">${stat.completed}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Falhados:</span>
                        <span class="stat-value failed">${stat.failed}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Atrasados:</span>
                        <span class="stat-value delayed">${stat.delayed}</span>
                    </div>
                    ${stat.paused ? '<div class="paused-badge">⏸️ PAUSADA</div>' : ''}
                </div>
            `).join('')}
        </div>
        <button class="refresh-btn" onclick="location.reload()">🔄 Atualizar</button>
        <div class="auto-refresh">
            <p>Atualização automática a cada 5 segundos</p>
        </div>
    </div>
    <script>
        // Auto-refresh a cada 5 segundos
        setTimeout(() => location.reload(), 5000);
    </script>
</body>
</html>
        `;
        res.send(html);
    } catch (error) {
        console.error('Erro ao obter estatísticas das filas:', error);
        res.status(500).json({error: 'Erro ao obter estatísticas das filas'});
    }
});

// API JSON para estatísticas
router.get('/api/stats', async (req: Request, res: Response) => {
    try {
        const queues = [
            {queue: Fila_Visita, name: 'Visita'},
            {queue: Fila_IpBlock, name: 'IpBlock'},
            {queue: Fila_Click, name: 'Click'},
            {queue: Fila_Visita_Metrica, name: 'Visita Metrica'},
            {queue: Fila_postBackLinkEnvio, name: 'PostBack Link Envio'},
            {queue: Fila_postBackLinkEnvioIntegracao, name: 'PostBack Link Envio Integracao'},
            {queue: Fila_Checkout, name: 'Checkout'},
            {queue: Fila_Checkout_Integracao, name: 'Checkout Integracao'},
        ];

        const stats = await Promise.all(
            queues.map(({queue, name}) => getQueueStats(queue, name))
        );

        res.json(stats);
    } catch (error) {
        console.error('Erro ao obter estatísticas das filas:', error);
        res.status(500).json({error: 'Erro ao obter estatísticas das filas'});
    }
});

export {router as monitoroRouter};
