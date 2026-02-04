"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Copy, ExternalLink } from "lucide-react";

const mentorDepartments = [
    "Additive Manufacturing Engineering",
    "Applied Machine Learning",
    "Autotronics",
    "Big Data and Network Security",
    "Bioengineering",
    "Biosciences",
    "Blockchain Technology",
    "Center for Applied Research",
    "Cloud Computing",
    "Coding Linguistics",
    "Cognitive Computing",
    "Computational Biology",
    "Computational Data Science",
    "Computational Intelligence",
    "Computational Mathematics",
    "Condensed Matter Physics",
    "Cyber Security",
    "Data Vista",
    "Deep Learning",
    "Digital Electronics and Computing Systems",
    "Edge Computing",
    "Electric Power Technology",
    "Electrical Power and Drives Engineering",
    "Electrical Power and Energy Conversion",
    "Electrochemistry",
    "Electronic Instrumentation System",
    "Embedded Systems",
    "Engineering Mathematics",
    "Environmental Biotechnology",
    "Generative AI",
    "Green Computing",
    "Green Electronics",
    "Green Technology",
    "IC-Intelligent Computing",
    "Industrial Mathematics",
    "Information Security",
    "Integrated Electronics",
    "Knowledge Engineering",
    "Machine Learning",
    "Management Studies",
    "Manufacturing",
    "Materials Chemistry",
    "Materials Physics",
    "Mathematical Sciences",
    "Mathematical Studies",
    "Mathematics for Excellence",
    "Mathematics for Innovation",
    "Medical Biotechnology",
    "Medical Informatics",
    "Medicinal Chemistry",
    "Molecular Analytics",
    "Molecular Physics",
    "Nano Electronics Materials and Sensors",
    "Nanobiomaterials",
    "Nanotechnology",
    "Networking",
    "Neural Networks",
    "Nxt-Gen Computing",
    "Physics",
    "Plasma Physics",
    "Post Harvest Engineering",
    "Predictive Engineering",
    "Product Development",
    "Programming",
    "Pure & Applied Mathematics",
    "Quantitative Engineering and Employability Skill",
    "Quantum Intelligence",
    "Quantum Mathematics",
    "Reinforcement Learning",
    "Research and Innovation",
    "RF and Communication System",
    "Scientific Computing",
    "Signal and Image Processing",
    "Smart Construction Engineering",
    "Smart Materials",
    "Super Computing",
    "Surface Chemistry",
    "Sustainable Engineering",
    "Thermal Engineering",
    "Vedic Mathematics",
    "Verbal and Life Skills",
    "VLSI Microelectronics",
    "Wireless Communication",
    "Medical Electronics",
    "High Performance Computing",
    "Swarm Intelligence",
    "Nano Computing",
    "Genetic Engineering",
    "Intelligence systems",
    "Languages",
    "Languages Dynamics",
    "Wireless networks",
    "Quantum Communication",
    "Soft skills",
    "Mechanical and innovation",
    "Spatial Informatics",
];


export default function FormLinkGenerator() {
    const [name, setName] = useState('');
    const [regno, setRegno] = useState('');
    const [mentor, setmentor] = useState('');
    const [department, setDepartment] = useState('');
    const [formLink, setFormLink] = useState('');

    const [query, setQuery] = useState("");
    const [showList, setShowList] = useState(false);
    const filteredDepartments = mentorDepartments.filter((dept) =>
        dept.toLowerCase().includes(query.toLowerCase())
    );

    function generateLink() {
        const baseUrl =
            "https://docs.google.com/forms/d/e/1FAIpQLScP-4ctdj3dmYJy2_48_xBwI_wvfTodVq33iIN-_yiSWbeHYQ/viewform";

        const params = new URLSearchParams({
            "entry.187898022": name,
            "entry.781481902": regno,
            "entry.771061438": mentor,
            "entry.164360040": department,
        });

        const fullLink = `${baseUrl}?${params.toString()}`;
        setFormLink(fullLink);
    }

    return (
        <div className="flex min-h-screen items-start justify-center pt-20">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Form Link Generator</CardTitle>
                    <CardDescription>
                        Generate a prefilled Google Form link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="John Doe" onChange={(e) => setName(e.target.value)} value={name} />
                        </div>

                        <div>
                            <Label htmlFor="regno">Register Number</Label>
                            <Input id="regno" placeholder="19YYDDRRR" onChange={(e) => setRegno(e.target.value)} value={regno} />
                        </div>

                        <div>
                            <Label htmlFor="mentor">Mentor Name</Label>
                            <Input id="mentor" placeholder="Mentor name" onChange={(e) => setmentor(e.target.value)} value={mentor} />
                        </div>

                        <div className="relative">
                            <Label>Mentor Department</Label>

                            <Input
                                value={query}
                                placeholder="Type to search..."
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setShowList(true);
                                }}
                                onFocus={() => setShowList(true)}
                                onBlur={() => setShowList(false)}
                            />

                            {showList && (
                                <div className="absolute z-50 mt-1 w-full border rounded-md bg-background shadow-lg max-h-60 overflow-y-auto">
                                    {filteredDepartments.map((dept) => (
                                        <div
                                            key={dept}
                                            className="px-3 py-2 cursor-pointer hover:bg-muted"
                                            onMouseDown={() => {
                                                setQuery(dept);
                                                setShowList(false);
                                                setDepartment(dept);
                                            }}
                                        >
                                            {dept}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>


                        <Button type="button" className="w-full" onClick={generateLink}>
                            Generate link
                        </Button>
                        {formLink && (
                            <div className="mt-4 space-y-2">
                                <label> Generated link</label>
                                <div className="relative">
                                <Input value={formLink} 
                                readOnly
                                placeholder="Generated link"
                               className="pr-20"/>
                                {/* icons center */}
                                {/* <div className="absolute inset-y-0 right-3 flex items-center gap-2"> */}
                                <div className = "absolute inset-y-0 right-3 flex items-center gap-2">
                                <Button
                                    type="button"   
                                    onClick={() => navigator.clipboard.writeText(formLink)}
                                    className="text-muted-foreground bg-transparent hover:text-foreground">
                                    <Copy className="h-4 w-4"/>
                                </Button>
                                <a href={formLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground"
                                >
                                    <ExternalLink className="h-4 w-4"/>
                                </a>
                                </div>
                                </div>
                            </div>
                            )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
