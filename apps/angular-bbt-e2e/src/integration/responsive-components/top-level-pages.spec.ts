describe('responsive-top-level-lages', () => {
  // make sure to turn on the HughesRemote feature.
  beforeEach(() => cy.visit('/'));

  it('navigates the vod page', () => {
    cy.intercept('GET', '/video_player/vod', {
      fixture: 'CarlMaloneTestData.json'
    });

    cy.viewport(599, 959);
  });
});
