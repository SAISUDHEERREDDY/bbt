export interface HlsAudioTrack {
  id: number;

  /**
   * String based language code indicating the type of language
   */
  lang: string;

  /**
   * Human readable name for the language
   */
  name: string;

  default: boolean;
  url: string;
  type: 'AUDIO';
  autoselect: boolean;
  forced: boolean;
  groupId: string;
}
