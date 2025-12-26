import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

const footerLinks = [
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms' },
  { href: '/copyright', label: 'Copyright' },
  { href: '/takedown', label: 'Takedown' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
            <Link href="/" className="flex items-center justify-center gap-2 mb-4">
                <GraduationCap className="h-7 w-7 text-primary" />
                <span className="text-lg font-bold text-foreground">Saveetha Companion</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Independent student-support platform • Not affiliated with any institution.
            </p>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
             <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {footerLinks.map(link => (
                    <Link key={link.href} href={link.href} className="hover:text-primary transition-colors">
                        {link.label}
                    </Link>
                ))}
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} Saveetha Companion. All Rights Reserved.
            </p>
        </div>
      </div>
    </footer>
  );
}
