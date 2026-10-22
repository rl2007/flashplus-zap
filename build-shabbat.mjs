import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const clock=require('./shabbat-clock.js');
const root=path.resolve(import.meta.dirname);
const output=path.join(root,'_site');
const now=process.env.SHABBAT_TEST_NOW?Date.parse(process.env.SHABBAT_TEST_NOW):Date.now();
if(!Number.isFinite(now))throw new Error('Invalid timestamp');
const status=clock.state(now);
// Owner explicitly resumed only the two Hebrew SX740 three-year warranty offers on 2026-10-22.
// Every other product remains excluded from all public Zap feeds; source records stay intact.
const publicationPaused=false;
const publicationAllowlist=new Map([
 ['a94964b2-13af-4b22-b461-9c02b78a3f52',{price:2250,variant:'b19d27ba-adbc-4018-8f7e-524c3d934aca'}],
 ['sx740-black-he',{price:2370,variant:'29211665-dcdd-4789-aea1-53c4e12c548a'}]
]);
function restrictedFeed(source){
 const seen=new Set();
 return source.replace(/<PRODUCT\b[^>]*>[\s\S]*?<\/PRODUCT>/g,product=>{
  const value=tag=>product.match(new RegExp('<'+tag+'>([\\s\\S]*?)</'+tag+'>'))?.[1]??'';
  const code=value('PRODUCTCODE');
  const policy=publicationAllowlist.get(code);
  if(!policy)return '';
  if(seen.has(code))throw new Error('Duplicate allowed product: '+code);
  seen.add(code);
  if(Number(value('PRICE'))!==policy.price || !value('PRODUCT_URL').includes('variantId='+policy.variant) || !value('PRODUCT_NAME').includes('בעברית') || !value('PRODUCT_NAME').includes('3 שנים') || !value('WARRANTY').includes('3 שנים'))throw new Error('Unverified SX740 bundle: '+code);
  return product;
 });
}
// Close the export ahead of Shabbat to allow for scheduled-run queue delays.
const feedClosed=publicationPaused || status.closed || (status.start>now && status.start-now<=20*60000);
// Publish a valid empty XML feed while closed; source prices and IDs remain intact.
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(path.join(output,'categories'),{recursive:true});
const empty='<?xml version="1.0" encoding="utf-8"?>\n<STORE><PRODUCTS /></STORE>\n';
for(const f of fs.readdirSync(path.join(root,'categories'))){
 if(!f.endsWith('.xml'))continue;
 fs.writeFileSync(path.join(output,'categories',f),feedClosed?empty:restrictedFeed(fs.readFileSync(path.join(root,'categories',f),'utf8')));
}
fs.writeFileSync(path.join(output,'zap.xml'),feedClosed?empty:restrictedFeed(fs.readFileSync(path.join(root,'zap.xml'),'utf8')));
for(const f of ['index.html','.nojekyll','shabbat-clock.js','shabbat.html','shabbat-candles.jpg','SUNCalc-LICENSE.txt'])fs.copyFileSync(path.join(root,f),path.join(output,f));
console.log(JSON.stringify({closed:feedClosed,publicationPaused,timezone:clock.timezone,reopens:publicationPaused?null:new Date(status.end).toISOString(),sourceUnchanged:true}));
