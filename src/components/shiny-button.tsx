import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ShinyButtonProps {
  href: string;
  text: string;
  className?: string;
}

export default function ShinyButton({ href, text, className }: ShinyButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'relative cursor-pointer rounded-2xl border-none p-0.5',
        'bg-[radial-gradient(circle_80px_at_80%_-10%,_hsl(var(--card)),_#181b1b)]',
        'after:content-[""] after:absolute after:w-[65%] after:h-[60%] after:rounded-[120px] after:top-0 after:right-0 after:shadow-[0_0_20px_theme(colors.white/0.22)] after:-z-10',
        className
      )}
    >
      <div
        className={cn(
          'absolute bottom-0 left-0 h-full w-[70px] rounded-2xl',
          'bg-[radial-gradient(circle_60px_at_0%_100%,_#3fe9ff,_#0000ff80,_transparent)]',
          'shadow-[-10px_10px_30px_#0051ff2d]'
        )}
      />

      <div
        className={cn(
          'relative z-10 rounded-[14px] px-6 py-3.5 text-base font-medium text-white',
          'bg-[radial-gradient(circle_80px_at_80%_-50%,_#777777,_#0f1111)]',
          'before:content-[""] before:absolute before:inset-0 before:rounded-[14px]',
          'before:bg-[radial-gradient(circle_60px_at_0%_100%,_#00e1ff1a,_#0000ff11,_transparent)]'
        )}
      >
        {text}
      </div>
    </Link>
  );
}
