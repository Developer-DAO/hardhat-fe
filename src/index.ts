import { extendConfig, subtask, types } from "hardhat/config";
import { getCompilersDir } from "hardhat/internal/util/global-dir";
import { TASK_COMPILE_GET_COMPILATION_TASKS } from "hardhat/builtin-tasks/task-names";
import {
  TASK_COMPILE_FE,
  TASK_COMPILE_FE_GET_BUILD,
  TASK_COMPILE_FE_RUN_BINARY,
  TASK_COMPILE_FE_LOG_DOWNLOAD_COMPILER_START,
  TASK_COMPILE_FE_LOG_DOWNLOAD_COMPILER_END,
} from "./task-names";
import { compile } from "./compile";
import { CompilerDownloader } from "./downloader";
import { DEFAULT_FE_VERSION } from "./constants";

import "./type-extensions";
import { FeBuild } from "./types";
import { FePluginError } from "./util";
import { Artifacts, HardhatConfig } from "hardhat/types";

extendConfig((config, userConfig) => {
  const defaultConfig = userConfig.fe ?? { version: DEFAULT_FE_VERSION};
  config.fe = { ...defaultConfig, ...config.fe };
});

subtask(
  TASK_COMPILE_GET_COMPILATION_TASKS,
  async (_, __, runSuper): Promise<string[]> => {
      const otherTasks = await runSuper();
      return [...otherTasks, TASK_COMPILE_FE];
  }
);

subtask(TASK_COMPILE_FE)
  .addParam("quiet", undefined, undefined, types.boolean)
  .setAction(
    async ({ quiet }: { quiet: boolean }, { artifacts, config, run }) => {
      const feVersion = config.fe.version;
      const feBuild: FeBuild = await run(TASK_COMPILE_FE_GET_BUILD, {
        quiet,
        feVersion,
      });

      await run(
        TASK_COMPILE_FE_RUN_BINARY,
        {
          fePath: feBuild.compilerPath,
          artifacts: artifacts,
          config: config
        }
      );
    }
  );

subtask(TASK_COMPILE_FE_RUN_BINARY)
  .addParam("fePath", undefined, undefined, types.string)
  .setAction(
    async ({
      fePath,
      artifacts,
      config
    }: {
      fePath: string;
      artifacts: Artifacts,
      config: HardhatConfig
    }) => {
      await compile(fePath, config.paths, artifacts);
    }
  );

subtask(TASK_COMPILE_FE_GET_BUILD)
  .addParam("quiet", undefined, undefined, types.boolean)
  .addParam("feVersion", undefined, undefined, types.string)
  .setAction(async (
    { quiet, feVersion }: { quiet: boolean; feVersion: string },
    { run }
  ): Promise<FeBuild> => {
    const compilersCache = await getCompilersDir();
    const downloader = new CompilerDownloader(compilersCache);

    await downloader.initCompilersList();

    const isDownloaded = downloader.isCompilerDownloaded(feVersion);

    await run(TASK_COMPILE_FE_LOG_DOWNLOAD_COMPILER_START, {
      feVersion,
      isDownloaded,
      quiet,
    });

    const compilerPath = await downloader.getOrDownloadCompiler(feVersion);

    if (compilerPath === undefined) {
      throw new FePluginError("Can't download fe compiler");
    }

    await run(TASK_COMPILE_FE_LOG_DOWNLOAD_COMPILER_END, {
      feVersion,
      isDownloaded,
      quiet,
    });

    return { compilerPath, version: feVersion };
  }
);

subtask(TASK_COMPILE_FE_LOG_DOWNLOAD_COMPILER_START)
  .addParam("quiet", undefined, undefined, types.boolean)
  .addParam("isDownloaded", undefined, undefined, types.boolean)
  .addParam("feVersion", undefined, undefined, types.string)
  .setAction(
    async ({
      quiet,
      isDownloaded,
      feVersion,
    }: {
      quiet: boolean;
      isDownloaded: boolean;
      feVersion: string;
    }) => {
      if (isDownloaded || quiet) return;

      console.log(`Downloading compiler ${feVersion}`);
    }
  );

subtask(TASK_COMPILE_FE_LOG_DOWNLOAD_COMPILER_END)
  .addParam("quiet", undefined, undefined, types.boolean)
  .addParam("isDownloaded", undefined, undefined, types.boolean)
  .addParam("feVersion", undefined, undefined, types.string)
  .setAction(
    async ({}: {
      quiet: boolean;
      isDownloaded: boolean;
      feVersion: string;
    }) => {}
  );