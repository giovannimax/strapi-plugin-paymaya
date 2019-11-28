'use strict';

/**
 * Paymaya.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const sdk = require("paymaya-node-sdk");
const PaymayaSDK = sdk.PaymayaSDK;


module.exports = {

    checkout: async (items, buyer, refNumber, totalAmnt, redUrls) => {

        const config = strapi.config.paymaya;
        PaymayaSDK.initCheckout(
            config.publicApiKey,
            config.secretApiKey,
            PaymayaSDK.ENVIRONMENT[config.env]
        );


        var Customization = require("paymaya-node-sdk").Customization;
        var customization = new Customization();

        customization.logoUrl = "https://myjoy.ph/t@co/images/myjoy-logo-new.png";
        customization.iconUrl = "https://cdn.paymaya.com/production/checkout_api/customization_example/youricon.ico";
        customization.appleTouchIconUrl = "https://cdn.paymaya.com/production/checkout_api/customization_example/youricon_ios.ico";
        customization.customTitle = "MyJoy Checkout Page";
        customization.colorScheme = "#ed0085c";
       
        customization.set(() => {
            console.log("Custom set");
        });

        var Checkout = sdk.Checkout;
        var checkout = new Checkout();

        checkout.buyer = buyer;
        checkout.totalAmount = totalAmnt;
        checkout.requestReferenceNumber = refNumber;
        checkout.items = items;
        checkout.redirectUrl = redUrls;

        console.log(checkout);

        var createPayment = new Promise(function(resolve, reject) {
            checkout.execute(function (error, response) {
                if (error) {
                    // handle error
                   return reject(error);
                } else {
                    // track response.checkoutId
                    // redirect to response.redirectUrl
                    return resolve(response);
                }
            });
          });
      
          var payment = null;
          try {
            payment = await createPayment;
            return payment;
          } catch(err) {
            console.log(err);
            return err;
          }
    },
    getCheckout: async (id) => {
        const config = strapi.config.paymaya;
        PaymayaSDK.initCheckout(
            config.publicApiKey,
            config.secretApiKey,
            PaymayaSDK.ENVIRONMENT[config.env]
        );

        var Checkout = sdk.Checkout;
        var checkout = new Checkout();

        checkout.id = id;
        console.log("Checkout info:");
        console.log(checkout);

        var getPayment = new Promise(function(resolve, reject) {
            checkout.retrieve(function (error, response) {
                if (error) {
                    // handle error
                   return reject(error);
                } else {
                    // track response.checkoutId
                    // redirect to response.redirectUrl
                    return resolve(response);
                }
            });
          });
      
          var payment = null;
          try {
            payment = await getPayment;
            return payment;
          } catch(err) {
            console.log(err);
            return err;
          }
    }
};
