import test from "node:test";
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,stat} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {chromium} from "playwright";
let server,browser;
test("Chapter 5 emotional autonomy audits unlock, assemble a charter and persist",async t=>{
 let url=process.env.DHIE_BASE_URL?(process.env.DHIE_BASE_URL.endsWith("/")?process.env.DHIE_BASE_URL:process.env.DHIE_BASE_URL+"/")+"chapter5.html":null;
 if(!url){server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,"http://localhost").pathname);const file=resolve(process.cwd(),path==="/"?"index.html":path.replace(/^\/+/, ""));if(file!==process.cwd()&&!file.startsWith(process.cwd()+sep))throw Error("path");const info=await stat(file);if(!info.isFile())throw Error("file");const body=await readFile(file);const type={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css"}[extname(file)]||"application/octet-stream";res.writeHead(200,{"content-type":type}).end(body);}catch{res.writeHead(404).end("Not found");}});await new Promise(done=>server.listen(0,"127.0.0.1",done));url="http://127.0.0.1:"+server.address().port+"/chapter5.html";}
 browser=await chromium.launch({headless:true});t.after(async()=>{await browser?.close();if(server)await new Promise(done=>server.close(done));});
 const page=await browser.newPage({viewport:{width:1365,height:900}}),errors=[];page.on("pageerror",e=>errors.push(e.message));await page.goto(url,{waitUntil:"networkidle"});await page.evaluate(()=>localStorage.clear());await page.reload({waitUntil:"networkidle"});
 async function solve(stage,submit){const cards=await page.locator("#"+stage+"Cards .case-card").all();assert.equal(cards.length,3,stage+" should contain three case cards");for(const card of cards)await card.locator('input[type="radio"]').nth(1).check();await page.locator("#"+submit).click();assert.match(await page.locator("#"+stage+"Feedback").innerText(),/Investigation complete/);}
 await solve("damping","submitDamping");await page.getByRole("button",{name:/02 · Empathy/}).click();await solve("empathy","submitEmpathy");await page.getByRole("button",{name:/03 · Resilience/}).click();await solve("resilience","submitResilience");await page.getByRole("button",{name:/04 · Matrix & regulation/}).click();await solve("matrix","submitMatrix");
 assert.equal(await page.locator("#finalFile").isVisible(),true);assert.match(await page.locator("#finalSummary").innerText(),/rejects emotional uniformity/);await page.reload({waitUntil:"networkidle"});assert.equal(await page.locator("#finalFile").isVisible(),true);
 const mobile=await browser.newPage({viewport:{width:390,height:844}});await mobile.goto(url,{waitUntil:"networkidle"});const dims=await mobile.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));assert.ok(dims.scroll<=dims.client+1,"mobile page should not overflow horizontally");await mobile.close();assert.deepEqual(errors,[]);
});
