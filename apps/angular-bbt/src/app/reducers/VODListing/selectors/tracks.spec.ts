import { VODSelectedContent } from '../VODSelectedContent';
import { preferredAudio, preferredCaption } from './tracks';
import { TrackTypes } from '../../../bbtcommon/content';

describe('[VOD Selectors - tracks]', () => {
  let spanish;

  beforeEach(() => {
    spanish = {
      code: 'es',
      label: 'Spanish'
    };
  });

  describe('preferredAudio', () => {
    it('default to the global language if undefined', () => {
      const content: Partial<VODSelectedContent> = undefined;
      expect(preferredAudio.projector(content, spanish)).toEqual({
        kind: TrackTypes.Audio,
        label: spanish.label,
        srclang: spanish.code
      });
    });

    it('default to the global language if unset', () => {
      const content: Partial<VODSelectedContent> = {
        preferredCaption: undefined
      };

      const returned = preferredAudio.projector(content, spanish);

      expect(returned).toEqual({
        kind: TrackTypes.Audio,
        label: spanish.label,
        srclang: spanish.code
      });
    });

    it('use the set language in provider', () => {
      const content: Partial<VODSelectedContent> = {
        preferredAudio: {
          kind: TrackTypes.Audio,
          label: 'english',
          srclang: 'en'
        }
      };

      expect(preferredAudio.projector(content, spanish)).toEqual(
        content.preferredAudio
      );
    });
  });

  describe('preferredCaption', () => {
    it('default to the global language if undefined', () => {
      const content: Partial<VODSelectedContent> = undefined;

      const returned = preferredCaption.projector(content, spanish);

      expect(returned).toEqual({
        kind: TrackTypes.Captions,
        label: spanish.label,
        srclang: spanish.code
      });
    });

    it('default to the global language if unset', () => {
      const content: Partial<VODSelectedContent> = {
        preferredCaption: undefined
      };

      const returned = preferredCaption.projector(content, spanish);

      expect(returned).toEqual({
        kind: TrackTypes.Captions,
        label: spanish.label,
        srclang: spanish.code
      });
    });

    it('use the set language in provider', () => {
      const content: Partial<VODSelectedContent> = {
        preferredCaption: {
          kind: TrackTypes.Captions,
          label: 'english',
          srclang: 'en'
        }
      };

      expect(preferredCaption.projector(content, spanish)).toEqual(
        content.preferredCaption
      );
    });
  });
});
