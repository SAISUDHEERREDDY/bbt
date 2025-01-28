export enum VODListingTrigger {
  RequestPage = '[VOD Listing] Request Page',
  ReceivedPage = '[VOD Listing] Received Page',
  RequestCategories = '[VOD Listing] Request Categories',
  ReceivedCategories = '[VOD Listing] Received Categories',
  RequestContent = '[VOD Listing] Request Content',
  LoginUser = '[VOD Listing] Login User',
  LogoutUser = '[VOD Listing] Logout User',
  LogoutAll = '[VOD Listing] Logout All Users',
  SelectContent = '[VOD Listing] Select Content',

  // Presentation
  SetPresentationIndex = '[VOD Listing] Set Presentation Index',
  ShiftPresentationIndex = '[VOD Listing] Shift Presentation Index',

  // Preferred Tracks
  SetPreferredAudio = '[VOD Listing] Set Preferred Audio',
  SetPreferredCaption = '[VOD Listing] Set Preferred Caption',

  // Audio Tracks
  UpdateAudioTracks = '[VOD Listing] Update Audio Tracks',
  UpdateAudioTrack = '[VOD Listing] Update Audio Track',

  // Captions
  SetCaptionCode = '[VOD Listing] Set Caption Code'
}
