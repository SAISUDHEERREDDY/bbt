describe('local-content', () => {
  beforeEach(() => cy.visit('/local/manage'));

  it('should show empty', () => {
    // login
    // all the keys can be used if a different code is required
    cy.get('[data-cy=keypad-1]').click();
    cy.get('[data-cy=keypad-2]').click();
    cy.get('[data-cy=keypad-3]').click();
    cy.get('[data-cy=keypad-4]').click();
    cy.get('[data-cy=keypad-5]').click();
    cy.get('[data-cy=login-button-enter]').click();

    cy.intercept('GET', '/video_player/vod?type=local', {
      fixture: 'vod-type-local-empty.json'
    });
  });
});
