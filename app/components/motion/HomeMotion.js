"use client";
import { useEffect } from "react";
export default function HomeMotion() {
  useEffect(() => {
    if (document.getElementById("motion-runtime")) return;
    const s = document.createElement("script");
    s.id = "motion-runtime";
    s.type = "module";
    s.src = "/scripts/app.js";
    document.body.appendChild(s);
  }, []);
  return null;
}
