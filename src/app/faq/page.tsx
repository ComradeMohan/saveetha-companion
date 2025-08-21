
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Footer from '@/components/footer';
import Header from '@/components/header';

const faqData = [
    // Project & High-Level
    {
        question: "What was the primary motivation for creating the Saveetha Companion website?",
        answer: "The primary goal was to address a common need for students: a single, reliable, and easy-to-use platform for essential academic tasks. Instead of juggling different tools for CGPA calculation, attendance tracking, and finding resources, this website centralizes everything, creating an all-in-one academic hub for students of Saveetha Engineering College."
    },
    {
        question: "Who is the target audience for this application?",
        answer: "The primary audience is the students of Saveetha Engineering College. However, features like the faculty directory and updates page are also useful for faculty and staff. The project's code and this FAQ section are also aimed at developers interested in modern web development with Next.js and Firebase."
    },
    {
        question: "How was this website developed? Was it a solo project?",
        answer: "This website was built through a unique collaboration between a human developer (comrademohan) and an AI coding partner. I, the AI, handled the code generation, component creation, and debugging based on the developer's prompts, architectural decisions, and high-level strategy. This human-AI pairing enabled extremely rapid development and iteration cycles."
    },
    {
        question: "What are the core principles behind the UI/UX design?",
        answer: "The design philosophy is centered around three principles: Clarity, Efficiency, and Accessibility. We aimed for a clean, intuitive interface that students can navigate easily. Tools are designed to provide instant results with minimal input. We've also adhered to accessibility best practices to ensure the site is usable for everyone."
    },

    // Technology Stack & Architecture
    {
        question: "What is the complete technology stack used for this application?",
        answer: "The stack is built on modern, production-ready technologies: Next.js (with App Router) for the React framework, TypeScript for type safety, Firebase for the backend (including Firestore, Authentication, and Hosting), Tailwind CSS for styling, and ShadCN for the core UI components. We also use Genkit for the AI-powered features."
    },
    {
        question: "Why was Next.js chosen as the framework over other options like Vite or Create React App?",
        answer: "Next.js was chosen for its robust feature set that's ideal for a production application. Key advantages include Server-Side Rendering (SSR) for faster initial page loads, the App Router for simplified data fetching and server components, built-in routing, and image optimization. It provides a powerful, opinionated structure that accelerates development."
    },
    {
        question: "What benefits does using Server Components in Next.js provide for this app?",
        answer: "We use Server Components by default to reduce the amount of JavaScript sent to the client. This results in faster page loads and a better user experience, especially on slower networks. Most data fetching and rendering happens on the server, sending pre-built HTML to the browser."
    },
    {
        question: "Why was Firebase selected for the backend?",
        answer: "Firebase offers a comprehensive and scalable Backend-as-a-Service (BaaS) that integrates seamlessly with web applications. It provides Firestore (a real-time NoSQL database), Authentication, and Hosting all in one package, which significantly simplified backend development and allowed us to focus on building features."
    },
    {
        question: "What's the role of Tailwind CSS and ShadCN in the project?",
        answer: "Tailwind CSS is the utility-first CSS framework we use for all styling. It allows for rapid and consistent UI development directly in the markup. ShadCN is a collection of beautifully designed, accessible, and unstyled React components built on top of Tailwind CSS and Radix UI. It gives us the building blocks for our UI, which we can then customize to fit the app's theme."
    },
    {
        question: "Could you explain the project's file structure and the reasoning behind it?",
        answer: "The project follows the standard Next.js App Router structure. Core logic is in the `src/` directory. Pages are inside `src/app/`, with subfolders for different routes. Reusable components are in `src/components/`, further organized by UI elements and features. Hooks are in `src/hooks/`, server actions in `src/app/actions`, and library/utility functions in `src/lib/`. This organization promotes modularity and makes the codebase easy to navigate and maintain."
    },
    
    // Feature Implementation
    {
        question: "How does the live visitor counter work without a traditional server?",
        answer: "The visitor counter is powered by a Next.js Server Action and a Firestore document. When a user first loads the stats component in a session, the frontend calls a server action. This action uses a Firestore Transaction to atomically read the current count, increment it, and write it back. This prevents race conditions from simultaneous visitors. The frontend then fetches this count for display. The 'once-per-session' logic is handled client-side with `sessionStorage`."
    },
    {
        question: "Can you detail the logic behind the CGPA calculator?",
        answer: "The CGPA calculator is a client-side component built in React. It maintains the state of the number of subjects for each grade ('S', 'A', 'B', etc.). When a user enters a number, a `useMemo` hook recalculates the CGPA in real-time. The formula is: `(Total Grade Points * Credit Hours per Subject) / (Total Subjects * Credit Hours per Subject)`. We assume a fixed 4 credit hours per subject as per university standards."
    },
    {
        question: "How is the user authentication flow managed?",
        answer: "Authentication is handled entirely by Firebase Authentication. We provide both Google (OAuth) and traditional email/password sign-in methods. The `useAuth` hook is a custom React context provider that wraps the Firebase Auth state. It manages the user object, loading state, and provides helper functions like `signIn`, `signUp`, and `logout` to the rest of the application."
    },
    {
        question: "What happens when a new user signs up?",
        answer: "On signup, a new user record is created in Firebase Authentication. Simultaneously, a Next.js Server Action creates a corresponding user document in our Firestore 'users' collection. This document stores additional profile information like name, registration number, and phone number, which isn't part of the core auth record. If signing up with email, a verification link is automatically sent."
    },
    {
        question: "Explain the implementation of the Admin Dashboard.",
        answer: "The Admin Dashboard is a protected route. The `AdminLayout` component wraps all admin pages and uses the `useAuth` hook to check if the logged-in user is an admin (based on their email). If not, it redirects them to the homepage. The dashboard itself fetches aggregated data (like user counts, unread messages) from Firestore using server actions for display."
    },
     {
        question: "How does the AI Tutor feature work under the hood?",
        answer: "The AI Tutor is built using Genkit, a framework for building AI-powered applications. When a user asks a question, a Genkit Flow is triggered. This server-side function first fetches all concept map documents from Firestore. It then dynamically constructs a prompt for the Google Gemini model, including the user's question and the content of the fetched documents. The prompt explicitly instructs the AI to answer based *only* on the provided context and to cite its sources, which ensures relevance and accuracy."
    },
    {
        question: "What is the purpose of the `complete-profile` page?",
        answer: "Sometimes, essential user information (like Registration Number) isn't available during the initial sign-up, especially with OAuth providers like Google. The `complete-profile` page serves as a mandatory step to collect this additional information after the initial authentication, ensuring we have a complete user record in our database before they can access the main application."
    },
    {
        question: "How is data consistency maintained between Firebase Auth and Firestore?",
        answer: "We use the user's unique ID (UID) from Firebase Auth as the document ID in our Firestore 'users' collection. This creates a direct and reliable link. When a user's state changes (e.g., they verify their email), we use `onAuthStateChanged` listeners and server actions to update the corresponding document in Firestore, keeping the data in sync."
    },

    // Development & Deployment
    {
        question: "What were some of the challenges faced during development?",
        answer: "One key challenge was managing state and preventing race conditions with the analytics counter, which we solved using Firestore Transactions. Another was ensuring a smooth, non-janky user experience during authentication state changes, which our `useAuth` hook and page loader now handle gracefully. Finally, fine-tuning the Genkit prompts for the AI Tutor to be both helpful and factually grounded required careful iteration."
    },
    {
        question: "How is the application deployed and hosted?",
        answer: "The application is deployed on Firebase Hosting. The `apphosting.yaml` file configures the hosting environment. We have a CI/CD pipeline set up so that every push to the main branch automatically triggers a new build and deployment via GitHub Actions, ensuring the live site is always up-to-date."
    },
    {
        question: "How do you handle environment variables and secrets?",
        answer: "We use `.env` files for environment variables. Public variables, like the Firebase config, are prefixed with `NEXT_PUBLIC_` and are accessible on the client. Sensitive keys, like the Firebase Admin SDK credentials, are stored securely as secrets in our deployment environment and are only accessible on the server-side, never exposed to the browser."
    },
    {
        question: "What's the purpose of the `revalidatePath` function from Next.js used in your actions?",
        answer: "`revalidatePath` is a powerful Next.js feature for cache invalidation. When we make a data change (like deleting an update), we call `revalidatePath('/updates')`. This tells Next.js to regenerate the static content for that page on the next visit, ensuring users always see the most up-to-date information without needing a full site rebuild."
    },
    {
        question: "What is the role of Zod in this project?",
        answer: "Zod is a TypeScript-first schema declaration and validation library. We use it extensively on both the client and server to validate form inputs and the data passed to server actions. This ensures data integrity, prevents bad data from reaching the database, and provides clear, user-friendly error messages on forms."
    },
     {
        question: "How are forms managed throughout the application?",
        answer: "We use a combination of React Hook Form for client-side form state management and Zod for validation. This provides a robust solution with excellent performance. The form state is managed in the browser, and on submission, the data is passed to a Next.js Server Action for processing and saving to the database."
    },
     {
        question: "What is the purpose of the `use client` directive?",
        answer: "The `'use client'` directive is part of the Next.js App Router. It marks a component as a 'Client Component', meaning it will execute in the browser and can use state, effects, and browser-only APIs (like `useState` and `useEffect`). By default, components are Server Components, which run only on the server. We use this directive to separate interactivity from static content rendering."
    }
];

export default function FaqPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-muted-foreground mt-2">
              Find answers to common questions about the website, its features, and how it was built.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqData.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-semibold text-lg">{item.question}</AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                        {item.answer}
                    </AccordionContent>
                </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  );
}
