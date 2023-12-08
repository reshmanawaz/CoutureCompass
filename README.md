# CoutureCompass
* The CoutureCompass platform provides a use case where online shoppers can effortlessly search for fashion items across multiple retailers with a single query. When entering search terms, the system aggregates and displays relevant product listings from sources like Amazon, Forever 21, eBay, and AliExpress. 
* Users can then browse a combined selection and are redirected to the original retailer's site to complete their purchase. This simplifies the shopping experience by offering a one-stop solution for comparison and discovery, mitigating the need to individually visit and search multiple e-commerce stores.

# Architecture
* CoutureCompass has two components: a front-end and a back-end. The front-end is responsible for presenting the user interface, capturing user input, and displaying the search results. The back-end acts as an intermediary between the front-end and external APIs. It handles HTTP requests from the client, and process these requests by fetching data from external APIs.
* Data retrieved from external APIs is processed and formatted by the back-end before being sent back to the front-end. The data flow starts with the user input on the front-end, which triggers a request to the back-end. The back-end then communicates with external APIs, aggregates the responses, and sends the data back to the front-end.

# Files 
* project.js: A JavaScript file for CoutureCompass, responsible for handling the client-side logic. It includes functions for sending user queries to the server, processing and displaying search results, and managing user interactions across the web application.
* style.css: A CSS file for the entire CoutureCompass platform.
* index.html: An HTML page that is the main entry point of the CoutureCompass web application.
* signin.html: An HTML page that contains the user interface for the sign-in page of CoutureCompass.
* signup.html: An HTML page that presents the user interface for new user registration on CoutureCompass.
* about_us.html: An HTML page that provides information about CoutureCompass.
* images: A Folder with all the images used in the HTML pages.

# Outcomes and Results
* The development of a web platform where users can search for clothing items across multiple e-commerce sites from a single interface.
* Successful integration of external APIs into the platform to fetch real-time data and present it in a unified format.
* The platform is expected to streamline the fashion shopping experience, making it more efficient and user-friendly. Instead of visiting multiple websites, users can find a variety of options in one place.

