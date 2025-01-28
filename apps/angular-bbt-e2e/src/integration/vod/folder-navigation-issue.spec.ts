describe('folder-navigation-issue', () => {
  // make sure to turn on the HughesRemote feature.
  beforeEach(() => cy.visit('/?feature[HughesRemote]=true'));

  it('deep navigates correctly', () => {
    cy.intercept('GET', '/video_player/vod', {
      fixture: 'THD-FolderNavigationIssue.json'
    });

    // navigate down into the menus
    cy.get('#menu-21-folder-142').click();
    cy.get('#menu-142-folder-278').click();
    cy.get('#menu-278-item-232').click();

    // launch the movie
    cy.get('.landing-buttons > .button').click();

    // go back twice to stop the movie and go back in the menu
    cy.get('body').type('d').type('d');

    // get the third breadcrumb
    cy.get('.breadcrumbs > :nth-child(3) > span')
      .invoke('text')
      .should('eq', ' Before the Apron ');
    cy.get('#menu-278-item-232').should('have.focus');

    // go back once more to level 2 breadcrumb
    cy.get('body').type('d');

    // get the second breadcrumb
    cy.get('.breadcrumbs > :nth-child(2) > span')
      .invoke('text')
      .should('eq', ' Associate Onboarding ');
    cy.get('#menu-142-folder-278').should('have.focus');

    // go back once more to level 1
    cy.get('body').type('d');

    // get top level
    // make sure the navigation gives the correct hash
    cy.url().should('include', 'selection#menu-2');
    cy.get('#menu-21-folder-142').should('have.focus');
  });

  it('shallow navigates correctly', () => {
    cy.intercept('GET', '/video_player/vod', {
      fixture: 'THD-FolderNavigationIssue.json'
    });

    // navigate down into the menus
    cy.get('#menu-20-folder-135').click();
    cy.get('#menu-135-item-165').click();
    cy.get('.landing-buttons > .button').click();

    // go back twice to get to the calling menu
    cy.get('body').type('d').type('d');

    // get the second breadcrumb
    cy.get('.breadcrumbs > :nth-child(2) > span')
      .invoke('text')
      .should('eq', ' Benefits ');

    cy.get('#menu-135-item-165').should('have.focus');

    // go back once
    cy.get('body').type('d');

    // get top level
    // make sure the navigation gives the correct hash
    cy.url().should('include', 'selection#menu-20-folder-135');
    cy.get('#menu-20-folder-135').should('have.focus');
  });
});
