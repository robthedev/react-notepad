import expect from "expect";
import React from "react";
import { render, unmountComponentAtNode } from "react-dom";

import Component from "src/";

describe("Minimal unit test", () => {
  it("informs the reader", () => {
    expect("test").toEqual("test");
  });
});
