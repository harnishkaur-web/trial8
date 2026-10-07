/* ================= SLIDES =================
   One <section> visible at a time inside a fixed 100dvh frame. The footer
   holds the progress bar, the "n / N" counter and Back/Next. A section can
   rename Next with data-next; the section marked data-last hides Next (its
   own Download button is the primary) and shows Start over instead. */
var sections = [];
var steps = [];
var current = 0;

function showIndex(i){
  current = Math.max(0, Math.min(sections.length - 1, i));
  sections.forEach(function(s, k){ s.classList.toggle("active", k === current); });
  var sec = sections[current];
  var step = steps[current];
  if(step === "exchange-ai" || step === "exchange-fixed") renderArtifact();
  var isLast = sec.hasAttribute("data-last");
  document.getElementById("counter").textContent = (current + 1) + " / " + sections.length;
  document.getElementById("navBack").style.visibility = current === 0 ? "hidden" : "visible";
  var next = document.getElementById("navNext");
  next.hidden = isLast;
  next.textContent = sec.getAttribute("data-next") || "Next";
  document.getElementById("navRestart").hidden = !isLast;
  setTimeout(paintGate, 0);
  document.querySelectorAll("#progress span").forEach(function(d, k){
    d.classList.toggle("active", k === current);
    d.classList.toggle("is-done", k < current);
  });
}

function goTo(step){
  var i = steps.indexOf(step);
  if(i > -1) showIndex(i);
}
/* Required typed answers: Next stays locked on these screens until each
   field has a real answer (at least a few words, not only spaces). */
