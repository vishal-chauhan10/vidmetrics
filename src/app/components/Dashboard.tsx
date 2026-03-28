'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sidebar, type DashboardSectionId } from './Sidebar';
import { TopNav } from './TopNav';
import { NormalDashboard } from './NormalDashboard';
import type { AnalysisResult, SortField, TimeRange, VideoMetrics } from '@/types/youtube';

interface DashboardProps {
  analysis: AnalysisResult;
  compareAnalysis: AnalysisResult | null;
  compareChannelQuery: string;
  compareLoading: boolean;
  compareError: string | null;
  onCompareChannelChange: (value: string) => void;
  videos: VideoMetrics[];
  channelQuery: string;
  timeRange: TimeRange;
  onTimeRangeChange: (value: TimeRange) => void;
  sortField: SortField;
  onSortFieldChange: (value: SortField) => void;
}

export function Dashboard({
  analysis,
  compareAnalysis,
  compareChannelQuery,
  compareLoading,
  compareError,
  onCompareChannelChange,
  videos,
  channelQuery,
  timeRange,
  onTimeRangeChange,
  sortField,
  onSortFieldChange,
}: DashboardProps) {
  const [isBattleMode] = useState(false);
  const [activeSection, setActiveSection] = useState<DashboardSectionId>('overview');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) {
      return;
    }

    const sections = Array.from(
      scrollContainer.querySelectorAll<HTMLElement>('[data-dashboard-section]'),
    );

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio);

        const nextSection = visibleEntries[0]?.target.getAttribute('data-dashboard-section') as
          | DashboardSectionId
          | null;

        if (nextSection) {
          setActiveSection(nextSection);
        }
      },
      {
        root: scrollContainer,
        threshold: [0.2, 0.35, 0.5, 0.75],
        rootMargin: '0px 0px -45% 0px',
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

  function handleSectionSelect(section: DashboardSectionId) {
    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) {
      return;
    }

    const targetSection = scrollContainer.querySelector<HTMLElement>(`[data-dashboard-section="${section}"]`);

    if (!targetSection) {
      return;
    }

    setActiveSection(section);
    scrollContainer.scrollTo({
      top: Math.max(targetSection.offsetTop - 24, 0),
      behavior: 'smooth',
    });
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Sidebar activeSection={activeSection} onSectionSelect={handleSectionSelect} />
      <main className="flex-1 flex flex-col min-w-0">
        <TopNav channelQuery={channelQuery} />
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {isBattleMode ? null : (
              <NormalDashboard
                analysis={analysis}
                compareAnalysis={compareAnalysis}
                compareChannelQuery={compareChannelQuery}
                compareLoading={compareLoading}
                compareError={compareError}
                onCompareChannelChange={onCompareChannelChange}
                videos={videos}
                timeRange={timeRange}
                onTimeRangeChange={onTimeRangeChange}
                sortField={sortField}
                onSortFieldChange={onSortFieldChange}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
