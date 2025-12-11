import { describe, it } from "node:test";
import assert from "node:assert";
import { NetworkClient } from "../src/NetworkClient.js";
import type { StrategyConfig } from "../src/strategies/requestStrategy.js";

const TEST_URLS = ["https://eth.merkle.io", "https://ethereum.publicnode.com"];

function isHexString(value: string): boolean {
  return typeof value === "string" && /^0x[0-9a-fA-F]*$/.test(value);
}

describe("NetworkClient - Constructor and Strategy", () => {
  it("should create NetworkClient with fallback strategy", () => {
    const config: StrategyConfig = {
      type: "fallback",
      rpcUrls: TEST_URLS,
    };

    const client = new NetworkClient(config);

    assert.strictEqual(client.getStrategyName(), "fallback", "Strategy name should be fallback");
    assert.ok(client.getStrategy(), "Strategy should be defined");
  });

  it("should create NetworkClient with parallel strategy", () => {
    const config: StrategyConfig = {
      type: "parallel",
      rpcUrls: TEST_URLS,
    };

    const client = new NetworkClient(config);

    assert.strictEqual(client.getStrategyName(), "parallel", "Strategy name should be parallel");
    assert.ok(client.getStrategy(), "Strategy should be defined");
  });

  it("should throw error with no RPC URLs", () => {
    assert.throws(
      () => {
        const config: StrategyConfig = {
          type: "fallback",
          rpcUrls: [],
        };
        new NetworkClient(config);
      },
      /at least one RPC URL/i,
      "Should throw error for empty RPC URLs",
    );
  });
});

describe("NetworkClient - Execute with Fallback Strategy", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should execute eth_chainId", async () => {
    const client = new NetworkClient(config);
    const result = await client.execute<string>("eth_chainId");

    assert.strictEqual(result.success, true, "Result should be successful");
    assert.ok(result.data, "Result should have data");
    assert.ok(isHexString(result.data), "chainId should be hex string");
    assert.strictEqual(result.metadata, undefined, "Fallback strategy should not have metadata");
  });

  it("should execute eth_blockNumber", async () => {
    const client = new NetworkClient(config);
    const result = await client.execute<string>("eth_blockNumber");

    assert.strictEqual(result.success, true, "Result should be successful");
    assert.ok(result.data, "Result should have data");
    assert.ok(isHexString(result.data), "blockNumber should be hex string");
  });

  it("should execute eth_gasPrice", async () => {
    const client = new NetworkClient(config);
    const result = await client.execute<string>("eth_gasPrice");

    assert.strictEqual(result.success, true, "Result should be successful");
    assert.ok(result.data, "Result should have data");
    assert.ok(isHexString(result.data), "gasPrice should be hex string");
  });

  it("should fallback to second provider if first fails", async () => {
    const configWithBadUrl: StrategyConfig = {
      type: "fallback",
      rpcUrls: ["https://invalid-url-12345.com", ...TEST_URLS],
    };

    const client = new NetworkClient(configWithBadUrl);
    const result = await client.execute<string>("eth_chainId");

    assert.strictEqual(result.success, true, "Should succeed with fallback");
    assert.ok(result.data, "Should have data from fallback provider");
  });

  it("should return errors if all providers fail", async () => {
    const configWithAllBadUrls: StrategyConfig = {
      type: "fallback",
      rpcUrls: ["https://invalid-url-1.com", "https://invalid-url-2.com"],
    };

    const client = new NetworkClient(configWithAllBadUrls);
    const result = await client.execute<string>("eth_chainId");

    assert.strictEqual(result.success, false, "Should fail when all providers fail");
    assert.ok(result.errors, "Should have errors");
    assert.ok(result.errors.length >= 2, "Should have errors from all providers");
  });
});

