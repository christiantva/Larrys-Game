/* ---------- Opciones (UI) ---------- */
function syncOptionsUI() {
  document.querySelectorAll('[data-set]').forEach((el) => {
    const k = el.dataset.set;
    if (el.classList.contains('seg')) el.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.v === S[k]));
    else if (el.type === 'checkbox') el.checked = !!S[k];
    else { el.value = S[k]; const out = el.parentElement.querySelector('output'); if (out) out.textContent = (+S[k]).toFixed(2); }
  });
}
function bindUI() {
  document.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation(); const a = b.dataset.act;
    if (a === 'start') Game.start();
    else if (a === 'options') Game.openOptions(Game.state === 'paused' ? 'pause' : 'menu');
    else if (a === 'back') Game.closeOptions();
    else if (a === 'resume') Game.resume();
    else if (a === 'quit') Game.quit();
  }));
  document.querySelectorAll('[data-set]').forEach((el) => {
    const k = el.dataset.set;
    if (el.classList.contains('seg')) el.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { S[k] = b.dataset.v; onSetting(k); syncOptionsUI(); }));
    else if (el.type === 'checkbox') el.addEventListener('change', () => { S[k] = el.checked; onSetting(k); });
    else el.addEventListener('input', () => { S[k] = parseFloat(el.value); const out = el.parentElement.querySelector('output'); if (out) out.textContent = S[k].toFixed(2); onSetting(k); });
  });
  $('resume').addEventListener('click', () => { if (Game.state === 'paused') Game.resume(); else Input.requestLock(); });
}
function onSetting(k) {
  saveSettings();
  if (['master', 'ambient', 'musicOn', 'music'].includes(k)) AudioSys.applyVolumes();
  if (k === 'quality') applyQuality(true);
}
function applyAudioQuality() { /* HRTF/IR dependen de Q y se aplican al crear emisores/impulsos */ }
function applyQuality(rebuild) {
  const prev = Q; Q = QUALITY[S.quality] || QUALITY.medium;
  World.camera.far = Q.far; World.camera.updateProjectionMatrix();
  World.lights.forEach((L, i) => { L.visible = i < Q.realLights; });
  Post.resize();
  if (rebuild && prev !== Q && Zones.current) {
    const wasAudio = Zones.current.emitters.length > 0;
    Zones.rebuild(); Zones.prebuild();
    if (!wasAudio) Zones.current.stopAudio();
    AudioSys.resetReverb(); Zones.current.updateReverb(true);
  }
}

