export type passkeyOptions = boolean | 'true' | 'false';

export enum ContentTypes {
  video = 'Video',
  folder = 'folder',
  document = 'doc',
  presentation = 'presentation'
}

export interface ContentLike {
  /**
   *  The human readable name of the piece of content
   */
  descname: string;

  /**
   * Thumbnail address to be used
   */
  thumbpath: string;

  /**
   * Type of content
   */
  type: ContentTypes;
}

export interface ContentBreadcrumb {
  name: string;
  path: string;
}

export interface Content extends ContentLike {
  /**
   * For how long does the content play
   */
  duration: string;
  /**
   * Last time updated
   */
  timestamp: string;

  /**
   *  the full path to the content
   */
  full_path: string;

  /**
   * Passkey
   */
  passkey: boolean;

  /**
   * A long human readable description
   */
  longdesc: string;

  /**
   * Breadcrumbs to this piece of content
   */
  breadcrumbs: ContentBreadcrumb[];
}

export abstract class ConcreteContent implements Content {
  protected constructor(
    public readonly descname: string,
    public readonly thumbpath: string,
    public readonly type: ContentTypes,
    public readonly duration: string,
    public readonly timestamp: string,
    public readonly full_path: string, // path to file
    public readonly passkey: boolean,
    public readonly path: string, // xpath
    public readonly longdesc: string = '',
    public readonly breadcrumbs: ContentBreadcrumb[]
  ) {}
}

export const enum TrackTypes {
  Captions = 'captions',
  Audio = 'audio'
}
export interface Track {
  kind: TrackTypes;
  label: string;
  srclang: string;
  src?: string;
  subtype?: 'stereo' | 'mono';
}

export interface AudioTrack extends Track {
  kind: TrackTypes.Audio;
}

export interface CaptionTrack extends Track {
  kind: TrackTypes.Captions;
}

export class VideoContent extends ConcreteContent {
  constructor(
    descname: string,
    thumbpath: string,
    duration: string,
    timestamp: string,
    full_path: string, // path to file
    passkey: boolean,
    public readonly tracks: Track[],
    path: string, // xpath
    longdesc: string = '',
    breadcrumbs: ContentBreadcrumb[] = []
  ) {
    super(
      descname,
      thumbpath,
      ContentTypes.video,
      duration,
      timestamp,
      full_path,
      passkey,
      path,
      longdesc,
      breadcrumbs
    );
  }
}

export class ContentDirectory implements ContentLike {
  public type = ContentTypes.folder;
  constructor(
    public readonly descname: string,
    public readonly thumbpath: string,
    public readonly path: string, // The xpath the server uses to find this
    public readonly count: number,
    public readonly depth: string,
    public readonly passkey: boolean,
    public readonly longdesc: string = '',
    public readonly breadcrumbs: ContentBreadcrumb[] = []
  ) {}
}

export interface ContentDocument extends ContentLike {
  file_base: string;
  size: string;
}

export interface PresentationFile {
  filePath: string;
  type: 'Video' | 'Image';
  customIcon: string;
  iconType: 'custom' | 'default';
  tracks: Track[];
}

export interface RawContentPresentation {
  name: string;
  desc: string;
  longdesc: string;
  thumb: string;
  type: ContentTypes;
  path: string;
  duration: string;
  mtime: string;
  passkey: passkeyOptions;
  files: PresentationFile[];
}

export interface ContentPresentation extends ContentLike {
  // desc, thumb, and type are omitted from the raw version
  // ContentLike has its own versions of these
  type: ContentTypes.presentation;
  name: string;
  longdesc: string;
  path: string;
  duration: string;
  mtime: string;
  passkey: boolean;
  files: PresentationFile[];
}
