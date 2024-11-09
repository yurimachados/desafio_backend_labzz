import lusca from 'lusca';

const csrfMiddleware = lusca({
  csrf: {
    angular: false,
    cookie: 'XSFR-TOKEN',
    header: 'x-csrf-token',
  },
  xframe: 'SAMEORIGIN',
});

export default csrfMiddleware;
