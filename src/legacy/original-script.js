// ================= GLOBAL STATE =================

const state = {

    currentUser: null,

    darkMode: false,

    notifications: [],

    currentWeek: 35,

    tasks: [],

    blocks: [],

    selectedTasks: new Set(),

    charts: {},

    presentationSlide: 0,

    onboardingStep: 1,

    onboardingComplete: false,

    autoOptimize: false,

    approvalSelection: new Set(),

    approvals: {},

    auditRecords: []

};

// ================= DATA =================

const taskData = {

    T102: { title: "T102 · Critical Track Defect", priority: "CRITICAL", department: "Engineering", corridor: "C1", duration: "60 min", due: "Overdue by 3 days", risk: 92, block: "B-042", reason: "High safety criticality, overdue maintenance, high asset importance and potential operational impact." },

    S143: { title: "S143 · Signal Maintenance", priority: "HIGH", department: "S&T", corridor: "C1", duration: "45 min", due: "Due today", risk: 89, block: "B-042", reason: "High asset criticality and located in the same C1 planning area as T102, creating a possible coordination opportunity." },

    O221: { title: "O221 · OHE Inspection", priority: "MEDIUM", department: "Traction", corridor: "C1", duration: "60 min", due: "Due tomorrow", risk: 84, block: "B-042", reason: "Important traction asset inspection. It can potentially be coordinated with other C1 work subject to crew and safety checks." },

    T119: { title: "T119 · Track Inspection", priority: "HIGH", department: "Engineering", corridor: "C3", duration: "90 min", due: "Due tomorrow", risk: 81, block: "B-043", reason: "High-priority inspection requiring a longer work duration. A separate block provides better execution time." },

    S201: { title: "S201 · Routine Signal Check", priority: "LOW", department: "S&T", corridor: "C2", duration: "30 min", due: "Friday", risk: 42, block: "B-041", reason: "Routine work with lower urgency. It can be combined with compatible C2 maintenance." },

    T130: { title: "T130 · Track Fastener Check", priority: "MEDIUM", department: "Engineering", corridor: "C2", duration: "55 min", due: "Friday", risk: 58, block: "B-045", reason: "Preventive maintenance task that can be bundled with signal work in C2." },

    S205: { title: "S205 · Signal Relay Inspection", priority: "MEDIUM", department: "S&T", corridor: "C2", duration: "45 min", due: "Wednesday", risk: 61, block: "B-041", reason: "Signal maintenance compatible with S201 for combined execution." },

    O310: { title: "O310 · OHE Preventive Inspection", priority: "HIGH", department: "Traction", corridor: "C3", duration: "85 min", due: "Tuesday", risk: 76, block: "B-046", reason: "Requires dedicated traction equipment and longer duration window." },

    S210: { title: "S210 · Signal Cabinet Inspection", priority: "MEDIUM", department: "S&T", corridor: "C2", duration: "50 min", due: "Friday", risk: 55, block: "B-045", reason: "Can be combined with track work in same corridor and time window." },

    T140: { title: "T140 · Track Geometry Inspection", priority: "HIGH", department: "Engineering", corridor: "C1", duration: "85 min", due: "Tuesday", risk: 78, block: "B-048", reason: "Requires dedicated engineering crew and uninterrupted track access." },

    T155: { title: "T155 · Track Joint Inspection", priority: "MEDIUM", department: "Engineering", corridor: "C2", duration: "50 min", due: "Wednesday", risk: 52, block: "B-049", reason: "Compatible with signal point check for bundling." },

    S220: { title: "S220 · Signal Point Check", priority: "MEDIUM", department: "S&T", corridor: "C2", duration: "45 min", due: "Wednesday", risk: 48, block: "B-049", reason: "Signal maintenance that pairs well with track joint inspection." },

    S401: { title: "S401 · Signal Testing", priority: "MEDIUM", department: "S&T", corridor: "C4", duration: "50 min", due: "Thursday", risk: 56, block: "B-047", reason: "Signal testing that can be coordinated with cable inspection." },

    S402: { title: "S402 · Signal Cable Inspection", priority: "MEDIUM", department: "S&T", corridor: "C4", duration: "45 min", due: "Thursday", risk: 53, block: "B-047", reason: "Cable work compatible with signal testing in C4." },

    S450: { title: "S450 · Signal Preventive Check", priority: "LOW", department: "S&T", corridor: "C4", duration: "80 min", due: "Friday", risk: 38, block: "B-050", reason: "Lower-priority preventive work kept separate due to duration." }

};

const blockData = {

    "B-041": { corridor: "C2", date: "Monday", window: "10:00–12:00", duration: "120 min", utilization: "82%", type: "COMBINED", tasks: [{id:"S201",name:"Routine Signal Check",department:"S&T",duration:"30 min"},{id:"S205",name:"Signal Relay Inspection",department:"S&T",duration:"45 min"}], reason: "Both tasks are located within Corridor C2 and can be completed within the available maintenance window." },

    "B-042": { corridor: "C1", date: "Monday", window: "12:00–14:00", duration: "120 min", utilization: "92%", type: "COMBINED", tasks: [{id:"T102",name:"Track Defect Repair",department:"Engineering",duration:"60 min"},{id:"S143",name:"Signal Maintenance",department:"S&T",duration:"45 min"},{id:"O221",name:"OHE Inspection",department:"Traction",duration:"60 min"}], reason: "These tasks are associated with the same C1 planning area. The AI identified an opportunity for coordinated execution after checking location, available duration, resources and operational constraints." },

    "B-043": { corridor: "C3", date: "Wednesday", window: "10:00–12:00", duration: "120 min", utilization: "75%", type: "SINGLE", tasks: [{id:"T119",name:"Track Inspection",department:"Engineering",duration:"90 min"}], reason: "T119 requires a longer uninterrupted work period. Keeping it separate reduces execution risk and provides operational buffer." },

    "B-045": { corridor: "C2", date: "Friday", window: "10:00–12:00", duration: "120 min", utilization: "88%", type: "COMBINED", tasks: [{id:"S210",name:"Signal Cabinet Inspection",department:"S&T",duration:"50 min"},{id:"T130",name:"Track Fastener Check",department:"Engineering",duration:"55 min"}], reason: "These two C2 tasks are geographically close and can share the same maintenance window without exceeding available block capacity." },

    "B-046": { corridor: "C3", date: "Tuesday", window: "12:00–14:00", duration: "120 min", utilization: "70%", type: "SINGLE", tasks: [{id:"O310",name:"OHE Preventive Inspection",department:"Traction",duration:"85 min"}], reason: "The task requires dedicated traction equipment, so the optimizer keeps it separate from other work." },

    "B-047": { corridor: "C4", date: "Thursday", window: "12:00–14:00", duration: "120 min", utilization: "85%", type: "COMBINED", tasks: [{id:"S401",name:"Signal Testing",department:"S&T",duration:"50 min"},{id:"S402",name:"Signal Cable Inspection",department:"S&T",duration:"45 min"}], reason: "Both signal tasks require the same department and are located in the same C4 work area." },

    "B-048": { corridor: "C1", date: "Tuesday", window: "15:00–17:00", duration: "120 min", utilization: "72%", type: "SINGLE", tasks: [{id:"T140",name:"Track Geometry Inspection",department:"Engineering",duration:"85 min"}], reason: "The inspection requires a dedicated engineering crew and uninterrupted access to the track." },

    "B-049": { corridor: "C2", date: "Wednesday", window: "15:00–17:00", duration: "120 min", utilization: "86%", type: "COMBINED", tasks: [{id:"T155",name:"Track Joint Inspection",department:"Engineering",duration:"50 min"},{id:"S220",name:"Signal Point Check",department:"S&T",duration:"45 min"}], reason: "Both tasks are within the C2 planning area and fit comfortably inside the available window." },

    "B-050": { corridor: "C4", date: "Friday", window: "15:00–17:00", duration: "120 min", utilization: "68%", type: "SINGLE", tasks: [{id:"S450",name:"Signal Preventive Check",department:"S&T",duration:"80 min"}], reason: "Lower-priority preventive work is kept separate because there is no strong bundling benefit with nearby tasks." }

};

const crewData = [

    { name: "Engineering Team 1", department: "Engineering", status: "available", available: 5, required: 4, corridor: "C1", currentBlock: "B-042", subStatus: "Assigned", skills: ["Track repair", "Inspection", "Emergency"] },

    { name: "S&T Team 2", department: "S&T", status: "available", available: 3, required: 2, corridor: "C1", currentBlock: "B-042", subStatus: "Assigned", skills: ["Signal testing", "Relay work", "Cable"] },

    { name: "Traction Team 3", department: "Traction/OHE", status: "limited", available: 2, required: 3, corridor: "C1", currentBlock: "B-042", subStatus: "On another block", skills: ["OHE inspection", "Traction repair"] },

    { name: "Engineering Team 4", department: "Engineering", status: "available", available: 6, required: 0, corridor: "C3", currentBlock: null, subStatus: "Available now", skills: ["Track inspection", "Geometry"] },

    { name: "S&T Team 5", department: "S&T", status: "available", available: 4, required: 0, corridor: "C2", currentBlock: null, subStatus: "Available now", skills: ["Signal cabinet", "Point check"] },

    { name: "Traction Team 6", department: "Traction/OHE", status: "available", available: 4, required: 2, corridor: "C3", currentBlock: "B-046", subStatus: "Assigned", skills: ["OHE preventive", "Traction equipment"] },

    { name: "Engineering Team 7", department: "Engineering", status: "available", available: 5, required: 1, corridor: "C4", currentBlock: null, subStatus: "Maintenance/inspection", skills: ["Track inspection", "Track repair"] },

    { name: "Traction Team 8", department: "Traction/OHE", status: "unavailable", available: 0, required: 2, corridor: "C4", currentBlock: null, subStatus: "Rest/shift", skills: ["OHE preventive"] },

    { name: "Engineering Team 9", department: "Engineering", status: "limited", available: 3, required: 4, corridor: "C2", currentBlock: "B-045", subStatus: "On another block", skills: ["Track fastener", "Joint inspection"] },

    { name: "S&T Team 10", department: "S&T", status: "available", available: 3, required: 1, corridor: "C3", currentBlock: null, subStatus: "Available now", skills: ["Signal cabinet", "Point check", "Cable"] }

];

const equipmentData = [

    { name: "Track Inspection Unit", department: "Engineering", corridor: "C2", available: 2, required: 1, status: "AVAILABLE", assignedBlock: null },

    { name: "Signal Test Equipment", department: "S&T", corridor: "C1", available: 1, required: 1, status: "AVAILABLE", assignedBlock: null },

    { name: "OHE Maintenance Unit", department: "Traction/OHE", corridor: "C1", available: 1, required: 1, status: "RESERVED", assignedBlock: "B-042" },

    { name: "Rail Grinding Machine", department: "Engineering", corridor: "C3", available: 1, required: 0, status: "AVAILABLE", assignedBlock: null },

    { name: "Ultrasonic Flaw Detector", department: "Engineering", corridor: "C2", available: 2, required: 1, status: "AVAILABLE", assignedBlock: null },

    { name: "Track Geometry Car", department: "Engineering", corridor: "C1", available: 1, required: 2, status: "LIMITED", assignedBlock: "B-048" },

    { name: "Diesel Locomotive (Works)", department: "Engineering", corridor: "C3", available: 0, required: 1, status: "UNAVAILABLE", assignedBlock: "B-043" }

];

const conflicts = [

    { type: "train", task: "T102", severity: "critical", description: "Requested maintenance window overlaps with scheduled train movement", resolution: "AI alternative: 12:00–14:00 on Corridor C1" },

    { type: "resource", task: "O221", severity: "critical", description: "Traction Team 3 does not have sufficient crew", resolution: "AI suggested resource reallocation from reserve" },

    { type: "duration", task: "S143", severity: "warning", description: "Estimated duration may leave limited buffer", resolution: "Monitor execution time closely" },

    { type: "equipment", task: "T119", severity: "warning", description: "Track Inspection Unit reserved for another task", resolution: "Use alternative equipment or reschedule" }

];

const presentationSlides = [

    { title: "AI-ABPS", subtitle: "AI-Powered Automatic Block Planning System for Indian Railways", icon: '<i data-lucide="train-front" style="width:14px;height:14px;vertical-align:middle;"></i>' },

    { title: "The Problem", subtitle: "Decentralized planning, fragmented data, manual scheduling, poor coordination", icon: '<i data-lucide="alert-triangle" style="width:14px;height:14px;vertical-align:middle;"></i>' },

    { title: "Our Solution", subtitle: "Unified intelligence layer integrating Engineering, S&T, and Traction", icon: '<i data-lucide="bot" style="width:14px;height:14px;vertical-align:middle;"></i>' },

    { title: "AI Optimization", subtitle: "Priority scoring, conflict detection, task bundling, constraint optimization", icon: "⚡" },

    { title: "Key Benefits", subtitle: "Better block utilization, reduced downtime, improved coordination, explainable AI", icon: '<i data-lucide="trending-up" style="width:14px;height:14px;vertical-align:middle;"></i>' },

    { title: "Human in Control", subtitle: "All AI recommendations subject to authorized human approval", icon: "✓" }

];

// ================= SYNTHETIC TRAIN SCHEDULE (Prototype) =================
const trainSchedule = [
    { id:"T-204", corridor:"C1", date:"Monday", start:"13:00", end:"13:30", type:"Express" },
    { id:"T-211", corridor:"C1", date:"Tuesday", start:"10:30", end:"11:00", type:"Freight" },
    { id:"T-305", corridor:"C2", date:"Monday", start:"11:00", end:"11:45", type:"Passenger" },
    { id:"T-412", corridor:"C3", date:"Wednesday", start:"11:30", end:"12:00", type:"Express" },
    { id:"T-518", corridor:"C2", date:"Friday", start:"11:00", end:"11:30", type:"Goods" },
    { id:"T-620", corridor:"C4", date:"Thursday", start:"13:00", end:"13:40", type:"Passenger" },
    { id:"T-701", corridor:"C1", date:"Monday", start:"15:00", end:"15:30", type:"Freight" },
    { id:"T-805", corridor:"C3", date:"Tuesday", start:"13:30", end:"14:00", type:"Rajdhani" }
];

// ================= DATA & INTEGRATION - PRISTINE DEMO REFERENCE =================
// Snapshot of the original synthetic dataset taken at load time (before any
// user edits / imports) so [Reset to Demo Data] can always restore the app's
// original demo state. This is a reference copy of the same data - not a
// separate/parallel dataset system.
const DEMO_SNAPSHOT = (function(){
    const snap = function(o){ try{ return JSON.parse(JSON.stringify(o)); }catch(e){ return o; } };
    return {
        tasks: snap(taskData),
        trains: snap(trainSchedule),
        crew: snap(crewData),
        equipment: snap(equipmentData),
        blocks: snap(blockData),
        approvals: {},
        audit: []
    };
})();
// Corridors modelled in the prototype (map coverage: C1-C4)
const KNOWN_CORRIDORS = ['C1','C2','C3','C4'];
const KNOWN_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
// Departments modelled by the resource/planning logic
const KNOWN_DEPARTMENTS = ['Engineering','S&T','Traction','Traction/OHE','S&T'];

const STORAGE_KEY = "aiabps_blocks";
const STORAGE_VERSION = "v1";

// ================= TIME & HELPERS =================
function timeToMinutes(t){
    if(!t||typeof t!=="string") return NaN;
    const parts=t.trim().split(":");
    if(parts.length!==2) return NaN;
    const h=parseInt(parts[0],10), m=parseInt(parts[1],10);
    if(isNaN(h)||isNaN(m)||h<0||h>23||m<0||m>59) return NaN;
    return h*60+m;
}
function minutesToTime(min){
    const h=Math.floor(min/60).toString().padStart(2,"0");
    const m=(min%60).toString().padStart(2,"0");
    return `${h}:${m}`;
}
function parseWindow(win){
    if(!win) return {start:NaN,end:NaN};
    // supports "10:00–12:00" (en dash) or "10:00-12:00" or "10:00 – 12:00"
    const sep = win.includes("–") ? "–" : win.includes("—") ? "—" : "-";
    const parts=win.split(sep);
    if(parts.length!==2) return {start:NaN,end:NaN};
    return {start: timeToMinutes(parts[0].trim()), end: timeToMinutes(parts[1].trim())};
}
function timesOverlap(aStart,aEnd,bStart,bEnd){
    // strict: A start < B end AND A end > B start -> boundary equal = no overlap
    return aStart < bEnd && aEnd > bStart;
}
function getBlockTimeRange(block){
    // Prefer explicit start/end fields, fallback to window parsing
    let s = block.startTime ? timeToMinutes(block.startTime) : parseWindow(block.window).start;
    let e = block.endTime ? timeToMinutes(block.endTime) : parseWindow(block.window).end;
    // Also support window stored as "HH:MM-HH:MM" after edit
    return {s,e};
}
function buildWindow(startMin,endMin){
    return `${minutesToTime(startMin)}–${minutesToTime(endMin)}`;
}
function calcDurationText(s,e){
    const dur=e-s;
    return dur>0 ? `${dur} min` : "0 min";
}
function getBlockStatusBadge(status){
    const map={
        "Clear": '<span class="block-status status-clear">🟢 Clear</span>',
        "Warning": '<span class="block-status status-warning">🟡 Warning</span>',
        "Conflict": '<span class="block-status status-conflict">🔴 Conflict</span>',
        "Requires Review": '<span class="block-status status-review">⚪ Requires Review</span>'
    };
    return map[status]||map["Clear"];
}
function normalizeBlock(raw){
    // Ensure every block has full structure for edit modal
    const win = raw.window || buildWindow(timeToMinutes(raw.startTime||"10:00"), timeToMinutes(raw.endTime||"12:00"));
    const parsed=parseWindow(win);
    return {
        id: raw.id,
        corridor: raw.corridor||"C1",
        date: raw.date||"Monday",
        window: win,
        startTime: raw.startTime || minutesToTime(parsed.start),
        endTime: raw.endTime || minutesToTime(parsed.end),
        duration: raw.duration || calcDurationText(parsed.start, parsed.end),
        utilization: raw.utilization||"75%",
        type: raw.type||"SINGLE",
        tasks: Array.isArray(raw.tasks)? raw.tasks : [],
        reason: raw.reason||"",
        from: raw.from||`Station ${raw.corridor||"C1"}-A`,
        to: raw.to||`Station ${raw.corridor||"C1"}-C`,
        track: raw.track||"UP",
        priority: raw.priority||"MEDIUM",
        maintenanceType: raw.maintenanceType||raw.type||"SINGLE",
        requiredCrew: raw.requiredCrew!=null ? raw.requiredCrew : (raw.tasks?.length? raw.tasks.length*2+2 : 4),
        availableCrew: raw.availableCrew!=null ? raw.availableCrew : 6,
        requiredEquip: raw.requiredEquip||"General",
        equipmentStatus: raw.equipmentStatus||"AVAILABLE",
        status: raw.status||"Clear",
        lastEdited: raw.lastEdited||null
    };
}

// ================= LOCAL STORAGE =================
function saveBlocksToStorage(){
    try{
        const toSave = state.blocks.map(b=>normalizeBlock(b));
        localStorage.setItem(STORAGE_KEY, JSON.stringify({version:STORAGE_VERSION, blocks:toSave}));
    }catch(e){ console.warn("saveBlocksToStorage failed",e); }
}
function loadBlocksFromStorage(){
    try{
        const raw=localStorage.getItem(STORAGE_KEY);
        if(!raw) return null;
        const parsed=JSON.parse(raw);
        if(!parsed||!Array.isArray(parsed.blocks)) return null;
        return parsed.blocks.map(normalizeBlock);
    }catch(e){ return null; }
}
function hydrateBlockData(){
    const stored=loadBlocksFromStorage();
    if(stored && stored.length){
        // Merge stored with current blockData structure (use stored as source of truth)
        const map={};
        stored.forEach(b=>map[b.id]=b);
        // Include any new blocks from code that aren't in storage (future-proof)
        Object.entries(blockData).forEach(([id,b])=>{
            if(!map[id]) map[id]=normalizeBlock({id,...b});
        });
        return Object.values(map);
    } else {
        return Object.entries(blockData).map(([id,b])=>normalizeBlock({id,...b}));
    }
}
function getBlockById(blockId){
    return state.blocks.find(b=>b.id===blockId) || null;
}

// ================= CONFLICT DETECTION =================
let pendingEditData=null; // holds validated block object awaiting confirmation
let pendingConflictResult=null;

function detectTrainConflicts(block){
    const res=[];
    const {s,e}=getBlockTimeRange(block);
    if(isNaN(s)||isNaN(e)) return res;
    trainSchedule.forEach(tr=>{
        if(tr.corridor!==block.corridor) return;
        if(tr.date!==block.date) return;
        const ts=timeToMinutes(tr.start), te=timeToMinutes(tr.end);
        if(timesOverlap(s,e,ts,te)){
            res.push({
                type:"train",
                severity:"critical",
                trainId: tr.id,
                corridor: tr.corridor,
                time: `${tr.start}–${tr.end}`,
                blockTime: `${block.startTime}–${block.endTime}`,
                message: `Block ${block.id} overlaps with Train ${tr.id}`,
                recommendation: "Choose another available maintenance window."
            });
        }
    });
    return res;
}
function detectBlockOverlaps(block, others){
    const res=[];
    const pool = (Array.isArray(others) ? others : (state && Array.isArray(state.blocks) ? state.blocks : []));
    const {s,e}=getBlockTimeRange(block);
    if(isNaN(s)||isNaN(e)) return res;
    pool.forEach(other=>{
        if(other.id===block.id) return; // do not compare against itself
        if(other.corridor!==block.corridor) return;
        // track check: if track differs and not UP & DN, skip? Simple: same corridor counts even if track diff for MVP, but we check track equality if both defined
        if(block.track && other.track && block.track!=="UP & DN" && other.track!=="UP & DN" && block.track!==other.track){
            // allow different tracks to coexist? For strict MVP we still flag same corridor regardless of track unless explicitly different non-overlapping tracks
            // Keep check: only flag if tracks match or one is UP & DN
            return;
        }
        if(other.date!==block.date) return;
        const {s:os,e:oe}=getBlockTimeRange(other);
        if(isNaN(os)||isNaN(oe)) return;
        if(timesOverlap(s,e,os,oe)){
            const overlapStart=minutesToTime(Math.max(s,os));
            const overlapEnd=minutesToTime(Math.min(e,oe));
            res.push({
                type:"block",
                severity:"critical",
                blockId: other.id,
                corridor: other.corridor,
                time: `${other.startTime}–${other.endTime}`,
                overlap: `${overlapStart}–${overlapEnd}`,
                message: `Block ${block.id} overlaps with Block ${other.id}`,
                recommendation: "Adjust time or corridor to avoid double booking."
            });
        }
    });
    return res;
}
function detectResourceConflicts(block, others){
    const res=[];
    const pool = (Array.isArray(others) ? others : (state && Array.isArray(state.blocks) ? state.blocks : []));
    // Crew check
    const req = parseInt(block.requiredCrew,10);
    const avail = parseInt(block.availableCrew,10);
    if(!isNaN(req) && !isNaN(avail) && req>avail){
        res.push({
            type:"resource",
            subtype:"crew",
            severity: (req-avail>=3 ? "high" : "medium"),
            required: req,
            available: avail,
            message: `Required Crew ${req} > Available ${avail}`,
            recommendation: "Reduce scope or allocate additional crew."
        });
    }
    // Equipment check
    if(block.equipmentStatus==="UNAVAILABLE"){
        res.push({
            type:"resource",
            subtype:"equipment",
            severity:"high",
            message: `Equipment ${block.requiredEquip||"required"} is UNAVAILABLE`,
            recommendation: "Use alternative equipment or reschedule."
        });
    } else if(block.equipmentStatus==="LIMITED"){
        res.push({
            type:"resource",
            subtype:"equipment",
            severity:"medium",
            message: `Equipment ${block.requiredEquip||"required"} is LIMITED`,
            recommendation: "Confirm availability before confirming."
        });
    }
    // Also check overlapping blocks with same limited resources (simulated: if another overlapping block uses same corridor & date, flag resource contention)
    const {s,e}=getBlockTimeRange(block);
    pool.forEach(other=>{
        if(other.id===block.id) return;
        if(other.date!==block.date) return;
        if(other.corridor!==block.corridor) return;
        const {s:os,e:oe}=getBlockTimeRange(other);
        if(timesOverlap(s,e,os,oe)){
            // if both require same equipment and status not AVAILABLE, flag
            if(block.requiredEquip && other.requiredEquip && block.requiredEquip===other.requiredEquip && (block.equipmentStatus!=="AVAILABLE" || other.equipmentStatus!=="AVAILABLE")){
                // avoid duplicate equipment entries if already flagged
                if(!res.some(r=>r.subtype==="equipment" && r.message.includes(block.requiredEquip))){
                    res.push({
                        type:"resource",
                        subtype:"equipment-overlap",
                        severity:"medium",
                        message: `Resource ${block.requiredEquip} also required by overlapping Block ${other.id}`,
                        recommendation: "Stagger blocks or allocate separate equipment."
                    });
                }
            }
        }
    });
    return res;
}
function analyzeBlockConflicts(block, others){
    const trainConflicts=detectTrainConflicts(block);
    const blockConflicts=detectBlockOverlaps(block, others);
    const resourceConflicts=detectResourceConflicts(block, others);
    const all=[...trainConflicts,...blockConflicts,...resourceConflicts];
    let severity="No Conflict";
    let level="clear"; // for badge
    if(trainConflicts.length>0 || blockConflicts.length>0){
        severity="Critical";
        level="critical";
    } else if(resourceConflicts.some(r=>r.severity==="high")){
        severity="High";
        level="high";
    } else if(resourceConflicts.some(r=>r.severity==="medium")){
        severity="Medium";
        level="medium";
    }
    return {trainConflicts, blockConflicts, resourceConflicts, all, severity, level, hasConflict: all.length>0, hasCritical: trainConflicts.length>0||blockConflicts.length>0};
}
function getSeverityLabel(level){
    const map={
        critical: "Critical",
        high: "High",
        medium: "Medium",
        clear: "No Conflict"
    };
    return map[level]||map.clear;
}

// ================= EDIT BLOCK MODAL LOGIC =================
function openEditBlock(blockId){
    const block=getBlockById(blockId);
    if(!block){ showToast("Block not found","error"); return; }
    // close other modals
    const bm=document.getElementById("blockModal");
    if(bm) bm.classList.remove("show");
    populateEditForm(block);
    document.getElementById("editBlockModal").classList.add("show");
    // reset conflict section
    document.getElementById("conflictAnalysisSection").style.display="none";
    document.getElementById("editModalButtons").style.display="flex";
    document.getElementById("editSaveBtn").style.display="inline-flex";
    document.getElementById("conflictAnalysisGrid").innerHTML="";
    document.getElementById("conflictAnalysisDetails").innerHTML="";
    document.getElementById("conflictSeverityRow").innerHTML="";
    pendingEditData=null;
    pendingConflictResult=null;
    // clear validation
    document.querySelectorAll("#editBlockForm .validation-msg").forEach(el=>{el.textContent="";el.classList.remove("show");});
}
function populateEditForm(block){
    const b=normalizeBlock(block);
    document.getElementById("editBlockId").value=b.id;
    document.getElementById("editBlockIdDisplay").value=b.id;
    document.getElementById("editCorridor").value=b.corridor;
    document.getElementById("editFrom").value=b.from;
    document.getElementById("editTo").value=b.to;
    document.getElementById("editTrack").value=b.track;
    document.getElementById("editMaintType").value=b.maintenanceType;
    document.getElementById("editDate").value=b.date;
    document.getElementById("editPriority").value=b.priority;
    document.getElementById("editStart").value=b.startTime;
    document.getElementById("editEnd").value=b.endTime;
    document.getElementById("editCrewReq").value=b.requiredCrew;
    document.getElementById("editCrewAvail").value=b.availableCrew;
    document.getElementById("editEquipReq").value=b.requiredEquip;
    document.getElementById("editEquipAvail").value=b.equipmentStatus;
    document.getElementById("editTasks").value=b.tasks.map(t=>t.id).join(", ");
}
function closeEditBlockModal(){
    document.getElementById("editBlockModal").classList.remove("show");
    pendingEditData=null;
    pendingConflictResult=null;
}
function validateBlockData(block){
    const errs=[];
    const {s,e}=getBlockTimeRange(block);
    if(!block.corridor) errs.push("Corridor is required.");
    if(!block.date) errs.push("Date is required.");
    if(isNaN(s)) errs.push("Start time is invalid.");
    if(isNaN(e)) errs.push("End time is invalid.");
    if(!isNaN(s)&&!isNaN(e)){
        if(e<=s) errs.push("End time must be after start time.");
        if(e-s<=0) errs.push("Block duration must be greater than zero.");
        if(e-s<15) errs.push("Block duration should be at least 15 min.");
    }
    if(!block.startTime||!block.endTime) errs.push("Start and end times are required.");
    return {valid: errs.length===0, errors:errs, s, e};
}
function collectFormBlock(){
    const id=document.getElementById("editBlockId").value;
    const corridor=document.getElementById("editCorridor").value;
    const from=document.getElementById("editFrom").value.trim()||`Station ${corridor}-A`;
    const to=document.getElementById("editTo").value.trim()||`Station ${corridor}-C`;
    const track=document.getElementById("editTrack").value;
    const maintType=document.getElementById("editMaintType").value;
    const date=document.getElementById("editDate").value;
    const priority=document.getElementById("editPriority").value;
    const startTime=document.getElementById("editStart").value;
    const endTime=document.getElementById("editEnd").value;
    const requiredCrew=parseInt(document.getElementById("editCrewReq").value,10);
    const availableCrew=parseInt(document.getElementById("editCrewAvail").value,10);
    const requiredEquip=document.getElementById("editEquipReq").value.trim()||"General";
    const equipmentStatus=document.getElementById("editEquipAvail").value;
    const tasksRaw=document.getElementById("editTasks").value.trim();
    const taskIds=tasksRaw? tasksRaw.split(",").map(s=>s.trim()).filter(Boolean): [];
    // Build task objects from existing block's tasks or fallback to simple
    const existing=getBlockById(id);
    const existingTasksMap={};
    if(existing && existing.tasks) existing.tasks.forEach(t=>existingTasksMap[t.id]=t);
    const tasks=taskIds.map(tid=>{
        if(existingTasksMap[tid]) return existingTasksMap[tid];
        // try lookup in taskData
        const td=taskData[tid];
        if(td) return {id:tid,name:td.title.split("·")[1]?.trim()||tid,department:td.department,duration:td.duration};
        return {id:tid,name:tid,department:"Engineering",duration:"30 min"};
    });
    // fallback keep original tasks if empty
    const finalTasks= tasks.length? tasks : (existing? existing.tasks: []);
    const s=timeToMinutes(startTime), e=timeToMinutes(endTime);
    const windowStr=(!isNaN(s)&&!isNaN(e))? buildWindow(s,e) : (existing? existing.window : "10:00–12:00");
    const duration=(!isNaN(s)&&!isNaN(e))? calcDurationText(s,e) : (existing? existing.duration : "120 min");
    return {
        id, corridor, date, window:windowStr, startTime, endTime, duration,
        utilization: existing? existing.utilization : "75%",
        type: maintType,
        maintenanceType: maintType,
        tasks: finalTasks,
        reason: existing? existing.reason : "",
        from, to, track, priority,
        requiredCrew: isNaN(requiredCrew)? 4: requiredCrew,
        availableCrew: isNaN(availableCrew)? 6: availableCrew,
        requiredEquip, equipmentStatus,
        status: existing? existing.status : "Clear"
    };
}
function handleEditSave(){
    // clear prior validation
    document.querySelectorAll("#editBlockForm .validation-msg").forEach(el=>{el.textContent="";el.classList.remove("show");});
    const block=collectFormBlock();
    const validation=validateBlockData(block);
    if(!validation.valid){
        const summary=document.getElementById("editValidationSummary");
        summary.textContent=validation.errors.join(" ");
        summary.classList.add("show");
        // also per field
        if(validation.errors.some(e=>e.includes("Start time"))) document.getElementById("editStartErr").textContent=validation.errors.find(e=>e.includes("Start"))||"", document.getElementById("editStartErr").classList.add("show");
        if(validation.errors.some(e=>e.includes("End time"))) document.getElementById("editEndErr").textContent=validation.errors.find(e=>e.includes("End"))||"", document.getElementById("editEndErr").classList.add("show");
        if(validation.errors.some(e=>e.includes("after start")||e.includes("duration"))){ document.getElementById("editTimeErr").textContent=validation.errors.join(" "); document.getElementById("editTimeErr").classList.add("show");}
        return;
    }
    // Run conflict detection BEFORE final confirmation
    const result=analyzeBlockConflicts(block);
    pendingEditData=block;
    pendingConflictResult=result;
    renderConflictAnalysis(result, block);
    document.getElementById("conflictAnalysisSection").style.display="block";
    document.getElementById("conflictAnalysisSection").scrollIntoView({behavior:"smooth", block:"nearest"});
    // hide Save Changes, show confirm actions inside analysis
}
function renderConflictAnalysis(result, block){
    const grid=document.getElementById("conflictAnalysisGrid");
    const details=document.getElementById("conflictAnalysisDetails");
    const severityRow=document.getElementById("conflictSeverityRow");
    const actions=document.getElementById("conflictActions");
    const hasTrain=result.trainConflicts.length>0;
    const hasBlock=result.blockConflicts.length>0;
    const hasResource=result.resourceConflicts.length>0;

    grid.innerHTML = `
        <div class="conflict-card ${hasTrain? 'critical':'ok'}">
            <div class="conflict-card-icon"><i data-lucide="train-front" style="width:18px;height:18px;"></i></div>
            <div class="conflict-card-title">Train Schedule</div>
            <div class="conflict-card-detail" style="font-weight:700;color:${hasTrain?'var(--red)':'var(--green)'}">${hasTrain? 'Conflict Detected':'No Conflict'}</div>
            <div class="conflict-card-detail">${hasTrain? result.trainConflicts[0].message : 'No overlapping train movement'}</div>
        </div>
        <div class="conflict-card ${hasBlock? 'critical':'ok'}">
            <div class="conflict-card-icon"><i data-lucide="wrench" style="width:18px;height:18px;"></i></div>
            <div class="conflict-card-title">Maintenance Blocks</div>
            <div class="conflict-card-detail" style="font-weight:700;color:${hasBlock?'var(--red)':'var(--green)'}">${hasBlock? 'Overlapping Block Detected':'No Overlap'}</div>
            <div class="conflict-card-detail">${hasBlock? result.blockConflicts[0].message : 'No corridor/time overlap'}</div>
        </div>
        <div class="conflict-card ${hasResource? (result.resourceConflicts.some(r=>r.severity==='high')?'high':'high') : 'ok'}" style="${hasResource && result.resourceConflicts.some(r=>r.severity==='high') ? '' : hasResource? 'border-color:#fde68a;background:#fefce8;' : ''}">
            <div class="conflict-card-icon"><i data-lucide="users" style="width:14px;height:14px;vertical-align:middle;"></i></div>
            <div class="conflict-card-title">Resources</div>
            <div class="conflict-card-detail" style="font-weight:700;color:${hasResource? (result.resourceConflicts.some(r=>r.severity==='high')?'var(--orange)':'#a16207') :'var(--green)'}">${hasResource? 'Resource Conflict':'Available'}</div>
            <div class="conflict-card-detail">${hasResource? result.resourceConflicts[0].message : 'Crew & equipment available'}</div>
        </div>
    `;
    let detailsHTML="";
    if(hasTrain){
        detailsHTML+= result.trainConflicts.map(c=>`
            <div class="alert alert-red" style="margin-top:10px;">
                <span class="alert-icon"><i data-lucide="train-front" style="width:16px;height:16px;"></i></span>
                <div><b>Train Conflict</b> — ${c.message}<br>Time: ${c.time} (Train) vs ${c.blockTime} (Block) · Corridor ${c.corridor}<br><b>Recommended Action:</b> ${c.recommendation}</div>
            </div>
        `).join("");
    }
    if(hasBlock){
        detailsHTML+= result.blockConflicts.map(c=>`
            <div class="alert alert-red" style="margin-top:10px;">
                <span class="alert-icon"><i data-lucide="wrench" style="width:16px;height:16px;"></i></span>
                <div><b>Block Conflict</b> — ${c.message}<br>Corridor: ${c.corridor} · Overlap: ${c.overlap} · Block Time: ${c.time}<br><b>Recommended Action:</b> ${c.recommendation}</div>
            </div>
        `).join("");
    }
    if(hasResource){
        detailsHTML+= result.resourceConflicts.map(c=>`
            <div class="alert alert-orange" style="margin-top:10px;">
                <span class="alert-icon"><i data-lucide="users" style="width:14px;height:14px;vertical-align:middle;"></i></span>
                <div><b>Resource Conflict</b> — ${c.message}<br><b>Recommended Action:</b> ${c.recommendation}</div>
            </div>
        `).join("");
    }
    if(!result.hasConflict){
        detailsHTML=`<div class="alert alert-green" style="margin-top:10px;"><span class="alert-icon"><i data-lucide="shield-check" style="width:16px;height:16px;"></i></span><div><b>No Critical Conflicts Detected</b><br>Prototype analysis found no overlapping train, block, or critical resource conflict. Safe to confirm.</div></div>`;
    } else if(result.hasCritical){
        detailsHTML = `<div style="margin-top:8px;padding:10px;background:var(--bg);border-radius:8px;font-size:12px;"><b><i data-lucide="alert-triangle" style="width:14px;height:14px;vertical-align:middle;"></i>️ Conflicts Detected — severity: ${getSeverityLabel(result.level)}</b><br>Review details above. You may go back and edit or save with review flag.</div>` + detailsHTML;
    }
    details.innerHTML=detailsHTML;
    severityRow.innerHTML=`<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;"><span style="font-size:12px;font-weight:700;">Severity:</span> <span class="badge ${result.level==='critical'?'critical':result.level==='high'?'high':result.level==='medium'?'medium':'low'}" style="font-size:13px;">${getSeverityLabel(result.level)}</span> <span class="note" style="font-size:13px;">Prototype Conflict Analysis — synthetic data</span></div>`;
    // Actions
    if(!result.hasConflict){
        actions.innerHTML=`
            <button class="btn btn-secondary" onclick="document.getElementById('conflictAnalysisSection').style.display='none';">Go Back and Edit</button>
            <button class="btn btn-success" onclick="handleConfirmSave(false)">✅ Confirm Save</button>
        `;
    } else {
        actions.innerHTML=`
            <button class="btn btn-secondary" onclick="document.getElementById('conflictAnalysisSection').style.display='none';">Go Back and Edit</button>
            <button class="btn btn-danger" onclick="handleConfirmSave(true)"><i data-lucide="alert-triangle" style="width:14px;height:14px;vertical-align:middle;"></i>️ Save Anyway (Requires Review)</button>
        `;
    }
}
function handleConfirmSave(forceReview){
    if(!pendingEditData) return;
    const block=pendingEditData;
    const result=pendingConflictResult;
    // Determine status
    let status="Clear";
    if(forceReview){
        status="Requires Review";
    } else if(result.hasCritical){
        status="Conflict";
    } else if(result.resourceConflicts.length>0){
        // high => Conflict? but for no-force, we already blocked critical only; resource high => Warning/Conflict
        status= result.resourceConflicts.some(r=>r.severity==="high") ? "Conflict" : "Warning";
    } else if(result.all.length>0){
        status="Warning";
    }
    block.status=status;
    block.lastEdited=new Date().toISOString();
    // Recalc utilization roughly (keep original but could adjust)
    updateBlock(block.id, block);
    closeEditBlockModal();
    showToast(`Block ${block.id} saved — ${status}`, status==="Clear" ? "success" : status==="Requires Review"? "info" : "error");
}
function updateBlock(blockId, updatedData){
    const idx=state.blocks.findIndex(b=>b.id===blockId);
    if(idx===-1){ showToast("Block not found for update","error"); return; }
    // Update underlying data source
    const normalized=normalizeBlock(updatedData);
    state.blocks[idx]=normalized;
    // Also keep global blockData in sync for legacy code that may read it (update or insert)
    blockData[blockId]=normalized;
    saveBlocksToStorage();
    // Prompt 4: an edited block needs re-review — mark as requires review + audit the edit
    if(normalized.lastEdited){
        state.approvals[blockId] = {category:'requires', reason:'Block was modified — requires re-review', by:(state.currentUser?.name||'Demo Planner'), time:Date.now(), aiRecType:null};
        saveApprovalsToStorage();
        addAudit('edit', 'Block '+blockId+' was modified by '+(state.currentUser?.name||'Demo Planner'), 'Block updated and moved back to review queue', blockId, false);
    }
    refreshBlockViews();
}
function refreshDashboardAI(){
    try{
        const m = refreshDashboardMetrics();
        const dash = document.getElementById('dashCritical');
        if(dash) dash.textContent = m.critical;
        const dashOpen = document.getElementById('dashOpen');
        // keep original
        const blocksEl = document.getElementById('dashBlocks');
        if(blocksEl) blocksEl.textContent = state.blocks.length;
        const confEl = document.getElementById('dashConflicts');
        if(confEl) confEl.textContent = m.needReview;
        // Update or create AI KPI row
        let aiRow = document.getElementById('aiKpiRow');
        if(!aiRow){
            const cards = document.querySelector('#dashboard .cards');
            if(cards){
                aiRow = document.createElement('div');
                aiRow.id='aiKpiRow';
                aiRow.className='cards';
                aiRow.style.marginTop='16px';
                cards.parentNode.insertBefore(aiRow, cards.nextSibling);
            }
        }
        if(aiRow){
            aiRow.innerHTML = `
                <div class="card" style="border-left:4px solid var(--red);"><div class="card-label">Critical Tasks (AI Priority >=85)</div><div class="card-value red">${m.critical}</div><div class="card-delta down">Prototype analysis</div></div>
                <div class="card" style="border-left:4px solid var(--orange);"><div class="card-label">High Priority (70-84)</div><div class="card-value orange">${m.high}</div><div class="card-delta up">AI Priority</div></div>
                <div class="card" style="border-left:4px solid var(--green);"><div class="card-label">High Suitability Blocks (>=90)</div><div class="card-value green">${m.highSuit}</div><div class="card-delta up">Suitability</div></div>
                <div class="card" style="border-left:4px solid var(--purple);"><div class="card-label">Blocks Requiring Review</div><div class="card-value ${m.needReview?'red':''}">${m.needReview}</div><div class="card-delta ${m.needReview?'down':''}">${m.needReview?'Needs attention':'All clear'}</div></div>
            `;
        }
        // Also refresh top recommendation with dynamic data
        const b042 = state.blocks.find(b=>b.id==='B-042');
        if(b042){
            const pri = getBlockPriorityScore(b042);
            const sui = calculateSuitabilityScore(b042);
            const rec = generateAIRecommendation(b042);
            const topRec = document.getElementById('topRecommendation');
            // keep original structure but update values if needed - we will not overwrite, just ensure it reflects
        }
    }catch(e){ console.warn('refreshDashboardAI',e); }
}
function refreshBlockViews(){
    try{
        renderTodayTimeline();
        renderWeeklySchedule();
        renderMonthlyPlan();
        renderGantt();
        renderApprovalCenter();
        renderCorridor(document.getElementById("corridorSelect")?.value||"C1");
        refreshDashboardAI();
        // Update dashboard counters if needed
        const conflictsCount = state.blocks.filter(b=>b.status==="Conflict"||b.status==="Requires Review").length;
        const el=document.getElementById("dashConflicts");
        if(el) el.textContent= conflictsCount;
    }catch(e){ console.warn("refreshBlockViews error",e); }
}
// ================= AI INTELLIGENCE LAYER - PROMPT 2 =================
// Priority Score: weighted sum of 5 factors (0-100 each)
function derivePriorityFactors(task){
    // task may be taskData entry or block task
    const priorityMap = {CRITICAL:95, HIGH:80, MEDIUM:55, LOW:30};
    const dueStr = (task.due||"").toLowerCase();
    let urgency = 50;
    if(dueStr.includes("overdue")) urgency = 95;
    else if(dueStr.includes("today")) urgency = 90;
    else if(dueStr.includes("tomorrow")) urgency = 75;
    else if(dueStr.includes("tuesday")) urgency = 65;
    else if(dueStr.includes("wednesday")) urgency = 60;
    else if(dueStr.includes("thursday")) urgency = 55;
    else if(dueStr.includes("friday")) urgency = 50;
    else urgency = 60;
    // Delay Impact similar but slightly lower for overdue gives max
    let delayImpact = urgency;
    if(dueStr.includes("overdue")) delayImpact = 92;
    else if(dueStr.includes("today")) delayImpact = 85;
    // Safety criticality from priority + department + risk
    let safety = priorityMap[task.priority] || 50;
    if(task.department==="Engineering" && (task.priority==="CRITICAL"||task.priority==="HIGH")) safety = Math.min(100,safety+5);
    if(task.risk && task.risk>85) safety = Math.min(100,safety+3);
    // Asset criticality from risk
    let asset = task.risk ? Math.max(0,Math.min(100, task.risk + (Math.random()*0|0))) : 60;
    // Operational impact from corridor + duration
    const corridorImpactMap = {C1:85, C2:70, C3:65, C4:60};
    let operational = corridorImpactMap[task.corridor] || 60;
    // duration longer increases impact slightly
    const dur = parseInt(task.duration)||60;
    if(dur>=85) operational = Math.min(100, operational+8);
    else if(dur<=30) operational = Math.max(0, operational-5);
    return {safety: Math.round(safety), asset: Math.round(asset), urgency: Math.round(urgency), delayImpact: Math.round(delayImpact), operational: Math.round(operational)};
}
function calculatePriorityScore(task){
    if(!task) return {score:0, factors:{safety:0,asset:0,urgency:0,delayImpact:0,operational:0}};
    // If task has explicit factors already stored, reuse
    const f = derivePriorityFactors(task);
    const score = Math.round(f.safety*0.30 + f.asset*0.25 + f.urgency*0.20 + f.delayImpact*0.15 + f.operational*0.10);
    return {score: Math.max(0,Math.min(100,score)), factors:f};
}
function getPriorityCategory(score){
    if(score>=85) return {label:"CRITICAL",icon:"??", cls:"critical"};
    if(score>=70) return {label:"HIGH",icon:"??", cls:"high"};
    if(score>=40) return {label:"MEDIUM",icon:"??", cls:"medium"};
    return {label:"LOW",icon:"??", cls:"low"};
}
function getBlockPriorityScore(block){
    if(!block || !block.tasks || !block.tasks.length){
        // fallback from block priority field
        const dummyTask = {priority:block?block.priority:"MEDIUM", department:"Engineering", corridor:block?block.corridor:"C1", duration:block?block.duration:"60 min", due:"Friday", risk:60};
        return calculatePriorityScore(dummyTask);
    }
    // Map block tasks to full taskData where possible
    const scores = block.tasks.map(t=>{
        const full = taskData[t.id];
        if(full) return calculatePriorityScore({id:t.id,...full}).score;
        // otherwise derive from t
        return calculatePriorityScore({priority:block.priority||"MEDIUM", department:t.department||"Engineering", corridor:block.corridor, duration:t.duration||"60 min", due:"Friday", risk:60}).score;
    });
    const avg = Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
    // also compute max for weighting
    const max = Math.max(...scores);
    // blended: 70% avg +30% max to reflect critical task dominance
    const blended = Math.round(avg*0.7 + max*0.3);
    // derive factors as avg of factors
    const factorSets = block.tasks.map(t=>{
        const full = taskData[t.id];
        if(full) return derivePriorityFactors({id:t.id,...full});
        return derivePriorityFactors({priority:block.priority||"MEDIUM", department:t.department||"Engineering", corridor:block.corridor, duration:t.duration||"60 min", due:"Friday", risk:60});
    });
    const avgFactors = {safety:0,asset:0,urgency:0,delayImpact:0,operational:0};
    ["safety","asset","urgency","delayImpact","operational"].forEach(k=>{
        avgFactors[k]=Math.round(factorSets.reduce((s,f)=>s+f[k],0)/factorSets.length);
    });
    return {score:blended, factors:avgFactors, individual:scores};
}
// Suitability Score factors 0-100
function calculateSuitabilityScore(block){
    if(!block) return {score:0, factors:{priorityAlignment:0, corridorAvail:0, resourceAvail:0, traffic:0, conflictRisk:0, taskCompat:0}};
    const priorityScore = getBlockPriorityScore(block).score;
    // Priority Alignment: high priority blocks should be scheduled -> higher suitability if priority high and no delay
    let priorityAlignment = Math.min(100, 60 + (priorityScore-50)*0.6);
    // Corridor Availability: count other blocks same corridor+date
    const sameCorridorDay = state.blocks.filter(b=>b.id!==block.id && b.corridor===block.corridor && b.date===block.date).length;
    let corridorAvail = Math.max(20, 95 - sameCorridorDay*18);
    // Resource Availability
    const req = parseInt(block.requiredCrew,10);
    const avail = parseInt(block.availableCrew,10);
    let resourceAvail = 85;
    if(!isNaN(req) && !isNaN(avail)){
        if(avail>=req) resourceAvail = 90 + Math.min(10, (avail-req)*3);
        else {
            const deficit = req-avail;
            resourceAvail = Math.max(10, 70 - deficit*15);
        }
    }
    if(block.equipmentStatus==="UNAVAILABLE") resourceAvail = Math.min(resourceAvail, 30);
    else if(block.equipmentStatus==="LIMITED") resourceAvail = Math.min(resourceAvail, 60);
    resourceAvail = Math.max(0,Math.min(100,Math.round(resourceAvail)));
    // Traffic Conditions: count trains same corridor+date overlapping window? use trainSchedule density
    const trainsSameCorridor = trainSchedule.filter(t=>t.corridor===block.corridor && t.date===block.date).length;
    let traffic = Math.max(20, 90 - trainsSameCorridor*15);
    // also if block window overlaps train, reduce further (will be double penalized via conflict anyway)
    const {s,e}=getBlockTimeRange(block);
    let overlappingTrains = 0;
    trainSchedule.forEach(t=>{
        if(t.corridor!==block.corridor || t.date!==block.date) return;
        const ts=timeToMinutes(t.start), te=timeToMinutes(t.end);
        if(timesOverlap(s,e,ts,te)) overlappingTrains++;
    });
    if(overlappingTrains>0) traffic = Math.max(10, traffic - overlappingTrains*20);
    traffic = Math.max(0,Math.min(100,Math.round(traffic)));
    // Conflict Risk: reuse analyzeBlockConflicts
    const analysis = analyzeBlockConflicts(block);
    let conflictRisk = 95;
    if(analysis.trainConflicts.length>0) conflictRisk = 25;
    else if(analysis.blockConflicts.length>0) conflictRisk = 35;
    else if(analysis.resourceConflicts.some(r=>r.severity==="high")) conflictRisk = 45;
    else if(analysis.resourceConflicts.some(r=>r.severity==="medium")) conflictRisk = 65;
    else if(analysis.all.length>0) conflictRisk = 70;
    // Task Compatibility: COMBINED with compatible departments higher
    let taskCompat = 70;
    if(block.type==="COMBINED" && block.tasks.length>1){
        const depts = new Set(block.tasks.map(t=>t.department));
        if(depts.size>1) taskCompat = 88; // multi-dept bundled is good if no conflict
        else taskCompat = 82;
        if(analysis.all.length>0) taskCompat = Math.max(30, taskCompat - 30);
    } else if(block.type==="SINGLE"){
        taskCompat = 75;
        if(block.tasks.length===1 && (block.tasks[0].duration||"").includes("90")) taskCompat = 80; // long single needs dedicated
    }
    taskCompat = Math.max(0,Math.min(100,Math.round(taskCompat)));
    const score = Math.round(priorityAlignment*0.20 + corridorAvail*0.20 + resourceAvail*0.15 + traffic*0.15 + conflictRisk*0.20 + taskCompat*0.10);
    return {score:Math.max(0,Math.min(100,score)), factors:{priorityAlignment:Math.round(priorityAlignment), corridorAvail:Math.round(corridorAvail), resourceAvail:Math.round(resourceAvail), traffic:Math.round(traffic), conflictRisk:Math.round(conflictRisk), taskCompat:Math.round(taskCompat)}, analysis};
}
function getSuitabilityCategory(score){
    if(score>=90) return {label:"EXCELLENT",icon:"??", cls:"low"};
    if(score>=70) return {label:"GOOD",icon:"??", cls:"info"};
    if(score>=50) return {label:"MODERATE",icon:"??", cls:"medium"};
    return {label:"HIGH RISK",icon:"??", cls:"critical"};
}
function generateAIRecommendation(block){
    const pri = getBlockPriorityScore(block);
    const sui = calculateSuitabilityScore(block);
    const analysis = sui.analysis || analyzeBlockConflicts(block);
    const hasTrain = analysis.trainConflicts.length>0;
    const hasBlockOverlap = analysis.blockConflicts.length>0;
    const hasResource = analysis.resourceConflicts.length>0;
    const hasHighResource = analysis.resourceConflicts.some(r=>r.severity==="high");
    let type, title, reason, badgeCls;
    if(hasTrain || hasBlockOverlap){
        type="CHANGE_BLOCK_TIMING";
        title="Change Block Timing";
        badgeCls="ai-reco-change";
        if(hasTrain) reason = "A train schedule conflict was detected during the selected maintenance window ("+analysis.trainConflicts[0].trainId+" "+analysis.trainConflicts[0].time+"). The overlap reduces suitability and requires rescheduling.";
        else reason = "The block overlaps with "+analysis.blockConflicts[0].blockId+" in corridor "+analysis.blockConflicts[0].corridor+" ("+analysis.blockConflicts[0].overlap+"). Reschedule to avoid double booking.";
    } else if(hasHighResource || (hasResource && sui.score<60)){
        type="REVIEW_RESOURCE_ALLOCATION";
        title="Review Resource Allocation";
        badgeCls="ai-reco-resource";
        reason = "Resource availability is limited: "+analysis.resourceConflicts[0].message+". Allocate additional crew/equipment or adjust scope.";
    } else if(sui.score>=70 && !hasTrain && !hasBlockOverlap && !hasResource){
        type="KEEP_CURRENT_PLAN";
        title="Keep Current Plan";
        badgeCls="ai-reco-keep";
        reason = "No critical conflicts detected. Resources are available (crew "+block.availableCrew+"/"+block.requiredCrew+"), corridor "+block.corridor+" has good availability, and suitability is "+sui.score+"/100.";
    } else {
        type="REVIEW_BLOCK";
        title="Review Block Timing";
        badgeCls="ai-reco-review";
        if(hasResource) reason = "Suitability is moderate ("+sui.score+"/100) due to limited resources: "+analysis.resourceConflicts[0].message+". Review timing or allocation.";
        else if(sui.factors.corridorAvail<60) reason = "Corridor availability is constrained for "+block.corridor+" on "+block.date+". Consider alternative window for better throughput.";
        else if(sui.factors.traffic<60) reason = "Traffic conditions are elevated for this window. A less congested slot would improve suitability.";
        else reason = "Suitability is moderate ("+sui.score+"/100). Review timing, resources, and task compatibility before confirming.";
    }
    return {type, title, reason, badgeCls, pri, sui, analysis};
}
function calculateRecommendationStrength(block){
    const rec = generateAIRecommendation(block);
    const sui = rec.sui.score;
    const pri = rec.pri.score;
    // Strength is composite: high suitability + clear conflicts => high strength; low suitability or conflicts => lower but still confident in recommendation to change
    let strength;
    if(rec.type==="KEEP_CURRENT_PLAN") strength = Math.round(70 + (sui-70)*0.4 + (pri>70?10:0));
    else if(rec.type==="CHANGE_BLOCK_TIMING") strength = Math.round(80 + (100-sui)*0.1);
    else if(rec.type==="REVIEW_RESOURCE_ALLOCATION") strength = Math.round(75 + (100-rec.sui.factors.resourceAvail)*0.15);
    else strength = Math.round(65 + (100-sui)*0.15);
    strength = Math.max(55,Math.min(96, strength));
    return {strength, rec};
}
function generateAIExplanation(block){
    const pri = getBlockPriorityScore(block);
    const sui = calculateSuitabilityScore(block);
    const rec = generateAIRecommendation(block);
    const catP = getPriorityCategory(pri.score);
    const catS = getSuitabilityCategory(sui.score);
    let lines=[];
    // Priority part
    if(pri.score>=70){
        lines.push("Priority is "+catP.label+" ("+pri.score+"/100) due to "+(pri.factors.safety>=80?"high safety criticality ("+pri.factors.safety+"%)":"safety "+pri.factors.safety+"%")+", asset criticality "+pri.factors.asset+"%, and urgency "+pri.factors.urgency+"%.");
    } else if(pri.score>=40){
        lines.push("Priority is "+catP.label+" ("+pri.score+"/100)  moderate urgency and asset criticality.");
    } else {
        lines.push("Priority is "+catP.label+" ("+pri.score+"/100)  low urgency and routine asset impact.");
    }
    // Suitability part
    if(sui.score>=70){
        lines.push("Suitability is "+catS.label+" ("+sui.score+"/100) with good corridor availability ("+sui.factors.corridorAvail+"%), available resources ("+sui.factors.resourceAvail+"%), and low conflict risk ("+sui.factors.conflictRisk+"%).");
    } else {
        const weak=[];
        if(sui.factors.corridorAvail<60) weak.push("corridor availability "+sui.factors.corridorAvail+"%");
        if(sui.factors.resourceAvail<60) weak.push("resource availability "+sui.factors.resourceAvail+"%");
        if(sui.factors.conflictRisk<60) weak.push("conflict risk "+sui.factors.conflictRisk+"%");
        if(sui.factors.traffic<60) weak.push("traffic conditions "+sui.factors.traffic+"%");
        if(sui.factors.taskCompat<60) weak.push("task compatibility "+sui.factors.taskCompat+"%");
        lines.push("Suitability is "+catS.label+" ("+sui.score+"/100) reduced by "+(weak.length?weak.join(", "):"multiple factors")+".");
    }
    // Conflicts
    if(rec.analysis.trainConflicts.length>0){
        lines.push("Train conflict: overlaps with "+rec.analysis.trainConflicts[0].trainId+" ("+rec.analysis.trainConflicts[0].time+"), lowering suitability and requiring reschedule.");
    }
    if(rec.analysis.blockConflicts.length>0){
        lines.push("Block overlap: conflicts with "+rec.analysis.blockConflicts[0].blockId+" ("+rec.analysis.blockConflicts[0].overlap+") in "+block.corridor+".");
    }
    if(rec.analysis.resourceConflicts.length>0){
        lines.push("Resource constraint: "+rec.analysis.resourceConflicts[0].message+" (availability "+sui.factors.resourceAvail+"%).");
    }
    if(rec.analysis.all.length===0){
        lines.push("No critical conflicts detected in prototype analysis; traffic and resources are favorable.");
    }
    lines.push("Recommendation '"+rec.title+"' follows because "+rec.reason);
    return {pri, sui, rec, catP, catS, text:lines.join(" ")};
}
function refreshAIAnalysis(blockId){
    // Called after edit to update any open AI panels - currently blockDetails will be refreshed via openBlock
}
function refreshDashboardMetrics(){
    const tasks = Object.values(taskData).map(t=>calculatePriorityScore(t));
    const critical = tasks.filter(t=>t.score>=85).length;
    const high = tasks.filter(t=>t.score>=70 && t.score<85).length;
    const blocks = state.blocks.map(b=>calculateSuitabilityScore(b));
    const highSuit = blocks.filter(b=>b.score>=90).length;
    const needReview = blocks.filter(b=>b.score<70 || b.analysis.all.length>0).length;
    return {critical, high, highSuit, needReview, tasks, blocks};
}


; // end injected helpers

// ================= INITIALIZATION =================

function init() {

    document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

    state.tasks = Object.entries(taskData).map(([id, t]) => ({ id, ...t }));

    // Load from localStorage first (persisted edits), fallback to demo data
    state.blocks = hydrateBlockData();

    // Populate What-If block selector and auto-select the first available block
    getWhatIfBlockOptions();
    ensureWhatIfReady();

    // Prompt 4: load persisted approval decisions and audit records
    state.approvals = loadApprovals();
    state.auditRecords = loadAudit();

    diRestoreSource();

    renderTodayTimeline();

    renderTopRecommendation();

    renderLiveAlerts();

    renderTaskTable();

    renderKanban();

    renderAISteps();

    renderAIExplanation();

    renderBundlingLogic();

    renderWeeklySchedule();

    renderMonthlyPlan();

    renderGantt();

    renderCorridor('C1');

    renderResourcesPage();

    renderConflictCenter();

    renderApprovalCenter();

    renderAuditLog();

    renderSuggestedQuestions();

    renderMetricsTable();

    initCharts();

    initMap();

    renderHeatmap();

    // Check onboarding - persist "completed" flag to localStorage
    let seenOnboarding = false;
    try{ seenOnboarding = localStorage.getItem('aiabps_onboardingCompleted') === '1'; }catch(e){}
    if (!state.onboardingComplete && !seenOnboarding) {

        document.getElementById('onboarding').classList.add('active');

    } else {
        state.onboardingComplete = true;
    }

    // Setup keyboard shortcuts

    document.addEventListener('keydown', handleKeyboard);

    // Simulate live updates

    setInterval(() => {

        if (Math.random() > 0.95) incomingUpdate();

    }, 30000);

    // Render Lucide icons across static UI (sidebar, topbar, modals)
    if (window.lucide) lucide.createIcons();

}

// ================= LOGIN =================

function handleLogin(e) {

    e.preventDefault();

    const user = document.getElementById('loginUser').value;

    const role = document.getElementById('loginRole').value;

    state.currentUser = { name: user, role: role };

    document.getElementById('loginScreen').style.display = 'none';

    document.getElementById('mainApp').style.display = 'block';

    const displayName = user.split('.').map(s => s[0].toUpperCase() + s.slice(1)).join(' ');

    const initials = user.split('.').map(s => s[0].toUpperCase()).join('');

    document.getElementById('userName').textContent = displayName;

    document.getElementById('userAvatar').textContent = initials;

    document.getElementById('profileName').textContent = displayName;

    document.getElementById('profileRole').textContent = role.charAt(0).toUpperCase() + role.slice(1) + ' · C1 Division';

    document.getElementById('profileAvatar').textContent = initials;

    showToast('Welcome, ' + displayName, 'success');

    init();

}

function logout() {

    state.currentUser = null;

    state.darkMode = false;

    state.notifications = [];

    state.selectedTasks.clear();

    // Reset UI to login screen

    document.getElementById('mainApp').style.display = 'none';

    document.getElementById('loginScreen').style.display = 'flex';

    // Reset theme

    document.documentElement.removeAttribute('data-theme');

    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.innerHTML = '<i data-lucide="moon" style="width:20px;height:20px;"></i>';
        if (window.lucide) lucide.createIcons();
    }

    showToast('Logged out successfully', 'info');

}

// ================= SCREEN NAVIGATION =================

function showScreen(id, button) {

    document.querySelectorAll('.screen').forEach(x => x.classList.remove('active'));

    document.getElementById(id).classList.add('active');

    const titles = {

        dashboard: 'Planning Dashboard',

        tasks: 'Maintenance Tasks',

        kanban: 'Task Board',

        aiPlanning: 'AI Planning Center',

        schedule: 'Weekly Block Schedule',

        monthly: 'Monthly Strategic Plan',

        gantt: 'Gantt View',

        corridor: 'Corridor View',

        map: 'Network Map',

        networkops: 'Network Operations',

        resources: 'Resources & Crews',

        conflicts: 'Conflict Center',

        whatif: 'What-If Simulator',

        analytics: 'Planning Analytics',

        heatmap: 'Traffic Heatmap',

        assistant: 'AI Planner Assistant',

        approval: 'Approval & Audit',

        settings: 'Settings'

    };

    const descs = {

        dashboard: 'Integrated maintenance planning • AI-assisted • Human approval required',

        tasks: 'Advanced task management with AI prioritization',

        kanban: 'Visual task board with drag-and-drop prioritization',

        aiPlanning: 'Explainable AI optimization engine',

        schedule: 'Interactive weekly block schedule',

        monthly: 'Strategic monthly maintenance planning',

        gantt: 'Timeline visualization of all activities',

        corridor: 'Visual corridor and asset mapping',

        map: 'Geographic network overview',

        networkops: 'Live control-room view of corridors, blocks, trains and conflicts',

        resources: 'Crew and equipment management',

        conflicts: 'AI-assisted conflict detection and resolution',

        whatif: 'Scenario simulation and impact analysis',

        analytics: 'Performance metrics and improvement tracking',

        heatmap: '24-hour traffic intensity visualization',

        assistant: 'Natural language planning interface',

        approval: 'Human review and authorization workflow',

        settings: 'System configuration and user preferences'

    };

    document.getElementById('pageTitle').textContent = titles[id] || 'AI-ABPS';

    document.getElementById('pageDesc').textContent = descs[id] || '';

    if (button) {

        document.querySelectorAll('.nav-btn').forEach(x => x.classList.remove('active'));

        button.classList.add('active');

    }

    window.scrollTo(0, 0);

    // Refresh charts if needed

    if (id === 'analytics') setTimeout(() => refreshCharts(), 100);

    if (id === 'resources') setTimeout(() => renderResourcesPage(), 100);

    if (id === 'whatif') setTimeout(() => ensureWhatIfReady(), 50);

    if (id === 'heatmap') setTimeout(() => renderHeatmap(), 50);

    if (id === 'networkops') setTimeout(() => initNetworkOps(), 80);

}

function go(id) {

    const buttons = [...document.querySelectorAll('.nav-btn')];

    const button = buttons.find(x => x.getAttribute('onclick')?.includes("'" + id + "'"));

    showScreen(id, button);

}

// ================= THEME =================

function toggleTheme() {

    state.darkMode = !state.darkMode;

    document.documentElement.setAttribute('data-theme', state.darkMode ? 'dark' : '');

    const toggleBtn = document.querySelector('.theme-toggle');

    if (toggleBtn) {
        toggleBtn.innerHTML = state.darkMode
            ? '<i data-lucide="sun" style="width:20px;height:20px;"></i>'
            : '<i data-lucide="moon" style="width:20px;height:20px;"></i>';
        if (window.lucide) lucide.createIcons();
    }

    const darkToggle = document.getElementById('darkToggle');

    if (darkToggle) darkToggle.classList.toggle('active', state.darkMode);

    // Refresh charts for theme

    Object.values(state.charts).forEach(c => c?.update?.());

}

// ================= SIDEBAR =================

function toggleSidebar() {

    document.getElementById('sidebar').classList.toggle('open');

}

// ================= TOAST =================

function showToast(text, type = 'info') {

    const container = document.getElementById('toastContainer');

    const toast = document.createElement('div');

    toast.className = 'toast ' + type;

    const icons = { success: 'check-circle-2', error: 'alert-circle', info: 'info' };

    toast.innerHTML = '<i data-lucide="' + (icons[type] || 'info') + '" style="width:15px;height:15px;flex-shrink:0;"></i><span>' + text + '</span><div class="toast-progress"></div>';

    container.appendChild(toast);

    if (window.lucide) { try { lucide.createIcons(toast); } catch (e) {} }

    setTimeout(() => { toast.classList.add('out'); setTimeout(() => toast.remove(), 300); }, 3000);

}

// ================= DASHBOARD =================

function renderTodayTimeline() {
    // Use state.blocks to render dynamically (supports edits)
    const getB = (id)=> state.blocks.find(x=>x.id===id) || blockData[id];
    const b042 = getB('B-042');
    const b043 = getB('B-043');
    const mkBlock = (b)=>{
        if(!b) return '<div class="block maintenance">Block not found</div>';
        const taskLabel = b.tasks.map(t=>t.id).join(' + ');
        const util = b.utilization;
        const statusBadge = getBlockStatusBadge(b.status||"Clear");
        return `<div class="block maintenance" onclick="openBlock('${b.id}')" style="cursor:pointer;justify-content:space-between;">
            <span><i data-lucide="bot" style="width:14px;height:14px;vertical-align:middle;"></i> ${b.id} · ${b.corridor} · <b>${taskLabel}</b> · ${b.tasks.length} Tasks · ${util} ${statusBadge}</span>
            <button class="edit-btn edit-btn-sm" onclick="event.stopPropagation();openEditBlock('${b.id}')">✏️ Edit</button>
        </div>`;
    };
    const mkSingle = (b)=>{
        if(!b) return '<div class="block maintenance">Block not found</div>';
        const statusBadge=getBlockStatusBadge(b.status||"Clear");
        return `<div class="block maintenance" onclick="openBlock('${b.id}')" style="cursor:pointer;justify-content:space-between;">
            <span>🛠 ${b.id} · ${b.corridor} · <b>${b.tasks[0]?.id||""}</b> · Single Task · ${b.utilization} ${statusBadge}</span>
            <button class="edit-btn edit-btn-sm" onclick="event.stopPropagation();openEditBlock('${b.id}')">✏️ Edit</button>
        </div>`;
    };
    const html = `
        <div class="timeline-row"><div class="time">09:00–10:00</div><div class="track"><div class="block train"><i data-lucide="train-front" style="width:14px;height:14px;vertical-align:middle;"></i> Passenger Train · Rajdhani Express</div></div></div>
        <div class="timeline-row"><div class="time">10:00–11:00</div><div class="track"><div class="block train"><i data-lucide="train-front" style="width:14px;height:14px;vertical-align:middle;"></i> Passenger Train · Shatabdi</div></div></div>
        <div class="timeline-row"><div class="time">11:00–12:00</div><div class="track"><div class="block warning-block"><i data-lucide="alert-triangle" style="width:14px;height:14px;vertical-align:middle;"></i> Goods traffic forecast: Medium intensity</div></div></div>
        <div class="timeline-row"><div class="time">${b042?b042.startTime+"–"+b042.endTime:"12:00–14:00"}</div><div class="track">${mkBlock(b042)}</div></div>
        <div class="timeline-row"><div class="time">14:00–15:00</div><div class="track"><div class="block train"><i data-lucide="train-front" style="width:14px;height:14px;vertical-align:middle;"></i> Scheduled Train · Freight Special</div></div></div>
        <div class="timeline-row"><div class="time">${b043?b043.startTime+"–"+b043.endTime:"15:00–17:00"}</div><div class="track">${mkSingle(b043)}</div></div>
        <div class="timeline-row"><div class="time">17:00–18:00</div><div class="track"><div class="block train"><i data-lucide="train-front" style="width:14px;height:14px;vertical-align:middle;"></i> Passenger Train · Evening Express</div></div></div>
    `;
    document.getElementById('todayTimeline').innerHTML = html;
}

function renderTopRecommendation() {

    document.getElementById('topRecommendation').innerHTML = `

        <div style="background:linear-gradient(135deg,rgba(59,130,246,0.1),rgba(139,92,246,0.1));padding:20px;border-radius:12px;margin-bottom:16px;">

            <h2 style="font-size:20px;margin-bottom:8px;">12:00–14:00 · Corridor C1</h2>

            <p class="note">Recommended common block B-042 with multi-department coordination</p>

        </div>

        <div style="display:grid;gap:10px;">

            <div style="display:flex;justify-content:space-between;padding:10px;background:var(--bg);border-radius:8px;">

                <span class="small">✓ Priority Score</span>

                <b>92/100</b>

            </div>

            <div style="display:flex;justify-content:space-between;padding:10px;background:var(--bg);border-radius:8px;">

                <span class="small">✓ Train Conflicts</span>

                <b class="green">0</b>

            </div>

            <div style="display:flex;justify-content:space-between;padding:10px;background:var(--bg);border-radius:8px;">

                <span class="small">✓ Resources</span>

                <b class="green">Available</b>

            </div>

            <div style="display:flex;justify-content:space-between;padding:10px;background:var(--bg);border-radius:8px;">

                <span class="small">✓ Tasks Bundled</span>

                <b>3 departments</b>

            </div>

            <div style="display:flex;justify-content:space-between;padding:10px;background:var(--bg);border-radius:8px;">

                <span class="small">✓ Block Utilization</span>

                <b class="blue">92%</b>

            </div>

        </div>

        <br>

        <button class="btn btn-primary" onclick="openBlock('B-042')" style="width:100%;">View Block Decision</button>
        <button class="edit-btn" style="width:100%;justify-content:center;margin-top:8px;" onclick="openEditBlock('B-042')">✏️ Edit Block B-042</button>

    `;

}

function renderLiveAlerts() {

    const alerts = [

        { type: 'red', icon: 'alert-triangle', title: 'Critical:', text: 'Track Defect T102 is overdue by 3 days. Immediate attention required.' },

        { type: 'orange', icon: 'alert-circle', title: 'Warning:', text: 'Traction Team 3 has a possible resource conflict with O221.' },

        { type: 'blue', icon: 'info', title: 'Info:', text: 'New candidate window available on Corridor C2: 14:00–16:00.' },

        { type: 'green', icon: 'check-circle', title: 'Resolved:', text: 'AI successfully bundled S210 and T130 into B-045.' }

    ];

    document.getElementById('liveAlerts').innerHTML = alerts.map(a => `

        <div class="alert alert-${a.type}">

            <span class="alert-icon"><i data-lucide="${a.icon}" style="width:16px;height:16px;"></i></span>

            <div><b>${a.title}</b> ${a.text}</div>

        </div>

    `).join('');

}

function clearAlerts() {

    document.getElementById('liveAlerts').innerHTML = '<p class="note">No active alerts</p>';

    showToast('Alerts cleared', 'success');

}

function incomingUpdate() {

    const updates = [

        '<i data-lucide="train-front" style="width:14px;height:14px;vertical-align:middle;"></i> New goods train added at 12:30 on Corridor C1',

        '<i data-lucide="zap" style="width:14px;height:14px;vertical-align:middle;"></i> Power fluctuation detected near Station C',

        '<i data-lucide="bar-chart-3" style="width:14px;height:14px;vertical-align:middle;"></i> Traffic forecast updated for evening peak',

        '<i data-lucide="wrench" style="width:14px;height:14px;vertical-align:middle;"></i> Emergency maintenance request: C3 signal failure',

        '<i data-lucide="users" style="width:14px;height:14px;vertical-align:middle;"></i> Crew availability changed: Engineering Team 2 now free'

    ];

    const update = updates[Math.floor(Math.random() * updates.length)];

    showToast(update, 'info');

    addNotification(update);

    document.getElementById('auditTrail').innerHTML += `

        <div class="audit"><span class="audit-time">${new Date().toLocaleTimeString()}</span> · Live update: ${update}</div>

    `;

}

// ================= TASKS =================

function renderTaskTable() {

    const tbody = document.getElementById('taskTableBody');

    const filtered = filterTaskData();

    tbody.innerHTML = filtered.map(t => `

        <tr class="click-row">

            <td><input type="checkbox" ${state.selectedTasks.has(t.id) ? 'checked' : ''} onchange="toggleTask('${t.id}')"></td>

            <td><span class="badge ${t.priority.toLowerCase()}">${t.priority}</span></td>

            <td><b>${t.id}</b></td>

            <td>${t.title.split(' · ')[1]}</td>

            <td>${t.department}</td>

            <td>${t.corridor}</td>

            <td>${t.duration}</td>

            <td>${t.due}</td>

            <td><b class="blue">${calculatePriorityScore(t).score}</b> <span style="font-size:12px;color:var(--muted);">(${getPriorityCategory(calculatePriorityScore(t).score).label})</span></td>

            <td><button class="btn btn-secondary btn-sm" onclick="openTask('${t.id}')">View</button></td>

        </tr>

    `).join('');

    document.getElementById('taskCount').textContent = filtered.length;

}

function filterTaskData() {

    let filtered = [...state.tasks];

    const search = document.getElementById('taskSearch')?.value?.toLowerCase() || '';

    const dept = document.getElementById('deptFilter')?.value || '';

    const priority = document.getElementById('priorityFilter')?.value || '';

    if (search) filtered = filtered.filter(t =>

        t.id.toLowerCase().includes(search) ||

        t.title.toLowerCase().includes(search) ||

        t.department.toLowerCase().includes(search)

    );

    if (dept) filtered = filtered.filter(t => t.department === dept);

    if (priority) filtered = filtered.filter(t => t.priority === priority);

    return filtered;

}

function filterTasks() {

    renderTaskTable();

}

function toggleTask(id) {

    if (state.selectedTasks.has(id)) state.selectedTasks.delete(id);

    else state.selectedTasks.add(id);

}

function toggleSelectAll() {

    const checked = document.getElementById('selectAll').checked;

    if (checked) state.tasks.forEach(t => state.selectedTasks.add(t.id));

    else state.selectedTasks.clear();

    renderTaskTable();

}

function prevPage() { showToast('Previous page'); }

function nextPage() { showToast('Next page'); }

function openTask(id) {
    const t = taskData[id];
    if (!t) return;
    document.getElementById('taskTitle').textContent = t.title;
    const priorityColors = { CRITICAL: 'critical', HIGH: 'high', MEDIUM: 'medium', LOW: 'low' };
    const pri = calculatePriorityScore(t);
    const cat = getPriorityCategory(pri.score);
    const f = pri.factors;
    let blockForSuit = null;
    if(t.block){
        blockForSuit = state.blocks.find(b=>b.id===t.block) || null;
    }
    let suitHTML = "";
    if(blockForSuit){
        const sui = calculateSuitabilityScore(blockForSuit);
        const catS = getSuitabilityCategory(sui.score);
        suitHTML = `<div style="margin-top:12px;padding:10px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:12px;"><b>Assigned Block Suitability:</b> ${sui.score}/100 <span class="badge ${catS.cls}">${catS.icon} ${catS.label}</span> &middot; ${blockForSuit.startTime}-${blockForSuit.endTime} ${blockForSuit.corridor}</div>`;
    }
    document.getElementById('taskDetails').innerHTML = `
        <div class="cards" style="grid-template-columns:repeat(3,1fr);">
            <div class="card"><div class="card-label">Legacy Priority</div><div class="card-value"><span class="badge ${priorityColors[t.priority]}">${t.priority}</span></div></div>
            <div class="card"><div class="card-label">AI Priority Score</div><div class="card-value" style="color:var(--text);">${pri.score} / 100</div><div style="margin-top:6px;"><span class="badge ${cat.cls}">${cat.icon} ${cat.label}</span></div></div>
            <div class="card"><div class="card-label">Block</div><div class="card-value">${t.block}</div></div>
        </div>
        <div class="alert alert-blue" style="margin:16px 0;">
            <span class="alert-icon">i</span>
            <div><b>AI Priority Factors (Weighted 30/25/20/15/10)</b><br>
            Safety ${f.safety}% | Asset ${f.asset}% | Urgency ${f.urgency}% | Delay ${f.delayImpact}% | Operational ${f.operational}%<br>
            <div class="progress" style="margin-top:8px;"><div class="progress-bar" style="width:${pri.score}%;"></div></div>
            <div style="font-size:13px;color:var(--muted);margin-top:6px;">Prototype Score = Safety*0.30 + Asset*0.25 + Urgency*0.20 + Delay*0.15 + Operational*0.10</div>
            </div>
        </div>
        ${suitHTML}
        <div class="alert" style="background:var(--bg);border-left:4px solid var(--blue);margin:12px 0;">
            <span class="alert-icon">#</span>
            <div><b>Why this priority?</b><br>${pri.score>=85?"High safety criticality and overdue urgency require immediate attention.":pri.score>=70?"High priority due to asset criticality and medium urgency.":pri.score>=40?"Moderate priority - preventive work with available window.":"Low priority - routine check can be scheduled flexibly."} Original: ${t.reason}</div>
        </div>
        <table>
            <tr><td><b>Department</b></td><td>${t.department}</td></tr>
            <tr><td><b>Corridor</b></td><td>${t.corridor}</td></tr>
            <tr><td><b>Expected Duration</b></td><td>${t.duration}</td></tr>
            <tr><td><b>Due Status</b></td><td>${t.due}</td></tr>
            <tr><td><b>Assigned Block</b></td><td><b>${t.block}</b></td></tr>
            <tr><td><b>AI Factors</b></td><td>Safety ${f.safety}, Asset ${f.asset}, Urgency ${f.urgency}, Delay ${f.delayImpact}, Operational ${f.operational}</td></tr>
        </table>
        <br>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="closeModal();openBlock('${t.block}')">View Assigned Block</button>
            <button class="btn btn-secondary" onclick="quickAsk('Explain ${id} priority')">Ask AI</button>
            <button class="btn btn-ghost" onclick="const el=document.getElementById('taskExplain_${id}'); if(el){el.classList.toggle('open')}">Why did AI score this?</button>
        </div>
        <div id="taskExplain_${id}" class="ai-explain">
            <b>Explainable AI - Priority Calculation</b><br><br>
            Score ${pri.score} derived from weighted factors: Safety (${f.safety}*0.30), Asset (${f.asset}*0.25), Urgency (${f.urgency}*0.20), Delay (${f.delayImpact}*0.15), Operational (${f.operational}*0.10).<br>
            Category ${cat.icon} ${cat.label} updates dynamically when task data or block timing changes.
        </div>
    `;
    document.getElementById('taskModal').classList.add('show');
}

function closeModal() {

    document.getElementById('taskModal').classList.remove('show');

}

// ================= KANBAN =================

function renderKanban() {

    const priorities = { CRITICAL: 'critical', HIGH: 'high', MEDIUM: 'medium', LOW: 'low' };

    const columns = { critical: [], high: [], medium: [], low: [] };

    state.tasks.forEach(t => {

        const col = priorities[t.priority]?.toLowerCase();

        if (col && columns[col]) columns[col].push(t);

    });

    Object.entries(columns).forEach(([col, tasks]) => {

        const container = document.getElementById('kanban' + col.charAt(0).toUpperCase() + col.slice(1));

        document.getElementById('kanban' + col.charAt(0).toUpperCase() + col.slice(1) + 'Count').textContent = tasks.length;

        container.innerHTML = tasks.map(t => `

            <div class="kanban-card" draggable="true" ondragstart="drag(event,'${t.id}')" id="kanban-${t.id}">

                <div class="kanban-card-priority badge ${t.priority.toLowerCase()}">${t.priority}</div>

                <div style="font-weight:700;font-size:12px;">${t.id}</div>

                <div style="font-size:13px;color:var(--muted);margin-top:4px;">${t.department} · ${t.corridor}</div>

                <div style="font-size:13px;color:var(--blue);margin-top:6px;">Score: ${t.risk}</div>

            </div>

        `).join('');

    });

}

function allowDrop(ev) { ev.preventDefault(); }

function drag(ev, id) {

    ev.dataTransfer.setData('taskId', id);

    ev.target.classList.add('dragging');

}

function drop(ev, priority) {

    ev.preventDefault();

    const id = ev.dataTransfer.getData('taskId');

    const el = document.getElementById('kanban-' + id);

    if (el) el.classList.remove('dragging');

    showToast(`Task ${id} moved to ${priority.toUpperCase()}`, 'success');

    renderKanban();

}

// ================= AI PLANNING =================

function renderAISteps() {

    const steps = [

        { title: 'Collect Tasks', text: 'Maintenance requests received from Engineering, S&T and Traction departments via TMS, SMMS, TDMS integration.' },

        { title: 'Calculate Priority', text: 'Safety criticality, asset importance, urgency, overdue status, and operational impact evaluated using weighted scoring.' },

        { title: 'Check Train Constraints', text: 'Windows conflicting with passenger and goods train operations are flagged and removed from consideration.' },

        { title: 'Find Candidate Windows', text: 'Operationally feasible maintenance windows identified using timetable and corridor availability data.' },

        { title: 'Check Task Compatibility', text: 'Tasks compared by location proximity, duration fit, department requirements, and safety compatibility.' },

        { title: 'Bundle Compatible Tasks', text: 'Compatible tasks grouped into common blocks when this improves utilization and meets all constraints.' },

        { title: 'Check Resources', text: 'Crew availability, equipment status, and skill requirements validated for every proposed block.' },

        { title: 'Select Best Plan', text: 'Constraint optimizer selects plan maximizing priority coverage, utilization, and multi-department coordination.' }

    ];

    document.getElementById('aiSteps').innerHTML = steps.map((s, i) => `

        <div class="ai-step">

            <div class="step-number">${i + 1}</div>

            <div>

                <div class="step-title">${s.title}</div>

                <div class="step-text">${s.text}</div>

            </div>

        </div>

    `).join('');

}

function renderAIExplanation() {

    document.getElementById('aiExplanation').innerHTML = `

        <h3 style="margin-bottom:16px;">Track Defect T102</h3>

        ${['Safety Criticality', 'Asset Criticality', 'Urgency', 'Operational Impact'].map((label, i) => {

            const values = [95, 90, 94, 88];

            return `

                <div style="margin-bottom:14px;">

                    <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:600;margin-bottom:6px;">

                        <span>${label}</span>

                        <span>${values[i]}</span>

                    </div>

                    <div class="progress"><div class="progress-bar" style="width:${values[i]}%"></div></div>

                </div>

            `;

        }).join('')}

        <div class="alert alert-red" style="margin-top:16px;">

            <span class="alert-icon"><i data-lucide="target" style="width:14px;height:14px;vertical-align:middle;"></i></span>

            <div><b>Final AI Priority: 92/100</b><br>High safety impact and overdue maintenance require immediate scheduling.</div>

        </div>

    `;

}

function renderBundlingLogic() {

    document.getElementById('bundlingLogic').innerHTML = `

        <div style="display:grid;gap:8px;margin-bottom:16px;">

            <div class="schedule-item combined-item">T102 · Track · 60 min · Engineering</div>

            <div class="schedule-item combined-item">S143 · Signal · 45 min · S&T</div>

            <div class="schedule-item combined-item">O221 · OHE · 60 min · Traction</div>

        </div>

        <div class="note">

            <b>AI Compatibility Check:</b><br><br>

            ✓ Same planning corridor (C1)<br>

            ✓ Compatible work locations (Stations B-D)<br>

            ✓ Available block duration (120 min ≥ 165 min combined)<br>

            ✓ Crew availability confirmed<br>

            ✓ Equipment availability confirmed<br>

            ✓ No train movement conflicts<br>

            ✓ Safety constraints satisfied

        </div>

        <div class="alert alert-blue" style="margin-top:16px;">

            <span class="alert-icon">🧩</span>

            <div><b>Result:</b> B-042 combines 3 compatible tasks into one coordinated maintenance block, improving utilization from 50% to 92%.</div>

        </div>

    `;

}

function runAI() {

    const icon = document.getElementById('aiRunIcon');

    icon.classList.add('spin');

    document.getElementById('loadingOverlay').classList.add('active');

    setTimeout(() => {

        icon.classList.remove('spin');

        document.getElementById('loadingOverlay').classList.remove('active');

        document.getElementById('aiResult').style.display = 'block';

        document.getElementById('aiResult').innerHTML = `

            <div class="alert alert-green">

                <span class="alert-icon">✓</span>

                <div>

                    <b>Optimization Complete ✓</b><br><br>

                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px;">

                        <div style="text-align:center;">

                            <div style="font-size:24px;font-weight:800;">15</div>

                            <div style="font-size:13px;color:var(--muted);">Tasks Optimized</div>

                        </div>

                        <div style="text-align:center;">

                            <div style="font-size:24px;font-weight:800;">6</div>

                            <div style="font-size:13px;color:var(--muted);">Blocks Recommended</div>

                        </div>

                        <div style="text-align:center;">

                            <div style="font-size:24px;font-weight:800;">87%</div>

                            <div style="font-size:13px;color:var(--muted);">Avg Utilization</div>

                        </div>

                    </div>

                </div>

            </div>

        `;

        showToast('AI optimization complete! 6 blocks recommended', 'success');

        addNotification('AI optimization completed: 6 blocks, 87% utilization');

    }, 2000);

}

// ================= WEEKLY SCHEDULE =================

function renderWeeklySchedule() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    // Build dynamic position map: use block.date + start hour to place; fallback to original schedule for demo stability
    const fallback = {
        'Monday': { '10–12': 'B-041', '12–14': 'B-042', '15–17': null },
        'Tuesday': { '10–12': null, '12–14': 'B-046', '15–17': 'B-048' },
        'Wednesday': { '10–12': 'B-043', '12–14': null, '15–17': 'B-049' },
        'Thursday': { '10–12': null, '12–14': 'B-047', '15–17': null },
        'Friday': { '10–12': 'B-045', '12–14': null, '15–17': 'B-050' }
    };
    // Create lookup by blockId for fast access (use state.blocks)
    const blockMap={};
    state.blocks.forEach(b=>blockMap[b.id]=b);
    // If a block's date/time was edited, we reposition it accordingly where possible
    // For MVP we keep original grid slots but render edited window/status
    let html = '<div class="week-cell week-head">Time</div>';
    days.forEach(d => html += `<div class="week-cell week-head">${d}</div>`);
    const slotToRange={ '10–12':{s:600,e:720}, '12–14':{s:720,e:840}, '15–17':{s:900,e:1020} };
    const times = ['10–12', '12–14', '15–17'];
    times.forEach(time => {
        html += `<div class="week-cell week-head">${time}</div>`;
        days.forEach(day => {
            const blockId = fallback[day]?.[time];
            const b = blockId ? (blockMap[blockId]||blockData[blockId]) : null;
            if (b) {
                // Check if block still belongs to this slot after edit — if not, show empty but keep block visible via slot-match fallback
                // For prototype: always show original placement, but display actual window time inside card
                const itemClass = b.type === 'COMBINED' ? 'combined-item' : 'single-item';
                const meta = b.type === 'COMBINED' ? `🧩 ${b.tasks.map(t => t.id).join(' + ')}` : (b.tasks[0]?.id||"");
                const statusBadge = getBlockStatusBadge(b.status||"Clear");
                const actualWindow = b.startTime && b.endTime ? `${b.startTime}–${b.endTime}` : b.window;
                const moved = (b.date!==day);
                html += `
                    <div class="week-cell" ondrop="dropBlock(event,'${day}','${time}')" ondragover="allowDrop(event)">
                        <div class="schedule-item ${itemClass}" onclick="openBlock('${b.id}')" draggable="true" ondragstart="dragBlock(event,'${b.id}')" style="position:relative;">
                            <div class="block-id">${b.id} · ${b.corridor} ${statusBadge}</div>
                            <div class="block-meta">${meta}</div>
                            <div class="block-meta"><i data-lucide="calendar" style="width:14px;height:14px;vertical-align:middle;"></i> ${b.date} · ${actualWindow}</div>
                            <div class="block-meta">${b.utilization} use &middot; Suit ${calculateSuitabilityScore(b).score}/100 · ${b.track||"UP"}</div>
                            ${moved?'<div class="block-meta" style="color:var(--orange);font-weight:700;">↷ Moved from '+day+'</div>':''}
                            <button class="edit-btn edit-btn-sm" style="margin-top:6px;width:100%;justify-content:center;" onclick="event.stopPropagation();openEditBlock('${b.id}')">✏️ Edit Block</button>
                        </div>
                    </div>
                `;
            } else {
                // Check if any edited block now belongs to this day/slot dynamically
                const occupying = state.blocks.find(x=>{
                    if(x.date!==day) return false;
                    const {s,e}=getBlockTimeRange(x);
                    const slot=slotToRange[time];
                    return timesOverlap(s,e,slot.s,slot.e);
                });
                if(occupying && !Object.values(fallback).some(row=>Object.values(row).includes(occupying.id))){
                    const itemClass = occupying.type === 'COMBINED' ? 'combined-item' : 'single-item';
                    const meta = occupying.type === 'COMBINED' ? `🧩 ${occupying.tasks.map(t => t.id).join(' + ')}` : (occupying.tasks[0]?.id||"");
                    html += `<div class="week-cell"><div class="schedule-item ${itemClass}" onclick="openBlock('${occupying.id}')"><div class="block-id">${occupying.id} · ${occupying.corridor} ${getBlockStatusBadge(occupying.status)}</div><div class="block-meta">${meta}</div><div class="block-meta">${occupying.startTime}–${occupying.endTime}</div><button class="edit-btn edit-btn-sm" style="margin-top:6px;width:100%;" onclick="event.stopPropagation();openEditBlock('${occupying.id}')">✏️ Edit</button></div></div>`;
                } else {
                    html += `<div class="week-cell" ondrop="dropBlock(event,'${day}','${time}')" ondragover="allowDrop(event)" style="background:var(--bg);"></div>`;
                }
            }
        });
    });
    document.getElementById('weekGrid').innerHTML = html;

}

function dragBlock(ev, id) {

    ev.dataTransfer.setData('blockId', id);

}

function dropBlock(ev, day, time) {

    ev.preventDefault();

    const id = ev.dataTransfer.getData('blockId');

    showToast(`Block ${id} moved to ${day} ${time}`, 'success');

}

function changeWeek(dir) {

    state.currentWeek += dir;

    document.getElementById('weekLabel').textContent = `Week ${state.currentWeek} · ${getWeekDates(state.currentWeek)}`;

    showToast(`Week ${state.currentWeek} loaded`);

}

function getWeekDates(week) {

    return 'Aug 24–30'; // Simplified

}

// ================= MONTHLY PLAN =================

function renderMonthlyPlan() {
    const weeks = [
        { week: 1, corridor: 'C1', focus: 'Critical Track + Signal', priority: 'critical', blocks: 4, desc: 'High-priority defect repairs and signal maintenance' },
        { week: 2, corridor: 'C3', focus: 'Traction + Engineering', priority: 'high', blocks: 5, desc: 'OHE inspection and track geometry checks' },
        { week: 3, corridor: 'C1 + C2', focus: 'Combined Preventive', priority: 'info', blocks: 6, desc: 'Preventive maintenance bundling across corridors' },
        { week: 4, corridor: 'C4', focus: 'Reserve & Flexible', priority: 'purple', blocks: 3, desc: 'Lower-priority work and contingency scheduling' }
    ];
    document.getElementById('monthGrid').innerHTML = weeks.map(w => `
        <div class="week-card">
            <h4>Week ${w.week}</h4>
            <span class="badge ${w.priority}">${w.focus.toUpperCase()}</span>
            <p class="note" style="margin-top:12px;">
                <b>${w.corridor}</b><br>
                ${w.desc}<br><br>
                <span style="color:var(--blue);font-weight:700;">${w.blocks} blocks estimated</span>
            </p>
            <div style="margin-top:12px;">
                <div class="progress">
                    <div class="progress-bar" style="width:${w.blocks * 10}%"></div>
                </div>
                <div style="font-size:13px;color:var(--muted);margin-top:6px;">Capacity planning</div>
            </div>
            <div style="margin-top:12px;display:grid;gap:6px;">
                ${state.blocks.filter(b=> (w.corridor.includes(b.corridor))).slice(0,2).map(b=>`
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:13px;">
                        <span><b>${b.id}</b> ${b.date} ${b.startTime}–${b.endTime} ${getBlockStatusBadge(b.status)}</span>
                        <button class="edit-btn edit-btn-sm" onclick="openEditBlock('${b.id}')">✏️</button>
                    </div>
                `).join('') || '<span class="note" style="font-size:13px;">No blocks in this corridor slice</span>'}
            </div>
        </div>
    `).join('');
}

function generateMonthlyPlan() {

    showToast('Generating AI monthly plan...', 'info');

    setTimeout(() => {

        showToast('Monthly plan generated with 18 optimized blocks!', 'success');

        renderMonthlyPlan();

    }, 1500);

}

// ================= GANTT =================
function renderGantt() {
    // Gantt now reflects edited blocks dynamically + synthetic trains
    const maintenance = state.blocks.map(b=>{
        const {s,e}=getBlockTimeRange(b);
        const startPct = (s/1440)*100;
        const widthPct = ((e-s)/1440)*100;
        const color = b.status==="Conflict"||b.status==="Requires Review" ? "linear-gradient(90deg,#ef4444,#f87171)" : b.status==="Warning" ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "linear-gradient(90deg,#3b82f6,#8b5cf6)";
        return { name:`${b.id} · ${b.corridor} · ${b.startTime}–${b.endTime} ${getBlockStatusBadge(b.status).replace(/<[^>]*>/g,'')}`, short:`${b.id}`, start:startPct, width:Math.max(widthPct,2), color, type:'maintenance', blockId:b.id, corridor:b.corridor, window:`${b.startTime}–${b.endTime}` };
    });
    const trains = trainSchedule.slice(0,4).map(t=>{
        const s=timeToMinutes(t.start), e=timeToMinutes(t.end);
        return { name:`Train ${t.id} · ${t.corridor} ${t.start}–${t.end}`, start:(s/1440)*100, width:((e-s)/1440)*100, color:'#64748b', type:'train' };
    });
    const activities=[...maintenance,...trains];
    const filter = document.getElementById('ganttFilter')?.value || 'all';
    const filtered = filter === 'all' ? activities : activities.filter(a => a.type === filter);
    let html = `
        <div class="gantt-row" style="font-weight:700;font-size:13px;color:var(--muted);">
            <div>Activity</div>
            <div style="display:flex;justify-content:space-between;font-size:12px;">
                ${[0,4,8,12,16,20,24].map(h => `<span>${h}:00</span>`).join('')}
            </div>
        </div>
    `;
    filtered.forEach(a => {
        if(a.type==='maintenance'){
            html += `
                <div class="gantt-row">
                    <div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:6px;">${a.short} <span style="font-size:12px;color:var(--muted);">${a.corridor} ${a.window}</span> <button class="edit-btn edit-btn-sm" onclick="openEditBlock('${a.blockId}')">✏️ Edit</button></div>
                    <div class="gantt-bar-container">
                        <div class="gantt-bar" style="left:${a.start}%;width:${a.width}%;background:${a.color};cursor:pointer;" onclick="openBlock('${a.blockId}')" title="${a.name}">
                            ${a.short} ${a.window}
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="gantt-row">
                    <div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.name}</div>
                    <div class="gantt-bar-container">
                        <div class="gantt-bar" style="left:${a.start}%;width:${a.width}%;background:${a.color};">
                            ${a.name}
                        </div>
                    </div>
                </div>
            `;
        }
    });
    document.getElementById('ganttChart').innerHTML = html;
}

// ================= CORRIDOR =================

function renderCorridor(corridor) {

    const stations = ['Station A', 'Station B', 'Station C', 'Station D', 'Station E'];

    const tasks = {

        'C1': [{ station: 1, id: 'T102', name: 'Track Defect', color: '#ef4444' }, { station: 2, id: 'S143', name: 'Signal', color: '#f59e0b' }, { station: 3, id: 'O221', name: 'OHE', color: '#3b82f6' }],

        'C2': [{ station: 1, id: 'S201', name: 'Signal Check', color: '#10b981' }, { station: 2, id: 'S205', name: 'Relay', color: '#10b981' }],

        'C3': [{ station: 1, id: 'T119', name: 'Track Insp', color: '#8b5cf6' }, { station: 3, id: 'O310', name: 'OHE Prev', color: '#ec4899' }],

        'C4': [{ station: 2, id: 'S401', name: 'Signal Test', color: '#14b8a6' }, { station: 3, id: 'S402', name: 'Cable', color: '#14b8a6' }]

    };

    const corridorTasks = tasks[corridor] || [];

    let html = `

        <div class="station-row">

            ${stations.map(s => `

                <div class="station">

                    <div class="station-name">${s}</div>

                    <div class="station-dot"></div>

                    <div class="station-connector"></div>

                </div>

            `).join('')}

        </div>

        <div class="track-area">

            <div class="sleepers"></div>

            <div class="rail top"></div>

            <div class="rail bottom"></div>

        </div>

        <div class="task-row">

            ${stations.map((s, i) => {

                const task = corridorTasks.find(t => t.station === i);

                if (task) {

                    return `

                        <div class="station-task">

                            <div class="task-marker" style="background:${task.color}20;color:${task.color};border-color:${task.color}40;">

                                ${task.id}<br>${task.name}

                            </div>

                        </div>

                    `;

                }

                return `<div class="station-task"><div class="no-task">No active task</div></div>`;

            }).join('')}

        </div>

    `;

    document.getElementById('corridorVisual').innerHTML = html;

    document.getElementById('corridorInsight').innerHTML = `

        <div class="alert alert-blue" style="margin-top:16px;">

            <span class="alert-icon"><i data-lucide="bot" style="width:14px;height:14px;vertical-align:middle;"></i></span>

            <div>

                <b>AI Coordination Insight:</b><br>

                ${corridorTasks.length} tasks located within the ${corridor} planning area.

                ${corridorTasks.length > 1 ? 'The AI identifies them as potentially compatible for coordinated execution.' : 'Single task requires dedicated block allocation.'}

            </div>

        </div>

    `;

    document.getElementById('corridorCards').innerHTML = corridorTasks.map(t => `

        <div class="card">

            <div class="card-label">${t.name}</div>

            <div class="card-value" style="font-size:20px;">${t.id}</div>

            <div class="small">${stations[t.station]}</div>

        </div>

    `).join('');

}

function changeCorridor(c) {

    renderCorridor(c);

    showToast(`Showing Corridor ${c}`);

}

// ================= MAP =================

function initMap() {

    const mapEl = document.getElementById('map');

    if (!mapEl || typeof L === 'undefined') return;

    // Use a simple fallback since we need real map tiles

    mapEl.innerHTML = `

        <div style="height:400px;background:linear-gradient(135deg,var(--navy2),var(--navy3));border-radius:12px;display:flex;align-items:center;justify-content:center;flex-direction:column;color:white;gap:16px;">

            <div style="font-size:48px;"><i data-lucide="map" style="width:14px;height:14px;vertical-align:middle;"></i></div>

            <div style="font-size:18px;font-weight:700;">Interactive Network Map</div>

            <div style="color:#94a3b8;">Leaflet map with corridor overlays would render here</div>

            <div style="display:flex;gap:20px;margin-top:8px;">

                <div style="text-align:center;"><div style="width:20px;height:20px;background:#3b82f6;border-radius:50%;margin:0 auto 8px;"></div>C1 Active</div>

                <div style="text-align:center;"><div style="width:20px;height:20px;background:#10b981;border-radius:50%;margin:0 auto 8px;"></div>C2 Clear</div>

                <div style="text-align:center;"><div style="width:20px;height:20px;background:#f59e0b;border-radius:50%;margin:0 auto 8px;"></div>C3 Caution</div>

                <div style="text-align:center;"><div style="width:20px;height:20px;background:#8b5cf6;border-radius:50%;margin:0 auto 8px;"></div>C4 Maintenance</div>

            </div>

        </div>

    `;

}

function refreshMap() {

    showToast('Map refreshed with latest data');

    initMap();

}

// ================= RESOURCES & CREWS =================

const RESOURCE_CREW_STATUS = {
    available: ['low', 'AVAILABLE'],
    limited: ['medium', 'LIMITED'],
    unavailable: ['high', 'UNAVAILABLE']
};

const RESOURCE_DEPTS = ['Engineering', 'S&T', 'Traction/OHE'];

function getResourceFilters() {
    const grab = (id) => {
        const el = document.getElementById(id);
        return el ? el.value : 'All';
    };
    return { dept: grab('filterDept'), status: grab('filterStatus'), corridor: grab('filterCorridor') };
}

function getCrewAssignment(c) {
    if (c.required <= 0) return null;
    const blocks = state.blocks || [];
    const deptKey = c.department === 'Traction/OHE' ? 'Traction' : c.department;
    return blocks.find(b =>
        b.corridor === c.corridor &&
        (b.tasks || []).some(t => (t.department || '') === deptKey || (t.department || '') === c.department)
    ) || null;
}

function crewAssignmentHTML(asg) {
    if (!asg) return '<span style="color:var(--muted);">Unassigned</span>';
    return `<span class="badge info">${asg.id}</span> <span style="color:var(--text2);font-size:12px;white-space:nowrap;">${asg.corridor} · ${asg.date} ${asg.startTime}–${asg.endTime}</span>`;
}

function renderResourcesPage() {
    renderResourceKPIs();
    renderCrewTable();
    renderEquipmentTable();
    renderResourceConflicts();
    renderAIInsight();
    renderResourceUtilizationChart();
    if (window.lucide) lucide.createIcons();
}

function renderResourceKPIs() {
    const el = document.getElementById('resourceKpis');
    if (!el) return;
    const availTeams = crewData.filter(c => c.status === 'available').length;
    const activeCrews = crewData.filter(c => c.available > 0 && c.required > 0).length;
    const availEquip = equipmentData.reduce((s, e) => s + e.available, 0);
    const conflicts = crewData.filter(c => c.required > c.available).length + equipmentData.filter(e => e.required > e.available).length;
    const totalAvail = crewData.reduce((s, c) => s + c.available, 0) + availEquip;
    const totalReq = crewData.reduce((s, c) => s + c.required, 0) + equipmentData.reduce((s, e) => s + e.required, 0);
    const utilization = totalAvail > 0 ? Math.round((totalReq / totalAvail) * 100) : 0;
    el.innerHTML = `
        <div class="kpi-card"><div class="kpi-label">Available Crews</div><div class="kpi-value">${availTeams} <span style="font-size:12px;color:var(--muted);">/ ${crewData.length}</span></div><div class="kpi-delta">maintenance teams ready</div></div>
        <div class="kpi-card"><div class="kpi-label">Active Crews</div><div class="kpi-value">${activeCrews}</div><div class="kpi-delta">assigned to blocks</div></div>
        <div class="kpi-card"><div class="kpi-label">Equipment Available</div><div class="kpi-value">${availEquip} <span style="font-size:12px;color:var(--muted);">/ ${equipmentData.length}</span></div><div class="kpi-delta">units of ${equipmentData.length} types</div></div>
        <div class="kpi-card"><div class="kpi-label">Resource Conflicts</div><div class="kpi-value" style="color:${conflicts > 0 ? 'var(--red)' : 'var(--green)'};">${conflicts}</div><div class="kpi-delta">need attention</div></div>
        <div class="kpi-card"><div class="kpi-label">Utilization</div><div class="kpi-value" style="color:${utilization <= 100 ? 'var(--green)' : 'var(--orange)'};">${utilization}%</div><div class="kpi-delta">required vs available</div></div>
    `;
}

function renderCrewTable() {
    const tbl = document.getElementById('crewTable');
    if (!tbl) return;
    const flt = getResourceFilters();
    const rows = crewData.filter(c =>
        (flt.dept === 'All' || c.department === flt.dept) &&
        (flt.status === 'All' || c.status === flt.status.toLowerCase()) &&
        (flt.corridor === 'All' || c.corridor === flt.corridor)
    );
    const headerRow = `<tr><th>Crew/Team</th><th>Department</th><th>Corridor</th><th>Members</th><th>Required</th><th>Status</th><th>Current Assignment</th><th>Skills</th></tr>`;
    const body = rows.map(c => {
        const [cls, label] = RESOURCE_CREW_STATUS[c.status] || ['low', 'AVAILABLE'];
        const asg = getCrewAssignment(c);
        return `<tr class="resource-table-row" onclick="openResourceDetail('crew','${c.name}')">
            <td><b>${c.name}</b></td>
            <td>${c.department}</td>
            <td>${c.corridor}</td>
            <td>${c.available}</td>
            <td>${c.required > 0 ? c.required : '<span style="color:var(--muted);">0</span>'}</td>
            <td><span class="badge ${cls}">${label}</span></td>
            <td>${crewAssignmentHTML(asg)}</td>
            <td>${c.skills.map(s => `<span class="badge single" style="font-size:11px;margin:2px;">${s}</span>`).join('')}</td>
        </tr>`;
    }).join('');
    tbl.innerHTML = headerRow + (body || '<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">No crews match your filters</div><div class="empty-desc">Try resetting the Department, Status, or Corridor filters above.</div></div></td></tr>');
}

function renderEquipmentTable() {
    const tbl = document.getElementById('equipmentTable');
    if (!tbl) return;
    const flt = getResourceFilters();
    const rows = equipmentData.filter(e =>
        (flt.dept === 'All' || e.department === flt.dept) &&
        (flt.status === 'All' || e.status === flt.status.toUpperCase()) &&
        (flt.corridor === 'All' || e.corridor === flt.corridor)
    );
    const headerRow = `<tr><th>Equipment</th><th>Department</th><th>Available</th><th>Required</th><th>Status</th><th>Assigned Block</th></tr>`;
    const body = rows.map(e => {
        const cls = e.status === 'AVAILABLE' ? 'low' : e.status === 'RESERVED' ? 'medium' : 'high';
        const blockHTML = (e.status !== 'AVAILABLE' && e.assignedBlock) ? `<span class="badge info">${e.assignedBlock}</span>` : '—';
        return `<tr class="resource-table-row" onclick="openResourceDetail('equipment','${e.name}')">
            <td><b>${e.name}</b></td>
            <td>${e.department}</td>
            <td>${e.available}</td>
            <td>${e.required > 0 ? e.required : '<span style="color:var(--muted);">0</span>'}</td>
            <td><span class="badge ${cls}">${e.status}</span></td>
            <td>${blockHTML}</td>
        </tr>`;
    }).join('');
    tbl.innerHTML = headerRow + (body || '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">No equipment matches your filters</div><div class="empty-desc">Try resetting the Department, Status, or Corridor filters above.</div></div></td></tr>');
}

function renderResourceConflicts() {
    const list = document.getElementById('resourceConflictsList');
    const badge = document.getElementById('resourceConflictBadge');
    if (!list) return;
    const cards = [];

    crewData.forEach(c => {
        if (c.required > c.available) {
            const short = c.required - c.available;
            const asg = getCrewAssignment(c);
            cards.push(`
                <div class="resource-conflict-card">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                        <b><i data-lucide="users" style="width:14px;height:14px;vertical-align:middle;"></i> ${c.name}</b>
                        <span class="badge high">Resource Conflict</span>
                    </div>
                    <div class="note" style="margin-top:8px;font-size:13px;">
                        <b>Block:</b> ${crewAssignmentHTML(asg)}<br>
                        <b>Conflict:</b> ${c.name} requires ${c.required} crew but only ${c.available} are available in Corridor ${c.corridor} (short by ${short}).
                    </div>
                    <div style="background:rgba(245,158,11,0.10);border:1px solid rgba(245,158,11,0.25);padding:10px;border-radius:8px;font-size:12px;margin-top:8px;">
                        <b>AI Recommendation:</b> Redeploy reserve crew from standby teams or reschedule the ${c.department} task to a gap in the ${c.corridor} weekly window to close the ${short} crew shortfall.
                    </div>
                </div>`);
        }
    });

    equipmentData.forEach(e => {
        if (e.required > e.available) {
            const short = e.required - e.available;
            cards.push(`
                <div class="resource-conflict-card">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                        <b><i data-lucide="wrench" style="width:14px;height:14px;vertical-align:middle;"></i> ${e.name}</b>
                        <span class="badge high">Resource Conflict</span>
                    </div>
                    <div class="note" style="margin-top:8px;font-size:13px;">
                        <b>Block:</b> ${e.assignedBlock ? `<span class="badge info">${e.assignedBlock}</span>` : '—'}<br>
                        <b>Conflict:</b> ${e.name} requires ${e.required} unit(s) but only ${e.available} are available (short by ${short}).
                    </div>
                    <div style="background:rgba(245,158,11,0.10);border:1px solid rgba(245,158,11,0.25);padding:10px;border-radius:8px;font-size:12px;margin-top:8px;">
                        <b>AI Recommendation:</b> Borrow the unit from a lower-priority window or use the reserve alternative listed under ${e.department} before finalizing block assignment.
                    </div>
                </div>`);
        }
    });

    list.innerHTML = cards.length
        ? cards.join('')
        : '<div class="note" style="padding:16px 0;">No active crew or equipment shortages detected in the current plan.</div>';

    if (badge) badge.textContent = cards.length + (cards.length === 1 ? ' CONFLICT' : ' CONFLICTS');
}

function renderAIInsight() {
    const el = document.getElementById('resourceAIInsight');
    if (!el) return;
    const deptConflicts = {};
    crewData.forEach(c => {
        if (c.required > c.available) deptConflicts[c.department] = (deptConflicts[c.department] || 0) + 1;
    });
    equipmentData.forEach(e => {
        if (e.required > e.available) deptConflicts[e.department] = (deptConflicts[e.department] || 0) + 1;
    });
    const deptList = Object.entries(deptConflicts).sort((a, b) => b[1] - a[1]);
    const worstDept = deptList.length ? deptList[0][0] : null;

    const corrDemand = {};
    crewData.forEach(c => {
        corrDemand[c.corridor] = corrDemand[c.corridor] || { avail: 0, req: 0 };
        corrDemand[c.corridor].avail += c.available;
        corrDemand[c.corridor].req += c.required;
    });
    let attentionCorr = 'None';
    let worstShort = 0;
    ['C1', 'C2', 'C3', 'C4'].forEach(cid => {
        const v = corrDemand[cid] || { avail: 0, req: 0 };
        const short = v.req - v.avail;
        if (short > worstShort) { worstShort = short; attentionCorr = cid; }
    });

    const totalAvail = crewData.reduce((s, c) => s + c.available, 0) + equipmentData.reduce((s, e) => s + e.available, 0);
    const totalReq = crewData.reduce((s, c) => s + c.required, 0) + equipmentData.reduce((s, e) => s + e.required, 0);
    const util = totalAvail > 0 ? Math.round((totalReq / totalAvail) * 100) : 100;

    const deptNote = deptList.length
        ? `Department <b>${worstDept}</b> carries the most active resource conflicts (${deptConflicts[worstDept]}), and Corridor <b>${attentionCorr}</b> ${worstShort > 0 ? `needs ${worstShort} additional crew` : 'has balanced coverage'} for the upcoming maintenance window.`
        : `No crew or equipment shortages are active; all departments are adequately resourced for the current week.`;

    el.innerHTML = `
        <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:8px;">
            <i data-lucide="sparkles" style="width:16px;height:16px;color:var(--blue);margin-top:2px;"></i>
            <b style="font-size:14px;">AI Observation</b>
        </div>
        <p style="margin:0;font-size:13px;line-height:1.7;">
            Overall crew coverage is <b>${util}%</b> (${totalReq} required vs ${totalAvail} available). ${deptNote}
            The AI recommends reviewing ${worstDept ? worstDept : 'resource'} assignments first and using reserve redeployment before opening any new maintenance windows.
        </p>`;
}

function renderResourceUtilizationChart() {
    const ctx = document.getElementById('resourceChart');
    if (!ctx) return;
    if (state.charts.resource) state.charts.resource.destroy();
    const deptMap = {};
    RESOURCE_DEPTS.forEach(d => deptMap[d] = { avail: 0, req: 0 });
    crewData.forEach(c => {
        if (!deptMap[c.department]) deptMap[c.department] = { avail: 0, req: 0 };
        deptMap[c.department].avail += c.available;
        deptMap[c.department].req += c.required;
    });
    equipmentData.forEach(e => {
        if (!deptMap[e.department]) deptMap[e.department] = { avail: 0, req: 0 };
        deptMap[e.department].avail += e.available;
        deptMap[e.department].req += e.required;
    });
    const avail = RESOURCE_DEPTS.map(d => deptMap[d].avail);
    const req = RESOURCE_DEPTS.map(d => deptMap[d].req);
    const remain = RESOURCE_DEPTS.map(d => Math.max(deptMap[d].avail - deptMap[d].req, 0));
    state.charts.resource = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: RESOURCE_DEPTS,
            datasets: [
                { label: 'Available', data: avail, backgroundColor: '#10b981' },
                { label: 'Assigned / Required', data: req, backgroundColor: '#3b82f6' },
                { label: 'Remaining', data: remain, backgroundColor: '#94a3b8' }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Resource availability by department (crew + equipment)' } },
            scales: {
                x: { stacked: true, beginAtZero: true },
                y: { stacked: true }
            }
        }
    });
}

function openResourceDetail(type, key) {
    const drawer = document.getElementById('resourceDrawer');
    const title = document.getElementById('resourceDrawerTitle');
    const content = document.getElementById('resourceDrawerContent');
    if (!drawer || !title || !content) return;
    if (type === 'crew') {
        const c = crewData.find(x => x.name === key);
        if (!c) return;
        const [cls, label] = RESOURCE_CREW_STATUS[c.status] || ['low', 'AVAILABLE'];
        const asg = getCrewAssignment(c);
        title.textContent = c.name;
        content.innerHTML = `
            <div class="resource-detail-badge">
                <span class="badge ${cls}">${label}</span>
                <span class="badge single">${c.department}</span>
            </div>
            <table class="resource-detail-table">
                <tr><td><b>Department</b></td><td>${c.department}</td></tr>
                <tr><td><b>Corridor</b></td><td>${c.corridor}</td></tr>
                <tr><td><b>Members Available</b></td><td>${c.available}</td></tr>
                <tr><td><b>Required</b></td><td>${c.required}</td></tr>
                <tr><td><b>Crew Balance</b></td><td style="color:${c.available - c.required < 0 ? 'var(--red)' : 'var(--green)'};">${c.available - c.required < 0 ? 'Short by ' + (c.required - c.available) : 'Sufficient'}</td></tr>
                <tr><td><b>Sub-Status</b></td><td>${c.subStatus || '—'}</td></tr>
                <tr><td><b>Current Assignment</b></td><td>${crewAssignmentHTML(asg)}</td></tr>
            </table>
            <div class="note" style="margin-top:12px;"><b>Skills</b><br><div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">${c.skills.map(s => `<span class="badge single">${s}</span>`).join('')}</div></div>
            ${asg ? `<button class="btn btn-primary" style="margin-top:16px;width:100%;" onclick="viewAssignedBlock('${asg.id}')"><i data-lucide="eye" style="width:14px;height:14px;"></i> View Assigned Block</button>` : ''}
        `;
    } else {
        const e = equipmentData.find(x => x.name === key);
        if (!e) return;
        const cls = e.status === 'AVAILABLE' ? 'low' : e.status === 'RESERVED' ? 'medium' : 'high';
        title.textContent = e.name;
        content.innerHTML = `
            <div class="resource-detail-badge">
                <span class="badge ${cls}">${e.status}</span>
                <span class="badge single">${e.department}</span>
            </div>
            <table class="resource-detail-table">
                <tr><td><b>Department</b></td><td>${e.department}</td></tr>
                <tr><td><b>Corridor</b></td><td>${e.corridor || '—'}</td></tr>
                <tr><td><b>Units Available</b></td><td>${e.available}</td></tr>
                <tr><td><b>Units Required</b></td><td>${e.required}</td></tr>
                <tr><td><b>Status</b></td><td><span class="badge ${cls}">${e.status}</span></td></tr>
                <tr><td><b>Assigned Block</b></td><td>${e.assignedBlock ? `<span class="badge info">${e.assignedBlock}</span>` : '—'}</td></tr>
            </table>
            ${e.assignedBlock ? `<button class="btn btn-primary" style="margin-top:16px;width:100%;" onclick="viewAssignedBlock('${e.assignedBlock}')"><i data-lucide="eye" style="width:14px;height:14px;"></i> View Assigned Block</button>` : ''}
        `;
    }
    drawer.classList.add('open');
    if (window.lucide) lucide.createIcons();
}

function viewAssignedBlock(id) {
    closeResourceDrawer();
    openBlock(id);
}

function closeResourceDrawer() {
    const drawer = document.getElementById('resourceDrawer');
    if (drawer) drawer.classList.remove('open');
}

function filterResources() {
    renderCrewTable();
    renderEquipmentTable();
    if (window.lucide) lucide.createIcons();
}

// ================= CONFLICTS =================

function renderConflictCenter() {

    document.getElementById('conflictCards').innerHTML = `

        <div class="card">

            <div class="card-label">Critical Conflicts</div>

            <div class="card-value red">${conflicts.filter(c => c.severity === 'critical').length}</div>

        </div>

        <div class="card">

            <div class="card-label">Warnings</div>

            <div class="card-value orange">${conflicts.filter(c => c.severity === 'warning').length}</div>

        </div>

        <div class="card">

            <div class="card-label">AI Resolved</div>

            <div class="card-value green">7</div>

        </div>

    `;

    document.getElementById('conflictList').innerHTML = conflicts.map(c => `

        <div class="alert alert-${c.severity === 'critical' ? 'red' : 'orange'}">

            <span class="alert-icon">${c.severity === 'critical' ? '🔴' : '🟠'}</span>

            <div>

                <b>${c.type === 'train' ? '<i data-lucide="train-front" style="width:14px;height:14px;vertical-align:middle;"></i> Train Conflict' : c.type === 'resource' ? '<i data-lucide="users" style="width:14px;height:14px;vertical-align:middle;"></i> Resource Conflict' : c.type === 'equipment' ? '🔧 Equipment' : '⏱ Duration Warning'} · ${c.task}</b><br>

                ${c.description}<br><br>

                <div style="background:rgba(255,255,255,0.5);padding:10px;border-radius:8px;font-size:12px;">

                    <b>AI Resolution:</b> ${c.resolution}

                </div>

                <br>

                <button class="btn btn-secondary btn-sm" onclick="showToast('Applied AI resolution for ${c.task}')">Apply Resolution</button>

            </div>

        </div>

    `).join('');

}

// ================= APPROVAL & AUDIT (Prompt 4) =================

const APPROVAL_STORAGE_KEY = "aiabps_approvals";
const AUDIT_STORAGE_KEY = "aiabps_audit";

function saveApprovalsToStorage(){
    try{
        const payload = {};
        Object.keys(state.approvals).forEach(k=>{ payload[k] = state.approvals[k]; });
        localStorage.setItem(APPROVAL_STORAGE_KEY, JSON.stringify(payload));
    }catch(e){ console.warn("saveApprovalsToStorage",e); }
}
function loadApprovals(){
    try{
        const raw = localStorage.getItem(APPROVAL_STORAGE_KEY);
        if(raw) return JSON.parse(raw);
    }catch(e){}
    return {};
}
function saveAuditToStorage(){
    try{
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(state.auditRecords));
    }catch(e){ console.warn("saveAuditToStorage",e); }
}
function loadAudit(){
    try{
        const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
        if(Array.isArray(JSON.parse(raw))) return JSON.parse(raw);
    }catch(e){}
    return [];
}

function getApprovalStatus(id){
    return state.approvals[id] || {category:'pending'};
}

function getConflictSummaryForBlock(b){
    if(!b) return '—';
    try{
        const analysis = analyzeBlockConflicts(b);
        const parts=[];
        if(analysis.trainConflicts.length) parts.push(analysis.trainConflicts.length+' train');
        if(analysis.blockConflicts.length) parts.push(analysis.blockConflicts.length+' overlap');
        if(analysis.resourceConflicts.length) parts.push(analysis.resourceConflicts.length+' resource');
        return parts.length? parts.join(', ') : 'None';
    }catch(e){
        return b.status && b.status!=="Clear" ? b.status : 'None';
    }
}

function renderApprovalCenter() {
    const blocks = state.blocks;
    const decisions = blocks.map(b=>getApprovalStatus(b.id));
    const pending = decisions.filter(d=>d.category==='pending'||d.category==='requires').length;
    const approved = decisions.filter(d=>d.category==='approved').length;
    const rejected = decisions.filter(d=>d.category==='rejected').length;
    document.getElementById('approvalCards').innerHTML = `
        <div class="card"><div class="card-label">Pending Review</div><div class="card-value">${pending}</div></div>
        <div class="card"><div class="card-label">Approved</div><div class="card-value" style="color:#16a34a;">${approved}</div></div>
        <div class="card"><div class="card-label">Rejected</div><div class="card-value" style="color:#dc2626;">${rejected}</div></div>
        <div class="card"><div class="card-label">Total Blocks</div><div class="card-value">${blocks.length}</div></div>
    `;
    const statusEl = document.getElementById('approvalStatus');
    if(pending>0){ statusEl.textContent = pending+' PENDING REVIEW'; statusEl.className='badge info'; }
    else if(rejected>0){ statusEl.textContent = 'REJECTED'; statusEl.className='badge critical'; }
    else { statusEl.textContent = 'ALL APPROVED'; statusEl.className='badge low'; }

    document.getElementById('approvalTableBody').innerHTML = blocks.map((b) => {
        const a = getApprovalStatus(b.id);
        let recInfo='';
        try{
            const rec = generateAIRecommendation(b);
            recInfo = rec.title;
        }catch(e){ recInfo = b.status||'Clear'; }
        let pri='—', sui='—';
        try{
            pri = getBlockPriorityScore(b).score;
            sui = calculateSuitabilityScore(b).score;
        }catch(e){}
        const checked = state.approvalSelection.has(b.id) ? 'checked' : '';
        const statusCell = a.category==='approved'
            ? '<span class="badge low">✓ APPROVED</span>'
            : (a.category==='rejected' ? '<span class="badge critical">✕ REJECTED</span>'
            : '<span class="badge info">PENDING</span>');
        return `
        <tr>
            <td><input type="checkbox" class="approval-check" ${checked} onchange="toggleApprovalSelection('${b.id}')"></td>
            <td><b>${b.id}</b></td>
            <td>${b.corridor}</td>
            <td>${b.startTime}–${b.endTime}<br><span style="font-size:13px;color:var(--muted);">${b.date}</span></td>
            <td><b>${pri}/100</b></td>
            <td>${statusCell}<br><span class="small" style="color:var(--muted);">${recInfo}</span></td>
            <td><b>${sui}%</b></td>
            <td>${getConflictSummaryForBlock(b)}</td>
            <td style="display:flex;gap:6px;flex-wrap:wrap;">
                <button class="btn btn-secondary btn-sm" onclick="openApprovalDetail('${b.id}')">View</button>
                ${a.category!=='approved' ? '<button class="btn btn-success btn-sm" onclick="approveBlockApproval(\''+b.id+'\')">Approve</button>' : ''}
                ${a.category!=='rejected' ? '<button class="btn btn-danger btn-sm" onclick="rejectBlockApproval(\''+b.id+'\')">Reject</button>' : ''}
            </td>
        </tr>`;
    }).join('');
    updateApprovalBulkBar();
    if (window.lucide) lucide.createIcons();
}

// ---- Selection / bulk ----
function toggleApprovalSelection(id){
    if(state.approvalSelection.has(id)) state.approvalSelection.delete(id);
    else state.approvalSelection.add(id);
    renderApprovalCenter();
}
function toggleSelectAllApprovals(){
    const on = document.getElementById('approvalSelectAll').checked;
    state.approvalSelection.clear();
    if(on) state.blocks.forEach(b=>state.approvalSelection.add(b.id));
    renderApprovalCenter();
}
function clearApprovalSelection(){
    state.approvalSelection.clear();
    renderApprovalCenter();
}
function updateApprovalBulkBar(){
    const n = state.approvalSelection.size;
    const bar = document.getElementById('approvalBulkBar');
    const count = document.getElementById('approvalBulkCount');
    if(n>0){
        bar.style.display='flex';
        count.textContent = n + (n===1?' block selected':' blocks selected');
    } else {
        bar.style.display='none';
    }
    const selAll = document.getElementById('approvalSelectAll');
    if(selAll){
        const allSelected = state.blocks.length>0 && state.blocks.every(b=>state.approvalSelection.has(b.id));
        selAll.checked = allSelected;
        selAll.indeterminate = n>0 && !allSelected;
    }
}
function approveSelectedApprovals(){
    const ids = Array.from(state.approvalSelection);
    if(!ids.length){ showToast('No blocks selected','error'); return; }
    ids.forEach(id=>recordApproval(id,'approved',null,false));
    state.approvalSelection.clear();
    showToast('Approved '+ids.length+' block'+(ids.length>1?'s':'')+' successfully','success');
    renderApprovalCenter();
}
function rejectSelectedApprovals(){
    const ids = Array.from(state.approvalSelection);
    if(!ids.length){ showToast('No blocks selected','error'); return; }
    const reason = prompt('Reason for rejecting the selected blocks (required):');
    if(reason===null) return;
    if(!reason.trim()){ showToast('A reason is required for rejection','error'); return; }
    ids.forEach(id=>recordApproval(id,'rejected',reason.trim(),false));
    state.approvalSelection.clear();
    showToast('Rejected '+ids.length+' block'+(ids.length>1?'s':'')+' — sent back for revision','error');
    renderApprovalCenter();
}

// ---- Recording decisions ----
function recordApproval(id, category, reason, isOverride){
    const aiRecType = (function(){ try{ return generateAIRecommendation(getBlockById(id)).type; }catch(e){ return null; } })();
    const b = getBlockById(id);
    const label = b ? b.id : id;
    state.approvals[id] = {category, reason:reason||'', by:(state.currentUser?.name||'Demo Planner'), time:Date.now(), aiRecType};
    saveApprovalsToStorage();
    const cat = category==='approved' ? 'approval' : 'rejection';
    let auditText = (category==='approved' ? 'Approved' : 'Rejected') + ' block ' + label + (reason? ' — '+reason : '');
    addAudit(cat, auditText, reason, id, isOverride);
    if(category==='approved'){
        addNotification('Block ' + label + ' has been approved');
    } else {
        addNotification('Block ' + label + ' was rejected and sent back for revision');
    }
}

function approveBlockApproval(id){
    openApprovalDecisionModal(id,'approve');
}
function rejectBlockApproval(id){
    openApprovalDecisionModal(id,'reject');
}
function openApprovalDecisionModal(id, action){
    const b = getBlockById(id);
    if(!b){ showToast('Block not found','error'); return; }
    const a = getApprovalStatus(id);
    let aiType=null, aiTitle='';
    try{ const r=generateAIRecommendation(b); aiType=r.type; aiTitle=r.title; }catch(e){}
    const isOverride = (action==='approve' && aiType!=='KEEP_CURRENT_PLAN') || (action==='reject');
    const modal = document.getElementById('approvalDetailModal');
    document.getElementById('approvalDetailTitle').textContent = (action==='approve'?'Approve':'Reject') + ' Block ' + id;
    document.getElementById('approvalDetailBody').innerHTML = `
        <div class="form-grid">
            <div><label>Block</label><div style="padding:8px 0;font-weight:600;">${b.id} · ${b.corridor}</div></div>
            <div><label>Window</label><div style="padding:8px 0;font-weight:600;">${b.startTime}–${b.endTime} · ${b.date}</div></div>
        </div>
        <div class="alert alert-blue" style="margin:12px 0;">
            <span class="alert-icon"><i data-lucide="bot" style="width:14px;height:14px;vertical-align:middle;"></i></span>
            <div><b>AI Recommendation: ${aiTitle||'N/A'}</b><br><br>${a.reason && a.category!=='pending' ? 'Current human decision: '+(a.category==='approved'?'Approved':'Rejected')+(a.reason?' — '+a.reason:'') : 'No human decision recorded yet for this block.'}</div>
        </div>
        ${isOverride ? '<div class="alert alert-orange" style="margin:12px 0;"><span class="alert-icon"><i data-lucide="shield-alert" style="width:14px;height:14px;vertical-align:middle;"></i></span><div><b>Human Override</b><br>Your decision differs from the AI recommendation. Please provide a short justification for the audit log.</div></div>' : ''}
        ${isOverride ? `
        <label>Override reason ${action==='reject'?'(required)':'(recommended)'}</label>
        <textarea id="overrideReason" rows="3" placeholder="Why does the human decision override the AI recommendation?" style="width:100%;box-sizing:border-box;"></textarea>` : ''}
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap;">
            <button class="btn btn-ghost" onclick="closeApprovalDetail()">Cancel</button>
            <button class="btn btn-success" onclick="confirmApprovalDecision('${id}','${action}')"><i data-lucide="check" style="width:14px;height:14px;"></i> Confirm ${action==='approve'?'Approval':'Rejection'}</button>
        </div>
    `;
    modal.classList.add('show');
    if (window.lucide) lucide.createIcons();
}
function confirmApprovalDecision(id, action){
    const a = getApprovalStatus(id);
    let aiType=null;
    try{ aiType = generateAIRecommendation(getBlockById(id)).type; }catch(e){}
    const isOverride = (action==='approve' && aiType!=='KEEP_CURRENT_PLAN') || (action==='reject');
    let reason='';
    if(isOverride){
        reason = (document.getElementById('overrideReason')||{}).value?.trim()||'';
        if(action==='reject' && !reason){ showToast('A reason is required to reject a block','error'); return; }
    }
    recordApproval(id, action==='approve'?'approved':'rejected', reason, isOverride);
    closeApprovalDetail();
    showToast('Block '+id+' '+(action==='approve'?'approved':'rejected')+(reason?' with override':''), action==='approve'?'success':'error');
    renderApprovalCenter();
}

// ---- Detail / view ----
function openApprovalDetail(id){
    const b = getBlockById(id);
    if(!b){ showToast('Block not found','error'); return; }
    const a = getApprovalStatus(id);
    let pri='—',sui='—',recTitle='—',recReason='',analysis;
    try{
        const rec = generateAIRecommendation(b);
        pri=rec.pri.score; sui=rec.sui.score; recTitle=rec.title; recReason=rec.reason; analysis=rec.analysis;
    }catch(e){}
    const conflictRows = analysis ? [
        ...analysis.trainConflicts.map(c=>'<div class="audit-item"><span class="audit-badge info">TRAIN</span><div>'+c.trainId+' · '+c.time+'</div></div>'),
        ...analysis.blockConflicts.map(c=>'<div class="audit-item"><span class="audit-badge info">OVERLAP</span><div>'+c.blockId+' · '+c.corridor+' · '+c.overlap+'</div></div>'),
        ...analysis.resourceConflicts.map(c=>'<div class="audit-item"><span class="audit-badge info">RESOURCE</span><div>'+c.message+'</div></div>')
    ].join('') : getConflictSummaryForBlock(b);
    const statusBadge = a.category==='approved' ? '<span class="badge low">✓ APPROVED</span>'
        : (a.category==='rejected' ? '<span class="badge critical">✕ REJECTED</span>' : '<span class="badge info">PENDING</span>');
    document.getElementById('approvalDetailTitle').textContent = 'Review Block ' + id;
    document.getElementById('approvalDetailBody').innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:14px;">${statusBadge} <span class="small" style="color:var(--muted);">${b.corridor} · ${b.date} · ${b.startTime}–${b.endTime}</span></div>
        <div class="cards" style="grid-template-columns:repeat(3,1fr);margin:12px 0;">
            <div class="card"><div class="card-label">AI Priority</div><div class="card-value">${pri}/100</div></div>
            <div class="card"><div class="card-label">Suitability</div><div class="card-value">${sui}%</div></div>
            <div class="card"><div class="card-label">Tasks</div><div class="card-value">${b.tasks.map(t=>t.id).join(', ')}</div></div>
        </div>
        <div class="alert alert-blue" style="margin:12px 0;"><span class="alert-icon"><i data-lucide="bot" style="width:14px;height:14px;vertical-align:middle;"></i></span><div><b>AI Recommendation: ${recTitle}</b><br><br>${recReason}</div></div>
        <h3 style="margin:14px 0 10px;">Detected Conflicts</h3>
        <div>${conflictRows || '<div class="note">No conflicts detected.</div>'}</div>
        <h3 style="margin:16px 0 10px;">Human Decision</h3>
        <div class="alert ${a.category==='approved'?'alert-green':a.category==='rejected'?'alert-red':'alert-blue'}" style="margin:0 0 6px;">
            <span class="alert-icon"><i data-lucide="${a.category==='approved'?'check':'x'}" style="width:14px;height:14px;vertical-align:middle;"></i></span>
            <div>${a.category==='pending' ? 'Not yet decided by a human reviewer.' : (a.category==='approved'?'Approved':'Rejected')+' by '+a.by+' at '+new Date(a.time).toLocaleString()+(a.reason?' — '+a.reason:'')}</div>
        </div>
        ${a.category==='pending' ? '' : (a.reason ? '<div class="audit-reason">'+a.reason+'</div>' : '')}
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap;">
            <button class="btn btn-secondary" onclick="closeApprovalDetail();openEditBlock('${id}')">✏️ Edit Block</button>
            <button class="btn btn-success" onclick="closeApprovalDetail();approveBlockApproval('${id}')"><i data-lucide="check" style="width:14px;height:14px;"></i> Approve</button>
            <button class="btn btn-danger" onclick="closeApprovalDetail();rejectBlockApproval('${id}')"><i data-lucide="x" style="width:14px;height:14px;"></i> Reject</button>
        </div>
    `;
    document.getElementById('approvalDetailModal').classList.add('show');
    if (window.lucide) lucide.createIcons();
}
function closeApprovalDetail(){
    document.getElementById('approvalDetailModal').classList.remove('show');
}

function manualChange() {

    document.getElementById('manualValidation').innerHTML = `

        <div class="alert alert-orange">

            <span class="alert-icon"><i data-lucide="alert-triangle" style="width:14px;height:14px;vertical-align:middle;"></i></span>

            <div>

                <b>Manual Change Submitted</b><br><br>

                Validation checks:<br>

                ✓ Train conflict — PASSED<br>

                ✓ Duration — PASSED<br>

                ✓ Location — PASSED<br>

                <i data-lucide="alert-triangle" style="width:14px;height:14px;vertical-align:middle;"></i> Resource availability — WARNING<br><br>

                <b>Recommendation:</b> Review crew allocation before final approval.

            </div>

        </div>

    `;

    addAudit('edit', 'Manual change submitted by planner');

    showToast('Manual change validated with warnings');

}

function addAudit(category, message, reason, blockId, isOverride) {
    state.auditRecords.unshift({category, message, reason:reason||'', blockId:blockId||'', isOverride:!!isOverride, by:(state.currentUser?.name||'Demo Planner'), time:Date.now()});
    if(state.auditRecords.length>50) state.auditRecords.pop();
    saveAuditToStorage();
    renderAuditLog();
}

function renderAuditLog() {
    const filter = document.getElementById('auditFilter')?.value || 'all';
    let list = state.auditRecords;
    if(filter==='approvals') list = state.auditRecords.filter(r=>r.category==='approval');
    else if(filter==='rejections') list = state.auditRecords.filter(r=>r.category==='rejection');
    else if(filter==='overrides') list = state.auditRecords.filter(r=>r.isOverride);
    else if(filter==='edits') list = state.auditRecords.filter(r=>r.category==='edit');

    const el = document.getElementById('auditTrail');
    if(!list.length){ el.innerHTML = '<div class="note" style="padding:16px 0;">No audit records'+(filter!=='all'?' for this filter':'')+'.</div>'; if(window.lucide)lucide.createIcons(); return; }
    el.innerHTML = list.map(r=>{
        let badgeCls='info', label=(r.category||'info').toUpperCase();
        if(r.category==='approval'){badgeCls='approval';label='APPROVAL';}
        else if(r.category==='rejection'){badgeCls='rejection';label='REJECTION';}
        else if(r.category==='edit'){badgeCls='edit';label='EDIT';}
        const tag = r.isOverride ? '<span class="audit-badge override">OVERRIDE</span> ' : '';
        return `
            <div class="audit-item">
                <div>
                    <span class="audit-badge ${badgeCls}">${label}</span> ${tag}
                    <span class="audit-time">${new Date(r.time).toLocaleTimeString()}</span>
                    <span class="small" style="color:var(--muted);">· ${new Date(r.time).toLocaleDateString()}</span>
                    <div style="font-size:14px;margin-top:4px;">${r.message}</div>
                    ${r.reason ? '<div class="audit-reason">Reason: '+r.reason+'</div>' : ''}
                </div>
            </div>`;
    }).join('');
    if (window.lucide) lucide.createIcons();
}

function clearAudit() {
    state.auditRecords = [];
    saveAuditToStorage();
    renderAuditLog();
    showToast('Audit log cleared');
}

// ================= AI ASSISTANT =================

function renderSuggestedQuestions() {

    const questions = [

        'Why was B-042 selected?',

        'Show critical tasks for C1',

        'What if traction crew is unavailable?',

        'Explain task bundling logic',

        'Compare manual vs AI plan'

    ];

    document.getElementById('suggestedQuestions').innerHTML = questions.map(q => `

        <button class="btn btn-secondary" style="width:100%;margin-bottom:10px;text-align:left;" onclick="quickAsk('${q}')">${q}</button>

    `).join('');

}

function quickAsk(q) {

    document.getElementById('chatInput').value = q;

    askAI();

}

function askAI() {

    const input = document.getElementById('chatInput');

    const question = input.value.trim();

    if (!question) return;

    const box = document.getElementById('chatBox');

    box.innerHTML += `<div class="message user-msg">${question}</div>`;

    const q = question.toLowerCase();

    let answer;

    if (q.includes('b-042') || q.includes('why was')) {

        answer = "B-042 was selected because T102, S143 and O221 are all located within the C1 planning area. The optimizer found a 12:00–14:00 window with zero train conflicts, sufficient duration for all three tasks, and available crew. This bundling improves block utilization from ~50% to 92%.";

    } else if (q.includes('critical')) {

        answer = "The main critical task is T102 (Track Defect) in Corridor C1 with AI priority 92/100. It's overdue by 3 days with high safety criticality. Other critical tasks include T119 (Track Inspection, 81) and O310 (OHE Preventive, 76).";

    } else if (q.includes('unavailable') || q.includes('what if')) {

        answer = "If a block becomes unavailable, the optimizer: (1) removes that window, (2) protects critical tasks by finding next-best windows, (3) attempts to reschedule compatible tasks together, (4) reports any unavoidable delays. The what-if simulator lets you test specific scenarios.";

    } else if (q.includes('bundled') || q.includes('combine') || q.includes('bundling')) {

        answer = "The AI bundles tasks when they: share the same corridor, have compatible locations, fit within available duration, don't have resource conflicts, and satisfy safety rules. Current bundled blocks: B-042 (3 tasks), B-041 (2), B-045 (2), B-047 (2), B-049 (2). Tasks stay separate when bundling provides little benefit or requires dedicated resources.";

    } else if (q.includes('compare') || q.includes('manual')) {

        answer = "AI plan vs manual baseline: Blocks reduced from 9 to 6 (-33%), tasks planned increased from 14 to 18 (+29%), utilization improved from 61% to 87% (+26%), conflicts resolved from 4 to 0, bundled tasks increased from 2 to 7.";

    } else if (q.includes('summary') || q.includes('report')) {

        answer = "Weekly Summary (Aug 24-30): 18 tasks across 4 corridors, 6 optimized blocks (4 combined), 87% average utilization, 0 unresolved conflicts, 94% asset availability. Critical attention needed: T102 (overdue), Traction Team 3 capacity.";

    } else if (q.includes('risk')) {

        answer = "This week's risks: (1) T102 overdue — safety critical, (2) Traction Team 3 understaffed for O221, (3) C2 goods traffic peak on Wednesday may affect B-045 execution, (4) Equipment: OHE Maintenance Unit reserved — backup available.";

    } else if (q.includes('safety') || q.includes('constraint')) {

        answer = "Safety constraints are HARD constraints that cannot be overridden: minimum buffer between train and maintenance, electrical isolation rules, signaling interlock requirements, crew certification requirements, and weather thresholds. The optimizer treats these as inviolable.";

    } else {

        answer = "I can help with: task priorities, block recommendations, bundling logic, conflict resolution, what-if scenarios, resource planning, and safety constraints. Try asking about specific tasks, blocks, or corridors.";

    }

    setTimeout(() => {

        box.innerHTML += `<div class="message bot">${answer}</div>`;

        box.scrollTop = box.scrollHeight;

    }, 500);

    input.value = '';

    box.scrollTop = box.scrollHeight;

}

// ================= ANALYTICS =================

function initCharts() {

    const utilCtx = document.getElementById('utilizationChart');

    if (utilCtx) {

        state.charts.utilization = new Chart(utilCtx, {

            type: 'line',

            data: {

                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

                datasets: [

                    { label: 'AI Plan', data: [87, 85, 92, 88, 90, 82, 78], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', tension: 0.4, fill: true },

                    { label: 'Manual Baseline', data: [65, 62, 68, 64, 70, 58, 55], borderColor: '#94a3b8', borderDash: [5,5], tension: 0.4 }

                ]

            },

            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }

        });

    }

    const priorityCtx = document.getElementById('priorityChart');

    if (priorityCtx) {

        state.charts.priority = new Chart(priorityCtx, {

            type: 'doughnut',

            data: {

                labels: ['Critical', 'High', 'Medium', 'Low'],

                datasets: [{ data: [3, 5, 4, 3], backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'] }]

            },

            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }

        });

    }

}

function refreshCharts() {

    const compCtx = document.getElementById('comparisonChart');

    if (compCtx) {

        if (!state.charts.comparison) { state.charts.comparison = new Chart(compCtx, {

            type: 'bar',

            data: {

                labels: ['Blocks', 'Tasks Planned', 'Utilization %', 'Bundled', 'Conflicts'],

                datasets: [

                    { label: 'Manual', data: [9, 14, 61, 2, 4], backgroundColor: '#94a3b8' },

                    { label: 'AI Plan', data: [6, 18, 87, 7, 0], backgroundColor: '#3b82f6' }

                ]

            },

            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }

        }); } else { state.charts.comparison.update(); }

    }

    const weeklyCtx = document.getElementById('weeklyTrendChart');

    if (weeklyCtx) {

        if (!state.charts.weekly) { state.charts.weekly = new Chart(weeklyCtx, {

            type: 'line',

            data: {

                labels: ['Week 30', 'Week 31', 'Week 32', 'Week 33', 'Week 34', 'Week 35'],

                datasets: [

                    { label: 'Completion Rate', data: [82, 85, 87, 89, 90, 91], borderColor: '#10b981', tension: 0.4 },

                    { label: 'Utilization', data: [75, 78, 80, 83, 85, 87], borderColor: '#3b82f6', tension: 0.4 }

                ]

            },

            options: { responsive: true, maintainAspectRatio: false }

        }); } else { state.charts.weekly.update(); }

    }

    const deptCtx = document.getElementById('deptChart');

    if (deptCtx) {

        if (!state.charts.dept) { state.charts.dept = new Chart(deptCtx, {

            type: 'pie',

            data: {

                labels: ['Engineering', 'S&T', 'Traction'],

                datasets: [{ data: [45, 35, 20], backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b'] }]

            },

            options: { responsive: true, maintainAspectRatio: false }

        }); } else { state.charts.dept.update(); }

    }

    const monthlyCtx = document.getElementById('monthlyKpiChart');

    if (monthlyCtx) {

        if (!state.charts.monthly) { state.charts.monthly = new Chart(monthlyCtx, {

            type: 'bar',

            data: {

                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],

                datasets: [

                    { label: 'Planned Blocks', data: [4, 5, 6, 3], backgroundColor: '#3b82f6' },

                    { label: 'Estimated Utilization', data: [85, 88, 90, 82], backgroundColor: '#10b981' }

                ]

            },

            options: { responsive: true, maintainAspectRatio: false }

        }); } else { state.charts.monthly.update(); }

    }

}

function renderMetricsTable() {

    const metrics = [

        ['Block Utilization', '61%', '87%', '+26%', 'up'],

        ['Tasks per Block', '1.6', '3.0', '+87%', 'up'],

        ['Planning Time', '4 hours', '45 min', '-81%', 'up'],

        ['Conflict Rate', '28%', '0%', '-100%', 'up'],

        ['Overdue Tasks', '20', '12', '-40%', 'up'],

        ['Asset Availability', '89%', '94%', '+5%', 'up'],

        ['Emergency Blocks', '3/week', '1/week', '-67%', 'up'],

        ['Crew Overtime', '12 hrs', '4 hrs', '-67%', 'up']

    ];

    document.getElementById('metricsTable').innerHTML = metrics.map(m => `

        <tr>

            <td><b>${m[0]}</b></td>

            <td>${m[1]}</td>

            <td class="green"><b>${m[2]}</b></td>

            <td class="${m[4] === 'up' ? 'green' : 'red'}"><b>${m[3]}</b></td>

            <td><span class="badge ${m[4] === 'up' ? 'low' : 'critical'}">${m[4] === 'up' ? '↑ IMPROVED' : '↓ DECLINED'}</span></td>

        </tr>

    `).join('');

}

function renderImprovementMetrics() {

    document.getElementById('improvementMetrics').innerHTML = `

        ${[

            { label: 'Block Utilization', value: 87, color: 'var(--blue)' },

            { label: 'Critical Task Coverage', value: 94, color: 'var(--green)' },

            { label: 'Multi-Department Coordination', value: 76, color: 'var(--purple)' },

            { label: 'Resource Efficiency', value: 82, color: 'var(--orange)' }

        ].map(m => `

            <div style="margin-bottom:18px;">

                <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:8px;">

                    <span>${m.label}</span>

                    <span style="color:${m.color}">${m.value}%</span>

                </div>

                <div class="progress">

                    <div class="progress-bar" style="width:${m.value}%;background:${m.color}"></div>

                </div>

            </div>

        `).join('')}

    `;

}

// ================= HEATMAP =================

const heatmapColors = ['#dcfce7','#86efac','#22c55e','#15803d'];

const heatmapLevelNames = ['Low','Medium','High','Very High'];

// Deterministic per-corridor 24-hour traffic profiles (index = hour 0..23)

// Values: 1=Low, 2=Medium, 3=High, 4=Very High

const heatmapProfiles = {

    C1: [1,1,1,1,1,1,2,2,4,4,3,2,2,2,2,3,3,4,4,3,2,2,1,1],

    C2: [1,1,1,1,1,2,2,3,4,3,2,2,2,2,3,3,4,4,3,2,2,1,1,1],

    C3: [1,1,1,1,1,1,1,2,3,3,4,3,3,2,2,3,3,3,2,2,1,1,1,1],

    C4: [1,1,1,1,1,2,3,4,3,2,2,2,2,2,2,3,3,4,4,3,2,1,1,1]

};

function getHeatmapLevel(corridor, hour) { return (heatmapProfiles[corridor] || [])[hour] || 1; }

function renderHeatmap() {

    const container = document.getElementById('heatmapContainer');

    if (!container) return;

    const filter = (document.getElementById('heatmapCorridor') || {}).value || 'all';

    const corridors = filter === 'all' ? ['C1','C2','C3','C4'] : [filter];

    const hours = Array.from({length:24}, (_,i) => i);

    let html = '<div style="overflow-x:auto;"><div class="heatmap-table">';

    // Hour header row

    html += '<div class="heatmap-corridor" style="font-size:11px;">Hour →</div>';

    hours.forEach(h => html += `<div class="heatmap-label">${h}</div>`);

    // Corridor rows

    corridors.forEach(c => {

        html += `<div class="heatmap-corridor">${c}</div>`;

        hours.forEach(h => {

            const level = getHeatmapLevel(c, h);

            const t = `Corridor ${c}\n${String(h).padStart(2,'0')}:00\nTraffic: ${heatmapLevelNames[level-1]}`;

            html += `<div class="heatmap-cell" data-corridor="${c}" data-hour="${h}" data-level="${level}" style="background:${heatmapColors[level-1]};" title="${t}"></div>`;

        });

    });

    html += '</div></div>';

    container.innerHTML = html;

    initHeatmapTooltip();

}

function initHeatmapTooltip() {

    const cont = document.getElementById('heatmapContainer');

    const tip  = document.getElementById('heatmapTooltip');

    if (!cont || !tip) return;

    cont.addEventListener('mouseover', e => {

        const cell = e.target.closest('.heatmap-cell');

        if (!cell) { tip.style.display = 'none'; return; }

        const c = cell.getAttribute('data-corridor');

        const h = parseInt(cell.getAttribute('data-hour'), 10);

        const l = heatmapLevelNames[+cell.getAttribute('data-level') - 1];

        tip.innerHTML = `<b>Corridor ${c}</b><br>${String(h).padStart(2,'0')}:00<br>Traffic: ${l}`;

        tip.style.display = 'block';

    });

    cont.addEventListener('mousemove', e => {

        tip.style.left = (e.clientX + 14) + 'px';

        tip.style.top  = (e.clientY + 14) + 'px';

    });

    cont.addEventListener('mouseleave', () => { tip.style.display = 'none'; });

}

// ================= BLOCK MODAL =================
function openBlock(id) {
    const b = getBlockById(id) || blockData[id];
    if (!b) { showToast('Block not found'); return; }
    const normalized = normalizeBlock({...b, id});
    document.getElementById('blockTitle').textContent = id + ' · Block Assignment';
    const taskHTML = normalized.tasks.map(t => `
        <div class="task-list-item">
            <div>
                <div class="task-name">${t.id} · ${t.name}</div>
                <div class="task-sub">${t.department} · ${t.duration}</div>
            </div>
            <span class="badge info">ASSIGNED</span>
        </div>
    `).join('');
    const typeBadge = normalized.type === 'COMBINED'
        ? '<span class="badge combined">🧩 COMBINED</span>'
        : '<span class="badge single">SINGLE TASK</span>';
    const statusBadge = getBlockStatusBadge(normalized.status||"Clear");
    document.getElementById('blockDetails').innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:16px;">${typeBadge} ${statusBadge}</div>
        <div class="alert alert-blue">
            <span class="alert-icon"><i data-lucide="bot" style="width:14px;height:14px;vertical-align:middle;"></i></span>
            <div><b>Why did AI select this block?</b><br><br>${normalized.reason}</div>
        </div>
        <div class="cards" style="grid-template-columns:repeat(3,1fr);margin:16px 0;">
            <div class="card" style="overflow:visible;"><div class="card-label">Corridor <span class="info-tip" style="color:var(--muted);"><i data-lucide="help-circle" style="width:12px;height:12px;vertical-align:middle;"></i><span class="tip-text">Rail segment this block occupies. Tasks must share the same corridor to be bundled.</span></span></div><div class="card-value">${normalized.corridor}</div><div class="small">${normalized.from || ""} → ${normalized.to || ""} · Track ${normalized.track}</div></div>
            <div class="card" style="overflow:visible;"><div class="card-label">Window <span class="info-tip" style="color:var(--muted);"><i data-lucide="help-circle" style="width:12px;height:12px;vertical-align:middle;"></i><span class="tip-text">Chosen time window. Open this block and use 'Find a better planning window' to explore alternatives.</span></span></div><div class="card-value" style="font-size:16px;">${normalized.startTime}–${normalized.endTime}</div><div class="small">${normalized.date} · ${normalized.duration}</div></div>
            <div class="card" style="overflow:visible;"><div class="card-label">Utilization <span class="info-tip" style="color:var(--muted);"><i data-lucide="help-circle" style="width:12px;height:12px;vertical-align:middle;"></i><span class="tip-text">% of available block hours actually used by scheduled tasks. Higher is better.</span></span></div><div class="card-value">${normalized.utilization}</div><div class="small">Priority ${normalized.priority}</div></div>
        </div>
        <h3 style="margin:16px 0 12px;">Assigned Tasks</h3>
        <div class="task-list">${taskHTML}</div>
        <table style="margin-top:16px;">
            <tr><td><b>Block ID</b></td><td>${id}</td></tr>
            <tr><td><b>Date</b></td><td>${normalized.date}</td></tr>
            <tr><td><b>Corridor / Section</b></td><td>${normalized.corridor} · ${normalized.from} → ${normalized.to}</td></tr>
            <tr><td><b>Track</b></td><td>${normalized.track}</td></tr>
            <tr><td><b>Time Window</b></td><td>${normalized.startTime}–${normalized.endTime}</td></tr>
            <tr><td><b>Available Duration</b></td><td>${normalized.duration}</td></tr>
            <tr><td><b>Number of Tasks</b></td><td>${normalized.tasks.length}</td></tr>
            <tr><td><b>Resources</b></td><td>Crew ${normalized.requiredCrew}/${normalized.availableCrew} · Equip ${normalized.requiredEquip} (${normalized.equipmentStatus})</td></tr>
            <tr><td><b>Status</b></td><td>${statusBadge} ${normalized.lastEdited?'<span class="small" style="color:var(--muted);">· Edited '+new Date(normalized.lastEdited).toLocaleString()+'</span>':''}</td></tr>
        </table>
        <div id="aiBlockAnalysis"></div>
        <br>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn btn-secondary" onclick="openWhatIfFromBlock('${id}')" style="border-color:var(--blue);color:var(--blue);"><i data-lucide="git-branch" style="width:12px;height:12px;"></i> Run What-If Simulation</button>
            <button class="btn btn-primary" onclick="openEditBlock('${id}')">✏️ Edit Block</button>
            <button class="btn btn-secondary" onclick="closeBlockModal();go('approval')">Review in Approval Center</button>
            <button class="btn btn-ghost" onclick="quickAsk('Explain ${id} selection')">Ask AI</button>
        </div>
    `;
    document.getElementById('blockModal').classList.add('show');
    // === AI Intelligence Injection Prompt2 ===
    (function(){
        const aiDiv = document.getElementById('aiBlockAnalysis');
        if(aiDiv){
            const pri = getBlockPriorityScore(normalized);
            const sui = calculateSuitabilityScore(normalized);
            const rec = generateAIRecommendation(normalized);
            const recStrength = calculateRecommendationStrength(normalized);
            const catP = getPriorityCategory(pri.score);
            const catS = getSuitabilityCategory(sui.score);
            aiDiv.innerHTML = `
                <div class="ai-analysis-panel">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                        <h3 style="font-size:14px;">AI-Assisted Recommendation <span style="font-size:12px;background:var(--navy);color:white;padding:3px 8px;border-radius:20px;">Prototype</span></h3>
                        <span class="note" style="font-size:13px;">Demo / Synthetic Data - AI-Assisted Prototype Analysis</span>
                    </div>
                    <div class="ai-score-wrap">
                        <div class="ai-score-card">
                            <div class="ai-score-label">AI Priority Score <span class="info-tip" style="color:var(--muted);"><i data-lucide="help-circle" style="width:12px;height:12px;vertical-align:middle;"></i><span class="tip-text">AI Priority (0-100) weights Safety, Asset Importance, Urgency, Delay Impact and Operational Value (30/25/20/15/10).</span></span></div>
                            <div class="ai-score-value">${pri.score} / 100</div>
                            <div class="ai-score-cat badge ${catP.cls}">${catP.icon} ${catP.label}</div>
                        </div>
                        <div class="ai-score-card">
                            <div class="ai-score-label">AI Suitability Score <span class="info-tip" style="color:var(--muted);"><i data-lucide="help-circle" style="width:12px;height:12px;vertical-align:middle;"></i><span class="tip-text">AI Suitability (0-100) rates how well the proposed window fits, considering train traffic, corridor availability, resources, and conflict risk.</span></span></div>
                            <div class="ai-score-value">${sui.score} / 100</div>
                            <div class="ai-score-cat badge ${catS.cls}">${catS.icon} ${catS.label}</div>
                        </div>
                        <div class="ai-score-card" style="flex:1.2;">
                            <div class="ai-score-label">Recommendation</div>
                            <div style="margin:8px 0;"><span class="ai-reco-badge ${rec.badgeCls}">${rec.title.toUpperCase()}</span></div>
                            <div style="font-size:13px;color:var(--muted);">Prototype Analysis Confidence: <b>${recStrength.strength}%</b></div>
                        </div>
                    </div>
                    <div class="ai-reco-box">
                        <div style="font-size:13px;font-weight:800;letter-spacing:0.5px;color:var(--muted);">RECOMMENDATION</div>
                        <div style="font-size:15px;font-weight:800;margin:6px 0;">${rec.title}</div>
                        <div style="font-size:13px;font-weight:700;color:var(--muted);">Prototype Analysis Confidence: ${recStrength.strength}% (Recommendation Strength)</div>
                        <div class="progress" style="margin:8px 0;"><div class="progress-bar" style="width:${recStrength.strength}%;background:linear-gradient(90deg,var(--blue),var(--purple));"></div></div>
                        <div style="font-size:12px;color:var(--text2);margin-top:8px;"><b>Reason:</b> ${rec.reason}</div>
                        <button class="btn btn-secondary btn-sm" style="margin-top:10px;" onclick="const el=document.getElementById('aiExplain_${id}'); el.classList.toggle('open'); this.textContent = el.classList.contains('open') ? 'Hide explanation' : 'Why did AI recommend this?';">Why did AI recommend this?</button>
                        <div id="aiExplain_${id}" class="ai-explain">
                            <div style="font-size:13px;font-weight:700;margin-bottom:10px;">AI Decision Factors</div>
                            <div id="aiFactors_${id}"></div>
                            <div style="margin-top:12px;font-size:12px;line-height:1.7;color:var(--text2);" id="aiExplainText_${id}"></div>
                        </div>
                    </div>
                    <div style="font-size:13px;color:var(--muted);text-align:center;">AI Analysis - Prototype Recommendation - Not operationally authorized</div>
                </div>
            `;
            const factors = [
                {label:"Maintenance Priority", val: sui.factors.priorityAlignment},
                {label:"Corridor Availability", val: sui.factors.corridorAvail},
                {label:"Resource Availability", val: sui.factors.resourceAvail},
                {label:"Traffic Conditions", val: sui.factors.traffic},
                {label:"Conflict Risk", val: sui.factors.conflictRisk},
                {label:"Task Compatibility", val: sui.factors.taskCompat}
            ];
            const facDiv = document.getElementById('aiFactors_'+id);
            if(facDiv){
                facDiv.innerHTML = factors.map(f=>`
                    <div style="margin-bottom:10px;">
                        <div class="ai-factor-row" style="padding:0;border:none;"><span style="font-size:12px;font-weight:600;">${f.label}</span><span style="font-weight:700;">${f.val}%</span></div>
                        <div class="ai-factor-bar"><div class="ai-factor-bar-inner" style="width:${f.val}%;background:${f.val>=70?'var(--green)':f.val>=50?'var(--orange)':'var(--red)'};"></div></div>
                    </div>
                `).join("");
            }
            const explain = generateAIExplanation(normalized);
            const expDiv = document.getElementById('aiExplainText_'+id);
            if(expDiv) expDiv.innerHTML = `<b>Why this recommendation was generated:</b><br><br>${explain.text}<br><br><div style="font-size:13px;color:var(--muted);">Priority factors: Safety ${pri.factors.safety}%, Asset ${pri.factors.asset}%, Urgency ${pri.factors.urgency}%, Delay ${pri.factors.delayImpact}%, Operational ${pri.factors.operational}% - Weighted 30/25/20/15/10</div>`;
        }
    })();

}

function closeBlockModal() {

    document.getElementById('blockModal').classList.remove('show');

}

// ================= NOTIFICATIONS =================

function toggleNotifications() {

    const center = document.getElementById('notificationCenter');

    center.classList.toggle('active');

    if (center.classList.contains('active')) {

        renderNotifications();

    }

}

function addNotification(text) {

    state.notifications.unshift({ text, time: new Date(), read: false });

    updateNotifCount();

}

function renderNotifications() {

    const list = document.getElementById('notificationList');

    if (state.notifications.length === 0) {

        list.innerHTML = '<p class="note" style="padding:20px;text-align:center;">No notifications</p>';

        return;

    }

    list.innerHTML = state.notifications.map(n => `

        <div class="notification-item ${n.read ? '' : 'unread'}">

            <div style="font-size:13px;font-weight:500;">${n.text}</div>

            <div class="notification-time">${n.time.toLocaleTimeString()}</div>

        </div>

    `).join('');

}

function updateNotifCount() {

    const unread = state.notifications.filter(n => !n.read).length;

    document.getElementById('notifCount').textContent = unread;

    document.getElementById('notifCount').style.display = unread > 0 ? 'inline' : 'none';

}

// ================= IMPORT/EXPORT =================

function showImportModal() {

    document.getElementById('importModal').classList.add('show');

}

function importData(source) {

    document.getElementById('importModal').classList.remove('show');

    diLoadBundle((typeof diDemoBundle==='function')?diDemoBundle():DEMO_SNAPSHOT, source.toUpperCase() + ' (Synthetic Demo)');

    openDataIntegration();

}

function exportData() {

    showToast('Exporting task data...', 'info');

    setTimeout(() => showToast('Export complete!', 'success'), 1000);

}

function showExportModal() {

    document.getElementById('exportModal').classList.add('show');

}

function exportPlan(format) {

    showToast(`Exporting as ${format.toUpperCase()}...`, 'info');

    setTimeout(() => {

        document.getElementById('exportModal').classList.remove('show');

        showToast(`Plan exported as ${format.toUpperCase()}!`, 'success');

    }, 1000);

}

// ================= PRESENTATION =================

function startPresentation() {

    state.presentationSlide = 0;

    document.getElementById('presentationMode').classList.add('active');

    renderSlide();

}

function renderSlide() {

    const slide = presentationSlides[state.presentationSlide];

    document.getElementById('presentationSlide').innerHTML = `

        <div style="font-size:80px;margin-bottom:30px;">${slide.icon}</div>

        <h1>${slide.title}</h1>

        <p>${slide.subtitle}</p>

    `;

    if (window.lucide) lucide.createIcons();

}

function nextSlide() {

    if (state.presentationSlide < presentationSlides.length - 1) {

        state.presentationSlide++;

        renderSlide();

    }

}

function prevSlide() {

    if (state.presentationSlide > 0) {

        state.presentationSlide--;

        renderSlide();

    }

}

function exitPresentation() {

    document.getElementById('presentationMode').classList.remove('active');

}

// ================= ONBOARDING =================

function nextOnboarding() {

    document.querySelector(`.onboarding-step[data-step="${state.onboardingStep}"]`).classList.remove('active');

    state.onboardingStep++;

    const next = document.querySelector(`.onboarding-step[data-step="${state.onboardingStep}"]`);

    if (next) {

        next.classList.add('active');

    } else {

        finishOnboarding();

    }

}

function finishOnboarding() {

    document.getElementById('onboarding').classList.remove('active');

    state.onboardingComplete = true;

    try{ localStorage.setItem('aiabps_onboardingCompleted','1'); }catch(e){}

}

function restartOnboarding() {
    state.onboardingStep = 1;
    document.querySelectorAll('.onboarding-step').forEach(s=>s.classList.remove('active'));
    const first = document.querySelector('.onboarding-step[data-step="1"]');
    if(first) first.classList.add('active');
    document.getElementById('onboarding').classList.add('active');
}

// ================= SETTINGS =================

function toggleAutoOpt() {

    state.autoOptimize = !state.autoOptimize;

    document.getElementById('autoOptToggle').classList.toggle('active', state.autoOptimize);

    showToast(state.autoOptimize ? 'Auto-optimization enabled' : 'Auto-optimization disabled');

}

function saveProfile() {

    const name = document.getElementById('displayName').value;

    document.getElementById('userName').textContent = name;

    document.getElementById('profileName').textContent = name;

    showToast('Profile saved successfully!', 'success');

}

// ================= KEYBOARD SHORTCUTS =================

function handleKeyboard(e) {

    if (e.key === 'd' || e.key === 'D') toggleTheme();

    if (e.key === 'n' || e.key === 'N') toggleNotifications();

    if (e.key === 'r' || e.key === 'R') runAI();

    if (e.key === '/') { e.preventDefault(); document.getElementById('taskSearch')?.focus(); }

    if (e.key === 'Escape') {

        document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));

        document.getElementById('notificationCenter').classList.remove('active');

    }

    if (e.key === '?') document.getElementById('shortcutsHelp').classList.add('active');

    if (e.key >= '1' && e.key <= '9') {

        const screens = ['dashboard', 'tasks', 'aiPlanning', 'schedule', 'corridor', 'resources', 'analytics', 'assistant', 'approval'];

        go(screens[parseInt(e.key) - 1]);

    }

}

// ================= CALENDAR =================

function renderCalendar() {

    // Simple month view

    const daysInMonth = 30;

    let html = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;">';

    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => {

        html += `<div style="text-align:center;font-size:13px;font-weight:700;color:var(--muted);padding:8px;">${d}</div>`;

    });

    for (let i = 1; i <= daysInMonth; i++) {

        const hasBlock = [5, 12, 15, 19, 22, 26, 28].includes(i);

        html += `

            <div style="aspect-ratio:1;border:1px solid var(--border);border-radius:8px;padding:8px;font-size:13px;${hasBlock ? 'background:linear-gradient(135deg,rgba(59,130,246,0.1),rgba(139,92,246,0.1));' : ''}">

                <div style="font-weight:600;">${i}</div>

                ${hasBlock ? '<div style="font-size:12px;color:var(--blue);margin-top:4px;">2 blocks</div>' : ''}

            </div>

        `;

    }

    html += '</div>';

    const calEl = document.getElementById('calendarView');

    if (calEl) calEl.innerHTML = html;

}

// ================= INIT =================

document.addEventListener('DOMContentLoaded', () => {

    renderCalendar();

    // Check if we should show onboarding (skip in sandbox, can be triggered manually)

    // Show login screen by default - init() is called after successful login

});


function renderDashboardAiRecs(){
    const list=document.getElementById('dashboardAiRecsList');
    if(!list) return;
    const recs = state.blocks.map(b=>{
        const rec=generateAIRecommendation(b);
        const pri=getBlockPriorityScore(b);
        const cat=getPriorityCategory(pri.score);
        return {b, rec, pri, cat};
    }).sort((a,b)=> b.pri.score - a.pri.score).slice(0,3);
    list.innerHTML = recs.map(r=>`
        <div style="padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--card);margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                <b style="font-size:12px;">${r.b.id} - ${r.b.corridor} ${r.b.startTime}-${r.b.endTime}</b>
                <span class="badge ${r.cat.cls}" style="font-size:12px;">${r.cat.icon} ${r.cat.label}</span>
            </div>
            <div style="font-size:13px;color:var(--muted);margin-top:4px;">${r.rec.title} - ${r.rec.reason.substring(0,90)}...</div>
            <button class="btn btn-secondary btn-sm" style="margin-top:8px;width:100%;justify-content:center;" onclick="openBlock('${r.b.id}')">View Details</button>
        </div>
    `).join("") || '<div class="note">No blocks.</div>';
    if(window.lucide) lucide.createIcons();
}
const _origRefreshDashboardAI2 = refreshDashboardAI;
refreshDashboardAI = function(){
    _origRefreshDashboardAI2();
    renderDashboardAiRecs();
};

function getCurrentScreenId(){
    const active = document.querySelector('.screen.active');
    return active ? active.id : 'dashboard';
}
function getSuggestionsForScreen(screen){
    const map={
        dashboard: ["What requires attention?","Show active conflicts","Explain AI recommendations"],
        tasks: ["Check block conflicts","Explain this block","Find a better planning window"],
        schedule: ["Check block conflicts","Explain this block","Find a better planning window"],
        monthly: ["Check block conflicts","Explain monthly plan","Find a better window"],
        gantt: ["Check block conflicts","Explain this block","Find a better window"],
        conflicts: ["Explain this conflict","Show affected blocks","Suggest possible resolution"],
        whatif: ["Explain simulation impact","Compare scenarios","Suggest alternative"],
        analytics: ["Explain utilization trends","Explain priority distribution","Identify operational concerns"],
        heatmap: ["Explain traffic intensity","Show corridor risks","Suggest planning window"],
        approval: ["Explain pending approvals","Show recent decisions","Check review status","How does human approval work?"],
        settings: ["Explain system settings","Show current config"]
    };
    return map[screen] || ["What requires attention?","Show active conflicts","Explain AI recommendations"];
}
function updateFloatingSuggestions(){
    const screen=getCurrentScreenId();
    const sug=getSuggestionsForScreen(screen);
    const cont=document.getElementById('aiFloatingSuggestions');
    if(!cont) return;
    cont.innerHTML = sug.map(s=>`<button onclick="sendFloatingAI('${s.replace("'", "\'")}')" style="text-align:left;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--card);font-size:var(--text-sm);cursor:pointer;display:flex;align-items:center;gap:8px;min-height:40px;color:var(--text);"><i data-lucide="sparkles" style="width:16px;height:16px;color:var(--blue);flex:0 0 auto;"></i> ${s}</button>`).join("");
    if(window.lucide) lucide.createIcons();
}
const _origShowScreen2 = showScreen;
showScreen = function(id, button){
    _origShowScreen2(id, button);
    try{ updateFloatingSuggestions(); }catch(e){}
    if(window.lucide) lucide.createIcons();
};


// ================= WHAT-IF SIMULATION PROMPT 3 =================
let whatIfOriginal = null;
let whatIfModified = null;
let whatIfLastResult = null;
let whatIfCandidates = [];

function createSimulationCopy(block){
    return JSON.parse(JSON.stringify(block));
}
function getWhatIfBlockOptions(){
    const sel=document.getElementById('whatifBlockSelect');
    if(!sel) return;
    sel.innerHTML = state.blocks.map(b=>`<option value="${b.id}">${b.id} — ${b.corridor} — ${b.date} — ${b.startTime}–${b.endTime}</option>`).join("");
    if(window.lucide) lucide.createIcons();
}
function ensureWhatIfReady(){
    const sel=document.getElementById('whatifBlockSelect');
    if(!sel) return;
    if(!sel.options.length) getWhatIfBlockOptions();
    if(!whatIfOriginal || !sel.value){
        if(sel.options.length){
            sel.value=sel.options[0].value;
            loadWhatIfOriginal();
        }
    } else if(!whatIfOriginal && state.blocks.length){
        loadWhatIfOriginal();
    }
}
function onWhatIfBlockChange(){
    loadWhatIfOriginal();
}
function loadWhatIfOriginal(){
    const sel=document.getElementById('whatifBlockSelect');
    if(!sel) return;
    if(!sel.options.length) getWhatIfBlockOptions();
    if(!sel.value && sel.options.length) sel.value=sel.options[0].value;
    const id=sel.value;
    const block=getBlockById(id) || (state.blocks.length ? state.blocks[0] : null);
    if(!block || !id) return;
    whatIfOriginal = createSimulationCopy(block);
    whatIfModified = createSimulationCopy(block);
    // Render original details
    renderWhatIfOriginal();
    // Populate modified inputs
    populateWhatIfModified();
    // Hide results until run
    document.getElementById('whatifResultsPanel').style.display='none';
    document.getElementById('whatifComparisonPanel').style.display='none';
    document.getElementById('whatifReoptPanel').style.display='none';
    document.getElementById('whatifReoptResults').style.display='none';
    document.getElementById('whatifReoptResults').innerHTML='';
    document.getElementById('whatifAlternatives').innerHTML='';
    document.getElementById('whatifReoptActions').style.display='none';
    whatIfLastResult=null;
    whatIfCandidates=[];
    document.getElementById('whatifValidation').style.display='none';
    if(window.lucide) lucide.createIcons();
}
function renderWhatIfOriginal(){
    const div=document.getElementById('whatifOriginalDetails');
    if(!div || !whatIfOriginal) return;
    const b=whatIfOriginal;
    const pri=getBlockPriorityScore(b);
    const sui=calculateSuitabilityScore(b);
    const catP=getPriorityCategory(pri.score);
    const conflicts=analyzeBlockConflicts(b);
    const trainImpact=calculateTrainImpact(b);
    div.innerHTML = `
        <div style="display:grid;gap:8px;font-size:12px;">
            <div><b>Block ID:</b> ${b.id}</div>
            <div><b>Corridor:</b> ${b.corridor} | <b>Track:</b> ${b.track} | <b>Date:</b> ${b.date}</div>
            <div><b>Time:</b> ${b.startTime} - ${b.endTime} (${b.duration})</div>
            <div><b>Priority:</b> ${b.priority} | <b>AI Priority Score:</b> ${pri.score}/100 <span class="badge ${catP.cls}">${catP.icon} ${catP.label}</span></div>
            <div><b>Resources:</b> Crew ${b.requiredCrew}/${b.availableCrew} | Equip ${b.requiredEquip} (${b.equipmentStatus})</div>
            <div><b>Tasks:</b> ${b.tasks.map(t=>t.id).join(', ')}</div>
            <div><b>Current Conflicts:</b> ${conflicts.all.length} | <b>Train Impact:</b> ${trainImpact.label}</div>
            <div><b>AI Suitability Score:</b> ${sui.score}/100 <span class="badge ${getSuitabilityCategory(sui.score).cls}">${getSuitabilityCategory(sui.score).icon} ${getSuitabilityCategory(sui.score).label}</span></div>
            <div><b>Recommendation:</b> ${generateAIRecommendation(b).title}</div>
        </div>
    `;
}
function populateWhatIfModified(){
    if(!whatIfModified) return;
    const b=whatIfModified;
    document.getElementById('whatifDate').value=b.date;
    document.getElementById('whatifCorridor').value=b.corridor;
    document.getElementById('whatifTrack').value=b.track;
    document.getElementById('whatifPriority').value=b.priority;
    document.getElementById('whatifStart').value=b.startTime;
    document.getElementById('whatifEnd').value=b.endTime;
    document.getElementById('whatifReqCrew').value=b.requiredCrew;
    document.getElementById('whatifAvailCrew').value=b.availableCrew;
    document.getElementById('whatifEquip').value=b.requiredEquip;
    document.getElementById('whatifEquipStatus').value=b.equipmentStatus;
    document.getElementById('whatifTasks').value=b.tasks.map(t=>t.id).join(', ');
    const scEl=document.getElementById('whatifScenario'); if(scEl) scEl.value='';
}
function collectWhatIfModified(){
    if(!whatIfModified) return null;
    const b=createSimulationCopy(whatIfModified);
    b.date=document.getElementById('whatifDate').value;
    b.corridor=document.getElementById('whatifCorridor').value;
    b.track=document.getElementById('whatifTrack').value;
    b.priority=document.getElementById('whatifPriority').value;
    b.startTime=document.getElementById('whatifStart').value;
    b.endTime=document.getElementById('whatifEnd').value;
    b.requiredCrew=parseInt(document.getElementById('whatifReqCrew').value,10);
    b.availableCrew=parseInt(document.getElementById('whatifAvailCrew').value,10);
    b.requiredEquip=document.getElementById('whatifEquip').value.trim()||"General";
    b.equipmentStatus=document.getElementById('whatifEquipStatus').value;
    const tasksRaw=document.getElementById('whatifTasks').value.trim();
    if(tasksRaw){
        const ids=tasksRaw.split(',').map(s=>s.trim()).filter(Boolean);
        const existingMap={};
        whatIfOriginal.tasks.forEach(t=>existingMap[t.id]=t);
        b.tasks=ids.map(id=>{
            if(existingMap[id]) return existingMap[id];
            const full=taskData[id];
            if(full) return {id, name:full.title.split("·")[1]?.trim()||id, department:full.department, duration:full.duration};
            return {id, name:id, department:"Engineering", duration:"30 min"};
        });
    }
    const s=timeToMinutes(b.startTime), e=timeToMinutes(b.endTime);
    if(!isNaN(s)&&!isNaN(e)){
        b.window=buildWindow(s,e);
        b.duration=calcDurationText(s,e);
    }
    // Keep id same as original
    b.id=whatIfOriginal.id;
    b.type=b.tasks.length>1?"COMBINED":"SINGLE";
    b.maintenanceType=b.type;
    return b;
}
function resetWhatIfModified(){
    if(!whatIfOriginal) return;
    whatIfModified=createSimulationCopy(whatIfOriginal);
    populateWhatIfModified();
    document.getElementById('whatifValidation').style.display='none';
}
function applyWhatIfScenario(value){
    if(!whatIfOriginal){ showToast("Select a block first","error"); return; }
    if(!value){ resetWhatIfModified(); return; }
    const b=createSimulationCopy(whatIfOriginal);
    switch(value){
        case 'block_unavailable':
            // Original window becomes unavailable -> shift to an alternative late window (15:00)
            { const e=timeToMinutes(b.startTime), f=timeToMinutes(b.endTime); const ns=900, ne=ns+(f-e); b.startTime=minutesToTime(ns); b.endTime=minutesToTime(ne); b.window=buildWindow(ns,ne); b.duration=calcDurationText(ns,ne); }
            b.equipmentStatus='UNAVAILABLE';
            b.requiredEquip='Unavailable equipment';
            break;
        case 'train_added':
            // New train movement -> move block into the morning peak (08:00) to expose train conflicts
            { const e=timeToMinutes(b.startTime), f=timeToMinutes(b.endTime); const ns=480, ne=ns+(f-e); b.startTime=minutesToTime(ns); b.endTime=minutesToTime(ne); b.window=buildWindow(ns,ne); b.duration=calcDurationText(ns,ne); }
            break;
        case 'crew_unavailable':
            b.availableCrew=Math.max(0, b.requiredCrew-2);
            break;
        case 'duration_increase':
            { const s=timeToMinutes(b.startTime), e=timeToMinutes(b.endTime); const ne=e+45; b.endTime=minutesToTime(ne); b.window=buildWindow(s,ne); b.duration=calcDurationText(s,ne); }
            break;
        case 'priority_change':
            b.priority=(b.priority==='CRITICAL')?'HIGH':'CRITICAL';
            break;
        case 'equipment_failure':
            b.equipmentStatus='UNAVAILABLE';
            b.requiredEquip='OHE Maintenance Unit';
            break;
    }
    whatIfModified=b;
    populateWhatIfModified();
    // Reset stale simulation outputs so the user must re-run
    whatIfLastResult=null; whatIfCandidates=[];
    document.getElementById('whatifResultsPanel').style.display='none';
    document.getElementById('whatifComparisonPanel').style.display='none';
    document.getElementById('whatifReoptPanel').style.display='none';
    document.getElementById('whatifReoptResults').style.display='none';
    document.getElementById('whatifAlternatives').innerHTML='';
    document.getElementById('whatifReoptActions').style.display='none';
    showToast("Scenario applied to Modified Plan (temporary copy only)","info");
}
function calculateTrainImpact(block){
    const conflicts=detectTrainConflicts(block);
    const count=conflicts.length;
    if(count>=2) return {label:"High", level:"high", count, color:"var(--red)"};
    if(count===1) return {label:"High", level:"high", count, color:"var(--red)"};
    // Also check traffic factor
    const sui=calculateSuitabilityScore(block);
    const traffic=sui.factors.traffic;
    if(traffic<40) return {label:"High", level:"high", count, color:"var(--red)"};
    if(traffic<65) return {label:"Medium", level:"medium", count, color:"var(--orange)"};
    return {label:"Low", level:"low", count, color:"var(--green)"};
}
function runWhatIfSimulation(){
    if(!whatIfOriginal) { showToast("Select a block first","error"); return; }
    const modified=collectWhatIfModified();
    const val=validateBlockData(modified);
    const vEl=document.getElementById('whatifValidation');
    if(!val.valid){
        vEl.textContent=val.errors.join(" ");
        vEl.style.display='block';
        return;
    } else vEl.style.display='none';
    whatIfModified=modified;
    // Use existing logic for analysis
    const originalPri=getBlockPriorityScore(whatIfOriginal);
    const modifiedPri=getBlockPriorityScore(modified);
    const originalSui=calculateSuitabilityScore(whatIfOriginal);
    const modifiedSui=calculateSuitabilityScore(modified);
    const originalConf=analyzeBlockConflicts(whatIfOriginal);
    const modifiedConf=analyzeBlockConflicts(modified);
    const originalTrain=calculateTrainImpact(whatIfOriginal);
    const modifiedTrain=calculateTrainImpact(modified);
    const originalRec=generateAIRecommendation(whatIfOriginal);
    const modifiedRec=generateAIRecommendation(modified);
    const originalStrength=calculateRecommendationStrength(whatIfOriginal);
    const modifiedStrength=calculateRecommendationStrength(modified);

    const result={
        original: {block:whatIfOriginal, pri:originalPri, sui:originalSui, conf:originalConf, train:originalTrain, rec:originalRec, strength:originalStrength},
        modified: {block:modified, pri:modifiedPri, sui:modifiedSui, conf:modifiedConf, train:modifiedTrain, rec:modifiedRec, strength:modifiedStrength}
    };
    whatIfLastResult=result;
    renderWhatIfResults(result);
    renderWhatIfComparison(result);
    // Show reopt panel
    document.getElementById('whatifReoptPanel').style.display='block';
    document.getElementById('whatifReoptResults').style.display='none';
    document.getElementById('whatifAlternatives').innerHTML='';
    document.getElementById('whatifReoptActions').style.display='none';
    if(window.lucide) lucide.createIcons();
    showToast("Prototype simulation completed","success");
}
function renderWhatIfResults(result){
    const panel=document.getElementById('whatifResultsPanel');
    panel.style.display='block';
    const m=result.modified, o=result.original;
    // Metrics cards
    const metricsHtml = `
        <div class="card"><div class="card-label">Train Impact</div><div class="card-value" style="font-size:18px;color:${m.train.color};">${m.train.label}</div><div class="small">Orig: ${o.train.label}</div></div>
        <div class="card"><div class="card-label">Conflict Count</div><div class="card-value">${m.conf.all.length}</div><div class="small">Orig: ${o.conf.all.length} ${m.conf.all.length>o.conf.all.length?'<span style="color:var(--red);">↑ Worsened</span>':m.conf.all.length<o.conf.all.length?'<span style="color:var(--green);">↓ Improved</span>':'<span style="color:var(--muted);">— Same</span>'}</div></div>
        <div class="card"><div class="card-label">Resource Avail</div><div class="card-value" style="font-size:18px;">${m.sui.factors.resourceAvail}%</div><div class="small">Orig: ${o.sui.factors.resourceAvail}%</div></div>
        <div class="card"><div class="card-label">AI Suitability</div><div class="card-value">${m.sui.score}</div><div class="small">Orig: ${o.sui.score} ${m.sui.score>o.sui.score?'<span style="color:var(--green);">↑ Improved</span>':m.sui.score<o.sui.score?'<span style="color:var(--red);">↓ Worsened</span>':'— Same'}</div></div>
        <div class="card"><div class="card-label">AI Priority</div><div class="card-value">${m.pri.score}</div><div class="small">Orig: ${o.pri.score}</div></div>
        <div class="card"><div class="card-label">Recommendation</div><div class="card-value" style="font-size:14px;">${m.rec.title}</div><div class="small">Orig: ${o.rec.title}</div></div>
    `;
    document.getElementById('whatifMetrics').innerHTML = metricsHtml;
    // Recommendation box
    const recBox=document.getElementById('whatifRecommendationBox');
    recBox.innerHTML = `
        <div style="font-size:13px;font-weight:800;letter-spacing:0.5px;color:var(--muted);">RECOMMENDATION</div>
        <div style="font-size:15px;font-weight:800;margin:6px 0;">${m.rec.title}</div>
        <div style="font-size:13px;color:var(--muted);">Prototype Analysis Confidence: ${m.strength.strength}%</div>
        <div class="progress" style="margin:8px 0;"><div class="progress-bar" style="width:${m.strength.strength}%;"></div></div>
        <div style="font-size:12px;color:var(--text2);"><b>Reason:</b> ${m.rec.reason}</div>
        <button class="btn btn-secondary btn-sm" style="margin-top:10px;" onclick="const el=document.getElementById('whatifExplain'); el.style.display = el.style.display==='none'?'block':'none';">Why did AI recommend this?</button>
        <div id="whatifExplain" style="display:none;margin-top:10px;padding:12px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:12px;line-height:1.6;"></div>
    `;
    // Populate explain
    setTimeout(()=>{
        const exp=generateAIExplanation(m.block);
        const el=document.getElementById('whatifExplain');
        if(el) el.innerHTML = exp.text + `<br><br><div style="font-size:13px;color:var(--muted);">Factors: Priority ${m.sui.factors.priorityAlignment}%, Corridor ${m.sui.factors.corridorAvail}%, Resource ${m.sui.factors.resourceAvail}%, Traffic ${m.sui.factors.traffic}%, Conflict ${m.sui.factors.conflictRisk}%, Compat ${m.sui.factors.taskCompat}%</div>`;
    }, 100);

    // Status
    const statusDiv=document.getElementById('whatifStatusBox');
    let status, badgeCls, icon;
    if(m.conf.trainConflicts.length>0 || m.conf.blockConflicts.length>0){
        status="High Risk"; badgeCls="critical"; icon="alert-triangle";
    } else if(m.conf.all.length>0 || m.sui.score<60){
        status="Requires Review"; badgeCls="medium"; icon="alert-circle";
    } else if(Math.abs(m.sui.score - o.sui.score) < 5 && m.conf.all.length===o.conf.all.length){
        status="Neutral"; badgeCls="info"; icon="minus";
    } else if(m.sui.score > o.sui.score){
        status="Improved"; badgeCls="low"; icon="trending-up";
    } else {
        status="Requires Review"; badgeCls="medium"; icon="alert-circle";
    }
    statusDiv.innerHTML = `<div style="padding:14px;border-radius:10px;border:1px solid var(--border);background:var(--card);text-align:center;"><div style="font-size:13px;color:var(--muted);font-weight:700;">SIMULATION STATUS</div><div style="margin-top:8px;"><span class="badge ${badgeCls}" style="font-size:12px;"><i data-lucide="${icon}" style="width:14px;height:14px;"></i> ${status}</span></div><div style="font-size:13px;color:var(--muted);margin-top:6px;">Prototype Simulation</div></div>`;

    // Conflict details
    const cDiv=document.getElementById('whatifConflictDetails');
    let cHtml="";
    if(m.conf.trainConflicts.length) cHtml += m.conf.trainConflicts.map(c=>`<div class="alert alert-red"><span class="alert-icon">!</span><div><b>Train Conflict</b> - ${c.message} (${c.time})</div></div>`).join("");
    if(m.conf.blockConflicts.length) cHtml += m.conf.blockConflicts.map(c=>`<div class="alert alert-red"><span class="alert-icon">!</span><div><b>Block Overlap</b> - ${c.message} (${c.overlap})</div></div>`).join("");
    if(m.conf.resourceConflicts.length) cHtml += m.conf.resourceConflicts.map(c=>`<div class="alert alert-orange"><span class="alert-icon">!</span><div><b>Resource</b> - ${c.message}</div></div>`).join("");
    if(!cHtml) cHtml = `<div class="alert alert-green"><span class="alert-icon">✓</span><div>No critical conflicts. Prototype analysis clear.</div></div>`;
    cDiv.innerHTML = cHtml;
}
function comparePlans(original, modified){
    return {
        time: {orig: original.block.startTime+" - "+original.block.endTime, mod: modified.block.startTime+" - "+modified.block.endTime, improved: false},
        conflicts: {orig: original.conf.all.length, mod: modified.conf.all.length},
        trainImpact: {orig: original.train.label, mod: modified.train.label},
        resource: {orig: original.sui.factors.resourceAvail, mod: modified.sui.factors.resourceAvail},
        suitability: {orig: original.sui.score, mod: modified.sui.score},
        priority: {orig: original.pri.score, mod: modified.pri.score},
        recommendation: {orig: original.rec.title, mod: modified.rec.title}
    };
}
function generateImpactSummary(results){
    const o=results.original, m=results.modified;
    let parts=[];
    if(m.conf.trainConflicts.length>o.conf.trainConflicts.length) parts.push(`introduces ${m.conf.trainConflicts.length - o.conf.trainConflicts.length} train schedule conflict(s)`);
    else if(m.conf.trainConflicts.length<o.conf.trainConflicts.length) parts.push(`resolves train conflicts`);
    if(m.conf.blockConflicts.length>o.conf.blockConflicts.length) parts.push(`adds block overlap with ${m.conf.blockConflicts[0].blockId}`);
    if(m.conf.resourceConflicts.length>o.conf.resourceConflicts.length) parts.push(`reduces resource availability to ${m.sui.factors.resourceAvail}%`);
    else if(m.sui.factors.resourceAvail > o.sui.factors.resourceAvail + 5) parts.push(`improves resource availability to ${m.sui.factors.resourceAvail}%`);
    if(m.sui.score < o.sui.score) parts.push(`AI Suitability Score decreased from ${o.sui.score} to ${m.sui.score}`);
    else if(m.sui.score > o.sui.score) parts.push(`AI Suitability Score improved from ${o.sui.score} to ${m.sui.score}`);
    else parts.push(`AI Suitability remains ${m.sui.score}`);

    let summary = `The modified block ${parts.join(", ")}.`;
    summary += ` Prototype analysis recommendation: ${m.rec.title} - ${m.rec.reason}`;
    return summary;
}
function renderWhatIfComparison(result){
    const panel=document.getElementById('whatifComparisonPanel');
    panel.style.display='block';
    const o=result.original, m=result.modified;
    const comp=comparePlans(o,m);
    function indicator(orig, mod, higherIsBetter=true){
        if(orig===mod) return '<span style="color:var(--muted);">— Same</span>';
        const improved = higherIsBetter ? mod>orig : mod<orig;
        // For conflicts lower is better, so higherIsBetter false
        // We will pass correctly
        if(improved) return '<span style="color:var(--green);"><i data-lucide="trending-up" style="width:12px;height:12px;"></i> Improved</span>';
        return '<span style="color:var(--red);"><i data-lucide="trending-down" style="width:12px;height:12px;"></i> Worsened</span>';
    }
    const html = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="border:1px solid var(--border);border-radius:12px;padding:16px;background:var(--bg);">
                <div style="font-weight:800;font-size:12px;letter-spacing:0.5px;color:var(--muted);">ORIGINAL PLAN</div>
                <div style="margin-top:10px;font-size:12px;display:grid;gap:8px;">
                    <div><b>Time:</b> ${o.block.startTime} - ${o.block.endTime} <span style="color:var(--muted);">(${o.block.date})</span></div>
                    <div><b>Corridor:</b> ${o.block.corridor} | <b>Track:</b> ${o.block.track}</div>
                    <div><b>Train Impact:</b> ${o.train.label} | <b>Conflicts:</b> ${o.conf.all.length}</div>
                    <div><b>Resources:</b> ${o.sui.factors.resourceAvail}% | <b>Suitability:</b> ${o.sui.score}</div>
                    <div><b>Priority:</b> ${o.pri.score} | <b>Recommendation:</b> ${o.rec.title}</div>
                </div>
            </div>
            <div style="border:2px solid var(--blue);border-radius:12px;padding:16px;background:var(--card);">
                <div style="font-weight:800;font-size:12px;letter-spacing:0.5px;color:var(--blue);">MODIFIED PLAN</div>
                <div style="margin-top:10px;font-size:12px;display:grid;gap:8px;">
                    <div><b>Time:</b> ${m.block.startTime} - ${m.block.endTime} <span style="color:var(--muted);">(${m.block.date})</span></div>
                    <div><b>Corridor:</b> ${m.block.corridor} | <b>Track:</b> ${m.block.track}</div>
                    <div><b>Train Impact:</b> ${m.train.label} | <b>Conflicts:</b> ${m.conf.all.length}</div>
                    <div><b>Resources:</b> ${m.sui.factors.resourceAvail}% | <b>Suitability:</b> ${m.sui.score}</div>
                    <div><b>Priority:</b> ${m.pri.score} | <b>Recommendation:</b> ${m.rec.title}</div>
                </div>
            </div>
        </div>
        <div style="margin-top:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:13px;">
            <div style="padding:8px;background:var(--card);border:1px solid var(--border);border-radius:8px;text-align:center;"><div style="color:var(--muted);">Conflicts</div><b>${o.conf.all.length} → ${m.conf.all.length}</b><div>${indicator(o.conf.all.length, m.conf.all.length, false)}</div></div>
            <div style="padding:8px;background:var(--card);border:1px solid var(--border);border-radius:8px;text-align:center;"><div style="color:var(--muted);">Suitability</div><b>${o.sui.score} → ${m.sui.score}</b><div>${indicator(o.sui.score, m.sui.score, true)}</div></div>
            <div style="padding:8px;background:var(--card);border:1px solid var(--border);border-radius:8px;text-align:center;"><div style="color:var(--muted);">Resources</div><b>${o.sui.factors.resourceAvail}% → ${m.sui.factors.resourceAvail}%</b><div>${indicator(o.sui.factors.resourceAvail, m.sui.factors.resourceAvail, true)}</div></div>
        </div>
    `;
    document.getElementById('whatifComparison').innerHTML = html;
    const summary=generateImpactSummary(result);
    const sumDiv=document.getElementById('whatifImpactSummary');
    sumDiv.textContent = summary;
    sumDiv.style.display='block';
    if(window.lucide) lucide.createIcons();
}

// Candidate window search
function findCandidateWindows(block){
    // Generate candidate windows for same date and nearby dates, 2-hour blocks at 01:00,03:00,06:00,10:00,14:00,22:00 etc.
    const candidates=[];
    const baseDuration = (()=>{ const s=timeToMinutes(block.startTime), e=timeToMinutes(block.endTime); return (!isNaN(s)&&!isNaN(e))? e-s : 120; })();
    const dates=[block.date, "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].filter((v,i,a)=>a.indexOf(v)===i);
    const times=[60,180,360,600,840,1320]; // 01:00,03:00,06:00,10:00,14:00,22:00
    dates.forEach(date=>{
        times.forEach(startMin=>{
            const endMin=startMin+baseDuration;
            if(endMin>1440) return;
            const cand=createSimulationCopy(block);
            cand.date=date;
            cand.startTime=minutesToTime(startMin);
            cand.endTime=minutesToTime(endMin);
            cand.window=buildWindow(startMin,endMin);
            cand.duration=calcDurationText(startMin,endMin);
            // Skip if same as original or modified (exact)
            if(cand.date===block.date && cand.startTime===block.startTime && cand.endTime===block.endTime) return;
            candidates.push(cand);
        });
    });
    return candidates;
}
function analyzeCandidateWindow(candidate, baseBlock){
    const sui=calculateSuitabilityScore(candidate);
    const conf=analyzeBlockConflicts(candidate);
    const train=calculateTrainImpact(candidate);
    // Candidate Score = High Suit + Low Conflict + High Resource + Low Train + Priority Alignment
    const score = Math.round(sui.score*0.5 + sui.factors.conflictRisk*0.2 + sui.factors.resourceAvail*0.15 + sui.factors.traffic*0.1 + sui.factors.priorityAlignment*0.05);
    // Also penalize train high
    let finalScore=score;
    if(conf.trainConflicts.length>0) finalScore-=20;
    if(conf.blockConflicts.length>0) finalScore-=15;
    finalScore=Math.max(0,Math.min(100,finalScore));
    return {candidate, sui, conf, train, score:finalScore};
}
function rankCandidateWindows(candidates){
    const analyzed=candidates.map(c=>analyzeCandidateWindow(c, null));
    analyzed.sort((a,b)=> b.score - a.score || b.sui.score - a.sui.score);
    return analyzed.slice(0,3);
}
function generateOptimizedPlan(){
    if(!whatIfLastResult){
        showToast("Run simulation first","error");
        return;
    }
    const base=whatIfLastResult.modified.block;
    const candidates=findCandidateWindows(base);
    const ranked=rankCandidateWindows(candidates);
    whatIfCandidates=ranked;
    const reoptDiv=document.getElementById('whatifReoptResults');
    const altDiv=document.getElementById('whatifAlternatives');
    const actionsDiv=document.getElementById('whatifReoptActions');
    if(!ranked.length){
        reoptDiv.innerHTML = `<div class="empty-state"><div class="empty-icon">🗓️</div><div class="empty-title">No alternative windows found</div><div class="empty-desc">All candidate windows are blocked by traffic or maintenance constraints. Verify the task's corridor and try again.</div></div>`;
        reoptDiv.style.display='block';
        return;
    }
    const best=ranked[0];
    reoptDiv.innerHTML = `
        <div style="border:2px solid var(--green);border-radius:12px;padding:16px;background:linear-gradient(135deg,rgba(16,185,129,0.08),var(--card));">
            <div style="font-size:13px;font-weight:800;letter-spacing:0.5px;color:var(--green);">RECOMMENDED OPTIMIZED PLAN</div>
            <div style="margin-top:8px;display:grid;gap:8px;font-size:12px;">
                <div><b>Recommended Time:</b> ${best.candidate.startTime} - ${best.candidate.endTime} <span style="color:var(--muted);">(${best.candidate.date})</span></div>
                <div><b>Corridor:</b> ${best.candidate.corridor} | <b>Track:</b> ${best.candidate.track}</div>
                <div><b>Conflict Status:</b> ${best.conf.all.length===0?'<span style="color:var(--green);">No Critical Conflicts</span>': best.conf.all.length+' conflicts'}</div>
                <div><b>Resource Availability:</b> ${best.sui.factors.resourceAvail}% | <b>Train Impact:</b> ${best.train.label}</div>
                <div><b>AI Suitability Score:</b> ${best.sui.score}/100 <span class="badge ${getSuitabilityCategory(best.sui.score).cls}">${getSuitabilityCategory(best.sui.score).icon} ${getSuitabilityCategory(best.sui.score).label}</span></div>
                <div style="margin-top:8px;padding:10px;background:var(--bg);border-radius:8px;border:1px solid var(--border);"><b>Reason:</b> This time window was selected because it has ${best.train.label.toLowerCase()} train traffic, ${best.conf.all.length===0?'no overlapping maintenance block':'fewer conflicts'}, and sufficient resources (suitability ${best.sui.score}).</div>
            </div>
        </div>
        <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">
            <div style="border:1px solid var(--border);border-radius:8px;padding:10px;background:var(--bg);"><b>Current Simulation</b><br>Time: ${whatIfLastResult.modified.block.startTime}-${whatIfLastResult.modified.block.endTime}<br>Conflicts: ${whatIfLastResult.modified.conf.all.length}<br>Suitability: ${whatIfLastResult.modified.sui.score}</div>
            <div style="border:1px solid var(--green);border-radius:8px;padding:10px;background:var(--card);"><b>Optimized Plan</b><br>Time: ${best.candidate.startTime}-${best.candidate.endTime}<br>Conflicts: ${best.conf.all.length}<br>Suitability: ${best.sui.score}</div>
        </div>
    `;
    reoptDiv.style.display='block';
    // Alternatives
    altDiv.innerHTML = ranked.map((r,i)=>`
        <div style="border:1px solid var(--border);border-radius:10px;padding:12px;background:var(--card);display:flex;justify-content:space-between;align-items:center;gap:10px;">
            <div>
                <div style="font-weight:700;font-size:12px;">Option ${i+1} ${i===0?'<span class="badge low" style="font-size:12px;">Recommended</span>':''}</div>
                <div style="font-size:13px;color:var(--muted);">${r.candidate.date} ${r.candidate.startTime}-${r.candidate.endTime} | ${r.candidate.corridor} | Suitability ${r.sui.score} | ${r.train.label} train</div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="selectOptimizedCandidate(${i})">Select</button>
        </div>
    `).join("");
    actionsDiv.innerHTML = `
        <button class="btn btn-secondary" onclick="keepSimulation()"><i data-lucide="x" style="width:14px;height:14px;"></i> Keep Simulation</button>
        <button class="btn btn-primary" onclick="applyOptimizedPlan()"><i data-lucide="check" style="width:14px;height:14px;"></i> Apply Optimized Plan</button>
    `;
    actionsDiv.style.display='flex';
    if(window.lucide) lucide.createIcons();
    showToast("Prototype optimization found "+ranked.length+" candidates","success");
}
let selectedCandidateIdx=0;
function selectOptimizedCandidate(idx){
    selectedCandidateIdx=idx;
    // highlight
    const altDiv=document.getElementById('whatifAlternatives');
    Array.from(altDiv.children).forEach((el,i)=>{
        el.style.borderColor = i===idx ? "var(--blue)" : "var(--border)";
        el.style.background = i===idx ? "rgba(59,130,246,0.06)" : "var(--card)";
    });
}
function keepSimulation(){
    showToast("Keeping simulation - no changes applied","info");
}
function applyOptimizedPlan(){
    if(!whatIfCandidates.length){
        showToast("No optimized plan to apply","error");
        return;
    }
    const best=whatIfCandidates[selectedCandidateIdx] || whatIfCandidates[0];
    const optimized=best.candidate;
    uiConfirm({
        title:'Apply Optimized Plan?',
        message:`Apply optimized plan <b>${optimized.startTime}-${optimized.endTime}</b> on <b>${optimized.date}</b> to block <b>${optimized.id}</b>? This will update actual data and require human review.`,
        confirmLabel:'Apply Plan',
        danger:false
    }, function(){ applyOptimizedPlanCore(best); });
}
function applyOptimizedPlanCore(best){
    const optimized=best.candidate;
    // Apply to actual data
    const updated=createSimulationCopy(optimized);
    updated.status="Requires Review"; // Pending Human Review
    updated.lastEdited=new Date().toISOString();
    // Use existing updateBlock
    updateBlock(updated.id, updated);
    // Also update whatIfOriginal to reflect new actual
    whatIfOriginal=createSimulationCopy(updated);
    whatIfModified=createSimulationCopy(updated);
    populateWhatIfModified();
    renderWhatIfOriginal();
    showToast(`Optimized plan applied to ${updated.id} - Pending Human Review`,"success");
    // Refresh UI
    refreshBlockViews();
    if(window.lucide) lucide.createIcons();
}
function openWhatIfFromBlock(blockId){
    go('whatif');
    setTimeout(()=>{
        const sel=document.getElementById('whatifBlockSelect');
        if(sel){
            sel.value=blockId;
            loadWhatIfOriginal();
        }
    }, 200);
}
// Init what-if selector on load (also refreshed after login via init())
document.addEventListener('DOMContentLoaded', ()=>{
    setTimeout(()=>{
        ensureWhatIfReady();
    }, 800);
});
// Patch editBlock flow to allow Analyze Impact after conflict
const _origHandleEditSave = handleEditSave;
handleEditSave = function(){
    _origHandleEditSave();
    // After original logic shows conflict analysis, add Analyze Impact button if not already
    setTimeout(()=>{
        const analysisDiv=document.getElementById('conflictAnalysisSection');
        if(analysisDiv && analysisDiv.style.display!=='none' && whatIfOriginal){
            // Check if button already
            if(!document.getElementById('analyzeImpactBtn')){
                const actions=document.getElementById('conflictActions');
                if(actions){
                    const btn=document.createElement('button');
                    btn.id='analyzeImpactBtn';
                    btn.className='btn btn-secondary btn-sm';
                    btn.innerHTML='<i data-lucide="git-branch" style="width:12px;height:12px;"></i> Analyze Impact (What-If)';
                    btn.onclick=()=>{
                        const id=document.getElementById('editBlockId').value;
                        closeEditBlockModal();
                        openWhatIfFromBlock(id);
                    };
                    actions.appendChild(btn);
                    if(window.lucide) lucide.createIcons();
                }
            }
        }
    }, 300);
};

// ================= BEFORE vs AFTER AI OPTIMIZATION (SIH DEMO) =================
// Prototype feature that reuses the app's existing conflict, suitability and
// candidate-window logic to build a BEFORE vs AFTER comparison for the judge.

let aiDemo = { plan:null, changes:null, metrics:null, applied:false };

// Plan-level metrics computed live from the existing analyzeBlockConflicts engine.
function aiPlanMetrics(blocks){
    const list = blocks || state.blocks;
    const analysis = list.map(function(b){ return analyzeBlockConflicts(b, list); });
    let train=0, block=0, resource=0, hpU=0;
    list.forEach(function(b, idx){
        const an = analysis[idx];
        train += an.trainConflicts.length;
        block += an.blockConflicts.length;
        resource += an.resourceConflicts.length;
        // high-priority tasks (AI Priority >=70) sitting inside conflicted blocks
        if(an.hasConflict && Array.isArray(b.tasks)){
            b.tasks.forEach(function(t){
                const full = taskData[t.id];
                const tsk = full ? { id: t.id, ...full } : { priority: b.priority||"MEDIUM", department: t.department||"Engineering", corridor: b.corridor, duration: t.duration||"60 min", due: "Friday", risk: 60 };
                if(calculatePriorityScore(tsk).score >= 70) hpU++;
            });
        }
    });
    let avgUtil=0, effUtil=0;
    const clean = list.map(function(b, idx){
        const u = parseInt(String(b.utilization||"0%").replace("%",""), 10);
        return { u: isNaN(u)? 0 : u, has: analysis[idx].hasConflict };
    });
    avgUtil = clean.length ? Math.round(clean.reduce(function(s,c){return s+c.u;},0)/clean.length) : 0;
    // conflicted blocks count 0% for effective utilization (they cannot execute as-is)
    effUtil = clean.length ? Math.round(clean.reduce(function(s,c){return s+(c.has?0:c.u);},0)/clean.length) : 0;
    return {
        conflicts: train+block+resource,
        train: train, block: block, resource: resource,
        highPriUnresolved: hpU,
        review: analysis.filter(function(a){return a.hasConflict;}).length,
        effUtil: effUtil, avgUtil: avgUtil,
        totalBlocks: list.length
    };
}

// Simulated AI optimization: reuses findCandidateWindows + calculateSuitabilityScore
// against the evolving plan, then clears residual resource deficits (crew/equipment)
// via the existing "reallocation from reserve" narrative. Never mutates state.blocks.
function aiBuildOptimizedPlan(){
    const working = state.blocks.map(function(b){ return createSimulationCopy(b); });
    const changes = [];
    const findChange = function(id){ return changes.find(function(c){ return c.id === id; }); };

    // Pass 1 - move conflicted blocks (train / block overlaps) to best conflict-free window
    working.forEach(function(wb, idx){
        const orig = state.blocks[idx];
        const conf0 = analyzeBlockConflicts(wb, working);
        if(!conf0.hasConflict) return;
        const candidates = findCandidateWindows(orig);
        let best = null;
        candidates.forEach(function(cand){
            const conf = analyzeBlockConflicts(cand, working);
            if(conf.trainConflicts.length>0 || conf.blockConflicts.length>0) return; // must clear all critical
            const sui = calculateSuitabilityScore(cand);
            const score = Math.round(sui.score*0.6 + sui.factors.resourceAvail*0.2 + sui.factors.traffic*0.1 + sui.factors.priorityAlignment*0.1);
            if(!best || score>best.score) best = { cand: cand, conf: conf, sui: sui, score: score };
        });
        if(best){
            const upd = best.cand;
            upd.status = "Requires Review";
            working[idx] = upd;
            changes.push({
                id: orig.id,
                moved: true,
                before: orig,
                after: upd,
                beforeConf: conf0,
                afterConf: best.conf,
                trainCleared: conf0.trainConflicts.map(function(c){return c.trainId;}).filter(function(tid){ return !best.conf.trainConflicts.some(function(c){ return c.trainId===tid; }); }),
                blockCleared: conf0.blockConflicts.map(function(c){return c.blockId;}).filter(function(bid){ return !best.conf.blockConflicts.some(function(c){ return c.blockId===bid; }); }),
                resourceCleared: [],
                reason: "Time window moved to a scored conflict-free alternative"
            });
        } else {
            changes.push({ id: orig.id, moved: false, before: orig, after: orig, beforeConf: conf0, afterConf: conf0, trainCleared: [], blockCleared: [], resourceCleared: [], reason: "No conflict-free window available" });
        }
    });

    // Pass 2 - resource reallocation for residual crew/equipment deficits
    working.forEach(function(wb, idx){
        const conf = analyzeBlockConflicts(wb, working);
        if(!conf.resourceConflicts.length) return;
        const entry = findChange(wb.id);
        const upd = createSimulationCopy(wb);
        const crewDefs = conf.resourceConflicts.filter(function(r){ return r.subtype==="crew"; });
        const equipDefs = conf.resourceConflicts.filter(function(r){ return r.subtype==="equipment" || r.subtype==="equipment-overlap"; });
        if(crewDefs.length){
            const need = parseInt(upd.requiredCrew, 10);
            if(!isNaN(need)) upd.availableCrew = need; // reallocate from reserve
        }
        if(equipDefs.length) upd.equipmentStatus = "AVAILABLE";
        const conf2 = analyzeBlockConflicts(upd, working);
        if(conf2.all.length < conf.all.length){
            upd.status = "Requires Review";
            working[idx] = upd;
            const cleared = []
                .concat(crewDefs.length? ["crew"] : [])
                .concat(equipDefs.length? ["equipment"] : []);
            if(entry){
                entry.after = upd;
                entry.afterConf = conf2;
                entry.resourceCleared = (entry.resourceCleared||[]).concat(cleared);
            } else {
                changes.push({ id: wb.id, moved: false, resourceOnly: true, before: wb, after: upd, beforeConf: conf, afterConf: conf2, trainCleared: [], blockCleared: [], resourceCleared: cleared, reason: "Resources reallocated from reserve" });
            }
        }
    });

    return { working: working, changes: changes.filter(function(c){ return c.moved || c.resourceOnly; }) };
}

function aiRunOptimization(){
    const runBtn = document.getElementById('aiRunOptimizationBtn');
    if(runBtn) runBtn.disabled = true;
    aiProcess('Running AI Optimization', [
        'Analyze current plan',
        'Detect train & block conflicts',
        'Score candidate windows',
        'Evaluate resource reallocation',
        'Build optimized draft',
        'Prepare before/after comparison'
    ], function(){
        const before = aiPlanMetrics(state.blocks);
        const demo = aiBuildOptimizedPlan();
        const after = aiPlanMetrics(demo.working);
        aiDemo.plan = demo.working;
        aiDemo.changes = demo.changes;
        aiDemo.metrics = { before: before, after: after };
        aiDemo.applied = false;
        if(runBtn){ runBtn.disabled = false; }
        if(before.conflicts === 0 && before.review === 0){
            setAiDemoStatus('The current plan is already conflict-free — nothing for the optimizer to improve.', 'green');
            document.getElementById('aiDemoResults').style.display='block';
            document.getElementById('aiDemoBeforeMetrics').innerHTML = '';
            document.getElementById('aiDemoAfterMetrics').innerHTML = '';
            document.getElementById('aiDemoChanged').innerHTML = '<div class="item"><span class="ico"><i data-lucide="check" style="width:14px;height:14px;color:var(--green);"></i></span><span>No changes required - current plan already conflict-free.</span></div>';
            if(window.lucide) lucide.createIcons();
            return;
        }
        renderAiDemoResults(before, after);
    });
}

function aiMetricList(m){
    return [
        { k:"Conflicts", v:m.conflicts, s:"" },
        { k:"Train Schedule Conflicts", v:m.train, s:"" },
        { k:"Resource Conflicts", v:m.resource, s:"" },
        { k:"High-Priority Tasks Blocked", v:m.highPriUnresolved, s:"" },
        { k:"Effective Utilization", v:m.effUtil, s:"%" },
        { k:"Blocks Needing Review", v:m.review, s:"" }
    ];
}
function aiRenderCol(el, list){
    el.innerHTML = list.map(function(it){
        return '<div class="ai-demo-metric"><span class="lbl">'+it.k+'</span><span class="val">'+it.v+it.s+'</span></div>';
    }).join('');
}
function aiAnimate(el, to, suffix){
    const dur = 600, start = performance.now();
    const timer = setInterval(function(){
        const p = Math.min(1, (performance.now()-start)/dur);
        const eased = 1-Math.pow(1-p, 3);
        el.textContent = Math.round(to*eased) + suffix;
        if(p>=1) clearInterval(timer);
    }, 24);
}
function renderAiDemoResults(before, after){
    const bl = aiMetricList(before), al = aiMetricList(after);
    aiRenderCol(document.getElementById('aiDemoBeforeMetrics'), bl);
    aiRenderCol(document.getElementById('aiDemoAfterMetrics'), al);
    const res = document.getElementById('aiDemoResults');
    res.style.display = 'block';
    // Explanation
    const parts = [];
    if(after.conflicts < before.conflicts) parts.push('resolves <b>'+(before.conflicts-after.conflicts)+' conflict(s)</b> ('+before.conflicts+' → '+after.conflicts+')');
    if(after.effUtil > before.effUtil) parts.push('raises <b>effective utilization</b> from '+before.effUtil+'% to '+after.effUtil+'%');
    if(after.highPriUnresolved < before.highPriUnresolved) parts.push('unblocks <b>'+(before.highPriUnresolved-after.highPriUnresolved)+' high-priority task(s)</b>');
    if(!parts.length) parts.push('keeps the plan unchanged');
    document.getElementById('aiDemoExplain').innerHTML =
        '<div style="display:flex;gap:8px;align-items:flex-start;"><i data-lucide="sparkles" style="width:15px;height:15px;color:#7c4dff;margin-top:2px;flex-shrink:0;"></i><div><b>AI Explanation:</b> The optimizer moved conflicting blocks to scored candidate windows and reallocated reserve resources, which '+parts.join(', ')+'. This is a prototype recommendation - a planner must review and approve it before it becomes the working plan.</div></div>';
    // WHAT CHANGED?
    buildAiChangedList();
    // Status
    setAiDemoStatus('Optimization complete. '+aiDemo.changes.length+' draft change(s) are NOT applied to the planner yet.');
    document.getElementById('aiDemoResetBtn').style.display = '';
    if(window.lucide) lucide.createIcons();
    // count-up on AFTER values, then clean any icons
    setTimeout(function(){
        document.querySelectorAll('#aiDemoAfterMetrics .val').forEach(function(el, i){
            if(al[i]) aiAnimate(el, al[i].v, al[i].s);
        });
        if(window.lucide) lucide.createIcons();
    }, 260);
    const panel = document.getElementById('whatifAiDemoPanel');
    if(panel){ try{ panel.scrollIntoView({ behavior:'smooth', block:'nearest' }); }catch(e){} }
}
function buildAiChangedList(){
    const wrap = document.getElementById('aiDemoChanged');
    if(!aiDemo.changes.length){
        wrap.innerHTML = '<div class="item"><span class="ico"><i data-lucide="check" style="width:14px;height:14px;color:var(--green);"></i></span><span>No changes required - the current plan is already conflict-free.</span></div>';
        return;
    }
    wrap.innerHTML = aiDemo.changes.map(function(c){
        let desc;
        if(c.moved){
            desc = '<b>'+c.id+'</b> moved from <b>'+c.before.date+' '+c.before.startTime+'–'+c.before.endTime+'</b> → <b>'+c.after.date+' '+c.after.startTime+'–'+c.after.endTime+'</b>';
            const cleared = [];
            if(c.trainCleared.length) cleared.push(c.trainCleared.length+' train conflict(s)');
            if(c.blockCleared.length) cleared.push('block overlap');
            if(c.resourceCleared.length) cleared.push(c.resourceCleared.join('+')+' resource');
            if(cleared.length) desc += ' — cleared '+cleared.join(', ');
        } else if(c.resourceOnly){
            desc = '<b>'+c.id+'</b> resource reallocation — cleared '+(c.resourceCleared||[]).join(', ')+' deficit without changing the window';
        } else {
            desc = '<b>'+c.id+'</b> no conflict-free window available — kept as-is';
        }
        return '<div class="item"><span class="ico"><i data-lucide="arrow-right" style="width:14px;height:14px;color:#7c4dff;"></i></span><span>'+desc+'</span></div>';
    }).join('');
}
function aiReviewChanges(){
    if(!aiDemo.changes || !aiDemo.changes.length){
        showToast('Nothing to review','error');
        return;
    }
    const wrap = document.getElementById('aiDemoChanged');
    wrap.innerHTML = aiDemo.changes.map(function(c){
        const sb = c.beforeConf ? c.beforeConf.all.length : 0;
        const sa = c.afterConf ? c.afterConf.all.length : 0;
        let line = c.moved
            ? '<b>'+c.id+'</b> '+c.before.date+' '+c.before.startTime+'–'+c.before.endTime+' → '+c.after.date+' '+c.after.startTime+'–'+c.after.endTime
            : '<b>'+c.id+'</b> resource reallocation';
        line += ' &nbsp;·&nbsp; conflicts <b>'+sb+' → '+sa+'</b>';
        if(c.moved){
            line += ' &nbsp;·&nbsp; AI suitability <b>'+calculateSuitabilityScore(c.before).score+' → '+calculateSuitabilityScore(c.after).score+'</b>';
        }
        return '<div class="item"><span class="ico"><i data-lucide="search" style="width:14px;height:14px;color:#7c4dff;"></i></span><span>'+line+'</span></div>';
    }).join('');
    showToast('Reviewing '+aiDemo.changes.length+' AI draft change(s)','info');
    if(window.lucide) lucide.createIcons();
    try{ wrap.scrollIntoView({ behavior:'smooth', block:'center' }); }catch(e){}
}
function aiApplyPlan(){
    if(!aiDemo.changes || !aiDemo.changes.length){
        showToast('Nothing to apply','error');
        return;
    }
    if(aiDemo.applied){
        showToast('Already applied to planner - awaiting approval','info');
        return;
    }
    const moves = aiDemo.changes.filter(function(c){ return c.moved; }).length;
    const resc = aiDemo.changes.filter(function(c){ return c.resourceOnly; }).length;
    uiConfirm({
        title: 'Apply AI Optimization to Planner?',
        message: 'Apply <b>'+aiDemo.changes.length+' draft change(s)</b> to the planner ('+moves+' window move(s), '+resc+' resource reallocation(s))?<br><br>Every modified block will be marked <b>Requires Review</b> and queued for planner approval in Approval &amp; Audit. No block becomes active until a planner approves it.',
        confirmLabel: 'Apply to Planner',
        danger: false
    }, function(){
        aiProcess('Applying to Planner', [
            'Merge optimized windows',
            'Reallocate reserve resources',
            'Mark blocks for review',
            'Append audit log',
            'Refresh views'
        ], aiApplyPlanCore);
    });
}
function aiApplyPlanCore(){
    let applied = 0;
    aiDemo.changes.forEach(function(c){
        if(!c.moved && !c.resourceOnly) return;
        const upd = createSimulationCopy(c.after);
        upd.lastEdited = new Date().toISOString();
        try{ updateBlock(c.id, upd); applied++; }catch(e){ console.warn('apply failed for '+c.id, e); }
    });
    try{ addAudit('optimization', 'AI optimization applied to '+applied+' block(s) - pending planner review', 'Draft from BEFORE vs AFTER AI Optimization approved for application by planner', null, false); }catch(e){}
    aiDemo.applied = true;
    setAiDemoStatus('Applied to planner. <b>'+applied+'</b> block(s) marked <b>Requires Review</b> - awaiting approval in Approval &amp; Audit.', 'green');
    try{ if(window.netopsRefreshMap) window.netopsRefreshMap(); }catch(e){}
    try{ refreshBlockViews(); }catch(e){}
    try{ loadWhatIfOriginal(); }catch(e){}
    const resetBtn = document.getElementById('aiDemoResetBtn');
    if(resetBtn) resetBtn.style.display = '';
    const applyBtn = document.querySelector('#aiDemoActions .btn-primary');
    if(applyBtn){ applyBtn.style.display='none'; }
    if(window.lucide) lucide.createIcons();
    showToast('AI optimization applied - pending planner review','success');
}
function aiOptimizationReset(){
    aiDemo = { plan:null, changes:null, metrics:null, applied:false };
    const res = document.getElementById('aiDemoResults');
    if(res) res.style.display = 'none';
    setAiDemoStatus('');
    const runBtn = document.getElementById('aiRunOptimizationBtn');
    if(runBtn){ runBtn.disabled = false; runBtn.style.opacity = 1; }
    const applyBtn = document.querySelector('#aiDemoActions .btn-primary');
    if(applyBtn) applyBtn.style.display = '';
    showToast('Demo reset','info');
}
function setAiDemoStatus(html, tone){
    const el = document.getElementById('aiDemoStatus');
    if(!el) return;
    if(!html){
        el.style.display = 'none';
        el.innerHTML = '';
        return;
    }
    el.style.display = 'block';
    const border = tone==='green' ? 'var(--green)' : '#7c4dff';
    const bg = tone==='green' ? 'rgba(16,185,129,.1)' : 'rgba(124,77,255,.1)';
    el.innerHTML = '<div style="display:flex;gap:8px;align-items:flex-start;"><i data-lucide="'+(tone==='green'?'check-circle-2':'info')+'" style="width:15px;height:15px;color:'+border+';margin-top:2px;flex-shrink:0;"></i><span>'+html+'</span></div>';
    el.style.border = '1px solid '+border;
    el.style.background = bg;
    if(window.lucide) lucide.createIcons();
}

// ================= SIH DEMO WALKTHROUGH =================
const sihDemoSteps = [
    { title:'Dashboard Overview', icon:'layout-dashboard', screen:'dashboard',
      text:'Here is your operational dashboard. It shows live KPIs derived from real prototype data: Active Maintenance Blocks, Critical Tasks, Active Conflicts, Blocks Requiring Review, and Pending Approvals. Critical alerts and AI recommendations are listed below.' },
    { title:'Maintenance Block Planning', icon:'clipboard-list', screen:'tasks',
      text:'The Block Planner lists every maintenance block with corridor, track, timing, priority, suitability, and conflict status. Blocks are color-coded Clear, Warning, Conflict, or Requires Review.' },
    { title:'Edit Block', icon:'pencil', screen:'tasks',
      text:'Click "Edit" on any block to open the Edit Block modal. Modify timing, corridor, track, priority, or resources. Changes are saved to localStorage and persist after refresh.' },
    { title:'Conflict Detection', icon:'alert-triangle', screen:'conflicts',
      text:'The Conflict Center auto-detects train conflicts, block overlaps, and resource conflicts using the analysis engine. Each conflict shows severity and a suggestion for resolution.' },
    { title:'AI Priority Score', icon:'gauge', screen:'tasks',
      text:'Every block receives an AI Priority Score (0-100) from weighted factors like urgency, importance, and window criticality. Higher priority blocks surface to the top.' },
    { title:'AI Suitability Score', icon:'activity', screen:'tasks',
      text:'An AI Suitability Score (0-100) rates how well a proposed plan window fits, considering train traffic, resource availability, conflicts, and more.' },
    { title:'AI Recommendation', icon:'sparkles', screen:'tasks',
      text:'The explainable AI generates a recommendation for each block (e.g. Approve, Change Block Timing, Review Resources) with factor bars and plain-language reasoning.' },
    { title:'What-If Simulation', icon:'git-branch', screen:'whatif',
      text:'The What-If Simulator lets you clone a plan, modify it, and see the predicted impact: train impact, conflict counts, resource availability, suitability, and priority. You can even re-optimize and apply a recommended plan.' },
    { title:'Human Review & Approval', icon:'clipboard-check', screen:'approval',
      text:'The Approval Center is the human-in-the-loop workflow. AI recommends, but an authorized human decides. Review each block, approve or reject it (with a reason for overrides), use checkboxes for bulk decisions, and track every action in the auditable Audit Log — a key requirement for a responsible AI system.' }
];

let sihDemoIndex = 0;

function openSihDemo() {
    sihDemoIndex = 0;
    document.getElementById('sihDemoModal').classList.add('show');
    renderSihDemo();
}

function closeSihDemo() {
    document.getElementById('sihDemoModal').classList.remove('show');
}

function sihDemoNext() {
    if (sihDemoIndex < sihDemoSteps.length - 1) {
        sihDemoIndex++;
        renderSihDemo();
    } else {
        closeSihDemo();
    }
}

function sihDemoPrev() {
    if (sihDemoIndex > 0) {
        sihDemoIndex--;
        renderSihDemo();
    }
}

function showSihDemoScreen(step) {
    const btn = Array.from(document.querySelectorAll('.nav-btn')).find(b => {
        const screenMatch = b.getAttribute('onclick') && b.getAttribute('onclick').indexOf("showScreen('" + step.screen + "'") !== -1;
        return screenMatch;
    });
    showScreen(step.screen, btn);
}

function renderSihDemo() {
    const step = sihDemoSteps[sihDemoIndex];
    const total = sihDemoSteps.length;

    const content = document.getElementById('sihDemoContent');
    content.innerHTML = `
        <div style="display:flex;gap:14px;align-items:flex-start;">
            <div style="flex:0 0 auto;width:52px;height:52px;border-radius:12px;background:linear-gradient(135deg,var(--blue),var(--purple));color:white;display:flex;align-items:center;justify-content:center;"><i data-lucide="${step.icon}" style="width:28px;height:28px;"></i></div>
            <div style="flex:1;">
                <div style="font-size:var(--text-xl);font-weight:700;margin-bottom:6px;color:var(--text);">${sihDemoIndex+1}. ${step.title}</div>
                <p style="font-size:var(--text-base);line-height:1.7;color:var(--text2);">${step.text}</p>
                <p class="note" style="font-size:var(--text-sm);margin-top:12px;"><i data-lucide="info" style="width:14px;height:14px;vertical-align:middle;"></i> This step uses existing prototype functionality with synthetic demo data.</p>
            </div>
        </div>
    `;

    const progress = document.getElementById('sihDemoProgress');
    progress.innerHTML = sihDemoSteps.map((s, i) =>
        `<div style="flex:1;min-width:40px;height:6px;border-radius:4px;background:${i <= sihDemoIndex ? 'linear-gradient(90deg,var(--blue),var(--purple))' : 'var(--border)'};"></div>`
    ).join('');

    document.getElementById('sihDemoCounter').textContent = `Step ${sihDemoIndex+1} of ${total}`;
    document.getElementById('sihDemoPrevBtn').disabled = (sihDemoIndex === 0);
    document.getElementById('sihDemoNextBtn').style.display = (sihDemoIndex === total - 1) ? 'none' : '';
    document.getElementById('sihDemoNextBtn').innerHTML = (sihDemoIndex === total - 1) ? '' : 'Next <i data-lucide="arrow-right" style="width:16px;height:16px;"></i>';
    document.getElementById('sihDemoDoneBtn').style.display = (sihDemoIndex === total - 1) ? '' : 'none';

    if (window.lucide) lucide.createIcons();
}

// ================= FLOATING AI ASSISTANT =================
function toggleFloatingAssistant() {
    const panel = document.getElementById('aiFloatingPanel');
    if (!panel) return;
    const btn = document.getElementById('aiFloatingBtn');
    if (panel.classList.contains('open')) {
        panel.classList.remove('open');
        setTimeout(() => { if (!panel.classList.contains('open')) panel.style.display = 'none'; }, 190);
    } else {
        panel.style.display = 'flex';
        requestAnimationFrame(() => requestAnimationFrame(() => { panel.classList.add('open'); }));
        try { updateFloatingSuggestions(); } catch(e){}
        if (btn) {
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => { btn.style.transform = 'scale(1)'; }, 120);
        }
    }
}

function sendFloatingAI(question) {
    const input = document.getElementById('aiFloatingInput');
    const q = (question || input.value || '').trim();
    if (!q) return;
    const chat = document.getElementById('aiFloatingChat');
    if (chat.querySelector('.message.bot') && chat.querySelector('.message.bot').dataset.welcome && !chat.querySelector('.message.user')) {
        chat.innerHTML = '';
    }
    chat.insertAdjacentHTML('beforeend',
        `<div class="message user" style="align-self:flex-end;background:linear-gradient(135deg,var(--blue),var(--purple));color:#fff;padding:10px 12px;border-radius:10px;max-width:85%;font-size:var(--text-sm);text-align:left;">${q}</div>`);
    input.value = '';

    setTimeout(() => {
        const reply = buildFloatingReply(q);
        chat.insertAdjacentHTML('beforeend',
            `<div class="message bot" style="background:var(--card);border:1px solid var(--border);padding:10px 12px;border-radius:10px;max-width:92%;font-size:var(--text-sm);line-height:1.6;">${reply}</div>`);
        chat.scrollTop = chat.scrollHeight;
        if (window.lucide) lucide.createIcons();
    }, 300);
}

function buildFloatingReply(q) {
    const s = (q || '').toLowerCase();
    const screen = getCurrentScreenId();

    if (s.indexOf('conflict') !== -1 || s.indexOf('attention') !== -1 || s.indexOf('alert') !== -1) {
        const active = state.blocks.filter(b => b.status === 'Conflict' || b.conflicts && b.conflicts.length);
        if (active.length === 0) {
            return 'There are currently no blocks flagged with conflicts.';
        }
        const first = active[0];
        const types = first.conflicts && first.conflicts.map(c => c.type).join(', ') || first.status;
        return `Currently <b>${active.length}</b> block(s) require attention. Example: <b>${first.id}</b> on ${first.corridor}/${first.track} — ${types}. Open Conflict Center for details.`;
    }
    if (s.indexOf('recommend') !== -1) {
        const rec = state.blocks.find(b => b.aiRecommendation && b.aiRecommendation.title);
        if (!rec) return 'Open a block detail to view its AI recommendation.';
        return `<b>${rec.id}</b>: ${rec.aiRecommendation.title} — Priority ${rec.priorityScore||'n/a'}, Suitability ${rec.suitabilityScore||'n/a'}. View Details for the full explanation.`;
    }
    if (s.indexOf('block') !== -1 && s.indexOf('explain') !== -1) {
        return 'Select a block and open its details to see the explainable AI factors: Priority Score, Suitability Score, and Recommendation with reasoning.';
    }
    if (s.indexOf('approval') !== -1 && (s.indexOf('how') !== -1 || s.indexOf('work') !== -1)) {
        return 'The Approval Center implements a human-in-the-loop workflow: AI recommends a decision per block (Approve, Change Timing, Review Resources, etc.), but only an authorized human can finalize it. Approving or rejecting a decision that differs from the AI recommendation flags it as a Human Override and asks for a reason. Every action is written to the Audit Log so the workflow is auditable and accountable.';
    }
    if (s.indexOf('pending') !== -1 || s.indexOf('review status') !== -1 || s.indexOf('approval') !== -1) {
        const pending = state.blocks.filter(b=>{ const a=getApprovalStatus(b.id); return a.category==='pending'||a.category==='requires'; });
        const approved = state.blocks.filter(b=>getApprovalStatus(b.id).category==='approved').length;
        const rejected = state.blocks.filter(b=>getApprovalStatus(b.id).category==='rejected').length;
        return `Approval status: <b>${pending.length}</b> pending, <b>${approved}</b> approved, <b>${rejected}</b> rejected${pending[0]?('. Next to review: <b>'+pending[0].id+'</b> ('+pending[0].corridor+').'):'.'} Open Approval & Audit to act on them.`;
    }
    if (s.indexOf('recent decision') !== -1 || s.indexOf('audit') !== -1) {
        if(!state.auditRecords.length) return 'No decisions have been recorded yet. Approve or reject blocks to build the audit log.';
        const last = state.auditRecords[0];
        return `Most recent action: <b>${last.category.toUpperCase()}</b> — ${last.message}${last.reason?(' Reason: '+last.reason):''} at ${new Date(last.time).toLocaleString()}.`;
    }
    if (s.indexOf('whatif') !== -1 || s.indexOf('simulat') !== -1 || s.indexOf('scenario') !== -1) {
        return 'Use the What-If Simulator to clone a plan, modify it, and compare Original vs Modified impact, then re-optimize.';
    }
    if (s.indexOf('window') !== -1) {
        return 'The AI evaluates candidate time windows using conflict, traffic, resource, and priority factors. Open block details and choose "Find a better planning window".';
    }
    if (s.indexOf('dashboard') !== -1 || s.indexOf('hello') !== -1 || s.indexOf('hi') !== -1) {
        return 'I am your Prototype AI Planning Assistant. I can explain conflicts, recommendations, and where to find things. Ask me about blocks, conflicts, or trends.';
    }
    return 'I am a prototype assistant using synthetic data. Try asking "What requires attention?", "Show active conflicts", or "Explain AI recommendations".';
}

/* ================= UI/UX POLISH LAYER ================= */

// ---- Button feedback helpers ----
function uxLoading(el, on){
    if(!el) return;
    if(on) el.classList.add('is-loading'); else el.classList.remove('is-loading');
}
function uxFlash(el, type){
    if(!el) return;
    el.classList.remove('flash-success','flash-error');
    void el.offsetWidth;
    el.classList.add('flash-'+type);
    setTimeout(function(){ el.classList.remove('flash-'+type); }, 650);
}

// ---- Custom confirm dialog (replaces native confirm) ----
function uiConfirm(opts, onYes){
    const o = opts || {};
    let m = document.getElementById('uiConfirmModal');
    if(!m){
        m = document.createElement('div');
        m.id = 'uiConfirmModal';
        m.className = 'modal';
        m.innerHTML = '<div class="modal-content" style="width:min(430px,100%);padding:24px;">' +
            '<div style="display:flex;align-items:flex-start;gap:12px;">' +
            '<div style="width:38px;height:38px;border-radius:10px;background:rgba(59,130,246,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i data-lucide="alert-triangle" style="width:18px;height:18px;color:var(--blue);"></i></div>' +
            '<div style="flex:1;">' +
            '<div id="uiConfirmTitle" style="font-weight:800;font-size:15px;color:var(--text);margin-bottom:6px;"></div>' +
            '<div id="uiConfirmMsg" style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:18px;"></div>' +
            '<div style="display:flex;gap:8px;justify-content:flex-end;">' +
            '<button class="btn btn-secondary btn-sm" id="uiConfirmNo" type="button">Cancel</button>' +
            '<button class="btn btn-primary btn-sm" id="uiConfirmYes" type="button">Confirm</button>' +
            '</div></div></div></div>';
        document.body.appendChild(m);
        m.addEventListener('click', function(e){ const box = m.querySelector('.modal-content'); if(box && !box.contains(e.target)) closeUiConfirm(); });
        m.querySelector('#uiConfirmNo').addEventListener('click', closeUiConfirm);
        m.querySelector('#uiConfirmYes').addEventListener('click', function(){
            const cb = m._uxYes || null;
            closeUiConfirm();
            if(typeof cb === 'function'){ try{ cb(); }catch(e){ console.warn(e); } }
        });
    }
    document.getElementById('uiConfirmTitle').textContent = o.title || 'Are you sure?';
    document.getElementById('uiConfirmMsg').innerHTML = o.message || 'Proceed?';
    const yesBtn = document.getElementById('uiConfirmYes');
    yesBtn.innerHTML = '<i data-lucide="check" style="width:13px;height:13px;vertical-align:middle;"></i> ' + (o.confirmLabel || 'Confirm');
    yesBtn.style.background = o.danger ? 'var(--red)' : 'var(--blue)';
    m._uxYes = onYes;
    if(window.lucide){ try{ lucide.createIcons(m); }catch(e){} }
    m.classList.add('show');
}
function closeUiConfirm(){
    const m = document.getElementById('uiConfirmModal');
    if(m) m.classList.remove('show');
}

// ---- Simulated AI processing overlay (labeled as prototype) ----
let uxAIProcActive = false;
function aiProcess(title, steps, done){
    if(uxAIProcActive) return;
    uxAIProcActive = true;
    const ov = document.createElement('div');
    ov.className = 'ai-proc';
    ov.innerHTML = '<div class="ai-proc-card">' +
        '<div style="display:flex;align-items:center;gap:8px;font-weight:800;font-size:14px;color:var(--text);margin-bottom:4px;"><i data-lucide="sparkles" style="width:16px;height:16px;color:var(--blue);"></i><span></span></div>' +
        '<div class="ai-proc-sub">Prototype AI processing · simulated on synthetic data</div>' +
        '<div class="ai-proc-steps"></div>' +
        '<div class="ai-proc-progress"><div class="ai-proc-progress-bar"></div></div>' +
        '</div>';
    ov.querySelector('.ai-proc-card > div:first-child span').textContent = title;
    const stepsEl = ov.querySelector('.ai-proc-steps');
    steps.forEach(function(s, i){
        const el = document.createElement('div');
        el.className = 'ai-proc-step';
        const icon = document.createElement('span');
        icon.className = 'step-icon';
        icon.textContent = i + 1;
        const txt = document.createElement('span');
        txt.textContent = s;
        el.appendChild(icon);
        el.appendChild(txt);
        stepsEl.appendChild(el);
    });
    document.body.appendChild(ov);
    if(window.lucide){ try{ lucide.createIcons(ov); }catch(e){} }
    const stepEls = stepsEl.querySelectorAll('.ai-proc-step');
    const bar = ov.querySelector('.ai-proc-progress-bar');
    const total = stepEls.length;
    const stepDelay = total > 5 ? 210 : 260;
    let i = 0;
    function next(){
        if(i >= total){
            bar.style.width = '100%';
            setTimeout(function(){
                ov.classList.add('leaving');
                setTimeout(function(){
                    ov.remove();
                    uxAIProcActive = false;
                    if(done){ try{ done(); }catch(e){ console.warn(e); } }
                }, 260);
            }, 220);
            return;
        }
        stepEls[i].classList.add('active');
        bar.style.width = Math.round(((i + 0.5) / total) * 100) + '%';
        setTimeout(function(){
            stepEls[i].classList.add('done');
            stepEls[i].classList.remove('active');
            bar.style.width = Math.round(((i + 1) / total) * 100) + '%';
            i++;
            setTimeout(next, stepDelay);
        }, stepDelay);
    }
    setTimeout(next, 160);
}

// ---- Auto button loading + flash for AI operations ----
(function(){
    const AI_OPS = ['runWhatIfSimulation','generateOptimizedPlan','applyOptimizedPlan','confirmApprovalDecision','generateMonthlyPlan'];
    document.addEventListener('click', function(e){
        const btn = e.target.closest('.btn');
        if(!btn || !btn.getAttribute || !btn.getAttribute('onclick')) return;
        const oc = btn.getAttribute('onclick');
        if(AI_OPS.some(function(n){ return oc.indexOf(n) !== -1; })){
            uxLoading(btn, true);
            setTimeout(function(){ uxLoading(btn, false); }, 2400);
        }
    });
})();

// ---- Wrap heavy AI functions with the processing overlay ----
(function(){
    const _o = {
        runWhatIfSimulation: window.runWhatIfSimulation,
        generateOptimizedPlan: window.generateOptimizedPlan,
        applyOptimizedPlan: window.applyOptimizedPlan,
        confirmApprovalDecision: window.confirmApprovalDecision,
        generateMonthlyPlan: window.generateMonthlyPlan
    };
    if(typeof _o.runWhatIfSimulation === 'function'){
        window.runWhatIfSimulation = function(){
            aiProcess('Running Simulation', ['Validate maintenance tasks','Check train timetable','Check block windows','Detect conflicts','Check resources','Optimize schedule'], function(){ _o.runWhatIfSimulation(); });
        };
    }
    if(typeof _o.generateOptimizedPlan === 'function'){
        window.generateOptimizedPlan = function(){
            aiProcess('Re-Optimizing Plan', ['Load current plan','Evaluate candidate windows','Score conflicts & resources','Rank alternatives'], function(){ _o.generateOptimizedPlan(); });
        };
    }
    if(typeof _o.applyOptimizedPlan === 'function'){
        window.applyOptimizedPlan = function(){
            aiProcess('Applying Plan', ['Merge optimized window','Update block schedule','Queue for human review','Refresh views'], function(){ _o.applyOptimizedPlan(); });
        };
    }
    if(typeof _o.confirmApprovalDecision === 'function'){
        window.confirmApprovalDecision = function(id, action){
            aiProcess('Recording Decision', ['Validate approval','Update block status','Append audit log','Refresh views'], function(){ _o.confirmApprovalDecision(id, action); });
        };
    }
    if(typeof _o.generateMonthlyPlan === 'function'){
        window.generateMonthlyPlan = function(){
            aiProcess('Generating Monthly Plan', ['Load maintenance tasks','Allocate blocks','Apply AI batching rules','Render schedule'], function(){ _o.generateMonthlyPlan(); });
        };
    }
})();

// ---- Resource drawer backdrop ----
function ensureDrawerBackdrop(open){
    let b = document.getElementById('resourceDrawerBackdrop');
    if(open){
        if(!b){
            b = document.createElement('div');
            b.id = 'resourceDrawerBackdrop';
            b.className = 'drawer-backdrop';
            b.addEventListener('click', function(){ closeResourceDrawer(); });
            document.body.appendChild(b);
        }
        requestAnimationFrame(function(){ b.classList.add('show'); });
    } else if(b){
        b.classList.remove('show');
        setTimeout(function(){ if(b && b.parentNode) b.parentNode.removeChild(b); }, 260);
    }
}
(function(){
    const _oOpen = window.openResourceDetail;
    const _oClose = window.closeResourceDrawer;
    if(typeof _oOpen === 'function'){
        window.openResourceDetail = function(type, key){ _oOpen(type || 'crew', key); ensureDrawerBackdrop(true); };
    }
    if(typeof _oClose === 'function'){
        window.closeResourceDrawer = function(){ _oClose(); ensureDrawerBackdrop(false); };
    }
})();

// ---- ESC closes drawer / modals ----
document.addEventListener('keydown', function(e){
    if(e.key !== 'Escape') return;
    const d = document.getElementById('resourceDrawer');
    if(d && d.classList.contains('open')){ closeResourceDrawer(); return; }
    document.querySelectorAll('.modal.show').forEach(function(m){ m.classList.remove('show'); });
});

// ---- Resource filter feedback ----
function updateResourceFilterSummary(){
    const el = document.getElementById('resourceFilterSummary');
    if(!el) return;
    const flt = getResourceFilters();
    const active = [flt.dept, flt.status, flt.corridor].filter(function(v){ return v !== 'All'; });
    const crews = crewData.filter(function(c){
        return (flt.dept === 'All' || c.department === flt.dept) &&
               (flt.status === 'All' || c.status === flt.status.toLowerCase()) &&
               (flt.corridor === 'All' || c.corridor === flt.corridor);
    }).length;
    const equips = equipmentData.filter(function(e){
        return (flt.dept === 'All' || e.department === flt.dept) &&
               (flt.status === 'All' || e.status === flt.status.toUpperCase()) &&
               (flt.corridor === 'All' || e.corridor === flt.corridor);
    }).length;
    const resetBtn = document.getElementById('clearResourceFilters');
    if(active.length === 0){
        el.textContent = 'Showing all crews & equipment';
        if(resetBtn) resetBtn.style.display = 'none';
    } else {
        el.innerHTML = '<b>' + crews + '</b> crews &middot; <b>' + equips + '</b> equipment &middot; Active: <b>' + active.join(' + ') + '</b>';
        if(resetBtn) resetBtn.style.display = 'inline-flex';
    }
}
function clearResourceFilters(){
    ['filterDept','filterStatus','filterCorridor'].forEach(function(id){
        const s = document.getElementById(id);
        if(s) s.value = 'All';
    });
    filterResources();
}
(function(){
    const _oF = window.filterResources;
    if(typeof _oF === 'function'){
        window.filterResources = function(){ _oF(); updateResourceFilterSummary(); };
    }
})();

// ================= DATA & INTEGRATION - IMPORT PIPELINE =================
// Full workflow: upload → parse → normalise → validate → preview → confirm import
// Replaces the demo data in all shared state objects; refreshes every module.

(function(){
    var S={bundle:null,validation:null,previewTab:'tasks',imported:false};
    window._di=S;

    /* ---------- CSV parser ---------- */
    function parseCSVRow(line){
        var out=[],cur='',inQ=false;
        for(var i=0;i<line.length;i++){
            var c=line[i];
            if(inQ){
                if(c==='"'){if(i+1<line.length&&line[i+1]==='"'){cur+='"';i++;}else inQ=false;}
                else cur+=c;
            }else{
                if(c==='"') inQ=true;
                else if(c===','){out.push(cur);cur='';}
                else cur+=c;
            }
        }
        out.push(cur);
        return out;
    }
    function parseCSV(text){
        var lines=text.replace(/\r/g,'').split('\n').filter(function(l){return l.trim();});
        if(lines.length<2) return [];
        var headers=parseCSVRow(lines[0]).map(function(h){return h.trim();});
        return lines.slice(1).map(function(line){
            var vals=parseCSVRow(line);
            var obj={};
            headers.forEach(function(h,i){obj[h]=((vals[i]||'').trim());});
            return obj;
        });
    }

    /* ---------- helpers ---------- */
    function h(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html)e.innerHTML=html;return e;}
    function deepClone(o){try{return JSON.parse(JSON.stringify(o));}catch(e){return o;}}
    function trim(s){return String(s||'').trim();}
    function isNum(v){return !isNaN(parseInt(v,10));}
    function isDayName(v){return KNOWN_DAYS.indexOf(v)!==-1;}
    function isCorridor(v){return KNOWN_CORRIDORS.indexOf(v)!==-1;}
    function timeToMin(s){var m=String(s).match(/^(\d{1,2}):(\d{2})$/);if(!m)return NaN;return parseInt(m[1],10)*60+parseInt(m[2],10);}
    function fmtTime(m){var h=Math.floor(m/60),mn=m%60;return(h<10?'0':'')+h+':'+(mn<10?'0':'')+mn;}

    /* ---------- normalise raw bundle into canonical shapes ---------- */
    function normBundle(raw){
        var out={tasks:{},assets:[],trains:[],crew:[],equipment:[],blocks:{}};
        // --- tasks ---
        var taskArr=[];
        var tRaw=raw.tasks||raw.taskData||raw.taskDataMap||null;
        if(Array.isArray(tRaw)) taskArr=tRaw;
        else if(tRaw&&typeof tRaw==='object'){
            Object.keys(tRaw).forEach(function(k){
                var t=deepClone(tRaw[k]);t.id=k;taskArr.push(t);
            });
        }
        var seq=0;
        taskArr.forEach(function(t){
            var id=trim(t.id||t.taskId||'T'+(++seq));
            if(!id) id='T'+(++seq);
            var dept=trim(t.department||t.dept||'Engineering');
            var priority=trim(t.priority||t.criticality||'MEDIUM').toUpperCase();
            var duration=trim(t.duration);
            if(/^\d+$/.test(duration)) duration=duration+' min';
            var due=trim(t.due||t.dueDate||t.date);
            if(!due) due='Next week';
            var risk=parseInt(t.risk,10);if(isNaN(risk)) risk=30;
            var title=trim(t.title||t.description||id+' task');
            if(String(title).indexOf(id+' ·')===-1&&String(title).indexOf(id+'-')===-1) title=id+' · '+title;
            out.tasks[id]={
                id:id, title:title, description:trim(t.description||title),
                priority:priority, department:dept,
                corridor:trim(t.corridor||'C1'),
                duration:duration, due:due, risk:risk,
                block:trim(t.block), asset:trim(t.asset),
                requiredCrew:parseInt(t.requiredCrew,10)||0,
                requiredEquip:parseInt(t.requiredEquip,10)||0,
                reason:trim(t.reason)
            };
        });
        // --- assets ---
        var aRaw=raw.assets||raw.assetData||[];
        if(Array.isArray(aRaw)) aRaw.forEach(function(a,i){
            var id=trim(a.id||a.assetId||'ASSET-'+(i+1));
            out.assets.push({
                id:id, type:trim(a.type||a.assetType||'Unknown'),
                location:trim(a.location),
                condition:trim(a.condition||'Good'),
                criticality:trim(a.criticality||'Medium'),
                lastMaintenance:trim(a.lastMaintenance||'N/A'),
                riskScore:parseInt(a.riskScore||a.risk,10)||40
            });
        });
        // --- trains ---
        var trRaw=raw.trains||raw.trainSchedule||[];
        if(Array.isArray(trRaw)) trRaw.forEach(function(t,i){
            var id=trim(t.id||t.trainId||'T'+(i+1));
            var date=trim(t.date||t.day);
            if(!isDayName(date)) date='Monday';
            var start=trim(t.start||t.startTime||'00:00');
            var end=trim(t.end||t.endTime||'23:59');
            var type=trim(t.type||t.trainType||'Express');
            out.trains.push({id:id,name:trim(t.name||id),corridor:trim(t.corridor||'C1'),date:date,start:start,end:end,type:type});
        });
        // --- crew ---
        var cRaw=raw.crew||raw.crewData||[];
        if(Array.isArray(cRaw)) cRaw.forEach(function(c){
            var status=trim(c.status||'available').toUpperCase();
            if(['AVAILABLE','LIMITED','UNAVAILABLE'].indexOf(status)===-1) status='AVAILABLE';
            out.crew.push({
                name:trim(c.name||c.id||'Crew'),
                department:trim(c.department||c.dept||'Engineering'),
                status:status,
                available:parseInt(c.available,10)||0,
                required:parseInt(c.required,10)||1,
                corridor:trim(c.corridor||''),
                currentBlock:trim(c.currentBlock||c.current),
                subStatus:trim(c.subStatus||''),
                skills:Array.isArray(c.skills)?c.skills:(c.skills?String(c.skills).split(',').map(trim):[])
            });
        });
        // --- equipment ---
        var eRaw=raw.equipment||raw.equipmentData||[];
        if(Array.isArray(eRaw)) eRaw.forEach(function(e){
            var status=trim(e.status||'AVAILABLE').toUpperCase();
            if(['AVAILABLE','LIMITED','UNAVAILABLE','RESERVED'].indexOf(status)===-1) status='AVAILABLE';
            out.equipment.push({
                name:trim(e.name||e.id||'Equipment'),
                department:trim(e.department||e.dept||'Engineering'),
                corridor:trim(e.corridor||''),
                available:parseInt(e.available,10)||0,
                required:parseInt(e.required,10)||1,
                status:status,
                assignedBlock:trim(e.assignedBlock||e.assigned||'')
            });
        });
        // --- blocks ---
        var bRaw=raw.blocks||raw.blockData||raw.blockDataMap||{};
        var bArr=Array.isArray(bRaw)?bRaw:Object.keys(bRaw).map(function(k){var v=deepClone(bRaw[k]);v.id=k;return v;});
        bArr.forEach(function(b,i){
            var id=trim(b.id||b.blockId||'B-'+(100+i));
            var startTime=trim(b.startTime||b.start);
            var endTime=trim(b.endTime||b.end);
            if((!isNum(timeToMin(startTime))||!isNum(timeToMin(endTime)))&&trim(b.window||'')){
                var wm=trim(b.window).match(/(\d{1,2}:\d{2})\s*[-–—]\s*(\d{1,2}:\d{2})/);
                if(wm){
                    if(!isNum(timeToMin(startTime))) startTime=wm[1];
                    if(!isNum(timeToMin(endTime))) endTime=wm[2];
                }
            }
            if(!isNum(timeToMin(startTime))) startTime='06:00';
            if(!isNum(timeToMin(endTime))){
                var endMin0=(timeToMin(startTime)+120)%1440;
                endTime=fmtTime(endMin0);
            }
            if(isNum(timeToMin(endTime))&&isNum(timeToMin(startTime))&&timeToMin(endTime)<=timeToMin(startTime))
                endTime=fmtTime((timeToMin(startTime)+120)%1440);
            var corridor=trim(b.corridor||'C1');
            var date=trim(b.date||b.day);
            if(!isDayName(date)) date='Monday';
            var startMin=timeToMin(startTime), endMin=timeToMin(endTime);
            if(endMin<=startMin) endMin=startMin+120;
            var windowMins=endMin-startMin;
            var durationH=+(windowMins/60).toFixed(1);
            var utilization=parseInt(b.utilization,10);if(isNaN(utilization)||utilization<0) utilization=75;if(utilization>100) utilization=100;
            var from=trim(b.from||b.fromStation);
            if(!from) from='Station '+corridor+'-A';
            var to=trim(b.to||b.toStation);
            if(!to) to='Station '+corridor+'-C';
            out.blocks[id]={
                id:id, corridor:corridor, date:date,
                startTime:startTime, endTime:endTime,
                window:windowMins+' min',
                duration:durationH+'h',
                utilization:utilization,
                type:trim(b.type||b.workType||'Maintenance'),
                reason:trim(b.reason||b.description||''),
                priority:trim(b.priority||''),
                requiredCrew:parseInt(b.requiredCrew,10)||3,
                availableCrew:parseInt(b.availableCrew,10)||3,
                requiredEquip:parseInt(b.requiredEquip,10)||1,
                equipmentStatus:trim(b.equipmentStatus||''),
                track:trim(b.track||''),
                from:from, to:to,
                maintenanceType:trim(b.maintenanceType||b.type||''),
                tasks:Array.isArray(b.tasks)?b.tasks:[],
                status:trim(b.status||'')
            };
        });
        return out;
    }

    /* ---------- validate ---------- */
    function diValidate(b){
        var counts={tasks:0,assets:0,trains:0,resources:0,blocks:0};
        var issues=[];
        Object.keys(b.tasks||{}).forEach(function(id){
            var t=b.tasks[id]; counts.tasks++;
            if(!trim(t.title)) issues.push({t:'tasks',row:'—',id:id,msg:'Missing Task Description'});
            if(!trim(t.department)) issues.push({t:'tasks',row:'—',id:id,msg:'Missing Department'});
            if(!trim(t.duration)) issues.push({t:'tasks',row:'—',id:id,msg:'Missing Task Duration'});
            if(!/^(CRITICAL|HIGH|MEDIUM|LOW)$/i.test(t.priority)) issues.push({t:'tasks',row:'—',id:id,msg:'Invalid Priority "'+t.priority+'"'});
        });
        (b.assets||[]).forEach(function(a,i){
            counts.assets++;
            var row=i+2;
            if(!trim(a.id)) issues.push({t:'assets',row:row,id:'',msg:'Missing Asset ID'});
            if(!trim(a.type)) issues.push({t:'assets',row:row,id:a.id,msg:'Missing Asset Type'});
            if(!trim(a.location)) issues.push({t:'assets',row:row,id:a.id,msg:'Missing Location'});
        });
        (b.trains||[]).forEach(function(t,i){
            counts.trains++;
            var row=i+2;
            if(!trim(t.id)) issues.push({t:'trains',row:row,id:'',msg:'Missing Train ID'});
            if(!trim(t.corridor)) issues.push({t:'trains',row:row,id:t.id,msg:'Missing Corridor'});
            if(!isDayName(t.date)) issues.push({t:'trains',row:row,id:t.id,msg:'Invalid Day "'+t.date+'"'});
            if(isNaN(timeToMin(t.start))) issues.push({t:'trains',row:row,id:t.id,msg:'Invalid Start Time "'+t.start+'"'});
            if(isNaN(timeToMin(t.end))) issues.push({t:'trains',row:row,id:t.id,msg:'Invalid End Time "'+t.end+'"'});
        });
        (b.crew||[]).forEach(function(c,i){
            counts.resources++;
            var row=i+2;
            if(!trim(c.name)) issues.push({t:'resources',row:row,id:'',msg:'Missing Crew Name'});
            if(!trim(c.department)) issues.push({t:'resources',row:row,id:c.name,msg:'Missing Department'});
            if(isNaN(parseInt(c.available,10))) issues.push({t:'resources',row:row,id:c.name,msg:'Missing Available Count'});
        });
        (b.equipment||[]).forEach(function(e,i){
            counts.resources++;
            var row=i+2;
            if(!trim(e.name)) issues.push({t:'resources',row:row,id:'',msg:'Missing Equipment Name'});
            if(!/^(AVAILABLE|LIMITED|UNAVAILABLE|RESERVED)$/i.test(e.status)) issues.push({t:'resources',row:row,id:e.name,msg:'Invalid Status "'+e.status+'"'});
        });
        Object.keys(b.blocks||{}).forEach(function(id){
            var bl=b.blocks[id]; counts.blocks++;
            if(!trim(bl.corridor)) issues.push({t:'blocks',row:'—',id:id,msg:'Missing Corridor'});
            if(isNaN(timeToMin(bl.startTime))) issues.push({t:'blocks',row:'—',id:id,msg:'Invalid Start Time'});
            if(isNaN(timeToMin(bl.endTime))) issues.push({t:'blocks',row:'—',id:id,msg:'Invalid End Time'});
        });
        return {counts:counts,issues:issues,status:issues.length?'NEEDS ATTENTION':'VALID'};
    }

    /* ---------- preview rendering ---------- */
    var tabMeta={tasks:{label:'Tasks',cols:['ID','Description','Priority','Department','Corridor','Duration','Due']},
                 assets:{label:'Assets',cols:['ID','Type','Location','Condition','Criticality','Risk']},
                 trains:{label:'Trains',cols:['ID','Corridor','Day','Start','End','Type']},
                 resources:{label:'Resources',cols:['Name','Department','Status','Avail.','Req.','Corridor']},
                 blocks:{label:'Blocks',cols:['ID','Corridor','Day','Start','End','Util.','Type']}};
    function previewRows(tab){
        var b=S.bundle;if(!b) return [];
        if(tab==='tasks') return Object.keys(b.tasks).map(function(id){var t=b.tasks[id];return [id,t.title.split(' · ')[1]||t.title,t.priority,t.department,t.corridor,t.duration,t.due];});
        if(tab==='assets') return (b.assets||[]).map(function(a){return [a.id,a.type,a.location,a.condition,a.criticality,a.riskScore];});
        if(tab==='trains') return (b.trains||[]).map(function(t){return [t.id,t.corridor,t.date,t.start,t.end,t.type];});
        if(tab==='resources'){
            var rows=[];(b.crew||[]).forEach(function(c){rows.push([c.name,c.department,c.status,c.available,c.required,c.corridor||'']);});
            (b.equipment||[]).forEach(function(e){rows.push([e.name,e.department,e.status,e.available,e.required,e.corridor||'']);});
            return rows;
        }
        if(tab==='blocks') return Object.keys(b.blocks).map(function(id){var bl=b.blocks[id];return [id,bl.corridor,bl.date,bl.startTime,bl.endTime,bl.utilization+'%',bl.type];});
        return [];
    }
    function renderPreview(){
        var tab=S.previewTab||'tasks';
        var meta=tabMeta[tab];if(!meta) return;
        var rows=previewRows(tab);
        var thead=document.getElementById('diPreviewHead');
        var tbody=document.getElementById('diPreviewBody');
        if(!thead||!tbody) return;
        thead.innerHTML=meta.cols.map(function(c){return '<th>'+c+'</th>';}).join('');
        tbody.innerHTML=rows.slice(0,10).map(function(r){
            return '<tr>'+r.map(function(c){return '<td>'+String(c==null?'':c).substring(0,40)+'</td>';}).join('')+'</tr>';
        }).join('')+(rows.length>10?'<tr><td colspan="'+meta.cols.length+'" style="text-align:center;color:var(--muted);font-weight:700;">… and '+(rows.length-10)+' more rows</td></tr>':'');
        document.getElementById('diMetaRow').textContent='Showing '+Math.min(rows.length,10)+' of '+rows.length+' '+meta.label.toLowerCase()+' records';
    }
    function renderTabs(){
        var el=document.getElementById('diTabs');if(!el) return;
        var tabs=['tasks','assets','trains','resources','blocks'];
        el.innerHTML=tabs.map(function(t){return '<button class="di-tab'+(S.previewTab===t?' active':'')+'" onclick="diPreviewTab(\''+t+'\')">'+tabMeta[t].label+'</button>';}).join('');
    }
    window.diPreviewTab=function(tab){S.previewTab=tab;renderTabs();renderPreview();};

    /* ---------- validation UI ---------- */
    function renderCounts(c){
        var el=document.getElementById('diCounts');if(!el) return;
        var items=[['Tasks',c.tasks],['Assets',c.assets],['Trains',c.trains],['Resources',c.resources],['Blocks',c.blocks]];
        el.innerHTML=items.map(function(p){return '<div class="di-count"><b>'+p[1]+'</b><span>'+p[0]+'</span></div>';}).join('');
    }
    function renderValidation(){
        var v=S.validation;if(!v) return;
        renderCounts(v.counts);
        var ok=document.getElementById('diStatusBadge');
        var warn=document.getElementById('diStatusBadgeWarn');
        var issueBtn=document.getElementById('diIssuesToggle');
        var issueCount=document.getElementById('diIssuesCount');
        ok.style.display=v.status==='VALID'?'inline-flex':'none';
        warn.style.display=v.status==='NEEDS ATTENTION'?'inline-flex':'none';
        if(v.issues.length){
            issueBtn.style.display='inline-flex';
            issueCount.textContent=v.issues.length;
            var box=document.getElementById('diIssuesBox');
            box.innerHTML='<b style="font-size:12px;color:#fbbf24;">Issues ('+v.issues.length+')</b>'+v.issues.map(function(iss){
                var rowStr=iss.row!=='—'?'Row '+iss.row:'—';
                return '<div class="row"><span class="rowno">['+iss.t.charAt(0).toUpperCase()+iss.t.slice(1)+' · '+rowStr+(iss.id?' · '+iss.id:'')+']</span> '+iss.msg+'</div>';
            }).join('');
            box.style.display='none';
        } else {
            issueBtn.style.display='none';
            document.getElementById('diIssuesBox').style.display='none';
        }
    }
    window.diToggleIssues=function(){
        var box=document.getElementById('diIssuesBox');
        box.style.display=box.style.display==='none'?'block':'none';
    };

    /* ---------- source indicator ---------- */
    function diSetSource(label,importedAt){
        var lbl=label||'Synthetic Demo Dataset';
        var el=document.getElementById('diSourceLabel');if(el) el.textContent=lbl;
        var meta=document.getElementById('diSourceMeta');if(meta) meta.textContent='Data source · '+lbl+' · last imported — '+(importedAt?new Date(importedAt).toLocaleString():'—');
        try{localStorage.setItem('aiabps_datasource',JSON.stringify({label:lbl,importedAt:importedAt||null}));}catch(e){}
    }
    window.diRestoreSource=function(){
        try{var raw=localStorage.getItem('aiabps_datasource');if(raw){var d=JSON.parse(raw);diSetSource(d.label,d.importedAt);return;}}catch(e){}
        diSetSource('Synthetic Demo Dataset',null);
    };

    /* ---------- synthetic demo asset builder ---------- */
    function demoAssets(){
        var assets=[];var idx=1;
        var corrAssets=[
            {type:'Track Section',dept:'Engineering',cond:'Good',crit:'High',risk:72},
            {type:'Points & Crossings',dept:'Engineering',cond:'Fair',crit:'Medium',risk:55},
            {type:'Signal System',dept:'S&T',cond:'Good',crit:'Critical',risk:68},
            {type:'OHE Equipment',dept:'Traction',cond:'Fair',crit:'Medium',risk:50}
        ];
        KNOWN_CORRIDORS.forEach(function(corridor){
            corrAssets.forEach(function(ca){
                var fromStation='S'+corridor.slice(1)+'-A';
                var toStation='S'+corridor.slice(1)+'-C';
                assets.push({
                    id:'A-'+(idx<10?'0':'')+idx,
                    type:ca.type,
                    location:corridor+' ('+fromStation+' → '+toStation+')',
                    condition:ca.cond,
                    criticality:ca.crit,
                    lastMaintenance:'45 days ago',
                    riskScore:ca.risk
                });
                idx++;
            });
        });
        return assets;
    }

    /* ---------- load bundle (validation + preview) ---------- */
    function demoBundle(){
        return {
            tasks: DEMO_SNAPSHOT.tasks,
            trains: DEMO_SNAPSHOT.trains,
            crew: DEMO_SNAPSHOT.crew,
            equipment: DEMO_SNAPSHOT.equipment,
            blocks: DEMO_SNAPSHOT.blocks,
            assets: demoAssets()
        };
    }
    window.diLoadSyntheticDemo=function(){
        diLoadBundle(demoBundle(),'Synthetic Demo Dataset');
    };
    window.diDemoBundle=demoBundle;
    window.diLoadBundle=function(raw,label){
        S.bundle=normBundle(raw);
        S.validation=diValidate(S.bundle);
        S.previewTab='tasks';
        document.getElementById('diPipeline').style.display='block';
        document.getElementById('diDoneBox').style.display='none';
        document.getElementById('diShim').classList.remove('on');
        document.getElementById('diImportBtn').disabled=false;
        renderValidation();
        renderTabs();
        renderPreview();
        if(label) diSetSource(label,null);
        showToast('Dataset validated — '+S.validation.status,'info');
    };

    /* ---------- file handling ---------- */
    function readFileAsText(file,cb){
        var reader=new FileReader();
        reader.onload=function(){cb(reader.result);};
        reader.onerror=function(){showToast('File read error','error');};
        reader.readAsText(file);
    }
    window.diHandleFile=function(input){
        if(!input||!input.files||!input.files[0]) return;
        var file=input.files[0];
        var ext=(file.name||'').split('.').pop().toLowerCase();
        if(ext==='xlsx'||ext==='xls'){
            showToast('Excel files — save as CSV and upload','error');return;
        }
        readFileAsText(file,function(text){
            var raw=null;
            if(ext==='json'){
                try{raw=JSON.parse(text);}catch(e){showToast('Invalid JSON','error');return;}
            } else {
                var rows=parseCSV(text);
                if(!rows.length){showToast('CSV is empty','error');return;}
                raw={tasks:rows};
            }
            diLoadBundle(raw,file.name);
        });
    };
    window.diParseCsv=function(text){return parseCSV(text);};
    window.diImportViaFile=function(file){diHandleFile({files:[file]});};
    window.diPickFile=function(){document.getElementById('diFileInput').click();};

    /* ---------- apply bundle to live app state ---------- */
    function applyBundle(){
        if(!S.bundle) return null;
        var b=S.bundle;
        // rebuild taskData
        Object.keys(taskData).forEach(function(k){try{delete taskData[k];}catch(e){}});
        Object.keys(b.tasks).forEach(function(k){taskData[k]=b.tasks[k];});
        // rebuild blockData
        Object.keys(blockData).forEach(function(k){try{delete blockData[k];}catch(e){}});
        Object.keys(b.blocks).forEach(function(k){blockData[k]=b.blocks[k];});
        // rebuild trainSchedule
        trainSchedule.length=0;
        (b.trains||[]).forEach(function(t){trainSchedule.push(t);});
        // rebuild crewData
        crewData.length=0;
        (b.crew||[]).forEach(function(c){crewData.push(c);});
        // rebuild equipmentData
        equipmentData.length=0;
        (b.equipment||[]).forEach(function(e){equipmentData.push(e);});
        // rebuild state.tasks + state.blocks
        state.tasks=Object.keys(taskData).map(function(k){
            var t=deepClone(taskData[k]);t.id=k;return t;
        });
        state.blocks=Object.keys(blockData).map(function(k){
            return normalizeBlock(Object.assign(deepClone(blockData[k]),{id:k}));
        });
        state.assets=b.assets||[];
        // prune approvals for blocks that no longer exist
        var liveBlockIds=state.blocks.map(function(b){return b.id;});
        Object.keys(state.approvals).forEach(function(id){
            if(liveBlockIds.indexOf(id)===-1) delete state.approvals[id];
        });
        saveBlocksToStorage();
        saveApprovalsToStorage();
        // reset what-if / demo state to avoid stale clones referencing old data
        try{whatIfOriginal=null;whatIfModified=null;whatIfLastResult=null;whatIfCandidates=[];}catch(e){}
        try{if(typeof aiOptimizationReset==='function') aiOptimizationReset();}catch(e){}
        try{document.getElementById('whatifResultsPanel').style.display='none';}catch(e){}
        try{document.getElementById('whatifComparisonPanel').style.display='none';}catch(e){}
        try{document.getElementById('whatifReoptPanel').style.display='none';}catch(e){}
        try{document.getElementById('whatifAiDemoPanel').style.display='none';}catch(e){}
        return {tasks:state.tasks.length,assets:state.assets.length,trains:trainSchedule.length,resources:crewData.length,equipment:equipmentData.length,blocks:state.blocks.length};
    }
    function refreshAllViewsAfterImport(){
        try{refreshBlockViews();}catch(e){}
        try{renderTaskTable();}catch(e){}
        try{renderKanban();}catch(e){}
        try{renderWeeklySchedule();}catch(e){}
        try{renderMonthlyPlan();}catch(e){}
        try{renderGantt();}catch(e){}
        try{renderResourcesPage();}catch(e){}
        try{renderConflictCenter();}catch(e){}
        try{renderApprovalCenter();}catch(e){}
        try{renderAuditLog();}catch(e){}
        try{refreshDashboardMetrics();}catch(e){}
        try{renderMetricsTable();}catch(e){}
        try{renderTodayTimeline();}catch(e){}
        try{renderTopRecommendation();}catch(e){}
        try{renderLiveAlerts();}catch(e){}
        try{renderAISteps();}catch(e){}
        try{renderAIExplanation();}catch(e){}
        try{renderBundlingLogic();}catch(e){}
        try{if(window.netopsRefreshMap) window.netopsRefreshMap();}catch(e){}
        try{if(window.lucide) lucide.createIcons();}catch(e){}
    }

    /* ---------- import button ---------- */
    window.diImportDataset=function(){
        if(!S.bundle) return;
        document.getElementById('diImportBtn').disabled=true;
        document.getElementById('diShim').classList.add('on');
        document.getElementById('diDoneBox').style.display='none';
        setTimeout(function(){
            var counts=applyBundle();
            if(!counts){showToast('Import failed — invalid dataset','error');document.getElementById('diImportBtn').disabled=false;document.getElementById('diShim').classList.remove('on');return;}
            refreshAllViewsAfterImport();
            S.imported=true;
            addAudit('import','Dataset imported via Data & Integration',S.validation?S.validation.status:'VALID','',false);
            addNotification('Dataset imported — '+counts.tasks+' tasks, '+counts.assets+' assets, '+counts.trains+' trains, '+counts.resources+' resources');
            showToast('Import complete — '+counts.tasks+' tasks, '+counts.assets+' assets, '+counts.trains+' trains, '+counts.resources+' resources','success');
            document.getElementById('diShim').classList.remove('on');
            document.getElementById('diDoneBox').style.display='flex';
            document.getElementById('diDoneMeta').textContent=counts.tasks+' Tasks · '+counts.assets+' Assets · '+counts.trains+' Trains · '+counts.resources+' Resources';
            diSetSource(document.getElementById('diSourceLabel').textContent||'Imported Dataset',new Date().toISOString());
        },700);
    };

    /* ---------- analyze with AI-ABPS ---------- */
    window.diAnalyzeImported=function(){
        aiProcess('Analysing Imported Dataset',[
            'Apply AI priority scoring across all tasks',
            'Compute suitability index for every block',
            'Detect scheduling conflicts',
            'Rank maintenance recommendations',
            'Finalise AI-assisted plan state'
        ],function(){
            refreshAllViewsAfterImport();
            go('dashboard');
            showToast('AI analysis complete — imported dataset ready for planning','success');
        });
    };

    /* ---------- reset to demo ---------- */
    window.diResetToDemo=function(){
        if(!DEMO_SNAPSHOT){showToast('Demo snapshot unavailable','error');return;}
        uiConfirm({
            title:'Reset to Demo Data?',
            message:'Restore the original <b>Synthetic Demo Dataset</b>? All imported/edited block, task, train and resource data will be replaced. Approvals and audit history for the current dataset will be cleared.',
            confirmLabel:'Reset to Demo Data',
            danger:true
        },function(){
            S.bundle=normBundle(demoBundle());
            applyBundle();
            refreshAllViewsAfterImport();
            diSetSource('Synthetic Demo Dataset',new Date().toISOString());
            addAudit('dataset','Dataset reset to Synthetic Demo Dataset','Prototype demo data restored','',false);
            showToast('Demo dataset restored','success');
        });
    };

    /* ---------- SIH Demo Mode support (Prompt 7) ---------- */
    // Deterministically resync the whole app to the pristine Synthetic Demo
    // Dataset. This is the fixed, reproducible starting point for SIH Demo Mode
    // (same scenario every run). It applies quietly - no confirm dialog, and no
    // audit entry is written, so the demo never pollutes the audit trail.
    window.diApplyDemoData=function(label){
        if(!DEMO_SNAPSHOT) return null;
        S.bundle=normBundle(demoBundle());
        var c=applyBundle();
        refreshAllViewsAfterImport();
        diSetSource(label||'Synthetic Demo Dataset', null);
        return c;
    };
    // Snapshot of the live working data (bundle + approvals + audit + source
    // label) so SIH Demo Mode can restore the user's data untouched on exit.
    window.diSnapshotLive=function(){
        var el=document.getElementById('diSourceLabel');
        // The Data & Integration scratchpad (S.bundle) is only populated once an
        // import or demo-apply runs. On a pristine load the live working dataset
        // IS the canonical demo bundle, so snapshot that instead of null so that
        // restore always has something valid to bring back.
        var bundle=S.bundle || normBundle(demoBundle());
        return {
            bundle: deepClone(bundle),
            approvals: deepClone(state.approvals||{}),
            audit: deepClone(state.auditRecords||[]),
            sourceLabel:el?el.textContent:'Synthetic Demo Dataset'
        };
    };
    // Restore a snapshot produced by diSnapshotLive() back into the live app.
    // Used by SIH Demo Mode exit / Reset to return the user's dataset unharmed.
    window.diRestoreLive=function(snap){
        if(!snap||!snap.bundle) return false;
        S.bundle=snap.bundle;
        applyBundle();
        refreshAllViewsAfterImport();
        try{state.approvals=deepClone(snap.approvals||{});}catch(e){}
        try{state.auditRecords=deepClone(snap.audit||[]);}catch(e){}
        try{if(typeof saveApprovalsToStorage==='function')saveApprovalsToStorage();}catch(e){}
        try{if(typeof renderApprovalCenter==='function')renderApprovalCenter();}catch(e){}
        try{if(typeof saveAuditToStorage==='function')saveAuditToStorage();}catch(e){}
        try{if(typeof renderAuditLog==='function')renderAuditLog();}catch(e){}
        try{if(typeof refreshBlockViews==='function')refreshBlockViews();}catch(e){}
        diSetSource(snap.sourceLabel||'Synthetic Demo Dataset', null);
        return true;
    };

    /* ---------- open settings panel from external entry points ---------- */
    window.openDataIntegration=function(){
        try{go('settings');}catch(e){}
        setTimeout(function(){
            var panel=document.getElementById('dataIntegrationPanel');
            if(panel){panel.scrollIntoView({behavior:'smooth',block:'center'});panel.style.boxShadow='0 0 0 3px rgba(124,77,255,.45)';setTimeout(function(){panel.style.boxShadow='none';},1500);}
        },120);
    };

})();
// ---- Chart.js global polish ----
(function(){
    if(!window.Chart) return;
    try{
        Chart.defaults.font.family = 'Inter, sans-serif';
        Chart.defaults.font.size = 11;
        Chart.defaults.animation = { duration: 500, easing: 'easeOutQuart' };
        if(Chart.defaults.plugins && Chart.defaults.plugins.tooltip){
            Chart.defaults.plugins.tooltip.backgroundColor = '#1e293b';
            Chart.defaults.plugins.tooltip.padding = 12;
            Chart.defaults.plugins.tooltip.cornerRadius = 8;
            Chart.defaults.plugins.tooltip.titleColor = '#ffffff';
            Chart.defaults.plugins.tooltip.bodyColor = '#cbd5e1';
        }
    }catch(e){}
// ================= NETWORK OPERATIONS (CONTROL ROOM) =================
// Geographic overlay dataset. The map is drawn on a real satellite basemap that
// mirrors the Kharagpur Junction (South Eastern Railway) yard area. Station and
// corridor coordinates are real lat/lng taken from the visible railway alignment,
// so the synthetic overlay rides on, not over, the real geography. All identity,
// planning and traffic data below remain synthetic demo data — not operational
// authority.
var networkDemo = {
    label: 'Kharagpur Jn · South Eastern Railway',
    sat: { lng0: 87.32041, lat0: 22.33885, lonSpan: 0.030 },
    stations: [
        { id: 'S1-A', lat: 22.34090, lng: 87.30696 },
        { id: 'S1-B', lat: 22.33994, lng: 87.32500 },
        { id: 'S1-C', lat: 22.34165, lng: 87.33124 },
        { id: 'S2-A', lat: 22.33548, lng: 87.31130 },
        { id: 'S2-B', lat: 22.33868, lng: 87.31988 },
        { id: 'S2-C', lat: 22.34010, lng: 87.32496 },
        { id: 'S3-A', lat: 22.33637, lng: 87.31403 },
        { id: 'S3-B', lat: 22.33861, lng: 87.31951 },
        { id: 'S3-C', lat: 22.34043, lng: 87.32665 },
        { id: 'S4-A', lat: 22.34064, lng: 87.32869 },
        { id: 'S4-B', lat: 22.34221, lng: 87.33386 }
    ],
    corridors: [
        { id: 'C1', color: '#38bdf8', stations: ['S1-A', 'S1-B', 'S1-C'], coordinates: [[22.3409,87.30696],[22.34058,87.30875],[22.34026,87.31054],[22.33993,87.31232],[22.33961,87.31411],[22.33929,87.3159],[22.33897,87.31769],[22.33905,87.31813],[22.33911,87.31851],[22.3392,87.31926],[22.3393,87.31992],[22.33936,87.32041],[22.34018,87.32471],[22.3403,87.32532],[22.34112,87.32945],[22.34133,87.33025],[22.34165,87.33124]] },
        { id: 'C2', color: '#34d399', stations: ['S2-A', 'S2-B', 'S2-C'], coordinates: [[22.33548,87.3113],[22.33573,87.31289],[22.33611,87.31456],[22.33625,87.31526],[22.33652,87.31607],[22.33698,87.3171],[22.33755,87.3184],[22.33773,87.31872],[22.33855,87.3197],[22.33889,87.32024],[22.3392,87.32097],[22.33966,87.3232],[22.3398,87.3237],[22.33996,87.32446],[22.3401,87.32496]] },
        { id: 'C3', color: '#fbbf24', stations: ['S3-A', 'S3-B', 'S3-C'], coordinates: [[22.33637,87.31403],[22.3366,87.31455],[22.33693,87.31531],[22.3374,87.31632],[22.33794,87.31757],[22.3383,87.31847],[22.33843,87.31885],[22.33858,87.31939],[22.3388,87.31987],[22.33922,87.32073],[22.33931,87.32103],[22.33943,87.32154],[22.33982,87.32357],[22.3401,87.32496],[22.34043,87.32665]] },
        { id: 'C4', color: '#a78bfa', stations: ['S2-C', 'S4-A', 'S4-B'], coordinates: [[22.3401,87.32496],[22.34054,87.32469],[22.34065,87.32526],[22.34097,87.32683],[22.34144,87.32926],[22.34159,87.33029],[22.34165,87.33088],[22.34169,87.3312],[22.34183,87.33201],[22.3419,87.33238],[22.34221,87.33386]] }
    ],
    blocks: [
        { id: 'B-041', corridor: 'C2', from: 'S2-A', to: 'S2-B' },
        { id: 'B-042', corridor: 'C1', from: 'S1-A', to: 'S1-B' },
        { id: 'B-043', corridor: 'C3', from: 'S3-A', to: 'S3-B' },
        { id: 'B-045', corridor: 'C2', from: 'S2-B', to: 'S2-C' },
        { id: 'B-046', corridor: 'C3', from: 'S3-B', to: 'S3-C' },
        { id: 'B-047', corridor: 'C4', from: 'S2-C', to: 'S4-A' },
        { id: 'B-048', corridor: 'C1', from: 'S1-B', to: 'S1-C' },
        { id: 'B-049', corridor: 'C2', from: 'S2-B', to: 'S2-C' },
        { id: 'B-050', corridor: 'C4', from: 'S4-A', to: 'S4-B' }
    ]
};
(function(){
    networkDemo.coordinates = {};
    var sl = {};
    networkDemo.stations.forEach(function(s){ sl[s.id] = [s.lat, s.lng]; });
    networkDemo.corridors.forEach(function(c){
        if(!c.coordinates || !c.coordinates.length) c.coordinates = c.stations.map(function(id){ return sl[id]; });
    });
    networkDemo.blocks.forEach(function(b){ b.coordinates = [sl[b.from], sl[b.to]]; });
})();
(function(){
if(!document.getElementById('netopsApp')) return;

var NET = {
    w: 1200, h: 740,
    reduced: !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches),
    st: {},
    geo: (function(){ var g = {}; (networkDemo.stations || []).forEach(function(s){ g[s.id] = [s.lat, s.lng]; }); return g; })(),
    chain: { C1: ['S1-A', 'S1-B', 'S1-C'], C2: ['S2-A', 'S2-B', 'S2-C'], C3: ['S3-A', 'S3-B', 'S3-C'], C4: ['S2-C', 'S4-A', 'S4-B'] },
    color: { C1:'#38bdf8', C2:'#34d399', C3:'#fbbf24', C4:'#a78bfa' },
    depot: { 'S1-B':true, 'S2-B':true, 'S3-B':true, 'S4-B':true },
    place: { 'B-041':{c:'C2',leg:0,lane:0}, 'B-042':{c:'C1',leg:0,lane:0}, 'B-043':{c:'C3',leg:0,lane:0}, 'B-045':{c:'C2',leg:1,lane:0}, 'B-046':{c:'C3',leg:1,lane:0}, 'B-047':{c:'C4',leg:0,lane:0}, 'B-048':{c:'C1',leg:1,lane:0}, 'B-049':{c:'C2',leg:1,lane:1}, 'B-050':{c:'C4',leg:1,lane:0} },
    band: {},
    view: { k: 1, tx: 0, ty: 0 },
    wired: false
};

function r1(n){ return Math.round(n * 10) / 10; }
function noHexRgba(hex, a){
    var c = String(hex || '#38bdf8').replace('#', '');
    if(c.length === 3) c = c.split('').map(function(x){ return x + x; }).join('');
    var n = parseInt(c, 16);
    if(isNaN(n)) n = 0x38bdf8;
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}
function noCR(pts){
    var d = 'M' + pts[0][0] + ',' + pts[0][1];
    for(var i = 0; i < pts.length - 1; i++){
        var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
        var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
        var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += 'C' + r1(c1x) + ',' + r1(c1y) + ' ' + r1(c2x) + ',' + r1(c2y) + ' ' + r1(p2[0]) + ',' + r1(p2[1]);
    }
    return d;
}
function noPathFor(c){
    if(NET.wired && NET.wired[c] && NET.wired[c].length) return noCR(NET.wired[c]);
    var pts = NET.chain[c].map(function(s){ return NET.st[s]; });
    return noCR(pts);
}
function netProject(){
    var out = {}, wired = {}, i, s, c, stList = networkDemo.stations || [], crList = networkDemo.corridors || [];
    var cosLat = Math.cos(SAT.lat0 * Math.PI / 180);
    var yPerDeg = 1200 / (SAT.lonSpan * cosLat);
    for(i = 0; i < stList.length; i++){
        s = stList[i];
        out[s.id] = [ r1(600 + (s.lng - SAT.lng0) / SAT.lonSpan * 1200),
                       r1(370 + (SAT.lat0 - s.lat) * yPerDeg) ];
    }
    for(i = 0; i < crList.length; i++){
        c = crList[i];
        if(c.coordinates && c.coordinates.length){
            wired[c.id] = c.coordinates.map(function(p){
                return [ r1(600 + (p[1] - SAT.lng0) / SAT.lonSpan * 1200),
                         r1(370 + (SAT.lat0 - p[0]) * yPerDeg) ];
            });
        }
    }
    NET.wired = wired;
    return out;
}
function noLeg(a, b){
    var p1 = NET.st[a], p2 = NET.st[b];
    var dx = p2[0] - p1[0], dy = p2[1] - p1[1];
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var deg = Math.atan2(dy, dx) * 180 / Math.PI;
    var ux = -dy / len, uy = dx / len;
    return { p1: p1, p2: p2, len: len, deg: deg, ux: ux, uy: uy };
}
function noBlocks(){
    if(typeof state !== 'undefined' && state.blocks && state.blocks.length) return state.blocks;
    var out = [];
    if(typeof blockData !== 'undefined'){
        Object.keys(blockData).forEach(function(id){ out.push(normalizeBlock(Object.assign({ id: id }, blockData[id]))); });
    }
    return out;
}
function noGetBlock(id){
    var b = (typeof getBlockById === 'function') ? getBlockById(id) : null;
    if(b) return b;
    if(typeof blockData !== 'undefined' && blockData[id]) return normalizeBlock(Object.assign({ id: id }, blockData[id]));
    return null;
}
function noTrains(){
    if(typeof trainSchedule !== 'undefined' && trainSchedule.length) return trainSchedule;
    return [];
}
function noCorridorConflicts(c, blocks){
    var nc = 0;
    blocks.forEach(function(b){
        if(b.corridor !== c) return;
        var cf = (typeof analyzeBlockConflicts === 'function') ? analyzeBlockConflicts(b) : null;
        if(cf && cf.hasConflict) nc++;
    });
    return nc;
}

// (satellite basemap provided separately via #noSat/Leaflet overlay)
// ---------------- render: map ----------------
function noBuild(){
    var layer = document.getElementById('noLayer');
    if(!layer) return;
    var defs = document.getElementById('noDefs');
    if(!defs) return;
    var app = document.getElementById('netopsApp');
    NET.st = netProject();
    var order = ['C1', 'C2', 'C3', 'C4'];
    var html = '', i, c;

    var defHtml = '';
    order.forEach(function(cv){
        defHtml += '<path id="noPath' + cv + '" d="' + noPathFor(cv) + '"></path>';
    });
    defs.innerHTML = defHtml;

    // corridors
    order.forEach(function(cv){
        var col = NET.color[cv];
        var ch = NET.chain[cv];
        var d = noPathFor(cv);
        html += '<path class="no-railbed" d="' + d + '" stroke="rgba(8,12,16,.92)" stroke-width="9" fill="none" stroke-linecap="round"></path>';
        html += '<path class="no-corline" d="' + d + '" stroke="' + col + '" stroke-width="2.6" opacity="0.96" fill="none" stroke-linecap="round"></path>';
        html += '<path class="no-rail" d="' + d + '" stroke="rgba(255,255,255,.28)" stroke-width="1" fill="none" stroke-linecap="round" stroke-dasharray="11 13"></path>';
        html += '<path class="no-corhit" data-no="corridor:' + cv + '" d="' + d + '"></path>';
        for(i = 0; i < ch.length - 1; i++){
            var leg = noLeg(ch[i], ch[i + 1]);
            var mx = (leg.p1[0] + leg.p2[0]) / 2, my = (leg.p1[1] + leg.p2[1]) / 2;
            html += '<path class="no-corarrow" data-no="corridor:' + cv + '" transform="translate(' + r1(mx) + ' ' + r1(my) + ') rotate(' + r1(leg.deg) + ')" d="M0 -4.5 L7 0 L0 4.5 Z"></path>';
        }
    });

    // blocks
    var blocks = noBlocks();
    NET.band = {};
    blocks.forEach(function(b){
        if(!b || !b.id) return;
        var pl = NET.place[b.id] || { c: b.corridor || 'C1', leg: 0, lane: 0 };
        var ch = NET.chain[pl.c];
        if(!ch || !ch[pl.leg] || !ch[pl.leg + 1]) return;
        var leg = noLeg(ch[pl.leg], ch[pl.leg + 1]);
        var off = pl.lane === 1 ? -38 : 34;
        var cx = (leg.p1[0] + leg.p2[0]) / 2 + leg.ux * off;
        var cy = (leg.p1[1] + leg.p2[1]) / 2 + leg.uy * off;
        NET.band[b.id] = { x: cx, y: cy, corr: pl.c };
        var col = NET.color[pl.c] || '#94a3b8';
        var cf = (typeof analyzeBlockConflicts === 'function') ? analyzeBlockConflicts(b) : { hasConflict: false, hasCritical: false };
        var hasConf = !!(cf.hasConflict), hasCrit = !!(cf.hasCritical);
        var fill = noHexRgba(col, hasConf ? 0.32 : 0.2);
        var stroke = (hasConf || hasCrit) ? '#f87171' : col;
        html += '<g class="no-blockgrp" data-no="block:' + b.id + '" transform="translate(' + Math.round(cx) + ' ' + Math.round(cy) + ') rotate(' + r1(leg.deg) + ')">'
            + '<rect x="' + Math.round(-leg.len / 2) + '" y="-10" width="' + Math.round(leg.len) + '" height="20" rx="10" class="no-blockb' + (hasConf ? ' no-confb' : '') + '" data-no="block:' + b.id + '" fill="' + fill + '" stroke="' + stroke + '"></rect>'
            + '<text x="0" y="-18" transform="rotate(' + Math.round(-leg.deg) + ')" class="no-blklabel" data-no="block:' + b.id + '">' + b.id + '</text>'
            + '</g>';
        if(hasConf){
            var mx = cx + leg.ux * 32, my = cy + leg.uy * 32;
            html += '<g class="no-confmark" data-no="conflict:' + b.id + '">'
                + '<circle cx="' + r1(mx) + '" cy="' + r1(my) + '" r="12" class="no-halo" fill="rgba(248,113,113,.25)" stroke="rgba(248,113,113,.55)" stroke-width="1"></circle>'
                + '<circle cx="' + r1(mx) + '" cy="' + r1(my) + '" r="7" fill="#f87171" stroke="#ffffff" stroke-width="1.5"></circle>'
                + '<path d="M' + r1(mx) + ' ' + r1(my - 3.5) + ' v5" stroke="#ffffff" stroke-width="2" stroke-linecap="round"></path>'
                + '<circle cx="' + r1(mx) + '" cy="' + r1(my + 3) + '" r="1.3" fill="#ffffff"></circle>'
                + '</g>';
        }
    });

    // stations
    Object.keys(NET.st).forEach(function(s){
        var p = NET.st[s];
        var corrs = [];
        Object.keys(NET.chain).forEach(function(cv){ if(NET.chain[cv].indexOf(s) >= 0) corrs.push(cv); });
        var mainCol = NET.color[corrs[0]] || '#64748b';
        var isInter = corrs.length > 1;
        var dep = !!NET.depot[s];
        var R = isInter ? 13 : 10;
        html += '<g class="no-station" data-no="station:' + s + '" style="cursor:pointer">'
            + '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (R + 4) + '" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="1.5" data-no="station:' + s + '"></circle>'
            + '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + R + '" fill="rgba(11,18,32,.97)" stroke="' + mainCol + '" stroke-width="2" data-no="station:' + s + '"></circle>'
            + (isInter ? '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (R - 6) + '" fill="none" stroke="' + mainCol + '" stroke-width="1.5" opacity="0.7"></circle>' : '')
            + '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="' + mainCol + '"></circle>'
            + '<g class="no-stlbl">'
            + '<text x="' + p[0] + '" y="' + (p[1] + (isInter ? 32 : 26)) + '" class="no-stname" data-no="station:' + s + '">' + s + '</text>'
            + (dep ? '<text x="' + p[0] + '" y="' + (p[1] + (isInter ? 46 : 40)) + '" class="no-stsub">DEPOT</text>' : '')
            + '</g>'
            + '</g>';
    });

    // trains (SMIL motion, skipped under reduced-motion)
    if(!NET.reduced){
        var trains = noTrains();
        trains.forEach(function(t, idx){
            var col = NET.color[t.corridor] || '#94a3b8';
            var dur = (8 + (idx % 4) * 1.5).toFixed(1);
            var begin = (-(1 + idx * 1.6)).toFixed(1);
            html += '<g class="no-train" data-no="train:' + t.id + '">'
                + '<g fill="' + col + '" opacity=".95">'
                + '<rect x="-15" y="-5" width="26" height="10" rx="3"></rect>'
                + '<rect x="11" y="-4" width="9" height="8" rx="2" fill="#e2e8f0"></rect>'
                + '<circle cx="-10" cy="4.5" r="2.6" fill="#0b1220"></circle>'
                + '<circle cx="-3" cy="4.5" r="2.6" fill="#0b1220"></circle>'
                + '<circle cx="4" cy="4.5" r="2.6" fill="#0b1220"></circle>'
                + '</g>'
                + '<text x="20" y="2.5" font-size="9" font-weight="700" fill="#8aa3bd">' + t.id + '</text>'
                + '<animateMotion dur="' + dur + 's" begin="' + begin + 's" repeatCount="indefinite" rotate="auto"><mpath xlink:href="#noPath' + t.corridor + '"/></animateMotion>'
                + '</g>';
        });
    }
    layer.innerHTML = html;

    noRenderPanels(blocks);
    if(window.lucide){ try { lucide.createIcons(document.getElementById('netopsApp')); } catch(e) {} }
}

// ---------------- render: side panels ----------------
function noRenderPanels(blocks){
    var i, c;
    var counts = { C1: 0, C2: 0, C3: 0, C4: 0 };
    var confs = { C1: 0, C2: 0, C3: 0, C4: 0 };
    var totalConf = 0, best = null;
    blocks.forEach(function(b){
        if(!b || !b.corridor) return;
        counts[b.corridor] = (counts[b.corridor] || 0) + 1;
        var cf = (typeof analyzeBlockConflicts === 'function') ? analyzeBlockConflicts(b) : { hasConflict: false };
        if(cf.hasConflict){
            confs[b.corridor] = (confs[b.corridor] || 0) + 1;
            totalConf++;
        } else {
            var u = parseInt(String(b.utilization || '0').replace('%', ''), 10) || 0;
            if(!best || u > best.u) best = { u: u, id: b.id, corr: b.corridor };
        }
    });

    // header stats
    var hs = document.getElementById('noHeaderStats');
    if(hs){
        hs.innerHTML = ''
            + '<div class="no-stat"><b>' + noTrains().length + '</b><span>Trains</span></div>'
            + '<div class="no-stat"><b>' + blocks.length + '</b><span>Blocks</span></div>'
            + '<div class="no-stat"><b>' + Object.keys(NET.st).length + '</b><span>Stations</span></div>'
            + '<div class="no-stat"><b>' + totalConf + '</b><span>Conflicts</span></div>';
    }

    // legend
    var legend = document.getElementById('noLegend');
    if(legend){
        var lh = '';
        ['C1', 'C2', 'C3', 'C4'].forEach(function(cv){ lh += '<div class="no-leg"><i style="background:' + NET.color[cv] + '"></i>' + cv + '</div>'; });
        legend.innerHTML = lh;
    }

    // blocks panel
    var panel = document.getElementById('noBlocksPanel');
    if(panel){
        var bh = '';
        blocks.forEach(function(b){
            if(!b || !b.id) return;
            var cf = (typeof analyzeBlockConflicts === 'function') ? analyzeBlockConflicts(b) : { hasConflict: false, hasCritical: false };
            var cls = cf.hasCritical ? 'crit' : (cf.hasConflict ? 'warn' : 'ok');
            var lbl = cf.hasCritical ? 'CRITICAL' : (cf.hasConflict ? 'WARNING' : 'CLEAR');
            var col = NET.color[b.corridor] || '#94a3b8';
            bh += '<div class="no-bitem" data-no="block:' + b.id + '">'
                + '<span class="no-bdot" style="background:' + col + '"></span>'
                + '<div style="min-width:0;"><div class="no-bid">' + b.id + '</div><div class="no-bmeta">' + (b.corridor || '') + ' &middot; ' + (b.startTime || '') + '&ndash;' + (b.endTime || '') + ' &middot; ' + (b.type || '') + '</div></div>'
                + '<span class="no-bbadge ' + cls + '">' + lbl + '</span>'
                + '</div>';
        });
        panel.innerHTML = bh;
    }

    // corridor status bar
    var sb = document.getElementById('noStatusBar');
    if(sb){
        var sh = '';
        ['C1', 'C2', 'C3', 'C4'].forEach(function(cv){
            var nc = confs[cv] || 0;
            var lv = nc > 1 ? 'crit' : (nc === 1 ? 'warn' : 'ok');
            var lbl = nc > 1 ? 'CRITICAL' : (nc === 1 ? 'WARNING' : 'CLEAR');
            var col = NET.color[cv];
            sh += '<div class="no-corr" data-no="corridor:' + cv + '">'
                + '<span class="no-cbar" style="background:' + col + '"></span>'
                + '<div style="min-width:0;"><div class="no-cname">' + cv + '</div><div class="no-cmeta">' + (counts[cv] || 0) + ' blocks &middot; ' + nc + ' conflicts</div></div>'
                + '<span class="no-cleve ' + lv + '">' + lbl + '</span>'
                + '</div>';
        });
        sb.innerHTML = sh;
    }

    // AI insight
    var insight = document.getElementById('noInsight');
    if(insight){
        var txt;
        if(totalConf === 0){
            txt = 'AI Insight: Network is clear &mdash; no active conflicts detected across all corridors.';
        } else {
            var topCorr = 'C1', maxC = 0;
            Object.keys(confs).forEach(function(cv){ if(confs[cv] > maxC){ maxC = confs[cv]; topCorr = cv; } });
            txt = 'AI Insight: <b>Corridor ' + topCorr + '</b> holds <b>' + maxC + ' active conflict' + (maxC > 1 ? 's' : '') + '</b> &mdash; review before approving.';
            if(best){ txt += ' <b>' + best.id + '</b> offers the highest conflict-free utilization at <b>' + best.u + '%</b>.';
            } else { txt += ' Every block currently has a conflict &mdash; resolve before planning further.';
            }
        }
        txt += ' All traffic on this map is synthetic simulation data used for demonstration.';
        insight.innerHTML = '<div class="no-ins-ic"><i data-lucide="sparkles" style="width:15px;height:15px;"></i></div>'
            + '<div class="no-ins-t">' + txt + '</div>'
            + '<span class="no-ins-chip">SYNTHETIC &middot; DEMO</span>';
    }
}

// ---------------- focus / zoom ----------------
function noZoomClass(){
    var app = document.getElementById('netopsApp');
    if(app) app.classList.toggle('no-zoomed', NET.view.k >= 1.6);
}
function noFocus(x, y, k){
    k = Math.max(1, Math.min(3.4, k));
    var tx = NET.w / 2 - k * x, ty = NET.h / 2 - k * y;
    NET.view = { k: k, tx: tx, ty: ty };
    var nv = document.getElementById('noView');
    if(nv) nv.style.transform = 'translate(' + tx + 'px, ' + ty + 'px) scale(' + k + ')';
    noZoomClass();
    satSync();
}
function noResetView(){
    NET.view = { k: 1, tx: 0, ty: 0 };
    var nv = document.getElementById('noView');
    if(nv) nv.style.transform = 'none';
    var detail = document.getElementById('noDetail');
    if(detail) detail.classList.remove('open');
    noZoomClass();
    satSync();
}
function netopsResetView(){ noResetView(); }

// ---------------- satellite basemap ----------------
// Provider configuration — isolated from the rest of the app. The default Esri
// World Imagery tiles need no key for demo use; set apiKey to switch providers.
var SAT = {
    provider: 'esri',
    apiKey: '',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    lng0: 87.32041, lat0: 22.33885,
    lonSpan: 0.030
};
var satMap = null, satWatchOn = false, satLastTf = '';
function satSync(){
    var noView = document.getElementById('noView');
    var noMap = document.getElementById('noMap');
    var r0 = document.getElementById('noSatP0');
    var r1 = document.getElementById('noSatP1');
    if(!noView || !noMap || !r0 || !r1 || !satMap) return;
    try{
        var b0 = r0.getBoundingClientRect(), b1 = r1.getBoundingClientRect();
        var S = Math.sqrt((b1.left - b0.left) * (b1.left - b0.left) + (b1.top - b0.top) * (b1.top - b0.top)) / 100;
        if(!(S > 0)) return;
        var box = noMap.getBoundingClientRect();
        var cxx = box.left + box.width / 2, cyy = box.top + box.height / 2;
        var pCx = (cxx - b0.left - b0.width / 2) / S;
        var pCy = (cyy - b0.top - b0.height / 2) / S;
        var dpp = SAT.lonSpan / 1200;
        var dlpp = (SAT.lonSpan * (740 / 1200) * Math.cos(SAT.lat0 * Math.PI / 180)) / 740;
        var lng = SAT.lng0 + (pCx - 600) * dpp;
        var lat = SAT.lat0 - (pCy - 370) * dlpp;
        var lonShown = (box.width / S) * dpp;
        var Z = Math.log2((360 * box.width) / (256 * lonShown));
        Z = Math.max(4, Math.min(19, Z));
        satMap.setView([lat, lng], Z, { animate: false });
    }catch(e){}
}
function satActive(){
    if(document.hidden) return false;
    var sec = document.getElementById('networkops');
    return !!(sec && sec.classList.contains('active'));
}
function satWatch(){
    if(satWatchOn) return;
    satWatchOn = true;
    var frame = function(){
        // Only service the satellite overlay while Network Operations is open and the tab is visible.
        if(satActive()){
            var nv = document.getElementById('noView');
            if(nv){
                var t0 = getComputedStyle(nv).transform;
                if(t0 !== satLastTf){
                    satLastTf = t0;
                    satSync();
                }
            }
        }
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
}
function initSat(){
    if(satMap || typeof L === 'undefined' || !document.getElementById('noSat')) return;
    satMap = L.map('noSat', {
        zoomControl: false,
        attributionControl: true,
        dragging: false, scrollWheelZoom: false,
        doubleClickZoom: false, boxZoom: false,
        keyboard: false, touchZoom: false,
        tap: false, zoomSnap: 0, zoomDelta: 0.25,
        minZoom: 2, maxZoom: 20,
        fadeAnimation: false, zoomAnimation: false, markerZoomAnimation: false
    });
    var url = SAT.url;
    if(SAT.apiKey && url.indexOf('{apikey}') >= 0) url = url.replace('{apikey}', SAT.apiKey);
    L.tileLayer(url, {
        maxZoom: 20, maxNativeZoom: 19,
        attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics',
        crossOrigin: true
    }).addTo(satMap);
    satMap.setView([SAT.lat0, SAT.lng0], 13, { animate: false });
    satSync();
    satWatch();
    window.addEventListener('resize', satSync);
}
window.netopsSatInfo = function(){
    return satMap ? {
        has: true,
        zoom: satMap.getZoom(),
        center: [satMap.getCenter().lat, satMap.getCenter().lng],
        tiles: document.querySelectorAll('#noSat img.leaflet-tile').length
    } : { has: false, zoom: -1, center: null, tiles: 0 };
};
window.initSat = initSat;
// Refresh the map & panels from shared state (used by the Before/After demo after applying changes)
window.netopsRefreshMap = function(){
    try{
        if(typeof noBuild === 'function') noBuild();
    }catch(e){ console.warn('netopsRefreshMap', e); }
};

// ---------------- detail panels ----------------
function noDetailShell(kvHtml){
    var html = '';
    html += '<button class="no-det-close" data-act="close" aria-label="Close"><i data-lucide="x" style="width:13px;height:13px;"></i></button>';
    html += '<div class="no-det-title">' + kvHtml.title + '<span class="no-det-lv ' + (kvHtml.lvCls || 'clear') + '">' + (kvHtml.lv || '') + '</span></div>';
    html += '<div class="no-det-kv">';
    kvHtml.rows.forEach(function(r){ html += '<div><b>' + r[0] + '</b><span>' + r[1] + '</span></div>'; });
    html += '</div>';
    if(kvHtml.conflictHtml) html += kvHtml.conflictHtml;
    if(kvHtml.tasksHtml) html += kvHtml.tasksHtml;
    if(kvHtml.listHtml) html += kvHtml.listHtml;
    return html;
}
function noDot(col){ return '<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + col + ';vertical-align:middle;margin-left:4px;"></span>'; }
function noDetailBlock(id, conflictMode){
    var b = noGetBlock(id);
    if(!b) return;
    var cf = (typeof analyzeBlockConflicts === 'function') ? analyzeBlockConflicts(b) : { level: 'clear', severity: 'No Conflict', all: [], hasConflict: false };
    var col = NET.color[b.corridor] || '#94a3b8';
    var depts = [];
    (b.tasks || []).forEach(function(t){ if(depts.indexOf(t.department) < 0) depts.push(t.department); });
    var kv = {
        title: b.id,
        lv: cf.severity || 'No Conflict',
        lvCls: cf.level || 'clear',
        rows: [
            ['Corridor', (b.corridor || '') + noDot(col)],
            ['Location', (b.from || '') + ' &rarr; ' + (b.to || '')],
            ['Track', b.track || 'UP'],
            ['When', (b.date || '') + ' &middot; ' + (b.startTime || '') + '&ndash;' + (b.endTime || '')],
            ['Duration', b.duration || '120 min'],
            ['Utilization', b.utilization || '75%'],
            ['Type', b.type || 'SINGLE'],
            ['Priority', b.priority || 'MEDIUM'],
            ['Crew', (b.requiredCrew != null ? b.requiredCrew : '') + '/' + (b.availableCrew != null ? b.availableCrew : '')],
            ['Equipment', (b.requiredEquip || 'General') + ' (' + (b.equipmentStatus || 'AVAILABLE') + ')'],
            ['Status', b.status || 'Clear']
        ]
    };
    if(cf.all && cf.all.length){
        var ch = '<div class="no-sec">CONFLICTS (' + cf.all.length + ')</div><div class="no-conf-list">';
        cf.all.forEach(function(cr){
            var label = cr.type === 'train' ? 'TRAIN ' + (cr.trainId || '') : String(cr.type || '').toUpperCase();
            ch += '<div class="no-conf-row"><b>' + label + '</b> &middot; ' + cr.message + '</div>';
        });
        ch += '</div>';
        kv.conflictHtml = ch;
    }
    if(b.tasks && b.tasks.length){
        var th = '<div class="no-sec">TASKS (' + b.tasks.length + ')</div><div class="no-det-tasks">';
        b.tasks.forEach(function(t){
            th += '<div class="no-task"><span>' + t.id + ' &middot; ' + t.name + '</span><span>' + t.department + ' &middot; ' + t.duration + '</span></div>';
        });
        th += '<div class="no-sec" style="margin-top:10px;">DEPARTMENTS</div>';
        th += '<div class="no-task"><span>' + depts.join(', ') + '</span></div>';
        th += '</div>';
        kv.tasksHtml = th;
    }
    var detail = document.getElementById('noDetail');
    detail.innerHTML = noDetailShell(kv)
        + '<div class="no-det-actions">'
        + '<button class="no-det-btn" data-act="open" data-id="' + b.id + '"><i data-lucide="folder-open" style="width:13px;height:13px;"></i> View Block Details</button>'
        + '<button class="no-det-btn whatif" data-act="whatif" data-id="' + b.id + '"><i data-lucide="git-branch" style="width:13px;height:13px;"></i> Open What-If</button>'
        + '</div>';
    detail.classList.add('open');
    if(window.lucide){ try { lucide.createIcons(detail); } catch(e) {} }
    if(conflictMode && cf.hasConflict && cf.all && cf.all.length && cf.all[0].trainId){
        // auto-highlight already handled by band color
    }
    var bp = NET.band[id];
    if(bp) noFocus(bp.x, bp.y, 1.8);
}
function noDetailStation(s){
    var p = NET.st[s];
    if(!p) return;
    var corrs = [];
    Object.keys(NET.chain).forEach(function(cv){ if(NET.chain[cv].indexOf(s) >= 0) corrs.push(cv); });
    var dep = !!NET.depot[s];
    var trs = noTrains().filter(function(t){ return corrs.indexOf(t.corridor) >= 0; });
    var col = NET.color[corrs[0]] || '#64748b';
    var th = '<div class="no-sec">TRAINS NEARBY (' + trs.length + ')</div>';
    trs.forEach(function(t){
        th += '<div class="no-task"><span>' + t.id + '</span><span>' + t.type + ' &middot; ' + t.corridor + ' &middot; ' + (t.start || '') + '&ndash;' + (t.end || '') + '</span></div>';
    });
    var kv = {
        title: 'Station ' + s,
        lv: corrs.join(' '),
        lvCls: 'clear',
        rows: [
            ['Corridors', corrs.join(' &middot; ') + noDot(col)],
            ['Interchange', corrs.length > 1 ? 'Yes' : 'No'],
            ['Depot', dep ? 'Yes' : 'No'],
            ['Serving Trains', trs.length]
        ],
        listHtml: th
    };
    var detail = document.getElementById('noDetail');
    detail.innerHTML = noDetailShell(kv);
    detail.classList.add('open');
    if(window.lucide){ try { lucide.createIcons(detail); } catch(e) {} }
    noFocus(p[0], p[1], 1.5);
}
function noDetailCorridor(c){
    var ch = NET.chain[c];
    if(!ch) return;
    var blocks = noBlocks().filter(function(b){ return b.corridor === c; });
    var cfCount = 0, bad = [];
    blocks.forEach(function(b){
        var cf = (typeof analyzeBlockConflicts === 'function') ? analyzeBlockConflicts(b) : { hasConflict: false };
        if(cf.hasConflict){ cfCount++; bad.push(b); }
    });
    var xs = ch.map(function(s){ return NET.st[s][0]; });
    var ys = ch.map(function(s){ return NET.st[s][1]; });
    var mnx = Math.min.apply(null, xs), mxx = Math.max.apply(null, xs);
    var mny = Math.min.apply(null, ys), mxy = Math.max.apply(null, ys);
    var bh = '';
    if(bad.length){
        bh = '<div class="no-sec">CONFLICTED BLOCKS</div>';
        bad.forEach(function(b){ bh += '<div class="no-trow" data-no="block:' + b.id + '"><span>' + b.id + '</span><span>CONFLICT</span></div>'; });
    }
    var col = NET.color[c];
    var lv = cfCount > 1 ? 'crit' : (cfCount === 1 ? 'warn' : 'clear');
    var lbl = cfCount > 1 ? 'CRITICAL' : (cfCount === 1 ? 'WARNING' : 'CLEAR');
    var kv = {
        title: 'Corridor ' + c,
        lv: lbl,
        lvCls: lv,
        rows: [
            ['Route', ch.join(' &rarr; ')],
            ['Blocks', blocks.length],
            ['Conflicts', cfCount],
            ['Status', lbl]
        ],
        listHtml: bh
    };
    var detail = document.getElementById('noDetail');
    detail.innerHTML = noDetailShell(kv);
    detail.classList.add('open');
    if(window.lucide){ try { lucide.createIcons(detail); } catch(e) {} }
    noFocus((mnx + mxx) / 2, (mny + mxy) / 2, 1.25);
}
function noDetailTrain(t){
    if(!t) return;
    var col = NET.color[t.corridor] || '#94a3b8';
    var kv = {
        title: 'Train ' + t.id,
        lv: String(t.type || 'Train').toUpperCase(),
        lvCls: 'clear',
        rows: [
            ['Type', t.type || 'Passenger'],
            ['Corridor', (t.corridor || '') + noDot(col)],
            ['Date', t.date || 'Monday'],
            ['Window', (t.start || '') + '&ndash;' + (t.end || '')]
        ]
    };
    var detail = document.getElementById('noDetail');
    detail.innerHTML = noDetailShell(kv) + '<div class="no-sec" style="margin-top:10px;">Synthetic schedule &mdash; for demonstration only.</div>';
    detail.classList.add('open');
    if(window.lucide){ try { lucide.createIcons(detail); } catch(e) {} }
    var ch = NET.chain[t.corridor];
    if(ch){
        var pts = ch.map(function(s){ return NET.st[s]; });
        var cx = (pts[0][0] + pts[pts.length - 1][0]) / 2, cy = (pts[0][1] + pts[pts.length - 1][1]) / 2;
        noFocus(cx, cy, 1.5);
    }
}
function noSelectBlock(id){ noDetailBlock(id, false); }
function noSelectStation(id){ noDetailStation(id); }
function noSelectCorridor(c){ noDetailCorridor(c); }
function noSelectTrain(id){
    var t = noTrains().filter(function(x){ return x.id === id; })[0];
    noDetailTrain(t);
}

// ---------------- tooltips ----------------
function noTipInfo(v){
    var idx = v.indexOf(':');
    var kind = v.slice(0, idx), id = v.slice(idx + 1);
    if(kind === 'block'){
        var b = noGetBlock(id);
        return b ? { t: 'Block ' + id, s: (b.corridor || '') + ' &middot; ' + (b.startTime || '') + '&ndash;' + (b.endTime || '') + ' &middot; ' + (b.utilization || '') } : null;
    }
    if(kind === 'conflict'){
        var b2 = noGetBlock(id);
        return { t: 'Conflict on ' + id, s: b2 ? ('Critical &middot; train overlap') : '' };
    }
    if(kind === 'station'){
        var corrs = [];
        Object.keys(NET.chain).forEach(function(cv){ if(NET.chain[cv].indexOf(id) >= 0) corrs.push(cv); });
        return { t: 'Station ' + id, s: corrs.join(' &middot; ') + (NET.depot[id] ? ' &middot; Depot' : '') };
    }
    if(kind === 'corridor'){
        return { t: 'Corridor ' + id, s: (NET.chain[id] || []).join(' &rarr; ') };
    }
    if(kind === 'train'){
        var t = noTrains().filter(function(x){ return x.id === id; })[0];
        return t ? { t: t.id, s: (t.type || '') + ' &middot; ' + t.corridor + ' &middot; ' + (t.start || '') + '&ndash;' + (t.end || '') } : null;
    }
    return null;
}

// ---------------- events ----------------
function noValue(el){ return el.getAttribute && el.getAttribute('data-no'); }
function noWire(){
    if(NET.wired) return;
    NET.wired = true;

    var noMap = document.getElementById('noMap');
    var noTip = document.getElementById('noTip');
    var noDetail = document.getElementById('noDetail');
    var netopsApp = document.getElementById('netopsApp');

    noMap.addEventListener('click', function(e){
        var el = e.target && e.target.closest ? e.target.closest('[data-no]') : null;
        if(!el) return;
        var v = noValue(el);
        var idx = v.indexOf(':');
        var kind = v.slice(0, idx), id = v.slice(idx + 1);
        if(kind === 'block' || kind === 'conflict') noSelectBlock(id);
        else if(kind === 'station') noSelectStation(id);
        else if(kind === 'corridor') noSelectCorridor(id);
        else if(kind === 'train') noSelectTrain(id);
    });

    var tipVal = '', tipRect = null;
    noMap.addEventListener('mousemove', function(e){
        var el = e.target && e.target.closest ? e.target.closest('[data-no]') : null;
        if(!noTip) return;
        if(!el){ noTip.style.display = 'none'; tipVal = ''; return; }
        var v = noValue(el);
        if(v !== tipVal){
            var info = noTipInfo(v);
            if(!info){ noTip.style.display = 'none'; tipVal = ''; return; }
            noTip.innerHTML = info.t + (info.s ? '<span class="no-tip-sub">' + info.s + '</span>' : '');
            tipRect = noMap.getBoundingClientRect();
            tipVal = v;
        }
        var r = tipRect || (tipRect = noMap.getBoundingClientRect());
        var x = e.clientX - r.left + 14, y = e.clientY - r.top + 14;
        noTip.style.left = Math.min(x, r.width - 120) + 'px';
        noTip.style.top = Math.min(y, r.height - 60) + 'px';
        noTip.style.display = 'block';
    });
    noMap.addEventListener('mouseout', function(){ if(noTip) noTip.style.display = 'none'; tipVal = ''; });

    var pan = { on: false, sx: 0, sy: 0, bx: 0, by: 0 };
    function applyView(){
        var nv = document.getElementById('noView');
        if(nv) nv.style.transform = 'translate(' + NET.view.tx + 'px, ' + NET.view.ty + 'px) scale(' + NET.view.k + ')';
        noZoomClass();
        satSync();
    }
    noMap.addEventListener('pointerdown', function(e){
        if(e.target && e.target.closest && e.target.closest('[data-no]')) return;
        pan.on = true; pan.sx = e.clientX; pan.sy = e.clientY; pan.bx = NET.view.tx; pan.by = NET.view.ty;
        try { noMap.setPointerCapture(e.pointerId); } catch(err) {}
        e.preventDefault();
    });
    noMap.addEventListener('pointermove', function(e){
        if(!pan.on) return;
        NET.view.tx = pan.bx + (e.clientX - pan.sx);
        NET.view.ty = pan.by + (e.clientY - pan.sy);
        applyView();
    });
    function endPan(){ pan.on = false; }
    noMap.addEventListener('pointerup', endPan);
    noMap.addEventListener('pointercancel', endPan);
    noMap.addEventListener('wheel', function(e){
        e.preventDefault();
        var fact = e.deltaY < 0 ? 1.12 : 1 / 1.12;
        var k = Math.max(1, Math.min(3.4, NET.view.k * fact));
        NET.view.k = k;
        applyView();
    }, { passive: false });

    var filters = document.getElementById('noFilters');
    filters.addEventListener('click', function(e){
        var chip = e.target && e.target.closest ? e.target.closest('.no-chip') : null;
        if(!chip) return;
        var f = chip.getAttribute('data-no-filter') || 'all';
        filters.querySelectorAll('.no-chip').forEach(function(x){ x.classList.remove('active'); });
        chip.classList.add('active');
        netopsApp.setAttribute('data-filter', f);
    });

    var layerBoxes = document.querySelectorAll('#noLayers input[data-no-layer]');
    function applyLayers(){
        var on = [];
        layerBoxes.forEach(function(inp){ if(inp.checked) on.push(inp.getAttribute('data-no-layer')); });
        netopsApp.setAttribute('data-layers', on.join(' ') || 'none');
    }
    layerBoxes.forEach(function(inp){ inp.addEventListener('change', applyLayers); });
    applyLayers();
    var layersEl = document.getElementById('noLayers');
    var scaleEl = document.querySelector('.no-scalebar');
    [layersEl, scaleEl].forEach(function(el){
        if(!el) return;
        ['pointerdown', 'pointermove', 'wheel', 'dblclick', 'click'].forEach(function(evt){
            el.addEventListener(evt, function(e){ e.stopPropagation(); });
        });
    });

    var panel = document.getElementById('noBlocksPanel');
    panel.addEventListener('click', function(e){
        var el = e.target && e.target.closest ? e.target.closest('[data-no]') : null;
        if(!el) return;
        noSelectBlock(noValue(el).split(':')[1]);
    });

    var sb = document.getElementById('noStatusBar');
    sb.addEventListener('click', function(e){
        var el = e.target && e.target.closest ? e.target.closest('[data-no]') : null;
        if(!el) return;
        noSelectCorridor(noValue(el).split(':')[1]);
    });

    noDetail.addEventListener('click', function(e){
        var act = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
        if(act){
            var a = act.getAttribute('data-act'), id = act.getAttribute('data-id');
            if(a === 'close'){ noDetail.classList.remove('open'); }
            else if(a === 'open' && id && typeof openBlock === 'function') openBlock(id);
            else if(a === 'whatif' && id && typeof openWhatIfFromBlock === 'function') openWhatIfFromBlock(id);
            return;
        }
        var el = e.target && e.target.closest ? e.target.closest('[data-no]') : null;
        if(el) noSelectBlock(noValue(el).split(':')[1]);
    });

    document.addEventListener('keydown', function(e){
        if(e.key !== 'Escape') return;
        var sec = document.getElementById('networkops');
        if(sec && sec.classList.contains('active')){
            var d = document.getElementById('noDetail');
            if(d && d.classList.contains('open')) d.classList.remove('open');
        }
    });
}

// ---------------- init ----------------
function noToggleCollapse(){
    var app = document.getElementById('netopsApp');
    if(!app) return;
    app.classList.toggle('no-col');
    var lbl = document.getElementById('noCollapseLbl');
    if(lbl) lbl.textContent = app.classList.contains('no-col') ? 'Show Blocks' : 'Hide Blocks';
}
function initNetworkOps(){
    var app = document.getElementById('netopsApp');
    if(!app) return;
    if(app.getAttribute('data-init') !== '1'){
        app.setAttribute('data-init', '1');
        noWire();
        if(window.innerWidth && window.innerWidth <= 1100) app.classList.add('no-col');
    }
    if(NET.reduced){
        var sec = document.getElementById('networkops');
        if(sec) sec.classList.add('no-motion-off');
    }
    noBuild();
    initSat();
}
window.initNetworkOps = initNetworkOps;
window.netopsResetView = netopsResetView;
window.netopsToggleCollapse = noToggleCollapse;
window.noSelectBlock = noSelectBlock;
window.noDetailBlock = noDetailBlock;
window.noBlockById = noGetBlock;
})();
})();

// ================= SIH DEMO MODE (Prompt 7) =================
// Guided presenter flow that drives the EXISTING application through a
// deterministic 11-step story using the built-in synthetic dataset and the
// app's real priority scoring, conflict engine, What-If simulator, Before/After
// optimizer, Approval & Audit and Network Operations. Compact dock + callout,
// keyboard shortcuts, no big overlay, no glass, no backdrop-filter. Exiting or
// resetting never destroys user-imported data (snapshot/restore).
(function(){
    if (window.__sihDemoModule) return;
    window.__sihDemoModule = true;

    var DEMO_KEY = 'B-042';
    var DEMO_TASK = 'T102';

    var mode = { active:false, idx:0, backup:null };

    var STORAGE_KEYS = ['aiabps_blocks','aiabps_approvals','aiabps_audit','aiabps_datasource'];

    function $(id){ return document.getElementById(id); }
    function safe(fn){ try{ return fn(); }catch(e){ console.warn('[SIH]', e && e.message); return null; } }
    function toast(t,ty){ try{ showToast(t, ty||'info'); }catch(e){} }
    function later(fn,ms){ setTimeout(function(){ safe(fn); }, ms || 120); }
    function closeAllModals(){
        document.querySelectorAll('.modal.show').forEach(function(m){ m.classList.remove('show'); });
    }
    function clearHighlights(){
        document.querySelectorAll('.sih-hl').forEach(function(el){ el.classList.remove('sih-hl'); });
    }
    function highlight(el, center){
        if(!el) return;
        el.classList.add('sih-hl');
        try{ el.scrollIntoView({ behavior:'smooth', block: center===false ? 'nearest' : 'center' }); }catch(e){}
    }
    function findRow(containerId, needle){
        var rows = document.querySelectorAll('#'+containerId+' tr');
        for(var i=0;i<rows.length;i++){
            if(rows[i] && rows[i].textContent.indexOf(needle) !== -1) return rows[i];
        }
        return null;
    }
    function resetTaskFilters(){
        var s=$('taskSearch'); if(s) s.value='';
        var d=$('deptFilter'); if(d) d.value='';
        var p=$('priorityFilter'); if(p) p.value='';
        safe(function(){ renderTaskTable(); });
    }

    // ---------- storage snapshot / restore ----------
    function snapshotStorage(){
        var out = {};
        STORAGE_KEYS.forEach(function(k){ try{ out[k] = localStorage.getItem(k); }catch(e){} });
        return out;
    }
    function restoreStorage(snap){
        if(!snap) return;
        STORAGE_KEYS.forEach(function(k){
            var v = snap[k];
            try{
                if(v === null || v === undefined) localStorage.removeItem(k);
                else localStorage.setItem(k, v);
            }catch(e){}
        });
    }

    // ---------- step definitions ----------
    var steps = [

        { title:'The Mission', screen:'dashboard', icon:'presentation',
          callout:'Railway maintenance needs track access — but each block must be coordinated with train movements, crews and conflicting work. AI-ABPS turns maintenance tasks, asset condition, train schedule and resources into <b>coordinated, explainable block plans</b> — with a human always authorizing the final decision.',
          enter:function(){
              go('dashboard');
              later(function(){ highlight($('topRecommendation')); }, 150);
          } },

        { title:'Data & Integration', screen:'settings', icon:'database',
          callout:'Planning inputs flow through one structured pipeline: <b>maintenance tasks, block data, train schedule, crews & equipment</b> — validated before import. Source: <b>Synthetic Demonstration Dataset</b> (same shape a future TMS/SMMS/TDMS feed would fill). Prototype — not a live railway data feed.',
          enter:function(){
              safe(function(){ openDataIntegration(); });
              later(function(){ highlight($('diSourceChip')); }, 260);
          } },

        { title:'The Triggering Task', screen:'tasks', icon:'clipboard-list',
          callout:'It starts with a requirement — <b>'+DEMO_TASK+' · Critical Track Defect</b>, CRITICAL and overdue by 3 days on Corridor C1. Maintenance needs a block of track access; the AI evaluates priority before proposing the window.',
          enter:function(){
              go('tasks');
              resetTaskFilters();
              later(function(){ highlight(findRow('taskTableBody', DEMO_TASK)); }, 120);
          } },

        { title:'AI Priority Score', screen:'tasks', icon:'gauge',
          callout:'Every task scores 0–100 (prototype) from five weighted factors — <b>Safety 30% · Asset 25% · Urgency 20% · Delay 15% · Operational 10%</b>. T102 is <b>Critical</b> (score ≥85): high safety criticality, overdue urgency. Rule-based prototype score — not a trained ML model.',
          enter:function(){
              go('tasks');
              resetTaskFilters();
              later(function(){
                  highlight(findRow('taskTableBody', DEMO_TASK), false);
                  safe(function(){ openTask(DEMO_TASK); });
              }, 150);
          } },

        { title:'Candidate Block ('+DEMO_KEY+')', screen:'tasks', icon:'blocks',
          callout:'Block <b>'+DEMO_KEY+'</b> bundles T102 + S143 + O221 on Corridor C1 (Monday, 12:00–14:00, 120 min, 92% utilization). The AI proposes it after checking location, duration, resource capacity and operational constraint compatibility.',
          enter:function(){
              go('tasks');
              later(function(){
                  safe(function(){ openBlock(DEMO_KEY); });
                  later(function(){ highlight($('blockModal')); }, 220);
              }, 150);
          } },

        { title:'Conflict Detection', screen:'conflicts', icon:'triangle-alert',
          callout:'Feasibility checks surface what must be resolved: <b>T-204 Express (13:00–13:30, Monday, C1)</b> overlaps the block window, and the Traction crew is short. The Conflict Center flags each issue with severity and an AI resolution.',
          enter:function(){
              go('conflicts');
              later(function(){
                  var alerts = document.querySelectorAll('#conflictList .alert');
                  for(var i=0;i<alerts.length;i++){
                      if(alerts[i] && alerts[i].textContent.indexOf('T102') !== -1){
                          highlight(alerts[i]); break;
                      }
                  }
              }, 180);
          } },

        { title:'AI Recommendation / Planner', screen:'aiPlanning', icon:'sparkles',
          callout:'The explainable planner recommends a window and reasoning for every block (for '+DEMO_KEY+': resolve the train overlap by keeping clear of 13:00–13:30). <b>Run AI Optimization</b> re-scores the plan with the loaded data — drafts remain recommendations until a human approves. Prototype engine on synthetic data.',
          enter:function(){
              go('aiPlanning');
              later(function(){
                  safe(function(){ runAI(); });
                  later(function(){ highlight($('aiResult')); }, 2300);
              }, 160);
          } },

        { title:'What-If Simulation', screen:'whatif', icon:'git-branch',
          callout:'Before committing, test the change: move '+DEMO_KEY+' to an early clear window (08:00–10:00) and add reserve crew. The simulation reuses the <b>same conflict, suitability and recommendation engine</b> and compares original vs modified — decide only when confident.',
          enter:function(){
              go('whatif');
              later(function(){
                  var sel=$('whatifBlockSelect');
                  if(sel){ sel.value = DEMO_KEY; safe(function(){ onWhatIfBlockChange(); }); }
                  var st=$('whatifStart'), en=$('whatifEnd'), aw=$('whatifAvailCrew');
                  if(st) st.value='08:00';
                  if(en) en.value='10:00';
                  if(aw){ var req=parseInt($('whatifReqCrew') ? $('whatifReqCrew').value : '5', 10)||5; aw.value = String(req+2); }
                  later(function(){
                      safe(function(){ runWhatIfSimulation(); });
                      later(function(){ highlight($('whatifResultsPanel')); }, 400);
                  }, 120);
              }, 180);
          } },

        { title:'Before vs After AI Optimization', screen:'whatif', icon:'bar-chart-3',
          callout:'Prototype <b>Before/After</b> comparison: Conflicts, Train Schedule Conflicts, Resource Conflicts, High-Priority Tasks Blocked, Effective Utilization and Blocks Needing Review — plus a change list. Nothing is applied to the planner until an authorized human approves.',
          enter:function(){
              go('whatif');
              later(function(){
                  // aiRunOptimization runs its own processing overlay; if the
                  // previous step's overlay is still animating, aiProcess would
                  // drop the call (uxAIProcActive guard). Wait until it is free.
                  var run = function(){
                      safe(function(){ aiRunOptimization(); });
                  };
                  if(window.uxAIProcActive){
                      var it = 0, tid = setInterval(function(){
                          it += 1;
                          if(!window.uxAIProcActive || it > 40){ clearInterval(tid); run(); }
                      }, 100);
                  } else {
                      run();
                  }
                  later(function(){ highlight($('aiDemoResults')); }, 3200);
              }, 180);
          } },

        { title:'Human Approval', screen:'approval', icon:'clipboard-check',
          callout:'<b>AI recommends — a human decides.</b> The Approval Center shows each block with its recommendation, conflicts and status. Review '+DEMO_KEY+', then Approve or Reject (overrides require a reason). Every decision is written to the auditable Audit Log.',
          enter:function(){
              go('approval');
              later(function(){
                  safe(function(){ renderApprovalCenter(); });
                  later(function(){
                      safe(function(){ openApprovalDetail(DEMO_KEY); });
                      highlight($('approvalDetailModal'));
                  }, 200);
              }, 160);
          } },

        { title:'Network Operations', screen:'networkops', icon:'train-front',
          callout:'The coordinated activity is visualized in the control-room map: block bands along Corridors C1–C4 over moving trains, conflict highlighting, and one-click <b>What-If</b> from the block detail. End-to-end: data → priority → conflict → recommendation → simulation → human approval → live network view.',
          enter:function(){
              go('networkops');
              later(function(){
                  safe(function(){ window.noSelectBlock(DEMO_KEY); });
                  highlight($('noDetail'));
              }, 450);
          } }
    ];

    // ---------- controller / callout UI ----------
    function buildDock(){
        var dock = document.createElement('div');
        dock.id = 'sihController';
        dock.setAttribute('role', 'toolbar');
        dock.setAttribute('aria-label', 'SIH Demo controller');
        dock.innerHTML =
            '<span class="sih-dock-tag"><i data-lucide="presentation" style="width:13px;height:13px;"></i> SIH DEMO</span>' +
            '<span class="sih-dock-count" id="sihDockCount"></span>' +
            '<span class="sih-dock-steps" id="sihDockSteps"></span>' +
            '<button type="button" class="sih-dock-btn" id="sihPrevBtn" title="Previous step (Left arrow)">←</button>' +
            '<button type="button" class="sih-dock-btn sih-next" id="sihNextBtn" title="Next step (Right arrow / Space)">→</button>' +
            '<button type="button" class="sih-dock-btn" id="sihResetBtn" title="Reset demo to step 1">↺</button>' +
            '<button type="button" class="sih-dock-btn sih-exit" id="sihExitBtn" title="Exit demo (Esc)">✕</button>';
        document.body.appendChild(dock);

        var co = document.createElement('div');
        co.id = 'sihCallout';
        co.innerHTML =
            '<div class="sih-call-head">' +
                '<span class="sih-call-step" id="sihCallStep"></span>' +
                '<span class="sih-call-title" id="sihCallTitle"></span>' +
                '<span class="sih-synth">SYNTHETIC DEMO DATA</span>' +
            '</div>' +
            '<div class="sih-call-body" id="sihCallBody"></div>';
        document.body.appendChild(co);

        $('sihPrevBtn').addEventListener('click', function(){ window.previousSIHDemoStep(); });
        $('sihNextBtn').addEventListener('click', function(){ window.nextSIHDemoStep(); });
        $('sihResetBtn').addEventListener('click', function(){ window.resetSIHDemo(); });
        $('sihExitBtn').addEventListener('click', function(){ window.exitSIHDemo(); });
        if(window.lucide){ safe(function(){ lucide.createIcons(); }); }
    }

    function removeDock(){
        var a=$('sihController'); if(a) a.remove();
        var b=$('sihCallout'); if(b) b.remove();
    }

    function renderController(){
        var count=$('sihDockCount'), seg=$('sihDockSteps');
        if(count) count.textContent = (mode.idx+1)+' / '+steps.length;
        if(seg){
            seg.innerHTML = steps.map(function(s,i){
                var cls='sih-seg';
                if(i<mode.idx) cls+=' done';
                if(i===mode.idx) cls+=' cur';
                return '<span class="'+cls+'" title="'+(i+1)+'. '+s.title+'"></span>';
            }).join('');
        }
        var next=$('sihNextBtn');
        if(next) next.textContent = (mode.idx >= steps.length-1) ? 'Finish ✓' : 'Next →';
        var prev=$('sihPrevBtn');
        if(prev) prev.disabled = (mode.idx <= 0);
        var re=$('sihCallout');
        if(re){ re.classList.remove('sih-call-enter'); void re.offsetWidth; re.classList.add('sih-call-enter'); }
    }

    function renderCallout(){
        var s = steps[mode.idx];
        if(!s) return;
        var st=$('sihCallStep'), ti=$('sihCallTitle'), body=$('sihCallBody');
        if(st) st.textContent = 'STEP '+(mode.idx+1);
        if(ti) ti.textContent = s.title;
        if(body){
            body.innerHTML = (typeof s.callout === 'function' ? s.callout() : s.callout) +
                '<div style="margin-top:8px;font-size:10.5px;color:var(--muted);">→ Next · ← Back · Space Next · Esc Exit · ↺ Reset</div>';
        }
    }

    // ---------- keyboard ----------
    function onKey(e){
        if(!mode.active) return;
        var t = e.target;
        if(t && (t.tagName==='INPUT' || t.tagName==='TEXTAREA' || t.tagName==='SELECT' || t.isContentEditable)) return;
        if(e.key === 'ArrowRight' || e.key === ' '){
            e.preventDefault(); e.stopImmediatePropagation();
            window.nextSIHDemoStep();
        } else if(e.key === 'ArrowLeft'){
            e.preventDefault(); e.stopImmediatePropagation();
            window.previousSIHDemoStep();
        } else if(e.key === 'Escape'){
            e.preventDefault(); e.stopImmediatePropagation();
            window.exitSIHDemo();
        }
    }

    // ---------- public API ----------
    window.startSIHDemo = function startSIHDemo(){
        if(mode.active) return;
        mode.active = true;
        mode.idx = 0;

        // snapshot the user's working data (unharmed on exit)
        mode.backup = { live:null, storage: snapshotStorage() };
        mode.backup.live = safe(function(){ return window.diSnapshotLive ? window.diSnapshotLive() : null; });

        // deterministic demo dataset (quiet apply - no confirm, no audit side-effect)
        safe(function(){ if(window.diApplyDemoData) window.diApplyDemoData('Synthetic Demo Dataset'); });

        closeAllModals();
        clearHighlights();
        buildDock();
        document.addEventListener('keydown', onKey, true);
        enterStep(0);
        toast('SIH Demo started — guided presentation on synthetic data','info');
    };

    window.nextSIHDemoStep = function nextSIHDemoStep(){
        if(!mode.active) return;
        if(mode.idx >= steps.length-1){ window.exitSIHDemo(); return; }
        enterStep(mode.idx+1);
    };

    window.previousSIHDemoStep = function previousSIHDemoStep(){
        if(!mode.active) return;
        if(mode.idx > 0) enterStep(mode.idx-1);
    };

    window.resetSIHDemo = function resetSIHDemo(){
        if(!mode.active) return;
        closeAllModals();
        clearHighlights();
        safe(function(){ if(window.diApplyDemoData) window.diApplyDemoData('Synthetic Demo Dataset'); });
        enterStep(0);
        toast('Demo reset — back to Step 1','info');
    };

    window.exitSIHDemo = function exitSIHDemo(){
        if(!mode.active) return;
        mode.active = false;
        closeAllModals();
        clearHighlights();
        removeDock();
        document.removeEventListener('keydown', onKey, true);
        if(mode.backup){
            if(mode.backup.live){ safe(function(){ if(window.diRestoreLive) window.diRestoreLive(mode.backup.live); }); }
            restoreStorage(mode.backup.storage);
        }
        mode.backup = null;
        safe(function(){ go('dashboard'); window.scrollTo(0,0); });
        toast('SIH Demo exited — your working data has been restored','success');
    };

    // Upgrade the existing "SIH Demo" entry point to launch the guided demo.
    window.openSihDemo = function openSihDemo(){ window.startSIHDemo(); };

    function enterStep(i){
        mode.idx = i;
        clearHighlights();
        closeAllModals();
        renderController();
        renderCallout();
        var s = steps[i];
        if(s && s.enter) safe(function(){ s.enter(); });
    }
})();