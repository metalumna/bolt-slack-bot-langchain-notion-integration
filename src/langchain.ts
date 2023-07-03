import { ConversationalRetrievalQAChain } from "langchain/chains";
import { WeaviateStore } from "langchain/vectorstores/weaviate";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { BufferMemory } from "langchain/memory";
import { RedisChatMessageHistory } from "langchain/stores/message/redis";

import config from "./config";

import { PromptTemplate } from "langchain/prompts";
import { OpenAI } from "langchain/llms/openai";
import { NotionAPILoader } from "langchain/document_loaders/web/notionapi";

import weaviate from "weaviate-ts-client";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const weaviateClient = weaviate.client({
  scheme: config.WEAVIATE_SCHEME,
  host: config.WEAVIATE_HOST,
  apiKey: new weaviate.ApiKey(config.WEAVIATE_TOKEN),
});

export async function addNotionPage(id: string) {
  const response: string[] = [];
  const loader = new NotionAPILoader({
    clientOptions: { auth: config.NOTION_TOKEN },
    id,
    type: "page",
  });

  const docs = await loader.load().catch(console.log);
  if (docs === undefined) return response;

  response.push(...docs.map((doc) => doc.metadata.properties.title));

  const splitter = new RecursiveCharacterTextSplitter();
  const splitDocs = await splitter.splitDocuments(docs);

  const result = await WeaviateStore.fromDocuments(
    splitDocs,
    new OpenAIEmbeddings({ openAIApiKey: config.OPENAI_API_KEY }),
    {
      client: weaviateClient as any,
      indexName: config.WEAVIATE_INDEX,
    }
  )
    .then((res) => response)
    .catch((res) => [] as string[]);

  return result;
}

const questionGeneratorTemplate = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question. Do not invent any new information, only rephrase the question. Do include personally identifiable details from the chat history like name, age, location, etc.

Chat History:
{chat_history}

Follow Up Input: {question}
Standalone question:`;

const qaTemplate = `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
Helpful Answer:`;

export async function callChain(
  question: string,
  { name, userId }: { name: string; userId: string }
) {
  /* Initialize the models to use */
  const lowTempModel = new OpenAI({
    modelName: "text-davinci-003",
    temperature: 0,
  });
  const midTempModel = new OpenAI({
    modelName: "text-davinci-003",
    temperature: 0.5,
  });

  /* Initialize the vector store to use to retrieve the answer */
  const vectorStore = new WeaviateStore(
    new OpenAIEmbeddings({ openAIApiKey: config.OPENAI_API_KEY }),
    {
      client: weaviateClient as any,
      indexName: config.WEAVIATE_INDEX,
      metadataKeys: ["notionId", "url", "properties_title"],
    }
  );

  /* Initialize the memory to use to store the chat history */
  const memory = new BufferMemory({
    chatHistory: new RedisChatMessageHistory({
      sessionId: userId,
      config: {
        url: config.REDIS_URL,
        username: config.REDIS_USER,
        password: config.REDIS_PASSWORD,
      },
    }),
    humanPrefix: name,
    memoryKey: "chat_history",
    inputKey: "question",
    outputKey: "text",
    returnMessages: true,
  });

  /* Initialize the chain */
  const chain = ConversationalRetrievalQAChain.fromLLM(
    midTempModel,
    vectorStore.asRetriever(10),
    {
      memory,
      questionGeneratorChainOptions: {
        llm: lowTempModel,
        template: questionGeneratorTemplate,
      },
      qaChainOptions: {
        type: "stuff",
        prompt: new PromptTemplate({
          template: qaTemplate,
          inputVariables: ["context", "question"],
        }),
      },
      returnSourceDocuments: true,
    }
  );

  return chain.call({ question });
}
