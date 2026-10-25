import {AbsoluteFill,interpolate,useCurrentFrame,useVideoConfig,Composition} from 'remotion';
import {ChordDiagram,GuitarArt} from './visuals';
import {getChord,patterns,stringNames} from './course';
export type DemoProps={mode:string;chordName?:string;pattern?:number};
const ink='#49324d',accent='#bb6c4d';
const font='"Segoe UI", sans-serif';
export function Demo({mode,chordName='C',pattern=1}:DemoProps){
 const frame=useCurrentFrame(),{fps}=useVideoConfig();const t=frame/fps;
 const phase=Math.floor(t/2)%6;const move=interpolate(t,[2.5,3.5,7.5,8.5],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 let title='Watch. Notice. Try it.',sub='A slow visual guide. Pause or replay whenever you need.';
 let visual;
 if(mode==='shift'){
  title=move<.5?'C major → A minor':'A minor → C major';sub='Keep index on B1 and middle on D2. Move only the ring finger.';
  visual=<div style={{display:'flex',alignItems:'center',gap:60}}><div style={{width:305,position:'relative'}}><ChordDiagram chord={{...getChord('C'),frets:[-1,0,2,0,1,0],fingers:[0,0,2,0,1,0]}}/><svg viewBox="0 0 230 265" style={{position:'absolute',inset:0,width:'100%'}}><circle cx={66+62*move} cy={135-36*move} r="14" fill={accent}/><text x={66+62*move} y={140-36*move} textAnchor="middle" fontSize="15" fill="white">3</text></svg></div><div style={{maxWidth:375}}><div style={{fontSize:82,fontWeight:650,letterSpacing:-4}}>{move<.5?'C':'Am'}</div><p style={{fontSize:27,lineHeight:1.5}}>Two fingers stay.<br/>One finger moves.</p><div style={{color:accent,fontSize:21}}>Ring: A string, fret 3 ↔ G string, fret 2</div></div></div>;
 }else if(mode==='anatomy'){
  title='Get to know your guitar';sub='Relax your shoulders. Support the body. Keep the neck slightly raised.';visual=<div style={{width:720,marginTop:-35}}><GuitarArt labels/></div>;
 }else if(mode==='strings'){
  title='Six strings. One starting point.';sub='Standard tuning · thick to thin: E₂ A₂ D₃ G₃ B₃ E₄';
  visual=<svg width="860" height="300" viewBox="0 0 860 300">{stringNames.map((n,i)=><g key={i}><text x="10" y={40+i*44} fill={i===phase?accent:ink} fontSize="24">{6-i}</text><line x1="55" x2="700" y1={32+i*44} y2={32+i*44} stroke={i===phase?accent:'#c3b6c2'} strokeWidth={5-i*.6}/><circle cx="773" cy={32+i*44} r="25" fill={i===phase?ink:'#eee5ed'}/><text x="773" y={40+i*44} textAnchor="middle" fontSize="23" fill={i===phase?'white':ink}>{n}</text></g>)}</svg>;
 }else if(mode==='strum'||mode==='mute'){
  const slots=patterns[mode==='mute'?2:pattern].slots;const beat=Math.floor(t/.65)%8;
  title=mode==='mute'?'Clear strum. Gentle chuck.':'Let your hand keep moving.';sub=mode==='mute'?'M = muted downstroke on beats 2 and 4. Light contact stops the strings.':'Down on numbers. Up on “and”. Keep moving through the silent slots.';
  visual=<div style={{width:930}}><div style={{display:'flex',gap:12}}>{slots.map((s,i)=><div key={i} style={{flex:1,textAlign:'center'}}><div style={{fontSize:20,color:'#927f94',marginBottom:15}}>{['1','&','2','&','3','&','4','&'][i]}</div><div style={{height:110,borderRadius:22,background:beat===i?ink:'#e8dee7',color:beat===i?'white':ink,display:'grid',placeItems:'center',fontSize:56,opacity:s==='·'?.5:1}}>{s==='D'?'↓':s==='U'?'↑':s==='M'?'×':'·'}</div></div>)}</div><p style={{textAlign:'center',fontSize:23,marginTop:35}}>Say it aloud: {mode==='mute'?'down · mute up · up mute up':'down · down up · up down up'}</p>{mode==='mute'&&<p style={{fontSize:19,textAlign:'center',color:accent}}>This chuck is distinct from sustained palm muting near the bridge.</p>}</div>;
 }else if(mode==='notes'||mode==='fill'){
  const fret=mode==='fill'?[0,1,3,3][Math.floor(t/1.2)%4]:Math.floor(t/.8)%13;const names=['E','F','F♯','G','G♯','A','A♯','B','C','C♯','D','D♯','E'];
  title=mode==='fill'?'A tiny fill: E → F → G':'One fret = one half step';sub=mode==='fill'?'High e string: open on beat 3, fret 1 on & of 3, fret 3 on beat 4.':'E–F and B–C are neighboring frets. Twelve frets return to the same note name.';
  visual=<div style={{width:900,textAlign:'center'}}><div style={{fontSize:85,fontWeight:600,color:accent,marginBottom:30}}>{names[fret]}</div><svg width="900" height="140" viewBox="0 0 900 140"><rect x="45" y="20" width="825" height="85" rx="8" fill="#e8dee7"/>{Array.from({length:13},(_,i)=><g key={i}><line x1={55+i*66} x2={55+i*66} y1="20" y2="105" stroke={i===0?ink:'#b5a6b7'} strokeWidth={i===0?5:2}/><text x={i===0?27:22+i*66} y="132" textAnchor="middle" fill={ink} fontSize="18">{i}</text></g>)}<line x1="10" x2="870" y1="63" y2="63" stroke="#877288" strokeWidth="3"/><circle cx={fret===0?27:22+fret*66} cy="63" r="19" fill={accent}/></svg><p style={{fontSize:20}}>String: {mode==='fill'?'1 · thin high e':'6 · thick low E'} · Fret {fret}</p></div>;
 }else{
  const barred=mode==='barre';const useG=barred&&Math.floor(t/4)%2===1;
  const c=barred?(useG?{...getChord('F'),name:'G barre',frets:[3,5,5,4,3,3],barre:[3,0,5] as [number,number,number]}:getChord('F')):getChord(chordName);
  title=barred?'Move the whole shape.':'Build a chord, one finger at a time.';sub=barred?'F at fret 1 → G at fret 3. The root is on the thick low E string.':c.tip;
  visual=<div style={{display:'flex',alignItems:'center',gap:70}}><div style={{width:300}}><ChordDiagram chord={c}/></div><div style={{maxWidth:400}}><div style={{fontSize:90,fontWeight:600}}>{c.name}</div><p style={{fontSize:24,lineHeight:1.5}}>{barred?'The index finger acts as a movable nut. Use relaxed, short attempts.':'1 index · 2 middle\n3 ring · 4 little finger'}</p><p style={{fontSize:21,color:accent}}>O = open · × = do not play</p></div></div>;
 }
 return <AbsoluteFill style={{background:'#f5eff3',color:ink,fontFamily:font,padding:58}}><div style={{display:'flex',justifyContent:'space-between',fontSize:17,letterSpacing:3,fontWeight:600}}><span>SIX STRINGS / VISUAL LESSON</span><span>TAKE IT SLOW</span></div><h1 style={{fontSize:43,letterSpacing:-1.5,margin:'30px 0 0'}}>{title}</h1><div style={{flex:1,display:'flex',justifyContent:'center',alignItems:'center',minHeight:0}}>{visual}</div><div style={{fontSize:23,lineHeight:1.5,maxWidth:1030,paddingTop:15,borderTop:'1px solid #d9ccd8'}}>{sub}</div><div style={{height:3,background:'#dfd1de',position:'absolute',bottom:0,left:0,width:'100%'}}><div style={{height:'100%',width:`${frame/360*100}%`,background:accent}}/></div></AbsoluteFill>;
}
export const DemoCompositions=()=> <>
 <Composition id="Chord-Changes" component={Demo} durationInFrames={360} fps={30} width={1200} height={760} defaultProps={{mode:'shift'}}/>
 <Composition id="String-Names" component={Demo} durationInFrames={360} fps={30} width={1200} height={760} defaultProps={{mode:'strings'}}/>
 <Composition id="Strumming" component={Demo} durationInFrames={360} fps={30} width={1200} height={760} defaultProps={{mode:'strum',pattern:1}}/>
 <Composition id="Muted-Strum" component={Demo} durationInFrames={360} fps={30} width={1200} height={760} defaultProps={{mode:'mute'}}/>
 <Composition id="Fretboard-Notes" component={Demo} durationInFrames={360} fps={30} width={1200} height={760} defaultProps={{mode:'notes'}}/>
 <Composition id="Barre-Chords" component={Demo} durationInFrames={360} fps={30} width={1200} height={760} defaultProps={{mode:'barre'}}/>
 <Composition id="First-Fill" component={Demo} durationInFrames={360} fps={30} width={1200} height={760} defaultProps={{mode:'fill'}}/>
 <Composition id="Guitar-Anatomy" component={Demo} durationInFrames={360} fps={30} width={1200} height={760} defaultProps={{mode:'anatomy'}}/>
 </>;
