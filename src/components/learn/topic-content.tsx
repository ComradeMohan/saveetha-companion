
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TextSelectionMenu } from './text-selection-menu';
import { v4 as uuidv4 } from 'uuid';

interface TopicContentProps {
  htmlContent: string;
}

interface Annotation {
    id: string;
    range: Range;
    note: string;
}

const TopicContent: React.FC<TopicContentProps> = ({ htmlContent }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<{ top: number; left: number; selection: Selection | null } | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isEditingNote, setIsEditingNote] = useState<string | null>(null);

  const handleMouseUp = useCallback(() => {
    if (!contentRef.current) return;
    
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && contentRef.current.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setMenu({
        top: rect.top + window.scrollY - 45,
        left: rect.left + window.scrollX + (rect.width / 2),
        selection: selection,
      });
    } else {
      setMenu(null);
    }
  }, []);

  const wrapSelection = (className: string) => {
    if (!menu?.selection) return;

    const range = menu.selection.getRangeAt(0);
    const span = document.createElement('span');
    span.className = className;
    
    try {
        // This is a robust way to wrap content, even across multiple nodes.
        range.surroundContents(span);
    } catch(e) {
        // Fallback for selections that span across complex node boundaries
        console.warn("Could not wrap selection directly, using fallback.", e);
        span.appendChild(range.extractContents());
        range.insertNode(span);
    }

    menu.selection.removeAllRanges();
    setMenu(null);
  };
  
  const handleAddNote = () => {
    if (!menu?.selection) return;

    const range = menu.selection.getRangeAt(0).cloneRange();
    const id = `note-${uuidv4()}`;

    const span = document.createElement('span');
    span.className = 'highlight-note relative';
    span.id = id;
    span.style.cursor = 'pointer';

    try {
      range.surroundContents(span);
    } catch (e) {
       console.warn("Could not wrap selection for note directly, using fallback.", e);
       span.appendChild(range.extractContents());
       range.insertNode(span);
    }
    
    setAnnotations(prev => [...prev, { id, range, note: '' }]);
    setIsEditingNote(id); // Open the editor for the new note
    menu.selection.removeAllRanges();
    setMenu(null);
  };

  const handleUpdateNote = (id: string, text: string) => {
    setAnnotations(prev => prev.map(a => (a.id === id ? { ...a, note: text } : a)));
    setIsEditingNote(null);
  };

  useEffect(() => {
    if (contentRef.current) {
        // Set content and add event listeners
        contentRef.current.innerHTML = htmlContent;
        contentRef.current.addEventListener('mouseup', handleMouseUp);

        // Re-attach click listeners for existing annotations
        annotations.forEach(annotation => {
            const el = document.getElementById(annotation.id);
            if (el) {
                el.onclick = () => setIsEditingNote(annotation.id);
            }
        });
    }

    // Cleanup function
    return () => {
      if (contentRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        contentRef.current.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [htmlContent, handleMouseUp, annotations]);

  return (
    <div className="prose dark:prose-invert max-w-none">
        <style jsx global>{`
            .highlight-yellow { background-color: rgba(250, 204, 21, 0.4); }
            .underline-blue { text-decoration: underline; text-decoration-color: #3b82f6; text-decoration-thickness: 2px; }
            .highlight-note { background-color: rgba(59, 130, 246, 0.2); border-bottom: 2px dotted rgba(59, 130, 246, 0.7); }
        `}</style>
        <div ref={contentRef} />
        {menu && (
            <TextSelectionMenu
                top={menu.top}
                left={menu.left}
                onHighlight={() => wrapSelection('highlight-yellow')}
                onUnderline={() => wrapSelection('underline-blue')}
                onAddNote={handleAddNote}
                onClose={() => setMenu(null)}
            />
        )}
        {annotations.map(annotation => {
            if (isEditingNote === annotation.id) {
                const el = document.getElementById(annotation.id);
                if (!el) return null;
                const rect = el.getBoundingClientRect();
                return (
                     <TextSelectionMenu.NoteEditor
                        key={annotation.id}
                        top={rect.top + window.scrollY + rect.height + 5}
                        left={rect.left + window.scrollX}
                        initialValue={annotation.note}
                        onSave={(text) => handleUpdateNote(annotation.id, text)}
                        onCancel={() => setIsEditingNote(null)}
                     />
                )
            }
            return null;
        })}
    </div>
  );
};

export default TopicContent;
