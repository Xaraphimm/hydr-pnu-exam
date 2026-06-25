import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Star, ChevronLeft } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useHistory } from '../HistoryContext.jsx';
import { Screen } from './Screen.jsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

function ViewerHeader({ onBack, label }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <Button variant="outline" size="icon" onClick={onBack} aria-label="Go back" className="shrink-0">
        <ChevronLeft />
      </Button>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

export default function PdfViewer({ topicId, pdfFile, onBack }) {
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(null);
  const { togglePdfBookmark, bookmarks } = useHistory();

  const onDocumentLoadSuccess = useCallback(({ numPages: n }) => {
    setNumPages(n);
  }, []);

  const isPageBookmarked = (page) =>
    bookmarks.pdfPages.some((p) => p.topicId === topicId && p.page === page);

  if (!pdfFile) {
    return (
      <Screen>
        <ViewerHeader onBack={onBack} label="Study" />
        <Card className="gap-1 p-6 text-center">
          <p className="font-medium">Chapter PDF is not available yet.</p>
          <p className="text-sm text-muted-foreground">
            Practice questions remain available when this topic has a question bank.
          </p>
        </Card>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <ViewerHeader onBack={onBack} label="Study" />
        <Card className="gap-1 p-6 text-center">
          <p className="font-medium">Chapter PDF could not be loaded.</p>
          <p className="text-sm text-muted-foreground">
            The study file may not be packaged in this deployment yet. You can continue using practice questions and flashcards.
          </p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <ViewerHeader onBack={onBack} label={numPages ? `${numPages} pages` : 'Loading...'} />
      <div className="flex flex-col items-center gap-4">
        <Document
          file={`${import.meta.env.BASE_URL}${pdfFile.replace(/^\//, '')}`}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => setError(err.message)}
          loading={<div className="py-12 text-sm text-muted-foreground">Loading chapter...</div>}
          className="flex w-full flex-col items-center gap-4"
        >
          {numPages && Array.from({ length: numPages }, (_, i) => (
            <Card key={i} className="w-fit gap-0 overflow-hidden p-0">
              <div className="overflow-hidden">
                <Page
                  pageNumber={i + 1}
                  width={Math.min(window.innerWidth - 48, 600)}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                />
              </div>
              <div className="flex items-center justify-between border-t px-3 py-2">
                <span className="text-xs text-muted-foreground">Page {i + 1} of {numPages}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePdfBookmark(topicId, i + 1)}
                  aria-label="Bookmark page"
                  className={cn('size-8', isPageBookmarked(i + 1) && 'text-primary')}
                >
                  <Star className={cn('size-4', isPageBookmarked(i + 1) && 'fill-primary')} />
                </Button>
              </div>
            </Card>
          ))}
        </Document>
      </div>
    </Screen>
  );
}
