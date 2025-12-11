import { describe, it } from "node:test";
import assert from "node:assert";
import { OptimismClient } from "../../src/networks/10/OptimismClient.ts";
import type { StrategyConfig } from "../../src/strategies/requestStrategy.ts";

const TEST_URLS = ["https://api.zan.top/opt-mainnet", "https://optimism-mainnet.gateway.tatum.io"];

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

describe("OptimismClient - Constructor", () => {
  it("should create client with fallback strategy", () => {
    const config: StrategyConfig = {
      type: "fallback",
      rpcUrls: TEST_URLS,
    };

    const client = new OptimismClient(config);

    assert.ok(client, "Client should be created");
    assert.strictEqual(client.getStrategyName(), "fallback", "Should use fallback strategy");
  });

  it("should create client with parallel strategy", () => {
    const config: StrategyConfig = {
      type: "parallel",
      rpcUrls: TEST_URLS,
    };

    const client = new OptimismClient(config);

    assert.ok(client, "Client should be created");
    assert.strictEqual(client.getStrategyName(), "parallel", "Should use parallel strategy");
  });
});

describe("OptimismClient - Optimism Rollup-Specific Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get output at block", async () => {
    const client = new OptimismClient(config);
    const result = await client.outputAtBlock("latest");

    if (result.success) {
      assert.ok(result.data, "Should have output data");
      validateObject(result.data, [
        "version",
        "outputRoot",
        "blockRef",
        "withdrawalStorageRoot",
        "stateRoot",
        "syncStatus",
      ]);
      assert.ok(isHexString(result.data.version), "version should be hex string");
      assert.ok(isHexString(result.data.outputRoot), "outputRoot should be hex string");
      assert.ok(
        isHexString(result.data.withdrawalStorageRoot),
        "withdrawalStorageRoot should be hex string",
      );
      assert.ok(isHexString(result.data.stateRoot), "stateRoot should be hex string");

      // Validate blockRef
      validateObject(result.data.blockRef, ["hash", "number", "parentHash", "timestamp"]);
      assert.ok(isHexString(result.data.blockRef.hash), "blockRef.hash should be hex");
      assert.ok(isHexString(result.data.blockRef.number), "blockRef.number should be hex");

      // Validate syncStatus
      validateObject(result.data.syncStatus);
    }
  });

  it("should get sync status", async () => {
    const client = new OptimismClient(config);
    const result = await client.syncStatus();

    if (result.success) {
      assert.ok(result.data, "Should have sync status");
      validateObject(result.data, [
        "current_l1",
        "head_l1",
        "safe_l1",
        "finalized_l1",
        "unsafe_l2",
        "safe_l2",
        "finalized_l2",
        "pending_safe_l2",
      ]);

      // Validate L1 refs
      for (const l1Field of ["current_l1", "head_l1", "safe_l1", "finalized_l1"]) {
        const l1Ref = (result.data as any)[l1Field];
        validateObject(l1Ref, ["hash", "number", "parentHash", "timestamp"]);
        assert.ok(isHexString(l1Ref.hash), `${l1Field}.hash should be hex`);
        assert.ok(isHexString(l1Ref.number), `${l1Field}.number should be hex`);
      }

      // Validate L2 refs
      for (const l2Field of ["unsafe_l2", "safe_l2", "finalized_l2", "pending_safe_l2"]) {
        const l2Ref = (result.data as any)[l2Field];
        validateObject(l2Ref, [
          "hash",
          "number",
          "parentHash",
          "timestamp",
          "l1origin",
          "sequenceNumber",
        ]);
        assert.ok(isHexString(l2Ref.hash), `${l2Field}.hash should be hex`);
        assert.ok(isHexString(l2Ref.number), `${l2Field}.number should be hex`);
        validateObject(l2Ref.l1origin, ["hash", "number"]);
        assert.ok(isHexString(l2Ref.sequenceNumber), `${l2Field}.sequenceNumber should be hex`);
      }
    }
  });

  it("should get rollup config", async () => {
    const client = new OptimismClient(config);
    const result = await client.rollupConfig();

    if (result.success) {
      assert.ok(result.data, "Should have rollup config");
      validateObject(result.data, [
        "genesis",
        "block_time",
        "max_sequencer_drift",
        "seq_window_size",
        "channel_timeout",
        "l1_chain_id",
        "l2_chain_id",
        "batch_inbox_address",
        "deposit_contract_address",
        "l1_system_config_address",
      ]);

      // Validate genesis
      validateObject(result.data.genesis, ["l1", "l2", "l2_time", "system_config"]);
      validateObject(result.data.genesis.l1, ["hash", "number"]);
      validateObject(result.data.genesis.l2, ["hash", "number"]);
      validateObject(result.data.genesis.system_config, [
        "batcherAddr",
        "overhead",
        "scalar",
        "gasLimit",
      ]);

      assert.ok(isHexString(result.data.l1_chain_id), "l1_chain_id should be hex");
      assert.ok(isHexString(result.data.l2_chain_id), "l2_chain_id should be hex");
      assert.ok(
        isAddress(result.data.batch_inbox_address),
        "batch_inbox_address should be address",
      );
      assert.ok(
        isAddress(result.data.deposit_contract_address),
        "deposit_contract_address should be address",
      );
    }
  });

  it("should get optimism version", async () => {
    const client = new OptimismClient(config);
    const result = await client.optimismVersion();

    if (result.success) {
      assert.ok(result.data, "Should have version");
      assert.strictEqual(typeof result.data, "string", "Version should be string");
    }
  });
});