var REQUIRED_FIELDS = {
  feedback: ["fStrength", "fRisk", "fChange"],
  revise: ["fChanged"],
  reflect: ["fReflect"]
};
function fieldOk(el){
  var v = (el.value || "").replace(/\s+/g, " ").trim();
  return v.length >= 5 && /[^\s0-9.,!?;:'"()\-]/.test(v);
}
function gateMsg(sec, text){
  var m = sec.querySelector(".g17-gate");
  if(!m){
    m = document.createElement("p");
    m.className = "g17-gate saa-vo-skip";
    m.setAttribute("role", "status");
    m.setAttribute("aria-live", "polite");
    var ids = REQUIRED_FIELDS[sec.getAttribute("data-step")] || [];
    var last = document.getElementById(ids[ids.length - 1]);
    if(last && last.parentNode) last.parentNode.insertBefore(m, last.nextSibling); else sec.appendChild(m);
  }
  m.textContent = text;
  m.hidden = !text;
}
function gateOpen(){
  var ids = REQUIRED_FIELDS[steps[current]];
  if(!ids) return true;
  var sec = sections[current];
  var bad = ids.map(function(id){ return document.getElementById(id); }).filter(function(el){ return el && !fieldOk(el); });
  if(!bad.length){ gateMsg(sec, ""); return true; }
  gateMsg(sec, ids.length > 1 ? "Type an answer in each box first. Use a few words." : "Type your answer in the box first. Use a few words.");
  bad.forEach(function(el){ el.classList.add("g17-need"); });
  try { bad[0].focus({preventScroll:false}); } catch(e){ bad[0].focus(); }
  return false;
}
document.addEventListener("input", function(e){
  var t = e.target;
  if(t && t.classList && t.classList.contains("g17-need") && fieldOk(t)) t.classList.remove("g17-need");
  if(t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT")) dirty = true;
  var ids = REQUIRED_FIELDS[steps[current]];
  if(ids && ids.every(function(id){ return fieldOk(document.getElementById(id)); })) gateMsg(sections[current], "");
  paintGate();
});
/* Next looks locked (dimmed, aria-disabled) while a typed answer is missing,
   like the activity locks; it can still be pressed to show what is left. */
function paintGate(){
  var b = document.getElementById("navNext"); if(!b) return;
  var ids = REQUIRED_FIELDS[steps[current]];
  var on = !!ids && !ids.every(function(id){ return fieldOk(document.getElementById(id)); });
  if(b.classList.contains("g17-locked") === on) return;
  b.classList.toggle("g17-locked", on);
  if(on) b.setAttribute("aria-disabled", "true");
  else if(!b.classList.contains("saa-locked")) b.removeAttribute("aria-disabled");
}
function goNext(){ if(!gateOpen()) return; showIndex(current + 1); }

/* Warn before a reload or close loses typed answers (nothing is saved). */
var dirty = false, leaving = false;
window.addEventListener("beforeunload", function(e){
  if(!dirty || leaving) return;
  e.preventDefault(); e.returnValue = "";
  return "";
});
function goBack(){ showIndex(current - 1); }

/* ================= ARTIFACT ================= */
var artifactData = {
  iti: {
    ai:'On <span class="mark">10 August</span>, <span class="mark">35 trainees</span> from Batch 5A visited Bansal Auto Components. The plant runs <span class="mark">a fully automated line needing no manual checks</span>, <span class="mark">as confirmed by the visit register</span>.',
    fixed:'On 10 August, <span class="mark">32 trainees</span> from Batch 5A visited Bansal Auto Components, as recorded in the visit register. The claim about <span class="mark">a fully automated line needing no manual checks</span> could not be confirmed and <span class="mark">was removed</span>.'
  },
  higher: {
    ai:'The department survey received <span class="mark">210 responses</span>, showing that <span class="mark">95% of students prefer online submission</span>, <span class="mark">as reported by the survey coordinator</span>.',
    fixed:'The department survey received <span class="mark">184 responses</span>, as logged in the survey portal. The <span class="mark">95% preference figure</span> could not be verified and <span class="mark">was qualified</span>. It came from a small sample, so the note now says it is not confirmed for the full survey.'
  }
};

function renderArtifact(){
  var select = document.getElementById("laneSelect");
  var d = artifactData[select.value];
  var laneName = select.options[select.selectedIndex].text;
  document.querySelector("#artifactAI p:not(.g17-prompt)").innerHTML = d.ai;
  document.querySelector("#artifactFixed p").innerHTML = d.fixed;
  document.querySelectorAll(".lane-name").forEach(function(el){ el.textContent = laneName; });
  g17Decorate(select.value);
}

/* Game 17 designer assets (Oct 2026): setting icon, the ITI prompt, category
   tags on the AI marks (shown only after the question on that screen is
   answered) and the visit-register excerpt for the ITI corrected note. */
var g17Data = {
  iti: { icon: "lane-iti", prompt: "Write our industrial visit note.", tags: ["date", "figure", "fact", "source"] },
  higher: { icon: "lane-college", prompt: "", tags: ["figure", "figure", "source"] }
};
function g17Decorate(lane){
  var g = g17Data[lane]; if(!g) return;
  var ic = document.getElementById("g17LaneIcon");
  if(ic) ic.src = "assets/icons/icon-" + g.icon + ".webp";
  var pr = document.getElementById("g17Prompt");
  if(pr){ pr.textContent = g.prompt; pr.hidden = !g.prompt; }
  document.querySelectorAll("#artifactAI p:not(.g17-prompt) .mark").forEach(function(m, i){
    var t = g.tags[i]; if(!t) return;
    var img = document.createElement("img");
    img.className = "g17-tag"; img.src = "assets/icons/icon-" + t + ".webp"; img.alt = ""; img.setAttribute("aria-hidden", "true");
    m.insertBefore(img, m.firstChild);
  });
  var reg = document.getElementById("g17Register");
  if(reg) reg.hidden = lane !== "iti";
  var sup = document.querySelector("#artifactFixed p .mark");
  if(sup) sup.classList.toggle("g17-supported", lane === "iti");
}

/* ================= TIMER ================= */
var phases = [
  {name:"Pairing", seconds:120, instruction:"Sit with your buddy. Agree who is the Owner and who is the Reviewer for this round."},
  {name:"Observation", seconds:300, instruction:"The Reviewer reads both versions. The Reviewer marks every fact, figure, date, name and source."},
  {name:"Feedback", seconds:300, instruction:"The Reviewer uses the rubric. The Reviewer gives one strength, one risk and one suggested change."},
  {name:"Revision", seconds:120, instruction:"The Owner makes at least one change based on the feedback."},
  {name:"Close-out", seconds:60, instruction:"The Owner writes down the one change. Then you get ready to swap roles for round 2."}
];
var phaseIndex = 3; // starts on "Revision" to match where the timer appears in the flow
var secondsLeft = phases[phaseIndex].seconds;
var timerInterval = null;
var timerRunning = false;

function updateTimerDisplay(){
  var m = Math.floor(secondsLeft/60);
  var s = secondsLeft%60;
  document.getElementById('timerDigits').textContent = (m<10?'0':'')+m+':'+(s<10?'0':'')+s;
  document.getElementById('timerPhaseLabel').textContent = phases[phaseIndex].name;
  document.getElementById('timerInstruction').textContent = phases[phaseIndex].instruction;
  var skip = document.getElementById('timerSkip');
  if(skip) skip.style.display = phaseIndex >= phases.length - 1 ? "none" : "";
}

function toggleTimer(){
  var btn = document.getElementById('timerBtn');
  if(timerRunning){
    clearInterval(timerInterval);
    timerRunning = false;
    btn.textContent = 'Resume';
  } else {
    timerRunning = true;
    btn.textContent = 'Pause';
    timerInterval = setInterval(function(){
      secondsLeft--;
      if(secondsLeft < 0){ nextPhase(); return; }
      updateTimerDisplay();
    }, 1000);
  }
}

function nextPhase(){
  clearInterval(timerInterval);
  timerRunning = false;
  document.getElementById('timerBtn').textContent = 'Start';
  if(phaseIndex < phases.length - 1){
    phaseIndex++;
    secondsLeft = phases[phaseIndex].seconds;
  } else {
    secondsLeft = 0; // Close-out is the last phase: stop here, do not wrap to Pairing
  }
  updateTimerDisplay();
}

/* ================= DOWNLOAD ================= */
function downloadAnswers(){
  var lines = [];
  lines.push('PEER EXCHANGE — CHECK BEFORE YOU USE');
  lines.push('AAI-E-MC1-S03-COMM01');
  lines.push('');
  var lane = document.getElementById('laneSelect');
  lines.push('Setting: ' + lane.options[lane.selectedIndex].text);
  var own = document.querySelector('input[name=firstOwner]:checked');
  lines.push('Owner first: ' + (own && own.value === 'buddy' ? 'My buddy' : 'Me'));
  var rb = ['Every fact, figure, date, name and source is marked', 'Each correction comes from a record, is qualified, or is removed', 'The corrected version is clear', 'At least one real change happened because of this review'];
  lines.push('Rubric points met:');
  rb.forEach(function(t, i){ lines.push('  [' + (document.getElementById('rb' + (i + 1)).checked ? 'x' : ' ') + '] ' + t); });
  lines.push('');
  lines.push('One strength: ' + (document.getElementById('fStrength').value || '(not filled)'));
  lines.push('One risk: ' + (document.getElementById('fRisk').value || '(not filled)'));
  lines.push('One suggested change: ' + (document.getElementById('fChange').value || '(not filled)'));
  lines.push('One change I made after peer review: ' + (document.getElementById('fChanged').value || '(not filled)'));
  lines.push('Reflection: ' + (document.getElementById('fReflect').value || '(not filled)'));
  var blob = new Blob([lines.join('\n')], {type:'text/plain'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'peer-exchange-answers.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function startOver(){
  /* A true fresh round: the activities, the setting and every answer reset. */
  leaving = true;
  try { location.reload(); return; } catch(e){}
  document.querySelectorAll('textarea, input[type=text]').forEach(function(el){ el.value = ''; });
  document.querySelectorAll('input[type=checkbox]').forEach(function(el){ el.checked = false; });
  phaseIndex = 3;
  secondsLeft = phases[phaseIndex].seconds;
  clearInterval(timerInterval);
  timerRunning = false;
  document.getElementById('timerBtn').textContent = 'Start';
  updateTimerDisplay();
  goTo('cover');
}

document.addEventListener("DOMContentLoaded", function(){
  sections = Array.prototype.slice.call(document.querySelectorAll(".stage > section"));
  steps = sections.map(function(s){ return s.getAttribute("data-step"); });
  var progress = document.getElementById("progress");
  sections.forEach(function(){ progress.appendChild(document.createElement("span")); });
  renderArtifact();
  updateTimerDisplay();
  showIndex(0);
});
/* Game 17 designer assets (Oct 2026): the layer has already split each slide
   into .saa-lead / .saa-work. Move the left-column picture under the slide's
   own text (above "Your task"); no words are added. Put the two buddies on the
   start screen built by the layer. */
document.addEventListener("DOMContentLoaded", function(){
  document.querySelectorAll(".g17-lead-fig").forEach(function(fig){
    var slide = fig.closest(".slide");
    var lead = slide && slide.querySelector(".saa-lead");
    if(!lead) return;
    var task = lead.querySelector(".do");
    if(task) lead.insertBefore(fig, task); else lead.appendChild(fig);
  });
  document.querySelectorAll(".g17-lead-end").forEach(function(fig){
    var slide = fig.closest(".slide");
    var lead = slide && slide.querySelector(".saa-lead");
    if(lead) lead.appendChild(fig);
  });
  setTimeout(function(){
    var mid = document.querySelector("#saa-start .saa-mid");
    if(!mid || mid.querySelector(".g17-start-hero")) return;
    var img = document.createElement("img");
    img.className = "g17-start-hero";
    img.src = "assets/scene-peer-checked-note-720.webp";
    img.alt = "An ITI trainee and a college student look at one checked note on a phone together.";
    mid.insertBefore(img, mid.firstChild);
  }, 0);
});
