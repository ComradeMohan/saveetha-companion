
import Header from "@/components/header";
import Footer from "@/components/footer";
import ContactForm from "@/components/contact-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Contact Us | Saveetha Companion",
  description: "Contact information for questions, feedback, or legal inquiries.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12 md:py-16">
        <div className="container mx-auto max-w-2xl px-4 space-y-8">
          <ContactForm />

          <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                       <Mail className="h-6 w-6 text-primary"/>
                    </div>
                    <div>
                        <CardTitle>Legal & Other Inquiries</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                    For specific legal questions, takedown requests, or other formal inquiries, please contact us directly at:
                </p>
                <p>
                    <strong>Email:</strong> <Link href="mailto:support@saveethahub.tech">support@saveethahub.tech</Link>
                </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
