# @openscan/network-connectors

TypeScript library providing unified, type-safe RPC client interfaces for multiple blockchain networks with configurable request execution strategies.

## Features

- **Multi-Network Support**: Unified API for 10+ blockchain networks (Ethereum, Optimism, Arbitrum, Polygon, BNB, Base, Aztec, and testnets)
- **Strategy Pattern**: Pluggable request execution strategies (Fallback for reliability, Parallel for consistency detection)
- **Type Safety**: Strong TypeScript typing with network-specific type definitions
- **Zero Dependencies**: Pure Node.js implementation with no external runtime dependencies
- **ES Modules**: Native ESM support for modern JavaScript environments
- **Factory Pattern**: Type-safe client instantiation based on chain IDs
- **Inconsistency Detection**: Parallel strategy can detect RPC provider data divergence

## Supported Networks

| Network | Chain ID | Client Class | Special Features |
|---------|----------|--------------|------------------|
| Ethereum | 1 | `EthereumClient` | Full eth_*, web3_*, net_*, debug_*, trace_*, txpool_* |
| Optimism | 10 | `OptimismClient` | Ethereum + optimism_*, opp2p_*, admin_* methods |
| BNB Smart Chain | 56 | `BNBClient` | Extended Ethereum methods + BSC-specific features |
| BNB Testnet | 97 | `BNBClient` | Maps to BNBClient |
| Polygon | 137 | `PolygonClient` | Ethereum + Polygon Bor validator methods |
| Base | 8453 | `BaseClient` | Optimism-compatible (reuses Optimism types) |
| Arbitrum One | 42161 | `ArbitrumClient` | Ethereum + arbtrace_* (Arbitrum traces) |
| Aztec | 677868 | `AztecClient` | Custom node_*/nodeAdmin_* methods (non-EVM) |
| Hardhat | 31337 | `EthereumClient` | Local development network |
| Sepolia Testnet | 11155111 | `SepoliaClient` | Ethereum-compatible testnet |

## Project Structure

```
@openscan/network-connectors/
├── src/
│   ├── strategies/              # Request execution strategies (Fallback, Parallel)
│   ├── networks/                # Network-specific clients organized by chain ID
│   ├── factory/                 # Client instantiation and chain ID mapping
│   ├── NetworkClient.ts         # Base network client (abstract class)
│   ├── RpcClient.ts             # Low-level JSON-RPC 2.0 client
│   ├── RpcClientTypes.ts        # Blockchain type definitions
│   └── index.ts                 # Main export file
├── tests/                       # Comprehensive test suite
│   ├── strategies/              # Strategy tests
│   ├── networks/                # Network-specific client tests
│   └── helpers/                 # Test utilities
├── scripts/
│   └── publish-and-tag.sh       # Automated release workflow
├── .github/workflows/
│   └── npm-publish.yml          # CI/CD automation
├── dist/                        # Compiled JavaScript output (gitignored)
├── biome.json                   # Linting and formatting configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Project metadata and dependencies
```

### Directory Purposes

