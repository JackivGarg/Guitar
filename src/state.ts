import {useEffect,useState} from 'react';
export type Session={id:string;date:string;seconds:number;lesson:number;feeling:string};
export type Progress={version:1;completed:number[];checks:Record<string,boolean>;notes:Record<string,string>;sessions:Session[];scores:{date:string;pair:string;count:number}[];lastLesson:number;goal:number};
export const blank:Progress={version:1,completed:[],checks:{},notes:{},sessions:[],scores:[],lastLesson:1,goal:20};
export const dayKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export function useStored<T>(key:string,fallback:T){
 const [value,set]=useState<T>(()=>{try{const saved=localStorage.getItem(key);return saved?JSON.parse(saved):fallback;}catch{return fallback;}});
 const [error,setError]=useState(false);
 useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(value));setError(false);}catch{setError(true);}},[key,value]);
 return [value,set,error] as const;
}
export function validProgress(x:unknown):x is Progress{
 if(!x||typeof x!=='object')return false;const p=x as Progress;
 return p.version===1&&Array.isArray(p.completed)&&p.completed.every(n=>Number.isInteger(n)&&n>=1&&n<=10)&&typeof p.notes==='object'&&p.notes!==null&&Object.values(p.notes).every(v=>typeof v==='string')&&typeof p.checks==='object'&&p.checks!==null&&Object.values(p.checks).every(v=>typeof v==='boolean')&&Array.isArray(p.sessions)&&p.sessions.every(s=>typeof s.id==='string'&&typeof s.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s.date)&&Number.isFinite(s.seconds)&&s.seconds>=0&&s.seconds<=86400&&Number.isInteger(s.lesson)&&s.lesson>=1&&s.lesson<=10&&typeof s.feeling==='string')&&Array.isArray(p.scores)&&p.scores.every(s=>typeof s.date==='string'&&typeof s.pair==='string'&&Number.isInteger(s.count)&&s.count>=0)&&Number.isInteger(p.lastLesson)&&p.lastLesson>=1&&p.lastLesson<=10&&Number.isFinite(p.goal)&&p.goal>=5&&p.goal<=60;
}
export function streak(sessions:Session[]){
 const days=new Set(sessions.filter(s=>s.seconds>=60).map(s=>s.date));let n=0;const d=new Date();if(!days.has(dayKey(d)))d.setDate(d.getDate()-1);
 while(days.has(dayKey(d))){n++;d.setDate(d.getDate()-1);}return n;
}
