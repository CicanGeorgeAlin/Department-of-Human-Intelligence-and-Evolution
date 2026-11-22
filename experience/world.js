const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");
const TILE = 50, COLS = 16, ROWS = 10;
const SAVE_KEY = "dhie-living-district-save-v1";
const landmarks = [
  {id:"cacheA",x:3,y:2,type:"cache",label:"Supply cache A",symbol:"▣"},
  {id:"water",x:12,y:2,type:"water",label:"Water station",symbol:"≈"},
  {id:"residentA",x:6,y:5,type:"resident",label:"Mara · clinic volunteer",symbol:"M"},
  {id:"hub",x:8,y:4,type:"hub",label:"The Commons",symbol:"⌂"},
  {id:"residentB",x:4,y:7,type:"resident",label:"Ivo · repair volunteer",symbol:"I"},
  {id:"cacheB",x:11,y:7,type:"cache",label:"Supply cache B",symbol:"▣"},
  {id:"solar",x:13,y:7,type:"solar",label:"Solar array",symbol:"ϟ"}
];
const freshState = () => ({
  player:{x:1,y:8}, parts:0, water:0, trust:0, power:false,
  found:[], spoken:[], completed:false, puzzleDone:false
});
let state = load();
let puzzleStep = 0;

function load(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return freshState();
    const parsed=JSON.parse(raw);
    if(parsed?.version!==1) return freshState();
    const base=freshState();
    return {...base,...parsed,player:{...base.player,...parsed.player},
      found:Array.isArray(parsed.found)?parsed.found.filter(id=>["cacheA","cacheB","water"].includes(id)):[],
      spoken:Array.isArray(parsed.spoken)?parsed.spoken.filter(id=>["residentA","residentB"].includes(id)):[]
    };
  }catch{return freshState();}
}
function save(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:1,...state}));}
  catch{document.getElementById("saveStatus").textContent="Local save unavailable in this browser";}
}
function setComms(title,message,choices=[]){
  document.getElementById("interactionTitle").textContent=title;
  const text=document.getElementById("interactionText");
  text.textContent=message;
  let old=document.getElementById("choiceRow"); if(old) old.remove();
  if(choices.length){
    const row=document.createElement("div"); row.className="choice-row"; row.id="choiceRow";
    for(const choice of choices){
      const button=document.createElement("button"); button.textContent=choice.label;
      button.addEventListener("click",choice.action); row.append(button);
    }
    document.getElementById("interaction").append(row);
  }
}
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
    ctx.fillStyle=(x+y)%2===0?"#203b3b":"#1d3638";
    ctx.fillRect(x*TILE,y*TILE,TILE,TILE);
    ctx.strokeStyle="#2b4948";ctx.lineWidth=1;ctx.strokeRect(x*TILE,y*TILE,TILE,TILE);
  }
  // Roads and the central green
  ctx.fillStyle="#33434a";ctx.fillRect(0,225,800,50);ctx.fillRect(375,0,50,500);
  ctx.fillStyle="#2a4b42";ctx.fillRect(300,150,200,150);
  ctx.fillStyle="#426458";ctx.fillRect(315,165,170,120);
  // District buildings
  const buildings=[[20,20,130,95],[205,20,110,75],[500,20,120,95],[650,20,130,95],[20,315,140,145],[210,350,105,100],[500,330,110,130],[655,340,125,120]];
  buildings.forEach(([x,y,w,h],i)=>{
    ctx.fillStyle=i%2?"#344752":"#3b4b55";ctx.fillRect(x,y,w,h);
    ctx.fillStyle="#52646b";ctx.fillRect(x+8,y+8,w-16,10);
    for(let wx=x+16;wx<x+w-12;wx+=30){ctx.fillStyle="#91c6c0";ctx.fillRect(wx,y+30,13,17);}
    ctx.fillStyle="#263841";ctx.fillRect(x+w/2-10,y+h-23,20,23);
  });
  // Pocket parks and trees
  [[175,165],[560,170],[165,390],[585,290],[730,280]].forEach(([x,y])=>{
    ctx.fillStyle="#315e49";ctx.beginPath();ctx.arc(x,y,20,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#6a9a69";ctx.beginPath();ctx.arc(x-5,y-5,12,0,Math.PI*2);ctx.fill();
  });
  landmarks.forEach(place=>{
    const px=place.x*TILE+TILE/2, py=place.y*TILE+TILE/2;
    const done=place.type==="cache"||place.type==="water"?state.found.includes(place.id):place.type==="resident"?state.spoken.includes(place.id):place.type==="solar"?state.power:state.completed;
    const colors={cache:"#ffbd70",water:"#6dc9f5",resident:"#ff83bb",solar:"#b6f28a",hub:"#69e7f4"};
    ctx.fillStyle=done?"#60746f":colors[place.type];
    ctx.beginPath();ctx.arc(px,py,17,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#071116";ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle="#071116";ctx.font="bold 19px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(place.symbol,px,py+1);
    if(!done){ctx.strokeStyle=colors[place.type];ctx.lineWidth=2;ctx.beginPath();ctx.arc(px,py,23,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle="#f4f7f7";ctx.font="10px system-ui";ctx.textAlign="center";ctx.fillText(place.label,px,py+34);
  });
  // Player
  const px=state.player.x*TILE+TILE/2,py=state.player.y*TILE+TILE/2;
  ctx.fillStyle="#071116";ctx.beginPath();ctx.arc(px,py+3,16,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(px,py,14,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#56ddeb";ctx.beginPath();ctx.arc(px,py,9,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#08202a";ctx.beginPath();ctx.arc(px,py-2,4,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#ffffff";ctx.lineWidth=2;ctx.strokeRect(state.player.x*TILE+4,state.player.y*TILE+4,TILE-8,TILE-8);
  updateNearby();
}
function nearby(){
  return landmarks.find(p=>Math.abs(p.x-state.player.x)+Math.abs(p.y-state.player.y)<=1);
}
function updateNearby(){
  const p=nearby();
  const status=document.getElementById("worldStatus");
  if(state.completed){status.textContent="MISSION COMPLETE";return;}
  if(p){status.textContent="IN RANGE · "+p.label.toUpperCase();}
  else status.textContent="EXPLORING · FIND A MARKER";
}
function updateHUD(){
  document.getElementById("parts").textContent=state.parts;
  document.getElementById("water").textContent=state.water;
  document.getElementById("trust").textContent=state.trust;
  document.getElementById("power").textContent=state.power?"ON":"OFF";
  const done={
    parts:state.found.includes("cacheA")&&state.found.includes("cacheB"),
    water:state.found.includes("water"),
    trust:state.spoken.length===2,
    power:state.power,
    hub:state.completed
  };
  document.querySelectorAll("[data-goal]").forEach(el=>el.classList.toggle("done",!!done[el.dataset.goal]));
  save();
}
function move(dx,dy){
  if(state.completed||!document.getElementById("puzzleModal").hidden)return;
  state.player.x=Math.max(0,Math.min(COLS-1,state.player.x+dx));
  state.player.y=Math.max(0,Math.min(ROWS-1,state.player.y+dy));
  draw();
  const p=nearby();
  if(p)setComms(p.label,"You're close enough to interact. Press E or use the INTERACT button.");
  else setComms("Keep exploring.","Look for the glowing markers. Walk next to a location, then interact.");
  updateHUD();
}
function listenTo(id,name){
  if(state.spoken.includes(id))return;
  state.spoken.push(id);state.trust+=1;
  setComms("You listened to "+name+".","The resident helped identify what the neighbourhood needs. Community trust increased. You have not made the decision on their behalf.");
  updateHUD();draw();
}
function interact(){
  if(state.completed)return;
  const p=nearby();
  if(!p){setComms("Nothing within reach.","Move next to a glowing marker before interacting.");return;}
  if(p.type==="cache"){
    if(state.found.includes(p.id)){setComms("Cache empty.","You've already collected this repair cache.");return;}
    state.found.push(p.id);state.parts+=1;
    setComms("Repair parts secured.","You found a sealed community repair kit. Parts +1. Find the second cache before visiting the solar array.");
  }else if(p.type==="water"){
    if(state.found.includes(p.id)){setComms("Water station checked.","The clean-water reserve is already restored.");return;}
    state.found.push(p.id);state.water=1;
    setComms("Water restored.","The station's manual valve is open and the reserve is flowing again. Water supply restored.");
  }else if(p.type==="resident"){
    if(state.spoken.includes(p.id)){setComms("Neighbourhood update.","You've already heard this resident's concerns.");return;}
    const name=p.id==="residentA"?"Mara":"Ivo";
    setComms(name+" wants to speak.","How will you approach the conversation?",[
      {label:"Listen and co-design (+1 trust)",action:()=>listenTo(p.id,name)},
      {label:"Issue a rushed directive (−1 trust)",action:()=>{state.spoken.push(p.id);state.trust-=1;setComms("Directive issued.","You acted without hearing the resident out. Trust decreased. The mission can still continue, but the community outcome may be weaker.");updateHUD();draw();}}
    ]);
  }else if(p.type==="solar"){
    if(state.power){setComms("Solar network online.","The array is already connected to the district grid.");return;}
    if(state.parts<2){setComms("Solar array needs repair kits.","You need two repair parts. Search the two marked caches first.");return;}
    puzzleStep=0;updatePuzzle();document.getElementById("puzzleModal").hidden=false;
    setComms("Solar array ready.","Complete the routing puzzle to restore power.");
  }else if(p.type==="hub"){
    if(!state.water||!state.power){const missing=[];if(!state.water)missing.push("water");if(!state.power)missing.push("solar power");setComms("The Commons is offline.","Still needed: "+missing.join(" and ")+". Complete the other objectives first.");return;}
    state.completed=true;finishMission();
  }
  updateHUD();draw();
}
function updatePuzzle(){
  document.getElementById("puzzleProgress").textContent=puzzleStep+" / 3 nodes connected";
  document.querySelectorAll("[data-node]").forEach(button=>{
    const order=["sun","storage","grid"];
    const index=order.indexOf(button.dataset.node);
    button.classList.toggle("done",index<puzzleStep);
    button.disabled=index<puzzleStep;
  });
}
document.querySelectorAll("[data-node]").forEach(button=>button.addEventListener("click",()=>{
  const order=["sun","storage","grid"];
  if(button.dataset.node===order[puzzleStep]){
    puzzleStep++;updatePuzzle();
    if(puzzleStep===3){
      state.power=true;state.parts-=2;
      document.getElementById("puzzleMessage").textContent="Power restored! Return to the Commons.";
      setTimeout(()=>{document.getElementById("puzzleModal").hidden=true;setComms("Solar network online.","The three-stage power route is stable. Parts −2. Head to the Commons to finish the mission.");updateHUD();draw();},450);
    }else document.getElementById("puzzleMessage").textContent="Correct. Now connect the next stage.";
  }else{
    puzzleStep=0;updatePuzzle();document.getElementById("puzzleMessage").textContent="Not quite. The correct flow starts with sunlight. Try again.";
  }
}));
document.getElementById("closePuzzle").addEventListener("click",()=>{document.getElementById("puzzleModal").hidden=true;});
function finishMission(){
  updateHUD();draw();
  let result;
  if(state.trust>=2)result="You restored the shared hub with residents involved in the decisions. The district has water, power and a recovery plan shaped by its community.";
  else if(state.trust===1)result="The lights are back and water is flowing, but some residents feel unheard. The district is recovering, with trust still to rebuild.";
  else result="The infrastructure is running, but the community feels excluded. The recovery is fragile: the next challenge will be rebuilding trust.";
  document.getElementById("endingText").textContent=result;
  document.getElementById("endingStats").innerHTML="<span>Parts used: 2</span><span>Trust: "+state.trust+"</span><span>Residents heard: "+state.spoken.length+"/2</span>";
  document.getElementById("endingModal").hidden=false;
  document.getElementById("worldStatus").textContent="MISSION COMPLETE";
  setComms("The Commons is alive.","Mission complete. You can review your outcome or play again.");
}
function resetMission(){
  state=freshState();puzzleStep=0;
  document.getElementById("endingModal").hidden=true;
  document.getElementById("puzzleModal").hidden=true;
  setComms("You're on the ground.","Move around the district. Walk up to a marked location and press INTERACT to see what you can do.");
  updateHUD();draw();
}
document.getElementById("interact").addEventListener("click",interact);
document.getElementById("reset").addEventListener("click",()=>{
  if(confirm("Restart this mission? Your local mission progress will be cleared."))resetMission();
});
document.getElementById("playAgain").addEventListener("click",resetMission);
document.querySelectorAll("[data-move]").forEach(button=>button.addEventListener("click",()=>{
  const moves={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
  move(...moves[button.dataset.move]);
}));
window.addEventListener("keydown",event=>{
  if(!document.getElementById("puzzleModal").hidden||!document.getElementById("endingModal").hidden===false)return;
  const moves={ArrowUp:[0,-1],w:[0,-1],W:[0,-1],ArrowDown:[0,1],s:[0,1],S:[0,1],ArrowLeft:[-1,0],a:[-1,0],A:[-1,0],ArrowRight:[1,0],d:[1,0],D:[1,0]};
  if(moves[event.key]&&!event.repeat){event.preventDefault();move(...moves[event.key]);}
  if((event.key==="e"||event.key==="E"||event.key===" " )&&!event.repeat){event.preventDefault();interact();}
});
document.getElementById("world").addEventListener("click",event=>{
  const rect=canvas.getBoundingClientRect();
  const x=Math.floor((event.clientX-rect.left)/rect.width*COLS);
  const y=Math.floor((event.clientY-rect.top)/rect.height*ROWS);
  const dx=Math.sign(x-state.player.x),dy=Math.sign(y-state.player.y);
  if(Math.abs(x-state.player.x)>Math.abs(y-state.player.y))move(dx,0);
  else if(dy!==0)move(0,dy);
  else if(dx!==0)move(dx,0);
});
updateHUD();draw();