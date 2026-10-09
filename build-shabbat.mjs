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
// Publish a valid empty XML feed while closed; source prices and IDs remain intact.
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(path.join(output,'categories'),{recursive:true});
const empty='<?xml version="1.0" encoding="utf-8"?>\n<STORE><PRODUCTS /></STORE>\n';
for(const f of fs.readdirSync(path.join(root,'categories'))){
 if(!f.endsWith('.xml'))continue;
 fs.writeFileSync(path.join(output,'categories',f),status.closed?empty:fs.readFileSync(path.join(root,'categories',f)));
}
fs.writeFileSync(path.join(output,'zap.xml'),status.closed?empty:fs.readFileSync(path.join(root,'zap.xml')));
for(const f of ['index.html','.nojekyll','shabbat-clock.js','shabbat.html','shabbat-candles.jpg','SUNCalc-LICENSE.txt'])fs.copyFileSync(path.join(root,f),path.join(output,f));
console.log(JSON.stringify({closed:status.closed,timezone:clock.timezone,reopens:new Date(status.end).toISOString(),sourceUnchanged:true}));
