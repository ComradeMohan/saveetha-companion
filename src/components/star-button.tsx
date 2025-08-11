import Link from 'next/link';
import { cn } from '@/lib/utils';

interface StarButtonProps {
  href: string;
  text: string;
  className?: string;
}

export default function StarButton({ href, text, className }: StarButtonProps) {
  return (
    <Link href={href} passHref>
      <button type="button" className={cn("relative group", className)}>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/70 to-secondary/70 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        <div className="relative px-7 py-4 bg-background rounded-full leading-none flex items-center">
          <span className="text-foreground uppercase tracking-widest text-sm font-medium">{text}</span>
        </div>
      </button>
    </Link>
  );
}
