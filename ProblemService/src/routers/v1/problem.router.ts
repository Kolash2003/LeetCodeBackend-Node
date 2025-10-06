import express from "express";
import { validateRequestBody, validateRequestParams } from "../../validators";
import { CreateProblemSchema, findByDifficultySchema } from "../../validators/problem.validator";
import { ProblemController } from "../../controllers/problem.controller";

const problemRouter = express.Router();


problemRouter.post(
    '/', 
    validateRequestBody(CreateProblemSchema), 
    ProblemController.createProblem);

problemRouter.get(
    '/:id', 
    ProblemController.getProblemById);
problemRouter.get(
    '/', 
    ProblemController.getAllProblems);

problemRouter.put(
    '/:id', 
    ProblemController.updateProblem);

problemRouter.delete(
    '/:id', ProblemController.deleteProblem);

problemRouter.get(
    '/difficulty/:difficulty', 
    validateRequestParams(findByDifficultySchema),
    ProblemController.findByDifficulty);

problemRouter.get(
    '/search/:query', 
    ProblemController.searchProblems);

export default problemRouter;