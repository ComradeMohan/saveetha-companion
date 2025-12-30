
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListTree, Star, Award, ShieldCheck, TrendingUp, Users, Microscope, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface TreeNode {
  name: string;
  seats?: number;
  accredited?: boolean;
  notes?: string;
  color: 'blue' | 'teal' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo' | 'lime';
  children?: TreeNode[];
}

// New comprehensive data structure based on user input
const simatsData: TreeNode = {
  name: 'SIMATS Deemed University',
  color: 'blue',
  children: [
    {
      name: 'Poonamallee Campus',
      color: 'teal',
      children: [
        {
          name: 'Saveetha Dental College',
          color: 'purple',
          notes: '#1 India (Shanghai GRAS)',
          children: [
            { name: 'BDS (Bachelor of Dental Surgery)', seats: 100, color: 'green' },
            { 
              name: 'MDS (Master of Dental Surgery)', 
              seats: 51,
              color: 'green',
              children: [
                { name: 'Conservative Dentistry & Endodontics', color: 'orange' },
                { name: 'Orthodontics & Dentofacial Orthopedics', color: 'orange' },
                { name: 'Prosthodontics & Crown & Bridge', color: 'orange' },
                { name: 'Oral & Maxillofacial Surgery', color: 'orange' },
                { name: 'Periodontology', color: 'orange' },
                { name: 'Oral Medicine & Radiology', color: 'orange' },
                { name: 'Pediatric Dentistry', color: 'orange' },
                { name: 'Oral Pathology & Microbiology', color: 'orange' },
                { name: 'Public Health Dentistry', color: 'orange' },
              ]
            },
            { name: 'PhD (Dental Sciences)', color: 'green'},
          ],
        },
        {
          name: 'Saveetha School of Management',
          color: 'purple',
          notes: 'NIRF 63-74th',
          children: [
            { name: 'BBA', color: 'green' },
            {
              name: 'MBA',
              color: 'green',
              notes: '9 specializations',
              children: [
                { name: 'Finance', color: 'orange' },
                { name: 'HR', color: 'orange' },
                { name: 'Marketing', color: 'orange' },
                { name: 'Operations', color: 'orange' },
                { name: 'Business Analytics', color: 'orange' },
                { name: 'Healthcare Management', color: 'orange' },
              ],
            },
            { name: 'PhD (Management)', color: 'green' },
          ],
        },
        {
          name: 'Saveetha School of Law',
          color: 'purple',
          notes: 'NIRF 19th',
          children: [
            { name: 'BA LLB (Hons)', color: 'green' },
            { name: 'BCom LLB (Hons)', color: 'green' },
            { name: 'BBA LLB (Hons)', color: 'green' },
            {
              name: 'LLM',
              color: 'green',
              notes: '5 specializations',
              children: [
                { name: 'Intellectual Property Rights (IPR)', color: 'orange' },
                { name: 'Commercial Law', color: 'orange' },
                { name: 'International Law', color: 'orange' },
                { name: 'Criminal Law', color: 'orange' },
              ],
            },
            { name: 'PhD (Law)', color: 'green' },
          ],
        },
      ],
    },
    {
      name: 'Thandalam Campus',
      color: 'teal',
      children: [
        {
          name: 'Saveetha Medical College',
          color: 'purple',
          notes: 'NIRF 11th',
          children: [
             { name: 'MBBS', seats: 250, color: 'green'},
             {
               name: 'MD/MS',
               seats: 132,
               color: 'green',
               notes: '20+ specializations',
             },
             {
               name: 'DM/MCh',
               seats: 12,
               color: 'green',
               notes: '6 super-specialties',
             },
             { name: 'PhD (Medical Sciences)', color: 'green' },
           ]
        },
        {
          name: 'Saveetha School of Engineering (SSE)',
          color: 'lime', // Highlight color
          notes: 'NIRF 45-53rd',
          accredited: true,
          children: [
            {
              name: 'B.E./B.Tech',
              color: 'green',
              seats: 240,
              notes: '12+ specializations',
              children: [
                { name: 'Computer Science & Engineering (CSE)', color: 'orange' },
                { name: 'AI & Data Science', color: 'orange' },
                { name: 'Electronics & Communication (ECE)', color: 'orange' },
                { name: 'Biomedical Engineering', color: 'orange' },
                { name: 'Mechanical Engineering', color: 'orange' },
              ],
            },
            {
              name: 'M.E./M.Tech',
              color: 'green',
              notes: '17 specializations',
            },
            { name: 'PhD (Engineering)', color: 'green' },
          ],
        },
        {
          name: 'Saveetha College of Physiotherapy',
          color: 'purple',
          children: [
            { name: 'BPT', color: 'green' },
            { name: 'MPT', color: 'green', notes: '10+ specializations' },
            { name: 'PhD (Physiotherapy)', color: 'green' },
          ],
        },
        {
          name: 'Saveetha College of Nursing',
          color: 'purple',
          children: [
            { name: 'B.Sc Nursing', seats: 100, color: 'green' },
            { name: 'Post Basic B.Sc Nursing', seats: 50, color: 'green' },
            { name: 'M.Sc Nursing', color: 'green' },
            { name: 'PhD (Nursing)', color: 'green' },
          ],
        },
        { name: 'Saveetha College of Allied Health Sciences', color: 'pink', notes: '38+ B.Sc / 40+ M.Sc specs' },
        { name: 'Saveetha College of Liberal Arts & Sciences', color: 'pink' },
        { name: 'Saveetha College of Pharmacy', color: 'pink' },
        { name: 'Saveetha College of Occupational Therapy', color: 'pink' },
        { name: 'Saveetha College of Architecture & Design', color: 'pink' },
        { name: 'Saveetha School of Physical Education', color: 'pink' },
        { name: 'Saveetha School of Hospitality', color: 'pink' },
      ],
    },
  ],
};


