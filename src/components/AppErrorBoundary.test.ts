import React from "react";

import AppErrorBoundary from "./AppErrorBoundary";

describe("AppErrorBoundary logging", () => {
  const mutableEnv = process.env as { NODE_ENV?: string };
  const previousNodeEnv = mutableEnv.NODE_ENV;

  afterEach(() => {
    mutableEnv.NODE_ENV = previousNodeEnv;
    jest.restoreAllMocks();
  });

  it("logs detailed error information outside production", () => {
    mutableEnv.NODE_ENV = "development";
    const error = new Error("boom");
    const logSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

    const boundary = new AppErrorBoundary({ children: null as React.ReactNode });
    boundary.componentDidCatch(error);

    expect(logSpy).toHaveBeenCalledWith("AppErrorBoundary caught runtime error", error);
  });

  it("logs a sanitized error message in production", () => {
    mutableEnv.NODE_ENV = "production";
    const error = new Error("boom");
    const logSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

    const boundary = new AppErrorBoundary({ children: null as React.ReactNode });
    boundary.componentDidCatch(error);

    expect(logSpy).toHaveBeenCalledWith("AppErrorBoundary caught runtime error");
    expect(logSpy).not.toHaveBeenCalledWith("AppErrorBoundary caught runtime error", error);
  });
});
