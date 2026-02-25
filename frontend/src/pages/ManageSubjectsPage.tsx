import { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';
import { useGetAllSubjects, useAddSubject, useUpdateSubject, useDeleteSubject } from '../hooks/useQueries';
import { type Subject } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit2, Trash2, PlusCircle, BookMarked } from 'lucide-react';

interface SubjectForm {
  name: string;
  code: string;
  description: string;
}

const emptyForm: SubjectForm = { name: '', code: '', description: '' };

export default function ManageSubjectsPage() {
  const { data: subjects, isLoading } = useGetAllSubjects();
  const addSubject = useAddSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [form, setForm] = useState<SubjectForm>(emptyForm);

  const openAddDialog = () => {
    setEditingSubject(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject);
    setForm({ name: subject.name, code: subject.code, description: subject.description });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error('Name and Code are required.');
      return;
    }
    try {
      if (editingSubject) {
        await updateSubject.mutateAsync({
          id: editingSubject.id,
          name: form.name.trim(),
          code: form.code.trim(),
          description: form.description.trim(),
        });
        toast.success('Subject updated successfully!');
      } else {
        await addSubject.mutateAsync({
          name: form.name.trim(),
          code: form.code.trim(),
          description: form.description.trim(),
        });
        toast.success('Subject added successfully!');
      }
      setDialogOpen(false);
      setForm(emptyForm);
    } catch {
      toast.error('Failed to save subject. Please try again.');
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteSubject.mutateAsync(id);
      toast.success('Subject deleted successfully.');
    } catch {
      toast.error('Failed to delete subject.');
    }
  };

  const isSubmitting = addSubject.isPending || updateSubject.isPending;

  return (
    <DashboardLayout title="Manage Subjects">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="page-title flex items-center gap-2">
              <BookMarked size={22} className="text-accent" />
              Manage Subjects
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {subjects?.length ?? 0} subject{(subjects?.length ?? 0) !== 1 ? 's' : ''} in database
            </p>
          </div>
          <Button
            onClick={openAddDialog}
            className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-button gap-2"
          >
            <PlusCircle size={16} />
            Add Subject
          </Button>
        </div>

        {/* Table */}
        <Card className="shadow-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="font-semibold text-foreground w-8">#</TableHead>
                  <TableHead className="font-semibold text-foreground">Subject Name</TableHead>
                  <TableHead className="font-semibold text-foreground">Code</TableHead>
                  <TableHead className="font-semibold text-foreground">Description</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : !subjects || subjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <BookMarked size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="font-medium">No subjects found</p>
                      <p className="text-sm mt-1">Click "Add Subject" to get started.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  subjects.map((s, idx) => (
                    <TableRow key={String(s.id)} className="hover:bg-secondary/30 transition-colors">
                      <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-foreground">{s.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded text-foreground">{s.code}</span>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-muted-foreground truncate" title={s.description}>{s.description}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-accent hover:text-accent hover:bg-accent/10"
                            onClick={() => openEditDialog(s)}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{s.name}"? This will also affect associated questions.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(s.id)}
                                  className="rounded-lg bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-xl max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Subject Name <span className="text-destructive">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Discrete Mathematics"
                className="h-10 rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Subject Code <span className="text-destructive">*</span></Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. DM101"
                className="h-10 rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the subject..."
                className="rounded-lg resize-none min-h-[80px]"
              />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="rounded-lg">Cancel</Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-button"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : editingSubject ? 'Update Subject' : 'Add Subject'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
