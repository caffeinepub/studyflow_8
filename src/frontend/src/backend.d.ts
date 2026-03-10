import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Topic {
    id: string;
    createdAt: bigint;
    text: string;
    completed: boolean;
    subjectId: string;
}
export interface StudySession {
    date: string;
    stopCount: bigint;
    studySeconds: bigint;
    breakSeconds: bigint;
}
export interface Subject {
    id: string;
    name: string;
    createdAt: bigint;
}
export interface UserProfile {
    name: string;
}
export interface TodoItem {
    id: bigint;
    createdAt: bigint;
    text: string;
    completed: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSubject(name: string): Promise<Subject>;
    addTodo(text: string): Promise<{
        id: bigint;
        createdAt: bigint;
        text: string;
        completed: boolean;
    }>;
    addTopics(subjectId: string, texts: Array<string>): Promise<Array<Topic>>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteSubject(id: string): Promise<boolean>;
    deleteTodo(id: bigint): Promise<boolean>;
    deleteTopic(id: string): Promise<boolean>;
    ensureUser(): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailySessions(): Promise<Array<StudySession>>;
    getSubjects(): Promise<Array<Subject>>;
    getTodos(): Promise<Array<TodoItem>>;
    getTopics(): Promise<Array<Topic>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveDailySession(date: string, studySeconds: bigint, breakSeconds: bigint, stopCount: bigint): Promise<void>;
    toggleTodo(id: bigint): Promise<TodoItem>;
    toggleTopic(id: string): Promise<Topic>;
}
