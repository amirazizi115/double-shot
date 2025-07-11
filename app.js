let players = [];
const stats = {};
const history = [];
let timerInterval;
let seconds = 0;

let hopTimeout = null;
let dotsInterval = null;

function parsePlayers() {
    const raw = document.getElementById('playerInput').value;
    players = raw.split(',').map(p => p.trim()).filter(p => p);
    players.forEach(p => { if (!stats[p]) stats[p] = { win: 0, loss: 0 }; });
}

function fillAll() {
    ['teamA1', 'teamA2', 'teamB1', 'teamB2'].forEach(id => {
        const sel = document.getElementById(id);
        sel.innerHTML = '';
        players.forEach(p => sel.add(new Option(p, p)));
        sel.disabled = false;
    });
}

function randomizeTeams() {
    const pool = [...players];
    const pick = () => pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const [a1, a2, b1, b2] = [pick(), pick(), pick(), pick()];
    teamA1.value = a1; teamA2.value = a2;
    teamB1.value = b1; teamB2.value = b2;
}

function updateScoreboard() {
  const tbody = document.getElementById('scoreTable');
  tbody.innerHTML = '';
  const sortedPlayers = [...players].sort();
  sortedPlayers.forEach(p => {
    const s = stats[p];
    const total = s.win + s.loss;
    const wr = total ? ((s.win / total) * 100).toFixed(1) : '0.0';
    tbody.innerHTML += `
      <tr>
        <td class="border border-gray-700 py-1">${p}</td>
        <td class="border border-gray-700 py-1">${s.win}</td>
        <td class="border border-gray-700 py-1">${s.loss}</td>
        <td class="border border-gray-700 py-1">${wr} %</td>
      </tr>
    `;
  });
}

function updateHistory() {
  const tbody = document.getElementById('historyTable');
  tbody.innerHTML = '';
  history.forEach((m) => {
    tbody.innerHTML += `
      <tr>
        <td class="border border-gray-700 py-1">${m.duration}</td>
        <td class="border border-gray-700 py-1">${m.teamA.join(' & ')}</td>
        <td class="border border-gray-700 py-1">${m.teamB.join(' & ')}</td>
        <td class="border border-gray-700 py-1">${m.winner}</td>
      </tr>
    `;
  });
}

function resetHopAnimation() {
  if (hopTimeout) {
    clearTimeout(hopTimeout);
    hopTimeout = null;
  }
}

function animateHop() {
  resetHopAnimation();

  const el = document.getElementById("nowPlaying");
  const text = el.textContent;
  el.textContent = "";

  text.split("").forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char === " " ? "\u00A0" : char;
    span.classList.add("hop-char");
    span.style.animationDelay = `${index * 0.1}s`;
    el.appendChild(span);
  });

  const totalTime = (text.length * 0.1 + 0.6 + 3) * 1000;
  hopTimeout = setTimeout(animateHop, totalTime);
}

function resetDotsAnimation() {
  if (dotsInterval) {
    clearInterval(dotsInterval);
    dotsInterval = null;
  }
}

function animateDots() {
  resetDotsAnimation();

  const el = document.getElementById("waiting");
  const baseText = el.textContent.replace(/\.*$/, "");
  let dotCount = 0;

  dotsInterval = setInterval(() => {
    dotCount = (dotCount + 1) % 4;
    el.textContent = baseText + ".".repeat(dotCount);
  }, 1000); // __ ms interval
}

newMatchBtn.onclick = () => {
    parsePlayers(); 
    fillAll(); 
    randomizeTeams(); 
    resetTimer();
    animateDots();

    document.getElementById('matchSetup').classList.remove('hidden');
    document.getElementById('teamAWinBtn').classList.add('hidden');
    document.getElementById('teamBWinBtn').classList.add('hidden');
    document.getElementById('confirmMatchBtn').classList.remove('hidden');
    document.getElementById('currentMatch').classList.add('hidden');
    document.getElementById('playerSelect').classList.remove('hidden');
};

