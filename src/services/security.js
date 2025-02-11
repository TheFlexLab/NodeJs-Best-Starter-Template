const crypto = require('crypto');
let key = crypto.pbkdf2Sync('prancypoodle', 'sherylcrowe', 10000, 32, 'sha512');
const { ALGORITHM } = require('../config/env');

const encryptData = (data) => {
    const cipher = crypto.createCipheriv(ALGORITHM, key, Buffer.from('1234567812345678', 'binary'));
    let encrypted = cipher.update(data instanceof Buffer ? data : JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

const decryptData = (data) => {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from('1234567812345678', 'binary'));
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    try {
        return JSON.parse(decrypted);
    } catch (error) {
        return decrypted;
    }
};

const userCustomizedEncryptData = (data, eyk) => {
    const eykBuffer = Buffer.from(eyk, 'hex'); // Convert hexadecimal string to buffer
    const cipher = crypto.createCipheriv(ALGORITHM, eykBuffer, Buffer.from('1234567812345678', 'binary'));
    let encrypted = cipher.update(data instanceof Buffer ? data : JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

const userCustomizedDecryptData = (data, eyk) => {
    const eykBuffer = Buffer.from(eyk, 'hex'); // Convert hexadecimal string to buffer
    const decipher = crypto.createDecipheriv(ALGORITHM, eykBuffer, Buffer.from('1234567812345678', 'binary'));
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    try {
        return JSON.parse(decrypted);
    } catch (error) {
        return decrypted;
    }
};

module.exports = {
    encryptData,
    decryptData,
    userCustomizedEncryptData,
    userCustomizedDecryptData,
};
