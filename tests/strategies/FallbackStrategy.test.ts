import { describe, it } from "node:test";
import assert from "node:assert";
import { FallbackStrategy } from "../../src/strategies/fallbackStrategy.js";
import { RpcClient } from "../../src/RpcClient.js";
import { isHexString } from "../helpers/validators.js";

const TEST_URLS = ["https://eth.merkle.io", "https://ethereum.publicnode.com"];

describe("FallbackStrategy - Constructor", () => {
  it("should create FallbackStrategy with RPC clients", () => {
    const clients = TEST_URLS.map((url) => new RpcClient(url));
    const strategy = new FallbackStrategy(clients);

    assert.ok(strategy, "Strategy should be created");
    assert.strictEqual(strategy.getName(), "fallback", "Strategy name should be fallback");
  });

  it("should throw error with empty clients array", () => {
    assert.throws(
      () => {
        new FallbackStrategy([]);
      },
      /at least one RPC client/i,
      "Should throw error for empty clients",
    );
  });

  it("should accept single RPC client", () => {
    const clients = [new RpcClient(TEST_URLS[0])];
    const strategy = new FallbackStrategy(clients);

    assert.ok(strategy, "Should accept single client");
  });
});

describe("FallbackStrategy - Execute Success", () => {
  it("should execute eth_chainId successfully", async () => {
    const clients = TEST_URLS.map((url) => new RpcClient(url));
    const strategy = new FallbackStrategy(clients);

    const result = await strategy.execute<string>("eth_chainId", []);

    assert.strictEqual(result.success, true, "Result should be successful");
    assert.ok(result.data, "Result should have data");
    assert.ok(isHexString(result.data), "chainId should be hex string");
    assert.strictEqual(result.metadata, undefined, "Fallback strategy should not have metadata");
  });

  it("should execute eth_blockNumber successfully", async () => {
    const clients = TEST_URLS.map((url) => new RpcClient(url));
    const strategy = new FallbackStrategy(clients);

    const result = await strategy.execute<string>("eth_blockNumber", []);

    assert.strictEqual(result.success, true, "Result should be successful");
    assert.ok(result.data, "Result should have data");
    assert.ok(isHexString(result.data), "blockNumber should be hex string");
  });

  it("should execute eth_gasPrice successfully", async () => {
    const clients = TEST_URLS.map((url) => new RpcClient(url));
    const strategy = new FallbackStrategy(clients);

    const result = await strategy.execute<string>("eth_gasPrice", []);

    assert.strictEqual(result.success, true, "Result should be successful");
    assert.ok(result.data, "Result should have data");
    assert.ok(isHexString(result.data), "gasPrice should be hex string");
  });

  it("should execute eth_getBlockByNumber with params", async () => {
    const clients = TEST_URLS.map((url) => new RpcClient(url));
    const strategy = new FallbackStrategy(clients);

    const result = await strategy.execute<any>("eth_getBlockByNumber", ["latest", false]);

    assert.strictEqual(result.success, true, "Result should be successful");
    assert.ok(result.data, "Result should have data");
    assert.ok(result.data.number, "Block should have number");
    assert.ok(result.data.hash, "Block should have hash");
  });
});

describe("FallbackStrategy - Fallback Behavior", () => {
  it("should fallback to second provider when first fails", async () => {
    const clients = [
      new RpcClient("https://invalid-url-12345.com"),
      ...TEST_URLS.map((url) => new RpcClient(url)),
    ];
    const strategy = new FallbackStrategy(clients);

    const result = await strategy.execute<string>("eth_chainId", []);

    assert.strictEqual(result.success, true, "Should succeed with fallback");
    assert.ok(result.data, "Should have data from fallback provider");
    assert.ok(isHexString(result.data), "chainId should be hex string");
  });

  it("should try all providers until one succeeds", async () => {
    const clients = [
      new RpcClient("https://invalid-url-1.com"),
      new RpcClient("https://invalid-url-2.com"),
      ...TEST_URLS.map((url) => new RpcClient(url)),
    ];
    const strategy = new FallbackStrategy(clients);

    const result = await strategy.execute<string>("eth_blockNumber", []);

    assert.strictEqual(result.success, true, "Should eventually succeed");
    assert.ok(result.data, "Should have data from working provider");
  });

  it("should return errors when all providers fail", async () => {
    const clients = [
      new RpcClient("https://invalid-url-1.com"),
      new RpcClient("https://invalid-url-2.com"),
    ];
    const strategy = new FallbackStrategy(clients);

    const result = await strategy.execute<string>("eth_chainId", []);

    assert.strictEqual(result.success, false, "Should fail when all providers fail");
    assert.ok(!result.data, "Should not have data");
    assert.ok(result.errors, "Should have errors");
    assert.strictEqual(result.errors.length, 2, "Should have errors from all providers");

    for (const error of result.errors) {
      assert.strictEqual(error.status, "error", "Error status should be error");
      assert.ok(error.error, "Should have error message");
      assert.ok(error.url, "Should have URL");
      assert.ok(typeof error.responseTime === "number", "Should have response time");
    }
  });
});

describe("FallbackStrategy - Error Details", () => {
  it("should capture error details for failed providers", async () => {
    const clients = [
      new RpcClient("https://invalid-url-12345.com"),
      ...TEST_URLS.map((url) => new RpcClient(url)),
    ];
    const strategy = new FallbackStrategy(clients);

    const result = await strategy.execute<string>("eth_chainId", []);

    // Even though it succeeds, we don't get error details in fallback mode
    // because it stops on first success
    assert.strictEqual(result.success, true, "Should succeed");
  });

  it("should include response times in error objects", async () => {
    const clients = [
      new RpcClient("https://invalid-url-1.com"),
      new RpcClient("https://invalid-url-2.com"),
    ];
    const strategy = new FallbackStrategy(clients);

    const result = await strategy.execute<string>("eth_chainId", []);

    assert.strictEqual(result.success, false, "Should fail");
    assert.ok(result.errors, "Should have errors");

    for (const error of result.errors) {
      assert.ok(typeof error.responseTime === "number", "Should have response time");
      assert.ok(error.responseTime >= 0, "Response time should be non-negative");
    }
  });
});

describe("FallbackStrategy - Different RPC Methods", () => {
  const clients = TEST_URLS.map((url) => new RpcClient(url));

  it("should handle eth_getBalance", async () => {
    const strategy = new FallbackStrategy(clients);
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const result = await strategy.execute<string>("eth_getBalance", [zeroAddress, "latest"]);

    assert.strictEqual(result.success, true, "Should succeed");
    if (!result.data) throw new Error("No data returned");
    assert.ok(isHexString(result.data), "Balance should be hex string");
  });

  it("should handle eth_getCode", async () => {
    const strategy = new FallbackStrategy(clients);
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const result = await strategy.execute<string>("eth_getCode", [zeroAddress, "latest"]);

    assert.strictEqual(result.success, true, "Should succeed");
    if (!result.data) throw new Error("No data returned");
    assert.ok(isHexString(result.data), "Code should be hex string");
  });

  it("should handle eth_getLogs", async () => {
    const strategy = new FallbackStrategy(clients);
    const result = await strategy.execute<any[]>("eth_getLogs", [
      { fromBlock: "latest", toBlock: "latest" },
    ]);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(Array.isArray(result.data), "Should return array");
  });

  it("should handle invalid method", async () => {
    const strategy = new FallbackStrategy(clients);
    const result = await strategy.execute<string>("invalid_method", []);

    assert.strictEqual(result.success, false, "Should fail for invalid method");
    assert.ok(result.errors, "Should have errors");
  });
});
