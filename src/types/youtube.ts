export interface ChannelInfo {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnailUrl: string;
  bannerUrl?: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  publishedAt: string;
}

export interface VideoMetrics {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  engagementRate: number;
  velocity: number;
  performanceScore: number;
  isTrending: boolean;
}

export interface AnalysisResult {
  channel: ChannelInfo;
  videos: VideoMetrics[];
  analyzedAt: string;
  periodLabel: string;
  averageViews: number;
  averageEngagement: number;
  totalViews: number;
  isMockData: boolean;
}

export type SortField = 'viewCount' | 'engagementRate' | 'velocity' | 'publishedAt' | 'performanceScore';
export type SortOrder = 'asc' | 'desc';
export type TimeRange = '7d' | '30d' | 'month' | 'all';
