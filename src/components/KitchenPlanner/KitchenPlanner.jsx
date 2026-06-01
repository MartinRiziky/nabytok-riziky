import { useState, useRef, useCallback } from 'react';
import {
  CABINETS, BACKSPLASH_MATERIALS as BACKSPLASH_MAT,
  COUNTER_MATERIALS as COUNTER_MAT, BASE_IDS,
  COLORS, roomPath,
} from '../../data/planner';

function ShapeIcon({ shape, active }) {
  const c = active ? COLORS.oak : "#bbb";
  const f = active ? "rgba(196,162,101,0.12)" : "#f5f5f5";
  if (shape === "rect") return <svg viewBox="0 0 56 40"><rect x="4" y="4" width="48" height="32" rx="2" fill={f} stroke={c} strokeWidth="2"/></svg>;
  if (shape === "L-right") return <svg viewBox="0 0 56 40"><path d="M4,4 L52,4 L52,18 L26,18 L26,36 L4,36 Z" fill={f} stroke={c} strokeWidth="2" strokeLinejoin="round"/></svg>;
  if (shape === "L-left") return <svg viewBox="0 0 56 40"><path d="M4,4 L52,4 L52,36 L30,36 L30,18 L4,18 Z" fill={f} stroke={c} strokeWidth="2" strokeLinejoin="round"/></svg>;
  return <svg viewBox="0 0 56 40"><path d="M4,4 L52,4 L52,36 L42,36 L42,18 L14,18 L14,36 L4,36 Z" fill={f} stroke={c} strokeWidth="2" strokeLinejoin="round"/></svg>;
}

