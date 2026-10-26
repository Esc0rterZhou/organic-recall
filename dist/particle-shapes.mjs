export const SHAPE_COUNT=10;
export const SHAPE_NAMES=['torus','double-helix','orbital-lobes','vortex','trefoil','ribbon','crystal-cage','crown','rosette','spiral-disc'];
export function oneHotShape(shape){return Array.from({length:SHAPE_COUNT},(_,i)=>i===shape-1?1:0)}
const smooth=t=>t*t*t*(t*(t*6-15)+10);
// Travel through a loose shell at mid-transition so dissimilar forms do not collapse.
export function advanceShape(state,target,dt,strength,{reduced=false}={}){
 if(reduced){state.target=target;state.weights=oneHotShape(target);state.morph=strength;state.strength=strength;state.elapsed=760;return state}
 if(state.target!==target){state.target=target;state.from=[...state.weights];state.fromMorph=state.morph;state.elapsed=0}
 state.elapsed=Math.min(760,(state.elapsed||0)+Math.max(0,Math.min(dt,50)));
 state.strength=(state.strength??strength)+(strength-(state.strength??strength))*(1-Math.exp(-Math.min(dt,50)/190));
 const progress=state.elapsed/760,ease=smooth(progress),goal=oneHotShape(target),level=state.strength;
 state.weights=state.from?state.from.map((v,i)=>v*(1-ease)+goal[i]*ease):goal;
 if(progress<1){const bridge=Math.sin(Math.PI*progress)**2,base=(state.fromMorph??level)*(1-ease)+level*ease;state.morph=base*(1-.78*bridge)}
 else state.morph+=(level-state.morph)*(1-Math.exp(-Math.min(dt,50)/190));
 return state;
}
export function sampleShape(p,time,shape,index=0){
 const [x,y,z]=p,u=Math.atan2(z,x),v=Math.PI*y,seed=((index*16807+137)%65521)/65521,t=time;
 if(shape===1){const r=.69+.21*Math.cos(v);return [r*Math.cos(u),.26*Math.sin(v),r*Math.sin(u)]}
 if(shape===2){const a=y*3.9+t*.17+(seed<.5?0:Math.PI);return [.50*Math.cos(a)+.10*Math.cos(u),y*1.02+.06*Math.sin(u),.50*Math.sin(a)+.10*Math.sin(u)]}
 if(shape===3){const r=.30+.74*Math.abs(y);return [x*r,y*1.08,z*r]}
 if(shape===4){const a=u+y*3.8+t*.16,r=.28+.68*Math.sqrt(Math.max(0,1-y*y));return [Math.cos(a)*r,y*(.88+.14*Math.sin(u*2+t)),Math.sin(a)*r]}
 if(shape===5)return [(Math.sin(u)+2*Math.sin(2*u))/3+.09*Math.cos(v)*Math.cos(u),(Math.cos(u)-2*Math.cos(2*u))/3+.09*Math.sin(v),-Math.sin(3*u)/3+.09*Math.cos(v)*Math.sin(u)];
 if(shape===6){const r=.69+y*.25*Math.cos(u/2);return [r*Math.cos(u),y*.40*Math.sin(u/2),r*Math.sin(u)]}
 if(shape===7){const s=.69/Math.max(Math.abs(x),Math.abs(y),Math.abs(z),.001),pulse=1+.022*Math.sin(y*8+u*3+t);return [x*s*pulse,y*s*pulse,z*s*pulse]}
 if(shape===8){const r=.64+.18*Math.cos(v);return [r*Math.cos(u),.18*Math.sin(v)+.25*Math.cos(u*5+t*.12),r*Math.sin(u)]}
 if(shape===9){const r=.78+.22*Math.cos(u*5+t*.10)*Math.cos(Math.asin(Math.max(-1,Math.min(1,y)))*3);return [x*r,y*r,z*r]}
 const r=Math.sqrt((y+1)/2)*.98,a=u+r*4+t*.13;return [Math.cos(a)*r,.12*Math.sin(a*3+r*6)*(1-r*.4),Math.sin(a)*r];
}
export const SHAPE_GLSL=`
vec3 shape1(vec3 p,float u,float v,float seed,float t){float r=.69+.21*cos(v);return vec3(r*cos(u),.26*sin(v),r*sin(u));}
vec3 shape2(vec3 p,float u,float v,float seed,float t){float a=p.y*3.9+t*.17+(seed<.5?0.:3.14159265);return vec3(.50*cos(a)+.10*cos(u),p.y*1.02+.06*sin(u),.50*sin(a)+.10*sin(u));}
vec3 shape3(vec3 p,float u,float v,float seed,float t){float r=.30+.74*abs(p.y);return vec3(p.x*r,p.y*1.08,p.z*r);}
vec3 shape4(vec3 p,float u,float v,float seed,float t){float a=u+p.y*3.8+t*.16,r=.28+.68*sqrt(max(0.,1.-p.y*p.y));return vec3(cos(a)*r,p.y*(.88+.14*sin(u*2.+t)),sin(a)*r);}
vec3 shape5(vec3 p,float u,float v,float seed,float t){return vec3((sin(u)+2.*sin(2.*u))/3.+.09*cos(v)*cos(u),(cos(u)-2.*cos(2.*u))/3.+.09*sin(v),-sin(3.*u)/3.+.09*cos(v)*sin(u));}
vec3 shape6(vec3 p,float u,float v,float seed,float t){float r=.69+p.y*.25*cos(u/2.);return vec3(r*cos(u),p.y*.40*sin(u/2.),r*sin(u));}
vec3 shape7(vec3 p,float u,float v,float seed,float t){float s=.69/max(max(abs(p.x),abs(p.y)),max(abs(p.z),.001)),pulse=1.+.022*sin(p.y*8.+u*3.+t);return p*s*pulse;}
vec3 shape8(vec3 p,float u,float v,float seed,float t){float r=.64+.18*cos(v);return vec3(r*cos(u),.18*sin(v)+.25*cos(u*5.+t*.12),r*sin(u));}
vec3 shape9(vec3 p,float u,float v,float seed,float t){float r=.78+.22*cos(u*5.+t*.10)*cos(asin(clamp(p.y,-1.,1.))*3.);return p*r;}
vec3 shape10(vec3 p,float u,float v,float seed,float t){float r=sqrt((p.y+1.)/2.)*.98,a=u+r*4.+t*.13;return vec3(cos(a)*r,.12*sin(a*3.+r*6.)*(1.-r*.4),sin(a)*r);}
`;
export const SHAPE_MIX_GLSL=Array.from({length:SHAPE_COUNT},(_,i)=>`if(u_weights[${i}]>0.00001)target+=shape${i+1}(p,az,3.14159265*p.y,seed,t)*u_weights[${i}];`).join('\n');
