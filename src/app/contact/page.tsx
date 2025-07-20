
import ContactForm from '@/components/contact-form';
import Footer from '@/components/footer';
import Header from '@/components/header';

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <ContactForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