- **src/strategies/**: Implements the Strategy pattern for RPC request execution
  - `FallbackStrategy`: Sequential execution with early exit on success
  - `ParallelStrategy`: Concurrent execution with inconsistency detection
  - `StrategyFactory`: Creates appropriate strategy based on configuration

- **src/networks/**: Network-specific client implementations (one directory per chain ID)
  - Each client extends `NetworkClient` base class
  - Provides network-specific RPC methods and type definitions
  - Organized by chain ID for clarity

- **src/factory/**: Client instantiation logic
  - `ClientRegistry`: Maps chain IDs to client classes with type safety
  - Factory methods for creating clients

- **tests/**: Comprehensive test coverage
  - Uses Node.js native test framework with tsx
  - Tests strategies, network clients, and factory

- **scripts/**: Automation scripts
  - Release workflow (build, publish, tag)

## Architecture Overview

### Strategy Pattern

The library uses the **Strategy Pattern** to provide flexible RPC request execution:

- **FallbackStrategy**: Tries RPC providers sequentially until one succeeds
  - Minimal overhead (stops at first success)
  - Best for reliability when providers are generally consistent
  - No metadata tracking

- **ParallelStrategy**: Executes all RPC providers concurrently
  - Tracks response times and errors for all providers
  - Detects data inconsistencies using response hashing
  - Returns comprehensive metadata for debugging
  - Best for detecting provider divergence

Strategies can be configured at client creation or switched dynamically using `updateStrategy()`.

### Factory Pattern

The **ClientFactory** provides type-safe client instantiation based on chain IDs:

```typescript
// Generic client
const client = ClientFactory.createClient(chainId, config);

// Type-safe client with network-specific methods
const arbClient = ClientFactory.createTypedClient(42161, config);
// arbClient has Arbitrum-specific methods like arbtraceBlock()
```

### Type-Safe Network Clients

Each network has a dedicated client class extending `NetworkClient`:

- Fully typed with network-specific type definitions
- Network-specific RPC methods (e.g., Arbitrum traces, Optimism rollup methods)
- Inherits base Ethereum methods for compatible networks
- Strong TypeScript inference for return types

## Available Commands

### Development Workflow

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run build` | Compile TypeScript to JavaScript (output: `dist/`) |
| `npm run typecheck` | Type check without code emission |
| `npm run test` | Run test suite using Node.js native test runner |
| `npm run format` | Check code formatting (Biome) |
| `npm run format:fix` | Auto-fix formatting issues |
| `npm run lint` | Check linting rules (Biome) |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run check` | Combined format + lint check |

### CI/CD Automation

The project includes a GitHub Actions workflow ([.github/workflows/npm-publish.yml](.github/workflows/npm-publish.yml)) that automatically publishes to npm on every push to the `main` branch:

- **Trigger**: Push to `main` branch
- **Environment**: ubuntu-latest, Node.js 24
- **Steps**: Checkout → Setup Node.js → Install dependencies → Build → Publish
- **Authentication**: Uses OIDC authentication for npm publishing

## Development Setup

### Prerequisites

- **Node.js**: Version 24 or higher
- **npm**: Comes with Node.js

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/openscan-explorer/@openscan/network-connectors.git
   cd @openscan/network-connectors
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:

   ```bash
   npm run build
   ```

4. Run tests to verify setup:

   ```bash
   npm run test
   ```

### Code Quality Checks

Before committing, ensure your code passes all quality checks:

```bash
npm run check      # Check formatting and linting
npm run typecheck  # Check TypeScript types
npm run test       # Run test suite
```

Or auto-fix issues:

```bash
npm run format:fix  # Auto-fix formatting
npm run lint:fix    # Auto-fix linting
```

## Testing

### Running Tests

```bash
npm run test  # Run all tests
```

The project uses **Node.js native test framework** with **tsx** for TypeScript execution. No external test frameworks like Jest or Mocha are required.

### Test Structure

Tests are organized by functionality:

- **tests/strategies/**: Tests for FallbackStrategy and ParallelStrategy
  - Constructor validation
  - Strategy execution (success and error cases)
  - Response metadata (parallel strategy)
  - Inconsistency detection

- **tests/networks/**: Tests for network-specific clients
  - Client instantiation
  - Method parameter handling
  - Type safety checks
  - Error propagation

- **tests/helpers/**: Test utilities
  - `validators.js`: Helper functions for validation (e.g., `isHexString()`)

## Contributing

### Adding a New Network

To add support for a new blockchain network:

1. **Create network directory**:

   ```bash
   mkdir -p src/networks/<CHAIN_ID>
   ```

2. **Define network-specific types** (if needed):
   - Create types file for network-specific data structures
   - Extend base Ethereum types if applicable

3. **Create client class**:
   - Extend `NetworkClient` base class
   - Implement network-specific RPC methods
   - Use `this.execute<T>(method, params)` for all RPC calls
   - Add JSDoc comments for all public methods

4. **Update factory**:
   - Add chain ID to `SupportedChainId` type in [src/factory/ClientRegistry.ts](src/factory/ClientRegistry.ts)
   - Update `ChainIdToClient` type mapping
   - Add case to `createClient()` and `createTypedClient()` methods

5. **Export from index**:
   - Add exports to [src/index.ts](src/index.ts)

6. **Add tests**:
   - Create test file in `tests/networks/<CHAIN_ID>/`
   - Test client instantiation, methods, and type safety

7. **Update documentation**:
   - Add network to supported networks table in README.md
   - Document any special features or methods

### Adding New RPC Methods

To add new RPC methods to an existing network:

1. **Add method to client class**:

   ```typescript
   async methodName(param1: Type1, param2?: Type2): Promise<StrategyResult<ReturnType>> {
     const params: any[] = [param1];
     if (param2 !== undefined) params.push(param2);
     return this.execute<ReturnType>("rpc_methodName", params);
   }
   ```

2. **Define return type** (if needed):
   - Add type definition to appropriate types file
   - Use existing types where possible

3. **Add JSDoc comment**:

   ```typescript
   /**
    * Brief description of what this method does
    * @param param1 Description of parameter
    * @param param2 Optional parameter description
    * @returns Promise with strategy result containing return type
    */
   ```

4. **Add test coverage**:
   - Test success case
   - Test error handling
   - Test parameter validation

### Code Style Guidelines

This project uses **Biome** for linting and formatting:

- **Line Width**: 100 characters
- **Indentation**: 2 spaces
- **Quotes**: Double quotes
- **Semicolons**: Required
- **Trailing Commas**: ES5 (no trailing commas in function parameters)

Run formatters before committing:

```bash
npm run format:fix  # Auto-fix formatting
npm run lint:fix    # Auto-fix linting issues
```

### Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**:
   - Follow code style guidelines
   - Add tests for new functionality
   - Update documentation if needed
4. **Run quality checks**:

   ```bash
   npm run check
   npm run typecheck
   npm run test
   ```

5. **Commit your changes**:

   ```bash
   git commit -m "feat: description of your changes"
   ```

6. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a pull request** against the `main` branch

## Release Process

### Manual Release

1. Ensure you're on the `main` branch with a clean working directory
2. Update version in `package.json` if needed
3. Run the release script:

   ```bash
   npm run release
   ```

4. The script will automatically:
   - Validate environment
   - Run all quality checks
   - Build the project
   - Publish to npm
   - Create and push git tag

### Automated Release

Every push to the `main` branch triggers automatic npm publication via GitHub Actions:

1. Merge your PR to `main`
2. GitHub Actions automatically builds and publishes
3. Check Actions tab for workflow status

### Version Management

- Version is managed in `package.json`
- Follow [Semantic Versioning](https://semver.org/):
  - MAJOR: Breaking changes
  - MINOR: New features (backwards compatible)
  - PATCH: Bug fixes (backwards compatible)

## Configuration Files

### TypeScript Configuration ([tsconfig.json](tsconfig.json))

- **Target**: ES5 (broad compatibility)
- **Module**: ESNext (native ES modules)
- **Output**: `dist/` directory
- **Type Declarations**: Generated in `dist/types/`
- **Strict Mode**: Enabled for maximum type safety

### Biome Configuration ([biome.json](biome.json))

- **Formatter**: 100 char line width, 2-space indent
- **Linter**: Recommended rules with custom overrides
- **File Patterns**: `src/**/*.ts`, `tests/**/*.ts`
- **Special Rules**: Relaxed explicit any checks in test files

### Package Configuration ([package.json](package.json))

- **Type**: `"module"` (ES modules)
- **Main Entry**: `dist/index.js`
- **Type Definitions**: `dist/index.d.ts`
- **Exports**: Dual support for require/import
- **Files**: Only `dist/` directory published to npm

## Project Metadata

- **Repository**: [https://github.com/openscan-explorer/@openscan/network-connectors](https://github.com/openscan-explorer/@openscan/network-connectors)
- **Issues**: [https://github.com/openscan-explorer/@openscan/network-connectors/issues](https://github.com/openscan-explorer/@openscan/network-connectors/issues)
- **Package**: [@openscan/network-connectors on npm](https://www.npmjs.com/package/@openscan/network-connectors)
- **License**: See repository for license information

## Additional Resources

- **CLAUDE.md**: Comprehensive AI assistant context file with detailed codebase documentation
- **TypeScript Handbook**: [https://www.typescriptlang.org/docs/handbook/intro.html](https://www.typescriptlang.org/docs/handbook/intro.html)
- **Biome Documentation**: [https://biomejs.dev/](https://biomejs.dev/)
- **Node.js Test Framework**: [https://nodejs.org/api/test.html](https://nodejs.org/api/test.html)

## Support

For questions, issues, or contributions:

1. **Check existing issues**: [GitHub Issues](https://github.com/openscan-explorer/@openscan/network-connectors/issues)
2. **Open a new issue**: Provide detailed description, steps to reproduce, and environment info
3. **Contribute**: Follow the contribution guidelines above

---

Built with TypeScript, tested with Node.js, formatted with Biome.
