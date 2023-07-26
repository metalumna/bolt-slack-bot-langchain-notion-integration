import config from "./config";
import { App, KnownEventFromType, PlainTextOption } from "@slack/bolt";
import { addNotionPage, callChain } from "./langchain";
import { Document } from "langchain/dist/document";

// Create an instance of the Slack app
export const boltApp = new App({
  signingSecret: config.SLACK_SIGNING_SECRET,
  token: config.SLACK_BOT_TOKEN,
  appToken: config.SLACK_APP_TOKEN,
  socketMode: true,
});

// Function to post an ephemeral message to a user
const postEphemeral = ({
  message,
  text,
}: {
  message: KnownEventFromType<"message">;
  text: string;
}) => {
  if (message.subtype === undefined || message.subtype === "bot_message") {
    return boltApp.client.chat.postEphemeral({
      token: config.SLACK_BOT_TOKEN,
      channel: message.channel,
      user: message.user ?? "",
      text,
    });
  }
};

// Command to add a Notion page
boltApp.command("/add-notion-page", async ({ command, ack, respond }) => {
  // Extract the Notion page ID from the command text
  const id = /(?<!=)[0-9a-f]{32}/.exec(command.text)?.[0];

  if (!id) {
    // Notify if the notion URL doesn't contain a valid notion page id
    await ack({
      response_type: "ephemeral",
      text: `⚠️ The notion URL \`${command.text}\` does not contain a valid notion page id`,
    });
    return;
  }

  // Respond with an empty positive acknowledgement
  await ack();

  // Show loading message
  await respond({
    response_type: "ephemeral",
    text: "Loading...",
  });

  // Call function to add the Notion page and get the loaded pages
  const docsLoaded = await addNotionPage(id);

  if (docsLoaded.length === 0) {
    // Notify if the Notion URL was not accessible
    await respond({
      response_type: "ephemeral",
      text: `⚠️ The notion URL \`${command.text}\` was not accessible`,
    });
    return;
  }

  // Generate options for the loaded documents
  const documentTitles = docsLoaded.map(
    (docTitle, i) =>
      ({
        text: {
          type: "plain_text",
          text: docTitle,
          emoji: true,
        },
        value: `value-${i}`,
      } as PlainTextOption)
  );

  // Show a message with the number of loaded documents and options
  await respond({
    response_type: "ephemeral",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Loading ${docsLoaded.length} Document${
            docsLoaded.length === 1 ? "" : "s"
          } Complete.`,
        },
        accessory: {
          type: "overflow",
          options: documentTitles,
          action_id: "overflow-action",
        },
      },
    ],
    text: `Loading ${docsLoaded.length} page${
      docsLoaded.length === 1 ? "" : "s"
    } complete.`,
  });
});

// Message event listener
boltApp.message(async ({ message, say }) => {
  if (message.subtype === undefined || message.subtype === "bot_message") {
    // Get the full user details from the user ID
    const userInfo = await boltApp.client.users.info({
      user: message.user ?? "",
    });

    // Call the conversationalQAChain to get the result
    const result = (await callChain(message.text ?? "", {
      name: userInfo.user?.name ?? "",
      userId: message.user ?? "",
    }).catch((e) => {
      console.log(e);
      postEphemeral({
        message,
        text: "An error has occurred. Please try again.",
      });
    })) as void | {
      text: string;
      sourceDocuments: Document[];
    };

    if (result === undefined) return;

    // Turn the sources used for context into links
    const sources = Array.from(
      new Set(
        result.sourceDocuments.map(
          (doc) => `<${doc.metadata.url}|[${doc.metadata.properties_title}]>`
        )
      )
    ).join(" ");

    // Return the result and all sources used to get this result
    await say({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: result.text,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: sources,
            },
          ],
        },
      ],
      text: result.text,
    });
  }
});
