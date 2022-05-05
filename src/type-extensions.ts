import "hardhat/types/config";

import { FeBuild } from "./types";

declare module "hardhat/types/config" {
  interface HardhatUserConfig {
    fe?: Partial<FeBuild>;
  }

  interface HardhatConfig {
    fe: FeBuild;
  }
}
