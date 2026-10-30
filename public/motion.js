const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const stagger=(p,i,n,gap,duration)=>clamp((p*((n-1)*gap+duration)-i*gap)/duration);
const viewportProgress=(top,start,end)=>clamp((start-top)/(start-end));

function splitWords(el){
 const lines=el.innerHTML.split(/<br\s*\/?\s*>/i);
 el.innerHTML=lines.map(line=>line.trim().split(/\s+/).map(word=>`<span class="motion-word">${word}</span>`).join(' ')).join('<br>');
 const words=[...el.querySelectorAll('.motion-word')];
 const measure=()=>{
  const left=Math.min(...words.map(w=>w.offsetLeft)),right=Math.max(...words.map(w=>w.offsetLeft+w.offsetWidth));
  const top=Math.min(...words.map(w=>w.offsetTop)),bottom=Math.max(...words.map(w=>w.offsetTop+w.offsetHeight));
  words.forEach(w=>w.style.transformOrigin=`${(left+right)/2-w.offsetLeft}px ${(top+bottom)/2-w.offsetTop}px`);
 };
 document.fonts.ready.then(measure);addEventListener('resize',measure);measure();return words;
}

// Smooth the document itself, so masks and text share exactly the same scroll position.
function wheelSmoothing(enabled){
 let target=scrollY,current=scrollY,previous=scrollY,active=false;
 addEventListener('wheel',e=>{
  if(!enabled||e.ctrlKey||document.body.classList.contains('locked')||e.target.closest('dialog,[data-native-scroll]'))return;
  const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
  if(Math.abs(e.deltaX)>Math.abs(delta))return;
  e.preventDefault();if(!active)target=current=scrollY;
  target=clamp(target+delta,0,document.documentElement.scrollHeight-innerHeight);active=true;
 },{passive:false});
 addEventListener('keydown',e=>{if(['Home','End','PageUp','PageDown','ArrowUp','ArrowDown',' '].includes(e.key))active=false;});
 return timeDelta=>{
  if(!active){previous=scrollY;return;}
  if(document.body.classList.contains('locked')||Math.abs(scrollY-previous)>3){active=false;previous=scrollY;return;}
  const alpha=1-Math.exp(-timeDelta/95);current=lerp(current,target,alpha);
  if(Math.abs(current-target)<.2){current=target;active=false;}
  window.scrollTo({top:current,behavior:'instant'});previous=scrollY;
 };
}

