import { useMemo } from 'react';
import { TOPICS, CATEGORIES, getCachedQuestionIds, getQuestionCount } from '../data/index.js';
import { useHistory } from '../HistoryContext.jsx';
import { getTopicMastery, getTopicCounts, getMasteryColor } from '../utils/mastery.js';
import ProgressBarMulti from './ProgressBarMulti.jsx';
import TrendChart from './TrendChart.jsx';
import { Screen } from './Screen.jsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { masteryText } from '@/lib/ui.js';
import { cn } from '@/lib/utils';

export default function ProgressScreen() {
  const { confidence, attempts, clearHistory } = useHistory();

  const topicStats = useMemo(() => {
    const stats = {};
    for (const [id] of Object.entries(TOPICS)) {
      const qIds = getCachedQuestionIds(id);
      const questionCount = getQuestionCount(id);
      stats[id] = {
        mastery: getTopicMastery(qIds, confidence),
        counts: qIds.length > 0
          ? getTopicCounts(qIds, confidence)
          : { mastered: 0, learning: 0, new: questionCount },
        questionCount,
      };
    }
    return stats;
  }, [confidence]);

  const totalStudyTime = useMemo(() => {
    const secs = attempts.reduce((sum, a) => sum + (a.time || 0), 0);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }, [attempts]);

  const handleClear = () => {
    if (confirm('Clear all progress data? This cannot be undone.')) {
      clearHistory();
    }
  };

  return (
    <Screen>
      <h1 className="mb-5 text-2xl font-semibold tracking-tight">Progress</h1>

      <div className="grid grid-cols-2 gap-2.5">
        <Card className="items-center gap-0.5 p-3">
          <span className="text-2xl font-bold tabular-nums">{attempts.length}</span>
          <span className="text-xs text-muted-foreground">Attempts</span>
        </Card>
        <Card className="items-center gap-0.5 p-3">
          <span className="text-2xl font-bold tabular-nums">{totalStudyTime}</span>
          <span className="text-xs text-muted-foreground">Study Time</span>
        </Card>
      </div>

      {attempts.length > 0 && (
        <div className="mt-4">
          <TrendChart attempts={attempts} />
        </div>
      )}

      {Object.entries(CATEGORIES).map(([catKey, cat]) => {
        let catMastered = 0, catTotal = 0;
        cat.topics.forEach((id) => {
          catMastered += topicStats[id].counts.mastered;
          catTotal += topicStats[id].questionCount;
        });
        const catPct = catTotal > 0 ? Math.round((catMastered / catTotal) * 100) : 0;

        return (
          <section key={catKey} className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-wider text-muted-foreground">{cat.name.toUpperCase()}</h2>
              <span className="text-xs font-medium text-primary">{catPct}% ready</span>
            </div>
            <Card className="gap-3 p-4">
              {cat.topics.map((topicId) => {
                const topic = TOPICS[topicId];
                const stats = topicStats[topicId];
                const hasAttempts = stats.counts.mastered + stats.counts.learning > 0;
                const colorKey = getMasteryColor(stats.mastery, hasAttempts);
                return (
                  <div key={topicId} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5">
                    <span className="truncate text-sm">{topic.name}</span>
                    <span className={cn('text-sm font-medium tabular-nums', masteryText[colorKey])}>
                      {hasAttempts ? `${stats.mastery}%` : '--'}
                    </span>
                    <div className="col-span-2">
                      <ProgressBarMulti mastered={stats.counts.mastered} learning={stats.counts.learning} total={stats.questionCount} />
                    </div>
                  </div>
                );
              })}
            </Card>
          </section>
        );
      })}

      {attempts.length > 0 && (
        <Button variant="outline" className="mt-6 w-full text-destructive hover:text-destructive" onClick={handleClear}>
          Clear All Progress
        </Button>
      )}
    </Screen>
  );
}
