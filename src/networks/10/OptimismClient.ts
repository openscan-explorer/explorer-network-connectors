import { NetworkClient } from "../../NetworkClient.js";
import type { StrategyResult } from "../../strategies/strategiesTypes.js";
import type { StrategyConfig } from "../../strategies/requestStrategy.js";
import type {
  OptimismBlock,
  OptimismTransaction,
  OptimismTransactionReceipt,
  OptimismLog,
  OptimismLogFilter,
  OptimismCallObject,
  BlockNumberOrTag,
  AccessListEntry,
  OptimismOutputAtBlock,
  OptimismSyncStatus,
  OptimismRollupConfig,
  OpP2PSelfInfo,
  OpP2PPeersResponse,
  OpP2PPeerStats,
  EthSyncingStatus,
} from "./OptimismTypes.js";

/**
 * Optimism-specific network client with typed methods
 * Chain ID: 10
 * Uses composition to integrate strategies with Optimism RPC methods
 *
 * Documentation: https://docs.optimism.io/builders/node-operators/json-rpc
 */
export class OptimismClient extends NetworkClient {
  constructor(config: StrategyConfig) {
    super(config);
  }

  // ===== Optimism Rollup-Specific Methods =====

  /**
   * Get output root and related data at a specific block
   * @param blockNumber - Block number (hex string or quantity)
   */
  async outputAtBlock(blockNumber: string): Promise<StrategyResult<OptimismOutputAtBlock>> {
    return this.execute<OptimismOutputAtBlock>("optimism_outputAtBlock", [blockNumber]);
  }

  /**
   * Get the current sync status of the rollup node
   */
  async syncStatus(): Promise<StrategyResult<OptimismSyncStatus>> {
    return this.execute<OptimismSyncStatus>("optimism_syncStatus");
  }

  /**
   * Get the rollup configuration
   */
  async rollupConfig(): Promise<StrategyResult<OptimismRollupConfig>> {
    return this.execute<OptimismRollupConfig>("optimism_rollupConfig");
  }

  /**
   * Get the version identifier of op-node software
   */
  async optimismVersion(): Promise<StrategyResult<string>> {
    return this.execute<string>("optimism_version");
  }

  // ===== OpP2P Peer Management Methods =====

  /**
   * Get information about this node
   */
  async p2pSelf(): Promise<StrategyResult<OpP2PSelfInfo>> {
    return this.execute<OpP2PSelfInfo>("opp2p_self");
  }

  /**
   * Get peers list and metadata
   * @param includeExtra - Include extra peer information
   */
  async p2pPeers(includeExtra?: boolean): Promise<StrategyResult<OpP2PPeersResponse>> {
    const params = includeExtra !== undefined ? [includeExtra] : [];
    return this.execute<OpP2PPeersResponse>("opp2p_peers", params);
  }

  /**
   * Get peer statistics
   */
  async p2pPeerStats(): Promise<StrategyResult<OpP2PPeerStats>> {
    return this.execute<OpP2PPeerStats>("opp2p_peerStats");
  }

  /**
   * Get peer discovery table entries
   */
  async p2pDiscoveryTable(): Promise<StrategyResult<string[]>> {
    return this.execute<string[]>("opp2p_discoveryTable");
  }

  /**
   * Block a peer by peer ID
   * @param peerID - Peer ID to block
   */
  async p2pBlockPeer(peerID: string): Promise<StrategyResult<null>> {
    return this.execute<null>("opp2p_blockPeer", [peerID]);
  }

  /**
   * Unblock a peer by peer ID
   * @param peerID - Peer ID to unblock
   */
  async p2pUnblockPeer(peerID: string): Promise<StrategyResult<null>> {
    return this.execute<null>("opp2p_unblockPeer", [peerID]);
  }

  /**
   * List all blocked peer IDs
   */
  async p2pListBlockedPeers(): Promise<StrategyResult<string[]>> {
    return this.execute<string[]>("opp2p_listBlockedPeers");
  }

  /**
   * Block an IP address
   * @param address - IP address to block
   */
  async p2pBlockAddr(address: string): Promise<StrategyResult<null>> {
    return this.execute<null>("opp2p_blockAddr", [address]);
  }

  /**
   * Unblock an IP address
   * @param address - IP address to unblock
   */
  async p2pUnblockAddr(address: string): Promise<StrategyResult<null>> {
    return this.execute<null>("opp2p_unblockAddr", [address]);
  }

  /**
   * List all blocked IP addresses
   */
  async p2pListBlockedAddrs(): Promise<StrategyResult<string[]>> {
    return this.execute<string[]>("opp2p_listBlockedAddrs");
  }

