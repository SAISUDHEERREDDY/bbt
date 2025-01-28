import { RemoveXPathLayerPipe } from './remove-xpath-layer.pipe';

describe('removeXPathLayer pipe', () => {
  let pipe;

  beforeEach(() => {
    pipe = new RemoveXPathLayerPipe();
  });

  it('should do nothing if passed a null', () => {
    expect(pipe.transform(null)).toBeNull();
  });

  it('should do nothing if passed an empty string', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should strip away one lay of an xpath if passed a valid xpath', () => {
    expect(pipe.transform('top[0]/content')).toBe('top[0]');
  });

  it('should strip away one lay of an xpath if passed an indexed xpath', () => {
    expect(pipe.transform('top[0]/content[3]')).toBe('top[0]');
  });

  it('should strip away one lay of an xpath if path is deeply nested', () => {
    const base = 'top[0]/content[3]/more[2]/evenMore';

    expect(pipe.transform(`${base}/toBeRemoved`)).toBe(base);
  });
});
