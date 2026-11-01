import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const code=ts.transpile(await readFile(new URL('../src/journey/journeyStorage.ts',import.meta.url),'utf8'),{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022});
const {persistJourneySessions,JOURNEY_PROGRESS_KEY}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const original=()=>({version:1,completed:[2],checks:{'my-check':true},notes:{'my-note':'keep my notes'},sessions:[],scores:[],lastLesson:7,goal:20});
const sessions=[{id:'chapter-note',date:'2026-11-01',seconds:12,lesson:3,feeling:'Journey: one clear note'},{id:'chapter-anchor',date:'2026-11-01',seconds:8,lesson:7,feeling:'Journey: anchors'}];
test('A whole multi-chapter batch is written once, preserving existing learning data',()=>{
 const progress=original(),writes=[];
 const result=persistJourneySessions(progress,sessions,{setItem:(key,value)=>writes.push({key,value:JSON.parse(value)})});
 assert.equal(result.ok,true);assert.equal(writes.length,1);assert.equal(writes[0].key,JOURNEY_PROGRESS_KEY);
 assert.deepEqual(writes[0].value.sessions,sessions);assert.deepEqual(writes[0].value.notes,progress.notes);assert.deepEqual(writes[0].value.checks,progress.checks);
 assert.equal(progress.sessions.length,0);assert.deepEqual(result.progress.sessions,sessions);
});
test('A quota or privacy failure is not acknowledged and leaves the original progress available for retry',()=>{
 const progress=original();
 const failed=persistJourneySessions(progress,sessions,{setItem:()=>{throw new Error('storage denied')}});
 assert.deepEqual(failed,{ok:false});assert.equal(progress.sessions.length,0);
 const retry=persistJourneySessions(progress,sessions,{setItem:()=>{}});
 assert.equal(retry.ok,true);assert.deepEqual(retry.progress.sessions,sessions);
});
test('Stable session IDs make retries idempotent without duplicate logs or extra writes',()=>{
 const progress={...original(),sessions:[sessions[0]]},writes=[];
 const first=persistJourneySessions(progress,[...sessions,sessions[1]],{setItem:(k,v)=>writes.push(v)});
 assert.equal(first.ok,true);assert.deepEqual(first.progress.sessions,sessions);assert.equal(writes.length,1);
 const second=persistJourneySessions(first.progress,sessions,{setItem:()=>{throw new Error('must not write a duplicate')}});
 assert.equal(second.ok,true);assert.equal(second.progress,first.progress);
});