  /**
   * Block a subnet
   * @param subnet - Subnet to block (CIDR notation)
   */
  async p2pBlockSubnet(subnet: string): Promise<StrategyResult<null>> {
    return this.execute<null>("opp2p_blockSubnet", [subnet]);
  }

  /**
   * Unblock a subnet
   * @param subnet - Subnet to unblock (CIDR notation)
   */
  async p2pUnblockSubnet(subnet: string): Promise<StrategyResult<null>> {
    return this.execute<null>("opp2p_unblockSubnet", [subnet]);
  }

  /**
   * List all blocked subnets
   */
  async p2pListBlockedSubnets(): Promise<StrategyResult<string[]>> {
    return this.execute<string[]>("opp2p_listBlockedSubnets");
  }

  /**
   * Protect a peer from disconnection
   * @param peerID - Peer ID to protect
   */
  async p2pProtectPeer(peerID: string): Promise<StrategyResult<null>> {
    return this.execute<null>("opp2p_protectPeer", [peerID]);
  }

  /**
   * Remove protection from a peer
   * @param peerID - Peer ID to unprotect
   */
  async p2pUnprotectPeer(peerID: string): Promise<StrategyResult<null>> {
    return this.execute<null>("opp2p_unprotectPeer", [peerID]);
  }

  /**
   * Connect to a peer
   * @param multiaddr - Multiaddress of the peer
   */
  async p2pConnectPeer(multiaddr: string): Promise<StrategyResult<null>> {
    return this.execute<null>("opp2p_connectPeer", [multiaddr]);
  }

  /**
   * Disconnect from a peer
   * @param peerID - Peer ID to disconnect
   */
  async p2pDisconnectPeer(peerID: string): Promise<StrategyResult<null>> {
    return this.execute<null>("opp2p_disconnectPeer", [peerID]);
  }

  // ===== Admin Methods (Node/Sequencer Control) =====

  /**
   * Reset the derivation pipeline
   */
  async adminResetDerivationPipeline(): Promise<StrategyResult<null>> {
    return this.execute<null>("admin_resetDerivationPipeline");
  }

  /**
   * Start the sequencer
   */
  async adminStartSequencer(): Promise<StrategyResult<null>> {
    return this.execute<null>("admin_startSequencer");
  }

  /**
   * Stop the sequencer
   */
  async adminStopSequencer(): Promise<StrategyResult<null>> {
    return this.execute<null>("admin_stopSequencer");
  }

