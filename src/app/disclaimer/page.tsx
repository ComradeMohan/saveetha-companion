
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Disclaimer | Saveetha Companion",
  description: "Disclaimer for the Saveetha Companion platform.",
};

export default function DisclaimerPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                       <AlertTriangle className="h-6 w-6 text-primary"/>
                    </div>
                    <div>
                        <CardTitle>Disclaimer</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                    This website is an <strong>independent student-support platform</strong> created for
                    educational and organizational purposes only.
                </p>
                <p>
                    It is <strong className="text-destructive">NOT</strong> affiliated with, endorsed by, or officially connected to any
                    college, university, or educational institution.
                </p>
                <p>
                    All institution names, logos, and trademarks belong to their respective owners.
                </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
