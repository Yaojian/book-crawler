import { Command, Option } from "commander";
import { crawlerProgram } from "../cmd-args";

describe("cmd-args", () => {
  it("empty args", () => {
    const p = new Command("test-commander");
    const res = p.parse(["--first=1"]);
    const opts = res.opts();
    console.log("opts:\n", opts);
  });

  it("default option value", () => {
    const p = new Command();
    p.addOption(new Option("--port [number]", "port number").default("80"));
    const x = p.parse(["node", "test", "--port", "80"]);
    expect(x.opts().port).toBe("80");
  });

  describe("help", () => {
    it("help", () => {
      const program = crawlerProgram().exitOverride();
      const hi = program.helpInformation();
      console.log(hi);
    });
    it("--help list", () => {
      const helpListArgs = ["node", "test.js", "--help", "list"];
      const program = crawlerProgram().exitOverride();
      try {
        program.parse(helpListArgs);
      } catch (err: unknown) {
        console.log(err);
      }
    });
  });
});
