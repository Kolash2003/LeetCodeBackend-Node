import { createNewDockerContainer } from "./createContainer.util";
import { commands } from "./commands.util";

interface RunCodeOptions {
    code: string;
    language: "python" | "cpp",
    timeout: number,
    imageName: string,
}

export async function runCode(options: RunCodeOptions) {

    const { code, language, timeout, imageName } = options;

    const container = await createNewDockerContainer({
        imageName: imageName,
        cmdExecutable: commands[language](code, "5"),
        memeoryLimit: 1024 * 1024 * 1024, // 1GB
    });

    const timeLimitExceedTimeOut = setTimeout(async () => {
        console.log("Time Limit Exceeded");
        container?.kill();
    }, timeout);

    console.log("Container created successfully", container?.id);
    await container?.start();

    const status = await container?.wait();
    console.log("Container status", status);

    const logs = await container?.logs({
        stdout: true,
        stderr: true,
    });

    const containerLogs = processLogs(logs);

    console.log(containerLogs);

    await container?.remove();

    clearTimeout(timeLimitExceedTimeOut);

    if (status && status.StatusCode == 0) {
        console.log("Container exited successfully");
    } else {
        console.log("Container exited with error");
    }

}

function processLogs(logs: Buffer | undefined) {
    return logs?.toString('utf-8')
        .replace(/\x00/g, '') // Remove null bytes
        .replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, '') // Remove control characters except \n (0x0A)
        .trim();

}