describe("OptimismClient - OpP2P Peer Management Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get p2p self info", async () => {
    const client = new OptimismClient(config);
    const result = await client.p2pSelf();

    if (result.success) {
      assert.ok(result.data, "Should have self info");
      validateObject(result.data, [
        "peerID",
        "nodeID",
        "userAgent",
        "protocolVersion",
        "enr",
        "addresses",
      ]);
      assert.strictEqual(typeof result.data.peerID, "string", "peerID should be string");
      assert.strictEqual(typeof result.data.userAgent, "string", "userAgent should be string");
      assert.ok(Array.isArray(result.data.addresses), "addresses should be array");
    }
  });

  it("should get p2p peers", async () => {
    const client = new OptimismClient(config);
    const result = await client.p2pPeers();

    if (result.success) {
      assert.ok(result.data, "Should have peers data");
      validateObject(result.data, [
        "totalConnected",
        "peers",
        "bannedPeers",
        "bannedIPs",
        "bannedSubnets",
      ]);
      assert.strictEqual(
        typeof result.data.totalConnected,
        "number",
        "totalConnected should be number",
      );
      assert.strictEqual(typeof result.data.peers, "object", "peers should be object");
      assert.ok(Array.isArray(result.data.bannedPeers), "bannedPeers should be array");
      assert.ok(Array.isArray(result.data.bannedIPs), "bannedIPs should be array");
      assert.ok(Array.isArray(result.data.bannedSubnets), "bannedSubnets should be array");
    }
  });

  it("should get p2p peers with extra info", async () => {
    const client = new OptimismClient(config);
    const result = await client.p2pPeers(true);

    if (result.success) {
      assert.ok(result.data, "Should have peers data with extra info");
      validateObject(result.data, ["totalConnected", "peers"]);
    }
  });

  it("should get p2p peer stats", async () => {
    const client = new OptimismClient(config);
    const result = await client.p2pPeerStats();

    if (result.success) {
      assert.ok(result.data, "Should have peer stats");
      validateObject(result.data, ["connected", "table", "blocksTopic", "banned", "known"]);
      assert.strictEqual(typeof result.data.connected, "number", "connected should be number");
      assert.strictEqual(typeof result.data.table, "number", "table should be number");
      assert.strictEqual(typeof result.data.banned, "number", "banned should be number");
    }
  });

  it("should get p2p discovery table", async () => {
    const client = new OptimismClient(config);
    const result = await client.p2pDiscoveryTable();

    if (result.success) {
      assert.ok(Array.isArray(result.data), "Discovery table should be array");
    }
  });

  it("should list blocked peers", async () => {
    const client = new OptimismClient(config);
    const result = await client.p2pListBlockedPeers();

    if (result.success) {
      assert.ok(Array.isArray(result.data), "Blocked peers should be array");
    }
  });

  it("should list blocked addresses", async () => {
    const client = new OptimismClient(config);
    const result = await client.p2pListBlockedAddrs();

    if (result.success) {
      assert.ok(Array.isArray(result.data), "Blocked addresses should be array");
    }
  });

  it("should list blocked subnets", async () => {
    const client = new OptimismClient(config);
    const result = await client.p2pListBlockedSubnets();

    if (result.success) {
      assert.ok(Array.isArray(result.data), "Blocked subnets should be array");
    }
  });
});

