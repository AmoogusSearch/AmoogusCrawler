const fs = require('fs');



const s = JSON.parse(fs.readFileSync('results.json', 'utf8'));

let structure = {}

for (let url of Object.keys(s)) {
    const segments = url.split('/');
    const segmentCount = segments.length;
    let currentStructure = structure;
    for (let i = 0; i < segmentCount; i++) {
        const path = segments.slice(0, i + 1).join('/');
        const segment = segments[i];
        if (!currentStructure[segment]) {
            currentStructure[segment] = {};
        }
        currentStructure = currentStructure[segment];
    }
}

fs.writeFileSync('structure.json', JSON.stringify(structure, null, 4));