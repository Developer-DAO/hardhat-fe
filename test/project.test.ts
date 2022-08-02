import path from "path";
import * as assert from "assert";
import * as fsExtra from "fs-extra";
import { DEFAULT_FE_VERSION, QUARTZ_VERSION } from "../src/constants";
import { useFixtureProject, useEnvironment, assertFileExists } from "./helpers";
import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";

describe("Default project tests", () => {
  beforeEach(function () {
    fsExtra.removeSync("artifacts");
    fsExtra.removeSync("cache");
  });

  describe("user config without fe config", function () {
    useFixtureProject("none-fe-config");
    useEnvironment();

    it("use default fe version", function () {
      assert.equal(this.hre.config.fe.version, DEFAULT_FE_VERSION);
    });
  });
  describe("fe config without version", function () {
    useFixtureProject("empty-fe-config");
    useEnvironment();

    it("use default fe version", function () {
      assert.equal(this.hre.config.fe.version, DEFAULT_FE_VERSION);
    });
  });
  describe("fe config with version", function () {
    useFixtureProject("fe-config-with-version");
    useEnvironment();

    it("use specified fe version", function () {
      assert.equal(this.hre.config.fe.version, "1.0.0");
    });
  });
  describe("compile ingot module", function () {
    // https://github.com/ethereum/fe/tree/master/crates/test-files/fixtures/ingots/basic_ingot
    useFixtureProject("basic_ingot");
    useEnvironment();

    it("The specified version must be used", function () {
      assert.equal(this.hre.config.fe.version, QUARTZ_VERSION);
    });
    it("should compile and emit artifacts", async function () {
      await this.hre.run(TASK_COMPILE);

      assertFileExists(path.join("artifacts", "src", "main.fe", "Foo.json"));
    });
  });
  describe("compile separated modules", function () {
    // bunch of files need to be compiled
    this.timeout(15000);
    // https://github.com/cburgdorf/bountiful
    useFixtureProject("bountiful");
    useEnvironment();

    it("The specified version must be used", function () {
      assert.equal(this.hre.config.fe.version, QUARTZ_VERSION);
    });
    it("should compile and emit artifacts", async function () {
      await this.hre.run(TASK_COMPILE);

      assertFileExists(path.join("artifacts", "contracts", "BountyRegistry.fe", "BountyRegistry.json"));
      assertFileExists(path.join("artifacts", "contracts", "BountyRegistry.fe", "ISolvable.json"));
      assertFileExists(path.join("artifacts", "contracts", "Game_i8.fe", "Game.json"));
      assertFileExists(path.join("artifacts", "contracts", "Game_i8.fe", "ILockValidator.json"));
      assertFileExists(path.join("artifacts", "contracts", "Game.fe", "Game.json"));
      assertFileExists(path.join("artifacts", "contracts", "Game.fe", "ILockValidator.json"));
    });
  });
  describe("compile with 0.19.1-alpha 'Sunstone' compiler", function () {
    this.timeout(15000);
    useFixtureProject("sunstone_compiler");
    useEnvironment();

    it("The specified version must be used", function () {
      assert.equal(this.hre.config.fe.version, DEFAULT_FE_VERSION);
    });
    it("should compile and emit artifacts", async function () {
      await this.hre.run(TASK_COMPILE);

      assertFileExists(path.join("artifacts", "contracts", "main.fe", "FooBar.json"));
      assertFileExists(path.join("artifacts", "contracts", "main.fe", "FooBarBing.json"));
      assertFileExists(path.join("artifacts", "contracts", "main.fe", "GuestBook.json"));
    });
  });
});
