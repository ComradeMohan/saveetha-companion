
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service | SaveethaHub",
  description: "Terms of Service for SaveethaHub.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4">
            <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                       <FileText className="h-6 w-6 text-primary"/>
                    </div>
                    <div>
                        <CardTitle>Terms of Service</CardTitle>
                        <CardDescription>Last updated: October 28, 2025</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                    Welcome to Saveetha Companion! By accessing or using our website and services (the "Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
                </p>
                
                <h3>1. Account Registration</h3>
                <p>
                    To use certain features of the Service, you must register for an account using a valid `@saveetha.com` Google account. You agree to provide accurate and complete information and to keep this information up to date. You are responsible for safeguarding your account.
                </p>

                <h3>2. Use of Services</h3>
                <p>
                    The Service is provided for your personal, non-commercial, educational use only. You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, or impair the Service.
                </p>
                <ul>
                    <li>The CGPA and attendance calculators are tools for estimation and should be used as a guide. Official records from the university are the final authority.</li>
                    <li>You are responsible for any content you submit, such as faculty suggestions or issue reports.</li>
                </ul>

                <h3>3. Intellectual Property</h3>
                <p>
                    The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Saveetha Companion and its licensors.
                </p>
                
                <h3>4. Termination</h3>
                <p>
                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>

                <h3>5. Disclaimer</h3>
                <p>
                    The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We do not warrant that the service will be uninterrupted, secure, or error-free.
                </p>
                
                <h3>6. Changes to Terms</h3>
                <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.
                </p>
                
                <h3>Contact Us</h3>
                <p>
                    If you have questions about these Terms, please contact us at: <a href="mailto:contact@saveethahub.tech">contact@saveethahub.tech</a>.
                </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
