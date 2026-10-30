(()=>{
 const video=document.querySelector('#hero-film'),button=document.querySelector('#hero-film-toggle');
 if(!video||!button)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let userPaused=motion.matches,visible=true;
 video.muted=true;video.defaultMuted=true;
 const label=()=>{button.textContent=video.paused?'PLAY FILM':'PAUSE FILM';button.setAttribute('aria-label',video.paused?'Play background film':'Pause background film');};
 const play=()=>{if(document.hidden||!visible||userPaused||document.querySelector('#project-view.open,#approach-view.open'))return;video.play().then(label).catch(label);};
 button.addEventListener('click',()=>{if(video.paused){userPaused=false;video.play().then(label).catch(()=>{button.textContent='RETRY FILM';});}else{userPaused=true;video.pause();}});
 video.addEventListener('play',label);video.addEventListener('pause',label);
 video.addEventListener('error',()=>{button.textContent='RETRY FILM';});
 document.addEventListener('visibilitychange',()=>document.hidden?video.pause():play());
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)play();else video.pause();},{threshold:.05}).observe(document.querySelector('#home'));
 motion.addEventListener('change',e=>{userPaused=e.matches;if(e.matches)video.pause();else play();});
 new MutationObserver(()=>{if(document.querySelector('#project-view.open,#approach-view.open'))video.pause();else play();}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
 label();play();
})();
