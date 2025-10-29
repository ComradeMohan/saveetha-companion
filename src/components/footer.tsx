import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import VisitorCounter from './visitor-counter';

export default function Footer() {
  return (
    <footer className="bg-background/80 border-t">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Branding */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-7 w-7 text-primary" />
                <span className="text-lg font-bold">Saveetha Calculator</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
                The ultimate tool for students at Saveetha Engineering College. Simplify your academic life with our suite of calculators and resources.
            </p>
          </div>

          {/* Column 2: Legal Links */}
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} comrademohan. All rights reserved.
            </p>
            <VisitorCounter />
        </div>
      </div>
    </footer>
  );
}