  /**
   * Check if sequencer is active
   */
  async adminSequencerActive(): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("admin_sequencerActive");
  }

  // ===== Web3 Methods =====

  /**
   * Get the client version
   */
  async clientVersion(): Promise<StrategyResult<string>> {
    return this.execute<string>("web3_clientVersion");
  }

  /**
   * Calculate Keccak-256 hash
   * @param data - Data to hash
   */
  async sha3(data: string): Promise<StrategyResult<string>> {
    return this.execute<string>("web3_sha3", [data]);
  }

  // ===== Net Methods =====

  /**
   * Get the network ID
   */
  async version(): Promise<StrategyResult<string>> {
    return this.execute<string>("net_version");
  }

  /**
   * Check if the node is listening for connections
   */
  async listening(): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("net_listening");
  }

  /**
   * Get the number of connected peers
   */
  async peerCount(): Promise<StrategyResult<string>> {
    return this.execute<string>("net_peerCount");
  }

  // ===== Eth Methods =====

  /**
   * Get the protocol version
   */
  async protocolVersion(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_protocolVersion");
  }

  /**
   * Get syncing status
   * Returns false if not syncing, or an object with sync progress if syncing
   */
  async syncing(): Promise<StrategyResult<boolean | EthSyncingStatus>> {
    return this.execute<boolean | EthSyncingStatus>("eth_syncing");
  }

  /**
   * Get the chain ID
   */
  async chainId(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_chainId");
  }

  /**
   * Get list of addresses managed by the client/node
   */
  async accounts(): Promise<StrategyResult<string[]>> {
    return this.execute<string[]>("eth_accounts");
  }

  /**
   * Get the current block number
   */
  async blockNumber(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_blockNumber");
  }

  async getBlockByNumber(
    blockTag: BlockNumberOrTag,
    fullTx: boolean = false,
  ): Promise<StrategyResult<OptimismBlock | null>> {
    return this.execute<OptimismBlock | null>("eth_getBlockByNumber", [blockTag, fullTx]);
  }

  async getBlockByHash(
    blockHash: string,
    fullTx: boolean = false,
  ): Promise<StrategyResult<OptimismBlock | null>> {
    return this.execute<OptimismBlock | null>("eth_getBlockByHash", [blockHash, fullTx]);
  }

  async getBlockTransactionCountByNumber(
    blockTag: BlockNumberOrTag,
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getBlockTransactionCountByNumber", [blockTag]);
  }

  async getBlockTransactionCountByHash(blockHash: string): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getBlockTransactionCountByHash", [blockHash]);
  }

  async getUncleCountByBlockNumber(blockTag: BlockNumberOrTag): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getUncleCountByBlockNumber", [blockTag]);
  }

  async getUncleCountByBlockHash(blockHash: string): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getUncleCountByBlockHash", [blockHash]);
  }

  async getUncleByBlockNumberAndIndex(
    blockTag: BlockNumberOrTag,
    index: string,
  ): Promise<StrategyResult<OptimismBlock | null>> {
    return this.execute<OptimismBlock | null>("eth_getUncleByBlockNumberAndIndex", [
      blockTag,
      index,
    ]);
  }

  async getUncleByBlockHashAndIndex(
    blockHash: string,
    index: string,
  ): Promise<StrategyResult<OptimismBlock | null>> {
    return this.execute<OptimismBlock | null>("eth_getUncleByBlockHashAndIndex", [
      blockHash,
      index,
    ]);
  }

  async getBalance(
    address: string,
    blockTag: BlockNumberOrTag = "latest",
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getBalance", [address, blockTag]);
  }

  async getCode(
    address: string,
    blockTag: BlockNumberOrTag = "latest",
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getCode", [address, blockTag]);
  }

  async getStorageAt(
    address: string,
    position: string,
    blockTag: BlockNumberOrTag = "latest",
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getStorageAt", [address, position, blockTag]);
  }

  async getTransactionCount(
    address: string,
    blockTag: BlockNumberOrTag = "latest",
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getTransactionCount", [address, blockTag]);
  }

  async getProof(
    address: string,
    storageKeys: string[],
    blockTag: BlockNumberOrTag,
  ): Promise<StrategyResult<unknown>> {
    return this.execute<unknown>("eth_getProof", [address, storageKeys, blockTag]);
  }

  async sendRawTransaction(signedTx: string): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_sendRawTransaction", [signedTx]);
  }

  // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  async sendTransaction(txObject: Record<string, any>): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_sendTransaction", [txObject]);
  }

  async callContract(
    callObject: OptimismCallObject,
    blockTag?: BlockNumberOrTag,
  ): Promise<StrategyResult<string>> {
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    const params: any[] = [callObject];
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<string>("eth_call", params);
  }

  async estimateGas(
    txObject: OptimismCallObject,
    blockTag?: BlockNumberOrTag,
  ): Promise<StrategyResult<string>> {
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    const params: any[] = [txObject];
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<string>("eth_estimateGas", params);
  }

  async createAccessList(
    txObject: OptimismCallObject,
    blockTag?: BlockNumberOrTag,
  ): Promise<StrategyResult<{ accessList: AccessListEntry[]; gasUsed: string }>> {
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    const params: any[] = [txObject];
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<{ accessList: AccessListEntry[]; gasUsed: string }>(
      "eth_createAccessList",
      params,
    );
  }

  // ===== Block / Transaction Queries =====

  async getTransactionByHash(txHash: string): Promise<StrategyResult<OptimismTransaction | null>> {
    return this.execute<OptimismTransaction | null>("eth_getTransactionByHash", [txHash]);
  }

  async getTransactionByBlockHashAndIndex(
    blockHash: string,
    index: string,
  ): Promise<StrategyResult<OptimismTransaction | null>> {
    return this.execute<OptimismTransaction | null>("eth_getTransactionByBlockHashAndIndex", [
      blockHash,
      index,
    ]);
  }

  async getTransactionByBlockNumberAndIndex(
    blockTag: BlockNumberOrTag,
    index: string,
  ): Promise<StrategyResult<OptimismTransaction | null>> {
    return this.execute<OptimismTransaction | null>("eth_getTransactionByBlockNumberAndIndex", [
      blockTag,
      index,
    ]);
  }

  async getTransactionReceipt(
    txHash: string,
  ): Promise<StrategyResult<OptimismTransactionReceipt | null>> {
    return this.execute<OptimismTransactionReceipt | null>("eth_getTransactionReceipt", [txHash]);
  }

  // ===== Logs & Filters =====

  async newFilter(filterObject: OptimismLogFilter): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_newFilter", [filterObject]);
  }

  async newBlockFilter(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_newBlockFilter");
  }

  async newPendingTransactionFilter(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_newPendingTransactionFilter");
  }

  async uninstallFilter(filterId: string): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("eth_uninstallFilter", [filterId]);
  }

  // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  async getFilterChanges(filterId: string): Promise<StrategyResult<any[]>> {
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    return this.execute<any[]>("eth_getFilterChanges", [filterId]);
  }

  async getFilterLogs(filterId: string): Promise<StrategyResult<OptimismLog[]>> {
    return this.execute<OptimismLog[]>("eth_getFilterLogs", [filterId]);
  }

  async getLogs(filterObject: OptimismLogFilter): Promise<StrategyResult<OptimismLog[]>> {
    return this.execute<OptimismLog[]>("eth_getLogs", [filterObject]);
  }

  // ===== Fees (EIP-1559) =====

  async gasPrice(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_gasPrice");
  }

  async maxPriorityFeePerGas(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_maxPriorityFeePerGas");
  }

  async feeHistory(
    blockCount: string,
    newestBlock: BlockNumberOrTag,
    rewardPercentiles?: number[],
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  ): Promise<StrategyResult<any>> {
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    const params: any[] = [blockCount, newestBlock];
    if (rewardPercentiles !== undefined) params.push(rewardPercentiles);
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    return this.execute<any>("eth_feeHistory", params);
  }

  // ===== Deprecated / Legacy (post-Merge mostly unsupported) =====

  async mining(): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("eth_mining");
  }

  async hashRate(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_hashrate");
  }

  async getWork(): Promise<StrategyResult<string[]>> {
    return this.execute<string[]>("eth_getWork");
  }

  async submitWork(
    nonce: string,
    powHash: string,
    digest: string,
  ): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("eth_submitWork", [nonce, powHash, digest]);
  }

  async submitHashrate(hashrate: string, id: string): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("eth_submitHashrate", [hashrate, id]);
  }

  // ===== TxPool Methods =====

  async status(): Promise<StrategyResult<{ pending: string; queued: string }>> {
    return this.execute<{ pending: string; queued: string }>("txpool_status");
  }

  // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  async content(): Promise<StrategyResult<Record<string, any>>> {
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    return this.execute<Record<string, any>>("txpool_content");
  }

  // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  async inspect(): Promise<StrategyResult<Record<string, any>>> {
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    return this.execute<Record<string, any>>("txpool_inspect");
  }

  // ===== Debug Methods =====

  async debugTraceTransaction(
    txHash: string,
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    options: Record<string, any> = {},
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  ): Promise<StrategyResult<any>> {
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    return this.execute<any>("debug_traceTransaction", [txHash, options]);
  }

  async debugTraceCall(
    callObject: OptimismCallObject,
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    options: Record<string, any>,
    blockTag?: BlockNumberOrTag,
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  ): Promise<StrategyResult<any>> {
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    const params: any[] = [callObject, options];
    if (blockTag !== undefined) params.push(blockTag);
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    return this.execute<any>("debug_traceCall", params);
  }

  async storageRangeAt(
    blockHash: string,
    txIndex: number,
    address: string,
    startKey: string,
    maxResults: number,
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  ): Promise<StrategyResult<any>> {
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    return this.execute<any>("debug_storageRangeAt", [
      blockHash,
      txIndex,
      address,
      startKey,
      maxResults,
    ]);
  }

  async accountRange(
    blockTag: BlockNumberOrTag,
    start: string,
    maxResults: number,
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  ): Promise<StrategyResult<any>> {
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    return this.execute<any>("debug_accountRange", [blockTag, start, maxResults]);
  }

  // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  async getModifiedAccountsByHash(blockHash: string): Promise<StrategyResult<any>> {
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    return this.execute<any>("debug_getModifiedAccountsByHash", [blockHash]);
  }

  // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  async getModifiedAccountsByNumber(blockNumber: string): Promise<StrategyResult<any>> {
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    return this.execute<any>("debug_getModifiedAccountsByNumber", [blockNumber]);
  }

  // ===== Trace Methods =====
  // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  async traceBlock(blockNumber: string | number): Promise<StrategyResult<any>> {
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    return this.execute<any>("trace_block", [blockNumber]);
  }

  // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  async traceTransaction(txHash: string): Promise<StrategyResult<any>> {
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    return this.execute<any>("trace_transaction", [txHash]);
  }

  async traceCall(
    callObject: OptimismCallObject,
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    options: Record<string, any>,
    blockTag?: BlockNumberOrTag,
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  ): Promise<StrategyResult<any>> {
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    const params: any[] = [callObject, options];
    if (blockTag !== undefined) params.push(blockTag);
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    return this.execute<any>("trace_call", params);
  }

  async traceRawTransaction(
    signedTx: string,
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    options: Record<string, any>,
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  ): Promise<StrategyResult<any>> {
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    return this.execute<any>("trace_rawTransaction", [signedTx, options]);
  }

  async traceFilter(
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    filter: Record<string, any>,
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  ): Promise<StrategyResult<any>> {
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    return this.execute<any>("trace_filter", [filter]);
  }
}
