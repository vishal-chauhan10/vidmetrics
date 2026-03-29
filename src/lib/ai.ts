import 'server-only';

import OpenAI from 'openai';
import type {
  AiCompareInsight,
  AiStrategySummary,
  AiVideoInsight,
  AnalysisResult,
  VideoMetrics,
} from '@/types/youtube';

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

interface AnalysisAiResponse {
  summary: AiStrategySummary;
  videoInsights: AiVideoInsight[];
}

export async function getAnalysisAiEnhancements(
  analysis: AnalysisResult,
): Promise<Pick<AnalysisResult, 'aiSummary' | 'aiVideoInsights'>> {
  const fallback = {
    aiSummary: buildHeuristicStrategySummary(analysis),
    aiVideoInsights: buildHeuristicVideoInsights(analysis.videos),
  };

  if (!openaiClient) {
    return fallback;
  }

  const payload = buildAnalysisPayload(analysis);

  try {
    const completion = await openaiClient.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a YouTube growth analyst. Use only the supplied metrics and video metadata. Do not invent retention, CTR, impressions, demographics, or platform-wide trends. Return concise JSON only.',
        },
        {
          role: 'user',
          content: [
            'Return JSON with this shape:',
            '{',
            '  "summary": {',
            '    "overview": string,',
            '    "momentum": string,',
            '    "contentGap": string,',
            '    "nextActions": string[]',
            '  },',
            '  "videoInsights": [',
            '    {',
            '      "videoId": string,',
            '      "whyItWorked": string,',
            '      "risks": string,',
            '      "nextTitleIdeas": string[],',
            '      "packagingTip": string',
            '    }',
            '  ]',
            '}',
            '',
            'Requirements:',
            '- Keep each field factual and actionable.',
            '- nextActions should have 2 to 4 items.',
            '- videoInsights should cover the provided representative videos only.',
            '- nextTitleIdeas should have 2 to 3 ideas per video.',
            '',
            `Payload: ${JSON.stringify(payload)}`,
          ].join('\n'),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    const parsed = safeParseJson<AnalysisAiResponse>(raw);

    if (!parsed) {
      return fallback;
    }

    return {
      aiSummary: normalizeStrategySummary(parsed.summary, fallback.aiSummary),
      aiVideoInsights: normalizeVideoInsights(parsed.videoInsights, analysis.videos, fallback.aiVideoInsights),
    };
  } catch (error) {
    console.error('AI analysis enrichment failed:', error);
    return fallback;
  }
}

export async function getCompareAiInsight(
  primary: AnalysisResult,
  compare: AnalysisResult,
): Promise<AiCompareInsight> {
  const fallback = buildHeuristicCompareInsight(primary, compare);

  if (!openaiClient) {
    return fallback;
  }

  const payload = buildComparePayload(primary, compare);

  try {
    const completion = await openaiClient.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a competitive analyst for YouTube channels. Use only the supplied numbers and titles. Do not invent private analytics. Return concise JSON only.',
        },
        {
          role: 'user',
          content: [
            'Return JSON with this shape:',
            '{',
            '  "strengths": string[],',
            '  "weaknesses": string[],',
            '  "opportunities": string[],',
            '  "nextMove": string',
            '}',
            '',
            'Requirements:',
            '- strengths, weaknesses, and opportunities should each contain 2 to 3 concise items.',
            '- nextMove should be one concrete action.',
            '',
            `Payload: ${JSON.stringify(payload)}`,
          ].join('\n'),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    const parsed = safeParseJson<AiCompareInsight>(raw);

    if (!parsed) {
      return fallback;
    }

    return normalizeCompareInsight(parsed, fallback);
  } catch (error) {
    console.error('AI compare enrichment failed:', error);
    return fallback;
  }
}

