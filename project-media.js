// Keep native media controls; show recovery actions only when loading fails.
(()=>{
 const timers=new WeakMap();
 function panel(video){let p=video.parentElement.querySelector('.media-recovery');if(!p){p=document.createElement('div');p.className='media-recovery';p.hidden=true;p.setAttribute('role','status');const message=document.createElement('span'),retry=document.createElement('button'),link=document.createElement('a');retry.type='button';retry.textContent='Retry playback';link.textContent='Open video directly';link.target='_blank';link.rel='noopener';retry.onclick=()=>{p.hidden=true;video.load();video.play().catch(()=>show(video,'Playback could not start. Try opening the video directly.'));};p.append(message,retry,link);video.parentElement.append(p);}p.querySelector('a').href=video.currentSrc||video.querySelector('source')?.src||video.src;return p;}
 function show(v,message){if(v.id==='hero-film')return;let p=panel(v);p.querySelector('span').textContent=message;p.hidden=false;}
 document.addEventListener('waiting',e=>{const v=e.target;if(v.tagName!=='VIDEO'||v.id==='hero-film')return;clearTimeout(timers.get(v));timers.set(v,setTimeout(()=>{if(v.readyState<3)show(v,'The film is taking longer to load. You can retry or open it directly.');},12000));},true);
 document.addEventListener('playing',e=>{if(e.target.tagName!=='VIDEO')return;clearTimeout(timers.get(e.target));const p=e.target.parentElement.querySelector('.media-recovery');if(p)p.hidden=true;},true);
 document.addEventListener('error',e=>{const v=e.target;if(v.tagName==='VIDEO')show(v,'The film could not load. Retry playback or open the video directly.');if(v.tagName==='SOURCE'&&v.parentElement.tagName==='VIDEO')show(v.parentElement,'The film could not load. Retry playback or open the video directly.');},true);
 // Pause a project film when it is replaced or its project is closed.
 document.addEventListener('play',e=>{if(e.target.tagName!=='VIDEO')return;document.querySelectorAll('video').forEach(v=>{if(v!==e.target)v.pause();});},true);
 const view=document.querySelector('#project-view');if(view)new MutationObserver(()=>{if(!view.classList.contains('open'))view.querySelectorAll('video').forEach(v=>v.pause());}).observe(view,{attributes:true,attributeFilter:['class']});
})();