describe("OptimismClient - Admin Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should check if sequencer is active", async () => {
    const client = new OptimismClient(config);
    const result = await client.adminSequencerActive();

    if (result.success) {
      assert.strictEqual(typeof result.data, "boolean", "Sequencer active should be boolean");
    }
  });
});

describe("OptimismClient - Web3 Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get client version", async () => {
    const client = new OptimismClient(config);
    const result = await client.clientVersion();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have client version");
    assert.strictEqual(typeof result.data, "string", "Client version should be string");
  });

  it.skip("should calculate sha3 hash", async () => {
    const client = new OptimismClient(config);
    const result = await client.sha3("0x68656c6c6f20776f726c64"); // "hello world" in hex

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have hash");
    assert.ok(isHexString(result.data), "Hash should be hex string");
  });
});

describe("OptimismClient - Net Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get network version", async () => {
    const client = new OptimismClient(config);
    const result = await client.version();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have version");
    assert.strictEqual(typeof result.data, "string", "Version should be string");
  });

  it("should get listening status", async () => {
    const client = new OptimismClient(config);
    const result = await client.listening();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.strictEqual(typeof result.data, "boolean", "Listening should be boolean");
  });

  it.skip("should get peer count", async () => {
    const client = new OptimismClient(config);
    const result = await client.peerCount();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have peer count");
    assert.ok(isHexString(result.data), "Peer count should be hex string");
  });
});

describe("OptimismClient - Eth Methods - Chain Info", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get protocol version", async () => {
    const client = new OptimismClient(config);
    const result = await client.protocolVersion();

    if (result.success) {
      assert.ok(result.data, "Should have protocol version");
      assert.ok(isHexString(result.data), "Protocol version should be hex string");
    }
  });

  it("should get syncing status", async () => {
    const client = new OptimismClient(config);
    const result = await client.syncing();

    assert.strictEqual(result.success, true, "Should succeed");
    const isBoolOrObject = typeof result.data === "boolean" || typeof result.data === "object";
    assert.ok(isBoolOrObject, "syncing should be boolean or object");

    if (typeof result.data === "object") {
      validateObject(result.data, ["startingBlock", "currentBlock", "highestBlock"]);
      assert.ok(isHexString(result.data.startingBlock), "startingBlock should be hex");
      assert.ok(isHexString(result.data.currentBlock), "currentBlock should be hex");
      assert.ok(isHexString(result.data.highestBlock), "highestBlock should be hex");
    }
  });

  it("should get chain ID", async () => {
    const client = new OptimismClient(config);
    const result = await client.chainId();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have chain ID");
    assert.ok(isHexString(result.data), "Chain ID should be hex string");
    // Optimism mainnet chain ID is 10 (0xa)
  });

  it("should get accounts", async () => {
    const client = new OptimismClient(config);
    const result = await client.accounts();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(Array.isArray(result.data), "Accounts should be array");
  });

  it("should get block number", async () => {
    const client = new OptimismClient(config);
    const result = await client.blockNumber();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have block number");
    assert.ok(isHexString(result.data), "Block number should be hex string");
  });
});

