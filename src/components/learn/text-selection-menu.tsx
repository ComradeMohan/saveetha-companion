
'use client';

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Highlighter, Underline, MessageSquarePlus } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Textarea } from '../ui/textarea';

interface TextSelectionMenuProps {
  top: number;
  left: number;
  onHighlight: () => void;
  onUnderline: () => void;
  onAddNote: () => void;
  onClose: () => void;
}

export function TextSelectionMenu({ top, left, onHighlight, onUnderline, onAddNote, onClose }: TextSelectionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute z-50 transform -translate-x-1/2"
      style={{ top, left }}
    >
      <div className="flex items-center gap-1 p-1 bg-background border rounded-lg shadow-lg">
        <Button variant="ghost" size="icon" onMouseDown={e => e.preventDefault()} onClick={onHighlight}>
          <Highlighter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onMouseDown={e => e.preventDefault()} onClick={onUnderline}>
          <Underline className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onMouseDown={e => e.preventDefault()} onClick={onAddNote}>
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}


interface NoteEditorProps {
    top: number;
    left: number;
    initialValue: string;
    onSave: (text: string) => void;
    onCancel: () => void;
}

TextSelectionMenu.NoteEditor = function NoteEditor({ top, left, initialValue, onSave, onCancel }: NoteEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if(textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.value = initialValue;
        }
    }, [initialValue]);

    return (
        <div className="absolute z-50" style={{ top, left }}>
            <Card className="w-64 shadow-xl">
                <CardContent className="p-2">
                    <Textarea
                        ref={textareaRef}
                        placeholder="Add a note..."
                        className="w-full h-24 text-sm border-0 focus-visible:ring-0 resize-none"
                    />
                </CardContent>
                <CardFooter className="p-2 flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button size="sm" onClick={() => onSave(textareaRef.current?.value || '')}>Save</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
