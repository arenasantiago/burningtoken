// Web Audio API Sound Synthesizer for "Fun Build · NERDCONF"
// Produces procedural high-impact courtroom sound effects without external audio assets.

export function useAudioTribunal() {
  const getAudioContext = () => {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  };

  // 1. Judge's Gavel Hit (Martillazo de Juez Acústico de Doble Capa)
  // Combina un chasquido transitorio agudo de madera seca con la resonancia subsónica del estrado de roble.
  const playGavel = () => {
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;

      // Capa 1: Impacto transitorio agudo (golpe de mazo)
      const oscAttack = ctx.createOscillator();
      const gainAttack = ctx.createGain();
      oscAttack.type = "triangle";
      oscAttack.frequency.setValueAtTime(280, t);
      oscAttack.frequency.exponentialRampToValueAtTime(40, t + 0.12);

      gainAttack.gain.setValueAtTime(1.0, t);
      gainAttack.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      oscAttack.connect(gainAttack);
      gainAttack.connect(ctx.destination);
      oscAttack.start(t);
      oscAttack.stop(t + 0.18);

      // Capa 2: Resonancia de madera grave (vibración del estrado)
      const oscBody = ctx.createOscillator();
      const gainBody = ctx.createGain();
      oscBody.type = "sine";
      oscBody.frequency.setValueAtTime(95, t + 0.02);
      oscBody.frequency.exponentialRampToValueAtTime(35, t + 0.35);

      gainBody.gain.setValueAtTime(0.7, t + 0.02);
      gainBody.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      oscBody.connect(gainBody);
      gainBody.connect(ctx.destination);
      oscBody.start(t + 0.02);
      oscBody.stop(t + 0.42);
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  // 2. Smoke Siren (Sirena Antihumo / Bullshit Alarm Modulada)
  const playSmokeSiren = () => {
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      // Barrido de sirena bifásica
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.linearRampToValueAtTime(820, t + 0.14);
      osc.frequency.linearRampToValueAtTime(440, t + 0.28);
      osc.frequency.linearRampToValueAtTime(860, t + 0.42);
      osc.frequency.linearRampToValueAtTime(380, t + 0.55);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.58);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.6);
    } catch {
      // Ignore
    }
  };

  // 3. Voto "LEGIT" (Campana armónica cristalina afirmativa)
  const playVoteLegit = () => {
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;
      const notes = [587.33, 880.0]; // D5 -> A5 (intervalo de 5ta justa luminosa)

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t + idx * 0.06);

        gain.gain.setValueAtTime(0.22, t + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t + idx * 0.06);
        osc.stop(t + idx * 0.06 + 0.3);
      });
    } catch {
      // Ignore
    }
  };

  // 4. Voto "SMOKE" (Buzzer disonante con barrido descendente)
  const playVoteSmoke = () => {
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(75, t + 0.22);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.28);
    } catch {
      // Ignore
    }
  };

  // 5. Alerta de Hype Crítico (>75% Smoke)
  const playHypeAlert = () => {
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;
      const pulses = [600, 750, 900, 1050];

      pulses.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, t + i * 0.07);

        gain.gain.setValueAtTime(0.18, t + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.07 + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t + i * 0.07);
        osc.stop(t + i * 0.07 + 0.07);
      });
    } catch {
      // Ignore
    }
  };

  // 6. Mechanical Vote Click (Fallback legacy click)
  const playVoteClick = () => {
    playVoteLegit();
  };

  // 7. Verdict Dramatic Chime (Acorde de Veredicto Final)
  const playVerdictChime = (isSmoke: boolean) => {
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;
      // Disonante / Tritono si es Humo, Acorde Mayor brillante si es Legit
      const freqs = isSmoke ? [207.65, 293.66, 415.3] : [329.63, 415.3, 493.88, 659.25];
      
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = isSmoke ? "sawtooth" : "sine";
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);

        gain.gain.setValueAtTime(0.22, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.95);
      });
    } catch {
      // Ignore
    }
  };

  // 8. Cash Register / Unlock Chime (RevenueCat Pro Entitlement)
  const playUnlockSound = () => {
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t + i * 0.06);
        gain.gain.setValueAtTime(0.25, t + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.06 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + i * 0.06);
        osc.stop(t + i * 0.06 + 0.32);
      });
    } catch {
      // Ignore
    }
  };

  return {
    playGavel,
    playSmokeSiren,
    playVerdictChime,
    playVoteClick,
    playVoteLegit,
    playVoteSmoke,
    playHypeAlert,
    playUnlockSound,
  };
}

