import { differenceInDays } from 'date-fns';
import type { VideoMetrics } from '@/types/youtube';

export function calculateEngagementRate(likes: number, comments: number, views: number): number {
  if (views === 0) return 0;
  return Number((((likes + comments) / views) * 100).toFixed(2));
}

export function calculateVelocity(views: number, publishedAt: string): number {
  const days = differenceInDays(new Date(), new Date(publishedAt)) || 1;
  return Math.round(views / days);
}

export function calculatePerformanceScore(
  viewCount: number,
  engagementRate: number,
  velocity: number,
  avgViews: number
): number {
  const viewScore = avgViews > 0 ? Math.min((viewCount / avgViews) * 40, 60) : 0;
  const engagementScore = Math.min(engagementRate * 10, 25);
  const velocityScore = avgViews > 0 ? Math.min((velocity / (avgViews / 30)) * 15, 15) : 0;
  return Math.round(Math.min(viewScore + engagementScore + velocityScore, 100));
}

export function identifyTrending(velocity: number, avgVelocity: number): boolean {
  return velocity > avgVelocity * 1.5;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function formatDuration(iso8601: string): string {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function enrichVideosWithMetrics(
  videos: Array<{
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    publishedAt: string;
    duration: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
  }>
): VideoMetrics[] {
  const avgViews = videos.length > 0
    ? videos.reduce((sum, v) => sum + v.viewCount, 0) / videos.length
    : 0;

  const withMetrics = videos.map((v) => {
    const engagementRate = calculateEngagementRate(v.likeCount, v.commentCount, v.viewCount);
    const velocity = calculateVelocity(v.viewCount, v.publishedAt);
    const performanceScore = calculatePerformanceScore(v.viewCount, engagementRate, velocity, avgViews);
    return { ...v, engagementRate, velocity, performanceScore, isTrending: false };
  });

  const avgVelocity = withMetrics.length > 0
    ? withMetrics.reduce((sum, v) => sum + v.velocity, 0) / withMetrics.length
    : 0;

  return withMetrics.map((v) => ({
    ...v,
    isTrending: identifyTrending(v.velocity, avgVelocity),
  }));
}

export function exportToCsv(videos: VideoMetrics[], channelName: string): void {
  const headers = ['Title', 'Published', 'Views', 'Likes', 'Comments', 'Engagement Rate (%)', 'Views/Day', 'Performance Score', 'Trending'];
  const rows = videos.map((v) => [
    `"${v.title.replace(/"/g, '""')}"`,
    new Date(v.publishedAt).toLocaleDateString(),
    v.viewCount,
    v.likeCount,
    v.commentCount,
    v.engagementRate,
    v.velocity,
    v.performanceScore,
    v.isTrending ? 'Yes' : 'No',
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${channelName.replace(/[^a-z0-9]/gi, '_')}_vidmetrics_export.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
