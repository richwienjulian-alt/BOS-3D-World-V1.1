/* Mission BOS - Build 010P.4
   Mission 002 medical scene renderer. Deterministic, plan-driven and reusable.
*/
(function () {
  "use strict";
  function copy(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function material(color){return new THREE.MeshStandardMaterial({color:color,roughness:0.72,metalness:0.03});}
  function mesh(geometry,color){var m=new THREE.Mesh(geometry,material(color));m.castShadow=true;m.receiveShadow=true;return m;}
  function position(group,p){group.position.set(Number(p.x),Number(p.y||0),Number(p.z));}

  function createPerson(definition){
    var root=new THREE.Group();root.name=definition.id;position(root,definition.position);root.rotation.y=Number(definition.rotation||0);
    var skin=definition.skinColor||"#e2b18a",body=definition.bodyColor||"#f4f6f8",trouser=definition.trouserColor||"#263142";
    var head=mesh(new THREE.SphereGeometry(0.17,12,10),skin);head.position.y=1.58;root.add(head);
    var torso=mesh(new THREE.BoxGeometry(0.42,0.68,0.24),body);torso.position.y=1.1;root.add(torso);
    if(definition.role==="paramedic"){
      var stripe=mesh(new THREE.BoxGeometry(0.44,0.10,0.255),definition.accentColor||"#d62828");stripe.position.set(0,1.12,0);root.add(stripe);
    }
    var hips=mesh(new THREE.BoxGeometry(0.38,0.24,0.23),trouser);hips.position.y=0.68;root.add(hips);
    var arms=[];[-1,1].forEach(function(side){var arm=mesh(new THREE.BoxGeometry(0.12,0.58,0.12),definition.role==="paramedic"?body:skin);arm.position.set(side*0.29,1.08,0);root.add(arm);arms.push(arm);});
    [-1,1].forEach(function(side){var leg=mesh(new THREE.BoxGeometry(0.15,0.64,0.17),trouser);leg.position.set(side*0.11,0.32,0);root.add(leg);});
    if(definition.pose==="lying"){
      root.rotation.x=Math.PI/2;root.position.y=Number(definition.position.y||0.16)+0.18;
    }
    return {root:root,arms:arms,definition:definition};
  }
  function createStretcher(definition){
    var root=new THREE.Group();root.name=definition.id;position(root,definition.position);root.rotation.y=Number(definition.rotation||0);
    var frame=mesh(new THREE.BoxGeometry(Number(definition.width),0.08,Number(definition.depth)),"#d5dde7");frame.position.y=Number(definition.height);root.add(frame);
    var pad=mesh(new THREE.BoxGeometry(Number(definition.width)*0.92,0.09,Number(definition.depth)*0.86),"#2e6d9f");pad.position.y=Number(definition.height)+0.08;root.add(pad);
    [-1,1].forEach(function(x){[-1,1].forEach(function(z){var leg=mesh(new THREE.CylinderGeometry(0.035,0.035,Number(definition.height),8),"#717b86");leg.position.set(x*Number(definition.width)*0.38,Number(definition.height)/2,z*Number(definition.depth)*0.34);root.add(leg);});});
    return root;
  }
  function createFailed(scene,message,plan){
    var root=typeof THREE!=="undefined"?new THREE.Group():null;if(root&&scene)scene.add(root);
    var manifest={title:"MISSION 002 SCENE RENDER MANIFEST",status:"FAILED",actual:{sceneActors:0,patients:0,paramedics:0,sceneProps:0},expected:copy((plan||{}).expectedCounts||{})};
    var safety={title:"MISSION 002 SCENE RUNTIME SAFETY",status:"FAILED",dependencyErrors:1,renderCountErrors:0,sourceMutationErrors:0,visibilityErrors:0,errors:[message]};
    return{root:root,setState:function(){},update:function(){},reset:function(){return false;},getManifest:function(){return copy(manifest);},getSafetyStatus:function(){return copy(safety);},dispose:function(){if(root&&root.parent)root.parent.remove(root);}};
  }

  function create(options){
    options=options||{};var scene=options.scene,plan=options.plan,validation=options.validation;
    if(!scene||!plan||!validation||validation.status!=="PASSED"||typeof THREE==="undefined")return createFailed(scene,"Mission 002 scene dependencies are incomplete.",plan);
    var root=new THREE.Group();root.name="MISSION_002_SCENE_ROOT";root.visible=false;scene.add(root);
    var actors=Object.create(null),paramedics=[],props=Object.create(null);
    (plan.scene.actors||[]).forEach(function(def){var actor=createPerson(def);actors[def.id]=actor;root.add(actor.root);if(def.role==="paramedic")paramedics.push(actor);});
    (plan.scene.props||[]).forEach(function(def){var prop=createStretcher(def);props[def.id]=prop;root.add(prop);});
    var expected=plan.expectedCounts||{};
    var actual={sceneActors:Object.keys(actors).length,patients:(plan.scene.actors||[]).filter(function(a){return a.role==="patient";}).length,paramedics:paramedics.length,sceneProps:Object.keys(props).length};
    var manifest={title:"MISSION 002 SCENE RENDER MANIFEST",actual:actual,expected:{sceneActors:Number(expected.sceneActors),patients:Number(expected.patients),paramedics:Number(expected.paramedics),sceneProps:Number(expected.sceneProps)},status:"PASSED"};
    Object.keys(manifest.expected).forEach(function(k){if(Number(actual[k])!==Number(manifest.expected[k]))manifest.status="FAILED";});
    var source=JSON.stringify(plan.scene),state="READY",disposed=false;
    var safety={title:"MISSION 002 SCENE RUNTIME SAFETY",dependencyErrors:0,renderCountErrors:manifest.status==="PASSED"?0:1,sourceMutationErrors:0,visibilityErrors:0,status:manifest.status,errors:[]};
    function visibleFor(next){return (plan.scene.visibleStates||[]).indexOf(next)>=0;}
    function setState(next){if(disposed)return false;state=String(next||"READY");root.visible=visibleFor(state);return true;}
    function update(delta,elapsed){if(disposed)return;var t=Number(elapsed)||0;if(root.visible){paramedics.forEach(function(actor,index){var wave=Math.sin(t*2.2+index*1.7)*0.12;actor.arms[0].rotation.x=-0.45+wave;actor.arms[1].rotation.x=-0.35-wave;});}if(JSON.stringify(plan.scene)!==source){safety.sourceMutationErrors=1;safety.status="FAILED";}}
    function reset(){if(disposed)return false;state="READY";root.visible=false;paramedics.forEach(function(actor){actor.arms.forEach(function(arm){arm.rotation.x=0;});});return true;}
    function dispose(){if(disposed)return;disposed=true;if(root.parent)root.parent.remove(root);root.traverse(function(obj){if(obj.geometry&&obj.geometry.dispose)obj.geometry.dispose();if(obj.material&&obj.material.dispose)obj.material.dispose();});}
    console.group(manifest.title);console.log("Scene actors: "+actual.sceneActors+" / "+manifest.expected.sceneActors);console.log("Patients: "+actual.patients+" / "+manifest.expected.patients);console.log("Paramedics: "+actual.paramedics+" / "+manifest.expected.paramedics);console.log("Scene props: "+actual.sceneProps+" / "+manifest.expected.sceneProps);console.log("STATUS: "+manifest.status);console.groupEnd();
    console.group(safety.title);console.log("STATUS: "+safety.status);console.groupEnd();
    return{root:root,setState:setState,update:update,reset:reset,getManifest:function(){return copy(manifest);},getSafetyStatus:function(){return copy(safety);},dispose:dispose};
  }
  window.MissionBosMission002SceneRenderer={create:create};
})();
