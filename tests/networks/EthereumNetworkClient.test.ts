import { describe, it } from "node:test";
import assert from "node:assert";
import { EthereumClient } from "../../src/networks/1/EthereumClient.js";
import type { StrategyConfig } from "../../src/strategies/requestStrategy.js";
import {
  validateObject,
  validateBlock,
  validateSuccessResult,
  validateTransaction,
  validateTransactionReceipt,
  validateLog,
  validateFeeHistory,
  validateFailureResult,
  isHexString,
} from "../helpers/validators.js";

const TEST_URLS = ["https://eth.merkle.io", "https://ethereum.publicnode.com"];

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

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

    validateSuccessResult(result, "string");
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

    validateSuccessResult(result, "string");
  });

  it("should get listening status", async () => {
    const client = new EthereumClient(config);
    const result = await client.listening();

    validateSuccessResult(result, "boolean");
  });

  it("should get peer count", async () => {
    const client = new EthereumClient(config);
    const result = await client.peerCount();

    validateSuccessResult(result);
    assert.ok(isHexString(result.data as string), "Peer count should be hex string");
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

    validateSuccessResult(result);
    assert.ok(isHexString(result.data as string), "Chain ID should be hex string");
  });

  it("should get block number", async () => {
    const client = new EthereumClient(config);
    const result = await client.blockNumber();

    validateSuccessResult(result);
    assert.ok(isHexString(result.data as string), "Block number should be hex string");
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

    validateSuccessResult(result);
    validateBlock(result.data);
  });

  it("should get block by number (earliest)", async () => {
    const client = new EthereumClient(config);
    const result = await client.getBlockByNumber("earliest", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });

  it("should get block by number (pending)", async () => {
    const client = new EthereumClient(config);
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

  it("should get block by number (finalized)", async () => {
    const client = new EthereumClient(config);
    const result = await client.getBlockByNumber("finalized", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });

  it("should get block by number (safe)", async () => {
    const client = new EthereumClient(config);
    const result = await client.getBlockByNumber("safe", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });

  it("should get block by number with full transactions", async () => {
    const client = new EthereumClient(config);
    const result = await client.getBlockByNumber("latest", true);

    validateSuccessResult(result);
    const block = result.data;
    assert.ok(Array.isArray((block as any).transactions), "Transactions should be array");
  });

  // it("should get block by number (numeric)", async () => {
  //   const client = new EthereumClient(config);
  //   const result = await client.getBlockByNumber(" s", false);
  //
  //   assert.strictEqual(result.success, true, "Should succeed");
  //   assert.ok(result.data, "Should have block data");
  //   assert.ok(isHexString(result.data.number), "Block number should be hex");
  // });

  it("should get block by hash", async () => {
    const client = new EthereumClient(config);

    // First get latest block
    const latestResult = await client.getBlockByNumber("latest", false);
    assert.ok(latestResult.data?.hash, "Should have block hash");

    // Then get by hash
    const result = await client.getBlockByHash(latestResult.data.hash, false);

    validateSuccessResult(result);
    assert.strictEqual((result.data as any).hash, latestResult.data.hash, "Hash should match");
  });

  it("should get block transaction count by number", async () => {
    const client = new EthereumClient(config);
    const result = await client.getBlockTransactionCountByNumber("latest");

    validateSuccessResult(result);
    assert.ok(isHexString(result.data as string), "Transaction count should be hex");
  });

  it("should get block transaction count by hash", async () => {
    const client = new EthereumClient(config);

    // First get latest block
    const latestResult = await client.getBlockByNumber("latest", false);
    assert.ok(latestResult.data?.hash, "Should have block hash");

    // Then get transaction count
    const result = await client.getBlockTransactionCountByHash(latestResult.data.hash);

    validateSuccessResult(result);
    assert.ok(isHexString(result.data as string), "Transaction count should be hex");
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

    validateSuccessResult(result);
    assert.ok(isHexString(result.data as string), "Balance should be hex string");
  });

  it("should get code", async () => {
    const client = new EthereumClient(config);
    const result = await client.getCode(ZERO_ADDRESS, "latest");

    validateSuccessResult(result);
    assert.ok(isHexString(result.data as string), "Code should be hex string");
  });

  it("should get storage at", async () => {
    const client = new EthereumClient(config);
    const result = await client.getStorageAt(ZERO_ADDRESS, "0x0", "latest");

    validateSuccessResult(result);
    assert.ok(isHexString(result.data as string), "Storage should be hex string");
  });

  it("should get transaction count", async () => {
    const client = new EthereumClient(config);
    const result = await client.getTransactionCount(ZERO_ADDRESS, "latest");

    validateSuccessResult(result);
    assert.ok(isHexString(result.data as string), "Transaction count should be hex string");
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
        validateSuccessResult(result);
        validateTransaction(result.data);
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
        validateSuccessResult(result);
        validateTransactionReceipt(result.data);
      }
    }
  });

  it("should reject invalid sendRawTransaction", async () => {
    const client = new EthereumClient(config);
    const result = await client.sendRawTransaction("0xdeadbeef");

    validateFailureResult(result);
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

    validateSuccessResult(result);
    assert.ok(isHexString(result.data as string), "Gas price should be hex string");
  });

  it("should get max priority fee per gas", async () => {
    const client = new EthereumClient(config);
    const result = await client.maxPriorityFeePerGas();

    validateSuccessResult(result);
    assert.ok(isHexString(result.data as string), "Max priority fee should be hex string");
  });

  it("should get fee history", async () => {
    const client = new EthereumClient(config);
    const result = await client.feeHistory("0x4", "latest", [25, 50, 75]);

    validateSuccessResult(result);
    validateFeeHistory(result.data);
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

    validateSuccessResult(result);
    assert.ok(Array.isArray(result.data), "Should return array of logs");

    for (const log of result.data as any[]) {
      validateLog(log);
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

    validateSuccessResult(result);
    assert.ok(result.metadata, "Should have metadata");
    assert.ok(result.metadata.responses.length >= 2, "Should have multiple responses");
  });

  it("should get block number with metadata", async () => {
    const client = new EthereumClient(config);
    const result = await client.blockNumber();

    validateSuccessResult(result);
    assert.ok(result.metadata, "Should have metadata");
    assert.strictEqual(result.metadata.strategy, "parallel", "Should be parallel strategy");
  });
});
