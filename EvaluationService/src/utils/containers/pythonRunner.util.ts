import { createNewDockerContainer } from "./createContainer.util";
import { PYTHON_IMAGE } from "../constants";

export async function runPythonCode(code: string) {
    const runCommnad = `echo '${code}' > code.py && python3 code.py`;

    const container = await createNewDockerContainer({
        imageName: PYTHON_IMAGE,
        cmdExecutable: ["/bin/bash", "-c", runCommnad],
        memeoryLimit: 1024 * 1024 * 1024, // 1GB
    });

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
}