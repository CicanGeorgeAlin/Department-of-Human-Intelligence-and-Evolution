import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { chromium } from "playwright";
let server,browser;
const base=process.env.DHIE_BASE_URL;
test("Homo Optima creation flow works on desktop and mobile and restores its charter",async t=>{
 let url=base?(base.endsWith("/")?base:base+"/")+"creation.html":null;
 if(!url){server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,"http://localhost").pathname);const file=resolve(process.cwd(),path==="/"?"index.html":path.replace(/^\/+/, ""));if(file!==process.cwd()&&!file.startsWith(process.cwd()+sep))throw Error("path");const info=await stat(file);if(!info.isFile())throw Error("file");const body=await readFile(file);const type={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8"}[extname(file)]||"application/octet-stream";res.writeHead(200,{"content-type":type}).end(body);}catch{res.writeHead(404).end("Not found");}});await new Promise(resolveListen=>server.listen(0,"127.0.0.1",resolveListen));url="http://127.0.0.1:"+server.address().port+"/creation.html";}
 browser=await chromium.launch({headless:true});t.after(async()=>{await browser?.close();if(server)await new Promise(done=>server.close(done));});
 const page=await browser.newPage({viewport:{width:1365,height:900}}),errors=[];page.on("pageerror",e=>errors.push(e.message));await page.goto(url,{waitUntil:"networkidle"});
 assert.equal(await page.locator("#missionText .word").count(),missionWordCount(await page.locator("#missionText").innerText()));
 await page.locator('#missionText [data-word="transcend"]').click();assert.match(await page.locator("#wordNote").innerText(),/go beyond a stated limit/i);
 await page.getByRole("button",{name:/02 Seven pillars/}).click();await page.locator('[data-pillar="cognitive"]').click();assert.match(await page.locator("#pillarDetail").innerText(),/Original wording/);
 await page.locator('[data-pillar="trajectory"]').click();assert.match(await page.locator("#pillarDetail").innerText(),/Who has the authority/);
 await page.getByRole("button",{name:/03 Your charter/}).click();
 await page.locator('input[name="charter-0"][value="plural"]').check();await page.locator('input[name="charter-1"][value="consent"]').check();await page.locator('input[name="charter-2"][value="protect"]').check();
 await page.getByRole("button",{name:"ASSEMBLE MY CHARTER"}).click();assert.equal(await page.locator("#charterResult").isVisible(),true);assert.match(await page.locator("#profileName").innerText(),/Charter 01/);
 await page.evaluate(()=>{localStorage.setItem("dhie-chapter1-field-study-v1",JSON.stringify({seen:["premise","ecology","cognition","impasse"],resolved:true}));localStorage.setItem("dhie-chapter1-doctrine-review-v1",JSON.stringify({complete:{doctrine:true,predecessors:true,mandate:true,charter:true}}));});await page.reload({waitUntil:"networkidle"});assert.match(await page.locator("#profileName").innerText(),/Charter 01/);assert.equal(await page.locator("#chapterOneProgress").innerText(),"5 / 5");await page.getByRole("button",{name:/03 Your charter/}).click();assert.equal(await page.locator("#charterResult").isVisible(),true);
 const mobile=await browser.newPage({viewport:{width:390,height:844}});await mobile.goto(url,{waitUntil:"networkidle"});const dims=await mobile.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));assert.ok(dims.scroll<=dims.client+1,"mobile page should not overflow horizontally");await mobile.close();assert.deepEqual(errors,[]);
});
function missionWordCount(text){return text.trim().split(/\s+/).length;}
