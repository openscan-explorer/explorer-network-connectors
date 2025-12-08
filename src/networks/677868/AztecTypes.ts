// Aztec Node RPC Types

export type BlockNumberOrLatest = number | "latest";

// Block Types
export interface L2Block {
  // L2 Block structure
  [key: string]: any;
}

export interface BlockHeader {
  // Block header structure
  [key: string]: any;
}

interface L2TipsDetail {
  hash: `0x${string}`;
  number: number;
}
export interface L2Tips {
  latest: L2TipsDetail;
  finalized: L2TipsDetail;
  proven: L2TipsDetail;
}

// Transaction Types
export interface Tx {
  // Transaction structure
  [key: string]: any;
}

export interface TxReceipt {
  // Transaction receipt structure
  [key: string]: any;
}

export interface IndexedTxEffect {
  // Transaction effect structure
  [key: string]: any;
}

export interface TxValidationResult {
  valid: boolean;
  error?: string;
}

export interface PublicSimulationOutput {
  // Public simulation output structure
  [key: string]: any;
}

// State Types
export interface WorldStateSyncStatus {
  // World state sync status structure
  [key: string]: any;
}

// Merkle Tree Types
export interface LeafIndexes {
  // Leaf indexes with block metadata
  [key: string]: any;
}

// Membership Witness Types
export interface NullifierMembershipWitness {
  // Nullifier membership witness structure
  [key: string]: any;
}

export interface PublicDataWitness {
  // Public data witness structure
  [key: string]: any;
}

export interface MembershipWitness {
  // Membership witness structure
  [key: string]: any;
}

// Log Types
export interface PrivateLog {
  // Private log structure
  [key: string]: any;
}

export interface LogFilter {
  from?: number;
  to?: number;
  contractAddress?: string;
  [key: string]: any;
}

export interface GetPublicLogsResponse {
  logs: any[];
  [key: string]: any;
}

export interface GetContractClassLogsResponse {
  logs: any[];
  [key: string]: any;
}

export interface TxScopedL2Log {
  // Transaction-scoped L2 log structure
  [key: string]: any;
}

// Contract Types
export interface ContractClassPublic {
  // Contract class structure
  [key: string]: any;
}

export interface ContractInstanceWithAddress {
  // Contract instance structure
  [key: string]: any;
}

// Node Info Types
export interface NodeInfo {
  nodeVersion: string
  l1ChainId: number
  rollupVersion: number
  l1ContractAddresses: L1ContractAddresses
  protocolContractAddresses: ProtocolContractAddresses
}

export interface L1ContractAddresses {
  registryAddress: string
  slashFactoryAddress: string
  feeAssetHandlerAddress: string
  rollupAddress: string
  inboxAddress: string
  outboxAddress: string
  feeJuiceAddress: string
  stakingAssetAddress: string
  feeJuicePortalAddress: string
  coinIssuerAddress: string
  rewardDistributorAddress: string
  governanceProposerAddress: string
  governanceAddress: string
  stakingAssetHandlerAddress: string
  gseAddress: string
  zkPassportVerifierAddress: string
  dateGatedRelayerAddress: string
}

export interface ProtocolContractAddresses {
  classRegistry: string
  feeJuice: string
  instanceRegistry: string
  multiCallEntrypoint: string
}

export interface GasFees {
  feePerDaGas: string
  feePerL2Gas: string
}

// Validator Types
export interface ValidatorsStats {
  slotWindow: number
  stats: {}
}

export interface SingleValidatorStats {
  // Single validator statistics structure
  [key: string]: any;
}

// Debug Types
export interface AllowedElement {
  // Allowed element structure
  [key: string]: any;
}

// Admin Types
export interface AztecNodeAdminConfig {
  // Admin configuration structure
  [key: string]: any;
}

export interface SlashPayloadRound {
  // Slash payload round structure
  [key: string]: any;
}

export interface Offense {
  // Offense structure
  [key: string]: any;
}

// RPC Request/Response Types
export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number | string;
  method: string;
  params?: any[];
}

export interface JsonRpcResponse<T = any> {
  jsonrpc: "2.0";
  id: number | string;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}
