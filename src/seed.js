const fs = require('fs');
const path = require('path');
const { checkConnection, createIndex, indexDocuments } = require('./elastic');

async function seedData() {
  try {
    // Check Elasticsearch connection with retries
    console.log('Attempting to connect to Elasticsearch...');
    const isConnected = await checkConnection(10, 5000); // 10 retries, 5 seconds between retries
    if (!isConnected) {
      console.error('Failed to connect to Elasticsearch after multiple attempts. Make sure Elasticsearch is running.');
      process.exit(1);
    }

    // Create index with proper mappings
    await createIndex();

    // Determine which data file to use based on command line argument
    let dataPath;
    if (process.argv.includes('--products')) {
      dataPath = path.join(__dirname, 'data', 'organic-world-products-with-kannada.json');
      console.log('Loading product catalog data...');
    } else {
      dataPath = path.join(__dirname, 'data', 'sample-data.json');
      console.log('Loading sample multilingual data...');
    }

    // Check if the file exists
    if (!fs.existsSync(dataPath)) {
      console.error(`File not found: ${dataPath}`);
      console.error('Make sure the data file exists at the correct path.');
      process.exit(1);
    }

    // Read data
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const documents = JSON.parse(rawData);

    // Add content field (copy of description) for compatibility if using product data
    const processedDocuments = process.argv.includes('--products') 
      ? documents.map(product => ({
          ...product,
          content: product.description || ''
        }))
      : documents;

    // Index documents
    await indexDocuments(processedDocuments);
    
    console.log('Data seeding completed successfully!');
    console.log(`Indexed ${processedDocuments.length} documents`);
    
    // Output some stats about the data
    if (process.argv.includes('--products')) {
      const languages = [...new Set(processedDocuments.map(doc => doc.language || 'unknown'))];
      const categories = [...new Set(processedDocuments.map(doc => doc.category || 'unknown'))];
      const brands = [...new Set(processedDocuments.map(doc => doc.brand || 'unknown'))];
      
      console.log(`Languages: ${languages.join(', ')}`);
      console.log(`Categories: ${categories.length} unique categories`);
      console.log(`Brands: ${brands.length} unique brands`);
    } else {
      const languages = [...new Set(processedDocuments.map(doc => doc.language || 'unknown'))];
      console.log(`Languages: ${languages.join(', ')}`);
    }
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedData();
