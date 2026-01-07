# CLAUDE.md - AI Assistant Context

This file provides structured context for AI assistants to understand the @openscan/network-connectors codebase.

## Project Overview

**@openscan/network-connectors** is a TypeScript library that provides unified, type-safe RPC client interfaces for multiple blockchain networks. It abstracts the complexity of working with different blockchain RPC providers through a consistent API.

### Key Design Patterns

- **Strategy Pattern**: Pluggable request execution strategies (Fallback, Parallel)
- **Factory Pattern**: Client instantiation based on chain IDs
- **Inheritance**: Base `NetworkClient` class extended by network-specific clients

### Technology Stack

- **Language**: TypeScript 5.9.3 with strict type checking
- **Runtime**: Node.js 24 with ES modules
- **Build**: TypeScript compiler (tsc)
- **Testing**: Node.js native test framework with tsx
- **Code Quality**: Biome (linting and formatting)
- **CI/CD**: GitHub Actions for automated npm publishing

## Codebase Structure

```
@openscan/network-connectors/
├── src/
│   ├── strategies/              # Request execution strategies
│   │   ├── requestStrategy.ts   # StrategyFactory for creating strategies
│   │   ├── strategiesTypes.ts   # Interface definitions
│   │   ├── fallbackStrategy.ts  # Sequential fallback implementation
│   │   └── parallelStrategy.ts  # Parallel execution with inconsistency detection
│   ├── networks/                # Network-specific clients (by chain ID)
│   │   ├── 1/                   # Ethereum mainnet
│   │   ├── 10/                  # Optimism
│   │   ├── 56/                  # BNB Smart Chain
│   │   ├── 97/                  # BNB Testnet
│   │   ├── 137/                 # Polygon
│   │   ├── 8453/                # Base
│   │   ├── 31337/               # Hardhat (local)
│   │   ├── 42161/               # Arbitrum One
│   │   ├── 677868/              # Aztec
│   │   └── 11155111/            # Sepolia Testnet
│   ├── factory/                 # Client instantiation
│   │   └── ClientRegistry.ts    # Chain ID to client mapping
│   ├── NetworkClient.ts         # Base network client
│   ├── RpcClient.ts             # Low-level RPC client
│   ├── RpcClientTypes.ts        # JSON-RPC type definitions
│   └── index.ts                 # Main export file
├── tests/                       # Comprehensive test suite
│   ├── strategies/              # Strategy tests
│   └── networks/                # Network-specific client tests
├── scripts/
│   └── publish-and-tag.sh       # Release automation script
├── .github/workflows/
│   └── npm-publish.yml          # CI/CD automation
├── biome.json                   # Linting and formatting config
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Project metadata
```

### Entry Points

- **Main Entry**: [src/index.ts](src/index.ts) - Exports all public APIs (clients, types, factories, strategies)
- **Published Package**: `dist/index.js` with types at `dist/index.d.ts`

## Core Architecture

### Base Classes

#### NetworkClient ([src/NetworkClient.ts](src/NetworkClient.ts))

Abstract base class providing:
- `execute<T>(method: string, params: any[]): Promise<StrategyResult<T>>` - Generic RPC method execution
- `getStrategy(): RequestStrategy` - Get current strategy instance
- `getStrategyName(): string` - Get strategy name ("fallback" or "parallel")
- `getRpcUrls(): string[]` - Get configured RPC URLs
- `updateStrategy(config: StrategyConfig): void` - Dynamically switch strategies

#### RpcClient ([src/RpcClient.ts](src/RpcClient.ts))

Low-level JSON-RPC 2.0 client:
- `call<T>(method: string, params: any[]): Promise<T>` - Direct RPC calls via fetch
- `getUrl(): string` - Get RPC endpoint URL
- `getRequestId(): number` - Get current request ID counter
- Handles HTTP errors and extracts RPC errors from responses
- Auto-increments request ID for each call

### Type System

#### Core Interfaces ([src/strategies/strategiesTypes.ts](src/strategies/strategiesTypes.ts))

