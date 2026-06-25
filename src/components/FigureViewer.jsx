import { useState } from 'react';
import './FigureViewer.css';

export default function FigureViewer({ figure }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!figure) return null;

  return (
    <div className="figure-viewer">
      <button className="figure-viewer__toggle" onClick={() => setOpen((value) => !value)}>
        {open ? 'Hide' : 'Show'} {figure.label}
      </button>
      {open && (
        <div className="figure-viewer__frame">
          {failed ? (
            <div className="figure-viewer__missing">
              {figure.label} image is not installed yet. Add it at <code>{figure.src}</code>.
            </div>
          ) : (
            <img
              className="figure-viewer__image"
              src={figure.src}
              alt={figure.label}
              onError={() => setFailed(true)}
            />
          )}
        </div>
      )}
    </div>
  );
}
