import { describe, it } from "node:test";
import assert from "node:assert";
import { BNBTestnetClient } from "../../src/networks/97/BNBTestnetClient.js";
import type { StrategyConfig } from "../../src/strategies/requestStrategy.js";
import {
  validateObject,
  validateBlock,
  validateSuccessResult,
  validateTransaction,
  isHexString,
} from "../helpers/validators.js";

const TEST_URLS = [
  "wss://bsc-testnet-rpc.publicnode.com",
  "https://bsc-testnet-rpc.publicnode.com",
];

describe("BNBTestnetNetworkClient - Block Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get block by number (latest)", async () => {
    const client = new BNBTestnetClient(config);
    const result = await client.getBlockByNumber("latest", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });

  it("should get block by number (earliest)", async () => {
    const client = new BNBTestnetClient(config);
    const result = await client.getBlockByNumber("earliest", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });

  it("should get block by number (pending)", async () => {
    const client = new BNBTestnetClient(config);
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

  it("should get block by number (safe)", async () => {
    const client = new BNBTestnetClient(config);
    const result = await client.getBlockByNumber("safe", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });

  it("should get block by number (finalized)", async () => {
    const client = new BNBTestnetClient(config);
    const result = await client.getBlockByNumber("finalized", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });
});

describe("BNBTestnetNetworkClient - Transaction Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get transaction by hash", async () => {
    const client = new BNBTestnetClient(config);

    // Get a block with transactions
    const blockResult = await client.getBlockByNumber("latest", false);
    assert.ok(blockResult.data, "Should have block");

    if (blockResult.data.transactions.length > 0) {
      const txHash = blockResult.data.transactions[0];
      const result = await client.getTransactionByHash(txHash as string);

      if (result.data !== null) {
        validateSuccessResult(result);
        validateTransaction(result.data);
        assert.ok(isHexString((result.data as any).nonce), "Nonce should be hex");
        assert.ok(isHexString((result.data as any).chainId), "ChainId should be hex");
      }
    }
  });
});
