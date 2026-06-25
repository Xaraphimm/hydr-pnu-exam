import { useState, useEffect, useRef } from 'react';
import { useHistory } from '../HistoryContext.jsx';
import { Textarea } from '@/components/ui/textarea';

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
    <div className="mt-7">
      <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground">NOTES</h3>
      <Textarea
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Add notes for this topic..."
        rows={4}
      />
    </div>
  );
}
