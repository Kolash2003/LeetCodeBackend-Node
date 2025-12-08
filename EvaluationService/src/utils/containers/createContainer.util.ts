import logger from "../../config/logger.config";
import Docker from "dockerode";

export interface CreateContainerOptions {
    imageName: string;
    cmdExecutable: string[];
    memeoryLimit: number;
}

export async function createNewDockerContainer(options: CreateContainerOptions) {
    try {
        const docker = new Docker();
        const container = await docker.createContainer({
            Image: options.imageName,
            Cmd: options.cmdExecutable,
            AttachStdin: true, // to allow stdin
            AttachStdout: true, // to allow stdout
            AttachStderr: true, // to allow stderr
            OpenStdin: true, // keep the input stream open even if input is provided
            Tty: false,
            HostConfig: {
                Memory: options.memeoryLimit,
                PidsLimit: 100, // to limit fork bombs
                CpuQuota: 50000, // to limit CPU usage
                CpuPeriod: 100000,
                SecurityOpt: [
                    "no-new-privileges:true"
                ], // to prevent privilege escalation
                NetworkMode: "none", // to prevent network access
            }
        });

        logger.info(`Container created successfully: ${container.id}`);
        return container;
    } catch (error) {
        logger.error(`Failed to create container: ${error}`);
        return null;
    }
}