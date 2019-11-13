'use strict';

/**
 * Paymaya.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const sdk = require("paymaya-node-sdk");
const PaymayaSDK = sdk.PaymayaSDK;

module.exports = {

    checkout: async (items, buyer) => {
        const config = strapi.config.paymaya;
        PaymayaSDK.initCheckout(
            config.publicApiKey,
            config.secretApiKey,
            PaymayaSDK.ENVIRONMENT[config.env]
        );

        var YOUR_REQUEST_REFERENCE_NUMBER = "123456789";

        var Checkout = sdk.Checkout;
        var checkout = new Checkout();
        var Contact = sdk.Contact;
        var Address = sdk.Address;
        var Buyer = sdk.Buyer;
        var ItemAmountDetails = sdk.ItemAmountDetails;
        var ItemAmount = sdk.ItemAmount;
        var Item = sdk.Item;

        var addressOptions = {
            line1 : "9F Robinsons Cybergate 3",
            line2 : "Pioneer Street",
            city : "Mandaluyong City",
            state : "Metro Manila",
            zipCode : "12345",
            countryCode : "PH"
        };

        var contactOptions = {
            phone : "+63(2)1234567890",
            email : "paymayabuyer1@gmail.com"
        };

        var buyerOptions = {
            firstName : "John",
            middleName : "Michaels",
            lastName : "Doe"
        };
            
        var contact = new Contact();
        contact.phone = contactOptions.phone;
        contact.email = contactOptions.email;
        buyerOptions.contact = contact;

        var address = new Address();
        address.line1 = addressOptions.line1;
        address.line2 = addressOptions.line2;
        address.city = addressOptions.city;
        address.state = addressOptions.state;
        address.zipCode = addressOptions.zipCode;
        address.countryCode = addressOptions.countryCode;
        buyerOptions.shippingAddress = address;
        buyerOptions.billingAddress = address;
                
        /**
        * Construct buyer here
        */
        var buyer = new Buyer();
        buyer.firstName = buyerOptions.firstName;
        buyer.middleName = buyerOptions.middleName;
        buyer.lastName = buyerOptions.lastName;
        buyer.contact = buyerOptions.contact;
        buyer.shippingAddress = buyerOptions.shippingAddress;
        buyer.billingAddress = buyerOptions.billingAddress;


        var itemAmountDetailsOptions = {
            shippingFee: "14.00",
            tax: "5.00",
            subTotal: "50.00" 
        };

        var itemAmountOptions = {
            currency: "PHP",
            value: "69.00"
        };

        var itemOptions = {
            name: "Leather Belt",
            code: "pm_belt",
            description: "Medium-sv"
        };

        var itemAmountDetails = new ItemAmountDetails();
        itemAmountDetails.shippingFee = itemAmountDetailsOptions.shippingFee;
        itemAmountDetails.tax = itemAmountDetailsOptions.tax;
        itemAmountDetails.subTotal = itemAmountDetailsOptions.subTotal;
        itemAmountOptions.details = itemAmountDetails;

        var itemAmount = new ItemAmount();
        itemAmount.currency = itemAmountOptions.currency;
        itemAmount.value = itemAmountOptions.value;
        itemAmount.details = itemAmountOptions.details;
        itemOptions.amount = itemAmount;
        itemOptions.totalAmount = itemAmount;

        /**
        * Contruct item here
        */
        var item = new Item();
        item.name = itemOptions.name;
        item.code = itemOptions.code;
        item.description = itemOptions.description;
        item.amount = itemOptions.amount;
        item.totalAmount = itemOptions.totalAmount;

        // Add all items here
        var items = [];
        items.push(item);

        //redirect urls

        var redirectUrls = {
            "success": "https://myjoy.ph/success",
            "failed": "https://myjoy.ph/failed"
        }

        checkout.buyer = buyer;
        checkout.totalAmount = itemOptions.totalAmount;
        checkout.requestReferenceNumber = YOUR_REQUEST_REFERENCE_NUMBER;
        checkout.items = items;
        checkout.redirectUrl = redirectUrls;

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
          } catch(err) {
            console.log(err);
            return ctx.send('error');
          }

        return payment;
    }

};
