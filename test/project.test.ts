import {useEnvironment} from "./helpers";
import * as assert from "assert";
import {DEFAULT_FE_VERSION} from "../src/constants";

describe("Default project tests", () => {
  describe("use fe environment without version", function () {
    useEnvironment("hardhat-project-fe-without-version");
    it("Set the default FE version automatically", function () {
      // @ts-ignore
      assert.equal(this.hre.config.fe.version, DEFAULT_FE_VERSION);
    });
  });
  describe("use environment without fe settings", function () {
    useEnvironment("hardhat-project");
    it("Set the default FE version automatically", function () {
      // @ts-ignore
      assert.equal(this.hre.config.fe.version, DEFAULT_FE_VERSION);
    });
  });
  describe("use environment with fe version", function () {
    useEnvironment("hardhat-project-fe-defined");
    it("The specified version must be used", function () {
      // @ts-ignore
      assert.equal(this.hre.config.fe.version, "1.0.0");
    });
  });
});
