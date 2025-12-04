import { Request, Response } from "express";
import { SubmissionService } from "../services/submission.service";
import { SubmissionRepository } from "../repositories/submission.repository";

const submissionRepository = new SubmissionRepository();
const submissionService = new SubmissionService(submissionRepository);

export const SubmissionController = {
    async createSubmission(req: Request, res: Response): Promise<void>{
        const submission = await submissionService.createSubmission(req.body);
        
        res.status(201).json({
            message: "Submission created succesfully",
            data: submission,
            success: true
        });
    },

    async getSubmissionById(req: Request, res: Response): Promise<void> {
        const submission = await submissionService.getSubmissionById(req.params.id);
        
        res.status(200).json({
            message: "Submission fetched successfully",
            data: submission,
            success: true
        });
    },

    async getSubmissionsByProblemId(req: Request, res: Response): Promise<void> {
        const submission = await submissionService.getSubmissionsByProblemId(req.params.id);
        
        res.status(201).json({
            message: "Submissions fetched successfully",
            data: submission,
            success: true
        });
    },

    async deleteSubmissionById(req: Request, res: Response): Promise<void> {
        const result = await submissionService.deleteSubmissionById(req.params.id);

        res.status(201).json({
            message: "Submission deleted successfully",
            data: result,
            success: true
        });
        
    },

    async updateSubmissionStatus(req: Request, res: Response): Promise<void> {
        const submission = await submissionService.updateSubmissionStatus(req.params.id, req.body.status, req.body.submissionData);
        
        res.status(201).json({
            message: "Submission status updated successfully",
            data: submission,
            success: true
        });
    }
}