const nodeColorClasses = {
    blue: 'bg-blue-600/10 border-blue-500 text-blue-800 dark:text-blue-300',
    teal: 'bg-teal-600/10 border-teal-500 text-teal-800 dark:text-teal-300',
    purple: 'bg-purple-600/10 border-purple-500 text-purple-800 dark:text-purple-300',
    green: 'bg-green-600/10 border-green-500 text-green-800 dark:text-green-300',
    orange: 'bg-orange-600/10 border-orange-500 text-orange-800 dark:text-orange-300',
    pink: 'bg-pink-600/10 border-pink-500 text-pink-800 dark:text-pink-300',
    indigo: 'bg-indigo-600/10 border-indigo-500 text-indigo-800 dark:text-indigo-300',
    lime: 'bg-lime-500/20 border-lime-500 text-lime-700 dark:text-lime-300 shadow-lg scale-105', // Highlight color
};


const TreeNodeComponent: React.FC<{ node: TreeNode }> = ({ node }) => {
    return (
        <div className="tree-node">
            <div className={cn("tree-node-content", nodeColorClasses[node.color])}>
                <p className="font-semibold text-sm">{node.name}</p>
                {(node.seats || node.accredited || node.notes) && (
                    <p className="text-xs text-muted-foreground">
                        {node.seats && `Seats: ${node.seats}`}
                        {node.accredited && <span className="text-green-600 ml-1">NBA+</span>}
                        {node.notes && <span className="italic ml-1">({node.notes})</span>}
                    </p>
                )}
            </div>
            {node.children && node.children.length > 0 && (
                <div className="tree-children">
                    {node.children.map((child, index) => (
                        <TreeNodeComponent key={index} node={child} />
                    ))}
                </div>
            )}
        </div>
    );
};

const KeyInfoCard = () => (
    <Card className="mb-8">
        <CardHeader>
            <CardTitle>Key Information & Rankings (2025)</CardTitle>
            <CardDescription>A summary of SIMATS's current standing and accreditations.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
             <div className="flex items-start gap-3">
                <Star className="h-4 w-4 mt-1 text-amber-500 flex-shrink-0"/>
                <div><span className="font-semibold">NIRF Rank:</span> University: 13th, Research: 13th, Medical: 11th, Law: 19th</div>
             </div>
             <div className="flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 mt-1 text-green-500 flex-shrink-0"/>
                <div><span className="font-semibold">Accreditation:</span> NAAC A++, UGC, AICTE, NBA (Engg), QS I-GAUGE Diamond</div>
             </div>
             <div className="flex items-start gap-3">
                <TrendingUp className="h-4 w-4 mt-1 text-blue-500 flex-shrink-0"/>
                <div><span className="font-semibold">QS World Rank:</span> 901-950</div>
             </div>
             <div className="flex items-start gap-3">
                <Users className="h-4 w-4 mt-1 text-indigo-500 flex-shrink-0"/>
                <div><span className="font-semibold">Placements (2024-25):</span> 98%+ Rate, Highest: ₹44 LPA, Avg: ₹7.5 LPA</div>
             </div>
             <div className="flex items-start gap-3 col-span-2 md:col-span-4">
                <Microscope className="h-4 w-4 mt-1 text-red-500 flex-shrink-0"/>
                <div className="text-xs text-muted-foreground"><span className="font-semibold text-destructive">Note on Research:</span> While highly ranked, SIMATS has faced accusations of citation inflation and has had 25 papers retracted in 2025 for image manipulation.</div>
             </div>
        </CardContent>
    </Card>
)


export default function SimatsTreePage() {
    return (
        <div className="container mx-auto max-w-full px-4 py-16">
             <Card className="shadow-lg mb-8">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-lg">
                           <ListTree className="h-6 w-6 text-primary"/>
                        </div>
                        <div>
                            <CardTitle>SIMATS Academic Structure – Hierarchical Tree</CardTitle>
                            <CardDescription>A top-down organizational chart of the university, its campuses, and colleges.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <KeyInfoCard />
            
            <div className="overflow-x-auto p-4 bg-background rounded-lg border">
                <div className="min-w-max py-10">
                    <TreeNodeComponent node={simatsData} />
                </div>
            </div>
        </div>
    )
}
