import { useState, useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Files, Eye, Calendar, Clock, BookOpen, FileText } from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface StoredPaper {
  id: string;
  subjectId: string;
  subjectName: string;
  examDuration: string;
  totalMarks: number;
  createdAt: string;
  sets: string[];
}

export default function GeneratedPapersPage() {
  const router = useRouter();
  const [papers, setPapers] = useState<StoredPaper[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('qpg_papers') || '[]') as StoredPaper[];
      setPapers(stored.reverse()); // newest first
    } catch {
      setPapers([]);
    }
  }, []);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <DashboardLayout title="Generated Papers">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="page-title flex items-center gap-2">
              <Files size={22} className="text-accent" />
              Generated Papers
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {papers.length} paper{papers.length !== 1 ? 's' : ''} generated
            </p>
          </div>
          <Link to="/generate-paper">
            <Button className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-button gap-2">
              <FileText size={16} />
              Generate New Paper
            </Button>
          </Link>
        </div>

        {papers.length === 0 ? (
          <Card className="shadow-card border-border">
            <CardContent className="py-16 text-center">
              <Files size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Papers Generated Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate your first question paper to see it here.
              </p>
              <Link to="/generate-paper">
                <Button className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-button">
                  Generate Paper
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {papers.map((paper, idx) => (
              <Card key={paper.id} className="shadow-card border-border hover:shadow-card-hover transition-all duration-200">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen size={18} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm leading-tight">{paper.subjectName}</h3>
                        <p className="text-xs text-muted-foreground">Paper #{papers.length - idx}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs border-accent/30 text-accent bg-accent/5">
                      ID: {paper.id}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={12} />
                      <span>{paper.examDuration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileText size={12} />
                      <span>{paper.totalMarks} Marks</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground col-span-2">
                      <Calendar size={12} />
                      <span>{formatDate(paper.createdAt)}</span>
                    </div>
                  </div>

                  {/* Sets */}
                  <div className="flex items-center gap-1.5 mb-4">
                    <span className="text-xs text-muted-foreground">Sets:</span>
                    {paper.sets.map((set) => (
                      <span
                        key={set}
                        className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center"
                      >
                        {set}
                      </span>
                    ))}
                  </div>

                  <Button
                    onClick={() => router.navigate({ to: `/paper-preview/${paper.id}` })}
                    className="w-full h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm shadow-button gap-2"
                  >
                    <Eye size={14} />
                    View & Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
