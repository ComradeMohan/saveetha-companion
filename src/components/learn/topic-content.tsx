
'use client';

import React, { useEffect, useRef } from 'react';

interface TopicContentProps {
  htmlContent: string;
}

const TopicContent: React.FC<TopicContentProps> = ({ htmlContent }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // 1. Clear previous content and scripts
      contentRef.current.innerHTML = '';
      const oldScripts = document.querySelectorAll('script[data-dynamic-script]');
      oldScripts.forEach(s => s.remove());

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
      scripts.forEach(script => {
        // Avoid executing external stylesheets like Tailwind CDN
        if (script.src.includes('tailwindcss')) {
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
      });
    }
  }, [htmlContent]);

  return <div ref={contentRef} />;
};

export default TopicContent;
