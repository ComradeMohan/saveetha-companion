
'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, CheckCircle2, XCircle, Download, ArrowUpDown } from "lucide-react";
import { collection, orderBy, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
    id: string;
    name: string;
    email: string;
    regNo?: string;
    phone?: string;
    isVerified: boolean;
    lastSignInTime?: string;
    photoURL?: string;
}

type SortKey = 'name' | 'contact' | 'status';
type SortDirection = 'asc' | 'desc';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "unverified">("all");
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'asc' });
    const { toast } = useToast();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'users'), orderBy('name', 'asc'));
            const querySnapshot = await getDocs(q);
            const data: User[] = [];
            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                data.push({ 
                    id: doc.id,
                    name: docData.name,
                    email: docData.email,
                    regNo: docData.regNo,
                    phone: docData.phone,
                    isVerified: docData.isVerified || false,
                    lastSignInTime: docData.lastSignInTime,
                    photoURL: docData.photoURL
                });
            });
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast({
                title: "Error",
                description: "Could not fetch user data.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleSort = (key: SortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: SortKey) => {
        if (sortConfig.key !== key) {
            return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
        }
        return sortConfig.direction === 'asc' ? '▲' : '▼';
    }

    const filteredAndSortedUsers = useMemo(() => {
        let filtered = users.filter(user => {
            const searchMatch = !searchTerm ||
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.regNo?.toLowerCase().includes(searchTerm.toLowerCase());

            const statusMatch = filterStatus === 'all' ||
                (filterStatus === 'verified' && user.isVerified) ||
                (filterStatus === 'unverified' && !user.isVerified);

            return searchMatch && statusMatch;
        });

        return filtered.sort((a, b) => {
            let aValue: string | boolean, bValue: string | boolean;

            switch(sortConfig.key) {
                case 'contact':
                    aValue = `${a.regNo || ''}${a.phone || ''}`;
                    bValue = `${b.regNo || ''}${b.phone || ''}`;
                    break;
                case 'status':
                    aValue = a.isVerified;
                    bValue = b.isVerified;
                    break;
                default: // name
                    aValue = a.name ?? '';
                    bValue = b.name ?? '';
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [searchTerm, users, filterStatus, sortConfig]);
    
    const exportToCsv = () => {
        if (filteredAndSortedUsers.length === 0) {
            toast({
                title: "No data to export",
                description: "The current table is empty.",
                variant: "destructive"
            });
            return;
        }

        const headers = ["S.No.", "Name", "Email", "Registration No.", "Phone", "Status", "Last Signed In"];
        const csvRows = [headers.join(",")];

        filteredAndSortedUsers.forEach((user, index) => {
            const row = [
                index + 1,
                `"${user.name || 'N/A'}"`,
                `"${user.email || 'N/A'}"`,
                user.regNo ? `="\\"${user.regNo}\\""` : '"Not Provided"',
                user.phone ? `="\\"${user.phone}\\""` : '"Not Provided"',
                user.isVerified ? 'Verified' : 'Unverified',
                user.lastSignInTime ? `"${format(new Date(user.lastSignInTime), 'yyyy-MM-dd HH:mm:ss')}"` : 'N/A'
            ];
            csvRows.push(row.join(","));
        });

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: "Export Successful",
            description: `${filteredAndSortedUsers.length} user records have been exported.`
        });
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Users</CardTitle>
                    <CardDescription>
                        A list of all users who have signed up for the application.
                    </CardDescription>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or registration no..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full"
                            />
                        </div>
                        <div className="flex gap-2">
                             <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="verified">Verified Only</SelectItem>
                                    <SelectItem value="unverified">Unverified Only</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={exportToCsv}>
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">S.No.</TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => handleSort('name')} className="px-0">
                                        User {getSortIcon('name')}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => handleSort('contact')} className="px-0">
                                        Contact {getSortIcon('contact')}
                                    </Button>
                                </TableHead>
                                <TableHead>Last Signed In</TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => handleSort('status')} className="px-0">
                                        Status {getSortIcon('status')}
                                    </Button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredAndSortedUsers.length > 0 ? (
                                filteredAndSortedUsers.map((user, index) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={user.photoURL} alt={user.name} />
                                                    <AvatarFallback>{user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{user.name || 'N/A'}</div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-mono text-sm">{user.regNo || 'Reg: Not Provided'}</div>
                                            <div className="text-sm text-muted-foreground">{user.phone || 'Phone: Not Provided'}</div>
                                        </TableCell>
                                        <TableCell>
                                            {user.lastSignInTime ? (
                                                 <div className="flex flex-col">
                                                    <span>{formatDistanceToNow(new Date(user.lastSignInTime), { addSuffix: true })}</span>
                                                    <span className="text-xs text-muted-foreground">{format(new Date(user.lastSignInTime), 'PPp')}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">Never</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.isVerified ? 'default' : 'destructive'} className="gap-1">
                                                {user.isVerified ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                                {user.isVerified ? 'Verified' : 'Unverified'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        {searchTerm || filterStatus !== 'all' ? "No users match your criteria." : "No users found."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
