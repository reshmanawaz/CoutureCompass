//---------------------------
// Project: CoutureCompass
// Date: November 29, 2023
//
// Description: A web server that implements the Amazon Price
// and eBay, and Forever21 APIs. The user sends a query and the server fetches results
// from the APIs and returns them to the user (web application) 
//---------------------------

const ebay_api_key = '72d885e2a7msh05d14642cb60074p19cfbdjsn2ac4751096fd';
const forever21_api_key = '72d885e2a7msh05d14642cb60074p19cfbdjsn2ac4751096fd';
const amazon_api_key = '72d885e2a7msh05d14642cb60074p19cfbdjsn2ac4751096fd';

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');


const app = express(); 

// Enable CORS
app.use(cors());

const PORT = 8000;

// Predefined list of fashion-related keywords
const fashionKeywords = ['dress', 'dresses', 'shirt', 'shirts',
'pants', 'skirt', 'skirts', 'jacket', 'jackets', 'jeans',
'sweater', 'sweaters', 'top', 'tops', 'blouse', 'blouses', 
'coat', 'coats', 'suit', 'suits', 'shorts', 't-shirt', 't-shirts',
'socks', 'underwear', 'underwears', 'scarf', 'scarfs', 'hat', 
'hats', 'gloves', 'belt', 'belts', 'shoes', 'boots', 'sandals', 
'sneakers', 'heel', 'heels', 'bag', 'bags', 'purse', 'purses', 
'watch', 'watches', 'jewelry', 'jewelries', 'sunglass', 'sunglasses', 
'tie', 'ties', 'bowtie', 'bowties', 'hoodie', 'hoodies',  'cargo pants', 
'chinos', 'slacks', 'leggings', 'jeggings', 'capris', 'loafers', 
'moccasins', 'flats', 'stilettoes', 'wedges', 'espadrilles', 'flip-flops', 
'earrings', 'bracelets', 'necklaces', 'rings', 'cufflinks', 'wallets', 
'clutches', 'backpacks', 'tote bags', 'beanies', 'caps', 'berets', 
'trench coat', 'parka', 'windbreaker', 'poncho', 'blazer', 'cardigan', 
'bras', 'camisoles', 'slips', 'nightgown', 'pajamas', 'robe', 'boxers', 
'briefs', 'swimwear', 'bikini', 'swimsuit', 'trunks', 'gym wear', 'activewear', 
'yoga pants', 'formalwear', 'evening gown', 'tuxedo', 'kimono', 'sari', 
'lehenga', 'kilt', 'cheongsam', 'hanbok', ];

// Function to format product data received from Amazon Price API
function format_amazon_product_data(products) {
    return products.map(product => {
        return {
            source: 'Amazon',
            title: product.title,
            sale_price: parseFloat(product.price.replace(/[^\d.]/g, '')), // Remove non-numeric characters
            thumb_image: product.imageUrl,
            url: product.detailPageURL
        };
    });
}


// Function to format product data received from eBay API
function format_ebay_product_data(products) {
    if (!products.products || !Array.isArray(products.products)) {
        console.error('Expected an array of products but received:', products);
        return [];
    }
    return products.products.slice(1).map(product => {
        return {
            source: 'eBay',
            thumb_image: product.thumbnail,
            title: product.title,
            sale_price: product.price && product.price.value,
            url: product.url
        };
    });
}

// Function to format product data received from Forever 21 API
function format_forever21_product_data(products) {
    if (!products || !Array.isArray(products.response?.docs)) {
        console.error('Error: Products data is not a valid list.');
        return [];
    }

    return products.response.docs.map(product => {
        return {
            source: 'Forever21',
            sale_price: product.sale_price,
            title: product.title,
            url: product.url,
            thumb_image: product.thumb_image
        };
    });
}

// Check if query matches any fashion keyword
function isFashionQuery(query) {
    const queryLower = query.toLowerCase();
    return fashionKeywords.some(keyword => queryLower.includes(keyword));
}

// Get method: '/search'
app.get('/search', async (req, res) => {
    const keywords = req.query.keywords;
    const forever21_keywords = req.query.keywords.replace(/\s/g, '');

    if (!isFashionQuery(keywords)) {
        return res.send('No Result');
    }

    const amazonRequest = {
        method: 'GET',
        url: 'https://amazon-price1.p.rapidapi.com/search',
        params: { marketplace: 'US', keywords: keywords },
        headers: {
            'X-RapidAPI-Key': amazon_api_key,
            'X-RapidAPI-Host': 'amazon-price1.p.rapidapi.com'
        }
    };

    const ebayRequest = {
        method: 'GET',
        url: `https://ebay32.p.rapidapi.com/search/${keywords}`,
        params: { page: '1' },
        headers: {
            'X-RapidAPI-Key': ebay_api_key,
            'X-RapidAPI-Host': 'ebay32.p.rapidapi.com'
        }
    };

    const forever21Request = {
        method: 'GET',
        url: 'https://apidojo-forever21-v1.p.rapidapi.com/products/search',
        params: {
            query: forever21_keywords,
            rows: '60',
            start: '0'
        },
        headers: {
            'X-RapidAPI-Key': forever21_api_key,
            'X-RapidAPI-Host': 'apidojo-forever21-v1.p.rapidapi.com'
        }
    };

    try {
        const [amazonResponse, ebayResponse, forever21Response] = await Promise.all([
            axios.request(amazonRequest),
            axios.request(ebayRequest),
            axios.request(forever21Request)
        ]);

        const amazonData = format_amazon_product_data(amazonResponse.data);
        const ebayData = format_ebay_product_data(ebayResponse.data);
        const forever21Data = format_forever21_product_data(forever21Response.data);

        // Combine results from all sources
        const combinedResults = [...amazonData, ...ebayData, ...forever21Data];

        // Sort the combined results by sale_price (ascending order)
        combinedResults.sort((a, b) => parseFloat(a.sale_price) - parseFloat(b.sale_price));


        res.json(combinedResults);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data from APIs');
    }
});

//display initial when users visit the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'modified_index_v3.html'))
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
