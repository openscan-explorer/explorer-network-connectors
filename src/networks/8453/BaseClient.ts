import { NetworkClient } from "../../NetworkClient.ts";
import type { StrategyResult } from "../../strategies/strategiesTypes.ts";
import type { StrategyConfig } from "../../strategies/requestStrategy.ts";
import type {
  BaseBlock,
  BaseTransaction,
  BaseTransactionReceipt,
  BaseLog,
  BaseLogFilter,
  BaseCallObject,
  BlockNumberOrTag,
  AccessListEntry,
  OptimismOutputAtBlock,
  OptimismSyncStatus,
  OptimismRollupConfig,
  OpP2PSelfInfo,
  OpP2PPeersResponse,
  OpP2PPeerStats,
  EthSyncingStatus,
} from "./BaseTypes";

/**
 * Base-specific network client with typed methods
 * Chain ID: 8453
 * Base is an Ethereum Layer 2 built on the OP Stack by Coinbase
 * Uses composition to integrate strategies with Base RPC methods
 *
 * Documentation: https://docs.base.org
 */
export class BaseClient extends NetworkClient {
  constructor(config: StrategyConfig) {
    super(config);
  }

  // ===== Base/Optimism Rollup-Specific Methods =====

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

  // ===== Block Methods =====

  /**
   * Get block by number
   * @param blockTag - Block number (hex) or tag (latest, earliest, pending, safe, finalized)
   * @param fullTx - If true, returns full transaction objects; if false, returns transaction hashes
   */
  async getBlockByNumber(
    blockTag: BlockNumberOrTag,
    fullTx: boolean = false
  ): Promise<StrategyResult<BaseBlock | null>> {
    return this.execute<BaseBlock | null>("eth_getBlockByNumber", [blockTag, fullTx]);
  }

  /**
   * Get block by hash
   * @param blockHash - Block hash
   * @param fullTx - If true, returns full transaction objects; if false, returns transaction hashes
   */
  async getBlockByHash(
    blockHash: string,
    fullTx: boolean = false
  ): Promise<StrategyResult<BaseBlock | null>> {
    return this.execute<BaseBlock | null>("eth_getBlockByHash", [blockHash, fullTx]);
  }

