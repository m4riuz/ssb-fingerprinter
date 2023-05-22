require('log-timestamp');
const path = require('path');
const express = require('express');
const bcd = require('@mdn/browser-compat-data');

const features = [];
const supportMap = new Map();
const releases = {'chrome': {}, 'edge': {}, 'firefox': {}, 'ie': {}, 'opera': {}, 'safari': {}};

const app = express();
const port = 8080;

app.use(express.json())
app.set('view engine', 'ejs')

//Send the fingerprinting script
app.get('/', function(req, res) {
  res.render(path.join(__dirname, '/index.ejs'), {features: JSON.stringify(features)});
})

//Receive fingerprinting data
app.post('/', function(req, res) {
    console.log("HTTP User-Agent:", req.headers['user-agent'])
    console.log("JS User-Agent:", req.body.userAgent);
    console.log("JS Platform:", req.body.platform);
    let matches = findMatches(req.body);
    console.log("Fingerprinting result:", matches.result);
    res.sendStatus(200);
});

//Prepare data structures and start server
function init() {
    for (let browser in releases) {
        for (let [version, data] of Object.entries(bcd.browsers[browser].releases)) {
            supportMap.set(browser + version, new Set());
            releases[browser][version] = data.release_date;
        }
    }
    process(bcd.api);
    process(bcd.javascript.builtins);
    app.listen(port);
}

//Build an internal map of compatibility data
function process(obj) {
    for (let [name, value] of Object.entries(obj)) {
        if (!value.__compat) { continue; }
        features.push(name);
        let support = value.__compat.support;
        for (let browser in releases) {
            if (!support[browser] || !support[browser].version_added) { continue; }
            fillMap(name, browser, support[browser].version_added);
        }
    }
}

//Find all later releases and also add the feature there as well
function fillMap(feature, browser, added) {
    let date = releases[browser][added];
    for (let version in releases[browser]) {
        if (releases[browser][version] >= date) {
            supportMap.get(browser + version).add(feature);
        }
    }
}

//Find the closest matching set of browsers based on the fingerprint data
function findMatches(data) {
    let matches = new Map();
    //Determine match closeness for each browser
    for (let i = 0; i < data.features.length; i++) {
        for (let browser of supportMap.keys()) {
            if (!browserlike(browser, data)) {
                continue;
            }
            let value = data.features[i] == '1' ? true : false;
            if (!(value ^ supportMap.get(browser).has(features[i]))) {
                matches.set(browser, matches.has(browser) ? matches.get(browser) + 1 : 1);
            }
        }
    }

    //Return the best matches (can be multiple)
    let max = 0;
    let result = [];
    for (let browser of matches.keys()) {
        let value = matches.get(browser);
        if (value > max) {
            max = value;
            result = [];
            result.push(browser);
        }
        else if (value == max) {
            result.push(browser);
        }
    }
    return {max: max, result: result};
}

//Helper to reduce search-space
function browserlike(browser, data) {
    return (!data.chrome && !data.chrome_like && !data.edge_like && !data.old_ie && !data.ie_like &&
        !data.mozilla_like && !data.netscape && !data.opera && !data.opera_like && !data.safari && !data.safari_like) ||
        (browser.startsWith('chrome') && (data.chrome || data.chrome_like) && !data.edge_like) ||
        (browser.startsWith('edge') && data.edge_like) ||
        (browser.startsWith('firefox') && (data.netscape || data.mozilla_like) && !data.ie_like) ||
        (browser.startsWith('ie') && (data.old_ie || data.ie_like)) ||
        (browser.startsWith('opera') && (data.opera || data.opera_like)) ||
        (browser.startsWith('safari') && (data.safari || data.safari_like));
}

init();
