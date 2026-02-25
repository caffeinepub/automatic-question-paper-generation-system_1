import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Question {
    id: bigint;
    correctOption?: bigint;
    difficulty: Difficulty;
    questionText: string;
    subjectId: bigint;
    category: Category;
    options: Array<string>;
}
export interface Subject {
    id: bigint;
    code: string;
    name: string;
    description: string;
}
export enum Category {
    MCQ = "MCQ",
    Marks2 = "Marks2",
    Marks4 = "Marks4",
    Marks6 = "Marks6",
    Marks8 = "Marks8"
}
export enum Difficulty {
    Easy = "Easy",
    Hard = "Hard",
    Medium = "Medium"
}
export interface backendInterface {
    addQuestion(subjectId: bigint, questionText: string, category: Category, difficulty: Difficulty, options: Array<string>, correctOption: bigint | null): Promise<bigint>;
    addSubject(name: string, code: string, description: string): Promise<bigint>;
    deleteQuestion(id: bigint): Promise<void>;
    deleteSubject(id: bigint): Promise<void>;
    generatePaper(subjectId: bigint, examDuration: string, totalMarks: bigint, numOfQuestionsPerCategory: Array<[Category, bigint]>): Promise<bigint>;
    getAllQuestions(): Promise<Array<Question>>;
    getAllSubjects(): Promise<Array<Subject>>;
    init(): Promise<void>;
    updateQuestion(id: bigint, subjectId: bigint, questionText: string, category: Category, difficulty: Difficulty, options: Array<string>, correctOption: bigint | null): Promise<void>;
    updateSubject(id: bigint, name: string, code: string, description: string): Promise<void>;
}
