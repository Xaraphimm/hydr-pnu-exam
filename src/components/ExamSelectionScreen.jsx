import { useMemo, useState } from 'react';
import { Infinity as InfinityIcon } from 'lucide-react';
import { useHistory } from '../HistoryContext.jsx';
import { TOPICS } from '../data/index.js';
import { Screen, PageHeader } from './Screen.jsx';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

function createExamSeed(version) {
  return version === 'random' ? Date.now() : version;
}

export default function ExamSelectionScreen({ topicId, onSelectExam, onBack }) {
  const [activeTab, setActiveTab] = useState('study');
  const { attempts } = useHistory();

  const isFullCategory = !topicId || topicId === 'airframe';
  const title = isFullCategory ? 'Airframe Knowledge Exam' : TOPICS[topicId]?.name;

  const bestScores = useMemo(() => {
    const scores = {};
    const filterTopicId = isFullCategory ? 'airframe' : topicId;
    for (const a of attempts) {
      if (a.topicId !== filterTopicId) continue;
      if (a.mode !== activeTab) continue;
      if (a.version == null) continue;
      const pct = Math.round((a.score / a.total) * 100);
      if (!scores[a.version] || pct > scores[a.version]) {
        scores[a.version] = pct;
      }
    }
    return scores;
  }, [attempts, activeTab, topicId, isFullCategory]);

  const handleSelect = (version) => {
    const seed = createExamSeed(version);
    onSelectExam({
      mode: activeTab,
      version,
      seed,
      topicId: isFullCategory ? 'airframe' : topicId,
      isFullCategory,
    });
  };

  return (
    <Screen>
      <PageHeader title={title} onBack={onBack} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="w-full">
          <TabsTrigger value="study">Study</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>
      </Tabs>

      <p className="mb-4 text-sm text-muted-foreground">
        Select a version — each draws {isFullCategory ? '100' : 'all'} questions
        {isFullCategory ? ' weighted by ACS topics' : ''}
      </p>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            onClick={() => handleSelect(v)}
            className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <span className="text-2xl font-bold tabular-nums">{v}</span>
            <span className="text-sm font-medium">Exam {v}</span>
            <span className={cn('text-xs', bestScores[v] ? 'text-success' : 'text-muted-foreground')}>
              {bestScores[v] ? `Best: ${bestScores[v]}%` : 'Not taken'}
            </span>
          </button>
        ))}
        <button
          onClick={() => handleSelect('random')}
          className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-primary/40 bg-card p-4 shadow-sm transition-colors hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <InfinityIcon className="size-7 text-primary" />
          <span className="text-sm font-medium text-primary">Random</span>
          <span className="text-xs text-muted-foreground">Unique exam</span>
        </button>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <span>{isFullCategory ? '100 questions' : 'All questions'}</span>
        <span>{isFullCategory ? '2 hr time limit' : 'No time limit'}</span>
        <span>70% to pass</span>
      </div>
    </Screen>
  );
}
