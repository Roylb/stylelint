/* eslint no-console: off */
"use strict";
const cli = require("../../lib/cli");
const path = require("path");
const pkg = require("../../package.json");

describe("CLI", () => {
  let processRestore;
  let logRestore;

  beforeAll(() => {
    processRestore = Object.assign({}, process);
    logRestore = Object.assign({}, console);
    process.exit = exitCode => (process.exitCode = exitCode);
  });

  afterAll(() => {
    Object.assign(process, processRestore);
    Object.assign(console, logRestore);
  });

  beforeEach(function() {
    process.exitCode = undefined;
    console.log = jest.fn();
  });

  it("basic", () => {
    return cli([]).then(() => {
      expect(process.exitCode).toBe(2);
      expect(console.log.mock.calls).toHaveLength(1);
      const lastCallArgs = console.log.mock.calls.pop();
      expect(lastCallArgs).toHaveLength(1);
      expect(lastCallArgs.pop()).toMatch("Usage: stylelint [input] [options]");
    });
  });

  it("--help", () => {
    return Promise.resolve(cli(["--help"])).then(() => {
      expect(process.exitCode).toBe(0);
      expect(console.log.mock.calls).toHaveLength(1);
      const lastCallArgs = console.log.mock.calls.pop();
      expect(lastCallArgs).toHaveLength(1);
      expect(lastCallArgs.pop()).toMatch("Usage: stylelint [input] [options]");
    });
  });

  it("--version", () => {
    return Promise.resolve(cli(["--version"])).then(() => {
      expect(process.exitCode).toBe(undefined);
      expect(console.log.mock.calls).toHaveLength(1);
      const lastCallArgs = console.log.mock.calls.pop();
      expect(lastCallArgs).toHaveLength(1);
      expect(lastCallArgs.pop()).toMatch(pkg.version);
    });
  });

  it("There was some problem with the configuration file.", () => {
    const file = path.join(__dirname, "stylesheet.css");
    return cli([file]).then(
      () => {
        throw new Error("Unexpect!");
      },
      error => {
        expect(error).toHaveProperty(
          "message",
          "No configuration provided for " + file
        );
        expect(error).toHaveProperty("code", 78);
      }
    );
  });
});
