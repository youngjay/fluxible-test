module.exports = function(context, payload, callback) {
    var type = context.pigeon.type;


    context.pigeon(
        'http://service.dianping.com/rotate/territory/TerritoryService_0.0.1',
        'queryAllLeafTerritories',
        [type.Integer(null)],
        function(err, results) {
            if (err) {
                callback(err);
                return;
            }

            context.dispatch('LOAD_ALL', results);

            callback()
        }
    )
}