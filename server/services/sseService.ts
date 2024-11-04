import { Router, Response } from 'express';
import { logger } from '../utils/logger';

interface SSEClient {
  response: Response;
  lastEventId: string;
  keepAliveInterval: NodeJS.Timeout;
}

const clients = new Map<string, SSEClient>();

// Cleanup inactive clients periodically
setInterval(() => {
  for (const [clientId, client] of clients.entries()) {
    try {
      client.response.write(': ping\n\n');
    } catch (error) {
      logger.info(`Removing inactive client: ${clientId}`);
      clearInterval(client.keepAliveInterval);
      clients.delete(clientId);
    }
  }
}, 30000);

export function setupSSE(router: Router) {
  router.get('/sse/:terminalId', (req, res) => {
    const terminalId = req.params.terminalId;

    // SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable proxy buffering
      'Access-Control-Allow-Origin': '*'
    });

    const clientId = `${terminalId}-${Date.now()}`;
    const lastEventId = req.headers['last-event-id']?.toString() || '0';

    // Keep connection alive with regular comments
    const keepAliveInterval = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch (error) {
        logger.error(`Keepalive failed for client ${clientId}:`, error);
        cleanup();
      }
    }, 15000);

    // Store client information
    clients.set(clientId, {
      response: res,
      lastEventId,
      keepAliveInterval
    });

    logger.info(`SSE client connected: ${clientId}`);

    // Send initial connection confirmation
    const initialMessage = {
      type: 'connected',
      timestamp: new Date().toISOString(),
      clientId
    };
    res.write(`data: ${JSON.stringify(initialMessage)}\n\n`);

    // Cleanup function
    const cleanup = () => {
      clearInterval(keepAliveInterval);
      clients.delete(clientId);
      logger.info(`SSE client disconnected: ${clientId}`);
    };

    // Clean up on client disconnect
    req.on('close', cleanup);
    req.on('end', cleanup);
    res.on('error', cleanup);
  });
}

export function sendSSEMessage(terminalId: string, message: string) {
  try {
    let clientCount = 0;
    const eventData = {
      type: 'message',
      message,
      timestamp: new Date().toISOString()
    };

    const messageStr = `data: ${JSON.stringify(eventData)}\n\n`;

    for (const [clientId, client] of clients.entries()) {
      if (clientId.startsWith(terminalId)) {
        try {
          client.response.write(messageStr);
          clientCount++;
        } catch (error) {
          logger.error(`Failed to send message to client ${clientId}:`, error);
          clearInterval(client.keepAliveInterval);
          clients.delete(clientId);
        }
      }
    }

    logger.info(`SSE message sent to ${clientCount} clients for terminal ${terminalId}`);
    return clientCount;
  } catch (error) {
    logger.error('Failed to send SSE message:', error);
    throw error;
  }
}