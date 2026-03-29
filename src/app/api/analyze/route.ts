import { NextRequest, NextResponse } from 'next/server';
import { extractChannelIdentifier, fetchChannel, fetchChannelVideos } from '@/lib/youtube';
import { getAnalysisAiEnhancements } from '@/lib/ai';
import { getMockChannel, getMockVideos } from '@/lib/mock-data';
import { enrichVideosWithMetrics } from '@/lib/metrics';
import type { AnalysisResult } from '@/types/youtube';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const channelInput = searchParams.get('channel');

  if (!channelInput) {
    return NextResponse.json({ error: 'Missing channel parameter' }, { status: 400 });
  }

  const identifier = extractChannelIdentifier(channelInput);
  if (!identifier) {
    return NextResponse.json(
      { error: 'Invalid YouTube channel URL or handle. Try formats like @ChannelName or https://youtube.com/@ChannelName' },
      { status: 400 }
    );
  }

  const hasApiKey = !!process.env.YOUTUBE_API_KEY;

  try {
    if (!hasApiKey) {
      return buildMockResponse();
    }

    const channel = await fetchChannel(identifier);

    const now = new Date();
    const rawVideos = await fetchChannelVideos(channel.id);
    const videos = enrichVideosWithMetrics(rawVideos);

    const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
    const averageViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
    const averageEngagement = videos.length > 0
      ? Number((videos.reduce((sum, v) => sum + v.engagementRate, 0) / videos.length).toFixed(2))
      : 0;

    const result: AnalysisResult = {
      channel,
      videos,
      analyzedAt: new Date().toISOString(),
      periodLabel: `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`,
      averageViews,
      averageEngagement,
      totalViews,
      isMockData: false,
    };

    const aiEnhancements = await getAnalysisAiEnhancements(result);

    return NextResponse.json({
      ...result,
      ...aiEnhancements,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === 'NO_API_KEY') {
      return buildMockResponse();
    }

    if (message === 'CHANNEL_NOT_FOUND') {
      return NextResponse.json({ error: 'Channel not found. Please check the URL and try again.' }, { status: 404 });
    }

    console.error('Analysis error:', message);
    return NextResponse.json({ error: 'Failed to analyze channel. Please try again.' }, { status: 500 });
  }
}

async function buildMockResponse(): Promise<NextResponse> {
  const mockChannel = getMockChannel();
  const mockRawVideos = getMockVideos();
  const videos = enrichVideosWithMetrics(mockRawVideos);

  const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
  const averageViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
  const averageEngagement = videos.length > 0
    ? Number((videos.reduce((sum, v) => sum + v.engagementRate, 0) / videos.length).toFixed(2))
    : 0;

  const now = new Date();
  const result: AnalysisResult = {
    channel: mockChannel,
    videos,
    analyzedAt: new Date().toISOString(),
    periodLabel: `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`,
    averageViews,
    averageEngagement,
    totalViews,
    isMockData: true,
  };

  return NextResponse.json({
    ...result,
    ...(await getAnalysisAiEnhancements(result)),
  });
}
