(function(){
"use strict";
var reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
var desktopLayout=window.matchMedia("(min-width: 1024px) and (min-height: 620px)");
var showcases=Array.prototype.slice.call(document.querySelectorAll("[data-sync-showcase]"));
if(!showcases.length)return;
function clamp(v,min,max){return Math.min(max,Math.max(min,v));}
function wrappedDistance(index,position,count){var d=index-position,half=count/2;if(d>half)d-=count;if(d< -half)d+=count;return d;}
function pad(value){return String(value).padStart(2,"0");}
function setup(showcase){
var sticky=showcase.querySelector("[data-listing-sticky]");
var viewport=showcase.querySelector("[data-listing-window]");
var track=showcase.querySelector("[data-listing-track]");
var progressBar=showcase.querySelector("[data-reel-progress]");
var progressIndex=showcase.querySelector("[data-reel-index]");
var mobileRail=showcase.querySelector("[data-mobile-rail]");
if(!sticky||!viewport||!track||!mobileRail)return;
var reelImages=Array.prototype.slice.call(track.querySelectorAll("img[data-sync-key]"));
var sourceImages=Array.prototype.slice.call(mobileRail.querySelectorAll("img[data-img]"));
var mobileCards=Array.prototype.slice.call(mobileRail.querySelectorAll("figure"));
var mobileIndex=showcase.querySelector("[data-mobile-index]");
var previousButton=showcase.querySelector("[data-mobile-prev]");
var nextButton=showcase.querySelector("[data-mobile-next]");
var metrics={start:0,end:1},targetPosition=0,currentPosition=0,frame=0,resizeFrame=0,isNear=false,activeMobile=0,mobileFrame=0;
function syncEnabled(){return desktopLayout.matches&&!reduceMotion.matches&&!document.body.classList.contains("editing");}
function applyRatio(source,clone){
var measured=source.naturalWidth&&source.naturalHeight?source:clone;
if(!measured.naturalWidth||!measured.naturalHeight)return;
var ratio=measured.naturalWidth/measured.naturalHeight>=.88?"square":"portrait";
clone.dataset.ratio=ratio;
var figure=source.closest("figure");if(figure)figure.dataset.ratio=ratio;
}
function syncImage(source){
var key=source.getAttribute("data-img");
var clone=track.querySelector('[data-sync-key="'+key+'"]');
if(!clone)return;
if(clone.getAttribute("src")!==source.getAttribute("src"))clone.setAttribute("src",source.getAttribute("src"));
clone.alt=source.alt||"";
if(source.complete)applyRatio(source,clone);
else source.addEventListener("load",function(){applyRatio(source,clone);scheduleMeasure();},{once:true});
if(clone.complete)applyRatio(source,clone);
else clone.addEventListener("load",function(){applyRatio(source,clone);scheduleMeasure();},{once:true});
}
sourceImages.forEach(function(source){
syncImage(source);
source.addEventListener("load",function(){syncImage(source);scheduleMeasure();});
new MutationObserver(function(){syncImage(source);scheduleMeasure();}).observe(source,{attributes:true,attributeFilter:["src","alt"]});
});
function renderTrack(){
var count=reelImages.length;if(!count)return;
var cardGap=clamp(viewport.clientWidth*.08,18,28);
var heights=reelImages.map(function(image){return viewport.clientWidth*(image.dataset.ratio==="portrait"?4/3:1);});
var centers=[0];
for(var centerIndex=1;centerIndex<count;centerIndex+=1){centers[centerIndex]=centers[centerIndex-1]+(heights[centerIndex-1]+heights[centerIndex])/2+cardGap;}
var circumference=centers[count-1]+(heights[count-1]+heights[0])/2+cardGap;
var baseIndex=clamp(Math.floor(currentPosition),0,count-1);
var nextIndex=Math.min(count-1,baseIndex+1);
var fraction=currentPosition-baseIndex;
var currentCenter=centers[baseIndex]+(centers[nextIndex]-centers[baseIndex])*fraction;
reelImages.forEach(function(image,index){
var distance=wrappedDistance(index,currentPosition,count),depth=Math.abs(distance);
var translateY=centers[index]-currentCenter;
if(translateY>circumference/2)translateY-=circumference;
if(translateY< -circumference/2)translateY+=circumference;
var translateZ=-depth*94,rotateX=clamp(distance*-14,-42,42),scale=1-Math.min(depth*.09,.3),opacity=depth>1.85?0:Math.max(.1,1-depth*.32);
image.style.transform="translate3d(0,calc(-50% + "+translateY.toFixed(2)+"px),"+translateZ.toFixed(2)+"px) rotateX("+rotateX.toFixed(2)+"deg) scale("+scale.toFixed(4)+")";
image.style.opacity=opacity.toFixed(3);image.style.zIndex=String(100-Math.round(depth*12));image.style.visibility=depth>2.1?"hidden":"visible";image.classList.toggle("is-active-card",depth<.42);
});
}
function scrollProgress(){return syncEnabled()?clamp((window.scrollY-metrics.start)/Math.max(1,metrics.end-metrics.start),0,1):0;}
function updateReadout(progress){if(progressBar)progressBar.style.transform="scaleY("+progress.toFixed(4)+")";if(progressIndex)progressIndex.textContent=pad(Math.min(reelImages.length,Math.max(1,Math.round(progress*Math.max(0,reelImages.length-1))+1)));}
function animateTrack(){frame=0;var difference=targetPosition-currentPosition;if(Math.abs(difference)<.001){currentPosition=targetPosition;renderTrack();return;}currentPosition+=difference*.125;renderTrack();frame=requestAnimationFrame(animateTrack);}
function requestTrackUpdate(immediate){if(!syncEnabled()){targetPosition=0;currentPosition=0;renderTrack();updateReadout(0);if(frame){cancelAnimationFrame(frame);frame=0;}return;}var progress=scrollProgress();targetPosition=Math.round(progress*Math.max(0,reelImages.length-1));updateReadout(progress);if(immediate){currentPosition=targetPosition;renderTrack();return;}if(!frame)frame=requestAnimationFrame(animateTrack);}
function measure(){var rect=showcase.getBoundingClientRect(),top=window.scrollY+rect.top,stickyTop=parseFloat(getComputedStyle(sticky).top)||0,stickyHeight=sticky.offsetHeight;metrics.start=top-stickyTop;metrics.end=Math.max(metrics.start+1,top+showcase.offsetHeight-stickyHeight-stickyTop);requestTrackUpdate(true);}
function scheduleMeasure(){if(resizeFrame)return;resizeFrame=requestAnimationFrame(function(){resizeFrame=0;measure();});}
function setMobileIndex(index){activeMobile=clamp(index,0,Math.max(0,mobileCards.length-1));if(mobileIndex)mobileIndex.textContent=pad(activeMobile+1);if(previousButton)previousButton.disabled=activeMobile===0;if(nextButton)nextButton.disabled=activeMobile===mobileCards.length-1;}
function nearestMobileCard(){var railLeft=mobileRail.scrollLeft,closest=0,distance=Infinity;mobileCards.forEach(function(card,index){var d=Math.abs(card.offsetLeft-railLeft);if(d<distance){distance=d;closest=index;}});setMobileIndex(closest);}
function goToMobile(index){if(!mobileCards.length)return;var next=clamp(index,0,mobileCards.length-1);mobileRail.scrollTo({left:mobileCards[next].offsetLeft,behavior:reduceMotion.matches?"auto":"smooth"});setMobileIndex(next);}
window.addEventListener("scroll",function(){if(isNear)requestTrackUpdate(false);},{passive:true});
window.addEventListener("resize",scheduleMeasure,{passive:true});
window.addEventListener("orientationchange",scheduleMeasure,{passive:true});
window.addEventListener("pageshow",scheduleMeasure);
mobileRail.addEventListener("scroll",function(){if(mobileFrame)return;mobileFrame=requestAnimationFrame(function(){mobileFrame=0;nearestMobileCard();});},{passive:true});
mobileRail.addEventListener("keydown",function(e){if(e.key==="ArrowLeft"){e.preventDefault();goToMobile(activeMobile-1);}if(e.key==="ArrowRight"){e.preventDefault();goToMobile(activeMobile+1);}});
if(previousButton)previousButton.addEventListener("click",function(){goToMobile(activeMobile-1);});
if(nextButton)nextButton.addEventListener("click",function(){goToMobile(activeMobile+1);});
if("ResizeObserver" in window){var ro=new ResizeObserver(scheduleMeasure);ro.observe(showcase);ro.observe(sticky);ro.observe(viewport);}
if("IntersectionObserver" in window){new IntersectionObserver(function(entries){entries.forEach(function(entry){isNear=entry.isIntersecting;showcase.classList.toggle("is-near",isNear);if(isNear){reelImages.forEach(function(img){img.loading="eager";});scheduleMeasure();requestTrackUpdate(true);}});},{rootMargin:"1100px 0px"}).observe(showcase);}else{isNear=true;showcase.classList.add("is-near");}
new MutationObserver(scheduleMeasure).observe(document.body,{attributes:true,attributeFilter:["class"]});
setMobileIndex(0);measure();
}
showcases.forEach(setup);
function mediaChange(){window.dispatchEvent(new Event("resize"));}
if(typeof reduceMotion.addEventListener==="function"){reduceMotion.addEventListener("change",mediaChange);desktopLayout.addEventListener("change",mediaChange);}else{reduceMotion.addListener(mediaChange);desktopLayout.addListener(mediaChange);}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(mediaChange);
})();