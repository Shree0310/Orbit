// app/api/traces/latest/route.ts
import { NextResponse } from 'next/server';
import { TraceEvent } from '@/types/trace';
import { mockTrace } from '@/lib/mockTrace';

// In-memory storage for the latest trace (simple Option A implementation)
// In production, this would be a database or external storage
let latestTrace: TraceEvent[] = mockTrace;

export async function GET() {
  return NextResponse.json(latestTrace);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'Invalid payload: events array required' },
        { status: 400 }
      );
    }

    // Store the new trace
    latestTrace = body.events;

    return NextResponse.json({
      success: true,
      eventCount: latestTrace.length
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to store trace' },
      { status: 500 }
    );
  }
}
