const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

// Create an Elasticsearch client
const client = new Client({
  node: process.env.ELASTIC_NODE
});

// Index name for our demo
const INDEX_NAME = 'documents';

// Check if Elasticsearch is running with retry mechanism
async function checkConnection(retries = 5, delay = 5000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await client.info();
      console.log('Elasticsearch connected successfully');
      console.log(`Elasticsearch version: ${info.version.number}`);
      return true;
    } catch (error) {
      console.error(`Elasticsearch connection attempt ${attempt}/${retries} failed:`, error.message);
      
      if (attempt === retries) {
        console.error('Max connection attempts reached. Exiting.');
        return false;
      }
      
      console.log(`Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
}

// Create index with multilingual support
async function createIndex() {
  try {
    const indexExists = await client.indices.exists({
      index: INDEX_NAME
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
                type: 'standard',
                stopwords: ['_english_', '_french_', '_german_', '_spanish_', '_italian_', '_kannada_']
              },
              // Product analyzer for product-specific terminology
              product_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding']
              }
            }
          }
        },
        mappings: {
          properties: {
            id: { type: 'integer' },
            title: { 
              type: 'text',
              analyzer: 'multilingual_analyzer',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            content: { 
              type: 'text', 
              analyzer: 'multilingual_analyzer' 
            },
            description: { 
              type: 'text', 
              analyzer: 'multilingual_analyzer' 
            },
            language: { type: 'keyword' },
            category: { type: 'keyword' },
            subcategory: { type: 'keyword' },
            brand: { type: 'keyword' },
            tags: { type: 'keyword' },
            keywords: { 
              type: 'text',
              analyzer: 'product_analyzer',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            url: { type: 'keyword' },
            price_note: { type: 'text' }
          }
        }
      }
    });

    console.log(`Index ${INDEX_NAME} created successfully`);
  } catch (error) {
    console.error('Error creating index:', error);
    throw error;
  }
}

// Bulk index documents
async function indexDocuments(documents) {
  try {
    const operations = documents.flatMap(doc => [
      { index: { _index: INDEX_NAME } },
      doc
    ]);

    const response = await client.bulk({ refresh: true, operations });

    if (response.errors) {
      console.error('Bulk indexing had errors');
      response.items.forEach((item, i) => {
        if (item.index && item.index.error) {
          console.error(`Error indexing document ${i}:`, item.index.error);
        }
      });
    } else {
      console.log(`Successfully indexed ${documents.length} documents`);
    }
  } catch (error) {
    console.error('Error bulk indexing documents:', error);
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
            fields: ['title', 'content', 'description', 'keywords']
          }
        }
      }
    });

    return response.hits.hits.map(hit => ({
      score: hit._score,
      ...hit._source
    }));
  } catch (error) {
    console.error('Error performing basic search:', error);
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
            fields: ['title', 'content', 'description', 'keywords'],
            fuzziness: 'AUTO'
          }
        }
      }
    });

    return response.hits.hits.map(hit => ({
      score: hit._score,
      ...hit._source
    }));
  } catch (error) {
    console.error('Error performing fuzzy search:', error);
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
                  fields: ['title', 'content', 'description', 'keywords'],
                  fuzziness: 'AUTO'
                }
              }
            ],
            filter: [
              {
                term: { language: language }
              }
            ]
          }
        }
      }
    });

    return response.hits.hits.map(hit => ({
      score: hit._score,
      ...hit._source
    }));
  } catch (error) {
    console.error('Error performing language search:', error);
    throw error;
  }
}

// Brand search
async function brandSearch(query, brand) {
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
                  fields: ['title', 'content', 'description', 'keywords'],
                  fuzziness: 'AUTO'
                }
              }
            ],
            filter: [
              {
                term: { brand: brand }
              }
            ]
          }
        }
      }
    });

    return response.hits.hits.map(hit => ({
      score: hit._score,
      ...hit._source
    }));
  } catch (error) {
    console.error('Error performing brand search:', error);
    throw error;
  }
}

// Prefix search for autocomplete functionality
async function prefixSearch(prefix) {
  try {
    const response = await client.search({
      index: INDEX_NAME,
      body: {
        query: {
          multi_match: {
            query: prefix,
            fields: ['title', 'keywords'],
            type: 'phrase_prefix'
          }
        }
      }
    });

    return response.hits.hits.map(hit => ({
      score: hit._score,
      ...hit._source
    }));
  } catch (error) {
    console.error('Error performing prefix search:', error);
    throw error;
  }
}

// Multilingual product search
async function multilingualSearch(query) {
  try {
    const response = await client.search({
      index: INDEX_NAME,
      body: {
        query: {
          multi_match: {
            query: query,
            fields: ['title', 'content', 'description', 'keywords'],
            fuzziness: 'AUTO'
          }
        },
        sort: [
          { _score: { order: 'desc' } }
        ]
      }
    });

    return response.hits.hits.map(hit => ({
      score: hit._score,
      ...hit._source
    }));
  } catch (error) {
    console.error('Error performing multilingual search:', error);
    throw error;
  }
}

// Spelling correction search
async function spellingCorrectionSearch(query) {
  try {
    const response = await client.search({
      index: INDEX_NAME,
      body: {
        query: {
          multi_match: {
            query: query,
            fields: ['title^3', 'content', 'description', 'keywords^2'],
            fuzziness: 'AUTO',
            prefix_length: 1
          }
        },
        suggest: {
          text: query,
          simple_phrase: {
            phrase: {
              field: "title",
              size: 1,
              gram_size: 3,
              direct_generator: [{
                field: "title",
                suggest_mode: "always"
              }],
              highlight: {
                pre_tag: "<em>",
                post_tag: "</em>"
              }
            }
          }
        }
      }
    });

    const suggestions = response.suggest?.simple_phrase[0]?.options || [];
    const suggestedText = suggestions.length > 0 ? suggestions[0].text : null;

    return {
      results: response.hits.hits.map(hit => ({
        score: hit._score,
        ...hit._source
      })),
      suggestedQuery: suggestedText
    };
  } catch (error) {
    console.error('Error performing spelling correction search:', error);
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
  brandSearch,
  prefixSearch,
  multilingualSearch,
  spellingCorrectionSearch
};
