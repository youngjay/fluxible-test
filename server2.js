/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
var express = require('express');

var server = express();

server.use(function(req, res) {
    res.end(req.path + '322')
})

server.listen(3000, function() {
    console.log('server listening on port 3000')
})
