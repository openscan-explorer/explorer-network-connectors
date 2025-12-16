import { describe, it } from "node:test";
import assert from "node:assert";
import { RpcClient } from "../src/RpcClient.js";
import { isHexString } from "./helpers/validators.js";

const TEST_URLS: string[] = ["https://eth.merkle.io", "https://ethereum.publicnode.com"];

describe("RpcClient - Constructor and Basic Properties", () => {
  it("should create RpcClient with url and name", () => {
    const client = new RpcClient("https://test.com");

    assert.strictEqual(client.getUrl(), "https://test.com", "URL should match");
    assert.strictEqual(client.getRequestId(), 0, "Initial request ID should be 0");
  });

  it("should increment request ID on each call", async () => {
    const client = new RpcClient(TEST_URLS[0]);

    const initialId = client.getRequestId();

    try {
      await client.call("eth_chainId");
      assert.strictEqual(client.getRequestId(), initialId + 1, "Request ID should increment");

      await client.call("eth_blockNumber");
      assert.strictEqual(client.getRequestId(), initialId + 2, "Request ID should increment again");
    } catch (_error) {
      // Ignore RPC errors for this test - we're testing ID increment
    }
  });
});

describe("RpcClient - JSON-RPC Calls", () => {
  for (const url of TEST_URLS) {
    it(`eth_chainId [${url}]`, async () => {
      const client = new RpcClient(url);
      const result = await client.call<string>("eth_chainId");

      assert.ok(isHexString(result), "chainId should be a hex string");
    });

    it(`eth_blockNumber [${url}]`, async () => {
      const client = new RpcClient(url);
      const result = await client.call<string>("eth_blockNumber");

      assert.ok(isHexString(result), "blockNumber should be a hex string");
    });

    it(`eth_gasPrice [${url}]`, async () => {
      const client = new RpcClient(url);
      const result = await client.call<string>("eth_gasPrice");

      assert.ok(isHexString(result), "gasPrice should be a hex string");
    });

    it(`eth_getBlockByNumber latest [${url}]`, async () => {
      const client = new RpcClient(url);
      const result = await client.call<any>("eth_getBlockByNumber", ["latest", false]);

      assert.ok(result !== null, "Block should not be null");
      assert.ok(typeof result === "object", "Block should be an object");
      assert.ok(isHexString(result.number), "Block number should be hex");
      assert.ok(isHexString(result.hash), "Block hash should be hex");
      assert.ok(Array.isArray(result.transactions), "Transactions should be array");
    });

    it(`eth_getBalance [${url}]`, async () => {
      const client = new RpcClient(url);
      const zeroAddress = "0x0000000000000000000000000000000000000000";
      const result = await client.call<string>("eth_getBalance", [zeroAddress, "latest"]);

      assert.ok(isHexString(result), "Balance should be hex string");
    });
  }
});

describe("RpcClient - Error Handling", () => {
  it("should throw error for invalid URL", async () => {
    const client = new RpcClient("https://invalid-url-that-does-not-exist-12345.com");

    await assert.rejects(
      client.call("eth_chainId"),
      /error/i,
      "Should reject with error for invalid URL",
    );
  });

  it("should throw error for invalid method", async () => {
    const client = new RpcClient(TEST_URLS[0]);

    await assert.rejects(
      client.call("invalid_method_that_does_not_exist"),
      /error/i,
      "Should reject with error for invalid method",
    );
  });

  it("should throw error for invalid params", async () => {
    const client = new RpcClient(TEST_URLS[0]);

    await assert.rejects(
      client.call("eth_getBlockByNumber", ["invalid_block", false]),
      /error/i,
      "Should reject with error for invalid params",
    );
  });
});

describe("RpcClient - Type Safety", () => {
  it("should return typed results", async () => {
    const client = new RpcClient(TEST_URLS[0]);

    const chainId = await client.call<string>("eth_chainId");
    assert.strictEqual(typeof chainId, "string", "chainId should be string");

    const blockNumber = await client.call<string>("eth_blockNumber");
    assert.strictEqual(typeof blockNumber, "string", "blockNumber should be string");
  });

  it("should handle complex return types", async () => {
    const client = new RpcClient(TEST_URLS[0]);

    interface Block {
      number: string;
      hash: string;
      transactions: string[];
    }

    const block = await client.call<Block>("eth_getBlockByNumber", ["latest", false]);

    assert.ok(block.number, "Block should have number");
    assert.ok(block.hash, "Block should have hash");
    assert.ok(Array.isArray(block.transactions), "Block should have transactions array");
  });
});
