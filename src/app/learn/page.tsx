
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, GitBranch, CheckCircle, Loader2 } from "lucide-react";
import { getCourses } from '@/app/actions/manage-courses';

type Course = {
  id: string;
  name: string;
};

type Stage = {
  name: string;
  courses: Course[];
};

// This function attempts to group courses into logical stages based on common curriculum progression.
const groupCoursesIntoStages = (courses: Course[]): Stage[] => {
    const courseMap = new Map(courses.map(c => [c.id, c]));
    
    // Define the structured roadmap
    const stagesConfig = [
        { name: "Foundational Knowledge", codes: ['UBA01', 'UBA48', 'UBA49', 'CSA02'] },
        { name: "Core Engineering & Logic", codes: ['EEA01', 'ECA47', 'UBA04', 'CSA03'] },
        { name: "Core Programming & OS", codes: ['DSA01', 'CSA09', 'CSA05', 'CSA04'] },
        { name: "Algorithms & Architecture", codes: ['CSA06', 'ECA10', 'CSA12', 'CSA10'] },
        { name: "Advanced Computing Theory", codes: ['CSA13', 'CSA14', 'CSA07', 'UBA09'] },
        { name: "Specialization & AI", codes: ['CSA17', 'CSA15', 'CSA16', 'UBA33'] },
        { name: "Security & Professional Practices", codes: ['CSA51', 'ITA14', 'UBA28', 'SPIC1'] },
        { name: "Additional Core Subjects", codes: ['UBA05', 'UBA10', 'ECA14', 'CSA43', 'CSA11', 'CSA57', 'BTA01'] }
    ];

    const stages: Stage[] = stagesConfig.map(stageConfig => ({
        name: stageConfig.name,
        courses: stageConfig.codes
            .map(code => courseMap.get(code))
            .filter((course): course is Course => !!course) // Filter out undefined courses
    }));
    
    return stages.filter(stage => stage.courses.length > 0);
};


type StudentGrades = {
  [courseCode: string]: string;
};

export default function LearnHomePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [studentGrades, setStudentGrades] = useState<StudentGrades>({});
  const [roadmapData, setRoadmapData] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
        if (!authLoading && profile?.college && profile?.department) {
            setLoading(true);
            try {
                const courses = await getCourses(profile.college, profile.department) as Course[];
                const groupedStages = groupCoursesIntoStages(courses);
                setRoadmapData(groupedStages);
            } catch (error) {
                console.error("Error fetching courses for roadmap:", error);
            }
        }
    };
    fetchRoadmap();
  }, [profile, authLoading]);
  
  useEffect(() => {
    if (authLoading || !user) {
        if (!authLoading) setLoading(false);
        return;
    }

    const docRef = doc(db, 'student_grades', user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        setStudentGrades(docSnap.exists() ? docSnap.data() : {});
        setLoading(false); // Only set loading to false after grades are fetched
    }, (error) => {
        console.error("Error fetching grades for roadmap:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const completedCourseCodes = new Set(Object.keys(studentGrades));

  if (loading || authLoading) {
      return (
           <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary"/>
          </div>
      )
  }
  
  if (!profile?.college || !profile?.department) {
      return (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8 text-center">
              <div>
                <h3 className="text-xl font-semibold">Profile Incomplete</h3>
                <p className="text-muted-foreground mt-2">Please complete your profile from the main site to view your roadmap.</p>
              </div>
          </div>
      )
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Course Roadmap</h1>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Your Academic Journey</CardTitle>
            <CardDescription>
                A recommended roadmap for {profile.department} at {profile.college}. Courses disappear from here once you log a grade for them in the 'My Courses' tab.
            </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="relative pl-6 after:absolute after:inset-y-0 after:w-px after:bg-muted-foreground/20 after:left-6">
              {roadmapData.map((stage) => {
                const remainingCourses = stage.courses.filter(course => !completedCourseCodes.has(course.id));

                if (remainingCourses.length === 0) return null;

                return (
                  <div key={stage.name} className="grid gap-10 mb-10">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pl-4 md:pl-14">
                          {remainingCourses.map(course => (
                              <div key={course.id} className="flex items-start gap-3 p-3 rounded-lg border bg-secondary/30">
                                  <Book className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                  <div>
                                      <p className="font-semibold">{course.name}</p>
                                      <p className="text-sm text-muted-foreground">{course.id}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                )
              })}
               <div className="grid grid-cols-[40px_1fr] items-start gap-4">
                  <div className="flex-shrink-0">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-green-500 bg-green-500/10 -ml-5 relative z-10">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                      </span>
                  </div>
                  <div className="pt-2">
                      <h3 className="text-lg font-semibold">End of Roadmap</h3>
                      <p className="text-muted-foreground">Log grades in 'My Courses' to see your progress.</p>
                  </div>
              </div>
           </div>
        </CardContent>
      </Card>
    </>
  )
}
