const axios = require("axios");

// Replace with your VM's API URL and port
const API_URL = "http://localhost:80"; // Adjust if running on a different host/port

(async () => {
  try {
    const response = await axios.get(`${API_URL}/leads/update/bot`);
    console.log("Endpoint triggered successfully:", response.data);
  } catch (error) {
    console.error("Error triggering endpoint:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
})();
