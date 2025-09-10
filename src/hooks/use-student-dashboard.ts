
'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';

interface StudentGrades {
  [courseCode: string]: string;
}

const gradePoints: { [key: string]: number } = {
  S: 10, A: 9, B: 8, C: 7, D: 6, E: 5,
};

const TOTAL_DEGREE_CREDITS = 135;

export default function useStudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState({
    cgpa: 0,
    creditsCompleted: 0,
    totalCourses: 0,
    progressPercentage: 0,
  });
  const [loading, setLoading] = useState(true);

  const calculateData = useCallback((grades: StudentGrades) => {
    let totalPoints = 0;
    let totalSubjects = 0;
    
    for (const courseCode in grades) {
        const grade = grades[courseCode];
        if (gradePoints[grade]) {
            totalPoints += gradePoints[grade];
            totalSubjects++;
        }
    }
    
    const creditsCompleted = totalSubjects * 4; // Assuming 4 credits per subject
    const cgpa = creditsCompleted > 0 ? (totalPoints * 4) / creditsCompleted : 0;
    const progressPercentage = (creditsCompleted / TOTAL_DEGREE_CREDITS) * 100;

    setData({
      cgpa,
      creditsCompleted,
      totalCourses: totalSubjects,
      progressPercentage: progressPercentage > 100 ? 100 : progressPercentage,
    });
  }, []);


  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        setLoading(false);
        return;
    }

    setLoading(true);
    const docRef = doc(db, 'student_grades', user.uid);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const grades = docSnap.data() as StudentGrades;
        calculateData(grades);
      } else {
        // No grades logged yet, set to default zero values
        setData({
            cgpa: 0,
            creditsCompleted: 0,
            totalCourses: 0,
            progressPercentage: 0,
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching student grades:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, calculateData]);

  return { data, loading };
}
