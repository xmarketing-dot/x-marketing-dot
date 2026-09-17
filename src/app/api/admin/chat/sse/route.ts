import { NextRequest } from 'next/server';
import { chatEmitter } from '@/lib/chatEmitter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial heartbeat
      controller.enqueue(encoder.encode(`event: connected\ndata: {"status":"connected"}\n\n`));

      const messageListener = (msg: any) => {
        try {
          if (msg && msg.gonderenTipi === 'user') {
            controller.enqueue(
              encoder.encode(`event: admin_customer_message\ndata: ${JSON.stringify(msg)}\n\n`)
            );
          }
        } catch (err) {
          // Closed stream
        }
      };

      const whatsappClickListener = (clickData: any) => {
        try {
          if (clickData) {
            controller.enqueue(
              encoder.encode(`event: admin_whatsapp_click\ndata: ${JSON.stringify(clickData)}\n\n`)
            );
          }
        } catch (err) {
          // Closed stream
        }
      };

      chatEmitter.on('new_message', messageListener);
      chatEmitter.on('whatsapp_click', whatsappClickListener);

      // Heartbeat ping every 25s to keep connection alive
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch (e) {
          clearInterval(interval);
        }
      }, 25000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        chatEmitter.off('new_message', messageListener);
        chatEmitter.off('whatsapp_click', whatsappClickListener);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
