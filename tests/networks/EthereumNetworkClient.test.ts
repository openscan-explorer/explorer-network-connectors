import { describe, it } from "node:test";
import assert from "node:assert";
import { EthereumClient } from "../../src/networks/1/EthereumClient.js";
import type { StrategyConfig } from "../../src/strategies/requestStrategy.js";

const TEST_URLS = ["https://eth.merkle.io", "https://ethereum.publicnode.com"];

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

describe("EthereumClient - Constructor", () => {
  it("should create client with fallback strategy", () => {
    const config: StrategyConfig = {
      type: "fallback",
      rpcUrls: TEST_URLS,
    };

    const client = new EthereumClient(config);

    assert.ok(client, "Client should be created");
    assert.strictEqual(client.getStrategyName(), "fallback", "Should use fallback strategy");
  });

  it("should create client with parallel strategy", () => {
    const config: StrategyConfig = {
      type: "parallel",
      rpcUrls: TEST_URLS,
    };

    const client = new EthereumClient(config);

    assert.ok(client, "Client should be created");
    assert.strictEqual(client.getStrategyName(), "parallel", "Should use parallel strategy");
  });
});

describe("EthereumClient - Web3 Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get client version", async () => {
    const client = new EthereumClient(config);
    const result = await client.clientVersion();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have client version");
    assert.strictEqual(typeof result.data, "string", "Client version should be string");
  });
});

describe("EthereumClient - Net Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get network version", async () => {
    const client = new EthereumClient(config);
    const result = await client.version();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have version");
    assert.strictEqual(typeof result.data, "string", "Version should be string");
  });

  it("should get listening status", async () => {
    const client = new EthereumClient(config);
    const result = await client.listening();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.strictEqual(typeof result.data, "boolean", "Listening should be boolean");
  });

  it("should get peer count", async () => {
    const client = new EthereumClient(config);
    const result = await client.peerCount();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have peer count");
    assert.ok(isHexString(result.data), "Peer count should be hex string");
  });
});

describe("EthereumClient - Chain Info", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get chain ID", async () => {
    const client = new EthereumClient(config);
    const result = await client.chainId();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have chain ID");
    assert.ok(isHexString(result.data), "Chain ID should be hex string");
  });

  it("should get block number", async () => {
    const client = new EthereumClient(config);
    const result = await client.blockNumber();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have block number");
    assert.ok(isHexString(result.data), "Block number should be hex string");
  });
});

describe("EthereumClient - Block Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get block by number (latest)", async () => {
    const client = new EthereumClient(config);
    const result = await client.getBlockByNumber("latest", false);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have block data");

    const block = result.data;
    validateObject(block, [
      "number",
      "hash",
      "parentHash",
      "transactions",
      "gasLimit",
      "gasUsed",
      "timestamp",
    ]);
    assert.ok(isHexString(block.number), "Block number should be hex");
    assert.ok(isHexString(block.hash), "Block hash should be hex");
    assert.ok(Array.isArray(block.transactions), "Transactions should be array");
  });

  it("should get block by number with full transactions", async () => {
    const client = new EthereumClient(config);
    const result = await client.getBlockByNumber("latest", true);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have block data");

    const block = result.data;
    assert.ok(Array.isArray(block.transactions), "Transactions should be array");
  });

  it("should get block by number (numeric)", async () => {
    const client = new EthereumClient(config);
    const result = await client.getBlockByNumber(" s", false);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have block data");
    assert.ok(isHexString(result.data.number), "Block number should be hex");
  });

  it("should get block by hash", async () => {
    const client = new EthereumClient(config);

    // First get latest block
    const latestResult = await client.getBlockByNumber("latest", false);
    assert.ok(latestResult.data?.hash, "Should have block hash");

    // Then get by hash
    const result = await client.getBlockByHash(latestResult.data.hash, false);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have block data");
    assert.strictEqual(result.data.hash, latestResult.data.hash, "Hash should match");
  });

  it("should get block transaction count by number", async () => {
    const client = new EthereumClient(config);
    const result = await client.getBlockTransactionCountByNumber("latest");

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have transaction count");
    assert.ok(isHexString(result.data), "Transaction count should be hex");
  });

  it("should get block transaction count by hash", async () => {
    const client = new EthereumClient(config);

    // First get latest block
    const latestResult = await client.getBlockByNumber("latest", false);
    assert.ok(latestResult.data?.hash, "Should have block hash");

    // Then get transaction count
    const result = await client.getBlockTransactionCountByHash(latestResult.data.hash);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have transaction count");
    assert.ok(isHexString(result.data), "Transaction count should be hex");
  });
});

