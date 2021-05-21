const fs = require('fs').promises;
const path = require('path');
const { defer, throwError, of, combineLatest } = require('rxjs');
const { concatMap, catchError, tap } = require('rxjs/operators');

const lib = {};

lib.baseDir = path.join(__dirname, '/../.data/')

// Create a dir and file within the .data dir and write to it
lib.create = (dirName, fileName, data, callback) => {
    const writePath = `${lib.baseDir}${dirName}/${fileName}.json`;
    const strData = JSON.stringify(data);

    // wx --> writable

    // fs.open(writePath, 'wx')
    //     .then(fileDescriptor => fileDescriptor)
    //     .then(fileDescriptor => {
    //         fs.writeFile(fileDescriptor, strData);
    //         return fileDescriptor
    //     })
    //     .then(fileDescriptor => {
    //         fileDescriptor.close()
    //     })
    //     .catch(e => {
    //         console.log(e);
    //     })
    
    const openFile$ = defer(() => fs.open(writePath, 'wx'));
    const writeFile = (fileDesc, data) => defer(() => fs.writeFile(fileDesc, data))
        .pipe(catchError(e => throwError(() => e)))
    
    openFile$.pipe(
        concatMap(fileDescriptor => of(fileDescriptor)),
        concatMap(fileDescriptor => {
            return combineLatest([writeFile(fileDescriptor, strData), of(fileDescriptor)]);
        }),
        tap(([_, fileDescriptor]) => fileDescriptor.close()),
        catchError(e => throwError(() => e))
    ).subscribe()
}

module.exports = lib;
