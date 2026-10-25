import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const compile=text=>ts.transpile(text,{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022});
const url=text=>'data:text/javascript;base64,'+Buffer.from(text).toString('base64');
const courseUrl=url(compile(await readFile(new URL('../src/course.ts',import.meta.url),'utf8')));
const moduleText=compile(await readFile(new URL('../src/lesson7.ts',import.meta.url),'utf8')).replace(/from ["']\.\/course["']/g,'from '+JSON.stringify(courseUrl));
const {changes,drillBlocks,workshopChord,fingerPosition,getChange}=await import(url(moduleText));

test('Lesson 7 covers all 15 change clips and the complete source teaching sequence',()=>{
 assert.equal(changes.length,15);assert.equal(drillBlocks.length,11);
 assert.deepEqual(new Set(drillBlocks.flatMap(b=>b.pairs)),new Set(changes.map(c=>c.id)));
 assert.equal(drillBlocks[0].start,63);assert.equal(drillBlocks.at(-1).end,1843);
 for(let i=1;i<drillBlocks.length;i++)assert.equal(drillBlocks[i-1].end,drillBlocks[i].start,'No missing teaching chapter');
 assert.equal(getChange('C-Dm').groups[0][0],1,'Index leads C to Dm');
});
test('A guide slide stays on the same string and moves frets; a fixed anchor does not move',()=>{
 for(const id of ['A-D','D-E']){
  const c=getChange(id);assert.ok(c.slide?.length);
  for(const f of c.slide){const a=fingerPosition(workshopChord(c.from),f),b=fingerPosition(workshopChord(c.to),f);assert.ok(a&&b);assert.equal(a.string,b.string);assert.notEqual(a.fret,b.fret);}
 }
 for(const [id,fingers] of [['C-Am',[1,2]],['Em-E',[2,3]],['C-Fmaj7',[1]],['Fmaj7-Dm',[2]]]){
  const c=getChange(id);for(const f of fingers)assert.deepEqual(fingerPosition(workshopChord(c.from),f),fingerPosition(workshopChord(c.to),f),id+' anchor');
 }
 const c=getChange('G-D');assert.notDeepEqual(fingerPosition(workshopChord(c.from),3),fingerPosition(workshopChord(c.to),3),'G/D ring is a reference, not a stationary anchor');
});
test('The Lesson 7 F is the correct four-string major chord, separate from Fmaj7 and full barre F',()=>{
 const f=workshopChord('F-small');assert.deepEqual(f.frets,[-1,-1,3,2,1,1]);assert.deepEqual(f.barre,[1,4,5]);
 assert.notDeepEqual(f.frets,workshopChord('F').frets);assert.notDeepEqual(f.frets,workshopChord('Fmaj7').frets);
});
