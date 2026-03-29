import { NextRequest, NextResponse } from 'next/server';
import { getCompareAiInsight } from '@/lib/ai';
import type { AnalysisResult } from '@/types/youtube';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      primary?: AnalysisResult;
      compare?: AnalysisResult;
    };

    if (!body.primary || !body.compare) {
      return NextResponse.json({ error: 'Both primary and compare analysis are required.' }, { status: 400 });
    }

    const insight = await getCompareAiInsight(body.primary, body.compare);
    return NextResponse.json({ insight });
  } catch (error) {
    console.error('Compare insight error:', error);
    return NextResponse.json({ error: 'Failed to generate compare insight.' }, { status: 500 });
  }
}