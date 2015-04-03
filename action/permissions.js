module.exports = function(context, payload, callback) {
    var java = context.pigeon.type;

    payload.loginId = parseInt(payload.loginId);

    context.pigeon(
        'http://service.dianping.com/rotate/org/PermissionService_0.0.1',
        'getPermissions',
        [java.Integer(payload.loginId)],
        function(err, permissions) {
            if (err) {
                console.log(err);
                return;
            }

            context.dispatch('FETCH_PERMISSIONS', {
                loginId: payload.loginId,
                permissions: permissions
            });

            callback();
        }
    )
}