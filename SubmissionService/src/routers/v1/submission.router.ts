import express from "express";
import { validateRequestBody } from "../../validators";
import { createSubmissionSchema, updateSubmissionStatusSchema } from "../../validators/submission.validator";
import { SubmissionController } from "../../controllers/submission.controller";

const submissionRouter = express.Router();

submissionRouter.post(
    '/',
    validateRequestBody(createSubmissionSchema),
    SubmissionController.createSubmission);

submissionRouter.get(
    '/:id',
    SubmissionController.getSubmissionById);

submissionRouter.get(
    '/problem/:problemId',
    SubmissionController.getSubmissionsByProblemId);

submissionRouter.delete(
    '/:id',
    SubmissionController.deleteSubmissionById);

submissionRouter.put(
    '/:id',
    validateRequestBody(updateSubmissionStatusSchema),
    SubmissionController.updateSubmissionStatus);


export default submissionRouter;