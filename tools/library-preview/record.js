// Jalankan di halaman live /<slug>/home (viewport 1440x900 diset SEBELUM load).
// Membekukan waktu GSAP/WAAPI/video lalu maju 130 ms per frame sambil scroll halus.
// Setelah ini: per frame jalankan `await __frame(i)` lalu screenshot scale 0.8 (640x400), i = 0..__seq.length-1.
await new Promise(r=>setTimeout(r,3500));
const st=document.createElement('style'); st.textContent='.w-webflow-badge,.awl-home{display:none!important}html{scrollbar-width:none}::-webkit-scrollbar{display:none}'; document.head.appendChild(st);
document.querySelectorAll('img').forEach(i=>{i.loading='eager'}); await Promise.all([...document.querySelectorAll('img')].map(i=>i.decode().catch(()=>{})));
window.scrollTo(0,0); window.lenis&&lenis.scrollTo(0,{immediate:true});
const hasG=!!window.gsap; if(hasG){gsap.globalTimeline.pause(); window.__T0=gsap.globalTimeline.time();}
const vids=[...document.querySelectorAll('video')]; vids.forEach(v=>v.pause());
document.getAnimations().forEach(a=>a.pause());
// STOPS: posisi berhenti (px CSS) di tiap section; sesuaikan per website. Default: bagi rata 10 titik.
const H=document.documentElement.scrollHeight-innerHeight;
const stops=window.STOPS||Array.from({length:11},(_,i)=>Math.round(H*i/10));
const ease=t=>0.5-0.5*Math.cos(Math.PI*t), seq=[]; for(let i=0;i<10;i++)seq.push(0);
for(let i=0;i<stops.length-1;i++){const a=stops[i],b=stops[i+1],n=Math.max(6,Math.round(Math.abs(b-a)/94)); for(let j=1;j<=n;j++)seq.push(a+(b-a)*ease(j/n)); for(let j=0;j<4;j++)seq.push(b);}
window.__seq=seq;
window.__frame=async(i)=>{const y=__seq[i]; window.scrollTo(0,y); window.lenis&&lenis.scrollTo(y,{immediate:true}); window.ScrollTrigger&&ScrollTrigger.update(); const T=i*0.13; if(hasG)gsap.globalTimeline.time(__T0+T);
 document.getAnimations().forEach(a=>{try{const d=a.effect.getComputedTiming().duration; a.currentTime=(T*1000)%(d||1e9)}catch(e){}});
 vids.forEach(v=>{const r=v.getBoundingClientRect(); if(r.top<innerHeight&&r.bottom>0&&v.duration)v.currentTime=T%v.duration});
 await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))); return i};
seq.length
