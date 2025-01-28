const RIGHT = '{rightArrow}';
const LEFT = '${leftArrow}';

describe('jumbotron-issue', () => {
  // make sure to turn on the HughesRemote feature.
  beforeEach(() => cy.visit('/?feature[HughesRemote]=true'));

  it('deep navigates correctly', () => {
    cy.intercept('GET', '/video_player/vod', {
      fixture: 'CarlMaloneTestData.json'
    });

    cy.wait(2000);

    function arrow(pause = 0, key = RIGHT) {
      cy.get('body').type(key);
      if (pause > 0) {
        cy.wait(pause);
      }
    }

    // move right
    for (let x = 0; x < 9; x++) {
      if (x < 7) {
        arrow(500);
      } else {
        arrow();
      }
    }

    // move left

    for (let x = 0; x < 4; x++) {
      arrow(0, LEFT);
    }
  });
});
