import cron from 'node-cron';
import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';

export function setupPolling() {
  // Every minute
  cron.schedule('* * * * *', async () => {
    try {
      const terminals = await prisma.terminal.findMany();
      const now = new Date();

      for (const terminal of terminals) {
        const offlineCount = terminal.offlineCount + 1;
        const lastPolling = terminal.lastPolling || now;
        const downtimeMinutes = Math.floor((now.getTime() - lastPolling.getTime()) / 60000);

        if (offlineCount >= 3) {
          // Terminal is offline after 3 consecutive failures
          await prisma.terminal.update({
            where: { id: terminal.id },
            data: {
              status: 'OFFLINE',
              offlineCount,
              downtimeMinutes: {
                increment: downtimeMinutes
              },
              errorLogs: {
                create: {
                  type: 'OFFLINE',
                  message: 'Terminal went offline after 3 consecutive polling failures',
                },
              },
            },
          });
        } else {
          await prisma.terminal.update({
            where: { id: terminal.id },
            data: { 
              offlineCount,
              downtimeMinutes: {
                increment: terminal.status === 'OFFLINE' ? downtimeMinutes : 0
              }
            },
          });
        }
      }
    } catch (error) {
      logger.error('Polling service error:', error);
    }
  });
}

export async function handlePolling(terminalId: string) {
  try {
    const terminal = await prisma.terminal.update({
      where: { id: terminalId },
      data: {
        status: 'ONLINE',
        offlineCount: 0,
        lastPolling: new Date(),
      },
    });

    return terminal.greeting || null;
  } catch (error) {
    logger.error(`Polling handler error for terminal ${terminalId}:`, error);
    throw error;
  }
}