
'use client';

import { Instagram, Github, Linkedin, Globe, FileText, Presentation, Link as LinkIcon } from 'lucide-react';
import type { PDDProject } from '@/types/pdd-project';
import Link from 'next/link';
import { Button } from '../ui/button';

const linkConfig = {
    instagramUrl: { icon: Instagram, label: 'Instagram' },
    linkedinUrl: { icon: Linkedin, label: 'LinkedIn' },
    githubUrl: { icon: Github, label: 'GitHub' },
    websiteUrl: { icon: Globe, label: 'Website' },
    gpcuDocUrl: { icon: FileText, label: 'GPCU Doc' },
    patentDocUrl: { icon: FileText, label: 'Patent' },
    canvaUrl: { icon: Presentation, label: 'Canva' },
    figmaUrl: { icon: LinkIcon, label: 'Figma' }, // Using a generic icon for Figma
    gslidesUrl: { icon: Presentation, label: 'Slides' },
} as const;

export function PddProjectLinks({ project }: { project: PDDProject }) {
    const availableLinks = Object.entries(linkConfig).filter(([key]) => project[key as keyof PDDProject]);

    if (availableLinks.length === 0) {
        return <p className="text-sm text-muted-foreground">No links provided for this project.</p>;
    }

    return (
        <div className="space-y-2">
            {availableLinks.map(([key, config]) => {
                const Icon = config.icon;
                const url = project[key as keyof PDDProject] as string;
                return (
                    <Button key={key} asChild variant="outline" className="w-full justify-start">
                        <Link href={url} target="_blank" rel="noopener noreferrer">
                            <Icon className="mr-2 h-4 w-4 text-primary" />
                            <span>{config.label}</span>
                        </Link>
                    </Button>
                );
            })}
        </div>
    );
}
