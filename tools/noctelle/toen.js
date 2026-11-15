const fs=require("fs");global.window={};eval(fs.readFileSync("/home/claude/estherwong.fun/assets/js/data.js","utf8"));
const d=window.NOCTELLE_DATA, M=JSON.parse(fs.readFileSync("en-map.json","utf8"));
function en(s){s=String(s); if(M[s]) return M[s]; if(s.includes(" / ")&&!s.includes("\n")) return s.split(" / ").slice(1).join(" / ");
 if(!s.includes("\n")) return s;
 return s.split("\n\n").map(p=>{const l=p.split("\n"); if(l.length%2){return p} return l.filter((_,i)=>i%2).join("\n")}).join("\n\n");}
const miss=[];function chk(s){if(/\b(yang|dan|untuk|dari|dengan|lewat|Gim|Proyek)\b/.test(s)) miss.push(s);return s}
d.projects.forEach(p=>{p.title=p.titleEn;p.titleEn="";p.desc=chk(en(p.desc));
 (p.sections||[]).forEach(s=>{s.id=s.en;});
 (p.sections||[{pages:p.pages}]).forEach(s=>s.pages.forEach(pg=>{
  pg.header=chk(en(pg.header)); pg.title=pg.titleEn||en(pg.title); pg.titleEn=""; pg.subtitle=chk(en(pg.subtitle));
  pg.tabs.forEach(t=>{t.id=t.en; if(t.body!=null)t.body=chk(en(t.body));
   if(t.modules)t.modules=t.modules.map(m=>[chk(en(m[0])),chk(en(m[1]))]);
   if(t.rows)t.rows=t.rows.map(r=>String(r[2]).startsWith("chips:")?[r[1],r[1],r[2],r[3]]:[r[1],r[1],r[3],r[3]]);
  });
 }));
});
const B="__NC_BASE__";
const out=JSON.stringify(d).replace(/assets\//g,B);
fs.writeFileSync("data-en.js","window.NOCTELLE_DATA="+out+";\n");
console.log("miss",miss.length,miss.slice(0,8));
