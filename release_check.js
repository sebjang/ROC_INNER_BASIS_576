/* 배포 전 일괄 점검 — node release_check.js
   index.html 의 BUILD 표기 2곳 + 메일링크 + 산식 지문 + README 를 대조한다. */
const fs=require('fs');
const H=fs.readFileSync('index.html','utf8');
const R=fs.existsSync('README.md')?fs.readFileSync('README.md','utf8'):'';
const m=H.match(/<script>[\s\S]*?<\/script>/g);
const s=m[m.length-1].replace(/^<script>/,'').replace(/<\/script>/,'');
const grab=(n)=>{const i=s.indexOf('function '+n+'(');let d=0,k=s.indexOf('{',i);
  for(;k<s.length;k++){if(s[k]==='{')d++;else if(s[k]==='}'){d--;if(d===0)break;}}return s.slice(i,k+1);};
const a=s.indexOf('var RATE23='),b=s.indexOf('function tbl(');
const r=new Function(s.slice(a,b)+'return [String(RATE23),String(RATE21)];')();
function fnv1a(t){let x=0x811c9dc5;for(let i=0;i<t.length;i++){x^=t.charCodeAt(i);x=(x+((x<<1)+(x<<4)+(x<<7)+(x<<8)+(x<<24)))>>>0;}return ('0000000'+x.toString(16)).slice(-8);}
const hash=fnv1a(grab('tbl')+grab('tax')+grab('run')+r[0]+r[1]);

const pick=(re,src)=>{const x=(src||H).match(re);return x?x[1]:null;};
const rows=[
  ['산식 지문 (계산)',        hash],
  ['LOGIC_HASH 상수',        pick(/var LOGIC_HASH='([0-9a-f]{8})'/)],
  ['README 지문',            pick(/산식 지문 \| \*\*`([0-9a-f]{8})`\*\*/,R)],
  ['BUILD 헤더 표기',        pick(/BUILD (\d{4}-\d{2}-\d{2}[a-z])<\/b>/)],
  ['var BUILD',              pick(/var BUILD='(\d{4}-\d{2}-\d{2}[a-z])'/)],
  ['메일링크 body BUILD',    pick(/body=BUILD%20(\d{4}-\d{2}-\d{2}[a-z])/)],
  ['README 배포 버전',       pick(/배포 버전 \| \*\*BUILD (\d{4}-\d{2}-\d{2}[a-z])\*\*/,R)]
];
let bad=0;
for(const [k,v] of rows) console.log((v?'  ':'! ')+k.padEnd(22),v||'(없음)');
const hs=rows.slice(0,3).map(x=>x[1]), bs=rows.slice(3).map(x=>x[1]);
if(new Set(hs).size!==1){ console.log('\n! 지문 3곳이 다릅니다.'); bad++; }
if(new Set(bs).size!==1){ console.log('! BUILD 표기 4곳이 다릅니다.'); bad++; }
console.log(bad? '\n배포 보류 — 위 항목을 맞출 것' : '\n전 항목 일치 — 배포 가능');
process.exit(bad?1:0);
