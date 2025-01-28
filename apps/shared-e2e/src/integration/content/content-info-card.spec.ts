describe('content video', () => {
  beforeEach(() => cy.visit('/iframe.html?id=contentinfocardcomponent--video'));

  it('should render the component', () => {
    cy.get('shared-content-info-card').should('exist');
  });
});

describe('content presentation', () => {
  beforeEach(() =>
    cy.visit('/iframe.html?id=contentinfocardcomponent--presentation')
  );

  it('should render the component', () => {
    cy.get('shared-content-info-card').should('exist');
  });
});
