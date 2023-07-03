# langchain-notion-slack Setup Guide

In order to set up the langchain-notion-slack app on your local machine, follow the steps outlined below. 

## Initial Setup

1. Clone this repository to your local machine.
2. Once cloned, navigate into the directory and find the file named `.env.example`.
3. Copy the contents of `.env.example` into a new file named `.env` in the same directory.
4. Install dependancies
   ```bash
   npm install
   ```

## Filling Out the .env File

The .env file consists of several environment variables that need to be filled out for proper functioning of the application.

### 1. EXPRESS_PORT
The `EXPRESS_PORT` is the port on which your Express.js server will be running. This can remain as '8081' unless this port is already in use on your system.

### 2. OPENAI_API_KEY
To obtain your OpenAI API Key:
1. [Log in to your OpenAI account](https://beta.openai.com/signup/)
2. Navigate to the API section.
3. Copy your API Key and paste it in the `OPENAI_API_KEY` field in your .env file.

### 3. NOTION_TOKEN
To get your Notion API token:
1. [Log in to your Notion account](https://www.notion.so/login)
2. Go to "My Integrations" on the left-hand side.
3. Click on "+ New Integration" button.
4. After setting it up, you'll receive a token. Copy and paste this into the `NOTION_TOKEN` field.

### 4. Slack Configuration
This involves the `SLACK_SIGNING_SECRET`, `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`, and `SLACK_PORT`.
1. [Create a new Slack App or use an existing one](https://api.slack.com/apps?new_granular_bot_app=1)
2. Go to the "Basic Information" section to find your `SLACK_SIGNING_SECRET`.
3. `SLACK_BOT_TOKEN` and `SLACK_APP_TOKEN` can be found under the "OAuth & Permissions" section after installing the app to your workspace.
4. For the `SLACK_PORT`, it can remain as '8080' unless this port is already in use on your system.

### 5. Weaviate Configuration
The Weaviate related fields are `WEAVIATE_TOKEN`, `WEAVIATE_SCHEME`, `WEAVIATE_HOST`, and `WEAVIATE_INDEX`.
1. [Login to Weaviate and start a new temporary (free) instance](https://www.semi.technology/product/weaviate.html)
2. The `WEAVIATE_TOKEN` will be your authentication token for accessing your Weaviate instance.
3. `WEAVIATE_SCHEME` is the URL scheme of your Weaviate instance, usually 'http' or 'https'.
4. `WEAVIATE_HOST` is the hostname or IP address of your Weaviate instance (without 'https://').
5. `WEAVIATE_INDEX` is the name of your data index in Weaviate.

### 6. Redis Configuration
The Redis related fields are `REDIS_USER`, `REDIS_PASSWORD`, and `REDIS_URL`.
1. [Log in to Redis and start a new (free) instance](https://redislabs.com/)
2. `REDIS_USER` is the username you use to connect to your Redis database.
3. `REDIS_PASSWORD` is the password associated with the above username.
4. `REDIS_URL` is the hostname or IP address of your Redis instance.

Remember to save the `.env` file after making these changes.

## Usage
1. Run the application locally
    ```bash
    npm run dev
    ```
2. Add the slack bot to your new slack workspace.
3. Add a notion page
   1. Open up your new slack bot and use the slash command
        ```
        /add-notion-page [notionPageURL]
        ```
4. Once the pages have been loaded you are free to start a conversation with your data.
