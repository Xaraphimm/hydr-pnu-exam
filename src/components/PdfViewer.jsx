import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useHistory } from '../HistoryContext.jsx';
import './PdfViewer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

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
      <div className="pdf-viewer">
        <div className="pdf-viewer__nav">
          <button className="pdf-viewer__back" onClick={onBack}>&larr;</button>
          <span>Study</span>
        </div>
        <div className="pdf-viewer__error">
          <p>No handbook chapter available for this topic.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-viewer">
        <div className="pdf-viewer__nav">
          <button className="pdf-viewer__back" onClick={onBack}>&larr;</button>
          <span>Study</span>
        </div>
        <div className="pdf-viewer__error">
          <p>Could not load chapter PDF.</p>
          <p className="pdf-viewer__error-detail">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-viewer__nav">
        <button className="pdf-viewer__back" onClick={onBack}>&larr;</button>
        <span className="pdf-viewer__page-info">{numPages ? `${numPages} pages` : 'Loading...'}</span>
      </div>
      <div className="pdf-viewer__content">
        <Document
          file={`${import.meta.env.BASE_URL}${pdfFile.replace(/^\//, '')}`}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => setError(err.message)}
          loading={<div className="pdf-viewer__loading">Loading chapter...</div>}
        >
          {numPages && Array.from({ length: numPages }, (_, i) => (
            <div key={i} className="pdf-viewer__page-wrapper">
              <Page
                pageNumber={i + 1}
                width={Math.min(window.innerWidth - 32, 600)}
                renderTextLayer={true}
                renderAnnotationLayer={false}
              />
              <div className="pdf-viewer__page-footer">
                <span className="pdf-viewer__page-num">Page {i + 1} of {numPages}</span>
                <button
                  className={`pdf-viewer__bookmark ${isPageBookmarked(i + 1) ? 'pdf-viewer__bookmark--active' : ''}`}
                  onClick={() => togglePdfBookmark(topicId, i + 1)}
                >
                  {isPageBookmarked(i + 1) ? '\u2605' : '\u2606'}
                </button>
              </div>
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
}
