import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ChatThreadModel from '@/models/ChatThread';
import ChatMessageModel from '@/models/ChatMessage';
import { chatEmitter } from '@/lib/chatEmitter';

export async function POST(req: NextRequest) {
  try {
    const { threadId } = await req.json();

    if (!threadId) {
      return NextResponse.json({ error: 'threadId is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Delete Thread & All associated Messages
    await Promise.all([
      ChatThreadModel.findByIdAndDelete(threadId),
      ChatMessageModel.deleteMany({ threadId }),
    ]);

    // Emit live thread update event
    chatEmitter.emit('threads', { deletedThreadId: threadId });

    return NextResponse.json({ success: true, threadId });
  } catch (error: any) {
    return NextResponse.json({ error: 'Delete chat error' }, { status: 500 });
  }
}
