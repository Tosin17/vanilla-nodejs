const { of, throwError, iif } = require('rxjs');
const { catchError, map, tap, switchMap } = require('rxjs/operators');
const _dataUtils = require('./data');
const utils = require('./utils')

const handlers = {};
const validateStr = str => {
    if (typeof str !== 'string') {
        return null;
    }
    return !!str.trim() ? str.trim() : null;
}

handlers.ping = (callback) => {
    callback(200);
}

handlers.notFound = (callback) => {
    callback(400)
}

handlers._users = {};

handlers._users.post = (data, callback) => {
    const { payload } = data;
    const { firstName, lastName, phone, password, tosAgreement } = utils.toJSON(payload);
    
    if (!validateStr(firstName) || !validateStr(lastName) || !validateStr(password) || !phone || !tosAgreement) {
        callback(500, { error: 'Missing required field' });
        return;
    }

    // Create file if POST
    const createUser$ = of(payload).pipe(
        map(v => (Object.assign(v, { password: utils.hashPassword(password) }))),
        switchMap(v => _dataUtils.create('users', phone.toString(), v)
            .pipe(catchError(e => throwError(() => e)))
        )
    )

    // Throw Error if POST and file already exists
    const cannotCreateUser$ = of(true).pipe(
        tap(_ => callback(500, {error: 'User already exists'}))
    )    

    _dataUtils.read('users', phone).pipe(
        switchMap(v => v === `File doesn't exist` ? createUser$ : cannotCreateUser$ )
    ).subscribe(callback(200))
}

handlers._users.get = () => {}

handlers._users.put = () => { }

handlers._users.delete = () => { }

handlers.users = (data, callback) => {
    const _method = data.method.toLowerCase();
    [
        'GET',
        'POST',
        'PUT',
        'DELETE'
    ].includes(data.method) ? handlers._users[_method](data, callback) : callback(405)
}


module.exports = handlers;
