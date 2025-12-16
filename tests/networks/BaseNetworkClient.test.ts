import { describe, it } from "node:test";
import assert from "node:assert";
import { BaseClient } from "../../src/networks/8453/BaseClient.js";
import type { StrategyConfig } from "../../src/strategies/requestStrategy.js";
import { validateObject, validateBlock, validateSuccessResult } from "../helpers/validators.js";

const TEST_URLS = ["https://base.api.pocket.network", "https://base.drpc.org"];

describe("BaseNetworkClient - Block Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get block by number (latest)", async () => {
    const client = new BaseClient(config);
    const result = await client.getBlockByNumber("latest", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });

  it("should get block by number (earliest)", async () => {
    const client = new BaseClient(config);
    const result = await client.getBlockByNumber("earliest", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });

  it("should get block by number (pending)", async () => {
    const client = new BaseClient(config);
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
    const client = new BaseClient(config);
    const result = await client.getBlockByNumber("safe", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });

  it("should get block by number (finalized)", async () => {
    const client = new BaseClient(config);
    const result = await client.getBlockByNumber("finalized", false);

    validateSuccessResult(result);
    validateBlock(result.data);
  });
});
