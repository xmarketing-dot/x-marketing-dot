import { NextRequest } from 'next/server';
import { chatEmitter } from '@/lib/chatEmitter';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetThreadId = searchParams.get('threadId');
  const role = searchParams.get('role');

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial SSE Connection Event
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: 'connected' })}\n\n`));

      // 2. Listener for new messages (0ms event driven)
      const onNewMessage = (message: any) => {
        if (targetThreadId && String(message.threadId) === String(targetThreadId)) {
          try {
            controller.enqueue(
              encoder.encode(`event: new_message\ndata: ${JSON.stringify([message])}\n\n`)
            );
          } catch (err) {}
        }
      };

      // 3. Listener for thread updates (Admin Mode)
      const onThreadUpdate = (thread: any) => {
        if (role === 'admin') {
          try {
            controller.enqueue(
              encoder.encode(`event: threads\ndata: ${JSON.stringify([thread])}\n\n`)
            );
          } catch (err) {}
        }
      };

      chatEmitter.on('new_message', onNewMessage);
      chatEmitter.on('thread_update', onThreadUpdate);

      // Heartbeat every 15 seconds to prevent browser connection timeout
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (e) {
          clearInterval(pingInterval);
        }
      }, 15000);

      // Clean up on disconnect
      req.signal.addEventListener('abort', () => {
        chatEmitter.off('new_message', onNewMessage);
        chatEmitter.off('thread_update', onThreadUpdate);
        clearInterval(pingInterval);
        try {
          controller.close();
        } catch (e) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
