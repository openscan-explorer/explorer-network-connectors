import { describe, it } from "node:test";
import assert from "node:assert";
import { ParallelStrategy } from "../../src/strategies/parallelStrategy.js";
import { RpcClient } from "../../src/RpcClient.js";

const TEST_URLS = ["https://eth.merkle.io", "https://ethereum.publicnode.com"];

describe("ParallelStrategy - Constructor", () => {
  it("should create ParallelStrategy with RPC clients", () => {
    const clients = TEST_URLS.map((url) => new RpcClient(url));
    const strategy = new ParallelStrategy(clients);

    assert.ok(strategy, "Strategy should be created");
    assert.strictEqual(strategy.getName(), "parallel", "Strategy name should be parallel");
  });

  it("should throw error with empty clients array", () => {
    assert.throws(
      () => {
        new ParallelStrategy([]);
      },
      /at least one RPC client/i,
      "Should throw error for empty clients",
    );
  });

  it("should accept single RPC client", () => {
    const clients = [new RpcClient(TEST_URLS[0])];
    const strategy = new ParallelStrategy(clients);

    assert.ok(strategy, "Should accept single client");
  });
});

describe("ParallelStrategy - Execute Success", () => {
  it("should execute eth_chainId in parallel", async () => {
    const clients = TEST_URLS.map((url) => new RpcClient(url));
    const strategy = new ParallelStrategy(clients);

    const result = await strategy.execute<string>("eth_chainId", []);

    assert.strictEqual(result.success, true, "Result should be successful");
    assert.ok(result.data, "Result should have data");
    assert.ok(result.metadata, "Should have metadata");
    assert.strictEqual(result.metadata.strategy, "parallel", "Strategy should be parallel");
    assert.ok(Array.isArray(result.metadata.responses), "Should have responses array");
    assert.strictEqual(
      result.metadata.responses.length,
      TEST_URLS.length,
      "Should have responses from all providers",
    );
  });

  it("should execute eth_blockNumber in parallel", async () => {
    const clients = TEST_URLS.map((url) => new RpcClient(url));
    const strategy = new ParallelStrategy(clients);

    const result = await strategy.execute<string>("eth_blockNumber", []);

    assert.strictEqual(result.success, true, "Result should be successful");
    assert.ok(result.metadata, "Should have metadata");
    assert.ok(result.metadata.responses.length >= 2, "Should have multiple responses");
  });

  it("should execute eth_gasPrice in parallel", async () => {
    const clients = TEST_URLS.map((url) => new RpcClient(url));
    const strategy = new ParallelStrategy(clients);

    const result = await strategy.execute<string>("eth_gasPrice", []);

    assert.strictEqual(result.success, true, "Result should be successful");
    assert.ok(result.metadata, "Should have metadata");
  });
});

describe("ParallelStrategy - Metadata Structure", () => {
  it("should include all required metadata fields", async () => {
    const clients = TEST_URLS.map((url) => new RpcClient(url));
    const strategy = new ParallelStrategy(clients);

    const result = await strategy.execute<string>("eth_chainId", []);

    assert.ok(result.metadata, "Should have metadata");
    assert.strictEqual(result.metadata.strategy, "parallel", "Should have strategy field");
    assert.ok(typeof result.metadata.timestamp === "number", "Should have timestamp");
    assert.ok(Array.isArray(result.metadata.responses), "Should have responses array");
    assert.strictEqual(
      typeof result.metadata.hasInconsistencies,
      "boolean",
      "Should have hasInconsistencies flag",
    );
  });

  it("should include response details for each provider", async () => {
    const clients = TEST_URLS.map((url) => new RpcClient(url));
    const strategy = new ParallelStrategy(clients);

    const result = await strategy.execute<string>("eth_blockNumber", []);

    assert.ok(result.metadata, "Should have metadata");

    for (const response of result.metadata.responses) {
      assert.ok(response.url, "Response should have URL");
      assert.ok(
        response.status === "success" || response.status === "error",
        "Response should have valid status",
      );
      assert.ok(typeof response.responseTime === "number", "Response should have response time");
      assert.ok(response.responseTime >= 0, "Response time should be non-negative");

      if (response.status === "success") {
        assert.ok(response.data !== undefined, "Successful response should have data");
        assert.ok(response.hash, "Successful response should have hash");
      } else {
        assert.ok(response.error, "Failed response should have error message");
      }
    }
  });

  it("should calculate response hashes", async () => {
    const clients = TEST_URLS.map((url) => new RpcClient(url));
    const strategy = new ParallelStrategy(clients);

    const result = await strategy.execute<string>("eth_chainId", []);

    assert.ok(result.metadata, "Should have metadata");

    const successfulResponses = result.metadata.responses.filter((r) => r.status === "success");
    assert.ok(successfulResponses.length >= 1, "Should have at least one successful response");

    for (const response of successfulResponses) {
      assert.ok(response.hash, "Successful response should have hash");
      assert.strictEqual(typeof response.hash, "string", "Hash should be string");
    }
  });
});

