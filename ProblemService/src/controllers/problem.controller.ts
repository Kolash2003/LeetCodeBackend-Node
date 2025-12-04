import { Request, Response } from "express";
import { ProblemService } from "../services/problems.service";
import { ProblemRepository } from "../repositories/problem.repository";

// export interface IProblemController {
//     createProblem(req: Request, res: Response): Promise<void>;
//     getProblemById(req: Request, res: Response): Promise<void>;
//     getAllProblems(req: Request, res: Response): Promise<void>;
//     updateProblem(req: Request, res: Response): Promise<void>;
//     deleteProblem(req: Request, res: Response): Promise<void>;
//     findByDifficulty(req: Request, res: Response): Promise<void>;
//     searchProblems(req: Request, res: Response): Promise<void>;
// }

const problemRepository = new ProblemRepository();
const problemService = new ProblemService(problemRepository)

export const ProblemController = {

    async createProblem(req: Request, res: Response): Promise<void> {

        const problem = await problemService.createProblem(req.body);

        res.status(201).json({
            message: "Problem created successfully",
            data: problem,
            sucess: true
        });
    },

    async getProblemById(req: Request, res: Response): Promise<void> {
        const problem = await problemService.getProblemById(req.params.id);

        res.status(200).json({
            message: "Problem fetched successfully",
            data: problem,
            sucess: true
        });
    },

    async getAllProblems(req: Request, res: Response): Promise<void> {
        const { problems, total } = await problemService.getAllProblems();

        res.status(200).json({
            message: "Problems fetched successfully",
            data: problems,
            total,
            sucess: true
        });
    },

    async updateProblem(req: Request, res: Response): Promise<void> {
        const problem = await problemService.updateProblem(req.params.id, req.body);

        res.status(200).json({
            message: "Problem updated successfully",
            data: problem,
            sucess: true
        });
    },

    async deleteProblem(req: Request, res: Response): Promise<void> {
        const result = await problemService.deleteProblem(req.params.id);

        res.status(200).json({
            message: "Problem deleted successfully",
            data: result,
            sucess: true
        });
    },

    async findByDifficulty(req: Request, res: Response): Promise<void> {
        const difficulty = req.params.difficulty as "easy" | "medium" | "hard";
        const problems = await problemService.findByDifficulty(difficulty);

        res.status(200).json({
            message: "Problems fetched successfully",
            data: problems,
            sucess: true
        });
    },

    async searchProblems(req: Request, res: Response): Promise<void> {
        const query = req.query.q as string;
        const problems = await problemService.searchProblems(query);

        res.status(200).json({
            message: "Problems fetched successfully",
            data: problems,
            sucess: true
        });
    }

}