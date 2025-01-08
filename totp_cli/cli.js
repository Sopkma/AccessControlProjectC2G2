const TOTP = String(process.env.TOTP);

const { createHash } = require('crypto');

let timestamp = Math.round(Date.now() / (1000 * 60));
let tobehashed = TOTP + timestamp;
let hash = createHash('sha256').update(tobehashed).digest('hex').replace(/\D/g, '').slice(null, 6);
console.log(hash);




