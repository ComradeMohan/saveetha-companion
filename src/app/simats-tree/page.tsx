'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListTree } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface TreeNode {
  name: string;
  seats?: number;
  accredited?: boolean;
  notes?: string;
  color: 'blue' | 'teal' | 'purple' | 'green' | 'orange';
  children?: TreeNode[];
}

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
          children: [
            { 
              name: 'Programs', 
              color: 'green',
              children: [
                { name: 'BDS', seats: 100, color: 'orange' },
                { 
                  name: 'MDS', 
                  seats: 51,
                  color: 'orange',
                  children: [
                    { name: 'Conservative Dentistry & Endodontics', color: 'orange' },
                    { name: 'Orthodontics & Dentofacial Orthopedics', color: 'orange' },
                    { name: 'Prosthodontics & Crown & Bridge', color: 'orange' },
                    { name: 'Oral & Maxillofacial Surgery', color: 'orange' },
                    { name: 'Periodontology', color: 'orange' },
                    { name: 'Oral Medicine & Radiology', color: 'orange' },
                  ]
                },
              ]
            },
          ],
        },
      ],
    },
    {
      name: 'Thandalam Campus',
      color: 'teal',
      children: [
        {
          name: 'Saveetha School of Engineering',
          color: 'purple',
          accredited: true,
          notes: 'NBA accredited: CSE/ECE/IT/Biomed',
          children: [
             { 
              name: 'B.E./B.Tech', 
              color: 'green',
              seats: 240,
              children: [
                { name: 'Computer Science & Engineering (CSE)', color: 'orange' },
                { name: 'AI & Data Science', color: 'orange' },
                { name: 'Electronics & Communication (ECE)', color: 'orange' },
                { name: 'Mechanical Engineering', color: 'orange' },
              ]
            },
          ]
        },
        {
          name: 'Saveetha Medical College',
          color: 'purple',
           children: [
             { 
              name: 'MBBS', 
              color: 'green',
              seats: 250,
            },
           ]
        }
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
};


const TreeNodeComponent: React.FC<{ node: TreeNode }> = ({ node }) => {
    return (
        <div className="tree-node">
            <div className={cn("tree-node-content", nodeColorClasses[node.color])}>
                <p className="font-semibold text-sm">{node.name}</p>
                {(node.seats || node.accredited) && (
                    <p className="text-xs text-muted-foreground">
                        {node.seats && `Seats: ${node.seats}`}
                        {node.seats && node.accredited && ' | '}
                        {node.accredited && <span className="text-green-600">NBA</span>}
                    </p>
                )}
                 {node.notes && <p className="text-xs text-muted-foreground italic">{node.notes}</p>}
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


export default function SimatsTreePage() {
    return (
        <div className="container mx-auto max-w-full px-4 py-16">
             <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-lg">
                           <ListTree className="h-6 w-6 text-primary"/>
                        </div>
                        <div>
                            <CardTitle>SIMATS Academic Structure – Hierarchical Tree</CardTitle>
                            <CardDescription>A top-down organizational chart of the university.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="overflow-x-auto p-10">
                    <div className="min-w-max">
                        <TreeNodeComponent node={simatsData} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
