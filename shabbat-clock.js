/* Copyright (c) 2026, Volodymyr Agafonkin
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of
      conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list
      of conditions and the following disclaimer in the documentation and/or other materials
      provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
(function(root){
'use strict';
var PI=Math.PI,rad=PI/180,day=86400000,min=60000;
var sin=Math.sin,cos=Math.cos,asin=Math.asin,acos=Math.acos,atan=Math.atan2,round=Math.round;
function toDays(t){return t/day-.5+2440588-2451545}
function deltaT(d){var t=(2000+d/365.2425)-2000;return 62.92+t*(.32217+t*.005589)}
function tt(d){return d+deltaT(d)/86400}
function sidereal(d,lw){return rad*(280.46061837+360.98564736629*d)-lw}
function coords(d){
 var t=d/36525,L0=rad*(280.46646+t*(36000.76983+t*.0003032)),M=rad*(357.52911+t*(35999.05029-t*.0001537)),s=sin(M),c=cos(M);
 var C=rad*((1.914602-t*(.004817+t*.000014))*s+(.019993-.000101*t)*2*s*c+.000289*s*(3-4*s*s));
 var Om=rad*(125.04-1934.136*t),L=L0+C-rad*(.00569+.00478*sin(Om));
 var e=rad*(23.439291-t*(.0130042+t*(.00000016-t*.000000504)))+rad*.00256*cos(Om);
 return {ra:atan(cos(e)*sin(L),cos(L)),dec:asin(sin(e)*sin(L))};
}
function wrap(a){return a-2*PI*round(a/(2*PI))}
function sunEvent(noon,angle){
 var lw=-35.235*rad,phi=31.778*rad,lon=.0009+lw/(2*PI),dt=round(toDays(noon)-lon)+lon;
 for(var i=0;i<3;i++)dt-=wrap(sidereal(dt,lw)-coords(tt(dt)).ra)/(2*PI);
 var h0=angle*rad,dec=coords(tt(dt)).dec;
 var cosH=(sin(h0)-sin(phi)*sin(dec))/(cos(phi)*cos(dec));
 var d=dt+acos(cosH)/(2*PI);
 for(var j=0;j<2;j++){
  var c=coords(tt(d)),H=wrap(sidereal(d,lw)-c.ra);
  var h=asin(sin(phi)*sin(c.dec)+cos(phi)*cos(c.dec)*cos(H));
  d+=(h-h0)/(2*PI*cos(phi)*cos(c.dec)*sin(H));
 }
 return (d+2451545+.5-2440588)*day;
}
function sunset(noon){return sunEvent(noon,-.833)}
var fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jerusalem',year:'numeric',month:'2-digit',day:'2-digit'});
function civilNoon(now){var p={};fmt.formatToParts(new Date(now)).forEach(function(x){p[x.type]=x.value});return Date.UTC(+p.year,+p.month-1,+p.day,12)}
function interval(friday){return {start:Math.floor((sunset(friday)-42*min)/min)*min,end:Math.ceil((sunset(friday+day)+74*min)/min)*min,candles:Math.floor((sunset(friday)-40*min)/min)*min,havdalah:Math.ceil(sunEvent(friday+day,-8.5)/min)*min}}
function state(now){
 now=now===undefined?Date.now():Number(now);
 // One-off early closure requested by the owner; expires on Saturday night.
 var early=interval(Date.UTC(2026,9,9,12));early.start=Date.UTC(2026,9,9,14,7);
 if(now>=early.start&&now<early.end)return Object.assign({closed:true,next:early.end},early);
 var noon=civilNoon(now),dow=new Date(noon).getUTCDay();
 var friday=noon+((5-dow+7)%7)*day;
 var prior=interval(friday-7*day),next=interval(friday);
 if(now>=prior.start&&now<prior.end)return Object.assign({closed:true,next:prior.end},prior);
 if(now>=next.start&&now<next.end)return Object.assign({closed:true,next:next.end},next);
 return Object.assign({closed:false,next:next.start},next);
}
root.FlashPlusShabbat={state:state,sunset:sunset,timezone:'Asia/Jerusalem',location:'Jerusalem',closeBeforeSunsetMinutes:42,openAfterSunsetMinutes:74};
if(typeof module==='object'&&module.exports)module.exports=root.FlashPlusShabbat;
})(typeof window==='object'?window:globalThis);
