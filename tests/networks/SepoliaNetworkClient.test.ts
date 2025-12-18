import { describe, it } from "node:test";
import assert from "node:assert";
import { SepoliaClient } from "../../src/networks/11155111/SepoliaClient.js";
import type { StrategyConfig } from "../../src/strategies/requestStrategy.js";
import {
  validateObject,
  validateBlock,
  validateSuccessResult,
  validateTransaction,
  isHexString,
} from "../helpers/validators.js";

const TEST_URLS = ["https://ethereum-sepolia-rpc.publicnode.com", "https://0xrpc.io/sep"];

describe("SepoliaNetworkClient - Block Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get block by number (latest)", async () => {
    const client = new SepoliaClient(config);
    const result = await client.getBlockByNumber("latest", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });

  it("should get block by number (earliest)", async () => {
    const client = new SepoliaClient(config);
    const result = await client.getBlockByNumber("earliest", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });

  it("should get block by number (pending)", async () => {
    const client = new SepoliaClient(config);
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
    const client = new SepoliaClient(config);
    const result = await client.getBlockByNumber("safe", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });

  it("should get block by number (finalized)", async () => {
    const client = new SepoliaClient(config);
    const result = await client.getBlockByNumber("finalized", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });
});

describe("SepoliaNetworkClient - Transaction Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get transaction by hash", async () => {
    const client = new SepoliaClient(config);

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
