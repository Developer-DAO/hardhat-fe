import type { Debugger } from "debug";
import { NomicLabsHardhatPluginError } from "hardhat/plugins";
import { DEBUG_NAMESPACE } from "./constants";

export class FePluginError extends NomicLabsHardhatPluginError {
  constructor(message: string, parent?: Error, shouldBeReported?: boolean) {
    super("hardhat-fe", message, parent, shouldBeReported);
  }
}

export function getLogger(suffix: string): Debugger {
  const debug = require("debug");
  return debug(`${DEBUG_NAMESPACE}:${suffix}`);
}
