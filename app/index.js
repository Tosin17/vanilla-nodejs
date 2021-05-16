const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder;

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

        res.end('Hello World\n')
    })

})

server.listen(3000, () => {
    console.log('Server Listening');
})
