//---------------------------
// Project: CoutureCompass
// Date: December 6, 2023
//
// Description: A web server that implements the Amazon Price
// and eBay, Forever21, and AliExpress APIs. The user sends a 
// query and the server fetches results from the APIs and returns
// them to the user (web application) 
//---------------------------

const ebay_api_key = 'API_KEY';
const forever21_api_key = 'API_KEY';
const amazon_api_key = 'API_KEY';
const aliexpress_api_key = 'API_KEY';

const express = require('express');
const axios = require('axios');
const cors = require('cors');


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
'lehenga', 'kilt', 'cheongsam', 'hanbok'];

// Check if query matches any fashion keyword
function isFashionQuery(query) {
    const queryLower = query.toLowerCase();
    return fashionKeywords.some(keyword => queryLower.includes(keyword));
}

// Function to format product data received from Amazon Price API
function format_amazon_product_data(products) {
    return products.map(product => {
        // Determine the price to display
        let displayPrice = product.price ? product.price : product.listPrice;

        // If there's no price, set a fallback message
        if (!displayPrice) {
            displayPrice = 'Product is on sale';
        }

        return {
            source: 'Amazon',
            title: product.title,
            sale_price: displayPrice, // Set the determined price
            thumb_image: product.imageUrl,
            url: product.detailPageURL
        };
    });
}
// Function to format product data received from eBay API
function format_ebay_product_data(products, searchQuery) {
    if (!products.products || !Array.isArray(products.products)) {
        console.error('Expected an array of products but received:', products);
        return [];
    }
    return products.products.slice(1, 11).map(product => {
        const title = product.title === 'F#f_0' ? searchQuery : product.title;

        return {
            source: 'eBay',
            thumb_image: product.thumbnail,
            title: title,
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

    return products.response.docs.slice(0, 10).map(product => {
        return {
            source: 'Forever21',
            sale_price: product.sale_price,
            title: product.title,
            url: product.url,
            thumb_image: product.thumb_image
        };
    });
}

// Function to format product data received from the API
function format_aliexpress_product_data(products) {
    if (!products.result || !Array.isArray(products.result.resultList)) {
        console.error('Expected an array of products but received:', products);
        return [];
    }

    return products.result.resultList.slice(0, 10).map(entry => {
        const product = entry.item;
        return {
            source: 'AliExpress',
            title: product.title,
            sale_price: product.sku.def.promotionPrice,
            thumb_image: 'https:' + product.image, 
            url: 'https://www.aliexpress.com/item/' + product.itemId + '.html' 
        };
    });
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
            rows: '12',
            start: '0'
        },
        headers: {
            'X-RapidAPI-Key': forever21_api_key,
            'X-RapidAPI-Host': 'apidojo-forever21-v1.p.rapidapi.com'
        }
    };

    const aliexpressRequest = {
        method: 'GET',
        url: 'https://aliexpress-datahub.p.rapidapi.com/item_search_2',
        params: { q: keywords, page: '1' },
        headers: {
            'X-RapidAPI-Key': aliexpress_api_key,
            'X-RapidAPI-Host': 'aliexpress-datahub.p.rapidapi.com'
        }
    };

    try {
        const [amazonResponse, ebayResponse, forever21Response, aliexpressResponse] = await Promise.all([
            axios.request(amazonRequest),
            axios.request(ebayRequest),
            axios.request(forever21Request),
            axios.request(aliexpressRequest)
        ]);

        const amazonData = format_amazon_product_data(amazonResponse.data);
        const ebayData = format_ebay_product_data(ebayResponse.data, keywords);
        const forever21Data = format_forever21_product_data(forever21Response.data);
        const aliexpressData = format_aliexpress_product_data(aliexpressResponse.data);

        const combinedResults = [...amazonData, ...ebayData, ...forever21Data, ...aliexpressData];

        res.json(combinedResults);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data from APIs');
    }

});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// run on your browser something like 
// 'http://localhost:8000/search?keywords=men pants'
