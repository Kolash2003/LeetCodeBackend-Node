import { createNewDockerContainer } from "./createContainer.util";
import { commands } from "./commands.util";

interface RunCodeOptions {
    code: string;
    language: "python" | "cpp",
    timeout: number,
    imageName: string,
    input: string
}

export async function runCode(options: RunCodeOptions) {

    const { code, language, timeout, imageName, input } = options;


    const container = await createNewDockerContainer({
        imageName: imageName,
        cmdExecutable: commands[language](code, input),
        memeoryLimit: 1024 * 1024 * 1024, // 1GB
    });

    let isTimeLimitExceeded = false;
    const timeLimitExceedTimeOut = setTimeout(async () => {
        console.log("Time Limit Exceeded");
        isTimeLimitExceeded = true;
        container?.kill();
    }, timeout);

    await container?.start();

    const status = await container?.wait();

    if (isTimeLimitExceeded) {
        await container?.remove();
        return {
            status: "time_limit_exceeded",
            output: "Time Limit Exceeded"
        }
    }

    const logs = await container?.logs({
        stdout: true,
        stderr: true,
    });

    const containerLogs = processLogs(logs);

    await container?.remove();

    clearTimeout(timeLimitExceedTimeOut);

    if (status && status.StatusCode == 0) {
        return {
            status: "success",
            output: containerLogs
        }
    } else {
        return {
            status: "failed",
            output: containerLogs
        }
    }

}

function processLogs(logs: Buffer | undefined) {
    return logs?.toString('utf-8')
        .replace(/\x00/g, '') // Remove null bytes
        .replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, '') // Remove control characters except \n (0x0A)
        .trim();

}