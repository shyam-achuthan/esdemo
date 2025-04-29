const { Client } = require("@elastic/elasticsearch");
require("dotenv").config();

// Create an Elasticsearch client
const client = new Client({
  node: process.env.ELASTIC_NODE,
});

// Index name for our demo
const INDEX_NAME = "documents";

// Check if Elasticsearch is running with retry mechanism
async function checkConnection(retries = 5, delay = 5000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await client.info();
      console.log("Elasticsearch connected successfully");
      console.log(`Elasticsearch version: ${info.version.number}`);
      return true;
    } catch (error) {
      console.error(
        `Elasticsearch connection attempt ${attempt}/${retries} failed:`,
        error.message
      );

      if (attempt === retries) {
        console.error("Max connection attempts reached. Exiting.");
        return false;
      }

      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return false;
}

// Create index with multilingual support
async function createIndex() {
  try {
    const indexExists = await client.indices.exists({
      index: INDEX_NAME,
    });

    if (indexExists) {
      console.log(`Index ${INDEX_NAME} already exists`);
      return;
    }

    await client.indices.create({
      index: INDEX_NAME,
      body: {
        settings: {
          analysis: {
            analyzer: {
              // Custom analyzer for multilingual content
              multilingual_analyzer: {
                type: "standard",
                stopwords: [
                  "_english_",
                  "_french_",
                  "_german_",
                  "_spanish_",
                  "_italian_",
                ],
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: "integer" },
            title: {
              type: "text",
              analyzer: "multilingual_analyzer",
              fields: {
                keyword: { type: "keyword" },
              },
            },
            content: {
              type: "text",
              analyzer: "multilingual_analyzer",
            },
            language: { type: "keyword" },
          },
        },
      },
    });

    console.log(`Index ${INDEX_NAME} created successfully`);
  } catch (error) {
    console.error("Error creating index:", error);
    throw error;
  }
}

// Bulk index documents
async function indexDocuments(documents) {
  try {
    const operations = documents.flatMap((doc) => [
      { index: { _index: INDEX_NAME } },
      doc,
    ]);

    const response = await client.bulk({ refresh: true, operations });

    if (response.errors) {
      console.error("Bulk indexing had errors");
      response.items.forEach((item, i) => {
        if (item.index && item.index.error) {
          console.error(`Error indexing document ${i}:`, item.index.error);
        }
      });
    } else {
      console.log(`Successfully indexed ${documents.length} documents`);
    }
  } catch (error) {
    console.error("Error bulk indexing documents:", error);
    throw error;
  }
}

// Basic search
async function basicSearch(query) {
  try {
    const response = await client.search({
      index: INDEX_NAME,
      body: {
        query: {
          multi_match: {
            query: query,
            fields: ["title", "content"],
          },
        },
      },
    });

    return response.hits.hits.map((hit) => ({
      score: hit._score,
      ...hit._source,
    }));
  } catch (error) {
    console.error("Error performing basic search:", error);
    throw error;
  }
}

// Fuzzy search for handling spelling mistakes
async function fuzzySearch(query) {
  try {
    const response = await client.search({
      index: INDEX_NAME,
      body: {
        query: {
          multi_match: {
            query: query,
            fields: ["title", "content"],
            fuzziness: "AUTO",
          },
        },
      },
    });

    return response.hits.hits.map((hit) => ({
      score: hit._score,
      ...hit._source,
    }));
  } catch (error) {
    console.error("Error performing fuzzy search:", error);
    throw error;
  }
}

// Language-specific search
async function languageSearch(query, language) {
  try {
    const response = await client.search({
      index: INDEX_NAME,
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: query,
                  fields: ["title", "content"],
                  fuzziness: "AUTO",
                },
              },
            ],
            filter: [
              {
                term: { language: language },
              },
            ],
          },
        },
      },
    });

    return response.hits.hits.map((hit) => ({
      score: hit._score,
      ...hit._source,
    }));
  } catch (error) {
    console.error("Error performing language search:", error);
    throw error;
  }
}

module.exports = {
  client,
  INDEX_NAME,
  checkConnection,
  createIndex,
  indexDocuments,
  basicSearch,
  fuzzySearch,
  languageSearch,
};
