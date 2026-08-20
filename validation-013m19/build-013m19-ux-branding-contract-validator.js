const fs = require('fs');
const vm = require('vm');
const path = require('path');
const contractPath = path.resolve(__dirname, '..', 'contracts', 'build-013m19-ux-branding-contract.js');
const context = { globalThis: {} };
context.window = undefined;
vm.createContext(context);
vm.runInContext(fs.readFileSync(contractPath, 'utf8'), context);
const c = context.globalThis.MISSION_BOS_BUILD_013M19_UX_BRANDING_CONTRACT;
const errors = [];
if (!c) errors.push('contract missing');
if (c && c.build !== '013M.19') errors.push('build mismatch');
if (c && c.sourceArchiveSha256 !== '97147af448390db29d8028a6c0353e37783a1eb71839a4acc0c1ba5224d12cd0') errors.push('source sha mismatch');
if (c && c.camera.rotateStepDegrees !== 15) errors.push('rotation step mismatch');
if (c && c.camera.directTouchTwistEnabled !== false) errors.push('direct touch twist must remain disabled');
if (c && c.camera.minimumTargetCssPx < 44) errors.push('touch target too small');
if (c && c.logo.visibleBrand !== 'T MISSION') errors.push('visible brand mismatch');
if (c && c.logo.sha256 !== '230eb275ac48962b6a555ef886bad448e75741fd34336e8ffe9a80c5b0e62d0d') errors.push('logo sha mismatch');
if (errors.length) {
  console.error('FAILED\n' + errors.join('\n'));
  process.exit(1);
}
console.log('PASSED');
