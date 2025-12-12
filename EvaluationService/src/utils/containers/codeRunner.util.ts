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
        cmdExecutable: commands[language](code),
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

    console.log(logs?.toString());

    await container?.remove();

    clearTimeout(timeLimitExceedTimeOut);

    if (status.StatusCode == 0) {
        console.log("Container exited successfully");
    } else {
        console.log("Container exited with error");
    }

}