.PHONY: help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

run: ## Run the app
	dotenv -e .env -- pnpm dlx esno src/index.ts

setup: ## Start localstack, create queue
	docker compose up -d
	dotenv -e .env -- pnpm dlx esno src/setup.ts

type-check: ## run type-check
	pnpm type-check