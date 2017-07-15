import { CorrosiveContentionPage } from './app.po';

describe('corrosive-contention App', () => {
  let page: CorrosiveContentionPage;

  beforeEach(() => {
    page = new CorrosiveContentionPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
