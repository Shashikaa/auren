const escapeHTML=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export async function setupHeadingReveals(reduced){
 await document.fonts.ready;
 const headings=[...document.querySelectorAll('h2.reveal,h3.reveal')];
 for(const el of headings){
  if(reduced){el.classList.add('visible');continue;}
  const original=el.innerHTML;
  const scrollFill=el.matches('.service-intro h2');
  const build=()=>{
   el.innerHTML=original.split(/<br\s*\/?\s*>/i).map(line=>line.trim().split(/\s+/).map(w=>`<span class="heading-probe">${w}</span>`).join(' ')).join('<br>');
   el.classList.add('heading-reveal');el.classList.remove('reveal');el.style.opacity=1;el.style.transform='none';el.style.filter='none';
   const groups=[];
   [...el.querySelectorAll('.heading-probe')].forEach(w=>{let line=groups.find(g=>Math.abs(g.top-w.offsetTop)<2);if(!line){line={top:w.offsetTop,words:[]};groups.push(line);}line.words.push(w.textContent);});
   const lines=groups.map(g=>g.words.join(' '));
   if(scrollFill){el.innerHTML=lines.map(line=>`<span class="scroll-fill-line">${escapeHTML(line)}</span>`).join('');el.classList.add('scroll-fill-heading');return;}
   el.innerHTML=lines.map(line=>`<span class="rise-line"><span class="rise-line-inner">${[...line].map(c=>c===' '?' ':`<span class="rise-char">${escapeHTML(c)}</span>`).join('')}</span></span>`).join('');
   el.setAttribute('aria-label',lines.join(' '));el.querySelectorAll('.rise-line').forEach(l=>l.setAttribute('aria-hidden','true'));
   el.dataset.revealed='false';
  };
  build();
  if(scrollFill)continue;
  const play=()=>{
   if(el.dataset.revealed==='true')return;el.dataset.revealed='true';
   const chars=[...el.querySelectorAll('.rise-char')],gap=Math.min(25,500/Math.max(chars.length-1,1));
   chars.forEach((c,i)=>c.animate([{transform:'translateY(120%)'},{transform:'translateY(0)'}],{duration:600,delay:i*gap,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'}));
   const fillDelay=(chars.length-1)*gap+390;
   setTimeout(()=>{
    [...el.querySelectorAll('.rise-line-inner')].forEach((line,i)=>{line.textContent=line.textContent;line.classList.add('rise-fill');line.style.animationDelay=`${i*100}ms`;});
   },fillDelay);
  };
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)play();},{threshold:0,rootMargin:'0px 0px -15% 0px'});
  observer.observe(el);
 }
}
