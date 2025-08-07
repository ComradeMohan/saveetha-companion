
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
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        <div className="relative px-7 py-4 bg-black rounded-full leading-none flex items-center">
          <span className="text-gray-100 uppercase tracking-widest">{text}</span>
        </div>
      </button>
    </Link>
  );
}