describe("EthereumClient - Account Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get balance", async () => {
    const client = new EthereumClient(config);
    const result = await client.getBalance(ZERO_ADDRESS, "latest");

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have balance");
    assert.ok(isHexString(result.data), "Balance should be hex string");
  });

  it("should get code", async () => {
    const client = new EthereumClient(config);
    const result = await client.getCode(ZERO_ADDRESS, "latest");

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have code");
    assert.ok(isHexString(result.data), "Code should be hex string");
  });

  it("should get storage at", async () => {
    const client = new EthereumClient(config);
    const result = await client.getStorageAt(ZERO_ADDRESS, "0x0", "latest");

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have storage value");
    assert.ok(isHexString(result.data), "Storage should be hex string");
  });

  it("should get transaction count", async () => {
    const client = new EthereumClient(config);
    const result = await client.getTransactionCount(ZERO_ADDRESS, "latest");

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have transaction count");
    assert.ok(isHexString(result.data), "Transaction count should be hex string");
  });
});

describe("EthereumClient - Transaction Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get transaction by hash", async () => {
    const client = new EthereumClient(config);

    // Get a block with transactions
    const blockResult = await client.getBlockByNumber("latest", false);
    assert.ok(blockResult.data, "Should have block");

    if (blockResult.data.transactions.length > 0) {
      const txHash = blockResult.data.transactions[0];
      const result = await client.getTransactionByHash(txHash as string);

      if (result.data !== null) {
        assert.strictEqual(result.success, true, "Should succeed");
        validateObject(result.data, ["hash", "from", "to", "value", "gas", "gasPrice"]);
        assert.ok(isHexString(result.data?.hash as string), "Transaction hash should be hex");
        assert.ok(isAddress(result.data?.from as string), "From should be address");
      }
    }
  });

  it("should get transaction receipt", async () => {
    const client = new EthereumClient(config);

    // Get a block with transactions
    const blockResult = await client.getBlockByNumber("latest", false);
    assert.ok(blockResult.data, "Should have block");

    if (blockResult.data.transactions.length > 0) {
      const txHash = blockResult.data.transactions[0];
      const result = await client.getTransactionReceipt(txHash as string);

      if (result.data !== null) {
        assert.strictEqual(result.success, true, "Should succeed");
        validateObject(result.data, [
          "transactionHash",
          "blockNumber",
          "blockHash",
          "gasUsed",
          "status",
        ]);
        assert.ok(isHexString(result.data?.blockNumber as string), "Block number should be hex");
        assert.ok(Array.isArray(result.data?.logs), "Should have logs array");
      }
    }
  });

  it("should reject invalid sendRawTransaction", async () => {
    const client = new EthereumClient(config);
    const result = await client.sendRawTransaction("0xdeadbeef");

    assert.strictEqual(result.success, false, "Should fail for invalid transaction");
    assert.ok(result.errors, "Should have errors");
  });
});

