
'use client';

import React from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';

interface MonacoCodeEditorProps {
  language: string;
  value: string;
  onChange: OnChange;
  onMount?: OnMount;
  height?: string | number;
  options?: any;
}

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  language,
  value,
  onChange,
  onMount,
  height = "100%",
  options = {},
}) => {
  const { theme, resolvedTheme } = useTheme();

  const editorTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'light';
  
  const defaultOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    padding: {
      top: 10,
      bottom: 10
    },
    ...options
  };

  return (
    <Editor
      height={height}
      language={language.toLowerCase()}
      value={value}
      theme={editorTheme}
      onChange={onChange}
      onMount={onMount}
      options={defaultOptions}
      loading={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
    />
  );
};