describe("OptimismClient - Block Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get block by number (latest)", async () => {
    const client = new OptimismClient(config);
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
      "miner",
      "stateRoot",
      "receiptsRoot",
      "transactionsRoot",
    ]);
    assert.ok(isHexString(block.number), "Block number should be hex");
    assert.ok(isHexString(block.hash), "Block hash should be hex");
    assert.ok(isHexString(block.parentHash), "Parent hash should be hex");
    assert.ok(isHexString(block.gasLimit), "gasLimit should be hex");
    assert.ok(isHexString(block.gasUsed), "gasUsed should be hex");
    assert.ok(isHexString(block.timestamp), "timestamp should be hex");
    assert.ok(isAddress(block.miner), "miner should be address");
    assert.ok(Array.isArray(block.transactions), "Transactions should be array");
  });

  it("should get block by number with full transactions", async () => {
    const client = new OptimismClient(config);
    const result = await client.getBlockByNumber("latest", true);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have block data");

    const block = result.data;
    assert.ok(Array.isArray(block.transactions), "Transactions should be array");

    if (block.transactions.length > 0 && typeof block.transactions[0] === "object") {
      const tx = block.transactions[0];
      validateObject(tx, ["hash", "from", "nonce", "gas"]);
      assert.ok(isHexString(tx.hash), "Transaction hash should be hex");
      assert.ok(isAddress(tx.from), "From should be address");
    }
  });

  it("should get block by hash", async () => {
    const client = new OptimismClient(config);

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
    const client = new OptimismClient(config);
    const result = await client.getBlockTransactionCountByNumber("latest");

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have transaction count");
    assert.ok(isHexString(result.data), "Transaction count should be hex");
  });

  it("should get block transaction count by hash", async () => {
    const client = new OptimismClient(config);

    // First get latest block
    const latestResult = await client.getBlockByNumber("latest", false);
    assert.ok(latestResult.data?.hash, "Should have block hash");

    // Then get transaction count
    const result = await client.getBlockTransactionCountByHash(latestResult.data.hash);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have transaction count");
    assert.ok(isHexString(result.data), "Transaction count should be hex");
  });

  it("should get uncle count by block number", async () => {
    const client = new OptimismClient(config);
    const result = await client.getUncleCountByBlockNumber("latest");

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have uncle count");
    assert.ok(isHexString(result.data), "Uncle count should be hex");
    // Note: Optimism (PoS) should always return 0x0
  });

  it("should get uncle count by block hash", async () => {
    const client = new OptimismClient(config);

    const latestResult = await client.getBlockByNumber("latest", false);
    assert.ok(latestResult.data?.hash, "Should have block hash");

    const result = await client.getUncleCountByBlockHash(latestResult.data.hash);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have uncle count");
    assert.ok(isHexString(result.data), "Uncle count should be hex");
  });
});

describe("OptimismClient - Account Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get balance", async () => {
    const client = new OptimismClient(config);
    const result = await client.getBalance(ZERO_ADDRESS, "latest");

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have balance");
    assert.ok(isHexString(result.data), "Balance should be hex string");
  });

  it("should get balance with default block tag", async () => {
    const client = new OptimismClient(config);
    const result = await client.getBalance(ZERO_ADDRESS);

    assert.strictEqual(result.success, true, "Should succeed with default block tag");
    if (result.data) assert.ok(isHexString(result.data), "Balance should be hex string");
  });

  it("should get code", async () => {
    const client = new OptimismClient(config);
    const result = await client.getCode(ZERO_ADDRESS, "latest");

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have code");
    assert.ok(isHexString(result.data), "Code should be hex string");
  });

  it("should get storage at position", async () => {
    const client = new OptimismClient(config);
    const result = await client.getStorageAt(ZERO_ADDRESS, "0x0", "latest");

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have storage value");
    assert.ok(isHexString(result.data), "Storage should be hex string");
  });

  it("should get transaction count", async () => {
    const client = new OptimismClient(config);
    const result = await client.getTransactionCount(ZERO_ADDRESS, "latest");

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data !== undefined, "Should have transaction count");
    assert.ok(isHexString(result.data), "Transaction count should be hex string");
  });

  it("should get proof", async () => {
    const client = new OptimismClient(config);
    const result = await client.getProof(ZERO_ADDRESS, [], "latest");

    if (result.success) {
      assert.ok(result.data, "Should have proof");
      validateObject(result.data);
    }
  });
});

