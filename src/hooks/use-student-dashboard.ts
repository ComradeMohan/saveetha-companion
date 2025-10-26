'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';
import { getCourses } from '@/app/actions/manage-courses';
import { arrangeRoadmap } from '@/ai/flows/roadmap-arranger-flow';
import type { Course } from '@/lib/roadmap-arranger-types';

interface StudentGrades {
  [courseCode: string]: string;
}

const gradePoints: { [key: string]: number } = {
  S: 10, A: 9, B: 8, C: 7, D: 6, E: 5,
};

export default function useStudentDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [data, setData] = useState({
    cgpa: 0,
    creditsCompleted: 0,
    totalCourses: 0,
    completedCoursesCount: 0,
    progressPercentage: 0,
  });
  const [loading, setLoading] = useState(true);

  const calculateData = useCallback(
    (grades: StudentGrades, roadmapCourses: Map<string, Course>) => {
      let totalPoints = 0;
      let totalSubjectsWithGrades = 0;

      // Calculate CGPA from all logged grades
      for (const courseCode in grades) {
        const grade = grades[courseCode];
        if (gradePoints[grade]) {
          totalPoints += gradePoints[grade];
          totalSubjectsWithGrades++;
        }
      }
      const creditsForCgpa = totalSubjectsWithGrades * 4;
      const cgpa = creditsForCgpa > 0 ? (totalPoints * 4) / creditsForCgpa : 0;

      // Calculate progress based on roadmap
      const totalRoadmapCourses = roadmapCourses.size;
      let completedRoadmapCourses = 0;
      roadmapCourses.forEach((course) => {
        if (grades[course.id]) {
          completedRoadmapCourses++;
        }
      });
      
      const progressPercentage = totalRoadmapCourses > 0
          ? (completedRoadmapCourses / totalRoadmapCourses) * 100
          : 0;
      
      setData({
        cgpa,
        creditsCompleted: completedRoadmapCourses * 4,
        totalCourses: totalRoadmapCourses,
        completedCoursesCount: completedRoadmapCourses,
        progressPercentage: progressPercentage > 100 ? 100 : progressPercentage,
      });
    },
    []
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchRoadmapAndGrades = async () => {
        let roadmapCourses = new Map<string, Course>();

        if (profile?.college && profile?.department) {
            const cacheKey = `roadmapData-${profile.college}-${profile.department}`;
            try {
                const cachedRoadmap = localStorage.getItem(cacheKey);
                let stages = [];
                if (cachedRoadmap) {
                    stages = JSON.parse(cachedRoadmap);
                } else {
                    const courses = await getCourses(profile.college, profile.department) as Course[];
                    if(courses.length > 0) {
                        const result = await arrangeRoadmap({ courses });
                        stages = result.stages;
                        localStorage.setItem(cacheKey, JSON.stringify(stages));
                    }
                }
                 stages.forEach(stage => {
                    stage.courses.forEach(course => {
                        if (!roadmapCourses.has(course.id)) {
                            roadmapCourses.set(course.id, course);
                        }
                    });
                });
            } catch (error) {
                 console.error("Error fetching or arranging roadmap for dashboard:", error);
            }
        }
        
        const docRef = doc(db, 'student_grades', user.uid);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            const grades = docSnap.exists() ? (docSnap.data() as StudentGrades) : {};
            calculateData(grades, roadmapCourses);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching student grades for dashboard:", error);
            setLoading(false);
        });

        return unsubscribe;
    };

    const promise = fetchRoadmapAndGrades();

    return () => {
        promise.then(unsubscribe => unsubscribe && unsubscribe());
    };

  }, [user, profile, authLoading, calculateData]);

  return { data, loading };
}