export function buildHeuristicStrategySummary(analysis: AnalysisResult): AiStrategySummary {
  if (analysis.videos.length === 0) {
    return {
      overview: `${analysis.channel.title} has no public uploads in the selected analysis set, so strategy guidance is limited until more recent videos are available.`,
      momentum: 'There is not enough recent publishing activity to judge momentum from velocity or engagement changes.',
      contentGap: 'Switch to All Videos or analyze a more active channel to surface topic patterns and outliers.',
      nextActions: ['Analyze the full catalog', 'Compare against a competitor channel'],
    };
  }

  const topVideo = [...analysis.videos].sort((left, right) => right.performanceScore - left.performanceScore)[0];
  const averageEngagement = analysis.averageEngagement;
  const trendingCount = analysis.videos.filter((video) => video.isTrending).length;
  const viewOutlier = analysis.averageViews > 0 ? (topVideo.viewCount / analysis.averageViews).toFixed(1) : '0.0';

  return {
    overview: `${topVideo.title} is the strongest outlier at ${viewOutlier}x the channel average, which suggests the channel already has at least one repeatable packaging or topic pattern worth extending.`,
    momentum:
      trendingCount > 0
        ? `${trendingCount} videos are still above the channel's average velocity, so momentum exists and follow-up sequencing matters more than broad experimentation right now.`
        : 'Momentum is currently concentrated in only a few uploads, so sharper topic selection matters more than posting more frequently.',
    contentGap:
      averageEngagement >= 5
        ? 'Audience response is healthy, so the clearest gap is not demand but more consistent follow-up around the channel’s winning topics.'
        : 'Views are arriving, but engagement is softer than ideal, which points to weaker hooks, titles, or audience fit on some uploads.',
    nextActions: [
      `Publish a follow-up to ${topVideo.title} with a tighter first-frame promise.`,
      averageEngagement >= 5
        ? 'Reuse the strongest title pattern from recent winners in the next two uploads.'
        : 'Tighten titles and opening hooks before expanding into new topics.',
      trendingCount > 0
        ? 'Ship adjacent videos while current velocity is still above the channel baseline.'
        : 'Review the top three performers and build one narrower follow-up around the shared theme.',
    ],
  };
}

export function buildHeuristicVideoInsights(videos: VideoMetrics[], limit = 12): AiVideoInsight[] {
  return [...videos]
    .sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime())
    .slice(0, limit)
    .map((video) => ({
      videoId: video.id,
      whyItWorked:
        video.performanceScore >= 75
          ? 'This video is outperforming the channel baseline on a mix of views, engagement, and early velocity, which usually means the topic-positioning match is strong.'
          : 'This video is performing in line with the channel baseline, so it is useful as a control point for testing tighter packaging or clearer hooks.',
      risks:
        video.engagementRate < 4
          ? 'Engagement is modest relative to views, so the idea may be attracting clicks without enough payoff or conversation.'
          : 'The main risk is repeating the same angle too broadly without sharpening the payoff that made it work.',
      nextTitleIdeas: buildTitleIdeas(video.title),
      packagingTip:
        video.isTrending
          ? 'Keep the core topic intact and make the outcome or conflict more explicit in the first frame and title.'
          : 'Test a more specific title that makes the payoff clearer and moves the strongest keyword closer to the front.',
    }));
}

export function buildHeuristicCompareInsight(
  primary: AnalysisResult,
  compare: AnalysisResult,
): AiCompareInsight {
  const subscriberDelta = compare.channel.subscriberCount - primary.channel.subscriberCount;
  const engagementDelta = compare.averageEngagement - primary.averageEngagement;
  const averageViewsPrimary = primary.videos.length > 0 ? Math.round(primary.totalViews / primary.videos.length) : 0;
  const averageViewsCompare = compare.videos.length > 0 ? Math.round(compare.totalViews / compare.videos.length) : 0;

  return {
    strengths: [
      compare.channel.subscriberCount >= primary.channel.subscriberCount
        ? `${compare.channel.title} has the larger audience base, which gives it more room to compound on repeatable formats.`
        : `${compare.channel.title} is operating with a smaller audience base, which can make its wins more format-driven than scale-driven.`,
      averageViewsCompare >= averageViewsPrimary
        ? `${compare.channel.title} is generating stronger views per video right now, suggesting its packaging is landing more consistently.`
        : `${compare.channel.title} is not matching ${primary.channel.title} on views per video, which leaves room to win with sharper positioning.`,
    ],
    weaknesses: [
      engagementDelta < 0
        ? `${compare.channel.title} is trailing on engagement rate, which suggests weaker conversation or payoff after the click.`
        : `${compare.channel.title} is not materially ahead on engagement, so scale may be masking softer audience response.`,
      subscriberDelta > 0
        ? `${primary.channel.title} will need stronger differentiation because pure scale is working in ${compare.channel.title}'s favor.`
        : `${compare.channel.title} does not have scale dominance, so it cannot rely on audience size alone.`,
    ],
    opportunities: [
      `Look for topics where ${primary.channel.title} already matches or beats ${compare.channel.title} on engagement, then turn those into a repeatable series.`,
      'Use the competitor’s strongest topic clusters as validation, but narrow the angle instead of copying broad themes directly.',
    ],
    nextMove:
      averageViewsCompare >= averageViewsPrimary
        ? `Take ${compare.channel.title}'s strongest recent topic pattern and ship a narrower, more outcome-focused version on ${primary.channel.title}.`
        : `Double down on the topics where ${primary.channel.title} already holds the view or engagement edge and make the series more explicit.`,
  };
}

