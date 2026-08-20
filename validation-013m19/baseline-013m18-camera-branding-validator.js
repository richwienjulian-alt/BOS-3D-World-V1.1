const fs = require('fs');
const path = require('path');
const root = process.argv[2];
if (!root) { console.error('usage: node baseline-013m18-camera-branding-validator.js <source-root>'); process.exit(2); }
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const errors = [];
const plan = read('city-touch-camera-plan.js');
const app = read('app.js');
const html = read('index.html');
const dash = read('city-customer-dashboard-plan.js');
if (!plan.includes('rotationEnabled: false')) errors.push('expected direct touch rotation disabled baseline');
if (!app.includes('targetYaw') || !app.includes('currentYaw')) errors.push('existing yaw state missing');
if (!app.includes('if (keys.KeyQ) targetYaw +=') || !app.includes('if (keys.KeyE) targetYaw -=')) errors.push('Q/E baseline rotation missing');
if (!html.includes('<p class="eyebrow">MISSION BOS</p>')) errors.push('MISSION BOS baseline header missing');
if (!html.includes('<title>Mission BOS | Connected Response</title>')) errors.push('baseline browser title missing');
if (!dash.includes('noRotationControls: true')) errors.push('baseline dashboard noRotationControls contract missing');
if (errors.length) { console.error('FAILED\n' + errors.join('\n')); process.exit(1); }
console.log('PASSED');
