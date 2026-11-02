/* Compatibility helpers; existing sign-in/session flows remain in app.js. */
(function () {
  'use strict';
  window.GURU_AUTH = {
    getClient: function () { return window.sb || null; },
    getSession: async function () {
      var client = window.sb;
      if (!client || !client.auth) return null;
      var result = await client.auth.getSession();
      if (result.error) throw result.error;
      return result.data.session || null;
    }
  };
})();
