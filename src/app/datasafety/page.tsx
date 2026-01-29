
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Data Safety | Saveetha Companion",
  description: "Data and credential safety notice for the Saveetha Companion platform.",
};

export default function DataSafetyPage() {
  return (
    <>
        <div className="container mx-auto max-w-3xl px-4 pt-20 pb-12 md:py-16">
          <Card className="shadow-lg border-destructive/50">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-destructive/10 rounded-lg">
                       <ShieldAlert className="h-6 w-6 text-destructive"/>
                    </div>
                    <div>
                        <CardTitle>Data & Credential Safety Notice</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                    This platform does <strong className="text-destructive">NOT</strong> access or interact with any official college
                    portals.
                </p>
                <p>
                    Users must <strong className="text-destructive">NOT</strong> enter college portal usernames, passwords, or any
                    confidential credentials anywhere on this website. Your security is your responsibility.
                </p>
            </CardContent>
          </Card>
        </div>
    </>
  );
}
