var str = 'body { font-size: 12px; } a { background: url(a/b.png)}'

var rework = require('rework');
var url = require('rework-plugin-url');

var map = {}

var r = rework(str).use(url(function(path) {
    map[path] = true;
    return path
}))


var _ = require('lodash');

_.forEach(map, function(value, key) {
    map[key] = '/b/' + key;
})



setTimeout(function() {
    r.use(url(function(path) {
        return map[path]
    }))

    console.log(r.toString())
}, 100)