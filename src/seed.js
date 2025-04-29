const fs = require("fs");
const path = require("path");
const { checkConnection, createIndex, indexDocuments } = require("./elastic");

async function seedData() {
  try {
    // Check Elasticsearch connection
    const isConnected = await checkConnection();
    if (!isConnected) {
      console.error(
        "Failed to connect to Elasticsearch. Make sure Elasticsearch is running."
      );
      process.exit(1);
    }

    // Create index with proper mappings
    await createIndex();

    // Read sample data
    const dataPath = path.join(__dirname, "data", "sample-data.json");
    const rawData = fs.readFileSync(dataPath, "utf8");
    const documents = JSON.parse(rawData);

    // Index documents
    await indexDocuments(documents);

    console.log("Data seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

// Run the seed function
seedData();
