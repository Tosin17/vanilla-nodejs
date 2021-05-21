const { identity } = require("rxjs");

const utils = {};

utils.toJSON = (str) => {
    try {
        return JSON.parse(str)
    } catch (e) {
        return {}
    }
}

// @TODO --> implement harsh
utils.hashPassword = identity;

module.exports = utils;
