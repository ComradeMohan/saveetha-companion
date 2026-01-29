
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Saveetha Companion",
  description: "Privacy Policy for Saveetha Companion, detailing how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <>
        <div className="container mx-auto max-w-3xl px-4 pt-20 pb-12 md:py-16">
          <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                       <ShieldCheck className="h-6 w-6 text-primary"/>
                    </div>
                    <div>
                        <CardTitle>Privacy Policy</CardTitle>
                        <CardDescription>We respect your privacy.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                    This website does <strong className="text-destructive">NOT</strong> collect or store any college portal login
                    credentials, passwords, or sensitive personal data.
                </p>
                <p>
                    We may collect basic usage information such as page visits, device
                    type, and anonymized analytics data to improve the platform.
                </p>
                <p>
                    We do not sell, trade, or share personal information with third
                    parties.
                </p>
                <p>
                    By using this website, you agree to this Privacy Policy.
                </p>
            </CardContent>
          </Card>
        </div>
    </>
  );
}