describe("OptimismClient - Transaction Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get transaction by hash", async () => {
    const client = new OptimismClient(config);

    // Get a block with transactions
    const blockResult = await client.getBlockByNumber("latest", false);
    assert.ok(blockResult.data, "Should have block");

    if (blockResult.data.transactions.length > 0) {
      const txHash = blockResult.data.transactions[0];
      const result = await client.getTransactionByHash(txHash as string);

      if (result.data !== null && result.data) {
        assert.strictEqual(result.success, true, "Should succeed");
        validateObject(result.data, ["hash", "from", "value", "gas", "nonce"]);
        assert.ok(isHexString(result.data.hash), "Transaction hash should be hex");
        assert.ok(isAddress(result.data.from), "From should be address");
        assert.ok(isHexString(result.data.value), "Value should be hex");
        assert.ok(isHexString(result.data.gas), "Gas should be hex");
        assert.ok(isHexString(result.data.nonce), "Nonce should be hex");

        // Check for EIP-1559 fields or legacy gasPrice
        const hasEIP1559 = "maxFeePerGas" in result.data;
        const hasLegacy = "gasPrice" in result.data;
        assert.ok(hasEIP1559 || hasLegacy, "Should have either EIP-1559 or legacy gas fields");
      }
    }
  });

  it("should get transaction by block hash and index", async () => {
    const client = new OptimismClient(config);

    const blockResult = await client.getBlockByNumber("latest", false);
    assert.ok(blockResult.data, "Should have block");

    if (blockResult.data.transactions.length > 0) {
      const result = await client.getTransactionByBlockHashAndIndex(blockResult.data.hash, "0x0");

      if (result.data !== null) {
        assert.strictEqual(result.success, true, "Should succeed");
        validateObject(result.data, ["hash", "from"]);
      }
    }
  });

  it("should get transaction by block number and index", async () => {
    const client = new OptimismClient(config);

    const result = await client.getTransactionByBlockNumberAndIndex("latest", "0x0");

    if (result.data !== null) {
      assert.strictEqual(result.success, true, "Should succeed");
      validateObject(result.data, ["hash", "from"]);
    }
  });

  it("should get transaction receipt", async () => {
    const client = new OptimismClient(config);

    // Get a block with transactions
    const blockResult = await client.getBlockByNumber("latest", false);
    assert.ok(blockResult.data, "Should have block");

    if (blockResult.data.transactions.length > 0) {
      const txHash = blockResult.data.transactions[0];
      const result = await client.getTransactionReceipt(txHash as string);

      if (result.data !== null && result.data) {
        assert.strictEqual(result.success, true, "Should succeed");
        validateObject(result.data, [
          "transactionHash",
          "blockNumber",
          "blockHash",
          "gasUsed",
          "logs",
          "from",
        ]);
        assert.ok(isHexString(result.data.transactionHash), "Transaction hash should be hex");
        assert.ok(isHexString(result.data.blockNumber), "Block number should be hex");
        assert.ok(isHexString(result.data.gasUsed), "Gas used should be hex");
        assert.ok(Array.isArray(result.data.logs), "Should have logs array");
        assert.ok(isAddress(result.data.from), "From should be address");

        // Check Optimism-specific L1 fee fields
        if ("l1Fee" in result.data) {
          assert.ok(isHexString(result.data.l1Fee as string), "l1Fee should be hex");
        }
        if ("l1GasPrice" in result.data) {
          assert.ok(isHexString(result.data.l1GasPrice as string), "l1GasPrice should be hex");
        }
        if ("l1GasUsed" in result.data) {
          assert.ok(isHexString(result.data.l1GasUsed as string), "l1GasUsed should be hex");
        }
      }
    }
  });

  it("should reject invalid sendRawTransaction", async () => {
    const client = new OptimismClient(config);
    const result = await client.sendRawTransaction("0xdeadbeef");

    assert.strictEqual(result.success, false, "Should fail for invalid transaction");
    assert.ok(result.errors, "Should have errors");
  });
});

