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

export interface AiStrategySummary {
  overview: string;
  momentum: string;
  contentGap: string;
  nextActions: string[];
}

export interface AiVideoInsight {
  videoId: string;
  whyItWorked: string;
  risks: string;
  nextTitleIdeas: string[];
  packagingTip: string;
}

export interface AiCompareInsight {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  nextMove: string;
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
  aiSummary?: AiStrategySummary;
  aiVideoInsights?: AiVideoInsight[];
}

export type SortField = 'viewCount' | 'engagementRate' | 'velocity' | 'publishedAt' | 'performanceScore';
export type SortOrder = 'asc' | 'desc';
export type TimeRange = '7d' | 'month' | 'all';
