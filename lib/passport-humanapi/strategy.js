/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The HumanAPI authentication strategy authenticates requests by delegating to
 * HumanAPI using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occurred, `err` should be set.
 *
 * Options:
 *   - `clientID`      your HumanAPI application's App ID
 *   - `clientSecret`  your HumanAPI application's App Secret
 *   - `callbackURL`   URL to which HumanAPI will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new HumanApiStrategy({
 *         clientID:      '-the-app-id-',
 *         clientSecret:  '-the-app-secret-'
 *         callbackURL:   'https://www.example.com/auth/humanapi/callback',
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://user.humanapi.co/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://user.humanapi.co/oauth/token';
  options.scopeSeparator = options.scopeSeparator || '%20';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'humanapi';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from HumanAPI.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `humanapi`
 *   - `id`               the user's HumanAPI ID
 *   - `email`            the user's email address
 *   - `defaultTimeZone`  the user's default time zone
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {

  this._oauth2.getProtectedResource('https://api.humanapi.co/v1/human/profile', accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profiles', err)); }

    try {
      var json = JSON.parse(body);

      var profile = { provider: 'humanapi' };
      profile.id = json.userId;
      profile.email = json.email;
      profile.defaultTimeZone = json.defaultTimeZone;
      profile._raw = body;
      profile._json = json;

      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
