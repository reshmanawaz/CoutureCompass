const request = require('request');
const readline = require('readline');

function searchForever21(apiKey, apiUrl, callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter your search query (e.g., "mens black jacket"): ', (input) => {
    const query = input.replace(/\s/g, ''); // Remove spaces

    const options = {
      method: 'GET',
      url: apiUrl,
      qs: {
        query: query.trim(),
        rows: '60',
        start: '0',
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'apidojo-forever21-v1.p.rapidapi.com',
      },
    };

    rl.close();

    request(options, function (error, response, body) {
      if (error) throw new Error(error);

      const jsonResponse = JSON.parse(body);
      const itemsList = jsonResponse?.response?.docs || [];

      if (itemsList) {
        const extractedItems = itemsList.map(item => {
          const {
            sale_price,
            title,
            url,
            brand,
            thumb_image,
            variants,
          } = item;

          const skuColorGroups = variants?.map(variant => variant.sku_color_group).filter(Boolean);

          return {
            Sale_price: sale_price,
            Title: title,
            Url: url,
            Brand: brand,
            Thumb_image: thumb_image,
            Variants: skuColorGroups,
          };
        });

        callback(extractedItems);
      } else {
        callback([]);
      }
    });
  });
}

// Example usage:
const apiKeyForever21 = '';
const apiUrlForever21 = 'https://apidojo-forever21-v1.p.rapidapi.com/products/search';

searchForever21(apiKeyForever21, apiUrlForever21, (result) => {
  console.log(result);
  // Call other APIs or perform additional processing here
});

