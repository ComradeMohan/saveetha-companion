
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import Link from 'next/link';
import { ArrowRight, Globe, AppWindow } from 'lucide-react';
import Image from 'next/image';

const projects = [
  {
    name: 'Univault',
    description: 'Your personal cloud storage solution.',
    url: 'https://univault.live',
    icon: Globe,
  },
  {
    name: 'Univault Web',
    description: 'Access your files from any web browser.',
    url: 'https://web.univault.live',
    icon: AppWindow,
  },
  {
    name: 'ARMS Automation',
    description: 'Streamline your academic record management.',
    url: 'https://arms.saveethahub.tech',
    icon: AppWindow,
  },
  {
    name: 'Univault',
    description: 'Download the official Univault app from the Play Store.',
    url: 'https://play.google.com/store/apps/details?id=com.simats.univault',
    icon: 'https://univault.live/assets/favicon.png',
  },
];

export function PromotionCard() {
    return (
        <section id="projects" className="py-20 md:py-28 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">Explore My Other Projects</h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                        Discover a suite of tools designed to enhance your digital and academic life.
                    </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {projects.map((project, index) => (
                         <Card key={index} className="flex flex-col text-center overflow-hidden transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1">
                            <CardHeader className="flex-grow">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                                    {typeof project.icon === 'string' ? (
                                        <Image src={project.icon} alt={`${project.name} icon`} width={24} height={24} />
                                    ) : (
                                        <project.icon className="h-6 w-6 text-primary" />
                                    )}
                                </div>
                                <CardTitle>{project.name}</CardTitle>
                                <CardDescription>{project.description}</CardDescription>
                            </CardHeader>
                             <CardContent>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={project.url} target="_blank" rel="noopener noreferrer">
                                        Visit <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
