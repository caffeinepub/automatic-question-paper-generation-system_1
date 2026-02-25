import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';
import { useGetAllSubjects, useGetAllQuestions, useDeleteQuestion } from '../hooks/useQueries';
import { Category, Difficulty } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit2, Trash2, Search, BookOpen, PlusCircle, Filter } from 'lucide-react';
import { Link } from '@tanstack/react-router';

const CATEGORY_LABELS: Record<Category, string> = {
  [Category.MCQ]: 'MCQ',
  [Category.Marks2]: '2 Marks',
  [Category.Marks4]: '4 Marks',
  [Category.Marks6]: '6 Marks',
  [Category.Marks8]: '8 Marks',
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  [Difficulty.Easy]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [Difficulty.Medium]: 'bg-amber-100 text-amber-700 border-amber-200',
  [Difficulty.Hard]: 'bg-red-100 text-red-700 border-red-200',
};

export default function QuestionBankPage() {
  const router = useRouter();
  const { data: subjects, isLoading: subjectsLoading } = useGetAllSubjects();
  const { data: questions, isLoading: questionsLoading } = useGetAllQuestions();
  const deleteQuestion = useDeleteQuestion();

  const [filterSubject, setFilterSubject] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [searchText, setSearchText] = useState('');

  const filteredQuestions = (questions || []).filter((q) => {
    if (filterSubject !== 'all' && String(q.subjectId) !== filterSubject) return false;
    if (filterCategory !== 'all' && q.category !== filterCategory) return false;
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
    if (searchText && !q.questionText.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  const getSubjectName = (id: bigint) => subjects?.find((s) => s.id === id)?.name || 'Unknown';

  const handleDelete = async (id: bigint) => {
    try {
      await deleteQuestion.mutateAsync(id);
      toast.success('Question deleted successfully.');
    } catch {
      toast.error('Failed to delete question.');
    }
  };

  const isLoading = subjectsLoading || questionsLoading;

  return (
    <DashboardLayout title="Question Bank">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="page-title flex items-center gap-2">
              <BookOpen size={22} className="text-accent" />
              Question Bank
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <Link to="/add-question">
            <Button className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-button gap-2">
              <PlusCircle size={16} />
              Add Question
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="shadow-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <Filter size={16} className="text-muted-foreground flex-shrink-0" />
              <div className="relative flex-1 min-w-[180px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-8 h-9 rounded-lg text-sm"
                />
              </div>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="h-9 rounded-lg text-sm w-44">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects?.map((s) => (
                    <SelectItem key={String(s.id)} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-9 rounded-lg text-sm w-36">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="h-9 rounded-lg text-sm w-36">
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value={Difficulty.Easy}>Easy</SelectItem>
                  <SelectItem value={Difficulty.Medium}>Medium</SelectItem>
                  <SelectItem value={Difficulty.Hard}>Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="font-semibold text-foreground w-8">#</TableHead>
                  <TableHead className="font-semibold text-foreground">Subject</TableHead>
                  <TableHead className="font-semibold text-foreground">Category</TableHead>
                  <TableHead className="font-semibold text-foreground">Difficulty</TableHead>
                  <TableHead className="font-semibold text-foreground">Question</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredQuestions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="font-medium">No questions found</p>
                      <p className="text-sm mt-1">
                        <Link to="/add-question" className="text-accent hover:underline">Add your first question</Link>
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuestions.map((q, idx) => (
                    <TableRow key={String(q.id)} className="hover:bg-secondary/30 transition-colors">
                      <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground">{getSubjectName(q.subjectId)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-medium border-accent/30 text-accent bg-accent/5">
                          {CATEGORY_LABELS[q.category]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[q.difficulty]}`}>
                          {q.difficulty}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-foreground truncate" title={q.questionText}>
                          {q.questionText}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-accent hover:text-accent hover:bg-accent/10"
                            onClick={() => router.navigate({ to: `/add-question/${String(q.id)}` })}
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
                                <AlertDialogTitle>Delete Question</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this question? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(q.id)}
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
    </DashboardLayout>
  );
}
