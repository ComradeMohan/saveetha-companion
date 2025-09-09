
'use client';

import React, { useEffect, useRef } from 'react';

interface TopicContentProps {
  htmlContent: string;
}

const TopicContent: React.FC<TopicContentProps> = ({ htmlContent }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Clear previous scripts to avoid duplicates on re-render
      const oldScripts = contentRef.current.querySelectorAll('script[data-dynamic-script]');
      oldScripts.forEach(s => s.remove());

      const template = document.createElement('template');
      template.innerHTML = htmlContent;
      
      const scripts = template.content.querySelectorAll('script');
      
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        newScript.setAttribute('data-dynamic-script', 'true');
        
        // Copy attributes like src, type, etc.
        for (let i = 0; i < script.attributes.length; i++) {
          const attr = script.attributes[i];
          newScript.setAttribute(attr.name, attr.value);
        }
        
        // Copy inline script content
        newScript.innerHTML = script.innerHTML;
        
        document.body.appendChild(newScript);
      });
    }
  }, [htmlContent]);

  return <div ref={contentRef} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default TopicContent;
