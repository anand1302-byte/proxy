const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Proxy route
app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url; // URL jo aap access karna chahte hain
  
  if (!targetUrl) {
    return res.status(400).json({ error: "Please provide a URL as a query parameter" });
  }

  try {
    const response = await axios.get(targetUrl);

    // JSON format response
    res.json(response.data);
  } catch (error) {
    console.error("Error while fetching data:", error.message);
    res.status(500).json({ error: "Failed to fetch data from the target URL" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
