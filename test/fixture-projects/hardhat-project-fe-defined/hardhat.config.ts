// We load the plugin here.
import { HardhatUserConfig } from "hardhat/types";

import "../../../src/index";

const config: HardhatUserConfig = {
  solidity: "0.7.3",
  defaultNetwork: "hardhat",
  fe: {
    version: "1.0.0",
  },
};

export default config;
