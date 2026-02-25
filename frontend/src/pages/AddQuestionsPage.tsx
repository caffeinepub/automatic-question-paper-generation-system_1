import { useState, useEffect } from 'react';
import { useParams, useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';
import { useGetAllSubjects, useGetAllQuestions, useAddQuestion, useUpdateQuestion } from '../hooks/useQueries';
import { Category, Difficulty } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Save, ArrowLeft } from 'lucide-react';
import { Link } from '@tanstack/react-router';

const CATEGORY_OPTIONS = [
  { value: Category.MCQ, label: 'MCQ (1 Mark)' },
  { value: Category.Marks2, label: '2 Marks' },
  { value: Category.Marks4, label: '4 Marks' },
  { value: Category.Marks6, label: '6 Marks' },
  { value: Category.Marks8, label: '8 Marks' },
];

const DIFFICULTY_OPTIONS = [
  { value: Difficulty.Easy, label: 'Easy' },
  { value: Difficulty.Medium, label: 'Medium' },
  { value: Difficulty.Hard, label: 'Hard' },
];

export default function AddQuestionsPage() {
  const params = useParams({ strict: false }) as { id?: string };
  const router = useRouter();
  const editId = params.id ? BigInt(params.id) : null;
  const isEditMode = !!editId;

  const { data: subjects } = useGetAllSubjects();
  const { data: questions } = useGetAllQuestions();
  const addQuestion = useAddQuestion();
  const updateQuestion = useUpdateQuestion();

  const [subjectId, setSubjectId] = useState('');
  const [category, setCategory] = useState<Category>(Category.Marks2);
  const [questionText, setQuestionText] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Medium);
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState<string>('0');

  // Pre-fill form in edit mode
  useEffect(() => {
    if (isEditMode && questions) {
      const q = questions.find((q) => q.id === editId);
      if (q) {
        setSubjectId(String(q.subjectId));
        setCategory(q.category);
        setQuestionText(q.questionText);
        setDifficulty(q.difficulty);
        if (q.options.length >= 4) {
          setOptionA(q.options[0] || '');
          setOptionB(q.options[1] || '');
          setOptionC(q.options[2] || '');
          setOptionD(q.options[3] || '');
        }
        if (q.correctOption !== undefined && q.correctOption !== null) {
          setCorrectOption(String(q.correctOption));
        }
      }
    }
  }, [isEditMode, editId, questions]);

  const isMCQ = category === Category.MCQ;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) { toast.error('Please select a subject.'); return; }
    if (!questionText.trim()) { toast.error('Please enter the question text.'); return; }
    if (isMCQ && (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim())) {
      toast.error('Please fill in all MCQ options.');
      return;
    }

    const options = isMCQ ? [optionA, optionB, optionC, optionD] : [];
    const correctOpt = isMCQ ? BigInt(correctOption) : null;

    try {
      if (isEditMode && editId) {
        await updateQuestion.mutateAsync({
          id: editId,
          subjectId: BigInt(subjectId),
          questionText: questionText.trim(),
          category,
          difficulty,
          options,
          correctOption: correctOpt,
        });
        toast.success('Question updated successfully!');
      } else {
        await addQuestion.mutateAsync({
          subjectId: BigInt(subjectId),
          questionText: questionText.trim(),
          category,
          difficulty,
          options,
          correctOption: correctOpt,
        });
        toast.success('Question saved to database successfully!');
        // Reset form
        setQuestionText('');
        setOptionA(''); setOptionB(''); setOptionC(''); setOptionD('');
        setCorrectOption('0');
      }
    } catch (err) {
      toast.error('Failed to save question. Please try again.');
    }
  };

  const isSubmitting = addQuestion.isPending || updateQuestion.isPending;

  return (
    <DashboardLayout title={isEditMode ? 'Edit Question' : 'Add Question'}>
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <div className="mb-4">
          <Link to="/question-bank" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
            Back to Question Bank
          </Link>
        </div>

        <Card className="shadow-card border-border">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PlusCircle size={20} className="text-accent" />
              {isEditMode ? 'Edit Question' : 'Add New Question'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditMode ? 'Update the question details below.' : 'Fill in the details to add a question to the database.'}
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Subject */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Subject <span className="text-destructive">*</span></Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger className="h-11 rounded-lg">
                    <SelectValue placeholder="Select a subject..." />
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

              {/* Category & Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Question Category <span className="text-destructive">*</span></Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                    <SelectTrigger className="h-11 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Difficulty Level <span className="text-destructive">*</span></Label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                    <SelectTrigger className="h-11 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Question Text <span className="text-destructive">*</span></Label>
                <Textarea
                  placeholder="Enter the question here..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="min-h-[100px] rounded-lg resize-none"
                />
              </div>

              {/* MCQ Options */}
              {isMCQ && (
                <div className="space-y-4 p-4 bg-secondary/50 rounded-xl border border-border">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">?</span>
                    MCQ Options
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Option A', value: optionA, setter: setOptionA },
                      { label: 'Option B', value: optionB, setter: setOptionB },
                      { label: 'Option C', value: optionC, setter: setOptionC },
                      { label: 'Option D', value: optionD, setter: setOptionD },
                    ].map((opt, idx) => (
                      <div key={opt.label} className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">{opt.label}</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                            {['A', 'B', 'C', 'D'][idx]}.
                          </span>
                          <Input
                            value={opt.value}
                            onChange={(e) => opt.setter(e.target.value)}
                            placeholder={`Enter option ${['A', 'B', 'C', 'D'][idx]}`}
                            className="pl-7 h-10 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Correct Answer <span className="text-destructive">*</span></Label>
                    <Select value={correctOption} onValueChange={setCorrectOption}>
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Option A</SelectItem>
                        <SelectItem value="1">Option B</SelectItem>
                        <SelectItem value="2">Option C</SelectItem>
                        <SelectItem value="3">Option D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-button"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save size={16} />
                      {isEditMode ? 'Update Question' : 'Save to Database'}
                    </span>
                  )}
                </Button>
                {isEditMode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.navigate({ to: '/question-bank' })}
                    className="h-11 rounded-lg"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
