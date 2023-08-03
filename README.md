# codecaptain.ai

A dev advisor to ask about your code and project

## How to start the python server

Use the command `python uvicorn pyserver:app --reload --app-dir=ai` to start the python server. It takes default port 8000.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/geprog/codecaptain)

## Database

We are using Drizzle ORM and sqlite as of now. The schemas need to be inside db/schemas and the migrations will be inside db/migrations. checkout `drizzle.config.ts` for the settings.

## ToDo

- [ ] use CodeSplitter and code-detector to get code parts
- [x] test with more questions
- [x] add UI
- [ ] add more context / data to embeddings
  - [x] file structure
  - [ ] summary
  - [ ] language of code
  - [x] include issues
  - [ ] include PRs
  - [ ] include issue comments
  - [ ] include PR comments
- [ ] try gpt-4 and system messages
- [ ] update embeddings on commits
- [ ] show related code parts in UI
- [ ] add some proper database for user and repos
- [ ] check **ACCESS** of user to repo
- [ ] use message history when asking a question
- [ ] autocomplete while asking questions
- [ ] skip gitignored and .git files when indexing

## Appreciations

- https://hackernoon.com/reverse-engineering-reddits-source-code-with-langchain-and-gpt-4
