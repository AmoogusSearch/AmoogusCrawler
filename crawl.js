const { JSDOM } = require("jsdom");
const cheerio = require("cheerio");
const axios = require("axios");


function normalizeURL(urlString) {
    const urlObj = new URL(urlString);

    let hostPath = `${urlObj.hostname}${urlObj.pathname}`;
    if (hostPath.length > 0 && hostPath.endsWith("/")) {
        hostPath = hostPath.slice(0, -1);
    }

    return hostPath;
}

function getURLsFromHTML(htmlBody, baseURL) {
    const urls = [];
    const $ = cheerio.load(htmlBody);
    const linkElements = $("a");
    linkElements.each((index, element) => {
        const href = $(element).attr("href");
        if (!href) return;
        let urlObj;
        try {
            urlObj = new URL(href, baseURL); // convert to absolute URL
            if (href.startsWith("/"))
                new URL(`${baseURL}${href}`); // check if it's a valid URL
            else new URL(href); // check if it's a valid URL
        } catch (e) {
            return console.error(`Error parsing URL: ${e.message}`);
        }
        urls.push(urlObj.href);
    });
    return urls;
}

async function crawlPage(currentURL) {
  
  console.log(`\x1b[32mCrawling ${currentURL}`);

  let response
  try {
    response = await axios.get(currentURL);
  } catch (e) {
    return console.error(`\x1b[31mError fetching URL: ${e.message}\x1b[0m`);
  }
  const contentType = response.headers["content-type"];
  if (!contentType || !contentType.includes("text/html")) {
    return console.error(`\x1b[33mSkipping non-HTML page: ${contentType}\x1b[0m`);
  }
}

module.exports = {
    normalizeURL,
    getURLsFromHTML,
    crawlPage,
};
