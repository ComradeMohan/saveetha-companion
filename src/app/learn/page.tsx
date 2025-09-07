
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const roadmapData = [
  { sno: 1, code: "UBA05", name: "Engineering Mathematics II", grade: "F", status: "FAIL", date: "July-2025" },
  { sno: 2, code: "EEA01", name: "Basic Electrical & Electronics Engineering", grade: "A", status: "PASS", date: "May-2025" },
  { sno: 3, code: "SPIC1", name: "Project 1", grade: "A", status: "PASS", date: "April-2025" },
  { sno: 4, code: "UBA10", name: "Numerical Methods", grade: "A", status: "PASS", date: "April-2025" },
  { sno: 5, code: "UBA05", name: "Engineering Mathematics II", grade: "F", status: "FAIL", date: "February-2025" },
  { sno: 6, code: "ECA14", name: "Embedded Systems", grade: "S", status: "PASS", date: "February-2025" },
  { sno: 7, code: "CSA04", name: "Operating Systems", grade: "A", status: "PASS", date: "February-2025" },
  { sno: 8, code: "CSA15", name: "Cloud Computing and Big Data Analytics", grade: "A", status: "PASS", date: "January-2025" },
  { sno: 9, code: "CSA51", name: "Cryptography and Network Security", grade: "B", status: "PASS", date: "January-2025" },
  { sno: 10, code: "CSA13", name: "Theory of Computation", grade: "A", status: "PASS", date: "January-2025" },
  { sno: 11, code: "CSA12", name: "Computer Architecture", grade: "A", status: "PASS", date: "November-2024" },
  { sno: 12, code: "CSA17", name: "Artificial Intelligence", grade: "A", status: "PASS", date: "November-2024" },
  { sno: 13, code: "DSA01", name: "Object Oriented Programming with C++", grade: "S", status: "PASS", date: "September-2024" },
  { sno: 14, code: "CSA51", name: "Cryptography and Network Security", grade: "F", status: "FAIL", date: "September-2024" },
  { sno: 15, code: "UBA09", name: "Probability and Statistics", grade: "A", status: "PASS", date: "July-2024" },
  { sno: 16, code: "CSA43", name: "Internet programming", grade: "B", status: "PASS", date: "July-2024" },
  { sno: 17, code: "CSA14", name: "Compiler design", grade: "A", status: "PASS", date: "May-2024" },
  { sno: 18, code: "CSA09", name: "Programming in Java", grade: "S", status: "PASS", date: "April-2024" },
  { sno: 19, code: "CSA06", name: "Design and Analysis of Algorithms", grade: "B", status: "PASS", date: "April-2024" },
  { sno: 20, code: "CSA04", name: "Operating Systems", grade: "F", status: "FAIL", date: "April-2024" },
  { sno: 21, code: "UBA33", name: "Principles of Management", grade: "B", status: "PASS", date: "February-2024" },
  { sno: 22, code: "CSA07", name: "Computer Networks", grade: "F", status: "FAIL", date: "January-2024" },
  { sno: 23, code: "CSA16", name: "Data warehousing and Data Mining", grade: "B", status: "PASS", date: "January-2024" },
  { sno: 24, code: "ITA14", name: "Ethical Hacking", grade: "B", status: "PASS", date: "January-2024" },
  { sno: 25, code: "CSA08", name: "Python Programming", grade: "S", status: "PASS", date: "January-2024" },
  { sno: 26, code: "UBA04", name: "Discrete Mathematics", grade: "A", status: "PASS", date: "January-2024" },
  { sno: 27, code: "ECA10", name: "Microprocessors and Microcontrollers", grade: "B", status: "PASS", date: "September-2023" },
  { sno: 28, code: "CSA03", name: "Data Structures", grade: "B", status: "PASS", date: "September-2023" },
  { sno: 29, code: "CSA57", name: "Fundamentals of Computing", grade: "B", status: "PASS", date: "September-2023" },
  { sno: 30, code: "CSA11", name: "Object Oriented Analysis and Design", grade: "B", status: "PASS", date: "September-2023" },
  { sno: 31, code: "ECA47", name: "Principles of Digital System Design", grade: "B", status: "PASS", date: "July-2023" },
  { sno: 32, code: "UBA33", name: "Principles of Management", grade: "F", status: "FAIL", date: "June-2023" },
  { sno: 33, code: "CSA02", name: "C Programming", grade: "A", status: "PASS", date: "June-2023" },
  { sno: 34, code: "UBA01", name: "Engineering Mathematics - I", grade: "B", status: "PASS", date: "June-2023" },
  { sno: 35, code: "UBA49", name: "Engineering Chemistry", grade: "A", status: "PASS", date: "March-2023" },
  { sno: 36, code: "UBA48", name: "Engineering Physics", grade: "A", status: "PASS", date: "March-2023" },
  { sno: 37, code: "ITA14", name: "Ethical Hacking", grade: "F", status: "FAIL", date: "March-2023" },
  { sno: 38, code: "UBA28", name: "Professional Ethics and Legal Practices", grade: "B", status: "PASS", date: "March-2023" },
  { sno: 39, code: "CSA05", name: "Database Management Systems", grade: "B", status: "PASS", date: "January-2023" },
  { sno: 40, code: "CSA10", name: "Software Engineering", grade: "B", status: "PASS", date: "January-2023" },
  { sno: 41, code: "BTA01", name: "Biology and Environmental Science for Engineers", grade: "B", status: "PASS", date: "December-2022" },
  { sno: 42, code: "UBA28", name: "Professional Ethics and Legal Practices", grade: "F", status: "FAIL", date: "December-2022" },
];

export default function LearnHomePage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Course Roadmap</h1>
      </div>
      <div
        className="flex flex-1 items-start justify-center rounded-lg border border-dashed shadow-sm"
      >
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Your Academic Journey</CardTitle>
                <CardDescription>
                    This is a sample roadmap for Computer Science and Engineering. A tree-like structure will be implemented soon.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">S.No</TableHead>
                            <TableHead>Course Code</TableHead>
                            <TableHead>Course Name</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Month & Year</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roadmapData.map((course) => (
                            <TableRow key={course.sno}>
                                <TableCell>{course.sno}</TableCell>
                                <TableCell>{course.code}</TableCell>
                                <TableCell className="font-medium">{course.name}</TableCell>
                                <TableCell>{course.grade}</TableCell>
                                <TableCell>
                                    <Badge variant={course.status === 'PASS' ? 'default' : 'destructive'} className={cn(course.status === 'PASS' && 'bg-green-600')}>
                                        {course.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{course.date}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </>
  )
}
