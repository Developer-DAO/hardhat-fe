import { subtask } from "hardhat/config";
import { TASK_COMPILE_GET_COMPILATION_TASKS } from "hardhat/builtin-tasks/task-names";

import "./type-extensions";

const TASK_COMPILE_FE: string = "compile:fe";

subtask(
  TASK_COMPILE_GET_COMPILATION_TASKS,
  async (_, __, runSuper): Promise<string[]> => {
      const otherTasks = await runSuper();
      return [...otherTasks, TASK_COMPILE_FE];
  }
);
