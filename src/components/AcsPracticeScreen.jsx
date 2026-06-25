import { useMemo, useState } from 'react';
import {
  getMatchingAcsQuestions,
  parseAcsCodes,
  summarizeAcsEntries,
} from '../utils/acs-filter.js';
import { Screen, PageHeader } from './Screen.jsx';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

function sectionLabel(section) {
  if (!section) return null;
  const parts = [];
  if (section.areaTitle) parts.push(section.areaTitle);
  if (section.subjectTitle) parts.push(section.subjectTitle);
  return parts.join(' > ');
}

export default function AcsPracticeScreen({
  questionsByTopic,
  maxQuestions,
  isLoading,
  onBack,
  onStart,
}) {
  const [input, setInput] = useState('');

  const codes = useMemo(() => parseAcsCodes(input), [input]);
  const matches = useMemo(
    () => getMatchingAcsQuestions(questionsByTopic, codes),
    [questionsByTopic, codes],
  );
  const entries = useMemo(
    () => summarizeAcsEntries(questionsByTopic, codes),
    [questionsByTopic, codes],
  );

  const hasCodes = codes.length > 0;
  const matchCount = matches.length;
  const sessionCount = Math.min(matchCount, maxQuestions);
  const isCapped = matchCount > maxQuestions;
  const canStart = hasCodes && matchCount > 0 && !isLoading;

  return (
    <Screen>
      <PageHeader
        title="ACS Targeted Practice"
        subtitle="Build an Airframe practice session from ACS codes"
        onBack={onBack}
      />

      <Card className="gap-2 p-4">
        <Label htmlFor="acs-codes">Enter ACS codes or prefixes</Label>
        <Textarea
          id="acs-codes"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="AM.II.F.K1, AM.II.F"
          rows={5}
        />
        <p className="text-xs text-muted-foreground">
          Separate multiple entries with commas, spaces, semicolons, or new lines.
        </p>
      </Card>

      <Card className="mt-4 gap-0 p-0 py-1">
        {[
          ['Entered codes', hasCodes ? codes.join(', ') : 'None yet'],
          ['Matching questions', isLoading ? 'Loading...' : matchCount],
          ['Session size', isLoading || !hasCodes ? '-' : `${sessionCount} question${sessionCount === 1 ? '' : 's'}`],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 border-b px-4 py-2.5 text-sm last:border-b-0">
            <span className="text-muted-foreground">{label}</span>
            <strong className="min-w-0 truncate text-right font-medium">{value}</strong>
          </div>
        ))}
        {hasCodes && matchCount > 0 && (
          <p className="px-4 py-2.5 text-xs text-muted-foreground">
            {isCapped
              ? `This session will be capped to the ${maxQuestions}-question Airframe exam amount.`
              : `Fewer than ${maxQuestions} matches were found, so this session will use all matching questions.`}
          </p>
        )}
      </Card>

      {hasCodes && (
        <div className="mt-4">
          <h2 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground">SECTION MAPPING</h2>
          <ul className="grid gap-2">
            {entries.map((entry) => {
              let statusColor = 'text-success';
              let statusText;

              if (!entry.recognized) {
                statusColor = 'text-destructive';
                statusText = 'Not a valid ACS code';
              } else if (isLoading) {
                statusColor = 'text-muted-foreground';
                statusText = 'Checking questions...';
              } else if (entry.matchCount > 0) {
                statusText = `${entry.matchCount} question${entry.matchCount === 1 ? '' : 's'}`;
              } else {
                statusColor = 'text-muted-foreground';
                statusText = 'No questions yet';
              }

              const label = sectionLabel(entry.section);

              return (
                <li key={entry.code} className="rounded-lg border bg-card p-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-sm font-medium">{entry.code}</span>
                    <span className={cn('text-xs', statusColor)}>{statusText}</span>
                  </div>
                  {entry.recognized && (
                    <div className="mt-1.5 flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        {label}
                        {entry.section.topicId ? ` (${entry.section.topicId})` : ''}
                      </span>
                      {entry.section.element?.text && (
                        <span className="text-xs text-muted-foreground">{entry.section.element.text}</span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {hasCodes && !isLoading && matchCount === 0 && (
        <Card className="mt-4 p-4 text-sm text-muted-foreground">
          None of those ACS codes have questions yet. Enter a code from a section
          that has questions, like <strong className="text-foreground">AM.II.F.K1</strong>, or a prefix like{' '}
          <strong className="text-foreground">AM.II.F</strong>.
        </Card>
      )}

      <Separator className="my-5" />

      <Button size="lg" className="w-full" onClick={() => onStart({ input })} disabled={!canStart}>
        Start ACS Targeted Practice
      </Button>
    </Screen>
  );
}
