var crypto = require('crypto');
var secret = require('./config/session').secret;
var expire = require('./config/session').expire;

/**
 * Create token by uid. Encrypt uid and timestamp to get a token.
 *
 * @param  {String} uid user id
 * @param  {String|Number} timestamp
 * @return {String}     token string
 */
module.exports.create = function(uid, timestamp) {
	var msg = uid + '|' + timestamp;
	var cipher = crypto.createCipher('aes256', secret);
	var enc = cipher.update(msg, 'utf8', 'hex');
	enc += cipher.final('hex');
	return enc;
};

/**
 * Parse token to validate it and get the uid and timestamp.
 *
 * @param  {String} token token string
 * @return {Object}  0: ok; 1: unvalidte token; 2: expired token.
 */
module.exports.validate = function(token) {
	var decipher = crypto.createDecipher('aes256', secret);
	var dec;
	try {
		dec = decipher.update(token, 'hex', 'utf8');
		dec += decipher.final('utf8');
	} catch(err) {
		console.error('[token] fail to decrypt token. %j', token);
		return 1;
	}
	var ts = dec.split('|');
	if(ts.length !== 2) {
		// illegal token
		return 1;
	}
	var uid = ts[0];
	var timeStamp = Number(ts[1]);

	if(expire > 0) {
		if((Date.now() - timeStamp) > expire){
			return 2;
		}

	}

	return 0;

};




/**
 * Create token by uid. Encrypt uid and timestamp to get a token.
 * 
 * @param  {String} uid user id
 * @param  {String|Number} timestamp
 * @param  {String} pwd encrypt password
 * @return {String}     token string
 */
module.exports.create2 = function(uid, timestamp, pwd) {
	var msg = uid + '|' + timestamp;
	var cipher = crypto.createCipher('aes256', pwd);
	var enc = cipher.update(msg, 'utf8', 'hex');
	enc += cipher.final('hex');
	return enc;
};

/**
 * Parse token to validate it and get the uid and timestamp.
 * 
 * @param  {String} token token string
 * @param  {String} pwd   decrypt password
 * @return {Object}  uid and timestamp that exported from token. null for illegal token.     
 */
module.exports.parse = function(token, pwd) {
	var decipher = crypto.createDecipher('aes256', pwd);
	var dec;
	try {
		dec = decipher.update(token, 'hex', 'utf8');
		dec += decipher.final('utf8');
	} catch(err) {
		console.error('[token] fail to decrypt token. %j', token);
		return null;
	}
	var ts = dec.split('|');
	if(ts.length !== 2) {
		// illegal token
		return null;
	}
	return {uid: ts[0], timestamp: Number(ts[1])};
};

