//---------------------------
// Project: CoutureCompass
// Author: Khaled Alrashidi
// Date: November 20, 2023
//
// Description: A web server that implements the Amazon Price
// API. The user sends a query, and the server returns the results 
// based on the query.
//---------------------------


// Import required modules

// Express framework
const express = require('express');
// Axios for making HTTP requests
const axios = require('axios');
// Start an Express application
const app = express();

// the port number the server will listen on
const PORT = 8000;

// Function to format product data received from the API
function format_product_data(products) {
    // Map each product to a new object with only necessary fields
    return products.map(product => {
        return {
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl,
            detailPageURL: product.detailPageURL
        };
    });
}

// Get method: '/search'
app.get('/search', async (req, res) => {
    // Get search keywords from query parameter
    const keywords = req.query.keywords; 

    const items = {
        method: 'GET',
        url: 'https://amazon-price1.p.rapidapi.com/search',
        params: {
            marketplace: 'US',
            // Use the keywords from the query parameter
            keywords: keywords
        },
        headers: {
            // API key for authentication
            'X-RapidAPI-Key': APIKey, // Add your API key
            // Host header required by the API
            'X-RapidAPI-Host': 'amazon-price1.p.rapidapi.com'
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
        // Format the received data
        const formatted_data = format_product_data(response.data);
        
        res.json(formatted_data);
    } catch (error) {
        // Log any errors to the console
        console.error(error);
        res.status(500).send('Error fetching data from Amazon API');
    }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
