import { BookOpen, Layers, PenLine, ChevronRight } from 'lucide-react';
import { TOPICS, getCachedQuestionIds, hasQuestionData } from '../data/index.js';
import { useHistory } from '../HistoryContext.jsx';
import { getTopicMastery, getTopicCounts, getMasteryColor } from '../utils/mastery.js';
import ProgressBarMulti from './ProgressBarMulti.jsx';
import NotesEditor from './NotesEditor.jsx';
import { Screen, PageHeader } from './Screen.jsx';
import { Card } from '@/components/ui/card';
import { masteryText } from '@/lib/ui.js';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS = { airframe: 'Airframe', powerplant: 'Powerplant' };

function ModeButton({ icon, label, desc, accent, onClick, disabled }) {
  const Icon = icon
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border bg-card p-3 text-center shadow-sm transition-colors hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        accent && 'border-primary/40',
      )}
    >
      <Icon className={cn('size-5', accent ? 'text-primary' : 'text-muted-foreground')} />
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </button>
  );
}

function OptionRow({ name, desc, descClassName, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 rounded-lg border bg-card p-3.5 text-left shadow-sm transition-colors hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium">{name}</span>
        <span className={cn('text-xs text-muted-foreground', descClassName)}>{desc}</span>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

export default function SubtopicScreen({ topicId, onBack, onStartStudy, onStartFlashcards, onStartTest, onStartMockExam, onViewHistory, onOpenExamSelect }) {
  const topic = TOPICS[topicId];
  const { confidence, getTopicAttempts } = useHistory();
  const qIds = getCachedQuestionIds(topicId);
  const mastery = getTopicMastery(qIds, confidence);
  const counts = getTopicCounts(qIds, confidence);
  const hasAttempts = counts.mastered + counts.learning > 0;
  const colorKey = getMasteryColor(mastery, hasAttempts);
  const recentAttempts = getTopicAttempts(topicId).slice(0, 3);
  const hasQuestions = hasQuestionData(topicId);

  const weakCount = qIds.filter((id) => {
    const c = confidence[id];
    return c && c.attempts > 0 && c.level <= 2;
  }).length;

  const formatDate = (ts) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const formatTime = (ts) => new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <Screen>
      <PageHeader
        title={topic.name}
        subtitle={`${CATEGORY_LABELS[topic.category]} \u00b7 ${qIds.length} Questions`}
        onBack={onBack}
      />

      {hasQuestions && (
        <Card className="mb-5 gap-3 p-4">
          <div className="flex items-center gap-3">
            <span className={cn('text-2xl font-bold tabular-nums', masteryText[colorKey])}>
              {hasAttempts ? `${mastery}%` : '--'}
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <span className="text-success">&#9679; {counts.mastered} mastered</span>
              <span className="text-primary">&#9679; {counts.learning} learning</span>
              <span className="text-muted-foreground">&#9679; {counts.new} new</span>
            </div>
          </div>
          <ProgressBarMulti mastered={counts.mastered} learning={counts.learning} total={qIds.length} />
        </Card>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        <ModeButton icon={BookOpen} label="Study" desc="Read the chapter" onClick={onStartStudy} />
        <ModeButton icon={Layers} label="Flashcards" desc="Quick recall" onClick={onStartFlashcards} disabled={!hasQuestions} />
        <ModeButton icon={PenLine} label="Test" desc="Exam practice" accent onClick={() => onStartTest('all')} disabled={!hasQuestions} />
      </div>

      {hasQuestions && (
        <div className="mt-6">
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground">TEST OPTIONS</h3>
          <div className="grid gap-2.5">
            <OptionRow name="Take an Exam" desc="Study or Test mode &middot; Pick a version" onClick={onOpenExamSelect} />
            <OptionRow name="All Questions" desc={`${qIds.length} questions, randomized`} onClick={() => onStartTest('all')} />
            {weakCount > 0 && (
              <OptionRow
                name="Weak Areas Only"
                desc={`${weakCount} questions below confidence`}
                descClassName="text-destructive"
                onClick={() => onStartTest('weak')}
              />
            )}
            <OptionRow name="Mock Exam" desc="Timed, no feedback until end" onClick={onStartMockExam} />
          </div>
        </div>
      )}

      {!hasQuestions && (
        <Card className="mt-6 gap-1 p-4 text-sm text-muted-foreground">
          <p>Questions coming soon for this topic.</p>
          <p>Study mode (PDF chapter) is available.</p>
        </Card>
      )}

      {recentAttempts.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground">RECENT ATTEMPTS</h3>
          <Card className="gap-0 p-0 py-1">
            {recentAttempts.map((a) => {
              const pct = Math.round((a.score / a.total) * 100);
              return (
                <div key={a.id} className="flex items-center justify-between border-b px-4 py-2.5 text-sm last:border-b-0">
                  <span className="text-muted-foreground">{formatDate(a.date)}, {formatTime(a.date)}</span>
                  <span className={cn('font-medium tabular-nums', pct >= 70 ? 'text-success' : 'text-primary')}>
                    {pct}% ({a.score}/{a.total})
                  </span>
                </div>
              );
            })}
          </Card>
          <button onClick={onViewHistory} className="mt-2 cursor-pointer text-sm font-medium text-primary hover:underline">
            View full history &rarr;
          </button>
        </div>
      )}

      <NotesEditor topicId={topicId} />
    </Screen>
  );
}