confirmMatchBtn.onclick = () => {
    ['teamA1','teamA2','teamB1','teamB2'].forEach(id => document.getElementById(id).disabled = true);

    // changeStyle
    ['teamA1','teamA2','teamB1','teamB2'].forEach(id => document.getElementById(id).classList.remove('bg-gray-700', 'text-white', 'biomeFont'));
    ['teamA1','teamA2','teamB1','teamB2'].forEach(id => document.getElementById(id).classList.add('bg-gray-800', 'noShow', 'text-xl', 'biomeFont-bold'));
    ['teamA1','teamA2'].forEach(id => document.getElementById(id).classList.add('text-teal-300'));
    document.getElementById('andTeal').classList.add('text-teal-400');
    ['teamB1','teamB2'].forEach(id => document.getElementById(id).classList.add('text-purple-300'));
    document.getElementById('andPurple').classList.add('text-purple-300');

    document.getElementById('newMatchBtn').classList.add('hidden');
    document.getElementById('teamAWinBtn').classList.remove('hidden');
    document.getElementById('teamBWinBtn').classList.remove('hidden');
    document.getElementById('confirmMatchBtn').classList.add('hidden');
    document.getElementById('currentMatch').classList.remove('hidden');
    document.getElementById('playerSelect').classList.add('hidden');
    startTimer();

    // change border colors
    document.getElementById('teamAwrapper').classList.remove('border-gray-500');
    document.getElementById('teamBwrapper').classList.remove('border-gray-500');
    document.getElementById('teamAwrapper').classList.add('border-teal-500');
    document.getElementById('teamBwrapper').classList.add('border-purple-400');

    animateHop(); // Start the animation loop
};

teamAWinBtn.onclick = () => recordResult('Team A');
teamBWinBtn.onclick = () => recordResult('Team B');

function startTimer() {
  seconds = 0;
  document.getElementById('timerDisplay').classList.remove('hidden');
  timerInterval = setInterval(() => {
    seconds++;
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    document.getElementById('timerDisplay').textContent = `${m}:${s}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function resetTimer() {
    stopTimer();
    seconds = 0;
    document.getElementById('timerDisplay').textContent = '00:00';
    document.getElementById('timerDisplay').classList.add('hidden');
}

function recordResult(winner) {
    resetStyle();
    stopTimer();
    const teamA = [teamA1.value, teamA2.value];
    const teamB = [teamB1.value, teamB2.value];
    const duration = document.getElementById('timerDisplay').textContent;
    teamA.forEach(p => stats[p][winner==='Team A'?'win':'loss']++);
    teamB.forEach(p => stats[p][winner==='Team B'?'win':'loss']++);
    history.push({ teamA, teamB, winner, duration });
    updateScoreboard(); 
    updateHistory();
    resetTimer();
}

function resetStyle() {
  document.getElementById('newMatchBtn').classList.remove('hidden');
  document.getElementById('matchSetup').classList.add('hidden');

  // reset selection
  ['teamA1','teamA2','teamB1','teamB2'].forEach(id => document.getElementById(id).classList.remove('noShow', 'bg-gray-800', 'noShow', 'text-xl', 'biomeFont-bold', 'text-teal-300', 'text-purple-300'));
  ['teamA1','teamA2','teamB1','teamB2'].forEach(id => document.getElementById(id).classList.add('bg-gray-700', 'text-white', 'biomeFont'));
  document.getElementById('andTeal').classList.remove('text-teal-400');
  document.getElementById('andPurple').classList.remove('text-purple-300');

  // change border colors
  document.getElementById('teamAwrapper').classList.remove('border-teal-500');
  document.getElementById('teamBwrapper').classList.remove('border-purple-400');
  document.getElementById('teamAwrapper').classList.add('border-gray-500');
  document.getElementById('teamBwrapper').classList.add('border-gray-500');
}