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
            <div id="sfcadksnu2ump83qwcwzh26l4xencer99mf"></div><script type="text/javascript" src="https://counter1.optistats.ovh/private/counter.js?c=adksnu2ump83qwcwzh26l4xencer99mf&down=async" async></script><noscript><a href="https://www.freecounterstat.com" title="web hit counter"><img src="https://counter1.optistats.ovh/private/freecounterstat.php?c=adksnu2ump83qwcwzh26l4xencer99mf" border="0" title="web hit counter" alt="web hit counter"/></a></noscript>
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
