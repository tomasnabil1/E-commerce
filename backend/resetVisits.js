const mongoose = require("mongoose");
require("dotenv").config();

const PageVisit = mongoose.model("PageVisit", new mongoose.Schema({
  sessionId: String,
  page: String,
  visitedAt: Date
}));

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const result = await PageVisit.deleteMany({});
  console.log(`Deleted ${result.deletedCount} visit records. Analytics reset to 0.`);
  mongoose.disconnect();
}).catch(err => {
  console.error("Connection failed:", err.message);
  process.exit(1);
});
