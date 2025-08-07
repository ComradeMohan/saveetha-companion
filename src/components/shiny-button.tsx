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
        'relative inline-flex items-center justify-center p-0.5 rounded-xl overflow-hidden group',
        'bg-[radial-gradient(circle_at_80%_-10%,_hsl(var(--card)),_hsl(var(--background))_80%)]',
        className
      )}
    >
        {/* Bottom-left glow */}
        <div
            className={cn(
                'absolute -bottom-1/2 -left-1/2 w-48 h-48',
                'bg-[radial-gradient(circle_at_center,_hsl(var(--primary)_/_0.2),transparent_70%)]',
                'transition-all duration-500 group-hover:scale-150'
            )}
        />
        
        {/* Inner content */}
        <span
            className={cn(
                'relative z-10 block px-6 py-2.5 text-sm font-medium text-white',
                'bg-background/90 rounded-[10px]',
                'transition-colors duration-300 group-hover:bg-background/80'
            )}
        >
            {text}
        </span>
    </Link>
  );
}
