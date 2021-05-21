const fs = require('fs').promises;
const path = require('path');
const { defer, throwError, of, combineLatest, identity } = require('rxjs');
const { concatMap, catchError, tap, map } = require('rxjs/operators');

const lib = {};

lib.baseDir = path.join(__dirname, '/../.data/')
const buildPath = (dirName, fileName) => `${lib.baseDir}${dirName}/${fileName}.json`
const handleErr = () => catchError(e => throwError(() => e))
const closeFile = fileDesc => defer(() => fileDesc.close()).pipe(handleErr())

// Create a dir and file within the .data dir and write to it
lib.create = (dirName, fileName, data) => {
    const writePath = buildPath(dirName, fileName);
    const strData = JSON.stringify(data);

    // wx --> throw err if file already exist
    const openFile$ = defer(() => fs.open(writePath, 'wx')).pipe(handleErr());
    const writeFile = (fileDesc, data) => defer(() => fs.writeFile(fileDesc, data))
        .pipe(handleErr());
    
    return openFile$.pipe(
        concatMap(fileDescriptor => of(fileDescriptor)),
        concatMap(fileDescriptor => {
            return combineLatest([writeFile(fileDescriptor, strData), of(fileDescriptor)]);
        }),
        concatMap(([_, fileDescriptor]) => closeFile(fileDescriptor)),
    )
}

lib.read = (dirName, fileName) => {
    const readPath = buildPath(dirName, fileName);
    const readFile$ = defer(() => fs.readFile(readPath, 'utf-8'))
        .pipe(handleErr())
    return readFile$;
}

lib.update = (dirName, fileName, data) => {
    const updatePath = buildPath(dirName, fileName);
    const strData = JSON.stringify(data)

    // r+ => Throw err if file already exists
    const updateFile$ = defer(() => fs.open(updatePath, 'r+')).pipe(handleErr());
    return updateFile$.pipe(
        concatMap(fileDescriptor => {
            const emptyFile$ = defer(() => fs.truncate(updatePath)).pipe(handleErr());
            const fileDesc$ = of(fileDescriptor);
            return combineLatest([emptyFile$, fileDesc$]);
        }),
        concatMap(([_, fileDescriptor]) => {
            return combineLatest([
                defer(() => fs.writeFile(fileDescriptor, strData)).pipe(handleErr()),
                of(fileDescriptor)
            ])
        }),
        concatMap(([_, fileDescriptor]) => closeFile(fileDescriptor))
    )
}

lib.delete = (dirName, filePath) => {
    return defer(() => fs.unlink(buildPath(dirName, filePath))).pipe(handleErr())
}

module.exports = lib;
