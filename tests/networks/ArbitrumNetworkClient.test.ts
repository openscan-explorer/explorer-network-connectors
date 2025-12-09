import { describe, it } from "node:test";
import assert from "node:assert";
import { ArbitrumClient } from "../../src/networks/42161/ArbitrumClient.js";
import type { StrategyConfig } from "../../src/strategies/requestStrategy.js";

const TEST_URLS = [
  "https://arb-one.api.pocket.network",
  "https://arbitrum.meowrpc.com",
];

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function isHexString(value: string): boolean {
  return typeof value === "string" && /^0x[0-9a-fA-F]*$/.test(value);
}

function isAddress(value: string): boolean {
  return typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value);
}

function validateObject(obj: any, requiredFields?: string[]): void {
  assert.ok(obj !== null && obj !== undefined, "Result should not be null or undefined");
  assert.strictEqual(typeof obj, "object", "Result should be an object");
  if (requiredFields) {
    for (const field of requiredFields) {
      assert.ok(field in obj, `Object should have field '${field}'`);
    }
  }
}

describe("ArbitrumNetworkClient - Constructor", () => {
  it("should create client with fallback strategy", () => {
    const config: StrategyConfig = {
      type: "fallback",
      rpcUrls: TEST_URLS,
    };

    const client = new ArbitrumClient(config);

    assert.ok(client, "Client should be created");
    assert.strictEqual(client.getStrategyName(), "fallback", "Should use fallback strategy");
  });

  it("should create client with parallel strategy", () => {
    const config: StrategyConfig = {
      type: "parallel",
      rpcUrls: TEST_URLS,
    };

    const client = new ArbitrumClient(config);

    assert.ok(client, "Client should be created");
    assert.strictEqual(client.getStrategyName(), "parallel", "Should use parallel strategy");
  });
});

describe("ArbitrumNetworkClient - Chain Info", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get chain ID", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.chainId();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have chain ID");
    assert.ok(isHexString(result.data), "Chain ID should be hex string");
  });

  it("should get syncing status", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.syncing();

    assert.strictEqual(result.success, true, "Should succeed");
    const isBoolOrObject = typeof result.data === "boolean" || typeof result.data === "object";
    assert.ok(isBoolOrObject, "syncing should be boolean or object per type");
  });
});

describe("ArbitrumNetworkClient - Block Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get block number", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.blockNumber();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have block number");
    assert.ok(isHexString(result.data), "Block number should be hex string");
  });

  it("should get block by number (latest)", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getBlockByNumber("latest", false);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have block data");

    const block = result.data;
    validateObject(block, ["number", "hash", "parentHash", "transactions", "gasLimit", "gasUsed", "timestamp"]);
    assert.ok(isHexString(block.number), "Block number should be hex");
    assert.ok(isHexString(block.hash), "Block hash should be hex");
    assert.ok(isHexString(block.gasLimit), "gasLimit should be hex");
    assert.ok(isHexString(block.gasUsed), "gasUsed should be hex");
    assert.ok(isHexString(block.timestamp), "timestamp should be hex");
    assert.ok(Array.isArray(block.transactions), "Transactions should be array");
  });

  it("should get block by number with full transactions", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getBlockByNumber("latest", true);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have block data");

    const block = result.data;
    assert.ok(Array.isArray(block.transactions), "Transactions should be array");
  });

  it("should get block by number (numeric)", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getBlockByNumber("1000000", false);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have block data");
    assert.ok(isHexString(result.data.number), "Block number should be hex");
  });

  it("should get block by hash", async () => {
    const client = new ArbitrumClient(config);

    // First get latest block
    const latestResult = await client.getBlockByNumber("latest", false);
    assert.ok(latestResult.data?.hash, "Should have block hash");

    // Then get by hash
    const result = await client.getBlockByHash(latestResult.data.hash, false);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have block data");
    assert.strictEqual(result.data.hash, latestResult.data.hash, "Hash should match");
  });
});

describe("ArbitrumNetworkClient - Account Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get balance", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getBalance(ZERO_ADDRESS, "latest");

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have balance");
    assert.ok(isHexString(result.data), "Balance should be hex string");
  });

  it("should get code", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getCode(ZERO_ADDRESS, "latest");

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have code");
    assert.ok(isHexString(result.data), "Code should be hex string");
  });

  it("should get transaction count", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getTransactionCount(ZERO_ADDRESS, "latest");

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have transaction count");
    assert.ok(isHexString(result.data), "Transaction count should be hex string");
  });
});

