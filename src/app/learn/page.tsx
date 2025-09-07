
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, CheckCircle, GitBranch, Milestone } from "lucide-react";

// Simplified data structure for the roadmap
const roadmapData = {
  title: "Computer Science & Engineering Roadmap",
  stages: [
    {
      name: "Semester 1 & 2: Foundational Knowledge",
      courses: [
        { code: "UBA01", name: "Engineering Mathematics - I" },
        { code: "UBA05", name: "Engineering Mathematics II" },
        { code: "UBA48", name: "Engineering Physics" },
        { code: "UBA49", name: "Engineering Chemistry" },
        { code: "CSA02", name: "C Programming" },
        { code: "EEA01", name: "Basic Electrical & Electronics Engineering" },
        { code: "BTA01", name: "Biology and Environmental Science" },
      ],
    },
    {
      name: "Semester 3 & 4: Core Concepts",
      courses: [
        { code: "UBA04", name: "Discrete Mathematics" },
        { code: "CSA03", name: "Data Structures" },
        { code: "ECA47", name: "Principles of Digital System Design" },
        { code: "CSA04", name: "Operating Systems" },
        { code: "CSA05", name: "Database Management Systems" },
        { code: "CSA06", name: "Design and Analysis of Algorithms" },
        { code: "ECA10", name: "Microprocessors and Microcontrollers" },
      ],
    },
    {
      name: "Semester 5 & 6: Advanced Topics & Specialization",
      courses: [
        { code: "CSA07", name: "Computer Networks" },
        { code: "CSA09", name: "Programming in Java" },
        { code: "CSA10", name: "Software Engineering" },
        { code: "CSA11", name: "Object Oriented Analysis and Design" },
        { code: "CSA12", name: "Computer Architecture" },
        { code: "CSA13", name: "Theory of Computation" },
        { code: "CSA14", name: "Compiler Design" },
        { code: "CSA17", name: "Artificial Intelligence" },
      ],
    },
     {
      name: "Semester 7 & 8: Electives & Projects",
      courses: [
        { code: "UBA33", name: "Principles of Management" },
        { code: "UBA28", name: "Professional Ethics and Legal Practices" },
        { code: "CSA15", name: "Cloud Computing and Big Data Analytics" },
        { code: "CSA51", name: "Cryptography and Network Security" },
        { code: "CSA16", name: "Data warehousing and Data Mining" },
        { code: "ITA14", name: "Ethical Hacking" },
        { code: "SPIC1", name: "Project 1" },
      ],
    },
  ],
};


export default function LearnHomePage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Course Roadmap</h1>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Your Academic Journey</CardTitle>
            <CardDescription>
                A recommended roadmap for Computer Science and Engineering. Courses you complete in the 'Courses' tab will be marked here.
            </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="relative pl-6 after:absolute after:inset-y-0 after:w-px after:bg-muted-foreground/20 after:left-6">
              {roadmapData.stages.map((stage, stageIndex) => (
                <div key={stage.name} className="grid gap-10">
                    <div className="grid grid-cols-[40px_1fr] items-start gap-4">
                        <div className="flex-shrink-0">
                           <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-primary/10 -ml-5 relative z-10">
                             <GitBranch className="h-5 w-5 text-primary" />
                           </span>
                        </div>
                        <div className="pt-2">
                            <h3 className="text-lg font-semibold">{stage.name}</h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4 md:pl-14">
                        {stage.courses.map(course => (
                            <div key={course.code} className="flex items-start gap-3 p-3 rounded-lg border bg-secondary/30">
                                <Book className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">{course.name}</p>
                                    <p className="text-sm text-muted-foreground">{course.code}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {stageIndex < roadmapData.stages.length - 1 && (
                         <div className="h-10 w-full" />
                    )}
                </div>
              ))}
               <div className="grid grid-cols-[40px_1fr] items-start gap-4">
                  <div className="flex-shrink-0">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-green-500 bg-green-500/10 -ml-5 relative z-10">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                      </span>
                  </div>
                  <div className="pt-2">
                      <h3 className="text-lg font-semibold">Congratulations!</h3>
                      <p className="text-muted-foreground">You have completed the roadmap.</p>
                  </div>
              </div>
           </div>
        </CardContent>
      </Card>
    </>
  )
}
