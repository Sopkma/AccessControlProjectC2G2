//const TOTP = String(process.env.TOTP);

const { createHmac } = require('crypto');

const hmac = createHmac('sha256', '2025');

let ms = 1000 * 30;
let timestamp = new Date(Math.round(new Date().getTime() / ms) * ms).toISOString();
console.log("timestamp: " + timestamp);

hmac.update(timestamp.toString());
let numberpattern = /\d+/g;
let result = hmac.digest('hex').match(numberpattern).join('').slice(-6);
console.log(result);



