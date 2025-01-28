describe('content-listing', () => {
  beforeEach(() => cy.visit('/vod/root/menu/none/selection'));

  it('should show content', () => {
    // login
    // all the keys can be used if a different code is required

    cy.intercept('GET', '/video_player/vod', {
      fixture: 'vod.json'
    });

    cy.intercept('/lms/content/7/revolution1.png', {
      fixture: 'revolution1.png'
    });
    cy.intercept('/lms/content/1/charade1.png', {
      fixture: 'charade1.png'
    });
  });
});
