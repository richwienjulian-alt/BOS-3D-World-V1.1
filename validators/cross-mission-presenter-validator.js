#!/usr/bin/env node
"use strict";
const fs=require('fs'),path=require('path');const root=path.resolve(process.argv[2]||'.');const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),ctrl=fs.readFileSync(path.join(root,'city-presenter-controller.js'),'utf8');const errors=[];
function need(re,msg,src=app){if(!re.test(src))errors.push(msg);}function forbid(re,msg,src=app){if(re.test(src))errors.push(msg);}
need(/function createCrossMissionPresenterAdapter\s*\(/,'Cross-mission presenter adapter missing.');
need(/missionRuntime:\s*createCrossMissionPresenterAdapter\(\)/,'Presenter is not wired to cross-mission adapter.');
need(/validatedMissionRegistry\.startSelected\(\)/,'Presenter start does not delegate to selected mission registry.');
need(/validatedMissionRegistry\.finishSelected\(\)/,'Presenter finish does not delegate to selected mission registry.');
need(/getSelectedDefinition\(\)/,'Presenter does not use registry mission metadata.');
need(/nextAction\s*=\s*"START_MISSION"/,'READY start action missing.');
need(/nextAction\s*=\s*"FINISH_AND_RETURN"/,'COMPLETED finish action missing.');
forbid(/nonMission001SelectedOrActive/,'Legacy Mission-001-only presenter UI gate still exists.');
forbid(/\(context\.activeId\s*\|\|\s*context\.selectedId\)\s*!==\s*"MISSION_001"[\s\S]{0,250}presenterNextButton/,'Legacy Mission-001 click blocker still exists.');
need(/getPresenterContext/,'Presenter controller does not consume dynamic context.',ctrl);
need(/isPresenterActionAllowed/,'Presenter controller does not consume dynamic action authorization.',ctrl);
need(/inputCode\s*===\s*"MOUSE_WHEEL"/,'Mouse wheel does not release guided camera bookmark.',ctrl);
need(/function toggleGuidedMode\(\)[\s\S]*?guidedMode = !guidedMode;[\s\S]*?hint\.nextAction === "START_MISSION"[\s\S]*?missionRuntime\.start\(\)/,'Entering guided presentation does not manually start a READY selected mission.',ctrl);
console.log(JSON.stringify({validator:'CROSS_MISSION_PRESENTER',status:errors.length?'FAILED':'PASSED',errors},null,2));if(errors.length)process.exit(1);
