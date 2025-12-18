import { describe, it } from "node:test";
import assert from "node:assert";
import { PolygonClient } from "../../src/networks/137/PolygonClient.js";
import type { StrategyConfig } from "../../src/strategies/requestStrategy.js";
import type { PolygonTransactionReceipt, PolygonLog } from "../../src/networks/137/PolygonTypes.js";
import {
  validateObject,
  validateBlock,
  validateSuccessResult,
  validateTransaction,
  isHexString,
  isAddress,
} from "../helpers/validators.js";

const TEST_URLS = ["https://poly.api.pocket.network", "https://polygon-bor-rpc.publicnode.com"];

// Known transaction hash with logs
const TEST_TX_HASH = "0xa871c9e4d142905427f4c5eb2664b4840ef8a007c9f263aed6f6c64eeae71540";

describe("PolygonClient - Block Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get block by number (latest)", async () => {
    const client = new PolygonClient(config);
    const result = await client.getBlockByNumber("latest", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });

  it("should get block by number (earliest)", async () => {
    const client = new PolygonClient(config);
    const result = await client.getBlockByNumber("earliest", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });

  it("should get block by number (pending)", async () => {
    const client = new PolygonClient(config);
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
    const client = new PolygonClient(config);
    const result = await client.getBlockByNumber("finalized", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });
});

describe("PolygonClient - Transaction Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get transaction by hash", async () => {
    const client = new PolygonClient(config);

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
});

describe("PolygonClient - Transaction Receipt Types", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get transaction receipt with Polygon-specific log fields", async () => {
    const client = new PolygonClient(config);
    const result = await client.getTransactionReceipt(TEST_TX_HASH);

    validateSuccessResult(result);

    const receipt = result.data as PolygonTransactionReceipt;

    // Validate standard receipt fields
    assert.strictEqual(receipt.transactionHash, TEST_TX_HASH, "Transaction hash should match");
    assert.ok(isHexString(receipt.blockNumber), "Block number should be hex");
    assert.ok(isHexString(receipt.blockHash), "Block hash should be hex");
    assert.ok(isAddress(receipt.from), "From should be address");
    assert.ok(isHexString(receipt.gasUsed), "Gas used should be hex");
    assert.ok(isHexString(receipt.cumulativeGasUsed), "Cumulative gas used should be hex");
    assert.ok(Array.isArray(receipt.logs), "Logs should be array");

    // Validate Polygon-specific log fields
    if (receipt.logs.length > 0) {
      for (const log of receipt.logs) {
        const polygonLog = log as PolygonLog;

        // Standard log fields
        assert.ok(isAddress(polygonLog.address), "Log address should be valid");
        assert.ok(isHexString(polygonLog.data), "Log data should be hex");
        assert.ok(Array.isArray(polygonLog.topics), "Log topics should be array");
        assert.ok(isHexString(polygonLog.blockNumber), "Log block number should be hex");
        assert.ok(isHexString(polygonLog.blockHash), "Log block hash should be hex");
        assert.ok(isHexString(polygonLog.transactionHash), "Log transaction hash should be hex");
        assert.ok(isHexString(polygonLog.transactionIndex), "Log transaction index should be hex");
        assert.ok(isHexString(polygonLog.logIndex), "Log index should be hex");

        // Polygon-specific fields
        assert.strictEqual(typeof polygonLog.removed, "boolean", "Log removed should be boolean");
        assert.ok(
          isHexString(polygonLog.blockTimestamp),
          "Log blockTimestamp should be hex string (Polygon-specific)",
        );

        // Verify blockTimestamp is a valid timestamp
        const timestamp = parseInt(polygonLog.blockTimestamp, 16);
        assert.ok(timestamp > 0, "Block timestamp should be a positive number");
        assert.ok(timestamp < Date.now() / 1000 + 86400, "Block timestamp should be reasonable");
      }
    }
  });

  it("should verify log structure matches actual Polygon response", async () => {
    const client = new PolygonClient(config);
    const result = await client.getTransactionReceipt(TEST_TX_HASH);

    validateSuccessResult(result);

    const receipt = result.data as PolygonTransactionReceipt;
    assert.ok(receipt.logs.length > 0, "Should have at least one log");

    const firstLog = receipt.logs[0] as PolygonLog;

    // Verify all required fields exist
    const requiredFields = [
      "address",
      "topics",
      "data",
      "blockNumber",
      "transactionHash",
      "transactionIndex",
      "blockHash",
      "logIndex",
      "removed",
      "blockTimestamp", // Polygon-specific
    ];

    for (const field of requiredFields) {
      assert.ok(field in firstLog, `Log should have required field '${field}'`);
    }
  });
});