describe("ArbitrumNetworkClient - Transaction Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get transaction by hash", async () => {
    const client = new ArbitrumClient(config);

    // Get a block with transactions
    const blockResult = await client.getBlockByNumber("latest", false);
    assert.ok(blockResult.data, "Should have block");

    if (blockResult.data.transactions.length > 0) {
      const txHash = blockResult.data.transactions[0];
      const result = await client.getTransactionByHash(txHash as string);

      if (result.data !== null) {
        assert.strictEqual(result.success, true, "Should succeed");
        validateObject(result.data, ["hash", "from", "to", "value", "gas", "gasPrice", "nonce", "chainId"]);
        assert.ok(isHexString(result.data?.hash as string), "Transaction hash should be hex");
        assert.ok(isAddress(result.data?.from as string), "From should be address");
        assert.ok(isHexString(result.data?.nonce as string), "Nonce should be hex");
        assert.ok(isHexString(result.data?.chainId as string), "ChainId should be hex");
        assert.ok(isHexString(result.data?.gasPrice as string), "GasPrice should be hex");
      }
    }
  });

  it("should get transaction receipt", async () => {
    const client = new ArbitrumClient(config);

    // Get a block with transactions
    const blockResult = await client.getBlockByNumber("latest", false);
    assert.ok(blockResult.data, "Should have block");

    if (blockResult.data.transactions.length > 0) {
      const txHash = blockResult.data.transactions[0];
      const result = await client.getTransactionReceipt(txHash as string);

      if (result.data !== null) {
        assert.strictEqual(result.success, true, "Should succeed");
        validateObject(result.data, ["transactionHash", "blockNumber", "blockHash", "gasUsed", "status", "logs"]);
        assert.ok(isHexString(result.data?.blockNumber as string), "Block number should be hex");
        assert.ok(isHexString(result.data?.gasUsed as string), "Gas used should be hex");
        assert.ok(Array.isArray(result.data?.logs), "Should have logs array");
      }
    }
  });

  it("should reject invalid sendRawTransaction", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.sendRawTransaction("0xdeadbeef");

    assert.strictEqual(result.success, false, "Should fail for invalid transaction");
    assert.ok(result.errors, "Should have errors");
  });
});

describe("ArbitrumNetworkClient - Call and Gas Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should execute call", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.callContract({ to: ZERO_ADDRESS, data: "0x" }, "latest");

    // May succeed or fail depending on the call, but should return a result
    assert.ok(result, "Should return a result");
  });

  it("should estimate gas", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.estimateGas({ from: ZERO_ADDRESS, to: ZERO_ADDRESS, value: "0x0" });

    // May succeed or fail, but should return a result
    assert.ok(result, "Should return a result");
  });

  it("should get gas price", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.gasPrice();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have gas price");
    assert.ok(isHexString(result.data), "Gas price should be hex string");
  });
});

describe("ArbitrumNetworkClient - Logs", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get logs", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getLogs({ fromBlock: "latest", toBlock: "latest" });

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(Array.isArray(result.data), "Should return array of logs");

    for (const log of result.data) {
      validateObject(log, ["address", "topics", "data", "blockNumber", "transactionHash", "removed"]);
      assert.ok(isAddress(log.address), "Log address should be valid");
      assert.ok(Array.isArray(log.topics), "Topics should be array");
      assert.strictEqual(typeof log.removed, "boolean", "Removed should be boolean");
    }
  });
});

describe("ArbitrumNetworkClient - Arbitrum-Specific Trace Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should attempt arbtrace_block", async () => {
    const client = new ArbitrumClient(config);

    try {
      const result = await client.arbtraceBlock("latest");

      if (result.success) {
        assert.ok(Array.isArray(result.data), "arbtrace_block should return an array");
      }
    } catch (error: any) {
      assert.ok(error, "arbtrace_block may be disabled on some endpoints");
    }
  });

  it("should attempt arbtrace_transaction", async () => {
    const client = new ArbitrumClient(config);

    // Get a transaction hash
    const blockResult = await client.getBlockByNumber("latest", false);
    if (blockResult.data && blockResult.data.transactions.length > 0) {
      const txHash = blockResult.data.transactions[0];

      try {
        const result = await client.arbtraceTransaction(txHash as string);

        if (result.success) {
          assert.ok(Array.isArray(result.data), "arbtrace_transaction should return an array");
        }
      } catch (error: any) {
        assert.ok(error, "arbtrace_transaction may be disabled on some endpoints");
      }
    }
  });
});

describe("ArbitrumNetworkClient - Parallel Strategy", () => {
  const config: StrategyConfig = {
    type: "parallel",
    rpcUrls: TEST_URLS,
  };

  it("should get chain ID with metadata", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.chainId();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.metadata, "Should have metadata");
    assert.ok(result.metadata.responses.length >= 2, "Should have multiple responses");
  });

  it("should get block number with metadata", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.blockNumber();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.metadata, "Should have metadata");
    assert.strictEqual(result.metadata.strategy, "parallel", "Should be parallel strategy");
  });

  it("should get balance with response time tracking", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getBalance(ZERO_ADDRESS, "latest");

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.metadata, "Should have metadata");

    for (const response of result.metadata.responses) {
      assert.ok(typeof response.responseTime === "number", "Should have response time");
      assert.ok(response.responseTime >= 0, "Response time should be non-negative");
    }
  });
});

describe("ArbitrumNetworkClient - Edge Cases", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should handle getBalance with default block tag", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getBalance(ZERO_ADDRESS);

    assert.strictEqual(result.success, true, "Should succeed with default block tag");
  });

  it("should handle getCode with default block tag", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getCode(ZERO_ADDRESS);

    assert.strictEqual(result.success, true, "Should succeed with default block tag");
  });

  it("should handle getTransactionCount with default block tag", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getTransactionCount(ZERO_ADDRESS);

    assert.strictEqual(result.success, true, "Should succeed with default block tag");
  });

  it("should handle call with default block tag", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.callContract({ to: ZERO_ADDRESS, data: "0x" });

    // May succeed or fail, but should handle default parameter
    assert.ok(result, "Should return a result");
  });

  it("should handle estimateGas without block tag", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.estimateGas({ from: ZERO_ADDRESS, to: ZERO_ADDRESS, value: "0x0" });

    // May succeed or fail, but should handle optional parameter
    assert.ok(result, "Should return a result");
  });
});