```typescript
interface RequestStrategy {
  execute<T>(method: string, params: any[]): Promise<StrategyResult<T>>;
  getName(): string;
}

interface StrategyResult<T> {
  success: boolean;
  data?: T;
  errors?: RPCProviderResponse[];
  metadata?: RPCMetadata;  // Only for parallel strategy
}

interface RPCMetadata {
  strategy: "parallel" | "fallback";
  timestamp: number;
  responses: RPCProviderResponse[];
  hasInconsistencies: boolean;
}

interface RPCProviderResponse {
  url: string;
  status: "success" | "error";
  responseTime: number;
  data?: any;
  error?: string;
  hash?: string;  // Response hash for inconsistency detection
}

interface StrategyConfig {
  type: "fallback" | "parallel";
  rpcUrls: string[];
}
```

#### Blockchain Types ([src/RpcClientTypes.ts](src/RpcClientTypes.ts))

Common types across Ethereum-compatible networks:

```typescript
type BlockTag = "latest" | "earliest" | "pending" | "finalized" | "safe";
type BlockNumberOrTag = string | BlockTag;

interface EthBlock {
  number: string;           // Hex-encoded
  hash: string;
  parentHash: string;
  transactions: string[] | EthTransaction[];
  gasUsed: string;
  gasLimit: string;
  baseFeePerGas?: string;   // EIP-1559
  withdrawals?: EthWithdrawal[];  // Shanghai
  // ... 20+ additional fields
}

interface EthTransaction {
  from: string;
  to: string | null;
  value: string;
  gas: string;
  type: string;             // "0x0" (legacy), "0x1" (EIP-2930), "0x2" (EIP-1559), "0x3" (EIP-4844)
  maxFeePerGas?: string;    // EIP-1559
  maxPriorityFeePerGas?: string;
  accessList?: AccessListEntry[];  // EIP-2930
  blobVersionedHashes?: string[];  // EIP-4844
  v: string; r: string; s: string;
}

interface EthTransactionReceipt {
  blockHash: string;
  blockNumber: string;
  status?: string;          // "0x1" (success) or "0x0" (failure)
  gasUsed: string;
  effectiveGasPrice?: string;
  logs: EthLog[];
  logsBloom: string;
}

interface EthCallObject {
  from?: string;
  to?: string;
  gas?: string;
  value?: string;
  data?: string;
  accessList?: AccessListEntry[];
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}
```

## Request Strategies

### FallbackStrategy ([src/strategies/fallbackStrategy.ts](src/strategies/fallbackStrategy.ts))

**Execution Pattern**: Sequential with early exit on success

```typescript
// Tries each RPC client in order until one succeeds
for (const client of this.rpcClients) {
  try {
    const data = await client.call<T>(method, params);
    return { success: true, data };
  } catch (error) {
    errors.push({ url, status: "error", responseTime, error: message });
  }
}
return { success: false, errors };
```

**Characteristics**:
- Minimal overhead (stops at first success)
- No metadata tracking
- Best for reliability when providers are generally consistent

### ParallelStrategy ([src/strategies/parallelStrategy.ts](src/strategies/parallelStrategy.ts))

**Execution Pattern**: Concurrent with inconsistency detection

```typescript
// Execute all RPC calls concurrently
const promises = this.rpcClients.map(client => client.call<T>(method, params));
const results = await Promise.allSettled(promises);

// Track all responses with hashes
const responses = results.map((result, index) => ({
  url: this.rpcClients[index].getUrl(),
  status: result.status === "fulfilled" ? "success" : "error",
  responseTime: endTime - startTime,
  data: result.status === "fulfilled" ? result.value : undefined,
  error: result.status === "rejected" ? result.reason : undefined,
  hash: result.status === "fulfilled" ? this.hashResponse(result.value) : undefined,
}));

// Detect inconsistencies by comparing hashes
const hasInconsistencies = this.detectInconsistencies(responses);
```

**Characteristics**:
- All providers called simultaneously
- Response hashing for data consistency checks
- Comprehensive metadata with timing and error information
- Best for detecting provider divergence or testing reliability

**Hash Algorithm** (32-bit integer hash):
```typescript
private hashResponse(data: object): string {
  const normalized = JSON.stringify(data, Object.keys(data).sort());
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;  // Convert to 32-bit
  }
  return hash.toString(36);
}
```

