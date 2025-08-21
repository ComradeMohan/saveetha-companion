import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-background/80 border-t">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
        <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} comrademohan. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
}
