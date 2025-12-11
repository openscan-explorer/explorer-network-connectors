import { describe, it } from "node:test";
import assert from "node:assert";
import { StrategyFactory } from "../../src/strategies/requestStrategy.js";
import { FallbackStrategy } from "../../src/strategies/fallbackStrategy.js";
import { ParallelStrategy } from "../../src/strategies/parallelStrategy.js";
import type { StrategyConfig } from "../../src/strategies/requestStrategy.js";

const TEST_URLS = ["https://eth.merkle.io", "https://ethereum.publicnode.com"];

describe("StrategyFactory - Creation", () => {
  it("should create FallbackStrategy with fallback type", () => {
    const config: StrategyConfig = {
      type: "fallback",
      rpcUrls: TEST_URLS,
    };

    const strategy = StrategyFactory.create(config);

    assert.ok(strategy instanceof FallbackStrategy, "Should create FallbackStrategy instance");
    assert.strictEqual(strategy.getName(), "fallback", "Strategy name should be fallback");
  });

  it("should create ParallelStrategy with parallel type", () => {
    const config: StrategyConfig = {
      type: "parallel",
      rpcUrls: TEST_URLS,
    };

    const strategy = StrategyFactory.create(config);

    assert.ok(strategy instanceof ParallelStrategy, "Should create ParallelStrategy instance");
    assert.strictEqual(strategy.getName(), "parallel", "Strategy name should be parallel");
  });

  it("should throw error for empty RPC URLs", () => {
    assert.throws(
      () => {
        const config: StrategyConfig = {
          type: "fallback",
          rpcUrls: [],
        };
        StrategyFactory.create(config);
      },
      /at least one RPC URL/i,
      "Should throw error for empty RPC URLs",
    );
  });

  it("should throw error for unknown strategy type", () => {
    assert.throws(
      () => {
        const config: StrategyConfig = {
          // @ts-expect-error Testing invalid type
          type: "unknown",
          rpcUrls: TEST_URLS,
        };
        StrategyFactory.create(config);
      },
      /unknown strategy type/i,
      "Should throw error for unknown strategy type",
    );
  });

  it("should create strategy with single RPC URL", () => {
    const config: StrategyConfig = {
      type: "fallback",
      rpcUrls: [TEST_URLS[0]],
    };

    const strategy = StrategyFactory.create(config);

    assert.ok(strategy, "Should create strategy with single URL");
    assert.strictEqual(strategy.getName(), "fallback", "Strategy should be created correctly");
  });

  it("should create strategy with multiple RPC URLs", () => {
    const config: StrategyConfig = {
      type: "parallel",
      rpcUrls: [...TEST_URLS, "https://eth.llamarpc.com"],
    };

    const strategy = StrategyFactory.create(config);

    assert.ok(strategy, "Should create strategy with multiple URLs");
    assert.strictEqual(strategy.getName(), "parallel", "Strategy should be created correctly");
  });
});

describe("StrategyFactory - RpcUrlConfig Validation", () => {
  it("should accept valid RpcUrlConfig with url and name", () => {
    const config: StrategyConfig = {
      type: "fallback",
      rpcUrls: ["https://test.com"],
    };

    const strategy = StrategyFactory.create(config);

    assert.ok(strategy, "Should accept valid RpcUrlConfig");
  });

  it("should handle RPC URLs with different protocols", () => {
    const config: StrategyConfig = {
      type: "fallback",
      rpcUrls: ["https://secure.rpc.com", "http://localhost:8545"],
    };

    const strategy = StrategyFactory.create(config);

    assert.ok(strategy, "Should handle different protocols");
  });

  it("should handle RPC URLs with ports", () => {
    const config: StrategyConfig = {
      type: "parallel",
      rpcUrls: ["http://localhost:8545", "http://localhost:8546"],
    };

    const strategy = StrategyFactory.create(config);

    assert.ok(strategy, "Should handle URLs with ports");
  });
});