### StrategyFactory ([src/strategies/requestStrategy.ts](src/strategies/requestStrategy.ts))

Creates appropriate strategy based on configuration:

```typescript
static createStrategy(config: StrategyConfig): RequestStrategy {
  if (config.rpcUrls.length === 0) {
    throw new Error("At least one RPC URL must be provided");
  }

  const rpcClients = config.rpcUrls.map(url => new RpcClient(url));

  switch (config.type) {
    case "fallback": return new FallbackStrategy(rpcClients);
    case "parallel": return new ParallelStrategy(rpcClients);
    default: throw new Error(`Unknown strategy type: ${config.type}`);
  }
}
```

## Network Implementations

### Supported Networks

| Network | Chain ID | Client Class | Special Features |
|---------|----------|--------------|------------------|
| Ethereum | 1 | `EthereumClient` | Full eth_*, web3_*, net_*, debug_*, trace_*, txpool_* methods |
| Optimism | 10 | `OptimismClient` | Ethereum methods + optimism_* rollup methods + opp2p_* P2P + admin_* |
| BNB Smart Chain | 56 | `BNBClient` | Extended Ethereum methods + BSC-specific features |
| BNB Testnet | 97 | `BNBClient` | Maps to BNBClient |
| Polygon | 137 | `PolygonClient` | Ethereum methods + Polygon Bor validator methods |
| Base | 8453 | `BaseClient` | Optimism-compatible (reuses Optimism types/methods) |
| Arbitrum One | 42161 | `ArbitrumClient` | Ethereum methods + arbtrace_* (Arbitrum-specific traces) |
| Aztec | 677868 | `AztecClient` | Custom node_*/nodeAdmin_* methods (non-EVM) |
| Hardhat | 31337 | `EthereumClient` | Local development network |
| Sepolia Testnet | 11155111 | `SepoliaClient` | Ethereum-compatible testnet |

### Network-Specific Method Categories

All Ethereum-compatible networks include:

1. **Web3 Methods**: `clientVersion()`, `sha3()`
2. **Net Methods**: `version()`, `listening()`, `peerCount()`
3. **Eth Methods**: `chainId()`, `syncing()`, `blockNumber()`, `getBalance()`, `sendRawTransaction()`, etc.
4. **Block/Transaction**: `getBlockByNumber()`, `getTransactionByHash()`, `getTransactionReceipt()`
5. **Logs/Filters**: `getLogs()`, `newFilter()`, `getFilterChanges()`
6. **Fees**: `gasPrice()`, `maxPriorityFeePerGas()`, `feeHistory()`
7. **Debug**: `debugTraceTransaction()`, `debugTraceCall()`, `storageRangeAt()`
8. **Trace**: `traceBlock()`, `traceTransaction()`, `traceCall()`, `traceFilter()`
9. **TxPool**: `status()`, `content()`, `inspect()`

### Network-Specific Extensions

**Optimism** ([src/networks/10/OptimismClient.ts](src/networks/10/OptimismClient.ts)):
- `outputAtBlock()` - Get L2 output at block
- `syncStatus()` - Get sync status
- `rollupConfig()` - Get rollup configuration
- `optimismVersion()` - Get version info
- P2P methods: `p2pSelf()`, `p2pPeers()`, peer blocking/protection
- Admin: `adminStartSequencer()`, `adminStopSequencer()`, `adminSequencerActive()`

**Arbitrum** ([src/networks/42161/ArbitrumClient.ts](src/networks/42161/ArbitrumClient.ts)):
- `arbtraceBlock()` - Trace entire block
- `arbtraceTransaction()` - Trace specific transaction
- `arbtraceCall()` - Trace call with custom options
- `arbtraceCallMany()` - Trace multiple calls
- Specialized trace options for VM tracing and state diffs

**Aztec** ([src/networks/677868/AztecClient.ts](src/networks/677868/AztecClient.ts)):
- Block operations: `getBlock()`, `getBlocks()`, `getBlockHeader()`
- Transactions: `sendTx()`, `getTxReceipt()`, `getTxEffect()`
- Contract queries: `getContractClass()`, `getContractInstance()`
- State: `getPublicLogs()`, `worldStateSyncStatus()`
- Validators and node admin operations

