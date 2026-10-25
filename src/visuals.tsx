import {Chord,openMidi,stringNames} from './course';
import {playNote} from './sound';

export function ChordDiagram({chord,active=false,interactive=false}:{chord:Chord;active?:boolean;interactive?:boolean}){
 const first=Math.min(...chord.frets.filter(f=>f>0));const base=first>3?first:1;
 return <svg className="chord-svg" viewBox="0 0 230 265" role="img" aria-label={`${chord.name} chord. Low E to high e: ${chord.frets.map(f=>f<0?'muted':f===0?'open':`fret ${f}`).join(', ')}`}>
  {Array.from({length:6},(_,s)=><g key={s} onClick={interactive&&chord.frets[s]>=0?()=>playNote(openMidi[s]+chord.frets[s]):undefined} style={{cursor:interactive?'pointer':undefined}}><rect x={35+s*31-10} y="35" width="20" height="197" fill="transparent"/><line x1={35+s*31} x2={35+s*31} y1="45" y2="225" stroke="#b3a9b0" strokeWidth={2.4-s*.25}/><text x={35+s*31} y="29" textAnchor="middle" fill="#655769" fontSize="18">{chord.frets[s]<0?'×':chord.frets[s]===0?'○':''}</text><text x={35+s*31} y="251" textAnchor="middle" fill="#857985" fontSize="14">{stringNames[s]}</text></g>)}
  {Array.from({length:6},(_,i)=><line key={i} x1="35" x2="190" y1={45+i*36} y2={45+i*36} stroke={i===0&&base===1?'#49324d':'#cfc7cd'} strokeWidth={i===0&&base===1?6:1.5}/>)}
  {base>1&&<text x="15" y="70" fill="#655769" fontSize="14">{base}</text>}
  {chord.barre&&<rect x={35+chord.barre[1]*31-10} y={45+(chord.barre[0]-base+.5)*36-10} width={(chord.barre[2]-chord.barre[1])*31+20} height="20" rx="10" fill={active?'#bb6c4d':'#60476a'}/>}
  {chord.frets.map((f,s)=>f>0&&!(chord.barre&&chord.fingers[s]===1)?<g key={s}><circle cx={35+s*31} cy={45+(f-base+.5)*36} r="12" fill={active?'#bb6c4d':'#60476a'}/><text x={35+s*31} y={50+(f-base+.5)*36} textAnchor="middle" fontSize="13" fontWeight="600" fill="white">{chord.fingers[s]}</text></g>:null)}
  {chord.barre&&<text x={35+chord.barre[1]*31} y={50+(chord.barre[0]-base+.5)*36} textAnchor="middle" fontSize="13" fill="white">1</text>}
 </svg>;
}

export function GuitarArt({labels=false}:{labels?:boolean}){
return <svg viewBox="0 0 520 440" role="img" aria-label={labels?'Acoustic guitar anatomy: headstock, tuning pegs, neck, frets, soundhole, bridge and body':'Illustration of a warm wooden acoustic guitar'} className="guitar-art">
 <defs><linearGradient id="wood" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#eec998"/><stop offset="1" stopColor="#c78f65"/></linearGradient><linearGradient id="neck" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#634734"/><stop offset="1" stopColor="#866147"/></linearGradient></defs>
 <ellipse cx="254" cy="399" rx="145" ry="19" fill="#6b5065" opacity=".08"/>
 <g transform={labels?'translate(-30 0)':'rotate(27 260 230) translate(0 -8)'}>
 <path d="M224 221C207 199 171 209 162 237C153 260 178 276 168 295C113 332 151 400 229 402C307 405 343 337 295 299C280 278 306 261 294 237C282 209 250 200 240 221Z" fill="#b57f59"/>
 <path d="M225 217C205 200 174 210 166 237C157 260 183 277 172 298C122 336 157 395 230 397C303 400 337 337 291 301C276 280 301 262 290 238C279 213 253 201 239 218Z" fill="url(#wood)" stroke="#f2d3a8" strokeWidth="3"/>
 <path d="M172 298Q231 270 291 301M177 308Q230 285 286 308M161 330Q231 310 304 332" fill="none" stroke="#ac754c" opacity=".12"/>
 <circle cx="231" cy="282" r="33" fill="#f0d3ae" stroke="#98704e" strokeWidth="2"/><circle cx="231" cy="282" r="27" fill="#493b3a"/><circle cx="231" cy="282" r="23" fill="#382f30"/>
 <path d="M254 295Q280 308 274 340Q248 332 248 311Z" fill="#8a4939" opacity=".85"/>
 <rect x="218" y="81" width="26" height="181" fill="url(#neck)"/>
 {Array.from({length:14},(_,i)=><g key={i}><path d={`M219 ${97+i*11.5}h24`} stroke="#d7b99a" strokeWidth="1"/>{[2,4,6,8,11].includes(i)&&<circle cx="231" cy={102+i*11.5} r="1.7" fill="#ecdfd0"/>}</g>)}
 <path d="M219 89L212 30Q231 20 250 30L243 89Z" fill="#a87551" stroke="#d7b38a" strokeWidth="2"/>
 {[43,59,75].map(y=><g key={y}><rect x="202" y={y} width="15" height="5" rx="2" fill="#bfb9af"/><rect x="246" y={y} width="15" height="5" rx="2" fill="#bfb9af"/><circle cx="220" cy={y+2} r="2" fill="#ddd6c9"/><circle cx="242" cy={y+2} r="2" fill="#ddd6c9"/></g>)}
 <rect x="206" y="352" width="51" height="13" rx="4" fill="#604137"/><path d="M214 355H249" stroke="#ebdfcd" strokeWidth="3"/>
 {Array.from({length:6},(_,i)=><line key={i} x1={222+i*3.5} x2={222+i*3.5} y1="89" y2="360" stroke="#f4e5cc" strokeWidth={1.1-i*.11} opacity=".95"/>)}
 <path d="M218 88H244" stroke="#f5e8d7" strokeWidth="3"/>
 </g>
 {labels&&<g fill="#49324d" fontSize="16" fontFamily="system-ui"><path d="M224 48H307M218 165H307M238 282H307M230 356H307M158 330H91" fill="none" stroke="#9c8b9e"/><text x="318" y="53">Headstock & tuners</text><text x="318" y="170">Neck & frets</text><text x="318" y="287">Soundhole</text><text x="318" y="361">Bridge & saddle</text><text x="35" y="325">Body</text></g>}
 {!labels&&<g fill="#60476a" opacity=".5"><path d="M387 113v30q-18-6-18 7c0 9 21 8 21-3v-28l17-5v22q-17-5-17 7c0 9 20 8 20-3v-39Z"/><path d="M109 264l6 12 13 2-10 10 2 13-12-6-12 6 3-13-10-10 14-2Z" opacity=".5"/><circle cx="400" cy="310" r="6" fill="none" stroke="#60476a" strokeWidth="2"/><path d="M118 113h15m-7-7v14" stroke="#60476a" strokeWidth="2"/></g>}
</svg>;
}
