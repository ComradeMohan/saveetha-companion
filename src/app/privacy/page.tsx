
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | SaveethaHub",
  description: "Privacy Policy for SaveethaHub, detailing how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                       <ShieldCheck className="h-6 w-6 text-primary"/>
                    </div>
                    <div>
                        <CardTitle>Privacy Policy</CardTitle>
                        <CardDescription>Last updated: October 28, 2025</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                    Saveetha Companion ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                </p>
                
                <h3>Information We Collect</h3>
                <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
                <ul>
                    <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address (@saveetha.com), and registration number that you voluntarily give to us when you register with the Site.</li>
                    <li><strong>Academic Data:</strong> Information you voluntarily provide, such as your course grades, CGPA calculations, and attendance records, which are stored to provide you with our services.</li>
                    <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, browser type, and the pages you have viewed.</li>
                </ul>

                <h3>Use of Your Information</h3>
                <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
                <ul>
                    <li>Create and manage your account.</li>
                    <li>Provide you with academic tools like the CGPA and Attendance calculators.</li>
                    <li>Send you notifications about platform updates or academic announcements.</li>
                    <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                    <li>Respond to your support requests and resolve issues.</li>
                </ul>
                
                <h3>Data Security</h3>
                <p>
                    We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
                </p>

                <h3>Contact Us</h3>
                <p>
                    If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:contact@saveethahub.tech">contact@saveethahub.tech</a>.
                </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
