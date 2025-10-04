import { ITestCase } from "../models/problem.model";

export interface CreateProblemDto {
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    editorial?: string;
    testcases: ITestCase[];
}

export interface UpdateProblemDto {
    title?: string;
    description?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    editorial?: string;
    testcases?: ITestCase[];
}

