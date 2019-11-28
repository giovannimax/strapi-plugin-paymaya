'use strict';

/**
 * Paymaya.js controller
 *
 * @description: A set of functions called "actions" of the `paymaya` plugin.
 */
const sdk = require("paymaya-node-sdk");

module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here
    let config = strapi.config.paymaya;

    var ItemAmountDetails = sdk.ItemAmountDetails;
    var ItemAmount = sdk.ItemAmount;
    var Item = sdk.Item;
    var Contact = sdk.Contact;
    var Buyer = sdk.Buyer;

    let order = await strapi.models.orders
    .findOne({ _id: ctx.query.orderId});

    let delIndexOf = null;
    delIndexOf = order.items.findIndex(i => i.id === "del-fee");
    

    console.log(order);
    console.log(delIndexOf);

    var itemAmountOptions = {
       currency: config.currency
    };

    var itemOptions = {};

    var itemAmountDetails = new ItemAmountDetails();

    if(delIndexOf > 0) {
      itemAmountDetails.shippingFee = order.items[delIndexOf].price;
    }   

    itemAmountDetails.subTotal = order.meta.total;
    itemAmountOptions.details = itemAmountDetails;
    
    var totalAmount = new ItemAmount();
      totalAmount.currency = itemAmountOptions.currency;
      totalAmount.value = itemAmountDetails.subTotal;
      totalAmount.details = itemAmountOptions.details;

    config.currency;
    let items = [];

    order.items.forEach(x => {

      if(x.id !== 'del-fee') {
        var itemAmount = new ItemAmount();
        itemAmount.currency = itemAmountOptions.currency;
        itemAmount.value = parseFloat(x.price) * x.qty;
        itemAmount.details = itemAmountOptions.details;

        console.log(itemAmount)

        var item = new Item();
        item.name = x.name;
        item.code = x.id;
        item.quantity = x.qty
        item.amount = itemAmount;
        item.totalAmount = itemAmount;

        items.push(item);
      }
      
    });

    var redirectUrls = {
      "success": `${config.successRedirect}?orderId=${ctx.query.orderId}`,
      "failure": `${config.failedRedirect}?orderId=${ctx.query.orderId}`
  }

var contact = new Contact();
contact.phone = order.meta.phone;
contact.email = order.user.email;

var buyer = new Buyer();
buyer.firstName = order.user.name;
buyer.contact = contact;

    //let res = 'succes';
    let res = await strapi.plugins.paymaya.services.paymaya.checkout(items, buyer, order._id, totalAmount, redirectUrls);
    if(res.checkoutId) {
      let payment = await Payments.create({
        payID: res.checkoutId,
        meta: {
            amount: order.meta.total
        },
        orderId: ctx.query.orderId,
        status: "PENDING",
        date: new Date(),
        redirectUrl: res.redirectUrl
     });
      return ctx.send(res);
    }
    // Send 200 `ok`
    return ctx.send({error: res});
  },
  
  verify: async (ctx) => {
    let payment = await strapi.models.payments
    .findOne({ orderId: ctx.query.orderId});
    let res = await strapi.plugins.paymaya.services.paymaya.getCheckout(payment.payID);
    let stat;
    switch(res.paymentStatus) {
        case 'PAYMENT_SUCCESS' : stat = 'SUCCESS'; break;
        case 'PAYMENT_FAILED' : stat = 'FAILED'; break;
        case 'PAYMENT_EXPIRED' : stat = 'EXPIRED'; break;
        case 'PAYMENT_CANCELLED' : stat = 'CANCELLED'; break;
        case 'PENDING_PAYMENT' : stat = 'PENDING'; break;
        default: stat = res.paymentStatus;
    }
    await Payments.updateOne({payID: payment.payID}, {status: stat});
    if(res.paymentStatus === 'PAYMENT_SUCCESS') {
      await Orders.updateOne({_id: ctx.query.orderId}, {status: "Paid"});
      await strapi.plugins.karix.services.karix.sendOrderSms(ctx.query.orderId);
      return ctx.redirect('/postpayment/success.html');
    }
    // return ctx.send(res);
    await Orders.updateOne({_id: ctx.query.orderId}, {status: "Payment failed"});
    return ctx.redirect('/postpayment/failed.html');
  }
};
