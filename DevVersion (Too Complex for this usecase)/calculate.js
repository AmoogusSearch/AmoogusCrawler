function calculateResults(DB) {
    let urlCount = {}
    let currentLayers = [DB.layers]
    while (true) {
        let layers = currentLayers.pop()
        if (!layers) break
        for (let layer of layers) {
            if (!urlCount[layer.url]) urlCount[layer.url] = 0
            urlCount[layer.url] += layer.count
            currentLayers.push(layer.children)
        }
    }
    return urlCount
}

module.exports = {
    calculateResults,
}