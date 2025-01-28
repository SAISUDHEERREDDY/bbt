export enum UserInputEvent {
  // starting a 0 caused conflicts with real characters in ASCII range
  None = 300, // For unused or unrecognized input
  //None, // For unused or unrecognized input

  // Old Hughes remote
  /**
   * Input could mean play or pause (e.g. MediaPlayPause)
   */
  PlayPause,
  TrackNext,
  TrackPrevious,
  Caption,

  // Simple Hughes Remote
  Power,
  Home,
  // This button is on the simple remote and I dunno what it should do.
  Mouse,
  Menu,
  Back,
  VolumeUp,
  VolumeDown,

  // Required By LG remote
  Pause,
  Rewind,
  Stop,
  Play,
  FastForward
}

export type SanitizedUserInput = number | string | UserInputEvent;
