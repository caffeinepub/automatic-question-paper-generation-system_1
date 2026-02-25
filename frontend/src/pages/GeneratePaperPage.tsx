import { useState, useMemo } from 'react';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';
import { useGetAllSubjects, useGetAllQuestions, useGeneratePaper } from '../hooks/useQueries';
import { Category } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Zap, AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface CategoryConfig {
  category: Category;
  label: string;
  marks: number;
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  { category: Category.MCQ, label: 'MCQ', marks: 1 },
  { category: Category.Marks2, label: '2 Marks', marks: 2 },
  { category: Category.Marks4, label: '4 Marks', marks: 4 },
  { category: Category.Marks6, label: '6 Marks', marks: 6 },
  { category: Category.Marks8, label: '8 Marks', marks: 8 },
];

const DURATION_OPTIONS = ['1 Hour', '1.5 Hours', '2 Hours', '2.5 Hours', '3 Hours'];

interface StoredPaper {
  id: string;
  subjectId: string;
  subjectName: string;
  examDuration: string;
  totalMarks: number;
  createdAt: string;
  sets: string[];
}

export default function GeneratePaperPage() {
  const router = useRouter();
  const { data: subjects } = useGetAllSubjects();
  const { data: questions } = useGetAllQuestions();
  const generatePaper = useGeneratePaper();

  const [subjectId, setSubjectId] = useState('');
  const [examDuration, setExamDuration] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [questionCounts, setQuestionCounts] = useState<Record<Category, number>>({
    [Category.MCQ]: 0,
    [Category.Marks2]: 0,
    [Category.Marks4]: 0,
    [Category.Marks6]: 0,
    [Category.Marks8]: 0,
  });

  const calculatedMarks = useMemo(() => {
    return CATEGORY_CONFIGS.reduce((sum, cfg) => sum + (questionCounts[cfg.category] * cfg.marks), 0);
  }, [questionCounts]);

  const totalMarksNum = parseInt(totalMarks) || 0;
  const marksMatch = totalMarksNum > 0 && calculatedMarks === totalMarksNum;
  const marksOver = calculatedMarks > totalMarksNum && totalMarksNum > 0;

  // Available questions per category for selected subject
  const availableByCategory = useMemo(() => {
    if (!questions || !subjectId) return {} as Record<Category, number>;
    const result: Record<Category, number> = {
      [Category.MCQ]: 0,
      [Category.Marks2]: 0,
      [Category.Marks4]: 0,
      [Category.Marks6]: 0,
      [Category.Marks8]: 0,
    };
    questions
      .filter((q) => String(q.subjectId) === subjectId)
      .forEach((q) => { result[q.category] = (result[q.category] || 0) + 1; });
    return result;
  }, [questions, subjectId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) { toast.error('Please select a subject.'); return; }
    if (!examDuration) { toast.error('Please select exam duration.'); return; }
    if (!totalMarks || totalMarksNum <= 0) { toast.error('Please enter valid total marks.'); return; }
    if (!marksMatch) { toast.error('Calculated marks must equal total marks.'); return; }

    const numOfQuestionsPerCategory: Array<[Category, bigint]> = CATEGORY_CONFIGS
      .filter((cfg) => questionCounts[cfg.category] > 0)
      .map((cfg) => [cfg.category, BigInt(questionCounts[cfg.category])]);

    if (numOfQuestionsPerCategory.length === 0) {
      toast.error('Please specify at least one question category.');
      return;
    }

    try {
      const paperId = await generatePaper.mutateAsync({
        subjectId: BigInt(subjectId),
        examDuration,
        totalMarks: BigInt(totalMarksNum),
        numOfQuestionsPerCategory,
      });

      // Store paper metadata in localStorage for listing
      const subjectName = subjects?.find((s) => String(s.id) === subjectId)?.name || 'Unknown';
      const stored = JSON.parse(localStorage.getItem('qpg_papers') || '[]') as StoredPaper[];
      const newPaper: StoredPaper = {
        id: String(paperId),
        subjectId,
        subjectName,
        examDuration,
        totalMarks: totalMarksNum,
        createdAt: new Date().toISOString(),
        sets: ['A', 'B', 'C', 'D', 'E'],
      };
      stored.push(newPaper);
      localStorage.setItem('qpg_papers', JSON.stringify(stored));

      toast.success('Question paper generated successfully! 5 sets (A–E) created.');
      router.navigate({ to: `/paper-preview/${String(paperId)}` });
    } catch (err) {
      toast.error('Failed to generate paper. Ensure enough questions exist for the selected subject.');
    }
  };

  return (
    <DashboardLayout title="Generate Question Paper">
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h2 className="page-title flex items-center gap-2">
            <FileText size={22} className="text-accent" />
            Generate Question Paper
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure paper settings and the system will auto-select questions from the database.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Paper Settings */}
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold">Paper Configuration</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Select Subject <span className="text-destructive">*</span></Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger className="h-11 rounded-lg">
                    <SelectValue placeholder="Choose a subject..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((s) => (
                      <SelectItem key={String(s.id)} value={String(s.id)}>
                        {s.name} ({s.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Exam Duration <span className="text-destructive">*</span></Label>
                  <Select value={examDuration} onValueChange={setExamDuration}>
                    <SelectTrigger className="h-11 rounded-lg">
                      <SelectValue placeholder="Select duration..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Total Marks <span className="text-destructive">*</span></Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    className="h-11 rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Distribution */}
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold">Question Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              {CATEGORY_CONFIGS.map((cfg) => {
                const available = availableByCategory[cfg.category] || 0;
                const count = questionCounts[cfg.category];
                const insufficient = count > available;
                return (
                  <div key={cfg.category} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-sm font-medium">{cfg.label}</Label>
                        {subjectId && (
                          <span className="text-xs text-muted-foreground">
                            {available} available
                          </span>
                        )}
                      </div>
                      <Input
                        type="number"
                        min="0"
                        max={available || undefined}
                        value={count || ''}
                        onChange={(e) => setQuestionCounts((prev) => ({
                          ...prev,
                          [cfg.category]: parseInt(e.target.value) || 0,
                        }))}
                        placeholder="0"
                        className={`h-10 rounded-lg ${insufficient ? 'border-destructive' : ''}`}
                      />
                      {insufficient && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle size={11} />
                          Only {available} questions available
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 w-24">
                      <p className="text-xs text-muted-foreground">Marks</p>
                      <p className="text-sm font-semibold text-foreground">
                        {count * cfg.marks} / {cfg.marks} each
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Marks Calculator */}
          <Card className={`shadow-card border-2 ${marksMatch ? 'border-emerald-300 bg-emerald-50/50' : marksOver ? 'border-destructive/30 bg-destructive/5' : 'border-border'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {marksMatch ? (
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  ) : (
                    <Info size={18} className="text-muted-foreground" />
                  )}
                  <span className="text-sm font-semibold text-foreground">Marks Calculator</span>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-bold ${marksMatch ? 'text-emerald-600' : marksOver ? 'text-destructive' : 'text-foreground'}`}>
                    {calculatedMarks}
                  </span>
                  <span className="text-muted-foreground text-sm"> / {totalMarksNum || '?'}</span>
                </div>
              </div>
              {!marksMatch && totalMarksNum > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {marksOver
                    ? `${calculatedMarks - totalMarksNum} marks over the limit. Reduce questions.`
                    : `${totalMarksNum - calculatedMarks} more marks needed to match total.`}
                </p>
              )}
              {marksMatch && (
                <p className="text-xs text-emerald-600 mt-2 font-medium">
                  ✓ Marks balanced! Ready to generate paper.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
            <Zap size={16} className="text-accent mt-0.5 flex-shrink-0" />
            <p className="text-xs text-foreground/80">
              The system will automatically select questions from the database and generate <strong>5 different sets (A, B, C, D, E)</strong> with randomized question order for each set.
            </p>
          </div>

          <Button
            type="submit"
            disabled={!marksMatch || generatePaper.isPending}
            className="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-button text-base disabled:opacity-50"
          >
            {generatePaper.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Paper...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap size={18} />
                Generate Question Paper
              </span>
            )}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
