
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Copyright as CopyrightIcon } from "lucide-react";

export const metadata = {
  title: "Copyright Notice | Saveetha Companion",
  description: "Copyright and content notice for the Saveetha Companion platform.",
};

export default function CopyrightPage() {
  return (
    <>
        <div className="container mx-auto max-w-3xl px-4 pt-20 pb-12 md:py-16">
          <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                       <CopyrightIcon className="h-6 w-6 text-primary"/>
                    </div>
                    <div>
                        <CardTitle>Copyright Notice</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
                <p>All content available on this website is either:</p>
                <ul>
                    <li>Publicly accessible educational material,</li>
                    <li>User-uploaded content for personal academic use, or</li>
                    <li>Original content created by the website owner.</li>
                </ul>
                <p>
                    If you are a copyright holder and believe that any content hosted on
                    this website violates your rights, please contact us with details for
                    prompt review and removal.
                </p>
            </CardContent>
          </Card>
        </div>
    </>
  );
}
