import React from "react";

export const metadata = {
  title: "Privacy Policy | SaveethaHub",
  description: "Privacy Policy for SaveethaHub",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4">
        Last updated: October 28, 2025
      </p>
      <p className="mb-4">
        SaveethaHub (“we”, “our”, “us”) values your privacy. This Privacy Policy
        explains how we collect, use, and protect your information when you use
        our website and services.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
      <p className="mb-4">
        We collect personal information such as your name, email, and academic
        details only when you voluntarily provide them to access our services.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Use of Information</h2>
      <p className="mb-4">
        The information we collect is used to provide academic tools, improve
        user experience, and communicate important updates related to your
        account or courses.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy, please contact us at{" "}
        <a
          href="mailto:contact@saveethahub.tech"
          className="text-blue-600 underline"
        >
          contact@saveethahub.tech
        </a>.
      </p>
    </main>
  );
}
