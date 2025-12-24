const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());

const jewelry = [
  { id: 1, name: "Gold Necklace", price: "$50", image: "https://via.placeholder.com/150" },
  { id: 2, name: "Silver Ring", price: "$30", image: "https://via.placeholder.com/150" }
];

app.get('/api/products', (req, res) => {
  res.json(jewelry);
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));