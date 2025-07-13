
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { facultyData, type Faculty } from "@/lib/faculty-data";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function AdminFacultyPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Faculty Management</h2>
                    <p className="text-muted-foreground">
                        Here you can add, edit, or remove faculty members from the directory.
                    </p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Faculty
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Faculty Members</CardTitle>
                    <CardDescription>
                        A list of all faculty members in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Subjects</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {facultyData.map((faculty) => (
                                <TableRow key={faculty.name}>
                                    <TableCell className="font-medium">
                                        <div className="font-medium">{faculty.name}</div>
                                        <div className="text-sm text-muted-foreground">{faculty.designation}</div>
                                    </TableCell>
                                    <TableCell>{faculty.department}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {faculty.subjects.map(s => <Badge variant="outline" key={s}>{s}</Badge>)}
                                        </div>
                                    </TableCell>
                                    <TableCell>{faculty.room}</TableCell>
                                    <TableCell>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
