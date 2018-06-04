# [Crypto Exhibit](http://www.crypto-exhib.it/)

Crypto Exhibit is an open-source interactive online cryptography learning exhibit, providing an easy introduction into cryptography, by making the most common cryptographic algorithms accessible and comparable.

## Running

To run the web application locally, you will need to have [node](https://nodejs.org/) &amp; [npm](https://www.npmjs.com/) installed.
* Run `npm install --only=production` in the root directory, to fetch the server dependencies
* Run `node server.js` to start the server on http://localhost:5000/

## Development

To develop on the source files, please also install [node](https://nodejs.org/) &amp; [npm](https://www.npmjs.com/).
* Run `npm install` in the root directory to fetch all development dependencies
* Run `gulp dev` to start development

If you need to update the development dependencies, simply run the following tasks:
* First run `npm update` to update the dependencies
* Then run `gulp copy` to copy the new versions to their proper destinations

To add any development dependency (e.g. a new JS library):
* Run `npm install --save-dev any-npm-package` to install the package and add it to `package.json`
* Add the package contents you need to the gulp `copy` task in `gulpfile.js`
* Then run `gulp copy` to check if everything is copied to the right location

## Copyright and license

Code and documentation copyright 2018 Mannheim University of Applied Sciences. Code released under the General Public License, Version 3.0.