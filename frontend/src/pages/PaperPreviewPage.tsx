import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from '@tanstack/react-router';
import { useGetAllSubjects, useGetAllQuestions } from '../hooks/useQueries';
import { Category, type Question } from '../backend';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Printer } from 'lucide-react';

interface StoredPaper {
  id: string;
  subjectId: string;
  subjectName: string;
  examDuration: string;
  totalMarks: number;
  createdAt: string;
  sets: string[];
}

const SETS = ['A', 'B', 'C', 'D', 'E'];

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getQuestionsForSet(questions: Question[], setLabel: string): Question[] {
  const seed = setLabel.charCodeAt(0);
  return seededShuffle(questions, seed);
}

function getCategoryMarks(cat: Category): number {
  const map: Record<Category, number> = {
    [Category.MCQ]: 1,
    [Category.Marks2]: 2,
    [Category.Marks4]: 4,
    [Category.Marks6]: 6,
    [Category.Marks8]: 8,
  };
  return map[cat] || 0;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function PaperPreviewPage() {
  const params = useParams({ strict: false }) as { paperId?: string };
  const router = useRouter();
  const paperId = params.paperId || '';
  const printRef = useRef<HTMLDivElement>(null);

  const { data: subjects } = useGetAllSubjects();
  const { data: allQuestions } = useGetAllQuestions();

  const [activeSet, setActiveSet] = useState('A');
  const [paperMeta, setPaperMeta] = useState<StoredPaper | null>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('qpg_papers') || '[]') as StoredPaper[];
      const found = stored.find((p) => p.id === paperId);
      if (found) setPaperMeta(found);
    } catch {
      // ignore
    }
  }, [paperId]);

  const subject = subjects?.find((s) => String(s.id) === paperMeta?.subjectId);

  const subjectQuestions = (allQuestions || []).filter(
    (q) => String(q.subjectId) === paperMeta?.subjectId
  );

  const setQuestions = getQuestionsForSet(subjectQuestions, activeSet);

  const mcqQuestions = setQuestions.filter((q) => q.category === Category.MCQ);
  const shortQuestions = setQuestions.filter(
    (q) => q.category === Category.Marks2 || q.category === Category.Marks4
  );
  const longQuestions = setQuestions.filter(
    (q) => q.category === Category.Marks6 || q.category === Category.Marks8
  );

  const handlePrint = () => {
    window.print();
  };

  if (!paperMeta) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Paper not found or still loading...</p>
          <Button
            onClick={() => router.navigate({ to: '/generated-papers' })}
            variant="outline"
            className="rounded-lg"
          >
            Back to Papers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Controls Bar — hidden on print */}
      <div className="no-print sticky top-0 z-40 bg-card border-b border-border shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => router.navigate({ to: '/generated-papers' })}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Papers
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground hidden sm:block">Set:</span>
            <Tabs value={activeSet} onValueChange={setActiveSet}>
              <TabsList className="h-8 rounded-lg bg-secondary">
                {SETS.map((s) => (
                  <TabsTrigger
                    key={s}
                    value={s}
                    className="h-7 px-3 text-xs font-semibold rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Set {s}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="rounded-lg gap-1.5 text-xs h-8"
            >
              <Printer size={14} />
              Print
            </Button>
            <Button
              onClick={handlePrint}
              size="sm"
              className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs h-8 shadow-button"
            >
              <Download size={14} />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Paper Content */}
      <div className="max-w-4xl mx-auto px-4 py-8" ref={printRef}>
        <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">

          {/* Academic Header */}
          <div className="bg-primary text-primary-foreground px-8 py-6">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="w-16 h-16 rounded-xl bg-white/15 border-2 border-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                  src="/assets/generated/college-logo.dim_200x200.png"
                  alt="College Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = 'none';
                    const parent = el.parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>';
                    }
                  }}
                />
              </div>

              {/* Title */}
              <div className="flex-1 text-center">
                <h1 className="text-xl font-bold text-white leading-tight">
                  Institute of Engineering &amp; Technology
                </h1>
                <p className="text-white/80 text-sm mt-0.5">
                  Department of Computer Science &amp; Engineering
                </p>
                <div className="mt-2 pt-2 border-t border-white/20">
                  <p className="text-white font-semibold text-base">
                    {subject?.name || paperMeta.subjectName}
                  </p>
                  {subject?.code && (
                    <p className="text-white/70 text-xs">{subject.code}</p>
                  )}
                </div>
              </div>

              {/* Set Badge */}
              <div className="text-right flex-shrink-0">
                <div className="bg-white/15 rounded-xl px-4 py-2 text-center border border-white/20">
                  <p className="text-white/70 text-xs font-medium">Set</p>
                  <p className="text-white font-bold text-2xl leading-none mt-0.5">{activeSet}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Paper Meta Row */}
          <div className="bg-secondary/50 px-8 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-border text-sm">
            <div className="flex items-center gap-6">
              <span className="text-muted-foreground">
                <strong className="text-foreground">Duration:</strong> {paperMeta.examDuration}
              </span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">Total Marks:</strong> {paperMeta.totalMarks}
              </span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">Questions:</strong> {subjectQuestions.length}
              </span>
            </div>
            <span className="text-muted-foreground text-xs">
              Date: {formatDate(paperMeta.createdAt)}
            </span>
          </div>

          {/* Instructions */}
          <div className="px-8 py-3 bg-amber-50 border-b border-amber-100">
            <p className="text-xs text-amber-800">
              <strong>Instructions:</strong> All questions are compulsory. Read each question carefully before answering.
              Attempt all sections. Write legibly and show all working where applicable.
            </p>
          </div>

          {/* Paper Body */}
          <div className="px-8 py-6 space-y-10">

            {/* Section A — MCQ */}
            {mcqQuestions.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                    A
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground text-base">
                      Section A – Multiple Choice Questions
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Each question carries 1 mark. Choose the most appropriate option.
                      ({mcqQuestions.length} × 1 = {mcqQuestions.length} Marks)
                    </p>
                  </div>
                </div>

                <div className="space-y-5 pl-12">
                  {mcqQuestions.map((q, idx) => (
                    <div key={String(q.id)} className="space-y-2">
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        <span className="font-bold mr-1">{idx + 1}.</span>
                        {q.questionText}
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          [1 Mark]
                        </span>
                      </p>
                      {q.options.length > 0 && (
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 pl-4">
                          {q.options.map((opt, oi) => (
                            <p key={oi} className="text-sm text-foreground">
                              <span className="font-semibold text-muted-foreground mr-1">
                                ({['a', 'b', 'c', 'd'][oi]})
                              </span>
                              {opt}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section B — Short Answer (2 & 4 Marks) */}
            {shortQuestions.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                    B
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground text-base">
                      Section B – Short Answer Questions
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Answer all questions. Questions carry 2 or 4 marks as indicated.
                      (
                      {shortQuestions.filter((q) => q.category === Category.Marks2).length} × 2 +{' '}
                      {shortQuestions.filter((q) => q.category === Category.Marks4).length} × 4 ={' '}
                      {shortQuestions.reduce((s, q) => s + getCategoryMarks(q.category), 0)} Marks
                      )
                    </p>
                  </div>
                </div>

                <div className="space-y-5 pl-12">
                  {shortQuestions.map((q, idx) => (
                    <div key={String(q.id)} className="space-y-1">
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        <span className="font-bold mr-1">{idx + 1}.</span>
                        {q.questionText}
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          [{getCategoryMarks(q.category)} Marks]
                        </span>
                      </p>
                      <div className="border-b border-dashed border-border mt-3 mb-1" />
                      <div className="border-b border-dashed border-border mt-3 mb-1" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section C — Long Answer (6 & 8 Marks) */}
            {longQuestions.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                    C
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground text-base">
                      Section C – Long Answer Questions
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Answer all questions. Questions carry 6 or 8 marks as indicated.
                      (
                      {longQuestions.filter((q) => q.category === Category.Marks6).length} × 6 +{' '}
                      {longQuestions.filter((q) => q.category === Category.Marks8).length} × 8 ={' '}
                      {longQuestions.reduce((s, q) => s + getCategoryMarks(q.category), 0)} Marks
                      )
                    </p>
                  </div>
                </div>

                <div className="space-y-6 pl-12">
                  {longQuestions.map((q, idx) => (
                    <div key={String(q.id)} className="space-y-1">
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        <span className="font-bold mr-1">{idx + 1}.</span>
                        {q.questionText}
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          [{getCategoryMarks(q.category)} Marks]
                        </span>
                      </p>
                      <div className="border-b border-dashed border-border mt-3 mb-1" />
                      <div className="border-b border-dashed border-border mt-3 mb-1" />
                      <div className="border-b border-dashed border-border mt-3 mb-1" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {mcqQuestions.length === 0 && shortQuestions.length === 0 && longQuestions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-medium">No questions available for this paper.</p>
                <p className="text-sm mt-1">
                  The subject may not have any questions in the database yet.
                </p>
              </div>
            )}
          </div>

          {/* Paper Footer */}
          <div className="px-8 py-4 border-t border-border bg-secondary/30 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {subject?.name || paperMeta.subjectName} — Set {activeSet}
            </span>
            <span className="font-medium">
              Total Marks: {paperMeta.totalMarks} | Duration: {paperMeta.examDuration}
            </span>
            <span>*** End of Paper ***</span>
          </div>
        </div>

        {/* Attribution — no-print */}
        <p className="no-print text-center text-xs text-muted-foreground mt-4">
          © {new Date().getFullYear()} QPG System &nbsp;·&nbsp; Built with{' '}
          <span className="text-red-500">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname || 'qpg-system'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
