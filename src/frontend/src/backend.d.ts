import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TodoItem {
    id: bigint;
    createdAt: bigint;
    text: string;
    completed: boolean;
}
export interface StudySession {
    date: string;
    stopCount: bigint;
    studySeconds: bigint;
    breakSeconds: bigint;
}
export interface backendInterface {
    addTodo(text: string): Promise<{
        id: bigint;
        createdAt: bigint;
        text: string;
        completed: boolean;
    }>;
    deleteTodo(id: bigint): Promise<boolean>;
    getDailySessions(): Promise<Array<StudySession>>;
    getTodos(): Promise<Array<TodoItem>>;
    saveDailySession(date: string, studySeconds: bigint, breakSeconds: bigint, stopCount: bigint): Promise<void>;
    toggleTodo(id: bigint): Promise<TodoItem>;
}
