# Project setaup and testing
# https://khalilstemmler.com/blogs/typescript/node-starter-project/#:~:text=Compiling%20our%20TypeScript,generate%20the%20compiled%20JavaScript%20code.

# If there is a directory or file with the name of a recipe,
# 	Make will check if that folder or file has dependencies that are recent, instead of executing the recipe.
# 	List that recipe as .PHONY to force Make to execute it every time when called 
.PHONY: build

install: 
	pnpm install

run:
	npm start

dev:
	npm run dev

build:
	npm run build

test:
	npm run test

test-watch:
	npm run test -- --watch

test-integration:
	npm run test:integration

test-integration-watch:
	npm run test:integration:watch

lint:
	npm run lint

typecheck:
	npm run typecheck

clean:
	npm run clean