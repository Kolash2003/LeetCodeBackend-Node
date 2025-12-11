import express from 'express';
import { serverConfig } from './config';
import v1Router from './routers/v1/index.router';
import v2Router from './routers/v2/index.router';
import { appErrorHandler, genericErrorHandler } from './middlewares/error.middleware';
import logger from './config/logger.config';
import { attachCorrelationIdMiddleware } from './middlewares/correlation.middleware';
import { startWorkers } from './workers/evaluation.worker';
import { pullAllImages } from './utils/containers/pullImage.util';
import { runCode } from './utils/containers/codeRunner.util';

const app = express();

app.use(express.json());
app.use(attachCorrelationIdMiddleware);

app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);


app.use(appErrorHandler);
app.use(genericErrorHandler);

app.listen(serverConfig.PORT, async () => {
    logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
    logger.info(`Press Ctrl+C to stop the server.`);

    await startWorkers();
    logger.info(`Worker started successfully`);

    const result = await pullAllImages();

    if (result.failed.length > 0) {
        logger.error(`Image pull failures: ${JSON.stringify(result.failed, null, 2)}`);
        process.exit(1);
    }

    logger.info("All required images pulled successfully");

    // await createNewDockerContainer({
    //     imageName: PYTHON_IMAGE,
    //     cmdExecutable: ['/bin/bash', '-c', 'tail -f /var/log/dmesg'],
    //     memeoryLimit: 1024 * 1024 * 1024, // 2 GB
    // })

    await testPythonCode();
});


async function testPythonCode() {
    const pythonCode = `import time
i = 0
while True:
    i += 1
    print(i)
    time.sleep(1)
print("Bye")`;

    await runCode({
        code: pythonCode,
        language: "python",
        timeout: 1000 * 3
    });
}