describe("ParallelStrategy - Inconsistency Detection", () => {
  it("should detect inconsistencies flag", async () => {
    const clients = TEST_URLS.map((url) => new RpcClient(url));
    const strategy = new ParallelStrategy(clients);

    const result = await strategy.execute<any>("eth_getBlockByNumber", ["latest", false]);

    assert.ok(result.metadata, "Should have metadata");
    assert.strictEqual(
      typeof result.metadata.hasInconsistencies,
      "boolean",
      "Should have hasInconsistencies flag",
    );
  });

  it("should not flag inconsistencies when all providers return same data", async () => {
    const clients = TEST_URLS.map((url) => new RpcClient(url));
    const strategy = new ParallelStrategy(clients);

    // chainId should be consistent across all providers
    const result = await strategy.execute<string>("eth_chainId", []);

    assert.ok(result.metadata, "Should have metadata");
    // chainId should be the same for all Ethereum mainnet providers
    assert.strictEqual(result.metadata.hasInconsistencies, false, "chainId should be consistent");
  });

  it("should handle single successful response without inconsistencies", async () => {
    const clients = TEST_URLS.map((url) => new RpcClient(url));
    const strategy = new ParallelStrategy(clients);

    const result = await strategy.execute<string>("eth_chainId", []);

    assert.ok(result.metadata, "Should have metadata");
    assert.strictEqual(
      result.metadata.hasInconsistencies,
      false,
      "Single response should not have inconsistencies",
    );
  });
});

describe("ParallelStrategy - Mixed Success and Failure", () => {
  it("should handle mix of successful and failed responses", async () => {
    const clients = [
      new RpcClient("https://invalid-url-12345.com"),
      ...TEST_URLS.map((url) => new RpcClient(url)),
    ];
    const strategy = new ParallelStrategy(clients);

    const result = await strategy.execute<string>("eth_chainId", []);

    assert.strictEqual(result.success, true, "Should succeed if at least one provider works");
    assert.ok(result.metadata, "Should have metadata");

    const successfulResponses = result.metadata.responses.filter((r) => r.status === "success");
    const failedResponses = result.metadata.responses.filter((r) => r.status === "error");

    assert.ok(successfulResponses.length >= 2, "Should have successful responses");
    assert.ok(failedResponses.length >= 1, "Should have failed responses");
  });

  it("should return all errors when all providers fail", async () => {
    const clients = [
      new RpcClient("https://invalid-url-1.com"),
      new RpcClient("https://invalid-url-2.com"),
    ];
    const strategy = new ParallelStrategy(clients);

    const result = await strategy.execute<string>("eth_chainId", []);

    assert.strictEqual(result.success, false, "Should fail when all providers fail");
    assert.ok(!result.data, "Should not have data");
    assert.ok(result.errors, "Should have errors");
    assert.strictEqual(result.errors.length, 2, "Should have errors from all providers");
    assert.ok(result.metadata, "Should have metadata even on failure");
    assert.strictEqual(
      result.metadata.responses.length,
      2,
      "Should have all responses in metadata",
    );
  });

  it("should track response times for both successes and failures", async () => {
    const clients = [
      new RpcClient("https://invalid-url-12345.com"),
      ...TEST_URLS.map((url) => new RpcClient(url)),
    ];
    const strategy = new ParallelStrategy(clients);

    const result = await strategy.execute<string>("eth_blockNumber", []);

    assert.ok(result.metadata, "Should have metadata");

    for (const response of result.metadata.responses) {
      assert.ok(typeof response.responseTime === "number", "Should have response time");
      assert.ok(response.responseTime >= 0, "Response time should be non-negative");
    }
  });
});

describe("ParallelStrategy - Different RPC Methods", () => {
  const clients = TEST_URLS.map((url) => new RpcClient(url));

  it("should handle eth_getBalance in parallel", async () => {
    const strategy = new ParallelStrategy(clients);
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const result = await strategy.execute<string>("eth_getBalance", [zeroAddress, "latest"]);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.metadata, "Should have metadata");
    assert.ok(result.metadata.responses.length >= 2, "Should have multiple responses");
  });

  it("should handle eth_getBlockByNumber with params in parallel", async () => {
    const strategy = new ParallelStrategy(clients);
    const result = await strategy.execute<any>("eth_getBlockByNumber", ["latest", false]);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.metadata, "Should have metadata");

    const successfulResponses = result.metadata.responses.filter((r) => r.status === "success");
    assert.ok(successfulResponses.length >= 1, "Should have successful responses");
  });

  it("should handle eth_getLogs in parallel", async () => {
    const strategy = new ParallelStrategy(clients);
    const result = await strategy.execute<any[]>("eth_getLogs", [
      { fromBlock: "latest", toBlock: "latest" },
    ]);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.metadata, "Should have metadata");
  });

  it("should handle invalid method in parallel", async () => {
    const strategy = new ParallelStrategy(clients);
    const result = await strategy.execute<string>("invalid_method_12345", []);

    assert.strictEqual(result.success, false, "Should fail for invalid method");
    assert.ok(result.errors, "Should have errors");
    assert.ok(result.metadata, "Should have metadata");
    assert.ok(
      result.metadata.responses.every((r) => r.status === "error"),
      "All responses should be errors",
    );
  });
});

describe("ParallelStrategy - Performance Metrics", () => {
  it("should track timestamp of execution", async () => {
    const clients = TEST_URLS.map((url) => new RpcClient(url));
    const strategy = new ParallelStrategy(clients);

    const beforeTime = Date.now();
    const result = await strategy.execute<string>("eth_chainId", []);
    const afterTime = Date.now();

    assert.ok(result.metadata, "Should have metadata");
    assert.ok(result.metadata.timestamp >= beforeTime, "Timestamp should be after start");
    assert.ok(result.metadata.timestamp <= afterTime, "Timestamp should be before end");
  });

  it("should have reasonable response times", async () => {
    const clients = TEST_URLS.map((url) => new RpcClient(url));
    const strategy = new ParallelStrategy(clients);

    const result = await strategy.execute<string>("eth_blockNumber", []);

    assert.ok(result.metadata, "Should have metadata");

    const successfulResponses = result.metadata.responses.filter((r) => r.status === "success");
    for (const response of successfulResponses) {
      assert.ok(response.responseTime < 30000, "Response time should be reasonable (< 30s)");
    }
  });
});
