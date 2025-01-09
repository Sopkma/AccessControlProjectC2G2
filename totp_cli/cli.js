//const TOTP = String(process.env.TOTP);

const { createHmac } = require('crypto');

const hmac = createHmac('sha256', '2025');

let ms = 1000 * 30;
let timestamp = new Date(Math.round(new Date().getTime() / ms) * ms);
console.log(timestamp);

hmac.update(timestamp.toString());
let numberpattern = /\d+/g;
let result = hmac.digest('hex').match(numberpattern).join('').slice(-6);
//let tobehashed = TOTP + timestamp;
//let hash = createHash('sha256').update(tobehashed).digest('hex').replace(/\D/g, '').slice(null, 6);
console.log(result);




