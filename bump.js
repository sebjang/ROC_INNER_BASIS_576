/* 버전 갱신 — node bump.js 2026-08-28b
   index.html 의 BUILD 4곳과 README 를 한 번에 바꾸고 산식 지문을 다시 계산해 맞춘다.
   손으로 여섯 군데를 고치다 한 곳을 빠뜨리는 사고를 막기 위한 도구다. */
const fs=require('fs');
const V=process.argv[2];
if(!/^\d{4}-\d{2}-\d{2}[a-z]$/.test(V||'')){
  console.log('사용법: node bump.js 2026-08-28b'); process.exit(1);
}
let H=fs.readFileSync('index.html','utf8');
const OLD=(H.match(/var BUILD='(\d{4}-\d{2}-\d{2}[a-z])'/)||[])[1];
if(!OLD){ console.log('! index.html 에서 현재 버전을 찾지 못했습니다.'); process.exit(1); }

H=H.replace(new RegExp('BUILD '+OLD+'</b>','g'), 'BUILD '+V+'</b>')
   .replace(new RegExp("var BUILD='"+OLD+"'",'g'), "var BUILD='"+V+"'")
   .replace(new RegExp('body=BUILD%20'+OLD,'g'), 'body=BUILD%20'+V);

/* 산식 지문 재계산 — 상수를 비운 뒤 계산해야 자기참조가 생기지 않는다 */
const m=H.match(/<script>[\s\S]*?<\/script>/g);
const s=m[m.length-1].replace(/^<script>/,'').replace(/<\/script>/,'');
const grab=(n)=>{const i=s.indexOf('function '+n+'(');let d=0,k=s.indexOf('{',i);
  for(;k<s.length;k++){if(s[k]==='{')d++;else if(s[k]==='}'){d--;if(d===0)break;}}return s.slice(i,k+1);};
const a=s.indexOf('var RATE23='),b=s.indexOf('function tbl(');
const r=new Function(s.slice(a,b)+'return [String(RATE23),String(RATE21)];')();
function fnv1a(t){let x=0x811c9dc5;for(let i=0;i<t.length;i++){x^=t.charCodeAt(i);x=(x+((x<<1)+(x<<4)+(x<<7)+(x<<8)+(x<<24)))>>>0;}return ('0000000'+x.toString(16)).slice(-8);}
const NEW=fnv1a(grab('tbl')+grab('tax')+grab('run')+r[0]+r[1]);
const OLDH=(H.match(/var LOGIC_HASH='([0-9a-f]{8})'/)||[])[1];
H=H.replace(/var LOGIC_HASH='[0-9a-f]{8}'/, "var LOGIC_HASH='"+NEW+"'");
fs.writeFileSync('index.html',H);

if(fs.existsSync('README.md')){
  let R=fs.readFileSync('README.md','utf8');
  R=R.replace(/배포 버전 \| \*\*BUILD \d{4}-\d{2}-\d{2}[a-z]\*\*/, '배포 버전 | **BUILD '+V+'**')
     .replace(/산식 지문 \| \*\*`[0-9a-f]{8}`\*\*/, '산식 지문 | **`'+NEW+'`**')
     .replace(/산식 지문 [0-9a-f]{8} — 원본 배포본/, '산식 지문 '+NEW+' — 원본 배포본');
  if(!R.includes('| '+V+' |'))
    R=R.replace(/(## 변경 이력\n\n\| 버전 \| 내용 \|\n\|---\|---\|\n)/, '$1| '+V+' | (내용을 적을 것) |\n');
  fs.writeFileSync('README.md',R);
}
console.log('버전  '+OLD+'  →  '+V);
console.log('지문  '+OLDH+'  →  '+NEW+(OLDH===NEW?'  (산식 변경 없음)':'  (산식 변경됨)'));
console.log('\nREADME 변경 이력의 내용란을 채운 뒤 node release_check.js 로 확인하십시오.');
