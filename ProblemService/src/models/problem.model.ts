import mongoose, { Document } from "mongoose";

export interface ITestCase {
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
    testcases: ITestCase[];
}

const TestCaseSchema = new mongoose.Schema<ITestCase>({
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
        required: [true, "Description is required"],
        trim: true,
    },
    difficulty: {
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
    timestamps: true,
    toJSON: {
        transform: (_, record) => {
            delete (record as any).__v;  // delete __v feild
            record.id = record._id; // add id feild
            delete record._id; // delete _id feild
            return record;
        }
    }
});

problemSchema.index({ title: 1 }, { unique: true });
problemSchema.index({ difficulty: 1 });

export const Problem = mongoose.model<IProblem>("Problem", problemSchema);