export function createMotion({reduced,desktop,heroVideo,introVideo,scrubVideo,heroDepth,footerDepth,finishHero}){
 const track=$('.hero-track'),heroTitle=$('.hero-title'),introHeading=$('.intro-heading'),aperture=$('.aperture');
 const heroWords=splitWords($('.hero-title h1')),introWords=splitWords($('.intro-heading h2'));
 const heroFallback=$('.hero-fallback'),heroCanvas=$('#hero-depth'),heroDescription=$('.hero-title p');
 const gallery=$$('.image-trail img'),trailLayer=$('.image-trail');
 const principles=$('.principles'),principleArticles=$$('.principle-copy article'),principlePictures=$$('.principle-images picture'),principleBackgrounds=$$('.bg-sticky img');
 const services=$('.services'),serviceLayout=$('.service-layout'),serviceArticles=$$('.service'),servicePictures=$$('.service-visual'),mobileImages=$$('.service-mobile-visual img');
 const ordinary=$('.ordinary-track'),ordinaryTitle=$('.ordinary-word'),cars=$$('.top-cars img'),carStage=$('.top-cars'),ends=$('.ends-here');
 const smoothWheel=wheelSmoothing(desktop&&!reduced);
 let previousTime=performance.now(),enteredAt=0,trailActive=false,trailIndex=0,lastPointer={x:0,y:0};
 const trail=new Map();
 const hideTrail=im=>{
  if(!trail.has(im))return;trail.delete(im);im.getAnimations().forEach(a=>a.cancel());
  im.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.2)'}],{duration:800,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});
 };
 addEventListener('pointermove',e=>{
  if(!trailActive||e.pointerType!=='mouse'||!gallery.length)return;
  if(Math.hypot(e.clientX-lastPointer.x,e.clientY-lastPointer.y)<innerWidth/15)return;
  const im=gallery[trailIndex%gallery.length],rect=trailLayer.getBoundingClientRect();
  im.getAnimations().forEach(a=>a.cancel());im.style.left=`${e.clientX-rect.left-108}px`;im.style.top=`${e.clientY-rect.top-135}px`;im.style.zIndex=String(trailIndex);im.style.visibility='visible';
  im.animate([{opacity:0,transform:'scale(.8)'},{opacity:1,transform:'scale(1)'}],{duration:200,easing:'ease-out',fill:'forwards'});
  trail.set(im,performance.now());if(trail.size>5)hideTrail(trail.keys().next().value);
  trailIndex++;lastPointer={x:e.clientX,y:e.clientY};
 },{passive:true});

 return {render(time,state){
  const delta=Math.min(50,time-previousTime);previousTime=time;smoothWheel(delta);
  const vh=innerHeight,y=scrollY,p=clamp((y-track.offsetTop)/vh,0,3.5);
  if(state.entered&&!enteredAt)enteredAt=time;
  if(state.entered&&p>.003&&!state.heroComplete)finishHero();
  const intro=clamp(p/(7/6)); // 2 / 2.4 of the 1.4 viewport scroll track.
  const outro=clamp((intro-.5)/.5),ap=clamp(p-1.4);
  const titleProgress=clamp(p/.6);
  heroTitle.style.opacity='1';heroTitle.style.transform='none';heroTitle.style.filter='none';
  heroWords.forEach((word,i)=>{
   if(reduced){word.style.opacity='1';word.style.transform='none';return;}
   const out=Math.pow(stagger(titleProgress,heroWords.length-1-i,heroWords.length,.083,.667),3);
   const opening=state.entered?clamp(((time-enteredAt)/1000-.75-i*.15)/.8):0;
   const grow=1-Math.pow(1-opening,3);
   const reveal=p>.003?1:grow;
   word.style.opacity=String(reveal*(1-out));word.style.transform=`scale(${reveal*(1+out)})`;word.style.filter=`blur(${8*(1-reveal+out)}px)`;
  });
  const descOut=Math.pow(titleProgress,3);heroDescription.style.opacity=String(1-descOut);heroDescription.style.filter=`blur(${descOut*8}px)`;
  const scrubbing=p>.001;
  heroVideo.style.visibility=state.heroComplete||scrubbing?'hidden':'visible';
  heroFallback.style.opacity=scrubbing?'0':'1';heroCanvas.style.opacity=!scrubbing&&state.heroComplete&&desktop&&!reduced?'1':'0';
  introVideo.style.opacity=scrubbing?String(1-outro):'0';
  scrubVideo(reduced?0:intro);$('.intro-carbon').style.opacity='0';
  introHeading.style.opacity=String(1-clamp(ap/.7));introHeading.style.filter=`blur(${12*clamp(ap/.7)}px)`;introHeading.style.transform='none';
  introWords.forEach((word,i)=>{const t=reduced?1:stagger(outro,i,introWords.length,.15,.8);word.style.opacity=String(t);word.style.transform=`scale(${t})`;word.style.filter=`blur(${(1-t)*8}px)`;});
  const pointerTrail=desktop&&!reduced&&!state.menuOpen&&outro>=.95&&ap<.7;
  if(trailActive&&!pointerTrail)for(const im of [...trail.keys()])hideTrail(im);trailActive=pointerTrail;
  for(const [im,timestamp] of trail)if(time-timestamp>350)hideTrail(im);
  aperture.style.clipPath=`inset(${(1-ap)*50}% ${(1-ap)*50}%)`;aperture.style.transform=`scale(${1+(1-ap)*.2})`;
  aperture.querySelector('h2').style.opacity='1';aperture.querySelector('h2').style.transform='none';
  aperture.querySelector('img').style.transform=`scale(1.1) translateY(${ap*2}%)`;
  document.body.classList.toggle('scrolled',y>50);
  $('.page-progress span').style.transform=`scaleX(${clamp(y/(document.documentElement.scrollHeight-vh))})`;

  // Each USP expands from a central rectangle; the earlier background fades away.
  const principleRect=principles.getBoundingClientRect();
  if(desktop){
   const entry=clamp((vh-principleRect.top)/vh),exit=clamp((vh-principleRect.bottom)/vh);
   $('.principle-images').style.transform=`translateY(${(-25*(1-entry)+25*exit)*vh/100}px)`;
   principleArticles.forEach((article,i)=>{
    const r=article.getBoundingClientRect(),reveal=clamp((vh-r.top)/vh),fade=clamp((vh-r.bottom)/vh);
    principlePictures[i].style.clipPath=i===0?'inset(0)':`inset(${(1-reveal)*50}%)`;
    const background=principleBackgrounds[i];background.style.zIndex=String(principleArticles.length-i);background.style.opacity=String(.4*(i===principleArticles.length-1?1:1-fade));
    const drift=i===0?-50*(1-reveal):i===principleArticles.length-1?50*fade:0;background.style.transform=`translateY(${drift}%)`;
   });
  }else{
   $$('.principle-mobile-photo').forEach(im=>{const r=im.parentElement.getBoundingClientRect();const t=clamp((vh-r.top)/(vh+r.height/2));im.style.transform=`scale(${lerp(1.5,1,t)})`;});
  }

  const serviceIntro=$('.service-intro'),sir=serviceIntro.getBoundingClientRect();
  const scrollHeading=$('.scroll-fill-heading');
  if(scrollHeading){const r=scrollHeading.getBoundingClientRect(),progress=clamp((vh-r.top)/(r.height+vh*.5)),lines=[...scrollHeading.querySelectorAll('.scroll-fill-line')];lines.forEach((line,i)=>{const t=reduced?1:stagger(progress,i,lines.length,.1,1);line.style.backgroundPosition=`${100*(1-t)}% 0`;});}
  const photo=$('.detail-photo'),photoImage=$('.detail-photo img');
  if(desktop){const t=clamp((vh-sir.top)/(vh+sir.height));photo.style.transform=`translateY(${lerp(50,-50,t)}%)`;photoImage.style.transform=`translateY(${lerp(-50,50,t)}%)`;}else{photo.style.transform='none';photoImage.style.transform='none';}
  const pointerStrength=1-Math.pow(clamp(p/.14),2)*(3-2*clamp(p/.14));
  $('.hero-scene').style.transform=desktop&&!reduced&&state.entered?`perspective(1200px) translate3d(${state.pointerX*.6*pointerStrength}%,${state.pointerY*.6*pointerStrength}%,0) rotateY(${-state.pointerX*.5*pointerStrength}deg) rotateX(${state.pointerY*.5*pointerStrength}deg) scale(${1+.025*pointerStrength})`:'none';
  // The stationary image viewport is the crucial service transition.
  const sr=services.getBoundingClientRect();
  if(desktop){
   const entry=clamp((vh*1.5-sr.top)/(vh*1.5)),exit=clamp((vh-sr.bottom)/vh);
   serviceLayout.style.setProperty('--service-lift',`${(-.5*(1-entry)+.5*exit)*vh}px`);
   serviceArticles.forEach((article,i)=>{
    const r=article.getBoundingClientRect();
    const mask=clamp((vh-r.top)/vh),zoom=clamp((vh-r.top)/(2*vh));
    servicePictures[i].style.clipPath=i===0?'inset(0)':`inset(${100*(1-mask)}% 0 0)`;
    servicePictures[i].firstElementChild.style.transform=`scale(${lerp(1.2,1,zoom)})`;
    article.querySelector('.service-copy').style.opacity=String(1-clamp((-r.top-vh*.2)/(vh*.8)));
   });
  }else{
   serviceLayout.style.removeProperty('--service-lift');
   mobileImages.forEach(im=>{const r=im.parentElement.getBoundingClientRect(),t=clamp((vh-r.top)/(vh+r.height));im.style.transform=`scale(1.2) translateY(${lerp(-25,25,t)}%)`;});
  }

  // The vehicle chapter scrolls naturally; side cars have independent parallax.
  const or=ordinary.getBoundingClientRect(),cr=carStage.getBoundingClientRect(),er=ends.getBoundingClientRect();
  const patternP=clamp((vh-or.top)/(vh+or.height));$('.ordinary-pattern').style.transform=`translateY(${lerp(-10,20,patternP)}%)`;
  const titleFade=clamp(-or.top/(or.height*.5));ordinaryTitle.style.opacity=String(1-titleFade);ordinaryTitle.style.transform=`scale(${lerp(1,.75,titleFade)})`;
  if(desktop){
   const left=clamp((vh-cr.top)/(vh+cr.height*.5)),right=clamp((vh-cr.top)/(vh+cr.height));
   cars[0].style.transform=`translateY(${-55*left}%)`;cars[2].style.transform=`translateY(${-50*right}%)`;
   const endEntry=clamp((1.5*vh-er.top)/(er.height*.5+.9*vh));ends.style.transform=`translateY(${lerp(-.5*vh,0,endEntry)}px) scale(${lerp(.75,1,endEntry)})`;
  }else{ends.style.transform='none';}
  $$('.collection-image').forEach(el=>{const r=el.parentElement.getBoundingClientRect();if(r.top<vh&&r.bottom>0){const t=clamp((vh-r.top)/(vh+r.height)),exit=clamp((vh-r.bottom)/vh),amount=desktop?50:25;el.style.transform=`translateY(${lerp(-amount,amount,t)}%)`;el.parentElement.querySelector('.collection-copy').style.transform=`translateY(${-50*exit}%)`;}});
  if(state.entered&&state.heroComplete&&p<.15&&!reduced&&desktop)heroDepth.draw(time,state.pointerX,state.pointerY);
  const footerRect=$('.final-cta').getBoundingClientRect();
  const footerScroll=clamp((vh-footerRect.top)/(vh+footerRect.height))*2-1;
  const footerEntry=clamp((vh-footerRect.top)/vh),footerOpacity=clamp((vh-footerRect.top)/(footerRect.height*.5));
  $('.final-scene').style.transform=`scale(${lerp(1.5,1,footerEntry)})`;$('.final-scene').style.opacity=String(footerOpacity);
  const localY=((state.pointerY+1)*.5*vh-footerRect.top)/footerRect.height*2-1;
  footerDepth.spotTarget=desktop&&state.pointerSeen&&!state.menuOpen&&Math.abs(localY)<=1?1:0;
  footerDepth.draw(time,desktop?state.pointerX:0,desktop?localY:footerScroll);
 }};
}
