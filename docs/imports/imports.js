const rnExp = (s) => s.replaceAll('export ', '');
const imports = {
  uuidv7: {
    url: 'https://unpkg.com/uuidv7@1.0.2/dist/index.js',
    fn: s => rnExp(s),
  },
};