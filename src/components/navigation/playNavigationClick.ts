let audioContext: AudioContext | undefined;

export function playNavigationClick() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = (audioContext ??= new AudioContextClass());
    if (context.state === 'suspended') {
      void context.resume().catch(() => {});
    }

    const start = context.currentTime;
    const tone = context.createOscillator();
    const volume = context.createGain();
    tone.frequency.setValueAtTime(680, start);
    tone.frequency.exponentialRampToValueAtTime(340, start + 0.04);
    volume.gain.setValueAtTime(0, start);
    volume.gain.linearRampToValueAtTime(0.08, start + 0.003);
    volume.gain.exponentialRampToValueAtTime(0.001, start + 0.045);
    tone.connect(volume);
    volume.connect(context.destination);
    tone.onended = () => volume.disconnect();
    tone.start(start);
    tone.stop(start + 0.05);
  } catch {
    // Audio availability should never interfere with navigation.
  }
}
