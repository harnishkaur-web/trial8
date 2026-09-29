var steps = ['intro','roles','exchange','review','feedback','revise','reflect','evidence'];

function goTo(step){
  document.querySelectorAll('section').forEach(function(s){
    s.classList.toggle('active', s.getAttribute('data-step') === step);
  });
  if(step === 'exchange') renderArtifact();
  window.scrollTo({top:0, behavior:'smooth'});
}

/* ================= ARTIFACT ================= */
var artifactData = {
  iti: {
    ai:'On <span class="mark">10 August</span>, <span class="mark">35 trainees</span> from Batch 5A visited Bansal Auto Components. The plant runs <span class="mark">a fully automated line needing no manual checks</span>, <span class="mark">as confirmed by the visit register</span>.',
    fixed:'On 10 August, <span class="mark">32 trainees</span> from Batch 5A visited Bansal Auto Components, as recorded in the visit register. The claim about <span class="mark">a fully automated line needing no manual checks</span> could not be confirmed and <span class="mark">was removed</span>.'
  },
  higher: {
    ai:'The department survey received <span class="mark">210 responses</span>, showing that <span class="mark">95% of students prefer online submission</span>, <span class="mark">as reported by the survey coordinator</span>.',
    fixed:'The department survey received <span class="mark">184 responses</span>, as logged in the survey portal. The <span class="mark">95% preference figure</span> could not be verified and <span class="mark">was qualified</span> as reported by a small sample, not confirmed for the full survey.'
  }
};

function renderArtifact(){
  var lane = document.getElementById('laneSelect').value;
  var d = artifactData[lane];
  document.getElementById('artifactBlock').innerHTML =
    '<blockquote><div class="label">AI version</div><p>'+d.ai+'</p></blockquote>'+
    '<blockquote class="owner"><div class="label">Owner\u2019s corrected version</div><p>'+d.fixed+'</p></blockquote>';
}

/* ================= TIMER ================= */
var phases = [
  {name:"Pairing", seconds:120, instruction:"Sit with your buddy. Agree who is Owner and who is Reviewer for this round."},
  {name:"Observation", seconds:300, instruction:"Reviewer reads both versions and marks every fact, figure, date, name and source."},
  {name:"Feedback", seconds:300, instruction:"Reviewer shares one strength, one risk and one suggested change, using the rubric."},
  {name:"Revision", seconds:120, instruction:"Owner makes at least one change based on the feedback just received."},
  {name:"Close-out", seconds:60, instruction:"Owner writes down the one change made. Get ready to swap roles for round 2."}
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
    phaseIndex = 0;
    secondsLeft = phases[phaseIndex].seconds;
  }
  updateTimerDisplay();
}

/* ================= DOWNLOAD ================= */
function downloadAnswers(){
  var lines = [];
  lines.push('PEER EXCHANGE — CHECK BEFORE YOU USE');
  lines.push('AAI-E-MC1-S03-COMM01');
  lines.push('');
  lines.push('One strength: ' + (document.getElementById('fStrength').value || '(not filled)'));
  lines.push('One risk: ' + (document.getElementById('fRisk').value || '(not filled)'));
  lines.push('One suggested change: ' + (document.getElementById('fChange').value || '(not filled)'));
  lines.push('One change I made after peer review: ' + (document.getElementById('fChanged').value || '(not filled)'));
  lines.push('Reflection: ' + (document.getElementById('fReflect').value || '(not filled)'));
  var blob = new Blob([lines.join('\\n')], {type:'text/plain'});
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
  document.querySelectorAll('textarea, input[type=text]').forEach(function(el){ el.value = ''; });
  document.querySelectorAll('input[type=checkbox]').forEach(function(el){ el.checked = false; });
  phaseIndex = 3;
  secondsLeft = phases[phaseIndex].seconds;
  clearInterval(timerInterval);
  timerRunning = false;
  document.getElementById('timerBtn').textContent = 'Start';
  updateTimerDisplay();
  goTo('intro');
}

document.addEventListener('DOMContentLoaded', function(){
  updateTimerDisplay();
});