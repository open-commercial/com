import { SicEcomPage } from './app.po';

describe('sic-ecom App', () => {
  let page: SicEcomPage;

  beforeEach(() => {
    page = new SicEcomPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
