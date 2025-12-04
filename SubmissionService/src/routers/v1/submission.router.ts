import express from "express";
import { validateRequestBody } from "../../validators";
import { ProblemSubmissionSchema } from "../../validators/submission.validator";
import { SubmissionController } from "../../controllers/submission.controller";


const submissionRouter = express.Router();

submissionRouter.post(
    '/', 
    validateRequestBody(ProblemSubmissionSchema), 
    SubmissionController.createSubmission);

submissionRouter.get(
    '/:id', 
    SubmissionController.getSubmissionById);

submissionRouter.get(
    '/:problemId', 
    SubmissionController.getSubmissionsByProblemId);

submissionRouter.delete(
    '/:id', 
    SubmissionController.deleteSubmissionById);

submissionRouter.put(
    '/:id',
    validateRequestBody(ProblemSubmissionSchema),
    SubmissionController.updateSubmissionStatus);


export default submissionRouter;