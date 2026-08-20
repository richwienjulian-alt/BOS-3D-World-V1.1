const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const p = path.resolve(__dirname, '..', 'assets', 'telekom-logo-current-user-provided.png');
const buf = fs.readFileSync(p);
const sha = crypto.createHash('sha256').update(buf).digest('hex');
const expected = '230eb275ac48962b6a555ef886bad448e75741fd34336e8ffe9a80c5b0e62d0d';
if (sha !== expected) { console.error('FAILED ' + sha); process.exit(1); }
console.log('PASSED ' + sha);
