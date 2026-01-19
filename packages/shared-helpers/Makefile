# Makefile for @app-services-monitoring/db-lib

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

.PHONY: help install build test test-watch test-coverage lint typecheck clean dev

# Default target
help:
	@echo "$(GREEN)Available targets for db-lib:$(NC)"
	@echo "  make install      - Install dependencies"
	@echo "  make build        - Build the library"
	@echo "  make test         - Run tests"
	@echo "  make test-watch   - Run tests in watch mode"
	@echo "  make test-coverage - Run tests with coverage"
	@echo "  make lint         - Run linter"
	@echo "  make typecheck    - Run TypeScript type checking"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make dev          - Run in development mode (watch)"

install:
	@echo "$(GREEN)Installing dependencies...$(NC)"
	pnpm install

build:
	@echo "$(GREEN)Building db-lib...$(NC)"
	pnpm run build

test:
	@echo "$(GREEN)Running tests...$(NC)"
	pnpm run test

test-watch:
	@echo "$(GREEN)Running tests in watch mode...$(NC)"
	pnpm run test:watch

test-coverage:
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	pnpm run test:coverage

lint:
	@echo "$(GREEN)Running linter...$(NC)"
	npx eslint src --max-warnings 0

typecheck:
	@echo "$(GREEN)Running TypeScript type checking...$(NC)"
	pnpm run typecheck

clean:
	npm run clean

dev:
	@echo "$(GREEN)Starting development mode...$(NC)"
	pnpm run build -- --watch

# Shortcuts
test-unit: test
lint-fix:
	@echo "$(GREEN)Running linter with auto-fix...$(NC)"
	npx eslint src --fix