## Common Code Patterns

### Method Parameter Handling

```typescript
async estimateGas(
  txObject: EthCallObject,
  blockTag?: BlockNumberOrTag,
): Promise<StrategyResult<string>> {
  const params: any[] = [txObject];
  if (blockTag !== undefined) params.push(blockTag);
  return this.execute<string>("eth_estimateGas", params);
}
```

**Pattern**: Build params array conditionally to handle optional parameters.

### Error Handling in RPC Calls

```typescript
// HTTP error check
if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}

// JSON-RPC error check
if (result.error) {
  throw new Error(`RPC error: ${result.error.message}`);
}
```

**Pattern**: Check HTTP response status, then check for JSON-RPC error object.

### Response Hashing for Inconsistency Detection

```typescript
private hashResponse(data: object): string {
  const normalized = JSON.stringify(data, Object.keys(data).sort());
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;  // Convert to 32-bit integer
  }
  return hash.toString(36);
}

private detectInconsistencies(responses: RPCProviderResponse[]): boolean {
  const successfulResponses = responses.filter((r) => r.status === "success" && r.hash);
  if (successfulResponses.length <= 1) return false;

  const referenceHash = successfulResponses[0]?.hash;
  return successfulResponses.some((r) => r.hash !== referenceHash);
}
```

**Pattern**: Normalize JSON by sorting keys, compute simple hash, compare all hashes to detect divergence.

### Biome Lint Suppressions

```typescript
// biome-ignore lint/suspicious/noExplicitAny: <TODO>
async call<T>(method: string, params: any[] = []): Promise<T>
```

**Pattern**: Used for `any[]` types in RPC methods due to variable signatures. Pragmatic approach acknowledging future type improvements.

## Client Factory

### ClientRegistry ([src/factory/ClientRegistry.ts](src/factory/ClientRegistry.ts))

**Type-Safe Chain ID Mapping**:

```typescript
type SupportedChainId = 1 | 10 | 56 | 97 | 137 | 8453 | 42161 | 677868 | 31337 | 11155111;

type ChainIdToClient<T extends SupportedChainId> =
  T extends 1 | 31337 | 11155111 ? EthereumClient :
  T extends 10 ? OptimismClient :
  T extends 56 | 97 ? BNBClient :
  T extends 137 ? PolygonClient :
  T extends 8453 ? BaseClient :
  T extends 42161 ? ArbitrumClient :
  T extends 677868 ? AztecClient :
  never;
```

**Factory Methods**:

```typescript
// Generic client
static createClient(chainId: SupportedChainId, config: StrategyConfig): NetworkClient

// Type-safe client with network-specific methods
static createTypedClient<T extends SupportedChainId>(
  chainId: T,
  config: StrategyConfig
): ChainIdToClient<T>
```

## Testing Approach

### Test Structure

Uses Node.js native test framework with tsx for TypeScript execution:

```typescript
import { describe, it } from "node:test";
import assert from "node:assert";

describe("ComponentName - Functionality", () => {
  it("should do specific thing", async () => {
    const result = await client.method();
    assert.strictEqual(result.success, true);
    assert.ok(result.data, "Should have data");
  });
});
```

### Test Categories

1. **Strategy Tests** ([tests/strategies/](tests/strategies/)):
   - Constructor validation (empty URLs, strategy types)
   - Strategy execution (success, error handling)
   - Response metadata (parallel strategy)
   - Fallback behavior

2. **Network Tests** ([tests/networks/](tests/networks/)):
   - Network-specific client instantiation
   - Method parameter handling
   - Type safety checks
   - Error propagation

3. **Factory Tests**:
   - Chain ID to client mapping
   - Type-safe client creation
   - Invalid chain ID handling

### Test Helpers

[tests/helpers/validators.js](tests/helpers/validators.js):
- `isHexString(value)` - Validates hex string format (0x prefix)

## Build and Configuration

### TypeScript Configuration ([tsconfig.json](tsconfig.json))

