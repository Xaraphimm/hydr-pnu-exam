import { useMemo } from 'react';
import { ChevronRight, FileText, Target } from 'lucide-react';
import { TOPICS, CATEGORIES, getCachedQuestionIds, getQuestionCount, hasQuestionData } from '../data/index.js';
import { useHistory } from '../HistoryContext.jsx';
import { getTopicMastery, getTopicCounts } from '../utils/mastery.js';
import ReadinessRing from './ReadinessRing.jsx';
import TopicCard from './TopicCard.jsx';
import { Screen } from './Screen.jsx';
import logo from '../assets/phnx-logo.jpeg';

export default function TopicListScreen({ onSelectTopic, onStartExam, onStartAcsPractice, onStartReadinessStudy }) {
  const { confidence } = useHistory();

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

  const globalStats = useMemo(() => {
    let totalMastered = 0;
    let totalQuestions = 0;
    for (const s of Object.values(topicStats)) {
      totalMastered += s.counts.mastered;
      totalQuestions += s.questionCount;
    }
    return {
      mastered: totalMastered,
      total: totalQuestions,
      pct: totalQuestions > 0 ? Math.round((totalMastered / totalQuestions) * 100) : 0,
    };
  }, [topicStats]);

  const categoryReadiness = (catKey) => {
    const topicIds = CATEGORIES[catKey].topics;
    let mastered = 0;
    let total = 0;
    for (const id of topicIds) {
      mastered += topicStats[id].counts.mastered;
      total += topicStats[id].questionCount;
    }
    return total > 0 ? Math.round((mastered / total) * 100) : 0;
  };

  return (
    <Screen>
      <div className="mb-5 flex items-center gap-3">
        <img src={logo} alt="PHNX" className="size-9 rounded-md object-cover" />
        <span className="text-lg font-bold tracking-tight">PHNX FOUNDRIES</span>
      </div>

      <ReadinessRing
        percentage={globalStats.pct}
        mastered={globalStats.mastered}
        total={globalStats.total}
        onClick={onStartReadinessStudy}
      />

      {Object.entries(CATEGORIES).map(([catKey, cat]) => (
        <section key={catKey} className="mt-7">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xs font-semibold tracking-wider text-muted-foreground">
                {cat.name.toUpperCase()}
              </h2>
              <span className="text-xs text-muted-foreground">
                {cat.code} &middot; {cat.examQuestions} Questions &middot; {cat.timeHours} hrs
              </span>
            </div>
            <span className="shrink-0 text-xs font-medium text-primary">
              {categoryReadiness(catKey)}% ready
            </span>
          </div>

          {catKey === 'airframe' && (
            <div className="mb-3 grid gap-2.5">
              <button
                onClick={() => onStartExam('airframe')}
                className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3.5 text-left shadow-sm transition-colors hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-semibold">Full Airframe Exam</span>
                  <span className="text-xs text-muted-foreground">100 questions &middot; 2 hrs &middot; All topics</span>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
              <button
                onClick={onStartAcsPractice}
                className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3.5 text-left shadow-sm transition-colors hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Target className="size-5" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-semibold">ACS Targeted Practice</span>
                  <span className="text-xs text-muted-foreground">Enter ACS codes &middot; Draws from topics and FAA bank</span>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </div>
          )}

          <div className="grid gap-2.5">
            {cat.topics.map((topicId) => {
              const topic = TOPICS[topicId];
              const stats = topicStats[topicId];
              return (
                <TopicCard
                  key={topicId}
                  topic={topic}
                  mastery={stats.mastery}
                  counts={stats.counts}
                  questionCount={stats.questionCount}
                  hasQuestionData={hasQuestionData(topicId)}
                  onClick={() => onSelectTopic(topicId)}
                />
              );
            })}
          </div>
        </section>
      ))}
    </Screen>
  );
}
