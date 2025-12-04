import axios from "axios";
import { AxiosResponse } from "axios";
import { serverConfig } from "../config";
import { InternalServerError } from "../utils/errors/app.error";
import logger from "../config/logger.config";

export interface ITestCase {
    input: string;
    output: string;
}

export interface IProblemDetails {
    id: string;
    title: string;
    difficulty: string;
    editorial?: string;
    createdAt: Date;
    updatedAt: Date;
    testcases: ITestCase[];
}

export interface IProblemResponse {
    message: string;
    data: IProblemDetails;
    success: boolean;
}

export async function getProblemById(problemId: string): Promise<IProblemDetails | null> {
    try {

        // improve the axios api error handling
        const response: AxiosResponse<IProblemResponse> =
            await axios.get(`${serverConfig.PROBLEM_SERVICE}/problems/${problemId}`);

        if (response.data.success) {
            return response.data.data;
        }

        throw new InternalServerError("Failed to get problem details");

    } catch (error) {
        logger.error(`Failed to get Problem datails : ${error}`);
        return null;
    }
}