import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListTree } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TreeNode {
  name: string;
  seats?: number;
  accredited?: boolean;
  notes?: string;
  children?: TreeNode[];
  highlight?: boolean;
}

const simatsData: TreeNode = {
  name: 'SIMATS Deemed University',
  children: [
    {
      name: 'Poonamallee Campus',
      children: [
        {
          name: 'Saveetha Dental College',
          children: [
            { name: 'BDS (Bachelor of Dental Surgery)', seats: 100 },
            { name: 'MDS (Master of Dental Surgery)', seats: 51, children: [
                { name: 'Conservative Dentistry & Endodontics' },
                { name: 'Orthodontics & Dentofacial Orthopedics' },
                { name: 'Prosthodontics & Crown & Bridge' },
                { name: 'Oral & Maxillofacial Surgery' },
                { name: 'Periodontology' },
                { name: 'Oral Medicine & Radiology' },
                { name: 'Pediatric Dentistry' },
                { name: 'Oral Pathology & Microbiology' },
                { name: 'Public Health Dentistry' },
              ]},
            { name: 'PhD (Dental Sciences)' },
          ],
        },
        {
          name: 'Saveetha School of Management',
          children: [
            { name: 'BBA' },
            { name: 'MBA', children: [
                { name: 'Finance' },
                { name: 'HR' },
                { name: 'Marketing' },
                { name: 'Operations' },
                { name: 'Business Analytics' },
                { name: 'Healthcare Management' },
                { name: 'International Business' },
                { name: 'Digital Marketing' },
              ]},
            { name: 'PhD (Management)' },
          ],
        },
        {
          name: 'Saveetha School of Law',
          children: [
            { name: 'BA LLB (Hons)' },
            { name: 'BCom LLB (Hons)' },
            { name: 'BBA LLB (Hons)' },
            { name: 'LLM', children: [
                { name: 'Intellectual Property Rights (IPR)' },
                { name: 'Commercial Law' },
                { name: 'Labour Law' },
                { name: 'International Law' },
                { name: 'Criminal Law' },
              ]},
            { name: 'PhD (Law)' },
          ],
        },
      ],
    },
    {
      name: 'Thandalam Campus',
      children: [
        {
          name: 'Saveetha Medical College',
          children: [
            { name: 'MBBS', seats: 250 },
            { name: 'MD/MS', seats: 132, children: [
                { name: 'MD: Anatomy, Physiology, General Medicine, etc.' },
                { name: 'MS: General Surgery, Orthopedics, OBG, etc.' },
              ]},
            { name: 'DM/MCh', seats: 12, notes: 'e.g., Cardiology, Neurology' },
            { name: 'PhD (Medical Sciences)' },
          ],
        },
        {
          name: 'Saveetha School of Engineering (SSE)',
          highlight: true,
          children: [
            { name: 'B.E./B.Tech', seats: 240, notes: 'NBA accredited: CSE/ECE/IT/Biomed', children: [
                { name: 'Computer Science & Engineering (CSE)' },
                { name: 'AI & ML' },
                { name: 'AI & Data Science' },
                { name: 'Information Technology (IT)' },
                { name: 'Electronics & Communication (ECE)' },
                { name: 'Electrical & Electronics (EEE)' },
                { name: 'Biomedical Engineering' },
                { name: 'Mechanical Engineering' },
                { name: 'Automobile Engineering' },
                { name: 'Biotechnology' },
              ]},
            { name: 'M.E./M.Tech', children: [
                { name: 'CSE' },
                { name: 'Structural Engg' },
                { name: 'VLSI Design' },
                { name: 'Mechatronics' },
                { name: '...and 13 more specializations' }
            ]},
            { name: 'PhD (Engineering)' },
          ],
        },
        {
          name: 'Saveetha College of Physiotherapy',
          children: [
            { name: 'BPT' },
            { name: 'MPT', children: [
                { name: 'Neurology' },
                { name: 'Sports Physiotherapy' },
                { name: 'Orthopedics' },
              ]},
            { name: 'PhD (Physiotherapy)' },
          ],
        },
        { name: 'Saveetha College of Nursing', children: [{name: 'B.Sc / M.Sc / PhD'}] },
        { name: 'Saveetha College of Allied Health Sciences', children: [{name: '38+ B.Sc / 40+ M.Sc Specs'}] },
        { name: 'Saveetha College of Liberal Arts & Sciences', children: [{name: 'B.Sc / BA / B.Com'}] },
        { name: 'Saveetha College of Pharmacy', children: [{name: 'B.Pharm / M.Pharm'}] },
        { name: 'Saveetha College of Occupational Therapy' },
        { name: 'Saveetha College of Architecture & Design' },
        { name: 'Saveetha School of Physical Education' },
        { name: 'Saveetha School of Hospitality' },
      ],
    },
  ],
};

const NodeComponent = ({ node, level }: { node: TreeNode; level: number }) => (
  <div className={cn('relative', level > 0 && 'pl-6')}>
    {level > 0 && (
      <div className="absolute left-2.5 top-0 h-full border-l-2 border-muted-foreground/20"></div>
    )}
    <div className={cn(
        "relative rounded-lg border p-4 transition-all duration-300",
        node.highlight ? "bg-primary/10 border-primary shadow-lg" : "bg-card"
    )}>
       {level > 0 && ( <div className="absolute left-[-2px] top-5 h-px w-3 border-t-2 border-muted-foreground/20"></div>)}
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h3 className={cn('font-semibold', 
            level === 0 && 'text-xl', 
            level === 1 && 'text-lg',
            level === 2 && 'text-base',
            node.highlight && 'text-primary'
        )}>
          {node.name}
        </h3>
        {node.seats && <span className="text-xs text-muted-foreground">({node.seats} seats)</span>}
        {node.accredited && <span className="text-xs text-green-600">(NBA Accredited)</span>}
      </div>
      {node.notes && <p className="text-xs text-muted-foreground mt-1">{node.notes}</p>}
    </div>
    {node.children && (
      <div className="mt-4 space-y-4">
        {node.children.map((child, index) => (
          <NodeComponent key={index} node={child} level={level + 1} />
        ))}
      </div>
    )}
  </div>
);


export default function SimatsTreePage() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-16">
             <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-lg">
                           <ListTree className="h-6 w-6 text-primary"/>
                        </div>
                        <div>
                            <CardTitle>SIMATS University Structure</CardTitle>
                            <CardDescription>A hierarchical overview of campuses, colleges, and departments.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <NodeComponent node={simatsData} level={0} />
                </CardContent>
            </Card>
        </div>
    )
}
