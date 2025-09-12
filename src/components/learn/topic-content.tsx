
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TextSelectionMenu } from './text-selection-menu';
import { v4 as uuidv4 } from 'uuid';

interface TopicContentProps {
  htmlContent: string;
}

interface Annotation {
  id: string;
  type: 'highlight' | 'underline' | 'note';
  range: Range;
  noteText?: string;
}

const TopicContent: React.FC<TopicContentProps> = ({ htmlContent }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<{ top: number; left: number; selection: Selection | null } | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [editingNote, setEditingNote] = useState<{ annotationId: string; initialValue: string } | null>(null);

  const handleMouseUp = useCallback(() => {
    if (!contentRef.current || editingNote) return;

    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && contentRef.current.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setMenu({
        top: rect.top + window.scrollY - 45,
        left: rect.left + window.scrollX + (rect.width / 2),
        selection: selection,
      });
    } else if (!editingNote) {
      setMenu(null);
    }
  }, [editingNote]);

  const addAnnotation = (type: 'highlight' | 'underline' | 'note') => {
    if (!menu?.selection) return;

    const range = menu.selection.getRangeAt(0);
    const annotationId = `annotation-${uuidv4()}`;
    const span = document.createElement('span');
    span.id = annotationId;

    let className = '';
    if (type === 'highlight') className = 'highlight-yellow';
    if (type === 'underline') className = 'underline-blue';
    if (type === 'note') {
        className = 'highlight-note relative';
        span.style.cursor = 'pointer';
        span.onclick = () => {
            const currentAnnotation = annotations.find(a => a.id === annotationId);
            if (currentAnnotation) {
                setEditingNote({ annotationId, initialValue: currentAnnotation.noteText || '' });
            }
        };
    }
    span.className = className;
    
    try {
        range.surroundContents(span);
        const newAnnotation: Annotation = { id: annotationId, type, range, noteText: '' };
        setAnnotations(prev => [...prev, newAnnotation]);
        
        if (type === 'note') {
            setEditingNote({ annotationId, initialValue: '' });
        }

    } catch(e) {
        console.warn("Could not wrap selection directly.", e);
        toast({ title: "Selection Error", description: "Cannot annotate across complex text elements. Please try a simpler selection.", variant: "destructive" });
    }

    menu.selection.removeAllRanges();
    setMenu(null);
  };
  
  const handleUpdateNote = (annotationId: string, text: string) => {
    setAnnotations(prev => prev.map(a => (a.id === annotationId ? { ...a, noteText: text } : a)));
    setEditingNote(null);
  };

  useEffect(() => {
    const contentEl = contentRef.current;
    if (contentEl) {
        contentEl.addEventListener('mouseup', handleMouseUp);
        
        return () => {
            contentEl.removeEventListener('mouseup', handleMouseUp);
        };
    }
  }, [handleMouseUp]);
  
  useEffect(() => {
      if(contentRef.current && !contentRef.current.innerHTML) {
          contentRef.current.innerHTML = htmlContent;
      }
  }, [htmlContent]);


  const currentlyEditingAnnotation = editingNote ? annotations.find(a => a.id === editingNote.annotationId) : null;

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
                onHighlight={() => addAnnotation('highlight')}
                onUnderline={() => addAnnotation('underline')}
                onAddNote={() => addAnnotation('note')}
                onClose={() => setMenu(null)}
            />
        )}
        {currentlyEditingAnnotation && (() => {
            const el = document.getElementById(currentlyEditingAnnotation.id);
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            return (
                 <TextSelectionMenu.NoteEditor
                    key={currentlyEditingAnnotation.id}
                    top={rect.top + window.scrollY + rect.height + 5}
                    left={rect.left + window.scrollX}
                    initialValue={currentlyEditingAnnotation.noteText || ''}
                    onSave={(text) => handleUpdateNote(currentlyEditingAnnotation.id, text)}
                    onCancel={() => setEditingNote(null)}
                 />
            )
        })()}
    </div>
  );
};

// Dummy toast for development, replace with your actual toast implementation
const toast = ({title, description, variant}: any) => {
    console.log(`Toast: ${title} - ${description} (${variant})`);
};

export default TopicContent;
