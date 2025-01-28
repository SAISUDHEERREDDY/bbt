describe('slide-view-thumbnail-issue', () => {
  // make sure to turn on the HughesRemote feature.
  beforeEach(() => cy.visit('/?feature[HughesRemote]=true'));

  it('show images with the presentation slide view', () => {
    cy.intercept('GET', '/video_player/vod', {
      fixture: 'CarlMaloneTestData.json'
    });

    cy.intercept('GET', '/video_player/vod/368?type=content', {
      fixture: 'slide-view-images.json'
    });

    cy.get('#menu-21-folder-142').click();
    cy.get('#menu-142-folder-278').click();
    cy.get('#menu-278-item-368').click();

    cy.get('.landing-buttons > .button').click();
    cy.get('body').type('{enter}');
  });
});
