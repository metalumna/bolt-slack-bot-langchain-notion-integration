import config from "./config";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { WeaviateStore } from "langchain/vectorstores/weaviate";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { BufferMemory } from "langchain/memory";
import { RedisChatMessageHistory } from "langchain/stores/message/redis";
import { PromptTemplate } from "langchain/prompts";
import { OpenAI } from "langchain/llms/openai";
import { NotionAPILoader } from "langchain/document_loaders/web/notionapi";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import weaviate from "weaviate-ts-client";

// Creating a Weaviate client using the 'weaviate' module with the provided configuration
const weaviateClient = weaviate.client({
  scheme: config.WEAVIATE_SCHEME,
  host: config.WEAVIATE_HOST,
  apiKey: new weaviate.ApiKey(config.WEAVIATE_TOKEN),
});

export async function addNotionPage(id: string) {
  // Creating an empty array 'response' to store the response from the function
  const response: string[] = [];

  // Creating a new 'NotionAPILoader' instance with the provided configuration
  const loader = new NotionAPILoader({
    clientOptions: { auth: config.NOTION_TOKEN },
    id,
    type: "page",
  });

  // Loading the documents using the 'loader' object and catching any errors
  const docs = await loader.load().catch(console.log);

  // If 'docs' is undefined, return the empty 'response' array
  if (docs === undefined) return response;

  // Extracting the title property of each document and pushing it to the 'response' array
  response.push(...docs.map((doc) => doc.metadata.properties.title));

  // Splitting the documents using a new 'RecursiveCharacterTextSplitter' instance
  const splitter = new RecursiveCharacterTextSplitter();
  const splitDocs = await splitter.splitDocuments(docs);

  // Calling the 'fromDocuments' method of the 'WeaviateStore' class to create a WeaviateStore from the split documents
  const result = await WeaviateStore.fromDocuments(
    splitDocs,
    new OpenAIEmbeddings({ openAIApiKey: config.OPENAI_API_KEY }),
    {
      client: weaviateClient as any,
      indexName: config.WEAVIATE_INDEX,
    }
  )
    .then((res) => response) // Resolving the response with the 'response' array
    .catch((res) => [] as string[]); // Catching any errors and resolving an empty 'string' array

  // Returning the 'result'
  return result;
}

// Creating a 'questionGeneratorTemplate' string with a predefined template
const questionGeneratorTemplate = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question. Do not invent any new information, only rephrase the question. Do include personally identifiable details from the chat history like name, age, location, etc.

Chat History:
{chat_history}

Follow Up Input: {question}
Standalone question:`;

// Creating a 'qaTemplate' string with a predefined template
const qaTemplate = `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
Helpful Answer:`;

// Defining a 'callChain' function that takes a 'question' parameter and an object parameter with 'name' and 'userId' properties
export async function callChain(
  question: string,
  { name, userId }: { name: string; userId: string }
) {
  /* Initialize the models to use */

  // Creating a new 'OpenAI' instance with a low temperature model
  const lowTempModel = new OpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0,
  });

  // Creating a new 'OpenAI' instance with a mid temperature model
  const midTempModel = new OpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.5,
  });

  /* Initialize the vector store to use to retrieve the answer */

  // Creating a new 'WeaviateStore' instance with the provided configuration and vector store options
  const vectorStore = new WeaviateStore(
    new OpenAIEmbeddings({ openAIApiKey: config.OPENAI_API_KEY }),
    {
      client: weaviateClient as any,
      indexName: config.WEAVIATE_INDEX,
      metadataKeys: ["notionId", "url", "properties_title"],
    }
  );

  /* Initialize the memory to use to store the chat history */

  // Creating a new 'BufferMemory' instance with the provided configuration
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

  // Creating a new 'ConversationalRetrievalQAChain' instance with the specified models, vector store, memory, and chain options
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
