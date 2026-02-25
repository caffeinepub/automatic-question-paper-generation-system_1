import DashboardLayout from '../components/DashboardLayout';
import { useGetAllSubjects, useGetAllQuestions } from '../hooks/useQueries';
import { BookOpen, FileText, Files, Database, ArrowRight, Layers, Cpu, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';
import { Category } from '../backend';

function getPapersCount(): number {
  try {
    const stored = localStorage.getItem('qpg_papers');
    if (!stored) return 0;
    return JSON.parse(stored).length;
  } catch {
    return 0;
  }
}

function getCategoryLabel(cat: Category): string {
  const map: Record<Category, string> = {
    [Category.MCQ]: 'MCQ',
    [Category.Marks2]: '2 Marks',
    [Category.Marks4]: '4 Marks',
    [Category.Marks6]: '6 Marks',
    [Category.Marks8]: '8 Marks',
  };
  return map[cat] || cat;
}

export default function DashboardPage() {
  const { data: subjects, isLoading: subjectsLoading } = useGetAllSubjects();
  const { data: questions, isLoading: questionsLoading } = useGetAllQuestions();
  const papersCount = getPapersCount();

  const statCards = [
    {
      title: 'Total Subjects',
      value: subjects?.length ?? 0,
      icon: <BookOpen size={24} />,
      color: 'bg-blue-50 text-blue-600',
      loading: subjectsLoading,
      link: '/manage-subjects',
    },
    {
      title: 'Total Questions',
      value: questions?.length ?? 0,
      icon: <Database size={24} />,
      color: 'bg-indigo-50 text-indigo-600',
      loading: questionsLoading,
      link: '/question-bank',
    },
    {
      title: 'Papers Generated',
      value: papersCount,
      icon: <Files size={24} />,
      color: 'bg-emerald-50 text-emerald-600',
      loading: false,
      link: '/generated-papers',
    },
  ];

  // Category breakdown
  const categoryBreakdown = questions
    ? Object.values(Category).map((cat) => ({
        label: getCategoryLabel(cat),
        count: questions.filter((q) => q.category === cat).length,
      }))
    : [];

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome Banner */}
      <div className="bg-primary rounded-2xl p-6 mb-6 text-primary-foreground relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute right-16 bottom-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-1">Good day,</p>
          <h2 className="text-2xl font-bold text-white mb-1">
            Welcome, {localStorage.getItem('qpg_teacher_name') || 'Teacher'}!
          </h2>
          <p className="text-white/70 text-sm">
            Manage your question bank and generate professional exam papers.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {statCards.map((card) => (
          <Link key={card.title} to={card.link}>
            <Card className="shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer group border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">{card.title}</p>
                    {card.loading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground">{card.value}</p>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                    {card.icon}
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3 text-xs text-accent font-medium group-hover:gap-2 transition-all">
                  <span>View details</span>
                  <ChevronRight size={12} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category Breakdown */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Layers size={18} className="text-accent" />
              Questions by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {questionsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {categoryBreakdown.map((item) => {
                  const total = questions?.length || 1;
                  const pct = Math.round((item.count / total) * 100);
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-20 flex-shrink-0">{item.label}</span>
                      <div className="flex-1 bg-secondary rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground w-8 text-right">{item.count}</span>
                    </div>
                  );
                })}
                {categoryBreakdown.every((c) => c.count === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No questions added yet. <Link to="/add-question" className="text-accent hover:underline">Add questions</Link>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Subjects */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookOpen size={18} className="text-accent" />
              Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subjectsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {subjects?.slice(0, 8).map((s) => (
                  <div key={String(s.id)} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.code}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {questions?.filter((q) => q.subjectId === s.id).length ?? 0} Qs
                    </span>
                  </div>
                ))}
                {(!subjects || subjects.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No subjects found. <Link to="/manage-subjects" className="text-accent hover:underline">Add subjects</Link>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Database Flow Visualization */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Cpu size={18} className="text-accent" />
            System Architecture Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2 py-4">
            {[
              { label: 'Subjects', sub: 'Database', icon: <BookOpen size={20} />, color: 'bg-blue-50 border-blue-200 text-blue-700' },
              { label: 'Question Categories', sub: 'MCQ, 2M, 4M, 6M, 8M', icon: <Layers size={20} />, color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
              { label: 'Stored Questions', sub: 'Question Bank', icon: <Database size={20} />, color: 'bg-violet-50 border-violet-200 text-violet-700' },
              { label: 'Paper Generation', sub: 'Engine', icon: <Cpu size={20} />, color: 'bg-amber-50 border-amber-200 text-amber-700' },
              { label: 'PDF Output', sub: 'Sets A–E', icon: <FileText size={20} />, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
            ].map((step, idx, arr) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 ${step.color} min-w-[110px] text-center`}>
                  <div className="opacity-80">{step.icon}</div>
                  <p className="text-xs font-bold leading-tight">{step.label}</p>
                  <p className="text-xs opacity-70 leading-tight">{step.sub}</p>
                </div>
                {idx < arr.length - 1 && (
                  <ArrowRight size={18} className="text-muted-foreground flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