function buildAnalysisPayload(analysis: AnalysisResult) {
  const byScore = [...analysis.videos].sort((left, right) => right.performanceScore - left.performanceScore);
  const byRecency = [...analysis.videos].sort(
    (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  );

  return {
    channel: {
      title: analysis.channel.title,
      subscriberCount: analysis.channel.subscriberCount,
      videoCount: analysis.channel.videoCount,
      totalViews: analysis.channel.viewCount,
      averageViews: analysis.averageViews,
      averageEngagement: analysis.averageEngagement,
      analyzedAt: analysis.analyzedAt,
    },
    topPerformers: byScore.slice(0, 5).map(summarizeVideo),
    underperformers: [...byScore].reverse().slice(0, 3).map(summarizeVideo),
    representativeVideos: byRecency.slice(0, 8).map(summarizeVideo),
  };
}

function buildComparePayload(primary: AnalysisResult, compare: AnalysisResult) {
  return {
    primary: {
      title: primary.channel.title,
      subscriberCount: primary.channel.subscriberCount,
      averageViews: primary.averageViews,
      averageEngagement: primary.averageEngagement,
      topVideos: [...primary.videos].sort((left, right) => right.performanceScore - left.performanceScore).slice(0, 3).map(summarizeVideo),
    },
    compare: {
      title: compare.channel.title,
      subscriberCount: compare.channel.subscriberCount,
      averageViews: compare.averageViews,
      averageEngagement: compare.averageEngagement,
      topVideos: [...compare.videos].sort((left, right) => right.performanceScore - left.performanceScore).slice(0, 3).map(summarizeVideo),
    },
  };
}

function summarizeVideo(video: VideoMetrics) {
  return {
    id: video.id,
    title: video.title,
    publishedAt: video.publishedAt,
    views: video.viewCount,
    engagementRate: video.engagementRate,
    velocity: video.velocity,
    performanceScore: video.performanceScore,
    isTrending: video.isTrending,
    description: trimText(video.description, 180),
  };
}

function trimText(value: string, length: number) {
  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, length).trim()}...`;
}

function buildTitleIdeas(title: string) {
  const cleaned = title.replace(/[|:]/g, ' ').replace(/\s+/g, ' ').trim();
  const base = cleaned || 'Next Upload';

  return [
    `${base} - What Changed This Time?`,
    `${base} but with a Bigger Payoff`,
    `The Real Story Behind ${base}`,
  ].slice(0, 3);
}

function safeParseJson<T>(value: string | null | undefined): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    const start = value.indexOf('{');
    const end = value.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
      return null;
    }

    try {
      return JSON.parse(value.slice(start, end + 1)) as T;
    } catch {
      return null;
    }
  }
}

function normalizeStrategySummary(
  summary: AiStrategySummary | undefined,
  fallback: AiStrategySummary,
): AiStrategySummary {
  if (!summary) {
    return fallback;
  }

  return {
    overview: summary.overview?.trim() || fallback.overview,
    momentum: summary.momentum?.trim() || fallback.momentum,
    contentGap: summary.contentGap?.trim() || fallback.contentGap,
    nextActions:
      summary.nextActions?.map((item) => item.trim()).filter(Boolean).slice(0, 4) || fallback.nextActions,
  };
}

function normalizeVideoInsights(
  insights: AiVideoInsight[] | undefined,
  videos: VideoMetrics[],
  fallback: AiVideoInsight[],
): AiVideoInsight[] {
  if (!insights || insights.length === 0) {
    return fallback;
  }

  const validIds = new Set(videos.map((video) => video.id));
  const normalized = insights
    .filter((insight) => validIds.has(insight.videoId))
    .map((insight) => ({
      videoId: insight.videoId,
      whyItWorked: insight.whyItWorked?.trim() || 'This video has a noteworthy performance profile versus the rest of the channel.',
      risks: insight.risks?.trim() || 'The current packaging may be harder to repeat without a clearer angle.',
      nextTitleIdeas: insight.nextTitleIdeas?.map((item) => item.trim()).filter(Boolean).slice(0, 3) || [],
      packagingTip: insight.packagingTip?.trim() || 'Clarify the payoff sooner in the title and thumbnail.',
    }))
    .slice(0, 12);

  return normalized.length > 0 ? normalized : fallback;
}

function normalizeCompareInsight(
  insight: AiCompareInsight | undefined,
  fallback: AiCompareInsight,
): AiCompareInsight {
  if (!insight) {
    return fallback;
  }

  return {
    strengths: insight.strengths?.map((item) => item.trim()).filter(Boolean).slice(0, 3) || fallback.strengths,
    weaknesses: insight.weaknesses?.map((item) => item.trim()).filter(Boolean).slice(0, 3) || fallback.weaknesses,
    opportunities:
      insight.opportunities?.map((item) => item.trim()).filter(Boolean).slice(0, 3) || fallback.opportunities,
    nextMove: insight.nextMove?.trim() || fallback.nextMove,
  };
}