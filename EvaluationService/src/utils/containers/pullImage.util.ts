import fs from "fs";
import Docker from "dockerode";
import logger from "../../config/logger.config";
import { PYTHON_IMAGE } from "../constants";

const SOCKET = process.env.DOCKER_SOCKET || "/var/run/docker.sock";
const TIMEOUT_MS = 2 * 60 * 1000;

function hasDockerAccess(): boolean {
    if (process.env.DOCKER_HOST) return true;
    try {
        return fs.existsSync(SOCKET);
    } catch {
        return false;
    }
}

function createClient(): Docker {
    if (process.env.DOCKER_HOST) return new Docker({ host: process.env.DOCKER_HOST });
    return new Docker();
}

export function pullImage(image: string): Promise<any> {
    if (!hasDockerAccess()) {
        const errMsg = `Docker access missing. Cannot pull ${image}`;
        logger.warn?.(errMsg);
        return Promise.reject(new Error(errMsg));
    }

    const docker = createClient();

    return new Promise((resolve, reject) => {
        let finished = false;
        const timer = setTimeout(() => {
            finished = true;
            reject(new Error(`Pull timeout for ${image}`));
        }, TIMEOUT_MS);

        docker.pull(image, (err: Error | null, stream: NodeJS.ReadableStream | null) => {
            if (finished) return;
            if (err) {
                clearTimeout(timer);
                return reject(err);
            }
            if (!stream) {
                clearTimeout(timer);
                return reject(new Error(`No stream returned for ${image}`));
            }

            docker.modem.followProgress(
                stream,
                (finalErr, output) => {
                    clearTimeout(timer);
                    if (finalErr) return reject(finalErr);
                    logger.info?.(`Pulled ${image}`);
                    resolve(output);
                },
                (e) => {
                    if (e?.status) logger.debug?.(`[${image}] ${e.status} ${e.progress || ""}`);
                }
            );
        });
    });
}

export async function pullAllImages(): Promise<{
    pulled: string[];
    failed: { image: string; reason: any }[];
}> {
    const images: string[] = [PYTHON_IMAGE];

    const results: {
        pulled: string[];
        failed: { image: string; reason: any }[];
    } = { pulled: [], failed: [] };

    for (const image of images) {
        try {
            await pullImage(image);
            results.pulled.push(image);
        } catch (err) {
            results.failed.push({ image, reason: err });
            logger.error?.(`Failed pulling ${image}: ${err}`);
        }
    }

    return results;
}
