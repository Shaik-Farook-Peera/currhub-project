import { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";

// ─── API BASE ──────────────────────────────────────────────────────────────────
const API = "http://localhost:5000";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@700;800&family=JetBrains+Mono:wght@400;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:       #080814;
      --bg2:      #0e0e1f;
      --bg3:      #13132a;
      --card:     #151528;
      --card2:    #1a1a35;
      --border:   rgba(255,255,255,0.07);
      --border2:  rgba(255,255,255,0.12);
      --p:        #8B5CF6;
      --p2:       #A78BFA;
      --p3:       #EDE9FE;
      --c:        #06B6D4;
      --c2:       #67E8F9;
      --g:        #10B981;
      --g2:       #6EE7B7;
      --y:        #F59E0B;
      --y2:       #FCD34D;
      --pk:       #EC4899;
      --pk2:      #F9A8D4;
      --r:        #EF4444;
      --text:     #F1F5F9;
      --text2:    #94A3B8;
      --text3:    #64748B;
      --radius:   14px;
      --radius2:  8px;
      --shadow:   0 8px 32px rgba(0,0,0,0.4);
      --shadow2:  0 2px 12px rgba(0,0,0,0.3);
    }

    html { scroll-behavior: smooth; }
    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--bg);
      color: var(--text);
      overflow-x: hidden;
      line-height: 1.6;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg2); }
    ::-webkit-scrollbar-thumb { background: var(--p); border-radius: 3px; }

    /* Canvas bg */
    #particles-bg {
      position: fixed; inset: 0;
      pointer-events: none;
      z-index: 0;
    }

    /* NAVBAR */
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      height: 64px;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 2rem;
      background: rgba(8,8,20,0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      transition: all 0.3s;
    }
    .navbar.scrolled {
      background: rgba(8,8,20,0.97);
      box-shadow: 0 4px 24px rgba(0,0,0,0.5);
    }
    .nav-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .nav-logo { font-size: 1.5rem; }
    .nav-brand-name {
      font-family: 'Playfair Display', serif;
      font-size: 1.4rem; font-weight: 800;
      background: linear-gradient(135deg, var(--p2), var(--c));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .nav-ai-badge {
      background: linear-gradient(135deg, var(--p), var(--c));
      color: white; font-size: 0.65rem; font-weight: 700;
      padding: 2px 8px; border-radius: 20px;
      font-family: 'JetBrains Mono', monospace;
    }
    .nav-links { display: flex; gap: 2rem; }
    .nav-link {
      background: none; border: none; cursor: pointer;
      color: var(--text2); font-size: 0.9rem; font-weight: 500;
      font-family: 'DM Sans', sans-serif;
      padding: 4px 0;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .nav-link:hover, .nav-link.active {
      color: var(--text);
      border-bottom-color: var(--p);
    }
    .nav-status {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.8rem; color: var(--text2);
    }
    .status-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--g);
      box-shadow: 0 0 8px var(--g);
      animation: pulse-dot 2s ease-in-out infinite;
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.85); }
    }
    .hamburger {
      display: none; background: none; border: none;
      color: var(--text); font-size: 1.4rem; cursor: pointer;
    }
    @media (max-width: 768px) {
      .nav-links, .nav-status { display: none; }
      .hamburger { display: block; }
    }

    /* MOBILE MENU */
    .mobile-menu {
      display: none;
      position: fixed; top: 64px; left: 0; right: 0;
      background: var(--bg2);
      border-bottom: 1px solid var(--border);
      z-index: 999; padding: 1rem;
      flex-direction: column; gap: 0.5rem;
    }
    .mobile-menu.open { display: flex; }
    .mobile-menu button {
      background: none; border: none; cursor: pointer;
      color: var(--text); font-size: 1rem; padding: 10px 14px;
      text-align: left; border-radius: var(--radius2);
      font-family: 'DM Sans', sans-serif;
    }
    .mobile-menu button:hover { background: var(--card); }

    /* SECTION BASE */
    .section {
      position: relative; z-index: 1;
      min-height: 100vh;
      padding: 100px 2rem 60px;
    }
    .container { max-width: 1200px; margin: 0 auto; }

    /* ── HOME ── */
    .home-section {
      display: flex; align-items: center; min-height: 100vh;
      padding-top: 80px;
    }
    .home-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;
      align-items: center; max-width: 1200px; margin: 0 auto; width: 100%;
    }
    @media (max-width: 900px) {
      .home-grid { grid-template-columns: 1fr; gap: 2rem; }
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(139,92,246,0.15);
      border: 1px solid rgba(139,92,246,0.35);
      border-radius: 100px; padding: 6px 16px;
      font-size: 0.8rem; color: var(--p2);
      margin-bottom: 1.5rem;
      font-family: 'JetBrains Mono', monospace;
    }
    .hero-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.4rem, 5vw, 4rem);
      font-weight: 800; line-height: 1.15;
      color: var(--text); margin-bottom: 1.2rem;
    }
    .hero-title .grad {
      background: linear-gradient(135deg, var(--p2) 0%, var(--c) 50%, var(--g2) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .hero-sub {
      font-size: 1.05rem; color: var(--text2); line-height: 1.7;
      margin-bottom: 2rem; max-width: 480px;
    }
    .hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2.5rem; }
    .btn-primary {
      background: linear-gradient(135deg, var(--p), var(--c));
      color: white; border: none; cursor: pointer;
      padding: 13px 28px; border-radius: var(--radius);
      font-size: 0.95rem; font-weight: 600;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.2s;
      box-shadow: 0 4px 20px rgba(139,92,246,0.35);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(139,92,246,0.5);
    }
    .btn-secondary {
      background: transparent; color: var(--text);
      border: 1px solid var(--border2); cursor: pointer;
      padding: 13px 28px; border-radius: var(--radius);
      font-size: 0.95rem; font-weight: 500;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.2s;
    }
    .btn-secondary:hover { background: var(--card); border-color: var(--p2); }
    .hero-stats {
      display: flex; gap: 2rem; flex-wrap: wrap;
    }
    .stat { }
    .stat-num {
      font-family: 'Playfair Display', serif;
      font-size: 2rem; font-weight: 800;
      background: linear-gradient(135deg, var(--p2), var(--c));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      line-height: 1;
    }
    .stat-label { font-size: 0.78rem; color: var(--text3); margin-top: 2px; }

    /* floating cards */
    .hero-visual {
      position: relative; height: 420px;
      display: flex; align-items: center; justify-content: center;
    }
    @media (max-width: 900px) { .hero-visual { display: none; } }
    .float-card {
      position: absolute;
      background: var(--card);
      border: 1px solid var(--border2);
      border-radius: var(--radius);
      padding: 16px 20px; min-width: 200px;
      box-shadow: var(--shadow);
    }
    .float-card:nth-child(1) { top: 20px; left: 10px; animation: floatA 4s ease-in-out infinite; }
    .float-card:nth-child(2) { top: 150px; right: 0; animation: floatB 5s ease-in-out infinite 1s; }
    .float-card:nth-child(3) { bottom: 30px; left: 30px; animation: floatA 4.5s ease-in-out infinite 0.5s; }
    @keyframes floatA {
      0%,100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    @keyframes floatB {
      0%,100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .fc-icon { font-size: 1.5rem; margin-bottom: 8px; }
    .fc-title { font-weight: 600; font-size: 0.9rem; color: var(--text); }
    .fc-sub { font-size: 0.78rem; color: var(--text3); margin-top: 3px; }

    /* ── SECTION HEADERS ── */
    .sec-header { text-align: center; margin-bottom: 3rem; }
    .sec-eyebrow {
      font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em;
      text-transform: uppercase; color: var(--p2);
      font-family: 'JetBrains Mono', monospace;
      margin-bottom: 12px;
    }
    .sec-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      font-weight: 800; color: var(--text);
      margin-bottom: 12px;
    }
    .sec-sub { font-size: 1rem; color: var(--text2); max-width: 520px; margin: 0 auto; }

    /* GLASS CARD */
    .glass {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow2);
    }
    .glass:hover { border-color: var(--border2); }

    /* ── GENERATE SECTION ── */
    .gen-grid {
      display: grid; grid-template-columns: 1.1fr 1fr; gap: 2rem;
    }
    @media (max-width: 900px) { .gen-grid { grid-template-columns: 1fr; } }
    .form-panel { padding: 2rem; }
    .panel-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.4rem; font-weight: 700;
      color: var(--text); margin-bottom: 4px;
    }
    .panel-sub { font-size: 0.85rem; color: var(--text3); margin-bottom: 1.5rem; }

    /* Type toggle */
    .type-toggle {
      display: flex; gap: 8px; margin-bottom: 1.2rem;
      background: var(--bg2); border-radius: var(--radius);
      padding: 4px;
    }
    .type-btn {
      flex: 1; background: transparent; border: none; cursor: pointer;
      padding: 10px 14px; border-radius: 10px;
      font-size: 0.88rem; font-weight: 500; color: var(--text2);
      font-family: 'DM Sans', sans-serif;
      transition: all 0.2s;
    }
    .type-btn.active {
      background: linear-gradient(135deg, var(--p), #6D28D9);
      color: white; box-shadow: 0 2px 12px rgba(139,92,246,0.3);
    }

    /* Language pills */
    .lang-row {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 1.2rem; flex-wrap: wrap;
    }
    .lang-label { font-size: 0.82rem; color: var(--text3); font-weight: 500; }
    .lang-btn {
      background: var(--bg2); border: 1px solid var(--border);
      color: var(--text2); font-size: 0.85rem; cursor: pointer;
      padding: 5px 14px; border-radius: 100px;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.2s;
    }
    .lang-btn.active {
      background: rgba(139,92,246,0.15);
      border-color: var(--p); color: var(--p2);
    }

    /* Form fields */
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.4rem; }
    .form-full { grid-column: 1 / -1; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 0.82rem; font-weight: 600; color: var(--text2); }
    .form-input, .form-select {
      background: var(--bg2); border: 1px solid var(--border);
      color: var(--text); font-size: 0.92rem;
      padding: 10px 14px; border-radius: var(--radius2);
      outline: none; font-family: 'DM Sans', sans-serif;
      transition: border-color 0.2s;
      width: 100%;
    }
    .form-input:focus, .form-select:focus { border-color: var(--p); }
    .form-input::placeholder { color: var(--text3); }
    .form-select option { background: var(--bg2); }
    .form-hint { font-size: 0.75rem; color: var(--text3); margin-top: 2px; }

    .btn-row { display: flex; gap: 10px; }
    .btn-generate {
      flex: 1; background: linear-gradient(135deg, var(--p), var(--c));
      color: white; border: none; cursor: pointer;
      padding: 13px 20px; border-radius: var(--radius);
      font-size: 0.95rem; font-weight: 700;
      font-family: 'DM Sans', sans-serif;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: all 0.2s; box-shadow: 0 4px 20px rgba(139,92,246,0.3);
    }
    .btn-generate:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(139,92,246,0.5);
    }
    .btn-generate:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-clear {
      background: var(--card2); border: 1px solid var(--border);
      color: var(--text2); cursor: pointer;
      padding: 13px 18px; border-radius: var(--radius);
      font-size: 0.88rem; font-family: 'DM Sans', sans-serif;
      transition: all 0.2s;
    }
    .btn-clear:hover { color: var(--r); border-color: var(--r); }

    /* Feature cards right */
    .feature-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    }
    .feat-card {
      padding: 18px; border-radius: var(--radius);
      border: 1px solid var(--border);
      transition: all 0.2s;
    }
    .feat-card:hover { border-color: var(--border2); transform: translateY(-2px); }
    .feat-icon { font-size: 1.4rem; margin-bottom: 8px; }
    .feat-title { font-weight: 600; font-size: 0.88rem; color: var(--text); margin-bottom: 4px; }
    .feat-desc { font-size: 0.78rem; color: var(--text3); line-height: 1.5; }

    /* LOADING */
    .loading-overlay {
      position: fixed; inset: 0; z-index: 2000;
      background: rgba(8,8,20,0.92);
      backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; gap: 1.5rem;
    }
    .loading-orb {
      position: relative; width: 100px; height: 100px;
      display: flex; align-items: center; justify-content: center;
    }
    .orb-ring {
      position: absolute; border-radius: 50%;
      border: 2px solid transparent; border-top-color: var(--p);
    }
    .orb-ring.r1 { width: 100px; height: 100px; animation: spin 1.5s linear infinite; }
    .orb-ring.r2 { width: 75px; height: 75px; animation: spin 1.1s linear infinite reverse; border-top-color: var(--c); }
    .orb-ring.r3 { width: 50px; height: 50px; animation: spin 0.8s linear infinite; border-top-color: var(--g); }
    @keyframes spin { to { transform: rotate(360deg); } }
    .orb-emoji { font-size: 1.8rem; }
    .loading-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.4rem; font-weight: 700; color: var(--text);
    }
    .loading-status { font-size: 0.88rem; color: var(--text2); }
    .loading-bar { width: 280px; height: 3px; background: var(--card2); border-radius: 2px; overflow: hidden; }
    .loading-fill {
      height: 100%; background: linear-gradient(90deg, var(--p), var(--c));
      border-radius: 2px; animation: loadfill 18s linear forwards;
    }
    @keyframes loadfill { from { width: 0; } to { width: 95%; } }
    .loading-steps { display: flex; gap: 1rem; }
    .lstep {
      font-size: 0.75rem; color: var(--text3);
      padding: 5px 12px; border-radius: 100px;
      border: 1px solid var(--border); transition: all 0.3s;
    }
    .lstep.active { border-color: var(--p); color: var(--p2); background: rgba(139,92,246,0.1); }

    /* RESULTS */
    .results-wrap { margin-top: 2rem; }
    .results-banner {
      padding: 1.5rem 2rem;
      background: linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.08));
      border: 1px solid var(--border2);
      border-radius: var(--radius);
      margin-bottom: 1.5rem;
    }
    .banner-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.4rem; font-weight: 700; color: var(--text);
      margin-bottom: 1rem;
    }
    .banner-stats { display: flex; gap: 2rem; flex-wrap: wrap; }
    .bstat-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.3rem; font-weight: 700; color: var(--p2);
      line-height: 1;
    }
    .bstat-label { font-size: 0.75rem; color: var(--text3); margin-top: 3px; }

    /* Export bar */
    .export-bar {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 20px; flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }
    .export-label { font-size: 0.85rem; font-weight: 600; color: var(--text2); margin-right: 4px; }
    .exp-btn {
      padding: 7px 14px; border-radius: var(--radius2);
      border: 1px solid var(--border); background: var(--card2);
      color: var(--text2); font-size: 0.82rem; cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.2s; font-weight: 500;
    }
    .exp-btn:hover:not(:disabled) { border-color: var(--p); color: var(--p2); }
    .exp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Tabs */
    .result-tabs {
      display: flex; gap: 4px; margin-bottom: 1.5rem;
      background: var(--bg2); border-radius: var(--radius);
      padding: 4px; flex-wrap: wrap;
    }
    .tab-btn {
      background: transparent; border: none; cursor: pointer;
      padding: 9px 16px; border-radius: 10px;
      font-size: 0.85rem; color: var(--text2);
      font-family: 'DM Sans', sans-serif; font-weight: 500;
      transition: all 0.2s;
    }
    .tab-btn:hover { color: var(--text); background: var(--card); }
    .tab-btn.active {
      background: linear-gradient(135deg, var(--p), #6D28D9);
      color: white;
    }

    /* Semester blocks */
    .semester-block {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden; margin-bottom: 1rem;
    }
    .sem-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.5rem; cursor: pointer;
      background: var(--card);
      transition: background 0.2s;
    }
    .sem-header:hover { background: var(--card2); }
    .sem-left { display: flex; align-items: center; gap: 14px; }
    .sem-num-badge {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, var(--p), var(--c));
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.85rem; color: white;
      flex-shrink: 0;
    }
    .sem-title { font-weight: 600; font-size: 0.95rem; color: var(--text); }
    .sem-count { font-size: 0.78rem; color: var(--text3); margin-top: 2px; }
    .sem-toggle { color: var(--text3); transition: transform 0.2s; font-size: 0.85rem; }
    .sem-toggle.open { transform: rotate(180deg); }
    .sem-courses { padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 10px; }

    /* Course cards */
    .course-card {
      background: var(--bg2); border: 1px solid var(--border);
      border-radius: var(--radius2); padding: 14px 16px;
      transition: border-color 0.2s;
    }
    .course-card:hover { border-color: var(--border2); }
    .course-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
    .course-name { font-weight: 600; font-size: 0.92rem; color: var(--text); }
    .course-code {
      background: rgba(139,92,246,0.15); color: var(--p2);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;
      flex-shrink: 0;
    }
    .course-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }
    .course-meta-item { font-size: 0.75rem; color: var(--text3); }
    .diff-badge {
      font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; font-weight: 600;
    }
    .diff-Beginner { background: rgba(16,185,129,0.15); color: var(--g); }
    .diff-Intermediate { background: rgba(245,158,11,0.15); color: var(--y); }
    .diff-Advanced { background: rgba(239,68,68,0.15); color: var(--r); }
    .course-desc { font-size: 0.82rem; color: var(--text2); margin-bottom: 10px; line-height: 1.5; }
    .topics-row { display: flex; flex-wrap: wrap; gap: 6px; }
    .topic-chip {
      background: var(--card2); border: 1px solid var(--border);
      font-size: 0.72rem; color: var(--text2);
      padding: 3px 10px; border-radius: 100px;
    }

    /* Outcomes & capstone */
    .outcomes-box { padding: 1.5rem; margin-bottom: 1.5rem; }
    .outcomes-title { font-weight: 700; font-size: 1rem; color: var(--text); margin-bottom: 12px; }
    .outcomes-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .outcome-tag {
      background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.25);
      color: var(--p2); font-size: 0.8rem;
      padding: 5px 12px; border-radius: 100px;
    }
    .capstone-box { padding: 1.5rem; margin-top: 1rem; }
    .capstone-title { font-weight: 700; font-size: 1rem; color: var(--text); margin-bottom: 8px; }
    .capstone-text { font-size: 0.9rem; color: var(--text2); line-height: 1.6; }

    /* ── VISUAL MAP ── */
    .map-wrap { padding: 1.5rem; }
    .map-title { font-weight: 700; font-size: 1.1rem; color: var(--text); margin-bottom: 4px; }
    .map-sub { font-size: 0.82rem; color: var(--text3); margin-bottom: 1rem; }
    #d3-graph {
      width: 100%; height: 520px;
      background: var(--bg2); border-radius: var(--radius);
      border: 1px solid var(--border);
      overflow: hidden;
    }
    .map-legend { display: flex; gap: 1.5rem; margin-top: 1rem; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--text2); }
    .leg-dot { width: 10px; height: 10px; border-radius: 50%; }
    .leg-dot.beg { background: var(--g); }
    .leg-dot.int { background: var(--y); }
    .leg-dot.adv { background: var(--r); }

    /* SVG tooltip */
    .d3-tooltip {
      position: absolute; pointer-events: none;
      background: var(--card2); border: 1px solid var(--border2);
      border-radius: var(--radius2); padding: 10px 14px;
      font-size: 0.82rem; color: var(--text);
      box-shadow: var(--shadow); z-index: 100;
      max-width: 220px;
    }

    /* ── CHAT ── */
    .chat-wrap { padding: 1.5rem; display: flex; flex-direction: column; height: 560px; }
    .chat-header {
      display: flex; align-items: center; gap: 12px;
      padding-bottom: 1rem; border-bottom: 1px solid var(--border);
      margin-bottom: 1rem; flex-shrink: 0;
    }
    .chat-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, var(--p), var(--c));
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem; flex-shrink: 0;
    }
    .chat-agent-name { font-weight: 700; font-size: 0.92rem; color: var(--text); }
    .chat-agent-status { font-size: 0.75rem; color: var(--g); }
    .chat-messages {
      flex: 1; overflow-y: auto; display: flex;
      flex-direction: column; gap: 12px; padding-right: 4px;
    }
    .chat-msg { display: flex; }
    .chat-msg.user { justify-content: flex-end; }
    .msg-bubble {
      max-width: 75%; padding: 10px 14px;
      border-radius: 14px; font-size: 0.88rem; line-height: 1.55;
    }
    .chat-msg.ai .msg-bubble {
      background: var(--card2); color: var(--text);
      border-bottom-left-radius: 4px;
    }
    .chat-msg.user .msg-bubble {
      background: linear-gradient(135deg, var(--p), #6D28D9);
      color: white; border-bottom-right-radius: 4px;
    }
    .typing-dots span {
      display: inline-block; width: 7px; height: 7px; border-radius: 50%;
      background: var(--text3); margin: 0 2px;
      animation: typingDot 1.2s ease-in-out infinite;
    }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typingDot {
      0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }
    .chat-input-row {
      display: flex; gap: 8px; margin-top: 1rem; flex-shrink: 0;
    }
    .chat-input {
      flex: 1; background: var(--bg2); border: 1px solid var(--border);
      color: var(--text); font-size: 0.88rem;
      padding: 11px 14px; border-radius: var(--radius);
      outline: none; font-family: 'DM Sans', sans-serif;
      transition: border-color 0.2s;
    }
    .chat-input:focus { border-color: var(--p); }
    .chat-input::placeholder { color: var(--text3); }
    .chat-send {
      background: linear-gradient(135deg, var(--p), var(--c));
      color: white; border: none; cursor: pointer;
      padding: 11px 20px; border-radius: var(--radius);
      font-size: 0.88rem; font-weight: 600;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.2s;
    }
    .chat-send:hover:not(:disabled) { opacity: 0.9; }
    .chat-send:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ── RESOURCES ── */
    .resources-wrap { padding: 1.5rem; }
    .res-category { margin-bottom: 1.5rem; }
    .res-cat-title {
      font-weight: 700; font-size: 0.95rem; color: var(--text);
      margin-bottom: 10px; display: flex; align-items: center; gap: 8px;
    }
    .res-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    @media (max-width: 600px) { .res-cards { grid-template-columns: 1fr; } }
    .res-card {
      padding: 12px 14px; background: var(--bg2);
      border: 1px solid var(--border); border-radius: var(--radius2);
      transition: border-color 0.2s;
    }
    .res-card:hover { border-color: var(--p); }
    .res-link {
      color: var(--p2); font-size: 0.85rem; font-weight: 500;
      text-decoration: none;
    }
    .res-link:hover { color: var(--c2); }
    .res-url { font-size: 0.72rem; color: var(--text3); margin-top: 3px; }

    /* ── COMPARE ── */
    .compare-wrap { padding: 1.5rem; }
    .compare-grid { display: grid; grid-template-columns: 1fr 1px 1fr; gap: 1.5rem; margin-top: 1.5rem; }
    .compare-divider { background: var(--border2); }
    .compare-col-title { font-weight: 700; font-size: 0.95rem; color: var(--text); margin-bottom: 1rem; }
    .compare-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 1rem; }
    .compare-summary { display: flex; flex-direction: column; gap: 8px; }
    .compare-row {
      display: flex; justify-content: space-between;
      padding: 8px 12px; background: var(--bg2);
      border-radius: var(--radius2); font-size: 0.85rem;
    }
    .compare-key { color: var(--text3); }
    .compare-val { color: var(--text); font-weight: 500; }
    .btn-compare {
      background: linear-gradient(135deg, var(--c), var(--g));
      color: white; border: none; cursor: pointer;
      padding: 10px 18px; border-radius: var(--radius);
      font-size: 0.88rem; font-weight: 600;
      font-family: 'DM Sans', sans-serif; transition: all 0.2s;
    }
    .btn-compare:hover:not(:disabled) { opacity: 0.9; }
    .btn-compare:disabled { opacity: 0.5; cursor: not-allowed; }
    @media (max-width: 700px) {
      .compare-grid { grid-template-columns: 1fr; }
      .compare-divider { display: none; }
    }

    /* ── ABOUT ── */
    .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem; }
    @media (max-width: 900px) { .about-grid { grid-template-columns: 1fr; } }
    .about-text { padding: 2rem; }
    .about-text h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.2rem; font-weight: 700;
      color: var(--p2); margin-bottom: 10px; margin-top: 1rem;
    }
    .about-text h3:first-child { margin-top: 0; }
    .about-text p { font-size: 0.92rem; color: var(--text2); line-height: 1.7; margin-bottom: 10px; }
    .about-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .about-card {
      padding: 20px; border-radius: var(--radius);
      border: 1px solid var(--border);
      transition: all 0.2s;
    }
    .about-card:hover { transform: translateY(-3px); border-color: var(--border2); }
    .ac-icon { font-size: 1.8rem; margin-bottom: 10px; }
    .ac-title { font-weight: 700; font-size: 0.9rem; color: var(--text); margin-bottom: 6px; }
    .ac-desc { font-size: 0.8rem; color: var(--text3); line-height: 1.5; }
    .innov-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    @media (max-width: 700px) { .innov-grid { grid-template-columns: repeat(2, 1fr); } }
    .innov-item {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 14px; background: var(--card2);
      border: 1px solid var(--border); border-radius: var(--radius2);
      font-size: 0.83rem; color: var(--text2); line-height: 1.4;
    }

    /* ── CONTACT ── */
    .contact-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 2rem; }
    @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr; } }
    .contact-info { padding: 2rem; }
    .contact-info h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.2rem; font-weight: 700; color: var(--text); margin-bottom: 1.2rem;
    }
    .contact-items { display: flex; flex-direction: column; gap: 12px; }
    .contact-item { display: flex; align-items: flex-start; gap: 12px; }
    .ci-icon {
      width: 36px; height: 36px; border-radius: var(--radius2);
      background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.25);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; flex-shrink: 0;
    }
    .ci-label { font-size: 0.75rem; color: var(--text3); }
    .ci-val { font-size: 0.88rem; color: var(--text); font-weight: 500; margin-top: 2px; }
    .contact-form { padding: 2rem; }
    .contact-form h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.2rem; font-weight: 700; color: var(--text); margin-bottom: 1.2rem;
    }
    .cf-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
    .cf-label { font-size: 0.82rem; font-weight: 600; color: var(--text2); }
    .cf-input, .cf-textarea {
      background: var(--bg2); border: 1px solid var(--border);
      color: var(--text); font-size: 0.9rem;
      padding: 10px 14px; border-radius: var(--radius2);
      outline: none; font-family: 'DM Sans', sans-serif;
      transition: border-color 0.2s; width: 100%;
    }
    .cf-input:focus, .cf-textarea:focus { border-color: var(--p); }
    .cf-input::placeholder, .cf-textarea::placeholder { color: var(--text3); }
    .cf-textarea { resize: vertical; min-height: 100px; }
    .btn-send {
      background: linear-gradient(135deg, var(--p), var(--c));
      color: white; border: none; cursor: pointer;
      padding: 12px 24px; border-radius: var(--radius);
      font-size: 0.9rem; font-weight: 600;
      font-family: 'DM Sans', sans-serif; transition: all 0.2s;
    }
    .btn-send:hover { opacity: 0.9; }
    .cf-success {
      margin-top: 10px; padding: 10px 14px;
      background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3);
      border-radius: var(--radius2); color: var(--g);
      font-size: 0.85rem;
    }

    /* ── FOOTER ── */
    footer {
      position: relative; z-index: 1;
      background: var(--bg2); border-top: 1px solid var(--border);
      padding: 3rem 2rem 1.5rem;
    }
    .footer-inner { max-width: 1200px; margin: 0 auto; }
    .footer-top { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 2rem; margin-bottom: 2.5rem; }
    @media (max-width: 768px) { .footer-top { grid-template-columns: 1fr 1fr; } }
    .footer-brand-name {
      font-family: 'Playfair Display', serif;
      font-size: 1.3rem; font-weight: 800;
      background: linear-gradient(135deg, var(--p2), var(--c));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 10px;
    }
    .footer-tagline { font-size: 0.85rem; color: var(--text3); line-height: 1.6; max-width: 220px; }
    .footer-col-title { font-weight: 700; font-size: 0.82rem; color: var(--text); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
    .footer-link {
      display: block; font-size: 0.85rem; color: var(--text3);
      margin-bottom: 8px; cursor: pointer; transition: color 0.2s;
      text-decoration: none;
    }
    .footer-link:hover { color: var(--p2); }
    .footer-bottom {
      border-top: 1px solid var(--border);
      padding-top: 1.5rem;
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 8px;
      font-size: 0.78rem; color: var(--text3);
    }

    /* ── ERROR TOAST ── */
    .toast {
      position: fixed; bottom: 2rem; right: 2rem; z-index: 3000;
      background: var(--card2); border: 1px solid rgba(239,68,68,0.4);
      color: var(--text); padding: 14px 20px;
      border-radius: var(--radius); font-size: 0.88rem;
      box-shadow: var(--shadow); max-width: 340px;
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    /* Misc */
    .empty-state { text-align: center; padding: 3rem; color: var(--text3); font-size: 0.9rem; }
    .no-results { padding: 2rem; text-align: center; color: var(--text3); }
    strong { color: var(--text); }
  `}</style>
);

// ─── PARTICLE BACKGROUND ──────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W, H, particles = [], raf;
    const COLORS = ["#8B5CF6", "#06B6D4", "#EC4899", "#A78BFA", "#67E8F9"];
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        a: Math.random() * 0.6 + 0.2,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + Math.round(p.a * 255).toString(16).padStart(2, "0");
        ctx.fill();
        particles.forEach(q => {
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = p.c + Math.round((1 - dist / 120) * 40).toString(16).padStart(2, "0");
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} id="particles-bg" />;
}

// ─── D3 VISUAL MAP ────────────────────────────────────────────────────────────
function CurriculumGraph({ curriculum }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const simRef = useRef(null);

  useEffect(() => {
    if (!curriculum || !curriculum.semesters?.length) return;
    const container = svgRef.current.parentElement;
    const W = container.clientWidth || 800;
    const H = 520;

    // Build nodes & links
    const nodes = [];
    const links = [];
    const codeIdx = {};
    const diffColor = { Beginner: "#10B981", Intermediate: "#F59E0B", Advanced: "#EF4444" };

    curriculum.semesters.forEach((sem) => {
      (sem.courses || []).forEach((course, ci) => {
        const id = nodes.length;
        codeIdx[course.code] = id;
        nodes.push({
          id,
          code: course.code,
          name: course.name,
          semester: sem.semester_number,
          difficulty: course.difficulty || "Intermediate",
          topics: course.topics || [],
          credits: course.credits || 4,
          semTitle: sem.semester_title || `Semester ${sem.semester_number}`,
          fx_init: ((sem.semester_number - 1) / Math.max(curriculum.semesters.length - 1, 1)) * (W - 160) + 80,
          fy_init: ((ci + 1) / ((sem.courses?.length || 1) + 1)) * H,
        });
      });
    });

    curriculum.semesters.forEach(sem => {
      (sem.courses || []).forEach(course => {
        (course.prerequisites || []).forEach(pre => {
          const src = codeIdx[pre];
          const tgt = codeIdx[course.code];
          if (src !== undefined && tgt !== undefined) {
            links.push({ source: src, target: tgt });
          }
        });
      });
    });

    // Clear previous
    const svgEl = svgRef.current;
    d3.select(svgEl).selectAll("*").remove();
    if (simRef.current) simRef.current.stop();

    const svg = d3.select(svgEl)
      .attr("width", W).attr("height", H)
      .attr("viewBox", `0 0 ${W} ${H}`);

    // Defs: arrowhead
    svg.append("defs").append("marker")
      .attr("id", "arrowhead").attr("viewBox", "0 -4 8 8")
      .attr("refX", 28).attr("refY", 0)
      .attr("markerWidth", 6).attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path").attr("d", "M0,-4L8,0L0,4")
      .attr("fill", "rgba(139,92,246,0.7)");

    // Semester lane labels (top)
    const semNums = [...new Set(nodes.map(n => n.semester))];
    const laneW = W / semNums.length;
    semNums.forEach((s, i) => {
      svg.append("rect")
        .attr("x", i * laneW + 2).attr("y", 0)
        .attr("width", laneW - 4).attr("height", H)
        .attr("fill", i % 2 === 0 ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.0)")
        .attr("rx", 0);
      svg.append("text")
        .attr("x", i * laneW + laneW / 2).attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px").attr("font-weight", "700")
        .attr("fill", "rgba(167,139,250,0.8)")
        .attr("font-family", "DM Sans, sans-serif")
        .text(`Semester ${s}`);
    });

    // Links
    const link = svg.append("g").selectAll("line").data(links).join("line")
      .attr("stroke", "rgba(139,92,246,0.4)")
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrowhead)");

    // Node groups
    const nodeG = svg.append("g").selectAll("g").data(nodes).join("g")
      .attr("cursor", "grab")
      .call(
        d3.drag()
          .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
          .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      )
      .on("mouseover", (e, d) => {
        const tooltip = tooltipRef.current;
        if (!tooltip) return;
        tooltip.style.display = "block";
        tooltip.innerHTML = `
          <div style="font-weight:700;font-size:0.85rem;margin-bottom:4px;color:#F1F5F9">${d.name}</div>
          <div style="font-size:0.75rem;color:#94A3B8;margin-bottom:6px">${d.code} · ${d.credits} Credits · ${d.difficulty}</div>
          <div style="font-size:0.75rem;color:#64748B">${d.topics.slice(0, 3).join(", ")}${d.topics.length > 3 ? "..." : ""}</div>
        `;
        tooltip.style.left = (e.pageX + 14) + "px";
        tooltip.style.top = (e.pageY - 10) + "px";
      })
      .on("mousemove", (e) => {
        const tooltip = tooltipRef.current;
        if (tooltip) {
          tooltip.style.left = (e.pageX + 14) + "px";
          tooltip.style.top = (e.pageY - 10) + "px";
        }
      })
      .on("mouseout", () => {
        if (tooltipRef.current) tooltipRef.current.style.display = "none";
      });

    // Card background
    nodeG.append("rect")
      .attr("width", 130).attr("height", 52)
      .attr("x", -65).attr("y", -26)
      .attr("rx", 8)
      .attr("fill", d => diffColor[d.difficulty] + "18")
      .attr("stroke", d => diffColor[d.difficulty])
      .attr("stroke-width", 1.5);

    // Code text
    nodeG.append("text")
      .attr("text-anchor", "middle").attr("y", -7)
      .attr("font-size", "10px").attr("font-weight", "700")
      .attr("fill", d => diffColor[d.difficulty])
      .attr("font-family", "JetBrains Mono, monospace")
      .text(d => d.code);

    // Name text (truncated)
    nodeG.append("text")
      .attr("text-anchor", "middle").attr("y", 10)
      .attr("font-size", "8px").attr("fill", "#94A3B8")
      .attr("font-family", "DM Sans, sans-serif")
      .text(d => d.name.length > 18 ? d.name.slice(0, 16) + "…" : d.name);

    // Difficulty label
    nodeG.append("text")
      .attr("text-anchor", "middle").attr("y", 24)
      .attr("font-size", "7px").attr("fill", "#64748B")
      .attr("font-family", "DM Sans, sans-serif")
      .text(d => d.difficulty);

    // Init positions
    nodes.forEach(n => { n.x = n.fx_init; n.y = n.fy_init; });

    // Simulation
    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(140))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("x", d3.forceX(d => d.fx_init).strength(0.6))
      .force("y", d3.forceY(H / 2).strength(0.08))
      .force("collision", d3.forceCollide(72))
      .on("tick", () => {
        link
          .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        nodeG.attr("transform", d =>
          `translate(${Math.max(70, Math.min(W - 70, d.x))},${Math.max(35, Math.min(H - 30, d.y))})`
        );
      });

    simRef.current = sim;
    return () => { sim.stop(); };
  }, [curriculum]);

  return (
    <div className="map-wrap glass">
      <div className="map-title">🗺️ Curriculum Prerequisites Graph</div>
      <div className="map-sub">Drag nodes to rearrange • Hover for details • Arrows show prerequisites</div>
      <div style={{ position: "relative" }}>
        <svg ref={svgRef} id="d3-graph" />
        <div ref={tooltipRef} className="d3-tooltip" style={{ display: "none", position: "fixed" }} />
      </div>
      <div className="map-legend">
        <div className="legend-item"><div className="leg-dot beg" />Beginner</div>
        <div className="legend-item"><div className="leg-dot int" />Intermediate</div>
        <div className="legend-item"><div className="leg-dot adv" />Advanced</div>
      </div>
    </div>
  );
}

// ─── CHAT COMPONENT ───────────────────────────────────────────────────────────
function ChatPanel({ curriculum }) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I've analysed your curriculum. You can ask me to refine it:\n• \"Add more practical projects to Semester 1\"\n• \"Make it more beginner-friendly\"\n• \"Add DevOps topics in the last semester\""
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    if (!curriculum) { alert("Generate a curriculum first!"); return; }

    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chat-refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curriculum, message: msg }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      const reply = data.response || data.error || "Sorry, I could not process that.";
      setMessages(prev => [...prev, { role: "ai", text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "ai",
        text: `⚠️ Connection error: ${err.message}\n\nMake sure Ollama is running with: ollama serve`
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, curriculum]);

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div className="chat-wrap glass">
      <div className="chat-header">
        <div className="chat-avatar">🤖</div>
        <div>
          <div className="chat-agent-name">Granite AI Assistant</div>
          <div className="chat-agent-status">{loading ? "Thinking…" : "Ready to refine your curriculum"}</div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            <div className="msg-bubble" style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg ai">
            <div className="msg-bubble">
              <div className="typing-dots">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-row">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ask AI to modify your curriculum…"
          disabled={loading}
        />
        <button className="chat-send" onClick={send} disabled={loading || !input.trim()}>
          Send ➤
        </button>
      </div>
    </div>
  );
}

// ─── SEMESTER + COURSE DISPLAY ────────────────────────────────────────────────
function SemesterBlock({ sem }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="semester-block">
      <div className="sem-header" onClick={() => setOpen(o => !o)}>
        <div className="sem-left">
          <div className="sem-num-badge">S{sem.semester_number}</div>
          <div>
            <div className="sem-title">{sem.semester_title || `Semester ${sem.semester_number}`}</div>
            <div className="sem-count">{(sem.courses || []).length} Courses</div>
          </div>
        </div>
        <span className={`sem-toggle ${open ? "open" : ""}`}>▼</span>
      </div>
      {open && (
        <div className="sem-courses">
          {(sem.courses || []).map((course, i) => (
            <CourseCard key={i} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }) {
  const diff = course.difficulty || "Intermediate";
  return (
    <div className="course-card">
      <div className="course-top">
        <div className="course-name">{course.name}</div>
        <span className="course-code">{course.code}</span>
      </div>
      <div className="course-meta">
        <span className="course-meta-item">📚 {course.credits || 4} Credits</span>
        <span className="course-meta-item">⏰ {course.weekly_hours || 3}h/week</span>
        <span className={`diff-badge diff-${diff}`}>{diff}</span>
      </div>
      {course.description && <div className="course-desc">{course.description}</div>}
      <div className="topics-row">
        {(course.topics || []).map((t, i) => (
          <span key={i} className="topic-chip">{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function CurrHub() {
  // Navigation
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Form state
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("");
  const [semesters, setSemesters] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("");
  const [industryFocus, setIndustryFocus] = useState("");
  const [currType, setCurrType] = useState("college");
  const [language, setLanguage] = useState("English");

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [curriculum, setCurriculum] = useState(null);
  const [activeTab, setActiveTab] = useState("curriculum");
  const [exportLoading, setExportLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Compare state
  const [compareSkill, setCompareSkill] = useState("");
  const [compareLevel, setCompareLevel] = useState("");
  const [compareResult, setCompareResult] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Contact state
  const [cfName, setCfName] = useState("");
  const [cfEmail, setCfEmail] = useState("");
  const [cfMsg, setCfMsg] = useState("");
  const [cfSent, setCfSent] = useState(false);

  // Section refs
  const homeRef = useRef(null);
  const generateRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  // Scroll tracking
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const refs = [
        { id: "contact", ref: contactRef },
        { id: "about", ref: aboutRef },
        { id: "generate", ref: generateRef },
        { id: "home", ref: homeRef },
      ];
      for (const { id, ref } of refs) {
        if (ref.current && window.scrollY >= ref.current.offsetTop - 150) {
          setActiveSection(id); break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  // Loading steps
  const STEPS = ["Requirements", "AI Generation", "Structuring", "Finalizing"];
  const STEP_MSGS = [
    "Analyzing skill and language requirements…",
    "IBM Granite 3.3 2B generating courses…",
    "Building semester structure…",
    "Finalizing curriculum data…",
  ];
  useEffect(() => {
    if (!loading) { setLoadStep(0); return; }
    setLoadStep(0);
    const t1 = setTimeout(() => setLoadStep(1), 5000);
    const t2 = setTimeout(() => setLoadStep(2), 10000);
    const t3 = setTimeout(() => setLoadStep(3), 14000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [loading]);

  // Generate curriculum
  const generate = async () => {
    if (!skill.trim()) { showToast("⚠️ Please enter a skill or subject"); return; }
    if (!level) { showToast("⚠️ Please select an education level"); return; }
    if (!semesters) { showToast("⚠️ Please select number of semesters"); return; }

    setLoading(true);
    setCurriculum(null);

    try {
      const res = await fetch(`${API}/api/generate-curriculum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: skill.trim(), level,
          semesters: parseInt(semesters),
          weekly_hours: weeklyHours.trim(),
          industry_focus: industryFocus.trim(),
          curriculum_type: currType,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Generation failed");
      setCurriculum(data.curriculum);
      setActiveTab("curriculum");
      setTimeout(() => generateRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      showToast(`❌ ${err.message}\n\nMake sure Ollama is running: ollama serve`);
    } finally {
      setLoading(false);
    }
  };

  // Export
  const exportCurriculum = async (fmt) => {
    if (!curriculum) { showToast("Generate a curriculum first!"); return; }
    setExportLoading(true);
    try {
      const res = await fetch(`${API}/api/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curriculum, format: fmt }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      const bytes = atob(data.data);
      const arr = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
      const blob = new Blob([arr], { type: data.mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = data.filename; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(`Export error: ${err.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  // Compare
  const generateCompare = async () => {
    if (!compareSkill.trim() || !compareLevel) { showToast("Enter skill and level for comparison"); return; }
    setCompareLoading(true);
    setCompareResult(null);
    try {
      const res = await fetch(`${API}/api/generate-curriculum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: compareSkill.trim(), level: compareLevel,
          semesters: curriculum?.semesters?.length || 4,
          weekly_hours: "", industry_focus: "",
          curriculum_type: currType, language,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setCompareResult(data.curriculum);
    } catch (err) {
      showToast(`Compare error: ${err.message}`);
    } finally {
      setCompareLoading(false);
    }
  };

  const clearForm = () => {
    setSkill(""); setLevel(""); setSemesters(""); setWeeklyHours(""); setIndustryFocus("");
    setCurriculum(null); setActiveTab("curriculum");
  };

  const totalCourses = curriculum?.semesters?.reduce((a, s) => a + (s.courses?.length || 0), 0) || 0;
  const totalCredits = curriculum?.semesters?.reduce((a, s) =>
    a + (s.courses || []).reduce((x, c) => x + (c.credits || 4), 0), 0) || 0;

  const hasResources = curriculum?.self_study_resources && Object.keys(curriculum.self_study_resources).length > 0;

  // Contact form
  const sendContact = (e) => {
    e.preventDefault();
    if (!cfName.trim() || !cfEmail.trim() || !cfMsg.trim()) { showToast("Please fill all fields"); return; }
    setCfSent(true);
    setCfName(""); setCfEmail(""); setCfMsg("");
    setTimeout(() => setCfSent(false), 5000);
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <>
      <GlobalStyles />
      <ParticleCanvas />

      {/* ── NAVBAR ── */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-brand" onClick={() => scrollTo(homeRef)}>
          <span className="nav-logo">⚡</span>
          <span className="nav-brand-name">CurrHub</span>
          <span className="nav-ai-badge">AI</span>
        </div>
        <div className="nav-links">
          {[["home", homeRef, "Home"], ["generate", generateRef, "Generate"],
            ["about", aboutRef, "About"], ["contact", contactRef, "Contact"]].map(([id, ref, label]) => (
            <button key={id} className={`nav-link ${activeSection === id ? "active" : ""}`}
              onClick={() => scrollTo(ref)}>{label}</button>
          ))}
        </div>
        <div className="nav-status">
          <div className="status-dot" />
          <span style={{ fontSize: "0.8rem", color: "var(--text2)" }}>IBM Granite 3.3 2B</span>
        </div>
        <button className="hamburger" onClick={() => setMobileOpen(o => !o)}>☰</button>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        {[["home", homeRef, "🏠 Home"], ["generate", generateRef, "⚡ Generate"],
          ["about", aboutRef, "ℹ️ About"], ["contact", contactRef, "📩 Contact"]].map(([id, ref, label]) => (
          <button key={id} onClick={() => scrollTo(ref)}>{label}</button>
        ))}
      </div>

      {/* ── LOADING OVERLAY ── */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-orb">
            <div className="orb-ring r1" /><div className="orb-ring r2" /><div className="orb-ring r3" />
            <div className="orb-emoji">🤖</div>
          </div>
          <div className="loading-title">IBM Granite 3.3 2B is thinking…</div>
          <div className="loading-status">{STEP_MSGS[loadStep]}</div>
          <div className="loading-bar"><div className="loading-fill" /></div>
          <div className="loading-steps">
            {STEPS.map((step, i) => (
              <div key={i} className={`lstep ${i <= loadStep ? "active" : ""}`}>{step}</div>
            ))}
          </div>
        </div>
      )}

      {/* ── HOME SECTION ── */}
      <section className="home-section section" id="home" ref={homeRef}>
        <div className="container">
          <div className="home-grid">
            <div>
              <div className="hero-badge">
                ✨ Powered by IBM Granite 3.3 2B
              </div>
              <h1 className="hero-title">
                Design <span className="grad">Intelligent</span><br />
                Curricula in Seconds
              </h1>
              <p className="hero-sub">
                College programs, self-study paths, any language, any subject —
                AI-generated semester-wise syllabi with visual maps and interactive refinement.
              </p>
              <div className="hero-btns">
                <button className="btn-primary" onClick={() => scrollTo(generateRef)}>⚡ Generate Curriculum</button>
                <button className="btn-secondary" onClick={() => scrollTo(aboutRef)}>Learn More →</button>
              </div>
              <div className="hero-stats">
                {[["6", "Export Formats"], ["3+", "Languages"], ["100%", "AI Based"]].map(([n, l]) => (
                  <div key={l} className="stat">
                    <div className="stat-num">{n}</div>
                    <div className="stat-label">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-visual">
              <div className="float-card">
                <div className="fc-icon">🧠</div>
                <div className="fc-title">ML Masters Program</div>
                <div className="fc-sub">4 Semesters • 12 Courses</div>
              </div>
              <div className="float-card">
                <div className="fc-icon">🌐</div>
                <div className="fc-title">Telugu • Hindi • English</div>
                <div className="fc-sub">Regional Language Output</div>
              </div>
              <div className="float-card">
                <div className="fc-icon">📚</div>
                <div className="fc-title">Any Skill — Unlimited</div>
                <div className="fc-sub">Blockchain, Music, Law…</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GENERATE SECTION ── */}
      <section className="section" id="generate" ref={generateRef}>
        <div className="container">
          <div className="sec-header">
            <h2 className="sec-title">Generate Your Curriculum</h2>
            <p className="sec-sub">Fill in your details — IBM Granite 3.3 2B does the rest in under 60 seconds</p>
          </div>

          <div className="gen-grid">
            {/* Form */}
            <div className="form-panel glass">
              <div className="panel-title">📝 Configure Curriculum</div>
              <div className="panel-sub">All fields except * are optional but improve output quality</div>

              {/* Type toggle */}
              <div className="type-toggle">
                <button className={`type-btn ${currType === "college" ? "active" : ""}`}
                  onClick={() => setCurrType("college")}>🏫 College Program</button>
                <button className={`type-btn ${currType === "self_study" ? "active" : ""}`}
                  onClick={() => setCurrType("self_study")}>📚 Self-Study Plan</button>
              </div>

              {/* Language */}
              <div className="lang-row">
                <span className="lang-label">🌐 Language:</span>
                {["English", "Hindi", "Telugu"].map(lang => (
                  <button key={lang}
                    className={`lang-btn ${language === lang ? "active" : ""}`}
                    onClick={() => setLanguage(lang)}>
                    {lang === "Hindi" ? "हिंदी" : lang === "Telugu" ? "తెలుగు" : lang}
                  </button>
                ))}
              </div>

              {/* Fields */}
              <div className="form-grid">
                <div className="form-group form-full">
                  <label className="form-label">🎯 Skill / Subject *</label>
                  <input className="form-input" value={skill} onChange={e => setSkill(e.target.value)}
                    placeholder="e.g., Machine Learning, Blockchain, Music Theory, Cooking…" />
                  <span className="form-hint">Type any subject — AI generates curriculum for anything</span>
                </div>
                <div className="form-group">
                  <label className="form-label">🎓 Level *</label>
                  <select className="form-select" value={level} onChange={e => setLevel(e.target.value)}>
                    <option value="">Select Level</option>
                    <option value="Diploma">Diploma</option>
                    <option value="BTech">BTech / Bachelor's</option>
                    <option value="Masters">Master's</option>
                    <option value="Certification">Professional Cert</option>
                    <option value="Bootcamp">Bootcamp</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">📅 Semesters *</label>
                  <select className="form-select" value={semesters} onChange={e => setSemesters(e.target.value)}>
                    <option value="">Select</option>
                    <option value="2">2 Semesters</option>
                    <option value="4">4 Semesters</option>
                    <option value="6">6 Semesters</option>
                    <option value="8">8 Semesters</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">⏰ Weekly Hours</label>
                  <input className="form-input" value={weeklyHours} onChange={e => setWeeklyHours(e.target.value)}
                    placeholder="e.g., 20–25 hrs/week" />
                </div>
                <div className="form-group">
                  <label className="form-label">🏭 Industry Focus</label>
                  <input className="form-input" value={industryFocus} onChange={e => setIndustryFocus(e.target.value)}
                    placeholder="e.g., AI, Healthcare, Finance" />
                </div>
              </div>

              <div className="btn-row">
                <button className="btn-generate" onClick={generate} disabled={loading}>
                  <span>⚡</span>
                  <span>{loading ? "Generating…" : "Generate Curriculum"}</span>
                </button>
                <button className="btn-clear" onClick={clearForm}>✕ Clear</button>
              </div>
            </div>

            {/* Feature cards */}
            <div className="feature-grid">
              {[
                { icon: "💬", title: "Chat Refinement", desc: "Refine with AI after generation through natural conversation" },
                { icon: "🗺️", title: "Visual Map", desc: "Interactive D3.js prerequisites graph — drag to rearrange" },
                { icon: "📦", title: "6 Export Formats", desc: "PDF, DOCX, Excel, CSV, Markdown, JSON" },
                { icon: "🌐", title: "Multilingual", desc: "Telugu, Hindi & English — regional language support" },
                { icon: "📚", title: "Free Resources", desc: "YouTube, open-source & certifications for self-study" },
                { icon: "⚖️", title: "Compare Mode", desc: "Side-by-side curriculum comparison" },
              ].map((f) => (
                <div key={f.title} className="feat-card glass">
                  <div className="feat-icon">{f.icon}</div>
                  <div className="feat-title">{f.title}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RESULTS ── */}
          {curriculum && (
            <div className="results-wrap">
              {/* Banner */}
              <div className="results-banner">
                <div className="banner-title">🎓 Curriculum Generated!</div>
                <div className="banner-stats">
                  {[
                    [curriculum.skill, "Skill"],
                    [curriculum.semesters?.length, "Semesters"],
                    [totalCourses, "Courses"],
                    [totalCredits, "Credits"],
                    [curriculum.level, "Level"],
                    [curriculum.language, "Language"],
                  ].map(([v, l]) => (
                    <div key={l}>
                      <div className="bstat-num">{v}</div>
                      <div className="bstat-label">{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export */}
              <div className="export-bar glass">
                <span className="export-label">📥 Export As:</span>
                {[["pdf","📄 PDF"], ["docx","📝 DOCX"], ["excel","📊 Excel"],
                  ["csv","📋 CSV"], ["markdown","📑 Markdown"], ["json","💾 JSON"]].map(([fmt, label]) => (
                  <button key={fmt} className="exp-btn" onClick={() => exportCurriculum(fmt)} disabled={exportLoading}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Tabs */}
              <div className="result-tabs">
                {[
                  ["curriculum", "📚 Curriculum"],
                  ["map", "🗺️ Visual Map"],
                  ["chat", "💬 Refine with AI"],
                  hasResources && ["resources", "📚 Resources"],
                  ["compare", "⚖️ Compare"],
                ].filter(Boolean).map(([id, label]) => (
                  <button key={id} className={`tab-btn ${activeTab === id ? "active" : ""}`}
                    onClick={() => setActiveTab(id)}>{label}</button>
                ))}
              </div>

              {/* Tab: Curriculum */}
              {activeTab === "curriculum" && (
                <div>
                  {(curriculum.learning_outcomes?.length > 0) && (
                    <div className="outcomes-box glass" style={{ marginBottom: "1rem" }}>
                      <div className="outcomes-title">🎯 Learning Outcomes</div>
                      <div className="outcomes-list">
                        {curriculum.learning_outcomes.map((o, i) => (
                          <span key={i} className="outcome-tag">{o}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(curriculum.semesters || []).map((sem, i) => (
                    <SemesterBlock key={i} sem={sem} />
                  ))}
                  {curriculum.capstone_project && (
                    <div className="capstone-box glass">
                      <div className="capstone-title">🎯 Capstone Project</div>
                      <div className="capstone-text">{curriculum.capstone_project}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Visual Map */}
              {activeTab === "map" && <CurriculumGraph curriculum={curriculum} />}

              {/* Tab: Chat */}
              {activeTab === "chat" && <ChatPanel curriculum={curriculum} />}

              {/* Tab: Resources */}
              {activeTab === "resources" && hasResources && (
                <div className="resources-wrap glass">
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.2rem", color: "var(--text)" }}>
                    📚 Self-Study Resources for <span style={{ color: "var(--p2)" }}>{curriculum.skill}</span>
                  </div>
                  {Object.entries(curriculum.self_study_resources || {}).map(([cat, items]) => (
                    <div key={cat} className="res-category">
                      <div className="res-cat-title">
                        {cat === "youtube" ? "▶️" : cat === "certifications" ? "🏆" : "🌐"}
                        {" "}{cat.replace("_", " ").toUpperCase()}
                      </div>
                      <div className="res-cards">
                        {items.map((item, i) => (
                          <div key={i} className="res-card">
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="res-link">
                              {item.title}
                            </a>
                            <div className="res-url">{item.url}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Compare */}
              {activeTab === "compare" && (
                <div className="compare-wrap glass">
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text)", marginBottom: "4px" }}>
                    ⚖️ Curriculum Comparison
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text3)", marginBottom: "1rem" }}>
                    Generate a second curriculum to compare side-by-side
                  </p>
                  <div className="compare-grid">
                    <div>
                      <div className="compare-col-title">Current: {curriculum.skill}</div>
                      <div className="compare-summary">
                        {[["Skill", curriculum.skill], ["Level", curriculum.level],
                          ["Semesters", curriculum.semesters?.length],
                          ["Total Courses", totalCourses], ["Language", curriculum.language],
                          ["Type", curriculum.curriculum_type?.replace("_", " ")],
                          ["Industry", curriculum.industry_focus || "General"]
                        ].map(([k, v]) => (
                          <div key={k} className="compare-row">
                            <span className="compare-key">{k}</span>
                            <span className="compare-val">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="compare-divider" />
                    <div>
                      <div className="compare-col-title">Compare With</div>
                      {!compareResult ? (
                        <div className="compare-form">
                          <input className="form-input" placeholder="New skill (e.g., Deep Learning)"
                            value={compareSkill} onChange={e => setCompareSkill(e.target.value)} />
                          <select className="form-select" value={compareLevel}
                            onChange={e => setCompareLevel(e.target.value)}>
                            <option value="">Select Level</option>
                            <option value="Diploma">Diploma</option>
                            <option value="BTech">BTech</option>
                            <option value="Masters">Masters</option>
                            <option value="Certification">Certification</option>
                          </select>
                          <button className="btn-compare" onClick={generateCompare} disabled={compareLoading}>
                            {compareLoading ? "⏳ Generating…" : "⚡ Generate & Compare"}
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="compare-summary">
                            {[["Skill", compareResult.skill], ["Level", compareResult.level],
                              ["Semesters", compareResult.semesters?.length],
                              ["Courses", compareResult.semesters?.reduce((a, s) => a + (s.courses?.length || 0), 0)],
                              ["Language", compareResult.language],
                              ["Type", compareResult.curriculum_type?.replace("_", " ")],
                            ].map(([k, v]) => (
                              <div key={k} className="compare-row">
                                <span className="compare-key">{k}</span>
                                <span className="compare-val">{v}</span>
                              </div>
                            ))}
                          </div>
                          <button className="btn-compare" style={{ marginTop: "10px" }}
                            onClick={() => { setCompareResult(null); setCompareSkill(""); setCompareLevel(""); }}>
                            🔄 Compare Again
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section className="section" id="about" ref={aboutRef}>
        <div className="container">
          <div className="sec-header">
            <div className="sec-eyebrow"></div>
            <h2 className="sec-title">About CurrHub</h2>
            <p className="sec-sub">Why we built this — and what makes it different</p>
          </div>
          <div className="about-grid">
            <div className="about-text glass">
              <h3>🎯 Our Mission</h3>
              <p>Curriculum design currently takes weeks of manual research. <strong>CurrHub</strong> uses IBM Granite 3.3 2B — running entirely on your local machine — to generate complete, structured semester-wise curricula in under 60 seconds.</p>
              <p>No cloud subscriptions. No API keys. No data sent externally. Your data stays on your machine, always.</p>
              <h3>🔬 Technology</h3>
              <p>Built on <strong>IBM Granite 3.3 2B</strong> via <strong>Ollama</strong> for local inference, a <strong>Flask</strong> Python backend with structured JSON prompting, and a React frontend with <strong>D3.js</strong> visualizations.</p>
              <h3>🌐 Region-First Design</h3>
              <p>Supporting Telugu and Hindi alongside English because millions of Indian students and educators deserve tools in their mother tongue.</p>
            </div>
            <div className="about-cards">
              {[
                { icon: "🏫", title: "College Programs", desc: "Full academic structure with credits, prerequisites, theory & practicals" },
                { icon: "📚", title: "Self-Study Paths", desc: "Practical plans with YouTube, free certs & open-source materials" },
                { icon: "🌐", title: "Any Language", desc: "Telugu, Hindi & English — regional-first design for Indian learners" },
                { icon: "♾️", title: "Any Subject", desc: "ML, Blockchain, Music Theory, Law, Cooking — truly unlimited" },
              ].map(c => (
                <div key={c.title} className="about-card glass">
                  <div className="ac-icon">{c.icon}</div>
                  <div className="ac-title">{c.title}</div>
                  <div className="ac-desc">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "2.5rem" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", textAlign: "center", marginBottom: "1.5rem" }}>
              All Innovations at a Glance
            </h3>
            <div className="innov-grid">
              {[
                ["💬", "Chat-Based Curriculum Refinement"],
                ["📦", "6 Export Formats (PDF, DOCX, Excel, CSV, MD, JSON)"],
                ["🗺️", "Visual Prerequisites Graph (D3.js)"],
                ["📱", "Fully Mobile Responsive"],
                ["🎨", "Professional Dark UI"],
                ["✨", "Particle Animations"],
                ["🏫", "College & Self-Study Modes"],
                ["🌐", "Telugu, Hindi & English Output"],
                ["📚", "Curated Free Learning Resources"],
                ["⚖️", "Curriculum Comparison Mode"],
                ["♾️", "Generate ANY Subject — Unlimited"],
              ].map(([icon, title]) => (
                <div key={title} className="innov-item">
                  <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{icon}</span>
                  <span>{title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT SECTION ── */}
      <section className="section" id="contact" ref={contactRef}>
        <div className="container">
          <div className="sec-header">
            <div className="sec-eyebrow"></div>
            <h2 className="sec-title">Get in Touch</h2>
            <p className="sec-sub">Questions, feedback, or collaboration — reach out!</p>
          </div>
          <div className="contact-grid">
            <div className="contact-info glass">
              <h3>Contact Information</h3>
              <div className="contact-items">
                {[
                  ["📧", "Email", "team@currhub.ai"],
                  ["🐙", "GitHub", "github.com/currhub"],
                ].map(([icon, label, val]) => (
                  <div key={label} className="contact-item">
                    <div className="ci-icon">{icon}</div>
                    <div>
                      <div className="ci-label">{label}</div>
                      <div className="ci-val">{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="contact-form glass">
              <h3>Send a Message</h3>
              <form onSubmit={sendContact}>
                <div className="cf-group">
                  <label className="cf-label">Your Name</label>
                  <input className="cf-input" value={cfName} onChange={e => setCfName(e.target.value)}
                    placeholder="e.g., Ravi Kumar" />
                </div>
                <div className="cf-group">
                  <label className="cf-label">Email Address</label>
                  <input type="email" className="cf-input" value={cfEmail} onChange={e => setCfEmail(e.target.value)}
                    placeholder="currhub@example.com" />
                </div>
                <div className="cf-group">
                  <label className="cf-label">Message</label>
                  <textarea className="cf-textarea" value={cfMsg} onChange={e => setCfMsg(e.target.value)}
                    rows={4} placeholder="Your feedback or question…" />
                </div>
                <button type="submit" className="btn-send">Send Message</button>
                {cfSent && <div className="cf-success">✅ Thanks! We'll get back to you soon.</div>}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-brand-name">
                <span>⚡</span> CurrHub
                <span className="nav-ai-badge">AI</span>
              </div>
              <p className="footer-tagline">AI-powered curriculum design — free, local, unlimited. For every educator.</p>
            </div>
            <div>
              <div className="footer-col-title">Product</div>
              <button className="footer-link" onClick={() => scrollTo(generateRef)}>Generate</button>
              <button className="footer-link" onClick={() => scrollTo(aboutRef)}>About</button>
              <button className="footer-link" onClick={() => scrollTo(contactRef)}>Contact</button>
            </div>
            <div>
              <div className="footer-col-title">Languages</div>
              <span className="footer-link">English</span>
              <span className="footer-link">हिंदी (Hindi)</span>
              <span className="footer-link">తెలుగు (Telugu)</span>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2025 CurrHub — AI Curriculum Generator</span>
            <span></span>
          </div>
        </div>
      </footer>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
