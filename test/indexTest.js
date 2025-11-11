const assert = require("chai").assert;
const app = require("/Users/erickgomes/PROJETO_PRATICO_2_2025_2/src/index.js");

describe("App", function () {
  it("should have express app defined", function () {
    it("App should be defined", function () {
      assert.isDefined(app, "Express app is not defined");
    });
  });
});