- **Target**: ES5
- **Module**: ESNext (native ES modules)
- **Output**: `dist/` directory
- **Type Declarations**: `dist/types/index.d.ts`
- **Strict Mode**: Enabled (`strict: true`, `noImplicitAny: true`, `noImplicitReturns: true`)

### Biome Configuration ([biome.json](biome.json))

- **Files**: `src/**/*.ts`, `src/**/*.tsx`, `src/**/*.json`, `tests/**/*.ts`
- **Formatter**: 100 character line width, 2-space indentation
- **Linter**: Recommended rules with custom overrides
- **Special Handling**: No explicit any check in test files

### ES Modules Setup

```json
{
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "require": "./dist/index.js",
      "import": "./dist/index.js",
      "types": "./dist/types/index.d.ts"
    }
  }
}
```

## Available Commands

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to JavaScript using tsc |
| `npm run test` | Run test suite using Node.js native test runner with tsx |
| `npm run typecheck` | Type check without code emission |
| `npm run format` | Check code formatting (Biome) |
| `npm run format:fix` | Auto-fix formatting issues |
| `npm run lint` | Check linting rules (Biome) |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run check` | Combined format + lint check |

### Release Commands

| Command | Description |
|---------|-------------|
| `npm run release` | Execute release script (build, publish, tag) |

### Shell Scripts

**[scripts/publish-and-tag.sh](scripts/publish-and-tag.sh)** - Automated release workflow:

1. Validates on main branch
2. Checks working directory is clean
3. Prevents duplicate releases (checks for existing git tag)
4. Runs quality checks (`npm run check`, `npm run typecheck`, `npm run build`)
5. Publishes to npm
6. Creates annotated git tag (`v<VERSION>`)
7. Pushes tag to remote

### CI/CD Pipeline

**[.github/workflows/npm-publish.yml](.github/workflows/npm-publish.yml)**:

- **Trigger**: Push to main branch
- **Environment**: ubuntu-latest, Node.js 24
- **Steps**:
  1. Checkout code
  2. Setup Node.js with npm registry
  3. Install dependencies (`npm ci`)
  4. Build project (`npm run build`)
  5. Publish to npm (JS-DevTools/npm-publish with OIDC)

## Code Quality Standards

- **TypeScript**: Strict type checking with explicit types
- **JSDoc**: Comprehensive comments on public methods
- **Type Aliases**: Common patterns (BlockNumberOrTag, BlockTag)
- **Generics**: Type parameters for return values
- **Separation of Concerns**: Strategies, clients, types in separate modules
- **Error Propagation**: async/await with proper error handling
- **Zero Dependencies**: Pure Node.js/TypeScript implementation

## Adding New Networks

To add a new network:

1. Create directory in [src/networks/](src/networks/) with chain ID
2. Define network-specific types (if needed)
3. Create client class extending `NetworkClient`
4. Implement network-specific RPC methods
5. Update `SupportedChainId` type in [src/factory/ClientRegistry.ts](src/factory/ClientRegistry.ts)
6. Update `ChainIdToClient` type mapping
7. Add case to factory `createClient()` and `createTypedClient()` methods
8. Export from [src/index.ts](src/index.ts)
9. Add tests in [tests/networks/](tests/networks/)

## Adding New RPC Methods

To add new RPC methods to existing network:

1. Add method signature to network client class
2. Define return type (create new type if needed)
3. Implement method using `this.execute<T>(method, params)` pattern
4. Handle optional parameters by conditionally building params array
5. Add JSDoc comment explaining method purpose
6. Add test coverage

## Important Notes for AI Assistants

- **No External Dependencies**: This project intentionally has zero production dependencies
- **ES Modules**: All code uses ES module syntax (`import`/`export`)
- **Type Safety**: Prioritize strict TypeScript typing over flexibility
- **Strategy Pattern**: All RPC calls go through the strategy pattern
- **Hex Encoding**: All blockchain numbers are hex-encoded strings (e.g., `"0x1"`)
- **Optional Chaining**: Use for EIP-specific fields (baseFeePerGas, maxFeePerGas, etc.)
- **Biome**: Use Biome for linting/formatting, not ESLint/Prettier
- **Native Test**: Use Node.js native test framework, not Jest/Mocha
