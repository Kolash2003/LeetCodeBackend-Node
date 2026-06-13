import { Document, Schema, model } from "mongoose";

export enum SubmissionStatus {
    TLE = "time_limit_exceeded",
    AC = "accepted",
    WA = "wrong_answer",
    PENDING = "pending",

}

export enum SubmissionLanguage {
    CPP = "cpp",
    PYTHON = "python",
}

export interface ISubmissionData {
    status: SubmissionStatus;
    output?: string;
}

export interface ISubmission extends Document {
    problemId: string;
    code: string;
    language: SubmissionLanguage;
    status: SubmissionStatus;
    submissionData: ISubmissionData;
    createdAt: Date;
    updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>({
    problemId: {
        type: String,
        required: [true, "Problem Id required for the submission"]
    },
    code: {
        type: String,
        required: [true, "Code is required for evaluation"]
    },
    language: {
        type: String,
        required: [true, "Language is required for evaluation"],
        enum: Object.values(SubmissionLanguage)
    },
    status: {
        type: String,
        required: true,
        default: SubmissionStatus.PENDING,
        enum: Object.values(SubmissionStatus)
    },
    submissionData: {
        type: Object,
        required: true,
        default: {}
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (_, record) => {
            delete (record as any).__v; // delete __v field
            (record as any).id = record._id; // add id field
            delete (record as any)._id; // delete _id field
            return record;
        }
    }
});

submissionSchema.index({ status: 1, createdAt: -1 });

export const Submission = model<ISubmission>("Submission", submissionSchema);