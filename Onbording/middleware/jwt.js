const auth = require('../utility/jwt');
const User = require('../Models/user');
async function jwtMiddleware(req, res, next) {
    try {
        const getToken = req.headers.authorization;
        if (!getToken) {
            return res.status(401).send('No token provided.');
        }
        const token = getToken.slice(7);
        console.log('token:', token);
        const decode = auth.verifyToken(token);
        console.log('decodetwo', decode)
        const user = await User.findOne({ _id: decode.id, jti: decode.jti });
        if (!user) {
            return res.status(404).json({ status: 'invalid token....' })
        }
        if (user === null || user.jti === null) {
            console.log('user', user);
            return res.status(404).json({ status: 'invalid token....' })
        }
        console.log('user', user)
        req.user = user;
        next();
    } catch (err) {
        console.log('error', err)
        res.status(401).json({ status: 'error' });
    }

};
module.exports = {
    jwtMiddleware,
}
