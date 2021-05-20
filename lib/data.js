const fs = require('fs').promises;
const path = require('path');

const lib = {};

lib.baseDir = path.join(__dirname, '/../.data/')

// Create a dir and file within the .data dir and write to it
lib.create = (dirName, fileName, data, callback) => {
    const writePath = `${lib.baseDir}${dirName}/${fileName}.json`;
    const strData = JSON.stringify(data);

    // wx --> writable
    fs.open(writePath, 'wx')
        .then(fileDescriptor => fileDescriptor)
        .then(fileDescriptor => {
            fs.writeFile(fileDescriptor, strData);
            return fileDescriptor
        })
        .then(fileDescriptor => {
            fileDescriptor.close()
        })
        .catch(e => {
            console.log(e);
        })
}

module.exports = lib;
