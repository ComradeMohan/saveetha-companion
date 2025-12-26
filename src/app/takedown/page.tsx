
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gavel } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Takedown Policy | Saveetha Companion",
  description: "Takedown and DMCA policy for the Saveetha Companion platform.",
};

export default function TakedownPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                       <Gavel className="h-6 w-6 text-primary"/>
                    </div>
                    <div>
                        <CardTitle>Takedown Policy</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                    We respect intellectual property rights.
                </p>
                <p>
                    If you believe any content on this website infringes copyright or
                    institutional policies, please send a takedown request including:
                </p>
                <ul>
                    <li>Your name and role,</li>
                    <li>The specific content URL,</li>
                    <li>Proof of ownership or authorization.</li>
                </ul>
                <p>
                    Valid requests sent to our <Link href="/contact">contact email</Link> will be reviewed and appropriate action will be taken
                    within 48 hours.
                </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