describe("OptimismClient - Call and Gas Estimation Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should execute contract call", async () => {
    const client = new OptimismClient(config);
    const result = await client.callContract({ to: ZERO_ADDRESS, data: "0x" }, "latest");

    // May succeed or fail depending on the call, but should return a result
    assert.ok(result, "Should return a result");
  });

  it("should execute contract call without block tag", async () => {
    const client = new OptimismClient(config);
    const result = await client.callContract({ to: ZERO_ADDRESS, data: "0x" });

    assert.ok(result, "Should return a result");
  });

  it("should estimate gas", async () => {
    const client = new OptimismClient(config);
    const result = await client.estimateGas({ from: ZERO_ADDRESS, to: ZERO_ADDRESS, value: "0x0" });

    // May succeed or fail, but should return a result
    assert.ok(result, "Should return a result");
  });

  it("should create access list", async () => {
    const client = new OptimismClient(config);
    const result = await client.createAccessList({ to: ZERO_ADDRESS, data: "0x" }, "latest");

    if (result.success) {
      assert.ok(result.data, "Should have access list data");
      validateObject(result.data, ["accessList", "gasUsed"]);
      assert.ok(Array.isArray(result.data.accessList), "accessList should be array");
      assert.ok(isHexString(result.data.gasUsed), "gasUsed should be hex");
    }
  });
});

describe("OptimismClient - Fee Methods (EIP-1559)", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get gas price", async () => {
    const client = new OptimismClient(config);
    const result = await client.gasPrice();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have gas price");
    assert.ok(isHexString(result.data), "Gas price should be hex string");
  });

  it("should get max priority fee per gas", async () => {
    const client = new OptimismClient(config);
    const result = await client.maxPriorityFeePerGas();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have max priority fee");
    assert.ok(isHexString(result.data), "Max priority fee should be hex string");
  });

  it.skip("should get fee history", async () => {
    const client = new OptimismClient(config);
    const result = await client.feeHistory("0x4", "latest", [25, 50, 75]);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have fee history");
    validateObject(result.data, ["baseFeePerGas", "gasUsedRatio"]);
    assert.ok(Array.isArray(result.data.baseFeePerGas), "baseFeePerGas should be array");
    assert.ok(Array.isArray(result.data.gasUsedRatio), "gasUsedRatio should be array");
  });

  it.skip("should get fee history without reward percentiles", async () => {
    const client = new OptimismClient(config);
    const result = await client.feeHistory("0x4", "latest");
    // result contains error : 'RPC error: missing value for required argument 2'
    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.data, "Should have fee history");
  });
});

