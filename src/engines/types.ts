export interface Engine {
  // Begin sounding the given chord. May restart internal timeline.
  start(notes: number[]): void;
  // Replace the held chord without restarting the timeline (smooth chord change while latched).
  setNotes(notes: number[]): void;
  // Stop sounding and release everything cleanly.
  stop(): void;
  // BPM updated externally — engine should reschedule.
  setBpm(bpm: number): void;
}
