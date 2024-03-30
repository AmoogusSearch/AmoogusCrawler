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
            if (href.startsWith("#")) return; // skip internal links (anchors)
            if (href.startsWith("/"))
                new URL(`${baseURL}${href}`); // check if it's a valid URL
            else new URL(href); // check if it's a valid URL
        } catch (e) {
            return console.error(`Error parsing URL: ${e.message} (${href})`);
        }
        urls.push(urlObj.href);
    });
    return urls;
}

async function crawlPage(baseURL, pageURL) {
    console.log(`\x1b[32mCrawling ${pageURL}\x1b[0m`);

    // check if the URL without query and anchor ends with a file extension
    const urlObj = new URL("https://" + normalizeURL(pageURL));
    const path = urlObj.pathname;
    const lastDotIndex = path.lastIndexOf(".");
    if (lastDotIndex !== -1) {
        const extension = path.slice(lastDotIndex + 1);
        if (
            [
                "jpg",
                "jpeg",
                "png",
                "gif",
                "pdf",
                "doc",
                "docx",
                "ppt",
                "pptx",
                "xls",
                "xlsx",
                "mp4",
                "mp3",
                "avi",
                "mkv",
                "mov",
                "flv",
                "wav",
                "zip",
                "rar",
                "7z",
                "tar",
                "gz",
                "iso",
                "dmg",
                "exe",
                "msi",
                "apk",
                "deb",
                "rpm",
                "bin",
                "sh",
                "bat",
                "cmd",
                "ps1",
                "vbs",
                "js",
                "css",
                "scss",
                "less",
                "sass",
                "xml",
                "json",
                "yaml",
                "yml",
                "toml",
                "csv",
                "tsv",
                "sql",
                "db",
                "dbf",
                "mdb",
                "accdb",
                "sqlite",
                "sqlite3",
                "bak",
                "log",
                "tmp",
                "temp",
                "bak",
                "old",
                "backup",
                "swp",
                "swo",
            ].includes(extension)
        ) {
            console.error(`\x1b[33mSkipping file: ${extension}\x1b[0m`);
            return { error: true };
        }
    }

    let response;
    try {
        response = await axios.get(pageURL);
    } catch (e) {
        console.error(`\x1b[31mError fetching URL: ${e.message}\x1b[0m`);
        return { error: true };
    }
    const contentType = response.headers["content-type"];
    if (!contentType || !contentType.includes("text/html")) {
        console.error(`\x1b[33mSkipping non-HTML page: ${contentType}\x1b[0m`);
        return { error: true };
    }

    const htmlBody = response.data;
    let urls = getURLsFromHTML(htmlBody, baseURL);
    const baseURLObj = new URL(baseURL);
    urls = urls
        .filter((url) => {
            if (!url.startsWith("https://")) return false;
            const urlObj = new URL(url);
            // check if the URL is on the same domain or subdomain
            return urlObj.hostname.endsWith(baseURLObj.hostname);
        })
        .map((url) => normalizeURL(url));
    return { error: false, urls };
}

module.exports = {
    normalizeURL,
    getURLsFromHTML,
    crawlPage,
};

/*

 {
  "https://google.com": {

  }
 }

*/
