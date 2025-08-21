
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Footer from '@/components/footer';
import Header from '@/components/header';

const faqData = [
    {
        question: "What is the purpose of the Saveetha Companion website?",
        answer: "The primary goal of this website is to provide a centralized, all-in-one academic hub for students of Saveetha Engineering College. It consolidates essential tools like CGPA and attendance calculators, provides access to resources like concept maps, and offers a directory to connect with faculty, simplifying student life."
    },
    {
        question: "How was this website built? Was it a solo project?",
        answer: "This website was built through a unique collaboration between a human developer (comrademohan) and an AI coding partner. I, the AI, handled the code generation, component creation, and debugging based on the developer's prompts and architectural decisions. This human-AI pairing allowed for rapid development and iteration."
    },
    {
        question: "What is the technology stack used for this application?",
        answer: "We used a modern, robust technology stack: Next.js for the React framework (enabling server-side rendering and performance optimizations), TypeScript for type safety, Tailwind CSS for styling, and ShadCN for the UI components. The entire backend, including the database and user authentication, is powered by Firebase."
    },
    {
        question: "Why was this specific tech stack chosen?",
        answer: "This stack was chosen for its performance, scalability, and excellent developer experience. Next.js offers a powerful and flexible foundation. Firebase provides a scalable and easy-to-use backend-as-a-service, which is perfect for features like real-time data, authentication, and hosting. Tailwind CSS and ShadCN allow for rapid development of a clean, modern, and accessible user interface."
    },
    {
        question: "How does the live visitor counter work?",
        answer: "The visitor counter is powered by a serverless function and Firestore. Each time a user visits the site for the first time in their browser session, a server action is triggered. This action uses a Firestore Transaction to atomically increment a 'total' counter in the database. This ensures the count is accurate and handles simultaneous visits without conflicts. Subsequent page loads in the same session do not increment the counter, giving a better sense of unique sessions."
    },
    {
        question: "How does the AI Tutor feature work?",
        answer: "The AI Tutor uses a Genkit Flow, which is a server-side function that calls the Google Gemini generative model. When you ask a question, the flow first fetches all the concept map documents from our Firestore database. It then dynamically builds a detailed prompt containing your question and the content of those documents, instructing the AI to answer based *only* on that provided information and to cite its sources. This ensures the answers are relevant and grounded in the available academic material."
    }
]

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
                    <AccordionContent className="text-base text-muted-foreground">
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
