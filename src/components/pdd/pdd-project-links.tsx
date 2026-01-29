
'use client';

import { Instagram, Github, Linkedin, Globe, FileText, Presentation, Link as LinkIcon } from 'lucide-react';
import type { PDDProject } from '@/types/pdd-project';
import Link from 'next/link';

const linkConfig = {
    instagramUrl: { icon: Instagram, label: 'Instagram' },
    linkedinUrl: { icon: Linkedin, label: 'LinkedIn' },
    githubUrl: { icon: Github, label: 'GitHub' },
    websiteUrl: { icon: Globe, label: 'Website' },
    gpcuDocUrl: { icon: FileText, label: 'GPCU Doc' },
    patentDocUrl: { icon: FileText, label: 'Patent' },
    canvaUrl: { icon: Presentation, label: 'Canva' },
    figmaUrl: { icon: LinkIcon, label: 'Figma' },
    gslidesUrl: { icon: Presentation, label: 'Slides' },
} as const;

export function PddProjectLinks({ project }: { project: PDDProject }) {
    const availableLinks = Object.entries(linkConfig).filter(([key]) => project[key as keyof PDDProject]);

    if (availableLinks.length === 0) {
        return <p className="text-sm text-muted-foreground">No links provided for this project.</p>;
    }

    return (
        <div className="grid grid-cols-3 gap-4 text-center">
            {availableLinks.map(([key, config]) => {
                const Icon = config.icon;
                const url = project[key as keyof PDDProject] as string;
                return (
                    <Link
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center justify-center p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                        <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-xs mt-1 text-muted-foreground group-hover:text-primary transition-colors">{config.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
