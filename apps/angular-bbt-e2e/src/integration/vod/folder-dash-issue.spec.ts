describe('folder-dash-issue', () => {
  // make sure to turn on the HughesRemote feature.
  beforeEach(() => cy.visit('/'));

  it('it does not show a dash with the folder type', () => {
    cy.intercept('GET', '/video_player/vod', {
      fixture: 'CarlMaloneTestData.json'
    });

    cy.get(
      '#menu-18-item-92 > bbt-content-card > shared-content-info-card > shared-thumbnail-card > .card-container > .card-thumb-container > .card-gradient-container > :nth-child(1) > .card-header-container > .card-content-header-button > .secondary-info > span'
    )
      .invoke('text')
      .should('eq', '00:37');

    cy.get(
      '#menu-19-folder-127 > bbt-content-card > shared-content-info-card > shared-thumbnail-card > .card-container > .card-thumb-container > .card-gradient-container > :nth-child(1) > .card-header-container > .card-content-header-button > .secondary-info > span'
    ).should('not.exist');
  });
});
