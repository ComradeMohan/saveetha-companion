
'use client';

import { AiChatPopover } from './ai-chat-popover';

export default function SupportButton() {
  return (
    <div className="hidden md:block fixed bottom-6 right-6 z-50">
        <AiChatPopover />
    </div>
  );
}
