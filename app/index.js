const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('../config');

const handlers = {
    sample: (data, callback) => {
        callback(406, { name: 'sample handler' })
    },
    notFound: (data, callback) => {
        callback(404)
    }
}

const router = {
    sample: handlers.sample
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
    const method = req.method.toUpperCase()
    const queryStrObj = parsedUrl.query;
    const headers = req.headers;

    let buffer = '';
    const decoder = new StringDecoder('utf-8');

    req.on('data', data => {
        buffer += decoder.write(data)
    })

    req.on('end', _ => {
        buffer += decoder.end()

        const chosenHandler = router[path] || handlers.notFound;
        const data = {
            path,
            method,
            queryStrObj,
            headers,
            payload: buffer
        }

        chosenHandler(data, (statusCode, payload) => {
            statusCode = statusCode || 200;
            payload = JSON.stringify(payload || {});

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payload)
        })
    })
})

server.listen(config.port, () => {
    console.log(`Server Listening on ${config.envName}: ${config.port}`);
})
