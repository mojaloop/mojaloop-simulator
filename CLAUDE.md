# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Mojaloop Simulator is a Node.js application that implements the FSPIOP (Financial Services Interoperability Protocol) specification. It simulates a Financial Service Provider (FSP) and provides both FSPIOP interface capabilities and a Test API for configuration and control.

## Development Commands

### Starting the Application
- `npm start` - Start the simulator using Node.js directly
- `npm run docker:build` - Build Docker image locally
- `npm run docker:up` - Start services using docker-compose
- `npm run docker:down` - Stop and remove docker-compose services

### Testing
- `npm test` or `npm run test:unit` - Run unit tests with AVA (uses CONFIG_OVERRIDE=./example.env)
- `npm run test:integration` - Full integration test (builds Docker, runs tests, cleans up)
- `npm run test:int` - Run integration tests only (requires Docker services running)
- `npm run test:coverage-check` - Run unit tests with coverage using nyc

### Code Quality
- `npm run lint` - Run ESLint on src/ directory
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run audit:check` - Check for security vulnerabilities
- `npm run dep:check` - Check for outdated dependencies

### Release Management
- `npm run release` - Create a new release using standard-version
- `npm run snapshot` - Create a snapshot release for testing

## Architecture

The application follows a modular, three-server architecture:

### Core Servers
1. **Simulator API** - Main FSPIOP interface (port configured via config)
2. **Report API** - Reporting and monitoring interface
3. **Test API** - Configuration and test scenario execution

### Key Components

- **Entry Point**: `src/index.js` - Main application bootstrap that sets up all three Koa servers
- **Configuration**: `src/lib/config.js` and `src/config.js` - Environment-based configuration using dotenv
- **Data Models**: `src/models/` - SQLite-based data models for parties, quotes, transfers, etc.
- **Handlers**: Three handler modules for each API interface:
  - `src/simulator/handlers.js` - FSPIOP protocol handlers
  - `src/reports/handlers.js` - Report generation handlers  
  - `src/test-api/handlers.js` - Test scenario execution handlers
- **Rules Engine**: `src/lib/rules-engine.js` - JSON-based rules evaluation for request processing
- **Validation**: `src/lib/validate.js` - OpenAPI schema validation middleware

### Database
- Uses SQLite with the `sqlite` and `sqlite3` packages
- Database models in `src/models/` directory handle parties, quotes, transfers, and bulk operations
- Database file location configured via MODEL_DATABASE environment variable

### Configuration
- Primary config: `example.env` (sample configuration)
- Override via CONFIG_OVERRIDE environment variable
- Rules configuration: JSON files in `rules/` directory (e.g., `rules/example.json`)

### API Specifications
- Simulator API: `src/simulator/api.yaml`
- Reports API: `src/reports/api.yaml`  
- Test API: `src/test-api/api.yaml`

## Key Dependencies

- **Koa** - Web framework for all three servers
- **sqlite/sqlite3** - Database layer
- **yamljs** - YAML parsing for API specifications
- **json-rules-engine** - Business rules evaluation
- **joi** - Schema validation
- **@mojaloop/central-services-logger** - Structured logging

## Testing Framework

- **Unit Tests**: AVA test runner with 1 concurrent process (`-c 1 --serial`)
- **Integration Tests**: Jest for integration testing
- **Pre-commit Hooks**: Automatically run lint, dependency check, audit check, and tests