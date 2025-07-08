const axios = require("axios");

/**
 * Handles chatbot queries and sends them to Rasa for processing.
 */
const chatbotResponse = async (req, res) => {
  try {
    const { message } = req.body; // Get user message from frontend

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Send the user's message to the Rasa bot
    const rasaResponse = await axios.post("http://localhost:5005/webhooks/rest/webhook", {
      sender: "user",
      message: message,
    });

    // Extract and combine all text responses from Rasa
    const botMessages = rasaResponse.data
      .map(item => item.text)
      .filter(text => text); // Remove undefined or null texts
    const botMessage = botMessages.length > 0 ? botMessages.join("\n\n") : "I didn’t understand that.";

    // Return structured response for future-proofing
    res.json({
      response: botMessage,
      images: rasaResponse.data
        .filter(item => item.image)
        .map(item => item.image) // Support Rasa image responses if added later
    });
  } catch (error) {
    console.error("Chatbot error:", error.message);
    res.status(500).json({ error: "Failed to communicate with chatbot." });
  }
};

module.exports = { chatbotResponse };
