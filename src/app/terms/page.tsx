import React from "react";

export const metadata = {
  title: "Terms of Service | SaveethaHub",
  description: "Terms of Service for SaveethaHub",
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="text-muted-foreground mb-4">
        Last updated: October 28, 2025
      </p>
      <p className="mb-4">
        By accessing or using SaveethaHub (“the Service”), you agree to comply
        with these Terms of Service. If you do not agree, please do not use our
        platform.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Use of Services</h2>
      <p className="mb-4">
        You agree to use the Service only for lawful educational purposes. Any
        misuse or unauthorized access will result in termination.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Intellectual Property</h2>
      <p className="mb-4">
        All content on SaveethaHub including text, graphics, and code is owned
        or licensed to SaveethaHub and protected under applicable laws.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p>
        For questions about these Terms, contact us at{" "}
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
