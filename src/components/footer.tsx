import Link from 'next/link';
import VisitorCounter from './visitor-counter';

export default function Footer() {
  return (
    <footer className="bg-background/80 border-t">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
        <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
            <p>
            © {new Date().getFullYear()} comrademohan. All rights reserved.
            </p>
            <Link href="/faq" className="hover:text-primary transition-colors">
                FAQ
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
            </Link>
        </div>
        <VisitorCounter />
      </div>
    </footer>
  );
}
