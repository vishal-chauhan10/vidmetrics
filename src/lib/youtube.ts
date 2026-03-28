import type { ChannelInfo } from '@/types/youtube';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

function getApiKey(): string | null {
  return process.env.YOUTUBE_API_KEY || null;
}

export function extractChannelIdentifier(input: string): { type: 'handle' | 'id' | 'custom'; value: string } | null {
  const trimmed = input.trim();

  // Direct handle input: @ChannelName
  if (trimmed.startsWith('@')) {
    return { type: 'handle', value: trimmed };
  }

  // URL patterns
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const path = url.pathname;

    // youtube.com/@handle
    const handleMatch = path.match(/^\/@([^/?]+)/);
    if (handleMatch) return { type: 'handle', value: `@${handleMatch[1]}` };

    // youtube.com/channel/UCxxxxxx
    const channelMatch = path.match(/^\/channel\/(UC[a-zA-Z0-9_-]+)/);
    if (channelMatch) return { type: 'id', value: channelMatch[1] };

    // youtube.com/c/CustomName or youtube.com/user/Username
    const customMatch = path.match(/^\/(c|user)\/([^/?]+)/);
    if (customMatch) return { type: 'custom', value: customMatch[2] };

    // youtube.com/CustomName (last resort — bare path)
    const bareMatch = path.match(/^\/([a-zA-Z0-9_-]+)$/);
    if (bareMatch && !['watch', 'feed', 'results', 'shorts', 'playlist'].includes(bareMatch[1])) {
      return { type: 'handle', value: `@${bareMatch[1]}` };
    }
  } catch {
    // Not a URL — treat as handle
    if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return { type: 'handle', value: `@${trimmed}` };
    }
  }

  return null;
}

async function youtubeGet<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('NO_API_KEY');

  const searchParams = new URLSearchParams({ ...params, key: apiKey });
  const res = await fetch(`${YOUTUBE_API_BASE}/${endpoint}?${searchParams}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error?.message || `YouTube API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

interface YouTubeChannelListResponse {
  items?: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      customUrl?: string;
      thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
      publishedAt: string;
    };
    statistics: {
      subscriberCount: string;
      videoCount: string;
      viewCount: string;
    };
    brandingSettings?: {
      image?: { bannerExternalUrl?: string };
    };
  }>;
}

interface YouTubeSearchResponse {
  items?: Array<{
    id: { videoId: string };
  }>;
}

interface YouTubeVideoListResponse {
  items?: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
      publishedAt: string;
    };
    statistics: {
      viewCount: string;
      likeCount: string;
      commentCount: string;
    };
    contentDetails: {
      duration: string;
    };
  }>;
}

export async function fetchChannel(identifier: { type: 'handle' | 'id' | 'custom'; value: string }): Promise<ChannelInfo> {
  const params: Record<string, string> = {
    part: 'snippet,statistics,brandingSettings',
  };

  if (identifier.type === 'handle') {
    params.forHandle = identifier.value.replace('@', '');
  } else if (identifier.type === 'id') {
    params.id = identifier.value;
  } else {
    params.forUsername = identifier.value;
  }

  const data = await youtubeGet<YouTubeChannelListResponse>('channels', params);

  if (!data.items || data.items.length === 0) {
    throw new Error('CHANNEL_NOT_FOUND');
  }

  const ch = data.items[0];
  const thumb = ch.snippet.thumbnails.high?.url || ch.snippet.thumbnails.medium?.url || ch.snippet.thumbnails.default?.url || '';

  return {
    id: ch.id,
    title: ch.snippet.title,
    description: ch.snippet.description,
    customUrl: ch.snippet.customUrl || '',
    thumbnailUrl: thumb,
    bannerUrl: ch.brandingSettings?.image?.bannerExternalUrl,
    subscriberCount: parseInt(ch.statistics.subscriberCount) || 0,
    videoCount: parseInt(ch.statistics.videoCount) || 0,
    viewCount: parseInt(ch.statistics.viewCount) || 0,
    publishedAt: ch.snippet.publishedAt,
  };
}

export async function fetchChannelVideos(
  channelId: string,
  publishedAfter?: string
): Promise<Array<{
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}>> {
  const searchParams: Record<string, string> = {
    part: 'id',
    channelId,
    type: 'video',
    order: 'date',
    maxResults: '50',
  };

  if (publishedAfter) {
    searchParams.publishedAfter = publishedAfter;
  }

  const searchData = await youtubeGet<YouTubeSearchResponse>('search', searchParams);

  if (!searchData.items || searchData.items.length === 0) {
    return [];
  }

  const videoIds = searchData.items.map((item) => item.id.videoId).join(',');

  const videoData = await youtubeGet<YouTubeVideoListResponse>('videos', {
    part: 'snippet,statistics,contentDetails',
    id: videoIds,
  });

  if (!videoData.items) return [];

  return videoData.items.map((v) => {
    const thumb = v.snippet.thumbnails.high?.url || v.snippet.thumbnails.medium?.url || v.snippet.thumbnails.default?.url || '';
    return {
      id: v.id,
      title: v.snippet.title,
      description: v.snippet.description,
      thumbnailUrl: thumb,
      publishedAt: v.snippet.publishedAt,
      duration: v.contentDetails.duration,
      viewCount: parseInt(v.statistics.viewCount) || 0,
      likeCount: parseInt(v.statistics.likeCount) || 0,
      commentCount: parseInt(v.statistics.commentCount) || 0,
    };
  });
}
