import { Track } from './content';
import { HasTracksPipe } from './has-tracks.pipe';

describe('HasTracksPipe', () => {
  let pipe: HasTracksPipe;

  beforeEach(() => {
    pipe = new HasTracksPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return true if there are caption tracks', () => {
    expect(
      pipe.transform({ tracks: [{ kind: 'captions' } as Track] })
    ).toBeTruthy();
  });

  it('should return false if there are no tracks', () => {
    expect(pipe.transform({})).toBeFalsy();
  });

  it('should return false if there are tracks in the tracks array', () => {
    expect(pipe.transform({ tracks: [] })).toBeFalsy();
  });

  it('should return false if there are audio tracks', () => {
    expect(
      pipe.transform({ tracks: [{ kind: 'audio' } as Track] })
    ).toBeFalsy();
  });
});
