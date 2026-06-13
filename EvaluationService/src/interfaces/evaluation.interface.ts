export interface TestCases {
    input: string;
    output: string;
}

export interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    editorial?: string;
    testcases: TestCases[];
    createdAt: Date;
    updatedAt: Date;
}

export interface EvaluationJob {
    submissionId: string;
    code: string;
    language: "python" | "cpp";
    problem: Problem;
}