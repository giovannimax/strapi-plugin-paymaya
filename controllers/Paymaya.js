'use strict';

/**
 * Paymaya.js controller
 *
 * @description: A set of functions called "actions" of the `paymaya` plugin.
 */

module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here.
    let res = await strapi.plugins.paymaya.services.paymaya.checkout("item", "buyer");
    // Send 200 `ok`
    ctx.send({
      message: 'ok',
      response: res
    });
  }
};
