// Representative structural models, not quantum-orbital simulations.
const acid={name:['Acetic acid','乙酸','Acide acétique'],formula:'CH3COOH',atoms:[['CH3',-.65,.2,0],['C',0,-.12,0],['O',.03,-.72,.02],['OH',.64,.25,.04]],bonds:[[0,1,1],[1,2,2],[1,3,1]]};
const ethanol={name:['Ethanol','乙醇','Éthanol'],formula:'CH3CH2OH',atoms:[['CH3',-.65,.23,-.05],['CH2',0,-.2,.04],['OH',.64,.24,0]],bonds:[[0,1,1],[1,2,1]]};
const alkene={name:['Ethene','乙烯','Éthène'],formula:'CH2=CH2',atoms:[['CH2',-.4,0,0],['CH2',.4,0,0]],bonds:[[0,1,2]]};
const alkyne={name:['Ethyne','乙炔','Éthyne'],formula:'HC≡CH',atoms:[['CH',-.4,0,0],['CH',.4,0,0]],bonds:[[0,1,3]]};
const ketone={name:['Acetone','丙酮','Acétone'],formula:'CH3COCH3',atoms:[['CH3',-.65,.23,0],['C',0,-.1,0],['O',0,-.72,0],['CH3',.65,.23,0]],bonds:[[0,1,1],[1,2,2],[1,3,1]]};
const glycine={name:['Glycine','甘氨酸','Glycine'],formula:'NH2CH2COOH',atoms:[['NH2',-.8,.25,0],['CH2',-.3,-.16,.06],['C',.27,.18,0],['O',.3,.78,0],['OH',.85,-.18,0]],bonds:[[0,1,1],[1,2,1],[2,3,2],[2,4,1]]};
const ring={name:['Benzene','苯','Benzène'],formula:'C6H6',atoms:Array.from({length:6},(_,i)=>['CH',Math.cos(i*Math.PI/3)*.72,Math.sin(i*Math.PI/3)*.72,0]),bonds:Array.from({length:6},(_,i)=>[i,(i+1)%6,i%2?1:2])};
const methane={name:['Methane','甲烷','Méthane'],formula:'CH4',atoms:[['C',0,0,0],['H',-.65,-.38,.35],['H',.65,-.38,.35],['H',0,.65,.35],['H',0,0,-.85]],bonds:[[0,1,1],[0,2,1],[0,3,1],[0,4,1]]};
const haloalkane={name:['Bromoethane','溴乙烷','Bromoéthane'],formula:'CH3CH2Br',atoms:[['CH3',-.65,.2,0],['CH2',0,-.2,.05],['Br',.65,.2,0]],bonds:[[0,1,1],[1,2,1]]};
const pyridine={...ring,name:['Pyridine','吡啶','Pyridine'],formula:'C5H5N',atoms:ring.atoms.map((a,i)=>i===0?['N',...a.slice(1)]:[...a])};
const sugar={name:['Glyceraldehyde','甘油醛','Glycéraldéhyde'],formula:'C3H6O3',atoms:[['CHO',-.65,.2,0],['CH',0,-.2,0],['OH',0,-.8,.1],['CH2OH',.7,.2,0]],bonds:[[0,1,1],[1,2,1],[1,3,1]]};
const butane={name:['Butane','丁烷','Butane'],formula:'C4H10',atoms:[['CH3',-.85,.2,0],['CH2',-.28,-.2,.1],['CH2',.28,.2,-.1],['CH3',.85,-.2,0]],bonds:[[0,1,1],[1,2,1],[2,3,1]]};
const cyclohexane={name:['Cyclohexane','环己烷','Cyclohexane'],formula:'C6H12',atoms:Array.from({length:6},(_,i)=>['CH2',Math.cos(i*Math.PI/3)*.72,Math.sin(i*Math.PI/3)*.55,i%2?.16:-.16]),bonds:Array.from({length:6},(_,i)=>[i,(i+1)%6,1])};
const chiral={...methane,name:['Bromochlorofluoromethane','溴氯氟甲烷','Bromochlorofluorométhane'],formula:'CHBrClF',atoms:methane.atoms.map((a,i)=>[['C','Br','Cl','F','H'][i],...a.slice(1)])};
const ester={name:['Methyl acetate','乙酸甲酯','Acétate de méthyle'],formula:'CH3COOCH3',atoms:[['CH3',-.75,.2,0],['C',-.2,-.2,0],['O',-.2,-.8,0],['O',.35,.2,0],['CH3',.9,-.2,0]],bonds:[[0,1,1],[1,2,2],[1,3,1],[3,4,1]]};
const amine={name:['Methylamine','甲胺','Méthylamine'],formula:'CH3NH2',atoms:[['CH3',-.4,0,0],['NH2',.4,0,0]],bonds:[[0,1,1]]};
const toluene={...ring,name:['Toluene','甲苯','Toluène'],formula:'C6H5CH3',atoms:[...ring.atoms.map((a,i)=>i===0?['C',...a.slice(1)]:[...a]),['CH3',1.3,0,0]],bonds:[...ring.bonds,[0,6,1]]};
export function chapterMolecule(id){if(+id===1)return methane;if(+id===2)return acid;if(+id===3)return butane;if(+id===4)return cyclohexane;if(+id===5)return chiral;if([6,7].includes(+id))return haloalkane;if([8,9,10].includes(+id))return ethanol;if(+id===24)return sugar;if(+id===25)return pyridine;if([11,12].includes(+id))return alkene;if(+id===13)return alkyne;if([14,15].includes(+id))return ring;if([16,22].includes(+id))return toluene;if([17,18].includes(+id))return ketone;if(+id===19)return acid;if([20,23].includes(+id))return ester;if(+id===21)return amine;if(+id===26)return glycine;return ring}
// Expand condensed carbon groups before rendering a true skeletal formula.
export function skeletalModel(model){
 if(model.formula==='CH4')return {atoms:[['CH4',0,0,0]],bonds:[]};
 const atoms=model.atoms.map(a=>[...a]),bonds=model.bonds.map(b=>[...b]);
 for(let i=0;i<model.atoms.length;i++){const [label,x,y,z]=atoms[i];
  if(label==='CHO'){atoms[i][0]='C';atoms.push(['O',x-.1,y+.65,z]);bonds.push([i,atoms.length-1,2])}
  else if(label==='CH2OH'){atoms[i][0]='C';atoms.push(['OH',x+.52,y-.40,z]);bonds.push([i,atoms.length-1,1])}
  else if(/^CH[0-3]?$/.test(label))atoms[i][0]='C';
 }
 return {atoms,bonds};
}
export function skeletalLabel(label){return label==='C'?'':label}
function textParts(label){return label.match(/[A-Za-z]+|[0-9]+|[^A-Za-z0-9]/g)||[]}
function textWidth(ctx,label,font){let w=0;for(const part of textParts(label)){ctx.font=`500 ${/^[0-9]+$/.test(part)?font*.70:font}px system-ui`;w+=ctx.measureText(part).width}return w}
function drawLabel(ctx,label,x,y,font){const parts=textParts(label),width=textWidth(ctx,label,font);let px=x-width/2;ctx.textAlign='left';ctx.textBaseline='middle';ctx.lineWidth=5;ctx.strokeStyle='#150b22';ctx.lineJoin='round';for(const part of parts){const sub=/^[0-9]+$/.test(part),fy=y+(sub?font*.26:0);ctx.font=`500 ${sub?font*.70:font}px system-ui`;ctx.strokeText(part,px,fy);ctx.fillText(part,px,fy);px+=ctx.measureText(part).width}}
export function drawMolecule(ctx,model,project,radius){
 const skeleton=skeletalModel(model),points=skeleton.atoms.map(([,x,y,z])=>project([x*.69,y*.69,z*.69])),font=Math.max(14,Math.min(22,radius*.094));ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 const centre={x:points.reduce((s,p)=>s+p.x,0)/points.length,y:points.reduce((s,p)=>s+p.y,0)/points.length},ring=skeleton.atoms.length>=6&&skeleton.bonds.length>=skeleton.atoms.length;
 for(const [a,b,order]of skeleton.bonds){const p=points[a],q=points[b],dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,ox=-uy,oy=ux,labelA=skeletalLabel(skeleton.atoms[a][0]),labelB=skeletalLabel(skeleton.atoms[b][0]);
  const trimA=labelA?Math.min(len*.33,Math.max(font*.45,textWidth(ctx,labelA,font)*Math.abs(ux)/2)+5):0,trimB=labelB?Math.min(len*.33,Math.max(font*.45,textWidth(ctx,labelB,font)*Math.abs(ux)/2)+5):0;
  const inward=(centre.x-(p.x+q.x)/2)*ox+(centre.y-(p.y+q.y)/2)*oy,offsets=order===1?[0]:order===2&&ring?[0,Math.sign(inward)*5]:order===2?[-2.3,2.3]:[-4.2,0,4.2];
  for(let j=0;j<offsets.length;j++){const offset=offsets[j],inset=ring&&order===2&&j===1?8:0;ctx.beginPath();ctx.moveTo(p.x+ux*(trimA+inset)+ox*offset,p.y+uy*(trimA+inset)+oy*offset);ctx.lineTo(q.x-ux*(trimB+inset)+ox*offset,q.y-uy*(trimB+inset)+oy*offset);ctx.strokeStyle='#e6c2ff';ctx.lineWidth=order===3?1.8:2.1;ctx.stroke()}
 }
 points.forEach((p,i)=>{const label=skeletalLabel(skeleton.atoms[i][0]);if(!label)return;ctx.fillStyle=label.includes('O')?'#ffd7ff':label.includes('N')?'#d6ccff':'#f1daff';drawLabel(ctx,label,p.x,p.y,font)});ctx.restore();
}
