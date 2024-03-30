const { EventEmitter, once } = require("events");
const { crawlPage, normalizeURL } = require("./crawl");
const fs = require("fs");
const { calculateResults } = require("./calculate");
class AmoogusBatcher extends EventEmitter {
    constructor(batchSize = 3) {
        super();
        this.promises = [];
        this.isProcessing = false;
        this.batchSize = batchSize;
    }

    add(callback) {
        // console.log("Added promise");1
        this.promises.push({ callback, fulfilled: false });
        this.process();
    }

    async process() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        while (this.promises.some(({ fulfilled }) => !fulfilled)) {
            const batch = this.promises
                .filter(({ fulfilled }) => !fulfilled)
                .slice(0, this.batchSize);
            console.log("Processing batch", batch.length);
            const batchPromises = batch.map(({ callback }) => new Promise(callback));
            await Promise.all(batchPromises);
            batch.forEach((p) => (p.fulfilled = true));
        }
        this.isProcessing = false;
        console.log("Processing Queue done!");
        this.emit("done");
    }
}

const batcher = new AmoogusBatcher(4);
async function main() {
    let DB = {
        baseURL: "https://domschule-sl.de/",
        crawledPages: new Set(),
        layers: [],
        depth: 3,
    };

    DB.layers.push({
        url: normalizeURL(DB.baseURL),
        count: 1,
        children: [],
    });

    for (let i = 0; i < DB.depth; i++) {
        await recursiveCrawl(DB, i, DB.layers)
        await once(batcher, "done");
    }

    
    const r = calculateResults(DB);
    fs.writeFileSync("results.json", JSON.stringify(r, null, 2));
    console.log("Finished crawling!");
    // visualizeLayers(DB.layers);
}

function visualizeLayers(layers, depth = 0) {
    for (let layer of layers) {
        console.log(`${"  ".repeat(depth)}> ${layer.url} (${layer.count})`);
        if (layer.children.length > 0) {
            visualizeLayers(layer.children, depth + 1);
        }
    }
}



async function recursiveCrawl(DB, depth, currentLayers, currentDepth = 0) {
    if (currentDepth === depth) {
        await crawlLayer(DB, currentLayers);
    } else {
        for (let layer of currentLayers) {
            await recursiveCrawl(DB, depth, layer.children, currentDepth + 1);
        }
    }
}

async function crawlLayer(DB, layers) {
    for (let layer of layers) {
        if (DB.crawledPages.has(layer.url)) {
            layer.alreadyCrawled = true;
            continue;
        }
        batcher.add(crawlLogic(DB, layer));
    }
}

function crawlLogic(DB, layer) {
    return async (resolve) => {

        if (DB.crawledPages.has(layer.url)) {
            resolve();
            return;
        }

        const { error, urls } = await crawlPage(
            DB.baseURL,
            `https://${layer.url}`
        );
        if (error) {
            resolve();
            return;
        }
        urls.forEach((url) => {
            if (layer.children.find((c) => c.url === url))
                layer.children.find((c) => c.url === url).count++;
            else layer.children.push({ url, count: 1, children: [] });
        });
        DB.crawledPages.add(layer.url);
        resolve();
    }
}

main();
