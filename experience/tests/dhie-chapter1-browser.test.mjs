import test from "node:test";
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,stat} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {chromium} from "playwright";
let server,browser;
test("Chapter 1 source study unlocks, resolves and restores the scenario",async t=>{
 let url=process.env.DHIE_BASE_URL?(process.env.DHIE_BASE_URL.endsWith("/")?process.env.DHIE_BASE_URL:process.env.DHIE_BASE_URL+"/")+"chapter1.html":null;
 if(!url){server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,"http://localhost").pathname);const file=resolve(process.cwd(),path==="/"?"index.html":path.replace(/^\/+/, ""));if(file!==process.cwd()&&!file.startsWith(process.cwd()+sep))throw Error("path");const info=await stat(file);if(!info.isFile())throw Error("file");const body=await readFile(file);const type={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css"}[extname(file)]||"application/octet-stream";res.writeHead(200,{"content-type":type}).end(body);}catch{res.writeHead(404).end("Not found");}});await new Promise(done=>server.listen(0,"127.0.0.1",done));url="http://127.0.0.1:"+server.address().port+"/chapter1.html";}
 browser=await chromium.launch({headless:true});t.after(async()=>{await browser?.close();if(server)await new Promise(done=>server.close(done));});
 const context=await browser.newContext({viewport:{width:1365,height:900}});const page=await context.newPage(),errors=[];page.on("pageerror",e=>errors.push(e.message));await page.goto(url,{waitUntil:"networkidle"});await page.evaluate(()=>localStorage.clear());await page.reload({waitUntil:"networkidle"});
 assert.equal(await page.locator(".claim-card").count(),4);assert.equal(await page.locator("#simulation").isVisible(),false);
 for(const b of await page.locator(".claim-card button").all())await b.click();
 assert.equal(await page.locator("#simulation").isVisible(),true);
 await page.locator('input[name="response"][value="participatory"]').check();await page.getByRole("button",{name:"RESOLVE THE SCENARIO"}).click();assert.equal(await page.locator("#outcome").isVisible(),true);assert.match(await page.locator("#outcome").innerText(),/Shared emergency council/);
 await page.reload({waitUntil:"networkidle"});assert.equal(await page.locator("#simulation").isVisible(),true);assert.equal(await page.locator('input[name="response"][value="participatory"]').isChecked(),true);
 const mobile=await context.newPage({viewport:{width:390,height:844}});await mobile.goto(url,{waitUntil:"networkidle"});const dims=await mobile.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));assert.ok(dims.scroll<=dims.client+1,"mobile layout should not overflow horizontally");assert.deepEqual(errors,[]);await context.close();
});