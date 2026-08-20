#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const controller = fs.readFileSync(path.join(root, "city-mission-004-controller.js"), "utf8");
const report = [];
function check(label, condition) { report.push({label, reproduced: !!condition}); }
check("Mission 002 shared baseline is a Mission 004 pre-READY gate", /mission002BaselineReady[\s\S]{0,900}sharedNetworkReady\s*&&\s*cellLoadsReady\s*&&\s*priorityReady\s*&&\s*responseHandoffReady\s*&&\s*mission002BaselineReady/.test(controller));
check("Dashboard/cell-load threshold is a hard Mission 004 completion gate", /sharedNetworkReady\s*&&\s*cellLoadsReady\s*&&\s*priorityReady/.test(controller));
check("Completion timeout can fail an operationally complete mission", /completion settlement exceeded the 8 second safety deadline|completionSettlementElapsed[\s\S]{0,300}fail\(/.test(controller));
check("No deterministic network finalization adapter is used", !/finalizeMissionSettlement\s*\(/.test(controller));
const passed = report.every(x => x.reproduced);
console.log(JSON.stringify({title:"013M.13 FINALIZATION ROOT CAUSE", status: passed ? "REPRODUCED" : "NOT_REPRODUCED", checks:report}, null, 2));
process.exit(passed ? 0 : 1);
