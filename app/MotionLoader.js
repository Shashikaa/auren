"use client";
import { useEffect } from 'react';
export default function MotionLoader(){useEffect(()=>{if(document.getElementById('motion-runtime'))return;const s=document.createElement('script');s.id='motion-runtime';s.type='module';s.src='/app.js';document.body.appendChild(s);},[]);return null;}
