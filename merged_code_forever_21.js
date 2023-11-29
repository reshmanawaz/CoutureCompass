const express = require('express');
const cors = require('cors'); // Add this line
const axios = require('axios');
const app = express();
const PORT = 8000;

// Enable CORS
app.use(cors()); // Add this line

// Forever 21 API key
const apiKeyForever21 = '72d885e2a7msh05d14642cb60074p19cfbdjsn2ac4751096fd';

// Function to format product data received from the API
function format_product_data(products) {
    if (!products || !Array.isArray(products.response?.docs)) {
        console.error('Error: Products data is not a valid list.');
        console.log(products);
        return [];
    }

    return products.response.docs.map(product => {
        return {
            sale_price: product.sale_price,
            title: product.title,
            url: product.url,
            thumb_image: product.thumb_image
        };
    });
}

// Get method: '/search'
app.get('/search', async (req, res) => {
    // Extract search keywords from query parameter and remove spaces
    const keywords = req.query.keywords.replace(/\s/g, '');

    const items = {
        method: 'GET',
        url: 'https://apidojo-forever21-v1.p.rapidapi.com/products/search',
        params: {
            query: keywords,
            rows: '60',
            start: '0',
            color_groups: 'black'
        },
        headers: {
            'X-RapidAPI-Key': apiKeyForever21,
            'X-RapidAPI-Host': 'apidojo-forever21-v1.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(items);
        const formatted_data = format_product_data(response.data);

        res.json(formatted_data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data from Forever21 API');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Command-line usage: node server.js "mens black jacket"
const searchKeywords = process.argv[2];
if (searchKeywords) {
    axios.get(`http://localhost:${PORT}/search?keywords=${encodeURIComponent(searchKeywords)}`)
        .then(response => console.log(response.data))
        .catch(error => console.error(error.message));
}
