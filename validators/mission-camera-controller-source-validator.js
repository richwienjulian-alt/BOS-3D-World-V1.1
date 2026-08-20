#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path");const root=path.resolve(process.argv[2]||".");const src=fs.readFileSync(path.join(root,"city-presenter-controller.js"),"utf8"),errors=[];
function need(re,msg){if(!re.test(src))errors.push(msg);}function forbid(re,msg){if(re.test(src))errors.push(msg);}
need(/missionCameraProfiles\s*=\s*\(plan\.camera\s*&&\s*plan\.camera\.missionCameraProfiles\)/,"mission camera profile map is not consumed");
need(/function getMissionProfileId\s*\(/,"mission profile resolver missing");
need(/liveContext\.missionId/,"presenter context mission id is not used");
need(/function resolveBookmark\s*\(/,"bookmark resolver missing");
need(/bookmarkOverrides/,"profile bookmark overrides not used");
need(/function updateCameraButtonMetadata\s*\(/,"camera button metadata refresh missing");
need(/dataset\.missionCameraProfile/,"active camera profile is not exposed for diagnostics");
need(/function releaseBookmarkForMissionProfileChange\s*\(/,"stale bookmark release on mission change missing");
need(/applyMissionCameraRecommendation/,"mission-specific camera recommendation missing");
need(/var bookmark = resolveBookmark\(bookmarkId\)/,"camera selection still uses legacy bookmark directly");
need(/var active = resolveBookmark\(activeBookmarkId\)/,"active camera label still uses legacy bookmark directly");
need(/var recommended = resolveBookmark\(hint\.recommendedBookmarkId\)/,"recommendation label still uses legacy bookmark directly");
forbid(/automaticCameraTakeoverAllowed\s*:\s*true/,"automatic camera takeover must remain disabled");
console.log(JSON.stringify({validator:"MISSION_CAMERA_CONTROLLER_SOURCE",status:errors.length?"FAILED":"PASSED",errors},null,2));if(errors.length)process.exit(1);
