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
    id: bigint;
    title: string;
    order: bigint;
    subjectId: bigint;
    notes: string;
    videoUrl: string;
}
export interface Bookmark {
    userId: Principal;
    topicId: bigint;
}
export interface Subject {
    id: bigint;
    order: bigint;
    name: string;
    description: string;
    colorTag: string;
    iconEmoji: string;
}
export interface UserProfile {
    name: string;
}
export interface RecentlyWatched {
    videoPositionSeconds: bigint;
    userId: Principal;
    watchedAt: bigint;
    topicId: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBookmark(topicId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createSubject(subject: Subject): Promise<void>;
    createTopic(topic: Topic): Promise<void>;
    deleteSubject(id: bigint): Promise<void>;
    deleteTopic(id: bigint): Promise<void>;
    getAllSubjects(): Promise<Array<Subject>>;
    getBookmarks(): Promise<Array<Bookmark>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getRecentlyWatched(): Promise<Array<RecentlyWatched>>;
    getTopicsBySubject(subjectId: bigint): Promise<Array<Topic>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordRecentlyWatched(topicId: bigint, videoPositionSeconds: bigint): Promise<void>;
    removeBookmark(topicId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchTopicsByKeyword(keyword: string): Promise<Array<Topic>>;
    updateSubject(subject: Subject): Promise<void>;
    updateTopic(topic: Topic): Promise<void>;
}
