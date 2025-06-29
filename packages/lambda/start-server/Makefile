build-StartServer:
	curl -fsSL https://bun.sh/install | bash
	~/.bun/bin/bun i
	~/.bun/bin/bun build ./src/index.ts --target bun --outfile $(ARTIFACTS_DIR)/index.js
