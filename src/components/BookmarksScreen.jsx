import { Star } from 'lucide-react';
import { useHistory } from '../HistoryContext.jsx';
import { TOPICS } from '../data/index.js';
import { Screen } from './Screen.jsx';
import { Card } from '@/components/ui/card';

export default function BookmarksScreen() {
  const { bookmarks } = useHistory();
  const hasAny = bookmarks.questions.length > 0 || bookmarks.pdfPages.length > 0;

  return (
    <Screen>
      <h1 className="mb-5 text-2xl font-semibold tracking-tight">Bookmarks</h1>

      {!hasAny && (
        <Card className="items-center gap-2 p-8 text-center">
          <Star className="size-8 text-muted-foreground" />
          <p className="font-medium">No bookmarks yet.</p>
          <p className="text-sm text-muted-foreground">
            Bookmark questions during tests/flashcards or pages while studying.
          </p>
        </Card>
      )}

      {bookmarks.questions.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground">
            Questions ({bookmarks.questions.length})
          </h2>
          <div className="grid gap-2.5">
            {bookmarks.questions.map((qId) => (
              <Card key={qId} className="p-3.5">
                <span className="font-mono text-sm">{qId}</span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {bookmarks.pdfPages.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground">
            PDF Pages ({bookmarks.pdfPages.length})
          </h2>
          <div className="grid gap-2.5">
            {bookmarks.pdfPages.map((p, i) => (
              <Card key={i} className="flex-row items-center justify-between p-3.5">
                <span className="text-sm">{TOPICS[p.topicId]?.name || p.topicId}</span>
                <span className="text-xs text-muted-foreground">Page {p.page}</span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Screen>
  );
}
