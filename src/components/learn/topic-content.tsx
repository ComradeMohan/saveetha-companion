
'use client';

import React, { useEffect, useRef } from 'react';

interface TopicContentProps {
  htmlContent: string;
}

const TopicContent: React.FC<TopicContentProps> = ({ htmlContent }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const scriptsRef = useRef<HTMLScriptElement[]>([]);

  useEffect(() => {
    // Cleanup function to remove scripts when component unmounts or content changes
    return () => {
      scriptsRef.current.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
      scriptsRef.current = [];
    };
  }, [htmlContent]);

  useEffect(() => {
    if (contentRef.current) {
      // 1. Clear previous content
      contentRef.current.innerHTML = '';

      // 2. Use the browser's parser to create a document fragment
      const template = document.createElement('template');
      template.innerHTML = htmlContent;

      // 3. Extract only the content from the <body> tag, or use the whole fragment if no body exists
      const bodyContent = template.content.querySelector('body');
      const contentToAppend = bodyContent ? bodyContent.innerHTML : template.innerHTML;
      
      // 4. Append the cleaned HTML content to our component's div
      contentRef.current.innerHTML = contentToAppend;

      // 5. Find and execute scripts from the parsed content
      const scripts = template.content.querySelectorAll('script');
      const newScripts: HTMLScriptElement[] = [];
      
      scripts.forEach(script => {
        // Avoid executing external stylesheets like Tailwind CDN
        if (script.src && script.src.includes('tailwindcss')) {
            return;
        }

        const newScript = document.createElement('script');
        newScript.setAttribute('data-dynamic-script', 'true');
        
        // Copy attributes like src, type, etc.
        for (let i = 0; i < script.attributes.length; i++) {
          const attr = script.attributes[i];
          newScript.setAttribute(attr.name, attr.value);
        }
        
        // Copy inline script content
        newScript.innerHTML = script.innerHTML;
        
        // Append to the actual document body to execute
        document.body.appendChild(newScript);
        newScripts.push(newScript);
      });
      scriptsRef.current = newScripts;
    }
  }, [htmlContent]);

  return <div ref={contentRef} />;
};

export default TopicContent;
