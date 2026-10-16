const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
let JSDOM;try{({JSDOM}=require('jsdom'))}catch{({JSDOM}=require('./qa-deps/node_modules/jsdom'))}
const root=fs.existsSync(path.join(__dirname,'app-v8.js'))?__dirname:path.join(__dirname,'github-pages-ready');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),script=fs.readFileSync(path.join(root,'app-v8.js'),'utf8');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function until(test,reason,limit=18000){const start=Date.now();while(!test()){if(Date.now()-start>limit)throw new Error(reason);await delay(25)}}
function setup(mode='success',old=false,legacyDialog=false){
 const dom=new JSDOM(html,{url:'https://salimwardak.github.io/ketavilo/?v=6',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window,errors=[],requests=[];let currentMode=mode;
 w.matchMedia=()=>({matches:false});w.HTMLElement.prototype.scrollIntoView=function(){};
 w.addEventListener('error',e=>errors.push(e.message));
 if(old){w.document.getElementById('source-filter-label').remove();w.document.getElementById('library-bootstrap').remove();w.document.getElementById('load-panel').remove()}
 w.fetch=async url=>{
  const file=String(url).split('/').pop().split('?')[0];requests.push(file);
  if(file.startsWith('catalog-v6-')&&currentMode==='stall')return new Promise(()=>{});
  if(file.startsWith('catalog-v6-')&&currentMode==='fail')throw new Error('simulated unavailable network');
  if(file.startsWith('summary-v6-')&&currentMode==='summary-fail')throw new Error('simulated summary failure');
  await delay(2);const content=fs.readFileSync(path.join(root,file),'utf8');
  return {ok:true,status:200,json:async()=>JSON.parse(content),text:async()=>content};
 };
 if(legacyDialog)w.document.querySelectorAll('dialog').forEach(d=>{Object.defineProperty(d,'open',{configurable:true,value:undefined});d.showModal=undefined;d.close=undefined});
 w.eval(script);
 return {dom,w,errors,requests,setMode:value=>currentMode=value,close:()=>w.close()};
}
function click(w,selector){const el=w.document.querySelector(selector);assert(el,'Missing control '+selector);el.click()}
function select(w,id,value){const el=w.document.getElementById(id);el.value=value;el.dispatchEvent(new w.Event('change',{bubbles:true}))}
async function categoriesWork(ctx){const w=ctx.w;
 for(let i=0;i<8;i++){click(w,'[data-category="'+i+'"]');assert(w.document.querySelector('#grid article'),'Category '+i+' is empty');assert(w.document.querySelector('[data-category="'+i+'"].active'),'Category '+i+' did not react');click(w,'[data-category="'+i+'"]')}
}
(async()=>{
 let c=setup('stall');assert(c.w.document.querySelectorAll('#grid article').length===25,'No immediate cards');await delay(140);assert(c.requests.some(x=>x.startsWith('catalog-v6-')),'Slow network was not exercised');await categoriesWork(c);
 click(c.w,'nav [data-view="summaries"]');assert.match(c.w.document.getElementById('status').textContent,/1,012|۱٬۰۱۲/);select(c.w,'book-language','fa');assert.match(c.w.document.getElementById('status').textContent,/153|۱۵۳/);assert(!c.requests.includes('catalog.json')&&!c.requests.includes('wiki-summaries.json'));assert.equal(c.errors.length,0);c.close();console.log('PASS: stalled large downloads do not block cards, all 8 categories, or 1,012 summary titles.');
 c=setup('fail',true);await until(()=>c.w.document.querySelector('#book-language option[value="und"]'),'Old page did not initialize');await categoriesWork(c);await until(()=>!c.w.document.getElementById('catalog-retry').hidden&&!c.w.document.getElementById('catalog-retry').disabled,'No usable retry control after failure');assert.equal(c.errors.length,0);c.setMode('success');click(c.w,'#catalog-retry');await until(()=>c.w.document.getElementById('load-panel').hidden,'Retry did not complete');assert.match(c.w.document.getElementById('status').textContent,/78,606|۷۸٬۶۰۶/);c.close();console.log('PASS: old cached HTML is repaired; failed loading preserves books; retry loads all 78,606 entries.');
 c=setup('summary-fail',false,true);click(c.w,'nav [data-view="summaries"]');click(c.w,'.card-actions [data-summary="wiki-7923"]');await until(()=>c.w.document.querySelector('#summary-body [data-summary="wiki-7923"]'),'No summary retry');c.setMode('success');click(c.w,'#summary-body [data-summary="wiki-7923"]');await until(()=>c.w.document.querySelector('#summary-body .source-summary'),'Summary retry failed');assert(c.w.document.querySelector('#summary-body .source-summary').textContent.length>200);click(c.w,'[data-close="summary-dialog"]');select(c.w,'ui-language','ps');select(c.w,'book-language','ps');assert.match(c.w.document.getElementById('status').textContent,/12|۱۲/);click(c.w,'nav [data-view="library"]');select(c.w,'book-language','');select(c.w,'source-filter','ganjoor');assert.match(c.w.document.getElementById('status').textContent,/281|۲۸۱/);select(c.w,'source-filter','');c.w.document.getElementById('search').value='Pride and Prejudice';c.w.document.getElementById('search').dispatchEvent(new c.w.Event('input',{bubbles:true}));await delay(220);click(c.w,'.card-actions [data-read="1342"]');await until(()=>c.w.document.getElementById('page-position').textContent.includes('124')||c.w.document.getElementById('page-position').textContent.includes('۱۲۴'),'Reader did not open');click(c.w,'#next');assert.match(c.w.document.getElementById('page-position').textContent,/(?:page|صفحه|پاڼه)\s*(?:2|۲)\s*/i);assert.equal(c.errors.length,0);c.close();console.log('PASS: individual summary failure/retry, source filter, Pashto summaries, full reader and next page.');
 const nojs=new JSDOM(html);assert.equal(nojs.window.document.querySelectorAll('#grid article').length,25);for(let i=0;i<8;i++){assert(nojs.window.document.querySelector('a[href="/ketavilo/category-'+i+'.html"]'));const page=new JSDOM(fs.readFileSync(path.join(root,'category-'+i+'.html'),'utf8'));assert.equal(page.window.document.querySelectorAll('ol li').length,1000);page.window.close()}nojs.window.close();console.log('PASS: without JavaScript, 25 real book links and all 8 alternative 1,000-book pages are available.');
})().catch(error=>{console.error(error.stack);process.exit(1)});
