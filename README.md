# SSB Fingerprinter
Tries to determine the *actual* browser version based on supported JavaScript features.

## About
This is the stand-alone implementation for the fingerprinting used in our [AsiaCCS paper](https://www.tu-braunschweig.de/index.php?eID=dumpFile&t=f&f=141298&token=17234fac9e20e4c5c05bba1a3e73672c9e48c459). It serves a website that will try to determine the used browser and its version for each visitor, even if the user agent strings have been tampered with. As we find in the paper modified user agent strings are a common occurrence for automated browsers on the Web, aka "server-side browsers".

Under the hood, we use MDN's [browser-compat-data](https://github.com/mdn/browser-compat-data) to get detailed information about which feature is supported by which browser.

## Usage
1. Install dependencies via `npm install`
2. Run `node main.js`
3. Visit [http://localhost:8080](http://localhost:8080) and observe console output with fingerprinting results 

The fingerprint will not always be able to determine the exact version, in that case a range of possible versions is printed instead. For comparison, user agent information from the HTTP header and JS navigator object is printed as well.

## Caveat
**You need to serve this via HTTPS or you will get strange results.**

This is because many modern features in Chrome are only available on secure origins, so the fingerprinting might work well on localhost (which is considered "secure" for easier testing) but not once you host it somewhere without a certificate.

## Cite us
If you find this helpful, please consider citing our paper :)
```
@inproceedings{musch2022ssb,
  author = {Musch, Marius and Kirchner, Robin and Boll, Max and Johns, Martin},
  title = {Server-Side Browsers: Exploring the Web’s Hidden Attack Surface},
  booktitle = asiaccs,
  year = 2022
}
```