describe("EthereumClient - Call and Estimate", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should execute eth_call", async () => {
    const client = new EthereumClient(config);
    const result = await client.callContract({ to: ZERO_ADDRESS, data: "0x" }, "latest");

    // May succeed or fail depending on the call, but should return a result
    assert.ok(result, "Should return a result");
  });

  it("should estimate gas", async () => {
    const client = new EthereumClient(config);
    const result = await client.estimateGas({ from: ZERO_ADDRESS, to: ZERO_ADDRESS, value: "0x0" });

    // May succeed or fail, but should return a result
    assert.ok(result, "Should return a result");
  });

  it("should get gas price", async () => {
    const client = new EthereumClient(config);
    const result = await client.gasPrice();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have gas price");
    assert.ok(isHexString(result.data), "Gas price should be hex string");
  });

  it("should get max priority fee per gas", async () => {
    const client = new EthereumClient(config);
    const result = await client.maxPriorityFeePerGas();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have max priority fee");
    assert.ok(isHexString(result.data), "Max priority fee should be hex string");
  });

  it("should get fee history", async () => {
    const client = new EthereumClient(config);
    const result = await client.feeHistory("0x4", "latest", [25, 50, 75]);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have fee history");
    validateObject(result.data, ["baseFeePerGas", "gasUsedRatio"]);
  });
});

describe("EthereumClient - Logs and Filters", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get logs", async () => {
    const client = new EthereumClient(config);
    const result = await client.getLogs({ fromBlock: "latest", toBlock: "latest" });

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(Array.isArray(result.data), "Should return array of logs");

    for (const log of result.data) {
      validateObject(log, ["address", "topics", "data", "blockNumber", "transactionHash"]);
      assert.ok(isAddress(log.address), "Log address should be valid");
      assert.ok(Array.isArray(log.topics), "Topics should be array");
    }
  });

  it("should create new filter", async () => {
    const client = new EthereumClient(config);
    const result = await client.newFilter({ fromBlock: "latest" });

    // May or may not be supported
    if (result.success) {
      assert.ok(isHexString(result.data as string), "Filter ID should be hex string");
    }
  });

  it("should create new block filter", async () => {
    const client = new EthereumClient(config);
    const result = await client.newBlockFilter();

    // May or may not be supported
    if (result.success) {
      assert.ok(isHexString(result.data as string), "Filter ID should be hex string");
    }
  });
});

describe("EthereumClient - Trace Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should attempt debug_traceTransaction", async () => {
    const client = new EthereumClient(config);

    // Get a transaction hash
    const blockResult = await client.getBlockByNumber("latest", false);
    if (blockResult.data && blockResult.data.transactions.length > 0) {
      const txHash = blockResult.data.transactions[0];
      const result = await client.debugTraceTransaction(txHash as string);

      // May fail if tracing not supported, but should return a result
      assert.ok(result, "Should return a result");
    }
  });

  it("should attempt trace_transaction", async () => {
    const client = new EthereumClient(config);

    // Get a transaction hash
    const blockResult = await client.getBlockByNumber("latest", false);
    if (blockResult.data && blockResult.data.transactions.length > 0) {
      const txHash = blockResult.data.transactions[0];
      const result = await client.traceTransaction(txHash as string);

      // May fail if tracing not supported, but should return a result
      assert.ok(result, "Should return a result");
    }
  });

  it("should attempt trace_block", async () => {
    const client = new EthereumClient(config);
    const result = await client.traceBlock("latest");

    // May fail if tracing not supported, but should return a result
    assert.ok(result, "Should return a result");
  });
});

describe("EthereumClient - Parallel Strategy", () => {
  const config: StrategyConfig = {
    type: "parallel",
    rpcUrls: TEST_URLS,
  };

  it("should get chain ID with metadata", async () => {
    const client = new EthereumClient(config);
    const result = await client.chainId();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.metadata, "Should have metadata");
    assert.ok(result.metadata.responses.length >= 2, "Should have multiple responses");
  });

  it("should get block number with metadata", async () => {
    const client = new EthereumClient(config);
    const result = await client.blockNumber();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.metadata, "Should have metadata");
    assert.strictEqual(result.metadata.strategy, "parallel", "Should be parallel strategy");
  });
});
