import { useState, useEffect, useRef } from 'react';
import { useHistory } from '../HistoryContext.jsx';
import './NotesEditor.css';

export default function NotesEditor({ topicId }) {
  const { getNote, saveNote } = useHistory();
  const [text, setText] = useState(() => getNote(topicId));
  const timerRef = useRef(null);

  useEffect(() => {
    setText(getNote(topicId));
  }, [topicId, getNote]);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => saveNote(topicId, val), 1000);
  };

  const handleBlur = () => {
    clearTimeout(timerRef.current);
    saveNote(topicId, text);
  };

  return (
    <div className="notes-editor">
      <h3 className="notes-editor__title">Notes</h3>
      <textarea
        className="notes-editor__textarea"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Add notes for this topic..."
        rows={4}
      />
    </div>
  );
}
