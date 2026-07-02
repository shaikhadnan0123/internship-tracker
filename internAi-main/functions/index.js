const functions = require("firebase-functions");
const { app } = require("./server.js");

// Export the Express server as an HTTPS Cloud Function
exports.api = functions.https.onRequest(app);