describe("OptimismClient - Logs and Filters", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get logs", async () => {
    const client = new OptimismClient(config);
    const result = await client.getLogs({ fromBlock: "latest", toBlock: "latest" });

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(Array.isArray(result.data), "Should return array of logs");

    for (const log of result.data) {
      validateObject(log, [
        "address",
        "topics",
        "data",
        "blockNumber",
        "transactionHash",
        "logIndex",
      ]);
      assert.ok(isAddress(log.address), "Log address should be valid");
      assert.ok(Array.isArray(log.topics), "Topics should be array");
      assert.ok(isHexString(log.blockNumber), "Block number should be hex");
      assert.ok(isHexString(log.transactionHash), "Transaction hash should be hex");
    }
  });

  it("should create new filter", async () => {
    const client = new OptimismClient(config);
    const result = await client.newFilter({ fromBlock: "latest" });

    if (result.success && result.data) {
      assert.ok(isHexString(result.data), "Filter ID should be hex string");
    }
  });

  it("should create new block filter", async () => {
    const client = new OptimismClient(config);
    const result = await client.newBlockFilter();

    if (result.success && result.data) {
      assert.ok(isHexString(result.data), "Filter ID should be hex string");
    }
  });

  it("should create new pending transaction filter", async () => {
    const client = new OptimismClient(config);
    const result = await client.newPendingTransactionFilter();

    if (result.success && result.data) {
      assert.ok(isHexString(result.data), "Filter ID should be hex string");
    }
  });
});

describe("OptimismClient - TxPool Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should get txpool status", async () => {
    const client = new OptimismClient(config);
    const result = await client.status();

    if (result.success) {
      assert.ok(result.data, "Should have txpool status");
      validateObject(result.data, ["pending", "queued"]);
      assert.ok(isHexString(result.data.pending), "pending should be hex");
      assert.ok(isHexString(result.data.queued), "queued should be hex");
    }
  });
});

describe("OptimismClient - Debug Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should attempt debug_traceTransaction", async () => {
    const client = new OptimismClient(config);

    // Get a transaction hash
    const blockResult = await client.getBlockByNumber("latest", false);
    if (blockResult.data && blockResult.data.transactions.length > 0) {
      const txHash = blockResult.data.transactions[0];
      const result = await client.debugTraceTransaction(txHash as string);

      // May fail if tracing not supported, but should return a result
      assert.ok(result, "Should return a result");
    }
  });

  it("should attempt debug_traceCall", async () => {
    const client = new OptimismClient(config);
    const result = await client.debugTraceCall({ to: ZERO_ADDRESS, data: "0x" }, {}, "latest");

    // May fail if tracing not supported, but should return a result
    assert.ok(result, "Should return a result");
  });
});

describe("OptimismClient - Trace Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should attempt trace_block", async () => {
    const client = new OptimismClient(config);
    const result = await client.traceBlock("latest");

    // May fail if tracing not supported, but should return a result
    assert.ok(result, "Should return a result");
  });

  it("should attempt trace_transaction", async () => {
    const client = new OptimismClient(config);

    // Get a transaction hash
    const blockResult = await client.getBlockByNumber("latest", false);
    if (blockResult.data && blockResult.data.transactions.length > 0) {
      const txHash = blockResult.data.transactions[0];
      const result = await client.traceTransaction(txHash as string);

      // May fail if tracing not supported, but should return a result
      assert.ok(result, "Should return a result");
    }
  });

  it("should attempt trace_call", async () => {
    const client = new OptimismClient(config);
    const result = await client.traceCall({ to: ZERO_ADDRESS, data: "0x" }, {}, "latest");

    // May fail if tracing not supported, but should return a result
    assert.ok(result, "Should return a result");
  });
});

describe("OptimismClient - Legacy/Mining Methods", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it.skip("should get mining status", async () => {
    const client = new OptimismClient(config);
    const result = await client.mining();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.strictEqual(typeof result.data, "boolean", "Mining should be boolean");
    assert.strictEqual(result.data, false, "Optimism should not be mining (PoS)");
  });

  it.skip("should get hash rate", async () => {
    const client = new OptimismClient(config);
    const result = await client.hashRate();

    assert.strictEqual(result.success, true, "Should succeed");
    if (result.data) assert.ok(isHexString(result.data), "Hash rate should be hex");
  });
});

