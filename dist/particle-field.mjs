import {SHAPE_COUNT,SHAPE_GLSL,SHAPE_MIX_GLSL} from './particle-shapes.mjs';
// Local WebGL point renderer: no graphics library or remote assets required.
const vertex=`
precision highp float;
attribute vec3 a_position;
attribute float a_seed;
uniform vec2 u_view;
uniform vec2 u_rotation;
uniform vec3 u_pointer;
uniform float u_radius,u_time,u_morph,u_burst,u_ratio;
uniform float u_weights[${SHAPE_COUNT}];
varying float v_alpha,v_tint;
${SHAPE_GLSL}
void main(){
 vec3 p=a_position; float seed=a_seed,t=u_time;
 float az=atan(p.z,p.x),lat=asin(p.y);
 float wave=sin(lat*9.+az*3.+t)*.045+cos(az*5.-lat*7.-t*.7)*.025;
 vec3 shell=p*(.93+seed*.07+wave);
 vec3 target=vec3(0.);
 ${SHAPE_MIX_GLSL}
 p=mix(shell,target,u_morph);
 float band=pow(.5+.5*sin(lat*18.+az*3.-t*1.3),12.);
 float strand=pow(.5+.5*sin(az*3.+lat*11.+t*.9),30.);
 float flash=sin(length(p)*9.-u_burst*9.)*.035*u_burst;
 p*=1.+flash;
 float cy=cos(u_rotation.x),sy=sin(u_rotation.x),cp=cos(u_rotation.y),sp=sin(u_rotation.y);
 p=vec3(p.x*cy+p.z*sy,p.y,p.z*cy-p.x*sy);
 p=vec3(p.x,p.y*cp-p.z*sp,p.y*sp+p.z*cp);
 float depth=3.7/(3.7-p.z);vec2 screen=p.xy*u_radius*depth;
 vec2 delta=u_pointer.xy-screen;float field=exp(-dot(delta,delta)/(u_radius*u_radius*.42));
 screen+=u_pointer.z*field*(delta*.30+vec2(-delta.y,delta.x)*.13);
 screen*=1.-u_burst*.13;
 gl_Position=vec4(screen/u_view*2.*vec2(1.,-1.),0.,1.);
 float front=clamp((p.z+1.3)/2.6,0.,1.);
 float sparkle=step(.985,seed);
 gl_PointSize=(1.65+band*.8+strand*.6+sparkle*2.6)*depth*u_ratio;
 v_alpha=(.18+front*.36+band*.38+strand*.28+sparkle*.24)*(1.+u_burst*.7);
 v_tint=front*.6+band*.3+sparkle*.2;
}`;
const fragment=`
precision mediump float;
varying float v_alpha,v_tint;
void main(){vec2 p=gl_PointCoord*2.-1.;float r=dot(p,p);if(r>1.)discard;
float light=exp(-r*3.8);vec3 color=mix(vec3(.51,.23,.83),vec3(.93,.76,1.),clamp(v_tint,0.,1.));
gl_FragColor=vec4(color,light*v_alpha);}`;
export class ParticleField{
 constructor(stage,{mobile=false,onRestore}={}){this.stage=stage;this.mobile=mobile;this.onRestore=onRestore;this.canvas=document.createElement('canvas');this.canvas.className='particle-field';this.canvas.setAttribute('aria-hidden','true');stage.prepend(this.canvas);this.lost=e=>{e.preventDefault();this.available=false;this.stage.dataset.renderer='canvas';this.onRestore?.()};this.restored=()=>{this.init();this.onRestore?.()};this.canvas.addEventListener('webglcontextlost',this.lost);this.canvas.addEventListener('webglcontextrestored',this.restored);this.init()}
 init(){try{const gl=this.canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,depth:false,preserveDrawingBuffer:false});if(!gl)throw Error('WebGL unavailable');this.gl=gl;const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw Error('Particle shader unavailable')}return shader};const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment),program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Particle renderer unavailable');this.program=program;gl.useProgram(program);this.count=this.mobile?12000:32000;const data=new Float32Array(this.count*4),gold=Math.PI*(3-Math.sqrt(5));for(let i=0;i<this.count;i++){const seed=((i*16807+137)%65521)/65521,y=1-2*(i+.5)/this.count,az=i*gold+Math.sin(i*17.7)*.013,r=Math.sqrt(1-y*y);data.set([Math.cos(az)*r,y,Math.sin(az)*r,seed],i*4)}this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);for(const [name,size,offset]of [['a_position',3,0],['a_seed',1,12]]){const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,16,offset)}this.uniforms=Object.fromEntries(['view','rotation','pointer','radius','time','morph','weights','burst','ratio'].map(k=>[k,gl.getUniformLocation(program,k==='weights'?'u_weights[0]':'u_'+k)]));gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE,gl.ONE,gl.ONE);this.available=true;this.stage.dataset.renderer='webgl';this.stage.dataset.particles=String(this.count)}catch{this.available=false;this.stage.dataset.renderer='canvas'}}
 draw({width,height,ratio,radius,yaw,pitch,time,pointer,morph,weights,burst}){if(!this.available)return false;const gl=this.gl,u=this.uniforms;if(this.canvas.width!==Math.round(width*ratio)||this.canvas.height!==Math.round(height*ratio)){this.canvas.width=Math.round(width*ratio);this.canvas.height=Math.round(height*ratio)}gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(this.program);gl.uniform2f(u.view,width,height);gl.uniform2f(u.rotation,yaw,pitch);gl.uniform1fv(u.weights,weights);gl.uniform3f(u.pointer,pointer.x-width/2,pointer.y-height/2,pointer.strength);for(const [key,value]of Object.entries({radius,time,morph,burst,ratio}))gl.uniform1f(u[key],value);gl.drawArrays(gl.POINTS,0,this.count);return true}
 destroy(){this.canvas.removeEventListener('webglcontextlost',this.lost);this.canvas.removeEventListener('webglcontextrestored',this.restored);if(this.gl){this.gl.deleteBuffer(this.buffer);this.gl.deleteProgram(this.program);this.gl.getExtension('WEBGL_lose_context')?.loseContext()}this.canvas.remove();this.available=false}
}
