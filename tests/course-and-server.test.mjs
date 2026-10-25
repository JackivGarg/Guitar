import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';

const source=await readFile(new URL('../src/course.ts',import.meta.url),'utf8');
const compiled=ts.transpile(source,{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022});
const {chords,lessons,openMidi,patterns}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const roots={C:0,D:2,E:4,F:5,G:7,A:9,B:11};

test('Every taught chord sounds the named musical chord',()=>{
 for(const chord of chords){
  const root=roots[chord.name[0]];
  const intervals=chord.name.includes('maj7')?[0,4,7,11]:chord.name.includes('m')?[0,3,7]:[0,4,7];
  const expected=[...new Set(intervals.map(i=>(root+i)%12))].sort((a,b)=>a-b);
  const actual=[...new Set(chord.frets.map((f,i)=>f<0?-1:(openMidi[i]+f)%12).filter(x=>x>=0))].sort((a,b)=>a-b);
  assert.deepEqual(actual,expected,chord.name+' pitch classes');
  assert.equal(chord.frets.length,6);assert.equal(chord.fingers.length,6);
  if(chord.barre){const [fret,start,end]=chord.barre;for(let i=start;i<=end;i++)assert.ok(chord.frets[i]>=fret,chord.name+' barre must not obstruct a lower fret');}
 }
});

test('The beginner path has actionable exercises and valid checks for all ten lessons',()=>{
 assert.deepEqual(lessons.map(l=>l.id),[1,2,3,4,5,6,7,8,9,10]);
 for(const l of lessons){assert.equal(l.steps.length,4);assert.equal(l.check.length,3);assert.ok(l.steps.every(s=>s.action.length>30));assert.ok(l.quiz.options[l.quiz.answer]);for(const name of l.chords)assert.ok(chords.some(c=>c.name===name));}
 assert.deepEqual(patterns[1].slots,['D','·','D','U','·','U','D','U']);
});

test('Installed app serves local assets, seeks audio and rejects invalid ranges',{skip:!process.env.SIX_STRINGS_INTEGRATION},async()=>{
 const base='http://127.0.0.1:17842';
 assert.equal((await (await fetch(base+'/health')).json()).app,'six-strings');
 assert.equal((await fetch(base+'/')).status,200);
 const transcripts=await (await fetch(base+'/transcripts.json')).json();
 assert.deepEqual(Object.keys(transcripts).map(Number),[2,3,4,5,6,7,8,9]);
 assert.ok(Object.values(transcripts).every(s=>s.segments.length>0));
 const audio=await fetch(base+'/lesson-07.mp3',{headers:{Range:'bytes=0-99'}});
 assert.equal(audio.status,206);assert.equal((await audio.arrayBuffer()).byteLength,100);
 assert.equal((await fetch(base+'/lesson-07.mp3',{headers:{Range:'bytes=999999999999-'}})).status,416);
 assert.equal((await fetch(base+'/missing-file')).status,404);
 assert.equal((await fetch(base+'/%2e%2e%5cpackage.json')).status,403);
 assert.equal((await fetch(base+'/',{method:'POST'})).status,405);
});
