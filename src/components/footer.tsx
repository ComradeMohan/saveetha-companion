import Link from 'next/link';
import { Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background/80 border-t">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
        <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} comrademohan. All rights reserved.
            </p>
            <a href="https://www.freecounterstat.com" title="free hit counter"><img src="https://counter1.optistats.ovh/private/freecounterstat.php?c=mfpl9nzzuccg6ypscssr9uby174f1gj6" border="0" title="free hit counter" alt="free hit counter" /></a>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/comrademohan"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
          >
            <Github className="h-6 w-6 text-muted-foreground transition-colors hover:text-primary" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