function KitchenPlanner() {
  const [room, setRoom] = useState({ w:400, h:300, wallH:260, shape:"rect", lW:180, lH:180, rW:180 });
  const [placed, setPlaced] = useState([]);
  const [selected, setSelected] = useState("base");
  const [selIdx, setSelIdx] = useState(null);
  const [showCounter, setShowCounter] = useState(true);
  const [cMat, setCMat] = useState("granite");
  const [cThick, setCThick] = useState(4);
  const [cOver, setCOver] = useState(2);
  const [showBs, setShowBs] = useState(true);
  const [bsMat, setBsMat] = useState("tile");
  const [winWall, setWinWall] = useState("top");

  const uidRef = useRef(1);
  const [labelPos, setLabelPos] = useState({});
  const dragRef = useRef(null); // { type:'label'|'cab', ... }
  const topSvgRef = useRef(null);
  const sideSvgRef = useRef(null);

  const sc = 0.85;
  const ss = 0.75;
  const cD = COUNTER_MAT.find(m => m.id === cMat);
  const bsD = BACKSPLASH_MAT.find(m => m.id === bsMat);
  const isL = room.shape !== "rect";
  const isU = room.shape === "U";
  const totalH = isL ? room.h + room.lH : room.h;

  // ── SVG mouse helpers ──
  const svgPt = (svg, e) => {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };

  // ── LABEL DRAG ──
  const onLabelDown = (e, uid, view) => {
    e.stopPropagation(); e.preventDefault();
    const svg = view === "top" ? topSvgRef.current : sideSvgRef.current;
    if (!svg) return;
    const pt = svgPt(svg, e);
    const k = `${uid}-${view}`;
    const cur = labelPos[k] || { dx:0, dy:0, rot:0 };
    dragRef.current = { type:'label', uid, view, sx:pt.x, sy:pt.y, sdx:cur.dx, sdy:cur.dy };
  };
  const toggleRot = (e, uid, view) => {
    e.preventDefault(); e.stopPropagation();
    const k = `${uid}-${view}`;
    setLabelPos(p => { const c = p[k]||{dx:0,dy:0,rot:0}; return {...p,[k]:{...c,rot:c.rot===0?-90:0}}; });
  };
  const lp = (uid, view) => labelPos[`${uid}-${view}`] || { dx:0, dy:0, rot:0 };

  // ── CABINET DRAG ──
  const onCabDown = (e, idx, view) => {
    e.stopPropagation(); e.preventDefault();
    const svg = view === "top" ? topSvgRef.current : sideSvgRef.current;
    if (!svg) return;
    setSelIdx(idx);
    const pt = svgPt(svg, e);
    const c = placed[idx];
    dragRef.current = { type:'cab', idx, view, sx:pt.x, sy:pt.y, origX:c.x, origY:c.y, origWallY:c.wallY||100 };
  };

  // ── UNIFIED MOVE / UP ──
  const onSvgMove = useCallback((e, view) => {
    const d = dragRef.current;
    if (!d || d.view !== view) return;
    const svg = view === "top" ? topSvgRef.current : sideSvgRef.current;
    if (!svg) return;
    const pt = svgPt(svg, e);

    if (d.type === 'label') {
      const k = `${d.uid}-${view}`;
      setLabelPos(p => ({...p, [k]: { dx:d.sdx+pt.x-d.sx, dy:d.sdy+pt.y-d.sy, rot:p[k]?.rot||0 }}));
    }
    if (d.type === 'cab') {
      const scale = view === "top" ? sc : ss;
      const dxRoom = (pt.x - d.sx) / scale;
      const dyRoom = (pt.y - d.sy) / scale;

      setPlaced(p => p.map((c,i) => {
        if (i !== d.idx) return c;

        if (view === "top") {
          if (c.id === "window") {
            const side = c.wallSide || "top";
            if (side === "top") return {...c, x:Math.max(0,Math.min(room.w-c.w, d.origX+dxRoom))};
            return {...c, y:Math.max(0,Math.min(totalH-c.w, d.origY+dyRoom))};
          }

          let nx = Math.max(0, Math.min(room.w-c.w, d.origX+dxRoom));
          let ny = Math.max(0, Math.min(totalH-(c.d||1), d.origY+dyRoom));
          const others = p.filter((_,j)=>j!==i && _.id!=="window");

          // level: base cabs on floor, wall cabs hanging — different heights, can overlap in top view
          const isBaseLevel = (id) => BASE_IDS.has(id);
          const isWallLevel = (id) => id==="wall" || id==="cornerWall";
          const isTall = (id) => id==="tall";
          const sameLevel = (a, b) => {
            if (isTall(a) || isTall(b)) return true; // tall spans both
            if (isBaseLevel(a) && isBaseLevel(b)) return true;
            if (isWallLevel(a) && isWallLevel(b)) return true;
            return false; // base vs wall = different height, no collision
          };

          // ── Collision prevention — only between same-level cabs ──
          for (const o of others) {
            if (!sameLevel(c.id, o.id)) continue;
            const overlapX = nx < o.x + o.w && nx + c.w > o.x;
            const overlapY = ny < o.y + o.d && ny + c.d > o.y;
            if (overlapX && overlapY) {
              const pushLeft = (o.x + o.w) - nx;
              const pushRight = (nx + c.w) - o.x;
              const pushUp = (o.y + o.d) - ny;
              const pushDown = (ny + c.d) - o.y;
              const minPush = Math.min(pushLeft, pushRight, pushUp, pushDown);
              if (minPush === pushLeft) nx = o.x + o.w;
              else if (minPush === pushRight) nx = o.x - c.w;
              else if (minPush === pushUp) ny = o.y + o.d;
              else ny = o.y - c.d;
            }
          }

          nx = Math.max(0, Math.min(room.w-c.w, nx));
          ny = Math.max(0, Math.min(totalH-(c.d||1), ny));
          return {...c, x:nx, y:ny};
        }

        // ── Side view drag ──
        if (c.id === "window") {
          return {...c,
            x: (c.wallSide||"top")==="top" ? Math.max(0,Math.min(room.w-c.w, d.origX+dxRoom)) : c.x,
            wallY: Math.max(0,Math.min(room.wallH-c.h, d.origWallY - dyRoom))
          };
        }
        // ── Side view — collision only, same level ──
        let nx = Math.max(0, Math.min(room.w-c.w, d.origX+dxRoom));
        const cIsBase = BASE_IDS.has(c.id) || c.id==="tall";
        const cIsWall = c.id==="wall" || c.id==="cornerWall";
        const othersS = p.filter((_,j)=>j!==i && _.id!=="window");
        for (const o of othersS) {
          const oIsBase = BASE_IDS.has(o.id) || o.id==="tall";
          const oIsWall = o.id==="wall" || o.id==="cornerWall";
          const sameLevel = (cIsBase && oIsBase) || (cIsWall && oIsWall);
          if (!sameLevel) continue;
          if (nx < o.x + o.w && nx + c.w > o.x) {
            const pL = (o.x + o.w) - nx, pR = (nx + c.w) - o.x;
            nx = pL < pR ? o.x + o.w : o.x - c.w;
          }
        }
        nx = Math.max(0, Math.min(room.w-c.w, nx));
        return {...c, x:nx};
      }));
    }
  }, [room, totalH, sc, ss]);

  const onSvgUp = useCallback(() => { dragRef.current = null; }, []);

  // ── CRUD ──
  const add = () => {
    const cab = CABINETS.find(c => c.id === selected);
    if (!cab) return;
    let nc;
    if (cab.id === "window") {
      const side = winWall;
      if (side === "top") nc = {...cab, x:(room.w-cab.w)/2, y:0, wallY:100, wallSide:"top"};
      else if (side === "left") nc = {...cab, x:0, y:(room.h-cab.w)/2, wallY:100, wallSide:"left"};
      else nc = {...cab, x:room.w, y:(room.h-cab.w)/2, wallY:100, wallSide:"right"};
    } else {
      nc = {...cab, x:20+(placed.length*35)%Math.max(10,room.w-cab.w), y: cab.id==="wall"||cab.id==="cornerWall"?10:room.h-cab.d};
      if (cab.id==="cornerBase"||cab.id==="cornerWall") nc.cornerDir = "TR";
    }
    setPlaced(p=>[...p,{...nc, uid:uidRef.current++}]);
    setSelIdx(placed.length);
  };
  const del = () => { if(selIdx!==null){setPlaced(p=>p.filter((_,i)=>i!==selIdx));setSelIdx(null);} };
  const move = (i,dx,dy) => {
    setPlaced(p=>p.map((c,j)=>{
      if(j!==i)return c;
      if(c.id==="window"){
        const side=c.wallSide||"top";
        if(side==="top") return {...c,x:Math.max(0,Math.min(room.w-c.w,c.x+dx)),wallY:Math.max(0,Math.min(room.wallH-c.h,(c.wallY||100)-dy))};
        return {...c,y:Math.max(0,Math.min(totalH-c.w,c.y+dx)),wallY:Math.max(0,Math.min(room.wallH-c.h,(c.wallY||100)-dy))};
      }
      return {...c,x:Math.max(0,Math.min(room.w-c.w,c.x+dx)),y:Math.max(0,Math.min(totalH-(c.d||1),c.y+dy))};
    }));
  };
  const upd = (i,k,v) => setPlaced(p=>p.map((c,j)=>j===i?{...c,[k]:v}:c));

  // ── Manual cabinet rotation for side view ──
  const toggleCabRot = (idx) => {
    setPlaced(p => p.map((c,i) => i===idx ? {...c, rotated: !c.rotated} : c));
  };

  // ── DRAGGABLE LABEL COMPONENT ──
  const DragLabel = ({ uid, view, lbl, baseX, baseY }) => {
    const pos = lp(uid, view);
    const fx = baseX + pos.dx, fy = baseY + pos.dy;
    const w = lbl.length * 5 + 10, h = 14;
    return (
      <g onMouseDown={e=>onLabelDown(e,uid,view)}
         onContextMenu={e=>toggleRot(e,uid,view)}
         style={{cursor:"grab"}}
         transform={pos.rot?`rotate(${pos.rot} ${fx} ${fy})`:undefined}>
        <rect x={fx-w/2} y={fy-h/2} width={w} height={h} rx="4" fill="rgba(0,0,0,0.65)"/>
        <text x={fx} y={fy+3.5} textAnchor="middle" fontSize="9" fill="#fff" fontWeight="600">{lbl}</text>
      </g>
    );
  };

  // ══════════════════════════════════════════════
  // ── TOP VIEW ──
  // ══════════════════════════════════════════════
  const renderTop = () => {
    const ox=55, oy=55;
    const svgW = room.w*sc+110, svgH = totalH*sc+110;
    const rp = roomPath(room.w*sc, room.h*sc, room.shape, room.lW*sc, room.lH*sc, room.rW*sc);
    const wins = placed.filter(c=>c.id==="window");
    return (
      <svg ref={topSvgRef} width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{maxHeight:600}}
        onMouseMove={e=>onSvgMove(e,"top")} onMouseUp={onSvgUp} onMouseLeave={onSvgUp}>
        <defs><clipPath id="rc"><path d={rp} transform={`translate(${ox},${oy})`}/></clipPath></defs>
        <path d={rp} transform={`translate(${ox},${oy})`} fill="#FBF8F3" stroke="none"/>
        <path d={rp} transform={`translate(${ox},${oy})`} fill="none" stroke="#999" strokeWidth="5"/>
        {/* room dims */}
        <text x={ox+room.w*sc/2} y={oy-14} textAnchor="middle" fontSize="10" fill="#888">{room.w} cm</text>
        <text x={ox-14} y={oy+room.h*sc/2} textAnchor="middle" fontSize="10" fill="#888"
          transform={`rotate(-90 ${ox-14} ${oy+room.h*sc/2})`}>{room.h} cm</text>
        {isL && room.shape==="L-right" && <>
          <text x={ox+room.lW*sc/2} y={oy+totalH*sc+14} textAnchor="middle" fontSize="9" fill="#B8860B">{room.lW} cm</text>
          <text x={ox-8} y={oy+room.h*sc+room.lH*sc/2} textAnchor="middle" fontSize="9" fill="#B8860B"
            transform={`rotate(-90 ${ox-8} ${oy+room.h*sc+room.lH*sc/2})`}>{room.lH} cm</text>
        </>}
        {isL && room.shape==="L-left" && <>
          <text x={ox+(room.w-room.lW/2)*sc} y={oy+totalH*sc+14} textAnchor="middle" fontSize="9" fill="#B8860B">{room.lW} cm</text>
          <text x={ox+room.w*sc+10} y={oy+room.h*sc+room.lH*sc/2} textAnchor="middle" fontSize="9" fill="#B8860B"
            transform={`rotate(90 ${ox+room.w*sc+10} ${oy+room.h*sc+room.lH*sc/2})`}>{room.lH} cm</text>
        </>}
        {isU && <>
          <text x={ox+room.lW*sc/2} y={oy+totalH*sc+14} textAnchor="middle" fontSize="9" fill="#B8860B">{room.lW} cm</text>
          <text x={ox+(room.w-room.rW/2)*sc} y={oy+totalH*sc+14} textAnchor="middle" fontSize="9" fill="#B8860B">{room.rW} cm</text>
          <text x={ox-8} y={oy+room.h*sc+room.lH*sc/2} textAnchor="middle" fontSize="9" fill="#B8860B"
            transform={`rotate(-90 ${ox-8} ${oy+room.h*sc+room.lH*sc/2})`}>{room.lH} cm</text>
        </>}
        {/* windows */}
        {wins.map((w,i)=>{const idx=placed.indexOf(w);const side=w.wallSide||"top";const sel=selIdx===idx;
          const common = {style:{cursor:"grab"},onMouseDown:e=>onCabDown(e,idx,"top")};
          if(side==="top") return(
            <g key={"w"+i} {...common}>
              <rect x={ox+w.x*sc} y={oy-3} width={w.w*sc} height={10} fill="#A8D8EA" stroke={sel?"#B8860B":"#6BAFCC"} strokeWidth={sel?2.5:1.5} rx="2"/>
              <line x1={ox+(w.x+w.w/2)*sc} y1={oy-3} x2={ox+(w.x+w.w/2)*sc} y2={oy+7} stroke="#6BAFCC" strokeWidth="1"/>
              <text x={ox+(w.x+w.w/2)*sc} y={oy-8} textAnchor="middle" fontSize="8" fill="#5A9AB5" fontWeight="600">OKNO {w.w}</text>
            </g>);
          if(side==="left") return(
            <g key={"w"+i} {...common}>
              <rect x={ox-3} y={oy+w.y*sc} width={10} height={w.w*sc} fill="#A8D8EA" stroke={sel?"#B8860B":"#6BAFCC"} strokeWidth={sel?2.5:1.5} rx="2"/>
              <text x={ox-10} y={oy+(w.y+w.w/2)*sc} textAnchor="middle" fontSize="7" fill="#5A9AB5" fontWeight="600"
                transform={`rotate(-90 ${ox-10} ${oy+(w.y+w.w/2)*sc})`}>OKNO {w.w}</text>
            </g>);
          return(
            <g key={"w"+i} {...common}>
              <rect x={ox+room.w*sc-7} y={oy+w.y*sc} width={10} height={w.w*sc} fill="#A8D8EA" stroke={sel?"#B8860B":"#6BAFCC"} strokeWidth={sel?2.5:1.5} rx="2"/>
              <text x={ox+room.w*sc+12} y={oy+(w.y+w.w/2)*sc} textAnchor="middle" fontSize="7" fill="#5A9AB5" fontWeight="600"
                transform={`rotate(90 ${ox+room.w*sc+12} ${oy+(w.y+w.w/2)*sc})`}>OKNO {w.w}</text>
            </g>);
        })}
        {/* cabinets – draggable */}
        <g clipPath="url(#rc)">
          {placed.filter(c=>c.id!=="window").map((c,i)=>{
            const oi=placed.indexOf(c);const ib=BASE_IDS.has(c.id);
            const isWallCab = c.id==="wall"||c.id==="cornerWall";
            const isCorner = c.id==="cornerBase"||c.id==="cornerWall";
            const cx = ox+c.x*sc, cy2 = oy+c.y*sc;
            const cw = c.w*sc, cd = c.d*sc;
            // wall cabs: dashed border, lighter fill
            const fillOp = isWallCab ? 0.45 : 0.75;
            const dashArr = isWallCab ? "4 2" : "none";
            const strokeCol = selIdx===oi ? "#B8860B" : isWallCab ? "#8B7B55" : "#8B7355";

            return(
              <g key={i} onMouseDown={e=>onCabDown(e,oi,"top")} style={{cursor:"grab"}}>
                {ib&&showCounter&&<rect x={ox+(c.x-cOver)*sc} y={oy+(c.y-cOver)*sc}
                  width={(c.w+cOver*2)*sc} height={(c.d+cOver)*sc}
                  fill={cD?.top||"#555"} fillOpacity={0.25} rx="2"/>}

                {/* Corner cabinet – L-shape with 4 rotation directions */}
                {isCorner ? (()=>{
                  const cut = 0.45;
                  const cutW = c.w * cut * sc, cutD = c.d * cut * sc;
                  const dir = c.cornerDir || "TR"; // TL, TR, BL, BR — where the cutout is
                  let path;
                  if (dir === "TR") {
                    path = `M${cx},${cy2} L${cx+cw-cutW},${cy2} L${cx+cw-cutW},${cy2+cutD} L${cx+cw},${cy2+cutD} L${cx+cw},${cy2+cd} L${cx},${cy2+cd} Z`;
                  } else if (dir === "TL") {
                    path = `M${cx+cutW},${cy2} L${cx+cw},${cy2} L${cx+cw},${cy2+cd} L${cx},${cy2+cd} L${cx},${cy2+cutD} L${cx+cutW},${cy2+cutD} Z`;
                  } else if (dir === "BR") {
                    path = `M${cx},${cy2} L${cx+cw},${cy2} L${cx+cw},${cy2+cd-cutD} L${cx+cw-cutW},${cy2+cd-cutD} L${cx+cw-cutW},${cy2+cd} L${cx},${cy2+cd} Z`;
                  } else {
                    path = `M${cx},${cy2} L${cx+cw},${cy2} L${cx+cw},${cy2+cd} L${cx+cutW},${cy2+cd} L${cx+cutW},${cy2+cd-cutD} L${cx},${cy2+cd-cutD} Z`;
                  }
                  // diagonal line coords
                  const dl = dir==="TR" ? [cx+cw-cutW,cy2, cx+cw,cy2+cutD]
                           : dir==="TL" ? [cx+cutW,cy2, cx,cy2+cutD]
                           : dir==="BR" ? [cx+cw-cutW,cy2+cd, cx+cw,cy2+cd-cutD]
                           : [cx+cutW,cy2+cd, cx,cy2+cd-cutD];
                  const arrow = dir==="TR"?"◥":dir==="TL"?"◤":dir==="BR"?"◢":"◣";
                  return <>
                    <path d={path} fill={c.color} fillOpacity={fillOp}
                      stroke={strokeCol} strokeWidth={selIdx===oi?2.5:1.5} strokeDasharray={dashArr} strokeLinejoin="round"/>
                    <line x1={dl[0]} y1={dl[1]} x2={dl[2]} y2={dl[3]}
                      stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="3 2"/>
                    <text x={cx+cw/2} y={cy2+cd/2+3} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.6)" fontWeight="700">
                      {arrow}
                    </text>
                  </>;
                })() : (
                  /* Normal rectangular cabinet */
                  <rect x={cx} y={cy2} width={cw} height={cd}
                    fill={c.color} fillOpacity={fillOp}
                    stroke={strokeCol} strokeWidth={selIdx===oi?2.5:1} rx="3"
                    strokeDasharray={dashArr}/>
                )}

                {/* wall cab indicator text */}
                {isWallCab && !isCorner && (
                  <text x={cx+cw/2} y={cy2+8} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.5)" fontWeight="600" letterSpacing="1">HORNÁ</text>
                )}

                {c.id==="sink"&&<ellipse cx={cx+cw/2} cy={cy2+cd/2}
                  rx={cw*0.3} ry={cd*0.3} fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.6"/>}
                {c.id==="dish"&&<>
                  <line x1={cx+10*sc} y1={cy2+cd/2} x2={cx+cw-10*sc} y2={cy2+cd/2} stroke="#fff" strokeWidth="1" opacity="0.5"/>
                  <line x1={cx+10*sc} y1={cy2+cd/2-8*sc} x2={cx+cw-10*sc} y2={cy2+cd/2-8*sc} stroke="#fff" strokeWidth="1" opacity="0.5"/>
                </>}
                <DragLabel uid={c.uid} view="top" lbl={`${c.w}×${c.d}`}
                  baseX={cx+cw/2}
                  baseY={isWallCab?cy2+cd*0.55:cy2+cd*0.65}/>
              </g>);
          })}
        </g>
        {placed.length===0&&<text x={ox+room.w*sc/2} y={oy+totalH*sc/2} textAnchor="middle" fontSize="12" fill="#bbb">Pridajte skrinky tlačidlom nižšie</text>}
      </svg>
    );
  };

  // ══════════════════════════════════════════════
  // ── SIDE VIEW ──
  // ══════════════════════════════════════════════
  const renderSide = () => {
    const wH=room.wallH, sW=room.w, s=ss;
    const svgW=sW*s+100, svgH=wH*s+100, ox=50, oy=50;
    const flY=oy+wH*s;
    const sorted=[...placed].sort((a,b)=>a.x-b.x);
    const bases=sorted.filter(c=>BASE_IDS.has(c.id));
    const walls=sorted.filter(c=>c.id==="wall"||c.id==="cornerWall");
    const wins=sorted.filter(c=>c.id==="window");
    const ctY=flY-(85+cThick)*s;
    const wcbY=flY-140*s;
    return(
      <svg ref={sideSvgRef} width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{maxHeight:600}}
        onMouseMove={e=>onSvgMove(e,"side")} onMouseUp={onSvgUp} onMouseLeave={onSvgUp}>
        <defs>
          <pattern id="ts" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill={bsD?.color||"#D6CFC4"}/><line x1="0" y1="10" x2="10" y2="10" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5"/><line x1="10" y1="0" x2="10" y2="10" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5"/></pattern>
          <pattern id="bs2" width="16" height="8" patternUnits="userSpaceOnUse"><rect width="16" height="8" fill={bsD?.color||"#C4A88A"}/><rect x="0" y="0" width="7.5" height="3.5" rx="0.5" fill="rgba(0,0,0,0.06)"/><rect x="8.5" y="0" width="7.5" height="3.5" rx="0.5" fill="rgba(0,0,0,0.06)"/><rect x="4" y="4.5" width="7.5" height="3.5" rx="0.5" fill="rgba(0,0,0,0.06)"/></pattern>
          <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={bsD?.color||"#C8DDE6"} stopOpacity="0.9"/><stop offset="100%" stopColor={bsD?.color||"#C8DDE6"} stopOpacity="0.6"/></linearGradient>
          <pattern id="ws" width="6" height="20" patternUnits="userSpaceOnUse"><rect width="6" height="20" fill={bsD?.color||"#B89A6A"}/><line x1="2" y1="0" x2="2" y2="20" stroke="rgba(0,0,0,0.07)" strokeWidth="1"/></pattern>
        </defs>
        <rect x={ox} y={oy} width={sW*s} height={wH*s} fill="#F5F0E8" stroke="#999" strokeWidth="5"/>
        {/* L/U indicators */}
        {isL&&!isU&&<g>
          <rect x={ox+(room.shape==="L-right"?0:(room.w-room.lW)*s)} y={flY} width={room.lW*s} height={14}
            fill="rgba(196,162,101,0.12)" stroke="var(--oak)" strokeWidth="1" strokeDasharray="4 2" rx="2"/>
          <text x={ox+(room.shape==="L-right"?room.lW*s/2:(room.w-room.lW/2)*s)} y={flY+11}
            textAnchor="middle" fontSize="8" fill="var(--oak-dark)" fontWeight="600">L-rameno ↓ {room.lW}×{room.lH}</text>
        </g>}
        {isU&&<g>
          <rect x={ox} y={flY} width={room.lW*s} height={14} fill="rgba(196,162,101,0.12)" stroke="var(--oak)" strokeWidth="1" strokeDasharray="4 2" rx="2"/>
          <text x={ox+room.lW*s/2} y={flY+11} textAnchor="middle" fontSize="7" fill="var(--oak-dark)" fontWeight="600">↓ ľavé {room.lW}×{room.lH}</text>
          <rect x={ox+(room.w-room.rW)*s} y={flY} width={room.rW*s} height={14} fill="rgba(196,162,101,0.12)" stroke="var(--oak)" strokeWidth="1" strokeDasharray="4 2" rx="2"/>
          <text x={ox+(room.w-room.rW/2)*s} y={flY+11} textAnchor="middle" fontSize="7" fill="var(--oak-dark)" fontWeight="600">↓ pravé {room.rW}×{room.lH}</text>
        </g>}
        {/* windows */}
        {wins.map((w,i)=>{const wy=flY-((w.wallY||100)+w.h)*s;const oi=placed.indexOf(w);const side=w.wallSide||"top";const sel=selIdx===oi;
          if(side==="top") return(
            <g key={"sw"+i} onMouseDown={e=>onCabDown(e,oi,"side")} style={{cursor:"grab"}}>
              <rect x={ox+w.x*s} y={wy} width={w.w*s} height={w.h*s} fill="#D4EFFC" stroke={sel?"#B8860B":"#7CBFD6"} strokeWidth={sel?2.5:2} rx="2"/>
              <line x1={ox+(w.x+w.w/2)*s} y1={wy} x2={ox+(w.x+w.w/2)*s} y2={wy+w.h*s} stroke="#7CBFD6" strokeWidth="1.5"/>
              <line x1={ox+w.x*s} y1={wy+w.h*s/2} x2={ox+(w.x+w.w)*s} y2={wy+w.h*s/2} stroke="#7CBFD6" strokeWidth="1.5"/>
              <rect x={ox+w.x*s+3} y={wy+3} width={w.w*s/2-5} height={w.h*s/2-5} fill="#E8F6FF" rx="1" opacity="0.5"/>
              <text x={ox+(w.x+w.w/2)*s} y={wy-6} textAnchor="middle" fontSize="8" fill="#5A9AB5" fontWeight="600">OKNO {w.w}×{w.h}</text>
            </g>);
          const edgeX=side==="left"?ox-4:ox+sW*s-4;
          return(
            <g key={"sw"+i} onMouseDown={e=>onCabDown(e,oi,"side")} style={{cursor:"grab"}}>
              <rect x={edgeX} y={wy} width={8} height={w.h*s} fill="#A8D8EA" stroke={sel?"#B8860B":"#6BAFCC"} strokeWidth={sel?2.5:1.5} rx="2"/>
              <text x={edgeX+(side==="left"?-6:14)} y={wy+w.h*s/2} textAnchor="middle" fontSize="7" fill="#5A9AB5" fontWeight="600"
                transform={`rotate(${side==="left"?-90:90} ${edgeX+(side==="left"?-6:14)} ${wy+w.h*s/2})`}>
                {side==="left"?"ľavá":"pravá"} {w.w}×{w.h}
              </text>
            </g>);
        })}
        {/* backsplash */}
        {showBs&&bases.length>0&&(()=>{
          const backBases=bases.filter(c=>!c.rotated);
          if(!backBases.length)return null;
          const mn=Math.min(...backBases.map(c=>c.x));const mx=Math.max(...backBases.map(c=>c.x+c.w));
          const bf=bsD?.pat==="glass"?"url(#gg)":bsD?.pat==="brick"?"url(#bs2)":bsD?.pat==="wood"?"url(#ws)":"url(#ts)";
          const by=walls.length>0?wcbY:ctY-55*s;const bh=ctY-by;
          return bh>0?<rect x={ox+mn*s} y={by} width={(mx-mn)*s} height={bh} fill={bf} stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" rx="1"/>:null;
        })()}
        {/* wall height dim */}
        <text x={ox+sW*s+16} y={oy+wH*s/2} fontSize="10" fill="#888" transform={`rotate(90 ${ox+sW*s+16} ${oy+wH*s/2})`} textAnchor="middle">{wH} cm</text>
        {/* cabinets – draggable, manually rotatable */}
        {sorted.filter(c=>c.id!=="window").map((c,i)=>{
          const oi=placed.indexOf(c);const ib=BASE_IDS.has(c.id);
          const isRot = !!c.rotated;

          let cx, cy, cw, ch;
          if(isRot) {
            cw = c.d; ch = c.h;
            cx = ox+c.x*s;
            cy = (c.id==="wall"||c.id==="cornerWall") ? flY-(140+ch)*s : flY-ch*s;
          } else {
            cw = c.w; ch = c.h;
            cx = ox+c.x*s;
            cy = (c.id==="wall"||c.id==="cornerWall") ? flY-(140+ch)*s : flY-ch*s;
          }

          return(
            <g key={i} onMouseDown={e=>onCabDown(e,oi,"side")} style={{cursor:"grab"}}>
              <rect x={cx} y={cy} width={cw*s} height={ch*s} fill={c.color} fillOpacity={isRot?0.5:0.8}
                stroke={selIdx===oi?"#B8860B":"#8B7355"} strokeWidth={selIdx===oi?2.5:1} rx="2"
                strokeDasharray={isRot?"4 2":"none"}/>
              {/* door lines for back-wall cabs */}
              {!isRot&&(c.id==="base"||c.id==="wall"||c.id==="cornerBase"||c.id==="cornerWall"||c.id==="tall")&&cw>=40&&<>
                <line x1={cx+cw*s/2} y1={cy+4} x2={cx+cw*s/2} y2={cy+ch*s-4} stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
                <line x1={cx+cw*s/2-1.5*s} y1={cy+ch*s*0.4} x2={cx+cw*s/2-1.5*s} y2={cy+ch*s*0.6} stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
                <line x1={cx+cw*s/2+1.5*s} y1={cy+ch*s*0.4} x2={cx+cw*s/2+1.5*s} y2={cy+ch*s*0.6} stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
              </>}
              {c.id==="sink"&&!isRot&&<rect x={cx+10*s} y={cy+6} width={(cw-20)*s} height={12} fill="none" stroke="#fff" strokeWidth="1.5" rx="4" opacity="0.5"/>}
              {c.id==="dish"&&!isRot&&<>
                <rect x={cx+5*s} y={cy+ch*s*0.15} width={(cw-10)*s} height={ch*s*0.45} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" rx="2"/>
                <rect x={cx+5*s} y={cy+ch*s*0.65} width={(cw-10)*s} height={ch*s*0.25} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" rx="2"/>
                <circle cx={cx+cw*s/2} cy={cy+ch*s*0.08} r="2.5" fill="rgba(100,200,100,0.7)"/>
              </>}
              {c.id==="oven"&&!isRot&&<>
                <rect x={cx+6*s} y={cy+ch*s*0.12} width={(cw-12)*s} height={ch*s*0.6} fill="rgba(80,80,80,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" rx="2"/>
              </>}
              {/* countertop */}
              {ib&&showCounter&&!isRot&&<rect x={cx-cOver*s} y={cy-cThick*s} width={(cw+cOver*2)*s} height={cThick*s}
                fill={cD?.color||"#4A4A4A"} stroke={cD?.top||"#555"} strokeWidth="0.5" rx="1"/>}
              {ib&&showCounter&&isRot&&<rect x={cx} y={cy-cThick*s} width={cw*s} height={cThick*s}
                fill={cD?.color||"#4A4A4A"} fillOpacity="0.5" stroke={cD?.top||"#555"} strokeWidth="0.5" rx="1" strokeDasharray="3 2"/>}
              {/* side wall indicator text */}
              {isRot&&<text x={cx+cw*s/2} y={cy-cThick*s-4} textAnchor="middle" fontSize="7" fill="var(--oak)" fontWeight="600">
                ↻ otočená
              </text>}
              {/* draggable label */}
              <DragLabel uid={c.uid} view="side" lbl={isRot?`${c.d}×${c.h} ↻`:`${c.w}×${c.h}`}
                baseX={cx+cw*s/2}
                baseY={(c.id==="wall"||c.id==="cornerWall")?cy+14:c.id==="tall"?cy+ch*s/2:cy+ch*s-14}/>
            </g>);
        })}
        {/* counter height dim */}
        {showCounter&&bases.length>0&&(()=>{const t=85+cThick;const dx=ox+sW*s+4;return(
          <g><line x1={dx} y1={flY} x2={dx} y2={flY-t*s} stroke="#B8860B" strokeWidth="1" strokeDasharray="3 2"/>
          <text x={dx+4} y={flY-t*s/2} fontSize="8" fill="#B8860B" transform={`rotate(90 ${dx+4} ${flY-t*s/2})`} textAnchor="middle">{t} cm</text></g>);
        })()}
        {placed.length===0&&<text x={ox+sW*s/2} y={oy+wH*s/2} textAnchor="middle" fontSize="12" fill="#bbb">Bokorys kuchyne</text>}
      </svg>
    );
  };

  // ══════════════════════════════════════════════
  // ── CONTROLS UI ──
  // ══════════════════════════════════════════════
  return(
    <div className="planner-wrap">
      <div style={{marginBottom:24}}>
        <p className="section-label">Tvar miestnosti</p>
        <div className="shape-selector">
          {[{id:"rect",label:"Obdĺžnik"},{id:"L-right",label:"L – ľavá"},{id:"L-left",label:"L – pravá"},{id:"U",label:"U – tvar"}].map(sh=>(
            <div key={sh.id} className={`shape-opt ${room.shape===sh.id?"active":""}`}
              onClick={()=>setRoom(r=>({...r,shape:sh.id}))}>
              <ShapeIcon shape={sh.id} active={room.shape===sh.id}/><span>{sh.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{marginBottom:24}}>
        <p className="section-label">Rozmery miestnosti</p>
        <div className="planner-controls">
          <div className="control-group"><label>Šírka (cm)</label>
            <input type="number" value={room.w} min={100} max={800} onChange={e=>setRoom(r=>({...r,w:+e.target.value||100}))}/></div>
          <div className="control-group"><label>Hĺbka (cm)</label>
            <input type="number" value={room.h} min={100} max={600} onChange={e=>setRoom(r=>({...r,h:+e.target.value||100}))}/></div>
          <div className="control-group"><label>Výška steny (cm)</label>
            <input type="number" value={room.wallH} min={200} max={350} onChange={e=>setRoom(r=>({...r,wallH:+e.target.value||200}))}/></div>
          {isL&&<>
            <div className="control-group"><label>{isU?"Ľavé rameno – šírka":"L – šírka ramena"} (cm)</label>
              <input type="number" value={room.lW} min={60} max={room.w-60} onChange={e=>setRoom(r=>({...r,lW:+e.target.value||60}))}/></div>
            <div className="control-group"><label>{isU?"Hĺbka ramien":"L – hĺbka ramena"} (cm)</label>
              <input type="number" value={room.lH} min={60} max={500} onChange={e=>setRoom(r=>({...r,lH:+e.target.value||60}))}/></div>
          </>}
          {isU&&<div className="control-group"><label>Pravé rameno – šírka (cm)</label>
            <input type="number" value={room.rW} min={60} max={room.w-room.lW-20} onChange={e=>setRoom(r=>({...r,rW:+e.target.value||60}))}/></div>}
        </div>
      </div>
      <div style={{marginBottom:20}}>
        <p className="section-label">Vybavenie</p>
        <div className="toggle-row">
          <div className={`toggle-item ${showCounter?"on":""}`} onClick={()=>setShowCounter(v=>!v)}>
            <div className="toggle-dot"/> Pracovná doska</div>
          <div className={`toggle-item ${showBs?"on":""}`} onClick={()=>setShowBs(v=>!v)}>
            <div className="toggle-dot"/> Obkladový panel</div>
        </div>
        {showCounter&&<div className="planner-controls" style={{marginBottom:12}}>
          <div className="control-group"><label>Materiál dosky</label>
            <select value={cMat} onChange={e=>setCMat(e.target.value)}>{COUNTER_MAT.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select></div>
          <div className="control-group"><label>Hrúbka dosky (cm)</label>
            <input type="number" value={cThick} min={2} max={8} onChange={e=>setCThick(Math.max(2,Math.min(8,+e.target.value||4)))}/></div>
          <div className="control-group"><label>Presah dosky (cm)</label>
            <input type="number" value={cOver} min={0} max={10} onChange={e=>setCOver(Math.max(0,Math.min(10,+e.target.value||0)))}/></div>
        </div>}
        {showBs&&<div className="planner-controls" style={{marginBottom:0}}>
          <div className="control-group"><label>Materiál panelu</label>
            <select value={bsMat} onChange={e=>setBsMat(e.target.value)}>{BACKSPLASH_MAT.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select></div>
        </div>}
      </div>
      <p className="section-label">Pridať prvky</p>
      <div className="cabinet-palette">
        {CABINETS.map(c=><button key={c.id} className={`cab-btn ${selected===c.id?"active":""}`} onClick={()=>setSelected(c.id)}>{c.label}</button>)}
        {selected==="window"&&<>
          {["top","left","right"].map(s=>(
            <button key={s} className={`cab-btn ${winWall===s?"active":""}`} onClick={()=>setWinWall(s)}
              style={{fontSize:11}}>{s==="top"?"▬ Zadná":s==="left"?"▮ Ľavá":"▮ Pravá"}</button>
          ))}
        </>}
        <button className="btn btn-primary" style={{padding:"8px 20px",fontSize:13}} onClick={add}>+ Pridať</button>
        {selIdx!==null&&<button className="btn btn-outline" style={{padding:"8px 16px",fontSize:13,color:"var(--error)",borderColor:"var(--error)"}} onClick={del}>✕ Odstrániť</button>}
      </div>
      {selIdx!==null&&placed[selIdx]&&(
        <div style={{background:"#fff",padding:16,borderRadius:12,marginBottom:20,border:"1px solid var(--stone)"}}>
          <p style={{fontSize:13,fontWeight:600,color:"var(--oak-dark)",marginBottom:12}}>Upraviť: {placed[selIdx].label}
            {placed[selIdx].id==="window"&&<span style={{fontWeight:400,color:"var(--text-muted)"}}> · {(placed[selIdx].wallSide||"top")==="top"?"zadná":(placed[selIdx].wallSide)==="left"?"ľavá":"pravá"} stena</span>}
          </p>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            {[{key:"w",label:"Šírka (cm)"},{key:"h",label:"Výška (cm)"},
              ...(placed[selIdx].id!=="window"?[{key:"d",label:"Hĺbka (cm)"}]:[])
            ].map(({key,label})=>(
              <div key={key} className="control-group" style={{flex:"1 1 100px"}}>
                <label>{label}</label>
                <input type="number" value={placed[selIdx][key]} min={10} max={300} onChange={e=>upd(selIdx,key,+e.target.value||10)}/>
              </div>))}
            {placed[selIdx].id!=="window"&&<>
              <div className="control-group" style={{flex:"1 1 100px"}}><label>Pozícia X</label>
                <input type="number" value={Math.round(placed[selIdx].x)} min={0} max={room.w} onChange={e=>upd(selIdx,"x",+e.target.value||0)}/></div>
              <div className="control-group" style={{flex:"1 1 100px"}}><label>Pozícia Y</label>
                <input type="number" value={Math.round(placed[selIdx].y)} min={0} max={totalH} onChange={e=>upd(selIdx,"y",+e.target.value||0)}/></div>
            </>}
            {placed[selIdx].id==="window"&&<>
              <div className="control-group" style={{flex:"1 1 100px"}}><label>Pozícia na stene</label>
                <input type="number" value={Math.round((placed[selIdx].wallSide||"top")==="top"?placed[selIdx].x:placed[selIdx].y)} min={0}
                  max={(placed[selIdx].wallSide||"top")==="top"?room.w:totalH}
                  onChange={e=>{const k=(placed[selIdx].wallSide||"top")==="top"?"x":"y";upd(selIdx,k,+e.target.value||0);}}/></div>
              <div className="control-group" style={{flex:"1 1 100px"}}><label>Výška od podlahy</label>
                <input type="number" value={placed[selIdx].wallY||100} min={0} max={room.wallH} onChange={e=>upd(selIdx,"wallY",+e.target.value||80)}/></div>
              <div className="control-group" style={{flex:"1 1 120px"}}><label>Stena</label>
                <select value={placed[selIdx].wallSide||"top"} onChange={e=>upd(selIdx,"wallSide",e.target.value)}>
                  <option value="top">Zadná stena</option><option value="left">Ľavá stena</option><option value="right">Pravá stena</option>
                </select></div>
            </>}
            <div style={{display:"flex",gap:6,alignItems:"flex-end",paddingBottom:2}}>
              <button className="btn btn-dark" style={{padding:"8px 12px",fontSize:13}} onClick={()=>move(selIdx,-10,0)}>◀</button>
              <button className="btn btn-dark" style={{padding:"8px 12px",fontSize:13}} onClick={()=>move(selIdx,10,0)}>▶</button>
              <button className="btn btn-dark" style={{padding:"8px 12px",fontSize:13}} onClick={()=>move(selIdx,0,-10)}>▲</button>
              <button className="btn btn-dark" style={{padding:"8px 12px",fontSize:13}} onClick={()=>move(selIdx,0,10)}>▼</button>
              {placed[selIdx].id!=="window"&&(
                <button className="btn" onClick={()=>toggleCabRot(selIdx)}
                  style={{padding:"8px 14px",fontSize:13,
                    background:placed[selIdx].rotated?"var(--oak)":"#fff",
                    color:placed[selIdx].rotated?"#fff":"var(--oak-dark)",
                    border:"1px solid var(--oak)"}}>
                  ↻ {placed[selIdx].rotated?"Otočená":"Otočiť"}
                </button>
              )}
              {(placed[selIdx].id==="cornerBase"||placed[selIdx].id==="cornerWall")&&(()=>{
                const dirs = ["TL","TR","BR","BL"];
                const labels = {"TL":"◤ Ľavý horný","TR":"◥ Pravý horný","BR":"◢ Pravý dolný","BL":"◣ Ľavý dolný"};
                const cur = placed[selIdx].cornerDir || "TR";
                const next = dirs[(dirs.indexOf(cur)+1)%4];
                return <button className="btn" onClick={()=>upd(selIdx,"cornerDir",next)}
                  style={{padding:"8px 14px",fontSize:12,
                    background:"#fff",color:"var(--oak-dark)",border:"1px solid var(--oak)"}}>
                  {labels[cur]} ↻
                </button>;
              })()}
            </div>
          </div>
        </div>
      )}
      <div className="planner-views" style={{gridTemplateColumns:"1fr"}}>
        <div className="planner-view"><h4>📐 Pôdorys (zhora)</h4><div className="planner-canvas">{renderTop()}</div></div>
        <div className="planner-view"><h4>📏 Bokorys (zboku)</h4><div className="planner-canvas">{renderSide()}</div></div>
      </div>
      <div style={{marginTop:24,padding:16,background:"rgba(196,162,101,0.08)",borderRadius:12,fontSize:13,color:"var(--text-muted)"}}>
        <strong style={{color:"var(--oak-dark)"}}>💡 Ovládanie:</strong> Skrinky ťahajte myšou — <strong>nepustí cez inú skrinku</strong>. Štítky rozmerov tiež ťahajte, pravým klikom otočíte. Tlačidlo ↻ otočí skrinku bokom.
        {isL&&!isU&&<span> · Tvar: <strong>{room.shape==="L-right"?"L-ľavá":"L-pravá"}</strong> ({room.lW}×{room.lH} cm)</span>}
        {isU&&<span> · Tvar: <strong>U</strong> (ľavé {room.lW} cm, pravé {room.rW} cm, hĺbka {room.lH} cm)</span>}
        {showCounter&&<span> · Doska: <strong>{cD?.label}</strong> ({cThick} cm)</span>}
        {showBs&&<span> · Panel: <strong>{bsD?.label}</strong></span>}
        <br/>Prvkov: <strong>{placed.length}</strong>
        {placed.filter(c=>BASE_IDS.has(c.id)).length>0&&<span> · Šírka linky: <strong>{placed.filter(c=>BASE_IDS.has(c.id)).reduce((s,c)=>s+c.w,0)} cm</strong></span>}
      </div>
    </div>
  );
}

export default KitchenPlanner;
