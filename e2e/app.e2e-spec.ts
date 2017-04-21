import { PomDashboardPage } from './app.po';

describe('pom-dashboard App', function() {
  let page: PomDashboardPage;

  beforeEach(() => {
    page = new PomDashboardPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
