
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Trash2, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBatchAdmins, addBatchAdmin, removeBatchAdmin, type BatchAdmin } from '@/app/actions/manage-batch-admins';
import { getAllUsers, type BasicUser } from '@/app/actions/get-users';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Combobox } from '@/components/ui/combobox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function BatchAdminManagementPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [batchAdmins, setBatchAdmins] = useState<BatchAdmin[]>([]);
  const [allUsers, setAllUsers] = useState<BasicUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  
  const batchYears = ['2022', '2023', '2024', '2025'];

  const fetchUsersAndAdmins = async () => {
    startTransition(async () => {
      const [admins, users] = await Promise.all([getBatchAdmins(), getAllUsers()]);
      setBatchAdmins(admins);
      setAllUsers(users);
    });
  };

  useEffect(() => {
    fetchUsersAndAdmins();
  }, []);

  const userOptions = allUsers
    .filter(u => !batchAdmins.some(a => a.id === u.id))
    .map(u => ({
      label: `${u.name} (${u.email})`,
      value: u.id,
    }));

  const handleAdd = () => {
    if (!selectedUserId || !selectedBatch) {
      toast({ title: 'Error', description: 'Please select a user and a batch.', variant: 'destructive' });
      return;
    }
    const selectedUser = allUsers.find(u => u.id === selectedUserId);
    if (!selectedUser) {
        toast({ title: 'Error', description: 'Selected user not found.', variant: 'destructive' });
        return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('userId', selectedUserId);
      formData.append('email', selectedUser.email);
      formData.append('batch', selectedBatch);
      const result = await addBatchAdmin(formData);
      toast({
        title: result.type === 'success' ? 'Success' : 'Error',
        description: result.message,
      });
      if (result.type === 'success') {
        setSelectedUserId('');
        setSelectedBatch('');
        fetchUsersAndAdmins();
      }
    });
  };

  const handleRemove = (userId: string) => {
    startTransition(async () => {
      const result = await removeBatchAdmin(userId);
      toast({
        title: result.type === 'success' ? 'Success' : 'Error',
        description: result.message,
      });
      if (result.type === 'success') {
        fetchUsersAndAdmins();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Batch Admins</h2>
          <p className="text-muted-foreground">Manage users who can contribute content for specific batches.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Add New Batch Admin</CardTitle>
            <CardDescription>Select a user and assign them a batch to manage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>User</Label>
                 <Combobox
                    options={userOptions}
                    value={selectedUserId}
                    onChange={setSelectedUserId}
                    placeholder="Select a user..."
                    searchPlaceholder="Search by name or email..."
                    notFoundMessage="No available users found."
                />
            </div>
             <div className="space-y-2">
                <Label>Batch Year</Label>
                <Select onValueChange={setSelectedBatch} value={selectedBatch}>
                    <SelectTrigger><SelectValue placeholder="Select batch..." /></SelectTrigger>
                    <SelectContent>
                        {batchYears.map(year => (
                            <SelectItem key={year} value={year}>{year} Batch</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAdd} disabled={isPending || !selectedUserId || !selectedBatch}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Add Admin
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Batch Admins</CardTitle>
            <CardDescription>A list of all users with batch admin privileges.</CardDescription>
          </CardHeader>
          <CardContent>
            {isPending && batchAdmins.length === 0 ? (
                <div className="flex justify-center items-center h-24"><Loader2 className="h-6 w-6 animate-spin"/></div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Batch</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {batchAdmins.map(admin => (
                            <TableRow key={admin.id}>
                                <TableCell>{admin.email}</TableCell>
                                <TableCell>{admin.batch}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleRemove(admin.id)} disabled={isPending}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                         {batchAdmins.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No batch admins have been added yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
