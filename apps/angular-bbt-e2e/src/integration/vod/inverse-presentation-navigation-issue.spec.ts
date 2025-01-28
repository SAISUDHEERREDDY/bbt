describe('inverse-presentation-navigation-issue', () => {
  // make sure to turn on the HughesRemote feature.
  beforeEach(() => cy.visit('/?feature[HughesRemote]=true'));

  it('navigates to the back button when up arrow pushed', () => {
    cy.intercept('GET', '/video_player/vod', {
      fixture: 'CarlMaloneTestData.json'
    });

    // navigate into a presentation
    cy.get('#menu-21-folder-142').click();
    cy.get('#menu-142-folder-278').click();
    cy.get('#menu-278-item-368').click();

    // enter into a presentation
    cy.get('.landing-buttons > .button').click();
    cy.get('body').type('{enter}');

    // press up arrow
    cy.get('body').type('{upArrow}');
    cy.get('.back-button').should('have.focus');
  });
});
