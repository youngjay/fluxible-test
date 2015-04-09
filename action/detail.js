module.exports = function(context, payload, callback) {
    var type = context.pigeon.type;


    context.pigeon(
        'http://service.dianping.com/rotate/territory/TerritoryService_0.0.1',
        'loadTerritoryInfoForWeb',
        [type.Integer(parseInt(payload.id))],
        function(err, item) {
            if (err) {
                callback(err);
                return;
            }

            context.dispatch('LOAD_ONE', item);

            callback();
        }
    )
}