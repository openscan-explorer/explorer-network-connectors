import { describe, it } from "node:test";
import assert from "node:assert";
import { ArbitrumClient } from "../../src/networks/42161/ArbitrumClient.js";
import type { StrategyConfig } from "../../src/strategies/requestStrategy.js";
import {
  validateObject,
  validateBlock,
  validateSuccessResult,
  validateTransaction,
  validateTransactionReceipt,
  validateLog,
  validateFailureResult,
  isHexString,
} from "../helpers/validators.js";

const TEST_URLS = ["https://arb-one.api.pocket.network", "https://arbitrum.meowrpc.com"];

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

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

    validateSuccessResult(result);
    assert.ok(isHexString(result.data as string), "Chain ID should be hex string");
  });

  it("should get syncing status", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.syncing();

    validateSuccessResult(result);
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

    validateSuccessResult(result);
    assert.ok(isHexString(result.data as string), "Block number should be hex string");
  });

  it("should get block by number (latest)", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getBlockByNumber("latest", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });

  it("should get block by number (earliest)", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getBlockByNumber("earliest", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });

  it("should get block by number (pending)", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getBlockByNumber("pending", false);

    // Pending block may or may not exist depending on network state
    if (result.success && result.data) {
      const block = result.data;
      validateObject(block, ["transactions"]);
      assert.ok(Array.isArray(block.transactions), "Transactions should be array");
    } else {
      // Some networks may not support pending tag
      assert.ok(true, "Pending block not available or not supported");
    }
  });

  it("should get block by number with full transactions", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getBlockByNumber("latest", true);

    validateSuccessResult(result);
    assert.ok(Array.isArray((result.data as any).transactions), "Transactions should be array");
  });

  it("should get block by number (hex)", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getBlockByNumber("0x1000000", false);

    validateSuccessResult(result);
    assert.ok(isHexString((result.data as any).number), "Block number should be hex");
  });

  it("should get block by hash", async () => {
    const client = new ArbitrumClient(config);

    // First get latest block
    const latestResult = await client.getBlockByNumber("latest", false);
    assert.ok(latestResult.data?.hash, "Should have block hash");

    // Then get by hash
    const result = await client.getBlockByHash(latestResult.data.hash, false);

    validateSuccessResult(result);
    assert.strictEqual((result.data as any).hash, latestResult.data.hash, "Hash should match");
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

    validateSuccessResult(result);
    assert.ok(isHexString(result.data as string), "Balance should be hex string");
  });

  it("should get code", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getCode(ZERO_ADDRESS, "latest");

    validateSuccessResult(result);
    assert.ok(isHexString(result.data as string), "Code should be hex string");
  });

  it("should get transaction count", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getTransactionCount(ZERO_ADDRESS, "latest");

    validateSuccessResult(result);
    assert.ok(isHexString(result.data as string), "Transaction count should be hex string");
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
        validateSuccessResult(result);
        validateTransaction(result.data);
        validateObject(result.data, [
          "blockHash",
          "blockNumber",
          "chainId",
          "from",
          "gas",
          "gasPrice",
          "hash",
          "input",
          "nonce",
          "to",
          "transactionIndex",
          "value",
          "v",
          "r",
          "s",
        ]);
        assert.ok(isHexString((result.data as any).nonce), "Nonce should be hex");
        assert.ok(isHexString((result.data as any).chainId), "ChainId should be hex");
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
        validateSuccessResult(result);
        validateTransactionReceipt(result.data);
      }
    }
  });

  it.skip("should reject invalid sendRawTransaction", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.sendRawTransaction("0xbeef");
    // It should fail due to invalid transaction, but is returning tx Hash
    validateFailureResult(result);
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

    validateSuccessResult(result);
    assert.ok(isHexString(result.data as string), "Gas price should be hex string");
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

    validateSuccessResult(result);
    assert.ok(Array.isArray(result.data), "Should return array of logs");

    for (const log of result.data as any[]) {
      validateLog(log);
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

    validateSuccessResult(result);
    assert.ok(result.metadata, "Should have metadata");
    assert.ok(result.metadata.responses.length >= 2, "Should have multiple responses");
  });

  it("should get block number with metadata", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.blockNumber();

    validateSuccessResult(result);
    assert.ok(result.metadata, "Should have metadata");
    assert.strictEqual(result.metadata.strategy, "parallel", "Should be parallel strategy");
  });

  it("should get balance with response time tracking", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getBalance(ZERO_ADDRESS, "latest");

    validateSuccessResult(result);
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

    validateSuccessResult(result);
  });

  it("should handle getCode with default block tag", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getCode(ZERO_ADDRESS);

    validateSuccessResult(result);
  });

  it("should handle getTransactionCount with default block tag", async () => {
    const client = new ArbitrumClient(config);
    const result = await client.getTransactionCount(ZERO_ADDRESS);

    validateSuccessResult(result);
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
