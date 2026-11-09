/* Background animations: one per world */
const FX=(()=>{
  const cv=document.createElement("canvas"),x=cv.getContext("2d");
  cv.id="fx";document.body.prepend(cv);
  const slow=matchMedia("(prefers-reduced-motion:reduce)").matches?.15:1;
  let w,h,mode="stars",ac="#fff",P=[],S=[],R=[],D=[],mx=-999,my=-999;
  const rnd=Math.random;
  function size(){w=cv.width=innerWidth;h=cv.height=innerHeight;seed()}
  function seed(){
    P=[];R=[];D=[];x.clearRect(0,0,w,h);
    if(mode==="matrix"){D=Array.from({length:Math.ceil(w/20)},()=>-rnd()*40);return}
    const n=mode==="rings"?0:mode==="fireflies"?45:100;
    for(let i=0;i<n;i++)P.push({x:rnd()*w,y:rnd()*h,vx:(rnd()-.5)*.6,vy:mode==="bubbles"?-rnd()-.3:mode==="embers"?-rnd()*1.5-.4:(rnd()-.5)*.4,r:rnd()*3+1,p:rnd()*6.28,z:rnd()+.3});
  }
  function burst(px,py,n){for(let i=0;i<n;i++){const a=rnd()*6.28,s=rnd()*4+1;S.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1})}}
  function frame(t){
    x.clearRect(0,0,w,h);
    if(mode==="matrix"){
      x.font="16px monospace";x.fillStyle=ac;
      D.forEach((d,i)=>{
        for(let j=0;j<14;j++){x.globalAlpha=(1-j/14)*.8;x.fillText(String.fromCharCode(0x30A0+((i*7+j*13+(t/150|0))%60)),i*20,(d-j)*20)}
        D[i]+=.35*slow;if(d*20>h+280&&rnd()>.97)D[i]=0;
        if(Math.abs(i*20-mx)<50&&Math.abs(d*20-my)<80)D[i]+=.8;
      });
      x.globalAlpha=1;
    }else{
      if(mode==="rings"){
        if(rnd()<.03*slow)R.push({x:rnd()*w,y:rnd()*h,r:0});
        R.forEach(o=>{o.r+=1.5*slow;x.strokeStyle=ac;x.globalAlpha=Math.max(0,1-o.r/180);x.lineWidth=2;x.beginPath();x.arc(o.x,o.y,o.r,0,6.28);x.stroke()});
        R=R.filter(o=>o.r<180);
      }
      P.forEach(p=>{
        const dx=p.x-mx,dy=p.y-my,d=Math.hypot(dx,dy)||1;
        if(mode==="fireflies"){p.vx+=Math.cos(t/900+p.p)*.02-(d<260?dx/d*.012:0);p.vy+=Math.sin(t/800+p.p)*.02-(d<260?dy/d*.012:0);p.vx*=.98;p.vy*=.98}
        else if(d<110){p.x+=dx/d*2.2*slow;p.y+=dy/d*2.2*slow}
        p.x+=p.vx*slow*p.z;p.y+=p.vy*slow*p.z;
        if(mode==="embers")p.x+=Math.sin(t/500+p.p)*.5*slow;
        if(p.x<-10)p.x=w+10;if(p.x>w+10)p.x=-10;if(p.y<-10)p.y=h+10;if(p.y>h+10)p.y=-10;
        x.globalAlpha=.5+.5*Math.sin(t/600+p.p);x.fillStyle=ac;x.strokeStyle=ac;x.shadowColor=ac;x.shadowBlur=12;
        x.beginPath();
        if(mode==="bubbles"){x.globalAlpha=.4;x.lineWidth=1.5;x.arc(p.x,p.y,p.r*5,0,6.28);x.stroke()}
        else{x.arc(p.x,p.y,p.r*(mode==="fireflies"?1.6:1),0,6.28);x.fill()}
      });
      x.shadowBlur=0;x.globalAlpha=1;
    }
    S.forEach(s=>{s.x+=s.vx;s.y+=s.vy;s.vy+=.05;s.l-=.02;x.globalAlpha=Math.max(0,s.l);x.fillStyle=ac;x.fillRect(s.x,s.y,3,3)});
    x.globalAlpha=1;S=S.filter(s=>s.l>0);
    requestAnimationFrame(frame);
  }
  addEventListener("pointermove",e=>{mx=e.clientX;my=e.clientY});
  addEventListener("pointerdown",e=>{
    if(e.target.closest("button,a,input,select,.card,summary,dialog,.drawer"))return;
    burst(e.clientX,e.clientY,18);
    if(mode==="rings")R.push({x:e.clientX,y:e.clientY,r:0});
    if(mode==="bubbles")P.forEach(p=>{if(Math.hypot(p.x-e.clientX,p.y-e.clientY)<p.r*5+10){burst(p.x,p.y,10);p.y=h+20}});
  });
  addEventListener("resize",size);
  size();requestAnimationFrame(frame);
  return{set(m,color){mode=m;ac=color;seed();burst(innerWidth/2,innerHeight/3,40)}};
})();