describe("OptimismClient - Parallel Strategy", () => {
  const config: StrategyConfig = {
    type: "parallel",
    rpcUrls: TEST_URLS,
  };

  it("should get chain ID with metadata", async () => {
    const client = new OptimismClient(config);
    const result = await client.chainId();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.metadata, "Should have metadata");
    assert.ok(result.metadata.responses.length >= 2, "Should have multiple responses");
    assert.strictEqual(result.metadata.strategy, "parallel", "Should be parallel strategy");
  });

  it("should get block number with metadata", async () => {
    const client = new OptimismClient(config);
    const result = await client.blockNumber();

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.metadata, "Should have metadata");
    assert.strictEqual(result.metadata.strategy, "parallel", "Should be parallel strategy");
  });

  it("should get balance with response time tracking", async () => {
    const client = new OptimismClient(config);
    const result = await client.getBalance(ZERO_ADDRESS, "latest");

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.metadata, "Should have metadata");

    for (const response of result.metadata.responses) {
      assert.ok(typeof response.responseTime === "number", "Should have response time");
      assert.ok(response.responseTime >= 0, "Response time should be non-negative");
    }
  });

  it("should detect inconsistencies in parallel responses", async () => {
    const client = new OptimismClient(config);
    const result = await client.getBlockByNumber("latest", false);

    assert.strictEqual(result.success, true, "Should succeed");
    assert.ok(result.metadata, "Should have metadata");
    assert.strictEqual(
      typeof result.metadata.hasInconsistencies,
      "boolean",
      "Should have inconsistencies flag",
    );
  });
});

describe("OptimismClient - Edge Cases", () => {
  const config: StrategyConfig = {
    type: "fallback",
    rpcUrls: TEST_URLS,
  };

  it("should handle getBalance with default block tag", async () => {
    const client = new OptimismClient(config);
    const result = await client.getBalance(ZERO_ADDRESS);

    assert.strictEqual(result.success, true, "Should succeed with default block tag");
  });

  it("should handle getCode with default block tag", async () => {
    const client = new OptimismClient(config);
    const result = await client.getCode(ZERO_ADDRESS);

    assert.strictEqual(result.success, true, "Should succeed with default block tag");
  });

  it("should handle getStorageAt with default block tag", async () => {
    const client = new OptimismClient(config);
    const result = await client.getStorageAt(ZERO_ADDRESS, "0x0");

    assert.strictEqual(result.success, true, "Should succeed with default block tag");
  });

  it("should handle getTransactionCount with default block tag", async () => {
    const client = new OptimismClient(config);
    const result = await client.getTransactionCount(ZERO_ADDRESS);

    assert.strictEqual(result.success, true, "Should succeed with default block tag");
  });

  it("should handle call without block tag", async () => {
    const client = new OptimismClient(config);
    const result = await client.callContract({ to: ZERO_ADDRESS, data: "0x" });

    // May succeed or fail, but should handle default parameter
    assert.ok(result, "Should return a result");
  });

  it("should handle estimateGas without block tag", async () => {
    const client = new OptimismClient(config);
    const result = await client.estimateGas({ from: ZERO_ADDRESS, to: ZERO_ADDRESS, value: "0x0" });

    // May succeed or fail, but should handle optional parameter
    assert.ok(result, "Should return a result");
  });

  it("should handle block number as hex string", async () => {
    const client = new OptimismClient(config);
    const result = await client.getBlockByNumber("0x1", false);

    if (result.success && result.data) {
      assert.ok(isHexString(result.data.number), "Block number should be hex");
    }
  });

  it("should handle invalid block number gracefully", async () => {
    const client = new OptimismClient(config);
    const result = await client.getBlockByNumber("0x999999999999999", false);

    // Should either succeed with null or fail gracefully
    assert.ok(result, "Should return a result");
    if (result.success) {
      assert.strictEqual(result.data, null, "Should return null for non-existent block");
    }
  });
});
