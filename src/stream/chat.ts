import { Router, Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { param, validationResult } from 'express-validator';

const router = Router();

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws: WebSocket, req: Request) => {
    const streamId = req.url?.split('/')[2];

    console.log(`Client connected to stream ${streamId}`);

    ws.on('message', (message: string) => {
        console.log(`Message from client: ${message}`);

        wss.clients.forEach((client: WebSocket) => {
            if (client !== ws && client.readyState === client.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log(`Client disconnected from stream ${streamId}`);
    });
});

router.post("/stream/:streamId/chat", 
    param('streamId').isInt({ min: 0, max: 2147483647 }).notEmpty(),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        res.status(200).send('Stream Chat Endpoint Hit');
    }
);

export { router, wss };