  /**
   * Get transaction count in a block by block number
   * @param blockTag - Block number or tag
   */
  async getBlockTransactionCountByNumber(blockTag: BlockNumberOrTag): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getBlockTransactionCountByNumber", [blockTag]);
  }

  /**
   * Get transaction count in a block by block hash
   * @param blockHash - Block hash
   */
  async getBlockTransactionCountByHash(blockHash: string): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getBlockTransactionCountByHash", [blockHash]);
  }

  /**
   * Get uncle count by block number
   * @param blockTag - Block number or tag
   */
  async getUncleCountByBlockNumber(blockTag: BlockNumberOrTag): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getUncleCountByBlockNumber", [blockTag]);
  }

  /**
   * Get uncle count by block hash
   * @param blockHash - Block hash
   */
  async getUncleCountByBlockHash(blockHash: string): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getUncleCountByBlockHash", [blockHash]);
  }

  /**
   * Get uncle by block number and index
   * @param blockTag - Block number or tag
   * @param index - Uncle index (hex)
   */
  async getUncleByBlockNumberAndIndex(
    blockTag: BlockNumberOrTag,
    index: string
  ): Promise<StrategyResult<BaseBlock | null>> {
    return this.execute<BaseBlock | null>("eth_getUncleByBlockNumberAndIndex", [blockTag, index]);
  }

  /**
   * Get uncle by block hash and index
   * @param blockHash - Block hash
   * @param index - Uncle index (hex)
   */
  async getUncleByBlockHashAndIndex(
    blockHash: string,
    index: string
  ): Promise<StrategyResult<BaseBlock | null>> {
    return this.execute<BaseBlock | null>("eth_getUncleByBlockHashAndIndex", [blockHash, index]);
  }

  // ===== Account Methods =====

  /**
   * Get account balance
   * @param address - Account address
   * @param blockTag - Block number or tag (default: latest)
   */
  async getBalance(address: string, blockTag: BlockNumberOrTag = "latest"): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getBalance", [address, blockTag]);
  }

  /**
   * Get contract code
   * @param address - Contract address
   * @param blockTag - Block number or tag (default: latest)
   */
  async getCode(address: string, blockTag: BlockNumberOrTag = "latest"): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getCode", [address, blockTag]);
  }

  /**
   * Get storage value at position
   * @param address - Contract address
   * @param position - Storage position (hex)
   * @param blockTag - Block number or tag (default: latest)
   */
  async getStorageAt(
    address: string,
    position: string,
    blockTag: BlockNumberOrTag = "latest"
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getStorageAt", [address, position, blockTag]);
  }

  /**
   * Get transaction count (nonce) for address
   * @param address - Account address
   * @param blockTag - Block number or tag (default: latest)
   */
  async getTransactionCount(
    address: string,
    blockTag: BlockNumberOrTag = "latest"
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getTransactionCount", [address, blockTag]);
  }

  /**
   * Get Merkle proof for account and storage values
   * @param address - Account address
   * @param storageKeys - Array of storage keys
   * @param blockTag - Block number or tag
   */
  async getProof(
    address: string,
    storageKeys: string[],
    blockTag: BlockNumberOrTag
  ): Promise<StrategyResult<unknown>> {
    return this.execute<unknown>("eth_getProof", [address, storageKeys, blockTag]);
  }

  // ===== Transaction Methods =====

  /**
   * Get transaction by hash
   * @param txHash - Transaction hash
   */
  async getTransactionByHash(txHash: string): Promise<StrategyResult<BaseTransaction | null>> {
    return this.execute<BaseTransaction | null>("eth_getTransactionByHash", [txHash]);
  }

  /**
   * Get transaction by block hash and index
   * @param blockHash - Block hash
   * @param index - Transaction index (hex)
   */
  async getTransactionByBlockHashAndIndex(
    blockHash: string,
    index: string
  ): Promise<StrategyResult<BaseTransaction | null>> {
    return this.execute<BaseTransaction | null>("eth_getTransactionByBlockHashAndIndex", [blockHash, index]);
  }

  /**
   * Get transaction by block number and index
   * @param blockTag - Block number or tag
   * @param index - Transaction index (hex)
   */
  async getTransactionByBlockNumberAndIndex(
    blockTag: BlockNumberOrTag,
    index: string
  ): Promise<StrategyResult<BaseTransaction | null>> {
    return this.execute<BaseTransaction | null>("eth_getTransactionByBlockNumberAndIndex", [blockTag, index]);
  }

  /**
   * Get transaction receipt
   * @param txHash - Transaction hash
   */
  async getTransactionReceipt(txHash: string): Promise<StrategyResult<BaseTransactionReceipt | null>> {
    return this.execute<BaseTransactionReceipt | null>("eth_getTransactionReceipt", [txHash]);
  }

  /**
   * Send raw signed transaction
   * @param signedTx - Signed transaction data (hex)
   */
  async sendRawTransaction(signedTx: string): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_sendRawTransaction", [signedTx]);
  }

  /**
   * Send transaction (requires unlocked account)
   * @param txObject - Transaction object
   */
  async sendTransaction(txObject: BaseCallObject): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_sendTransaction", [txObject]);
  }

  // ===== Call & Gas Estimation Methods =====

  /**
   * Execute call without creating transaction
   * @param callObject - Call object
   * @param blockTag - Block number or tag (optional)
   */
  async callContract(callObject: BaseCallObject, blockTag?: BlockNumberOrTag): Promise<StrategyResult<string>> {
    const params: any[] = [callObject];
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<string>("eth_call", params);
  }

  /**
   * Estimate gas for transaction
   * @param txObject - Transaction object
   * @param blockTag - Block number or tag (optional)
   */
  async estimateGas(txObject: BaseCallObject, blockTag?: BlockNumberOrTag): Promise<StrategyResult<string>> {
    const params: any[] = [txObject];
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<string>("eth_estimateGas", params);
  }

  /**
   * Create access list for transaction
   * @param txObject - Transaction object
   * @param blockTag - Block number or tag (optional)
   */
  async createAccessList(
    txObject: BaseCallObject,
    blockTag?: BlockNumberOrTag
  ): Promise<StrategyResult<{ accessList: AccessListEntry[]; gasUsed: string }>> {
    const params: any[] = [txObject];
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<{ accessList: AccessListEntry[]; gasUsed: string }>("eth_createAccessList", params);
  }

  // ===== Fee Methods (EIP-1559) =====

  /**
   * Get current gas price
   */
  async gasPrice(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_gasPrice");
  }

  /**
   * Get max priority fee per gas (EIP-1559)
   */
  async maxPriorityFeePerGas(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_maxPriorityFeePerGas");
  }

  /**
   * Get fee history (EIP-1559)
   * @param blockCount - Number of blocks to query (hex)
   * @param newestBlock - Newest block to query
   * @param rewardPercentiles - Array of percentiles for priority fee rewards
   */
  async feeHistory(
    blockCount: string,
    newestBlock: BlockNumberOrTag,
    rewardPercentiles?: number[]
  ): Promise<StrategyResult<any>> {
    const params: any[] = [blockCount, newestBlock];
    if (rewardPercentiles !== undefined) params.push(rewardPercentiles);
    return this.execute<any>("eth_feeHistory", params);
  }

  // ===== Log & Filter Methods =====

  /**
   * Get logs matching filter
   * @param filterObject - Log filter criteria
   */
  async getLogs(filterObject: BaseLogFilter): Promise<StrategyResult<BaseLog[]>> {
    return this.execute<BaseLog[]>("eth_getLogs", [filterObject]);
  }

  /**
   * Create new log filter
   * @param filterObject - Log filter criteria
   */
  async newFilter(filterObject: BaseLogFilter): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_newFilter", [filterObject]);
  }

  /**
   * Create new block filter
   */
  async newBlockFilter(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_newBlockFilter");
  }

  /**
   * Create new pending transaction filter
   */
  async newPendingTransactionFilter(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_newPendingTransactionFilter");
  }

  /**
   * Uninstall filter
   * @param filterId - Filter ID
   */
  async uninstallFilter(filterId: string): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("eth_uninstallFilter", [filterId]);
  }

  /**
   * Get filter changes
   * @param filterId - Filter ID
   */
  async getFilterChanges(filterId: string): Promise<StrategyResult<any[]>> {
    return this.execute<any[]>("eth_getFilterChanges", [filterId]);
  }

  /**
   * Get all logs for filter
   * @param filterId - Filter ID
   */
  async getFilterLogs(filterId: string): Promise<StrategyResult<BaseLog[]>> {
    return this.execute<BaseLog[]>("eth_getFilterLogs", [filterId]);
  }

  // ===== TxPool Methods =====

  /**
   * Get transaction pool status
   */
  async txpoolStatus(): Promise<StrategyResult<{ pending: string; queued: string }>> {
    return this.execute<{ pending: string; queued: string }>("txpool_status");
  }

  /**
   * Get transaction pool content
   */
  async txpoolContent(): Promise<StrategyResult<Record<string, any>>> {
    return this.execute<Record<string, any>>("txpool_content");
  }

  /**
   * Get transaction pool inspection data
   */
  async txpoolInspect(): Promise<StrategyResult<Record<string, any>>> {
    return this.execute<Record<string, any>>("txpool_inspect");
  }

  // ===== Debug Methods =====

  /**
   * Trace transaction with debug options
   * @param txHash - Transaction hash
   * @param options - Trace options
   */
  async debugTraceTransaction(txHash: string, options: Record<string, any> = {}): Promise<StrategyResult<any>> {
    return this.execute<any>("debug_traceTransaction", [txHash, options]);
  }

  /**
   * Trace call with debug options
   * @param callObject - Call object
   * @param options - Trace options
   * @param blockTag - Block number or tag (optional)
   */
  async debugTraceCall(
    callObject: BaseCallObject,
    options: Record<string, any>,
    blockTag?: BlockNumberOrTag
  ): Promise<StrategyResult<any>> {
    const params: any[] = [callObject, options];
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<any>("debug_traceCall", params);
  }

  /**
   * Get storage range at specific location
   * @param blockHash - Block hash
   * @param txIndex - Transaction index
   * @param address - Contract address
   * @param startKey - Starting storage key
   * @param maxResults - Maximum number of results
   */
  async storageRangeAt(
    blockHash: string,
    txIndex: number,
    address: string,
    startKey: string,
    maxResults: number
  ): Promise<StrategyResult<any>> {
    return this.execute<any>("debug_storageRangeAt", [blockHash, txIndex, address, startKey, maxResults]);
  }

  /**
   * Get account range
   * @param blockTag - Block number or tag
   * @param start - Start address
   * @param maxResults - Maximum number of results
   */
  async accountRange(blockTag: BlockNumberOrTag, start: string, maxResults: number): Promise<StrategyResult<any>> {
    return this.execute<any>("debug_accountRange", [blockTag, start, maxResults]);
  }

  /**
   * Get modified accounts by block hash
   * @param blockHash - Block hash
   */
  async getModifiedAccountsByHash(blockHash: string): Promise<StrategyResult<any>> {
    return this.execute<any>("debug_getModifiedAccountsByHash", [blockHash]);
  }

  /**
   * Get modified accounts by block number
   * @param blockNumber - Block number
   */
  async getModifiedAccountsByNumber(blockNumber: string): Promise<StrategyResult<any>> {
    return this.execute<any>("debug_getModifiedAccountsByNumber", [blockNumber]);
  }

  // ===== Trace Methods =====

  /**
   * Trace all transactions in a block
   * @param blockNumber - Block number (hex) or number
   */
  async traceBlock(blockNumber: string | number): Promise<StrategyResult<any>> {
    return this.execute<any>("trace_block", [blockNumber]);
  }

  /**
   * Trace a transaction
   * @param txHash - Transaction hash
   */
  async traceTransaction(txHash: string): Promise<StrategyResult<any>> {
    return this.execute<any>("trace_transaction", [txHash]);
  }

  /**
   * Trace a call
   * @param callObject - Call object
   * @param options - Trace options
   * @param blockTag - Block number or tag (optional)
   */
  async traceCall(
    callObject: BaseCallObject,
    options: Record<string, any>,
    blockTag?: BlockNumberOrTag
  ): Promise<StrategyResult<any>> {
    const params: any[] = [callObject, options];
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<any>("trace_call", params);
  }

  /**
   * Trace raw transaction
   * @param signedTx - Signed transaction data
   * @param options - Trace options
   */
  async traceRawTransaction(signedTx: string, options: Record<string, any>): Promise<StrategyResult<any>> {
    return this.execute<any>("trace_rawTransaction", [signedTx, options]);
  }

  /**
   * Trace transactions matching filter
   * @param filter - Trace filter
   */
  async traceFilter(filter: Record<string, any>): Promise<StrategyResult<any>> {
    return this.execute<any>("trace_filter", [filter]);
  }

  // ===== Mining Methods (Legacy - usually unsupported on L2s) =====

  /**
   * Check if mining is active
   */
  async mining(): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("eth_mining");
  }

  /**
   * Get current hash rate
   */
  async hashRate(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_hashrate");
  }

  /**
   * Get mining work
   */
  async getWork(): Promise<StrategyResult<string[]>> {
    return this.execute<string[]>("eth_getWork");
  }

  /**
   * Submit mining work
   * @param nonce - Nonce (hex)
   * @param powHash - POW hash
   * @param digest - Mix digest
   */
  async submitWork(nonce: string, powHash: string, digest: string): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("eth_submitWork", [nonce, powHash, digest]);
  }

  /**
   * Submit mining hashrate
   * @param hashrate - Hash rate (hex)
   * @param id - Miner ID
   */
  async submitHashrate(hashrate: string, id: string): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("eth_submitHashrate", [hashrate, id]);
  }
}
