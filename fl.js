/* free photo layout: positions in % of container width. pos[path]={x,y,r} (r = height/width) */
(function(g){
var G=2,SW={s:32,m:49,l:66,f:100};
function W(z){return SW[z]||SW.m}
function ov(a,b){return a.x<b.x+b.w+G-.01&&b.x<a.x+a.w+G-.01&&a.y<b.y+b.h+G-.01&&b.y<a.y+a.h+G-.01}
/* push others out of the way of item f (index); items: [{x,y,w,h}] mutated */
function resolve(it,f){
 for(var k=0;k<400;k++){var mv=false;
  for(var i=0;i<it.length;i++)for(var j=0;j<it.length;j++){if(i===j)continue;var a=it[i],b=it[j];if(!ov(a,b))continue;
   /* a pushes b if a is fixed, or a is above/left (and b isn't fixed) */
   if(j===f)continue;if(i!==f&&(a.y>b.y||(a.y===b.y&&(a.x>b.x||(a.x===b.x&&i>j)))))continue;
   var o=[],r=a.x+a.w+G-b.x,l=b.x+b.w+G-a.x,d=a.y+a.h+G-b.y,u=b.y+b.h+G-a.y;
   if(b.x+r+b.w<=100.01)o.push([r,'x',r]);if(b.x-l>=-.01)o.push([l,'x',-l]);o.push([d*1.15,'y',d]);if(b.y-u>=-.01)o.push([u*1.3,'y',-u]);
   o.sort(function(p,q){return p[0]-q[0]});b[o[0][1]]+=o[0][2];b.x=Math.max(0,Math.min(100-b.w,b.x));b.y=Math.max(0,b.y);mv=true}
  if(!mv)break}
 return it}
/* float items upward to close gaps (gentle gravity, keeps x) except fixed f */
function lift(it,f){var ord=it.map(function(_,i){return i}).sort(function(a,b){return it[a].y-it[b].y});
 ord.forEach(function(i){if(i===f)return;var b=it[i];for(var s=0;s<200;s++){var t={x:b.x,y:b.y-1,w:b.w,h:b.h};if(t.y<0)break;if(it.some(function(c,j){return j!==i&&ov(t,c)}))break;b.y=t.y}});return it}
function height(it){return it.reduce(function(m,b){return Math.max(m,b.y+b.h)},0)}
g.FL={G:G,W:W,ov:ov,resolve:resolve,lift:lift,height:height};
})(window);
