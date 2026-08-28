/* 배포 전 산식 지문 검산 — node verify_hash.js index.html */
const fs=require('fs');
const file=process.argv[2]||'index.html';
const h=fs.readFileSync(file,'utf8');
const m=h.match(/<script>[\s\S]*?<\/script>/g);
const s=m[m.length-1].replace(/^<script>/,'').replace(/<\/script>/,'');
const grab=(n)=>{const i=s.indexOf('function '+n+'(');let d=0,k=s.indexOf('{',i);
  for(;k<s.length;k++){if(s[k]==='{')d++;else if(s[k]==='}'){d--;if(d===0)break;}}return s.slice(i,k+1);};
const a=s.indexOf('var RATE23='),b=s.indexOf('function tbl(');
const r=new Function(s.slice(a,b)+'return [String(RATE23),String(RATE21)];')();
const src=grab('tbl')+grab('tax')+grab('run')+r[0]+r[1];
function fnv1a(t){let x=0x811c9dc5;for(let i=0;i<t.length;i++){x^=t.charCodeAt(i);x=(x+((x<<1)+(x<<4)+(x<<7)+(x<<8)+(x<<24)))>>>0;}return ('0000000'+x.toString(16)).slice(-8);}
const cur=fnv1a(src);
const emb=(h.match(/var LOGIC_HASH='([0-9a-f]{8})'/)||[])[1];
console.log('계산된 지문 :', cur);
console.log('파일 상수   :', emb);
console.log(cur===emb ? '일치 — 배포 가능' : '불일치 — LOGIC_HASH 를 '+cur+' 로 갱신할 것');
process.exit(cur===emb?0:1);
