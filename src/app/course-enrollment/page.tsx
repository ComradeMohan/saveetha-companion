
import EnrollmentForm from '@/components/enrollment-form';
import Footer from '@/components/footer';
import Header from '@/components/header';

export default function CourseEnrollmentPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12 md:py-16">
        <div className="container mx-auto px-4">
          <EnrollmentForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
