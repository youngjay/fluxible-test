var TerritoryStore = require('../store/territory');

module.exports = function(context, data, callback) {
    var type = context.pigeon.type;

    context.pigeon(
        'http://service.dianping.com/rotate/territory/TerritoryService_0.0.1',
        'update',
        [type.Class('com.dianping.rotate.territory.dto.TerritoryForWebDto', {
            id: type.Integer(data.id),
            bizId: type.Integer(data.bizId),
            territoryName: type.String(data.territoryName),
            operatorId: type.Integer(0),
            parentTerritoryId: type.Integer(data.parentTerritoryId),
            chiefLeaderId: type.Integer(data.chiefLeaderId),
            notOnlineMutGroupCountLimit: type.Integer(data.notOnlineMutGroupCountLimit),
            notOnlineSingleGroupCountLimit: type.Integer(data.notOnlineSingleGroupCountLimit)
        })],
        function(err, result) {
            if (err) {
                callback(err);
                return;
            }

            var store = context.getStore(TerritoryStore);
       
            store.data.territory = data;

            context.dispatch('UPDATE_COMPLETE', result);

            alert('修改成功')

            callback();
        }
    )
}