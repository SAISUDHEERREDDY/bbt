import { ScrollToDirective } from './scroll-to.directive';

describe('ScrollToDirective', () => {
  let mockElement;
  it('should create an instance', () => {
    mockElement = {
      nativeElement: jasmine.createSpyObj('mock native element', [
        'scrollIntoView'
      ])
    };
    const directive = new ScrollToDirective(mockElement);
    expect(directive).toBeTruthy();
  });
});
