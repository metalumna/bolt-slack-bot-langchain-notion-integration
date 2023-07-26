![Status](https://img.shields.io/badge/status-active-success.svg)
[![GitHub Issues](https://img.shields.io/github/issues/metalumna/bolt-slack-bot-langchain-notion-integration.svg)](https://github.com/metalumna/bolt-slack-bot-langchain-notion-integration/issues)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/metalumna/bolt-slack-bot-langchain-notion-integration.svg)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)
![Last Commit](https://img.shields.io/github/last-commit/metalumna/bolt-slack-bot-langchain-notion-integration)
![Stars](https://img.shields.io/github/stars/metalumna/bolt-slack-bot-langchain-notion-integration?style=social)

# Slack Bot with Langchain and Notion 🤖 🦜🔗

Welcome to the cutting-edge and comprehensive Slack Bot Integration with Langchain and Notion. Empowered by TypeScript, Bolt SDK, and a dash of revolutionary innovation, this project is the perfect foundation to elevate your Slack Bot creation journey. Build a conversational AI Slack bot that's an expert in your data + it gives you references to your Notion pages.

## ⭐ Features

- An easy-to-use starter project that you can leverage to initiate your own Slack bot.
- Built with the efficiency of the Bolt SDK and the prowess of TypeScript.
- The codebase is clear, concise, and thoroughly commented for a better understanding.
- The project is designed to be real-world app ready, extend and customize as you prefer.
- End up with a **powerful conversational AI knowledge base!**


## 🚀 Quick Start

1. Clone the repository:

   ```bash
   git clone https://github.com/metalumna/bolt-slack-bot-langchain-notion-integration.git
   ```

2. Move into the project directory:

   ```bash
   cd bolt-slack-bot-langchain-notion-integration
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the bot by filling out the necessary configurations (see below) and running:

   ```bash
   npm run dev
   ```

## 🔧 Configuration
First step is to copy `.env.example` to `.env` with 
```bash
cp .env.example .env
```

### OpenAI
- Find your API key in the account section of your openAI account and add it to `OPENAI_API_KEY` in `.env`.

### Slack
- Create a new Slack app, provide necessary permissions.
  - `chat:write`
  - `users:read`
- Enable direct messaging
- Configure the slash commands `/add-notion-page`
- Install the app in your workspace.
- Subscribe to events, and reinstall app to your workspace.
- Copy your Bot token `SLACK_BOT_TOKEN`, App token `SLACK_APP_TOKEN`, and Signing secret (`SLACK_SIGNING_SECRET`) to your `.env`.

### Notion
- Create a new integration in your Notion account and copy the Secret token to `NOTION_TOKEN` in your `.env`.
- Add your new integration to the desired Notion page.

### Weaviate
- Create a new Weaviate account and set up a new cluster.
- Get the details and add them to your `.env`
  - Authentication token `WEAVIATE_TOKEN`
  - URL scheme `WEAVIATE_SCHEME` (https)
  - Hostname `WEAVIATE_HOST` (URL without https://)
  - Data index name `WEAVIATE_INDEX` (NotionData)

### Redis
- Create a new Redis account, set up a new Redis subscription and then create a database.
- Get the details and add them to your `.env`
  - username `REDIS_USER` (default)
  - password `REDIS_PASSWORD`
  - public endpoint `REDIS_URL` (prefix with redis://)

> A comprehensive guide, including a dive into the code is on MetaLumna: [Unleashing the Potential of a Bolt Slack Bot: A Thorough Guide to Integrating Langchain and Notion](https://metalumna.com/articles/unleashing-the-potential-of-a-bolt-slack-bot-a-thorough-guide-to-integrating-langchain-and-notion)

## 🔎 Exploring the Code

This repo houses an easy to follow codebase that covers creating a conversation AI knowledge base Slack bot with TypeScript and Bolt SDK. Be sure to explore the `src/` directory to find main code segments, and check out the comments for running explanation of key sections!

## 💬 Contribution

Contributions, issues, and feature requests are welcome! If you find any bugs or issues, create a new issue right away!
