import detectLanguage from './detectLanguage';

describe('detect language', () => {
  test.each([
    ['안녕하세요!숙소 문의드리고싶어서요�혹시 집에서 바다가 보이나요?', 'ko'],
    [
      'hello, we are coming from germany and looking forward to staying at your place :)',
      'en',
    ],
    ["Qu'est-ce que vous faites?", 'en'], // detect french then reply english
    ['.', 'ko'],
    ['', 'ko'],
  ])('should detect `%s` to `%s`', async (input, output, done: any) => {
    const lang = await detectLanguage(input);
    expect(lang).toBe(output);
    done();
  });
});
