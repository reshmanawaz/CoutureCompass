//---------------------------
// Project: CoutureCompass
// Author: Khaled Alrashidi
// Date: November 22, 2023
//
// Description: A web server that implementats the eBay API. 
// The user sends a query and the server returns results based
// on the query.
//---------------------------

// Import required modules

// Express framework
const express = require('express');
// Axios for making HTTP requests
const axios = require('axios');
// Start an Express application
const app = express();

// the port number the server will listen on
const PORT = 3000;


// Function to format product data received from the API
function format_product_data(products) {
    // Map each product to a new object with only necessary fields
    if (!products.products || !Array.isArray(products.products)) {
        console.error('Expected an array of products but received:', products);
        return []; // Return an empty array if the structure is not as expected
    }

    // Skip the first item
    const processed_products = products.products.slice(1);

    return processed_products.map(product => {
        return {
            thumbnail: product.thumbnail,
            title: product.title,
            // Check if price object exists and then get the value
            price: product.price && product.price.value,
            url: product.url
        };
    });
}

// Get method: '/search'
app.get('/search', async (req, res) => {
    // Get search keywords from query parameter
    const keywords = req.query.keywords;

    const items = {
        method: 'GET',
        url: `https://ebay32.p.rapidapi.com/search/${keywords}`,
        params: {page: '1'},
        headers: {
            // API key for authentication
            'X-RapidAPI-Key': APIKey, // Add your API key
            // Host header required by the API
            'X-RapidAPI-Host': 'ebay32.p.rapidapi.com'
        }
    };

    // try {
    //     const response = await axios.request(items);
    //     res.json(response.data); // Send the data back to the client
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).send('Error fetching data from Amazon API');
    // }

    try {
        const response = await axios.request(items);
        // console.log(response.data);
        
        // Format the received data
        const formatted_data = format_product_data(response.data);
        res.json(formatted_data);
    } catch (error) {
        // Log any errors to the console
        console.error(error);
        res.status(500).send('Error fetching data from eBay API');
    }

});


// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