describe("NetworkClient - Execute with Parallel Strategy", () => {
  const config: StrategyConfig = {
    type: "parallel",
    rpcUrls: TEST_URLS,
  };

  it("should execute eth_chainId in parallel", async () => {
    const client = new NetworkClient(config);
    const result = await client.execute<string>("eth_chainId");

    assert.strictEqual(result.success, true, "Result should be successful");
    assert.ok(result.metadata, "Parallel strategy should have metadata");
    assert.strictEqual(result.metadata.strategy, "parallel", "Strategy should be parallel");
    assert.ok(Array.isArray(result.metadata.responses), "Metadata should have responses array");
    assert.ok(result.metadata.responses.length >= 2, "Should have responses from all providers");
    assert.strictEqual(
      typeof result.metadata.hasInconsistencies,
      "boolean",
      "Should have inconsistencies flag",
    );
  });

  it("should collect response times from all providers", async () => {
    const client = new NetworkClient(config);
    const result = await client.execute<string>("eth_blockNumber");

    assert.ok(result.metadata, "Should have metadata");
    assert.ok(result.metadata.responses, "Should have responses");

    for (const response of result.metadata.responses) {
      assert.ok(response.url, "Response should have URL");
      assert.ok(
        response.status === "success" || response.status === "error",
        "Response should have valid status",
      );
      assert.ok(typeof response.responseTime === "number", "Response should have response time");

      if (response.status === "success") {
        assert.ok(response.data !== undefined, "Successful response should have data");
        assert.ok(response.hash, "Successful response should have hash");
      } else {
        assert.ok(response.error, "Failed response should have error");
      }
    }
  });

  it("should detect inconsistencies when responses differ", async () => {
    const client = new NetworkClient(config);
    const result = await client.execute<any>("eth_getBlockByNumber", ["latest", false]);

    assert.ok(result.metadata, "Should have metadata");
    assert.strictEqual(
      typeof result.metadata.hasInconsistencies,
      "boolean",
      "Should have inconsistencies flag",
    );
    // Note: We can't guarantee inconsistencies will be detected as providers may return same data
  });

  it("should handle mixed success/failure responses", async () => {
    const configWithBadUrl: StrategyConfig = {
      type: "parallel",
      rpcUrls: ["https://invalid-url-12345.com", ...TEST_URLS],
    };

    const client = new NetworkClient(configWithBadUrl);
    const result = await client.execute<string>("eth_chainId");

    assert.strictEqual(result.success, true, "Should succeed if at least one provider works");
    assert.ok(result.metadata, "Should have metadata");

    const successfulResponses = result.metadata.responses.filter((r) => r.status === "success");
    const failedResponses = result.metadata.responses.filter((r) => r.status === "error");

    assert.ok(successfulResponses.length >= 2, "Should have successful responses");
    assert.ok(failedResponses.length >= 1, "Should have failed responses");
  });

  it("should return errors if all parallel providers fail", async () => {
    const configWithAllBadUrls: StrategyConfig = {
      type: "parallel",
      rpcUrls: ["https://invalid-url-1.com", "https://invalid-url-2.com"],
    };

    const client = new NetworkClient(configWithAllBadUrls);
    const result = await client.execute<string>("eth_chainId");

    assert.strictEqual(result.success, false, "Should fail when all providers fail");
    assert.ok(result.errors, "Should have errors");
    assert.ok(result.metadata, "Should have metadata even on failure");
  });
});

describe("NetworkClient - Execute with Complex Parameters", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should execute eth_getBlockByNumber with parameters", async () => {
    const client = new NetworkClient(config);
    const result = await client.execute<any>("eth_getBlockByNumber", ["latest", false]);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have block data");
    assert.ok(result.data.number, "Block should have number");
    assert.ok(result.data.hash, "Block should have hash");
    assert.ok(Array.isArray(result.data.transactions), "Block should have transactions");
  });

  it("should execute eth_getBalance with address parameter", async () => {
    const client = new NetworkClient(config);
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const result = await client.execute<string>("eth_getBalance", [zeroAddress, "latest"]);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have balance data");
    assert.ok(isHexString(result.data), "Balance should be hex string");
  });

  it("should execute eth_getLogs with filter object", async () => {
    const client = new NetworkClient(config);
    const result = await client.execute<any[]>("eth_getLogs", [
      { fromBlock: "latest", toBlock: "latest" },
    ]);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(Array.isArray(result.data), "Should return array of logs");
  });
});
