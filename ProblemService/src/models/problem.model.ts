import mongoose, { Document } from "mongoose";

export interface ITeastCase {
    input: string;
    output: string;
}

export interface IProblem extends Document {
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    createdAt: Date;
    updatedAt: Date;
    editorial?: string;
    testcases: ITeastCase[];
}

const TestCaseSchema = new mongoose.Schema<ITeastCase>({
    input: {
        type: String,
        required: [true, "Input is required"],
        trim: true,
    },
    output: {
        type: String,
        required: [true, "Output is required"],
        trim: true,
    }
}, {
    // _id: false
});

const problemSchema = new mongoose.Schema<IProblem>({
    title: {
        type: String,
        required: [true, "Title is required"],
        maxLength: [100, "Title must be less than 100 characters"],
        trimp: true,
    },
    description: {
        type: String,
        enum: {
            values: ['easy', 'medium', 'hard'],
            message: "Invalid difficulty level"
        },
        default: 'easy',
        required: [true, "Difficulty level is required"]
    },
    editorial: {
        type: String,
        trim: true,
    },
    testcases: {
        type: [TestCaseSchema],
        required: [true, "Testcases are required"],
    }
}, {
    timestamps: true
});

problemSchema.index({ title: 1}, { unique: true });
problemSchema.index({ difficulty: 1 });

export const Problem = mongoose.model<IProblem>("Problem", problemSchema);