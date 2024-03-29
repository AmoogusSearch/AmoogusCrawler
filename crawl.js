const { JSDOM } = require("jsdom");
const cheerio = require("cheerio");

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

module.exports = {
    normalizeURL,
    getURLsFromHTML,
};
