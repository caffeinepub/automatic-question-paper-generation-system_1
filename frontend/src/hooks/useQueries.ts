import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Category, Difficulty, type Subject, type Question } from '../backend';

// ─── Subjects ────────────────────────────────────────────────────────────────

export function useGetAllSubjects() {
  const { actor, isFetching } = useActor();
  return useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, code, description }: { name: string; code: string; description: string }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.addSubject(name, code, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

export function useUpdateSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, code, description }: { id: bigint; name: string; code: string; description: string }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.updateSubject(id, name, code, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

export function useDeleteSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.deleteSubject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}

// ─── Questions ────────────────────────────────────────────────────────────────

export function useGetAllQuestions() {
  const { actor, isFetching } = useActor();
  return useQuery<Question[]>({
    queryKey: ['questions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuestions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      subjectId: bigint;
      questionText: string;
      category: Category;
      difficulty: Difficulty;
      options: string[];
      correctOption: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.addQuestion(
        params.subjectId,
        params.questionText,
        params.category,
        params.difficulty,
        params.options,
        params.correctOption
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}

export function useUpdateQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      subjectId: bigint;
      questionText: string;
      category: Category;
      difficulty: Difficulty;
      options: string[];
      correctOption: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.updateQuestion(
        params.id,
        params.subjectId,
        params.questionText,
        params.category,
        params.difficulty,
        params.options,
        params.correctOption
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}

export function useDeleteQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.deleteQuestion(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}

// ─── Papers ───────────────────────────────────────────────────────────────────

export function useGeneratePaper() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      subjectId: bigint;
      examDuration: string;
      totalMarks: bigint;
      numOfQuestionsPerCategory: Array<[Category, bigint]>;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.generatePaper(
        params.subjectId,
        params.examDuration,
        params.totalMarks,
        params.numOfQuestionsPerCategory
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
    },
  });
}

export function useInitBackend() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not ready');
      return actor.init();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}
