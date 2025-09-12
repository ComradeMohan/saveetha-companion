
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TextSelectionMenu } from './text-selection-menu';
import { v4 as uuidv4 } from 'uuid';

interface TopicContentProps {
  htmlContent: string;
  courseId: string;
  topicId: string;
}

interface StorableRange {
  startContainerPath: string;
  startOffset: number;
  endContainerPath: string;
  endOffset: number;
}

interface Annotation {
  id: string;
  type: 'highlight' | 'underline' | 'note';
  range: StorableRange;
  noteText?: string;
}

const TopicContent: React.FC<TopicContentProps> = ({ htmlContent, courseId, topicId }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<{ top: number; left: number; selection: Selection | null } | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [editingNote, setEditingNote] = useState<{ annotationId: string; initialValue: string } | null>(null);

  const getStorageKey = useCallback(() => `annotations-${courseId}-${topicId}`, [courseId, topicId]);

  const getPathTo = (element: Node): string => {
    if (element === contentRef.current) return '';
    if (!element.parentNode) return '';

    let a = element as any;
    let sib: Node | null,
      nth = 0;
    while ((sib = a.previousSibling)) {
      if (sib.nodeName === a.nodeName) nth++;
      a = sib;
    }
    return getPathTo(element.parentNode) + `/${element.nodeName.toLowerCase()}[${nth}]`;
  };

  const getNodeFromPath = (path: string): Node | null => {
    if (!contentRef.current) return null;
    try {
      const result = document.evaluate(path, contentRef.current, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      return result.singleNodeValue;
    } catch(e) {
      console.error("Failed to evaluate XPath:", path, e);
      return null;
    }
  };

  const applyAnnotation = useCallback((annotation: Annotation) => {
    const startNode = getNodeFromPath(annotation.range.startContainerPath);
    const endNode = getNodeFromPath(annotation.range.endContainerPath);

    if (startNode && endNode) {
      const range = document.createRange();
      range.setStart(startNode, annotation.range.startOffset);
      range.setEnd(endNode, annotation.range.endOffset);
      
      const span = document.createElement('span');
      span.id = annotation.id;

      let className = '';
      if (annotation.type === 'highlight') className = 'highlight-yellow';
      if (annotation.type === 'underline') className = 'underline-blue';
      if (annotation.type === 'note') {
        className = 'highlight-note relative';
        span.style.cursor = 'pointer';
        span.onclick = () => {
          const currentAnnotation = annotations.find(a => a.id === annotation.id);
          if (currentAnnotation) {
            setEditingNote({ annotationId: annotation.id, initialValue: currentAnnotation.noteText || '' });
          }
        };
      }
      span.className = className;
      
      try {
        range.surroundContents(span);
      } catch (e) {
        // This might fail if selection spans multiple block elements. For now, we accept this limitation.
        console.warn("Could not wrap selection for annotation:", annotation.id, e);
      }
    }
  }, [annotations]);


  useEffect(() => {
    const storageKey = getStorageKey();
    const savedAnnotations = localStorage.getItem(storageKey);
    if (savedAnnotations) {
      setAnnotations(JSON.parse(savedAnnotations));
    }
  }, [getStorageKey]);

  useEffect(() => {
    if (contentRef.current && htmlContent) {
        if (!contentRef.current.innerHTML) {
            contentRef.current.innerHTML = htmlContent;
        }
        
        // Clear existing spans before reapplying
        contentRef.current.querySelectorAll('span[id^="annotation-"]').forEach(span => {
            if (span.parentNode) {
                span.parentNode.replaceChild(document.createTextNode(span.textContent || ''), span);
                span.parentNode.normalize(); // Merges adjacent text nodes
            }
        });
        
        if (annotations.length > 0) {
            annotations.forEach(applyAnnotation);
        }
    }
  }, [htmlContent, annotations, applyAnnotation]);


  const handleMouseUp = useCallback(() => {
    if (!contentRef.current || editingNote) return;

    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && contentRef.current.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);

      // Check if selection is within our content area
      const parentElement = range.startContainer.nodeType === 3 
        ? range.startContainer.parentElement 
        : range.startContainer as HTMLElement;
      
      if (parentElement && contentRef.current.contains(parentElement)) {
        const rect = range.getBoundingClientRect();
        setMenu({
          top: rect.top + window.scrollY - 45,
          left: rect.left + window.scrollX + (rect.width / 2),
          selection: selection,
        });
      }
    } else if (!editingNote) {
      setMenu(null);
    }
  }, [editingNote]);

  const addAnnotation = (type: 'highlight' | 'underline' | 'note') => {
    if (!menu?.selection) return;

    const range = menu.selection.getRangeAt(0);
    const annotationId = `annotation-${uuidv4()}`;

    const storableRange: StorableRange = {
      startContainerPath: getPathTo(range.startContainer),
      startOffset: range.startOffset,
      endContainerPath: getPathTo(range.endContainer),
      endOffset: range.endOffset,
    };
    
    const newAnnotation: Annotation = { id: annotationId, type, range: storableRange, noteText: '' };
    
    const newAnnotations = [...annotations, newAnnotation];
    setAnnotations(newAnnotations);
    localStorage.setItem(getStorageKey(), JSON.stringify(newAnnotations));
    
    if (type === 'note') {
      setEditingNote({ annotationId, initialValue: '' });
    }

    menu.selection.removeAllRanges();
    setMenu(null);
  };
  
  const handleUpdateNote = (annotationId: string, text: string) => {
    const newAnnotations = annotations.map(a => (a.id === annotationId ? { ...a, noteText: text } : a));
    setAnnotations(newAnnotations);
    localStorage.setItem(getStorageKey(), JSON.stringify(newAnnotations));
    setEditingNote(null);
  };

  useEffect(() => {
    const contentEl = contentRef.current;
    if (contentEl) {
        contentEl.addEventListener('mouseup', handleMouseUp);
        return () => contentEl.removeEventListener('mouseup', handleMouseUp);
    }
  }, [handleMouseUp]);
  
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

export default TopicContent;
