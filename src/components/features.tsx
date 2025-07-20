
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Percent, Lightbulb, Users, Bell, Contact } from 'lucide-react';

const features = [
  {
    icon: Calculator,
    title: 'CGPA Calculator',
    description: 'Instantly calculate your grade point average with a simple and intuitive interface.',
  },
  {
    icon: Percent,
    title: 'Attendance Tracker',
    description: 'Keep track of your attendance to know exactly where you stand in each course.',
  },
  {
    icon: Lightbulb,
    title: 'AI Concept Maps',
    description: 'Find AI-generated concept maps to visualize and understand complex topics.',
  },
  {
    icon: Users,
    title: 'Faculty Directory',
    description: 'Easily access contact information for all your professors and faculty members.',
  },
  {
    icon: Bell,
    title: 'Instant Notifications',
    description: 'Receive immediate alerts for important academic announcements and deadlines.',
  },
  {
    icon: Contact,
    title: '24/7 Support',
    description: 'Have a question or need help? Our team is available around the clock to assist you.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">Everything You Need, All in One Place</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            From academic calculators to AI-powered study aids, Saveetha Companion is designed to make your student life easier and more productive.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="text-center animate-fade-in" style={{ animationDelay: `${0.1 * (index + 1)}s`}}>
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
