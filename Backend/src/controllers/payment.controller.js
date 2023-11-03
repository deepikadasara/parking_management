const {createPaymentMethod, deletePaymentMethod, makeOneTimePayment, refundPayment, updatePaymentIntent} = require('../thirdParty/StripeAPI');
const {getPaymentID, getPaymentMethodsID, updatePaymentMethod, getMemberships, getPaymentMethodsByUser, addPaymentMethod, updatePayment, addPayment} = require('../thirdParty/payment.firestore');
const {verifyBillingDetails, compareRanks, timestampToDate} = require('../utilities/util');
<<<<<<< HEAD
const {getUser} = require('./users.controller');
=======
>>>>>>> 9e7eb84 (Customer subgroup commit)


/**
 *
 * @param {string} paymentID - payment id
 * @return {object} result
 */
async function verifyPaymentID(paymentID) {
  try {
    const result = await getPaymentID(paymentID);
    if (result) {
      return {message: 'payment is verified successfully', success: true};
    }
    return {message: 'payment is failed to verify', success: false};
  } catch (err) {
    console.error('Error occred while fetching verifying the paymentID: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID  - unique id of user
 * @param {string} regionID - region id
 * @param {string} parkingLotRank  - parking lot rank
 * @return {object} result
 */
async function checkMembershipStatus(userID, regionID, parkingLotRank) {
  try {
    const result = await getMemberships(userID, regionID);

    if (result) {
      let finalEndDate=new Date();
      let membershipStatus='SILVER';
<<<<<<< HEAD

      result.forEach((element) => {
        if (finalEndDate.getTime()<timestampToDate(element.endDate).getTime()) {
=======
      result.forEach((element) => {
        if (finalEndDate<timestampToDate(element.endDate)) {
>>>>>>> 9e7eb84 (Customer subgroup commit)
          finalEndDate = timestampToDate(element.endDate);
          membershipStatus = element.membershipType;
        }
      });
<<<<<<< HEAD

      // write a code
=======
>>>>>>> 9e7eb84 (Customer subgroup commit)
      if (finalEndDate<=new Date()) {
        return {message: 'membership status is invalid', success: false};
      }
      if (!compareRanks(membershipStatus, parkingLotRank)) {
        return {message: 'membership status is valid but cannot be used for higher parkingLots than membership status', success: false};
      }
      return {message: 'membership status is available for this parking lot', success: true};
    }
<<<<<<< HEAD
    return {message: 'there are no memberships for this user', success: false};
=======
    return {message: 'there is no membership for the user', success: false};
>>>>>>> 9e7eb84 (Customer subgroup commit)
  } catch (err) {
    console.error('Error occred while checking the membership status of user: ', err.message);
    throw err;
  }
}

/**
 *
<<<<<<< HEAD
 * @param {string} parkingLotRank
 * @param {object} memberships
 * @return {object} result
 */
function pickMembershipID(parkingLotRank, memberships) {
  const platinumMemberships = [];
  const goldMemberships = [];
  const silverMemberships = [];

  const currentTime = new Date();
  memberships.forEach((membership) => {
    if (membership.membershipType === 'PLATINUM' && timestampToDate(membership.endTime) > currentTime) {
      platinumMemberships.push(membership);
    } else if (membership.membershipType === 'GOLD' && timestampToDate(membership.endTime) > currentTime) {
      goldMemberships.push(membership);
    } else if (membership.membershipType === 'SILVER' && timestampToDate(membership.endTime) > currentTime) {
      silverMemberships.push(membership);
    }
  });

  if (parkingLotRank === 'PLATINUM') {
    if (platinumMemberships.length === 0) {
      return null;
    } else if (platinumMemberships.length === 1) {
      return platinumMemberships[0].membershipID;
    } else {
      const maxExpireTime = Math.max.apply(null, platinumMemberships.map((membership) => timestampToDate(membership.endTime).getTime()));
      const filteredMemberships = platinumMemberships.filter((membership) => new Date(membership.expireTime).getTime() === maxExpireTime.getTime());
      return filteredMemberships[0].membershipID;
    }
  } else if (parkingLotRank === 'GOLD') {
    if (platinumMemberships.length > 0) {
      return pickMembershipID('platinum', memberships);
    } else if (goldMemberships.length === 0) {
      return null;
    } else if (goldMemberships.length === 1) {
      return goldMemberships[0].membershipID;
    } else {
      const maxExpireTime = new Date(Math.max.apply(null, goldMemberships.map((membership) => new Date(membership.expireTime))));
      const filteredMemberships = goldMemberships.filter((membership) => new Date(membership.expireTime).getTime() === maxExpireTime.getTime());
      return filteredMemberships[0].membershipID;
    }
  } else if (parkingLotRank === 'SILVER') {
    if (platinumMemberships.length > 0) {
      return pickMembershipID('platinum', memberships);
    } else if (goldMemberships.length > 0) {
      return pickMembershipID('gold', memberships);
    } else if (silverMemberships.length === 0) {
      return null;
    } else if (silverMemberships.length === 1) {
      return silverMemberships[0].membershipID;
    } else {
      const maxExpireTime = new Date(Math.max.apply(null, silverMemberships.map((membership) => new Date(membership.expireTime))));
      const filteredMemberships = silverMemberships.filter((membership) => new Date(membership.expireTime).getTime() === maxExpireTime.getTime());
      return filteredMemberships[0].membershipID;
    }
  } else {
    return null;
  }
}
/**
 *
=======
>>>>>>> 9e7eb84 (Customer subgroup commit)
 * @param {string} userID  - unique id of the user
 * @return {object} result
 */
async function getUserPaymentMethods(userID) {
  try {
    const result = await getPaymentMethodsByUser(userID);
    if (result) {
      return {message: 'got the user paymentmethods', data: result, success: true};
    }
    return {message: 'no saved paymentmethods', data: [], success: true};
  } catch (err) {
    console.error('Error occred while fetching the payment methods of user: ', err.message);
    throw err;
  }
}


/**
 *
 * @param {string} userID
 * @param {string} paymentType
 * @param {object} paymentToken
 * @param {object} BillingDetails
 * @return {object} result
 */
async function savePaymentMethod(userID, paymentType, paymentToken, BillingDetails) {
  try {
    if (!['card', 'us_bank_account'].includes(paymentType)) {
      return {message: 'payment method is not valid', success: false};
    }
    if (!verifyBillingDetails(BillingDetails)) {
      return {message: 'Billing details is not valid', success: false};
    }
<<<<<<< HEAD
    const userResult = await getUser(userID, '');
    if (!userResult) {
      return {message: 'user does not exists in our app', success: false};
    }
    const result = await createPaymentMethod(userID, paymentType, paymentToken, BillingDetails, userResult.StripeCustomerID);
=======

    const result = await createPaymentMethod(userID, paymentType, paymentToken, BillingDetails);
>>>>>>> 9e7eb84 (Customer subgroup commit)
    if (result) {
      delete result['livemode'];
      delete result['object'];
      result['userID'] = userID;
      result['active'] = true;
      // save this data in the firebase
      const dataSaveResult = await addPaymentMethod(result);

      if (dataSaveResult) {
      // card.brand, card.checks, card.exp_onth, card.exp_year, card.funding, card.last4
      // save the details of payment id in the database
<<<<<<< HEAD
        return {message: 'payment method is saved', success: true, data: result};
=======
        return {message: 'payment method is saved', success: true};
>>>>>>> 9e7eb84 (Customer subgroup commit)
      }
      return {message: 'payment method is saved in stripe but not in database', success: false};
    }
    return {message: 'payment method is not saved', success: false};
  } catch (err) {
    console.error('Error occured at controller while saving a payment method: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID - unique id
 * @param {string} paymentMethodID - payment method ID
 * @return {object} response
 */
<<<<<<< HEAD
async function deletePM(userID, paymentMethodID) {
  try {
    // check if this paymentMethodId is belongs to the user
    // if yes just mark it as deleted in the database
    // no then return unauthorised access
    // const result = await deletePaymentMethod(paymentMethodID);
    // if (result) {
    //   console.log(result);
    //   return {message: 'success', success: true};
    // }
    const result = await getPaymentMethodsID(paymentMethodID);
    if (result) {
      if (!(result[0].userID === userID)) {
        return {message: 'paymentID is not related to you. improper access', success: false};
      }
      const deletePaymentMethodResult = await deletePaymentMethod(paymentMethodID, result.customer);
      if (!deletePaymentMethodResult) {
        return {message: 'failed to delete the payment method from the stripe', success: false};
      }
      const deletedResult = await updatePaymentMethod(paymentMethodID, {active: false});
      if (deletedResult) {
        return {message: 'successfully deleted the payment method ID', success: true};
      }
      return {message: 'failed to delete the payment method from the stripe', success: false};
    }

    return {message: 'cannot find the paymentID in the DB', success: false};
  } catch (err) {
    throw err;
  }
}

/**
 *
 * @param {string} userID - unique id of the user
=======
// async function deletePaymentMethod(userID, paymentMethodID) {
//   try {
//     // check if this paymentMethodId is belongs to the user
//     // if yes just mark it as deleted in the database
//     // no then return unauthorised access
//     // const result = await deletePaymentMethod(paymentMethodID);
//     // if (result) {
//     //   console.log(result);
//     //   return {message: 'success', success: true};
//     // }
//     const result = await getPaymentMethodsID(paymentMethodID);
//     if (result) {
//       if (!(result[0].userID === userID)) {
//         return {message: 'paymentID is not related to you. improper access', success: false};
//       }
//       const deletedResult = await updatePaymentMethod(paymentMethodID, {active: false});
//       if (deletedResult) {
//         return {message: 'successfully deleted the payment method ID', success: true};
//       }
//       return {message: 'failed to delete the payment method from the user', success: false};
//     }

//     return {message: 'cannot find the paymentID in the DB', success: false};
//   } catch (err) {
//     throw err;
//   }
// }

/**
 *
 * @param {string} userId - unique id of the user
>>>>>>> 9e7eb84 (Customer subgroup commit)
 * @param {string} amount - unique id of the user
 * @param {string} description - description of the payment
 * @param {string} savedpaymentMethodID - saved payment method ID
 * @param {string} newPaymentMethodID - new payment method ID
 * @param {string} newPaymentMethodType - new payment method type, card, bank account
 */
async function makePayment(userID, amount, description, savedpaymentMethodID='', newPaymentMethodID='', newPaymentMethodType='card') {
  try {
<<<<<<< HEAD
=======
    // if(savedpaymentMethodID){
    //
    // check if the paymentMethod ID exists in the users
    // }
>>>>>>> 9e7eb84 (Customer subgroup commit)
    if (!savedpaymentMethodID && newPaymentMethodID && !['card'].includes(newPaymentMethodType)) {
      return {message: 'invalid fields', success: false};
    }
    const parsedAmount = parseFloat(amount).toFixed(2);
    if (isNaN(parsedAmount)) {
      return {message: 'invalid amount type', success: false};
    }
    if (!(description.length > 3 && description.length <=200)) {
      return {message: 'description length is not in the range of 3-200', success: false};
    }
<<<<<<< HEAD
    const userResult = await getUser(userID, '');
    if (!userResult) {
      return {message: 'user does not exists in our app', success: false};
    }
    let finalPayment='newPayment';
    if (savedpaymentMethodID) {
      const paymentMethodResult = await getPaymentMethodsID(savedpaymentMethodID);
      if (!paymentMethodResult) {
        return {message: 'payment method does not exists in our app', success: false};
      }
      if (!(paymentMethodResult[0].userID === userID)) {
        return {message: 'paymentID is not related to you. improper access', success: false};
      }
      if (!paymentMethodResult[0].active) {
        return {message: 'payment method is not active', success: false};
      }
      finalPayment = 'savedPayment';
    }
    const amountInCents = parseInt(parsedAmount*100);
    const customerID = userResult.StripeCustomerID || '';
    const result = await makeOneTimePayment(userID, amountInCents, description, savedpaymentMethodID, customerID, newPaymentMethodID, newPaymentMethodType);
    console.log(result)
=======
    const amountInCents = parseInt(parsedAmount*100);
    const result = await makeOneTimePayment(userID, amountInCents, description, savedpaymentMethodID, newPaymentMethodID, newPaymentMethodType);
>>>>>>> 9e7eb84 (Customer subgroup commit)
    if (result) {
      const paymentData = {
        userID: userID,
        reason: 'charge',
        paymentID: result.id,
        paymentMoneyInCents: result.amount,
        recievedMoneyInCents: result.amount_received,
        paymentMethodID: result.payment_method,
        payment_method_types: result.payment_method_types,
        payment_status: result.status,
        metadata: result.metadata,
        description: result.description,
        canceled_at: result.canceled_at,
        cancellation_reason: result.cancellation_reason,
        created_at: result.created,
        currency: result.currency,
        customer: result.customer,
        last_payment_error: result.last_payment_error,
        latest_charge: result.latest_charge,
<<<<<<< HEAD
        isRefund: false,
        refundAmount: 0,
        paymentType: finalPayment,
=======
>>>>>>> 9e7eb84 (Customer subgroup commit)
      };
      const addedResult = await addPayment(result.id, paymentData);
      if (addedResult) {
        return {message: 'payment successfull', data: result, id: result.id, success: true};
      }
      return {message: 'payment made successfully but cannot add it into database', data: result, success: false};
    }
    return {message: 'payment failed', success: false};
  } catch (err) {
    console.log('Error occured while doing the bussiness logic for makign payment: ', err.message);
    throw err;
  }
}

/**
 *
<<<<<<< HEAD
 * @param {string} userID - amount of the payment
 * @param {string} paymentID - payment id of the paid payment
 */
async function refundPaidPayment(userID, paymentID) {
=======
 * @param {string} amount - amount of the payment
 * @param {string} paymentID - payment id of the paid payment
 */
async function refundPaidPayment(amount, paymentID) {
>>>>>>> 9e7eb84 (Customer subgroup commit)
  try {
    // check if the userId has paymentID
    // pass the paymentID to function to check that payment is valid for the refund
    // make necessary changes after the refund i.e cleanup
<<<<<<< HEAD
    const paymentResult = await getPaymentID(paymentID);
    if (!paymentResult) {
      return {message: 'paymentID is not valid', success: false};
    }
    if (!(paymentResult.userID === userID)) {
      return {message: 'paymentID is not related to you. improper access', success: false};
    }
    if (paymentResult.isRefund) {
      return {message: 'payment is already refunded', success: false};
    }
    const amountInCents = paymentResult.paymentMoneyInCents;
    const result = await refundPayment(amountInCents, paymentID);
    if (result) {
      const updatedData = {
        isRefund: true,
        refundAmount: amountInCents,
        redundID: result.id,
      };
      const updatedResult = await updatePayment(paymentID, updatedData );
=======
    const parsedAmount = parseFloat(amount).toFixed(2);
    if (isNaN(parsedAmount)) {
      return {message: 'invalid amount type', success: false};
    }
    const amountInCents = parseInt(parsedAmount*100);
    const result = await refundPayment(amountInCents*0.8, paymentID);
    if (result) {
      const updatedResult = await updatePayment(paymentID, 'refund', parsedAmount*0.8);
>>>>>>> 9e7eb84 (Customer subgroup commit)
      if (!updatedResult) {
        console.log('Payment is updated but the result is not updated in the database ');
      }
      return {message: 'payment refunded successfully', data: result, success: true};
    }
    return {message: 'payment refund failed', success: false};
  } catch (err) {
    console.log('Error occured while doing the bussiness logic for refunding payment: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID - unique id of the user
 * @param {string} newAmount - new amount of the payment
<<<<<<< HEAD
 * @param {string} paymentIntentID - payment id of the intent
 * @return {object} - result response
 */
async function updatePaymentAmount(userID, newAmount, paymentIntentID) {
=======
 * @param {string} initialAmount - original amount of the payment
 * @param {string} paymentIntentID - payment id of the intent
 * @return {object} - result response
 */
async function updatePaymentAmount(userID, newAmount, initialAmount, paymentIntentID) {
>>>>>>> 9e7eb84 (Customer subgroup commit)
  try {
    // check if the userID has the paymentIntentID
    // check the intialamount with original paymentAmount
    // check updatedAmount is greater than intialAmount
<<<<<<< HEAD
    const parsedNewAmount = parseFloat(newAmount).toFixed(2);

    if (isNaN(parsedNewAmount)) {
      return {message: 'invalid amount type', success: false};
    }
    const paymentIntentResult = await getPaymentID(paymentIntentID);
    if (!paymentIntentResult) {
      return {message: 'invalid paymentIntentID', success: false};
    }
    if (!(paymentIntentResult.userID === userID)) {
      return {message: 'paymentIntentID is not related to you. improper access', success: false};
    }
    if (paymentIntentResult.payment_status === 'succeeded') {
      return {message: 'paymentIntentID is succeeded so cannot updated the payment amount now', success: false};
    }
    const newAmountInCents = parseInt(parsedNewAmount*100);
    if ( paymentIntentResult.paymentMoneyInCents > newAmountInCents) {
      return {message: 'new amount is less than the original payment amount', success: false};
    }

    const result = await updatePaymentIntent(paymentIntentID, newAmountInCents);
    if (result) {
      console.log(result);
      // update the result in the database
      const updatedData = {
        paymentMoneyInCents: result.amount,
        recievedMoneyInCents: result.amount_received,
        payment_status: result.status,
        metadata: result.metadata,
        canceled_at: result.canceled_at,
        cancellation_reason: result.cancellation_reason,
        currency: result.currency,
        customer: result.customer,
        last_payment_error: result.last_payment_error,
        latest_charge: result.latest_charge,
      };
      const updatedResult = await updatePayment(paymentIntentID, updatedData);
      if (!updatedResult) {
        console.log('Payment is updated but the result is not updated in the database');
        return {message: 'Payment is updated but the result is not updated in the database ', success: false};
      }
=======
    const parsedInitialAmount = parseFloat(initialAmount).toFixed(2);
    const parsedNewAmount = parseFloat(newAmount).toFixed(2);

    if (isNaN(parsedNewAmount) && isNaN(parsedInitialAmount)) {
      return {message: 'invalid amount type', success: false};
    }
    if (parsedInitialAmount > parsedNewAmount) {
      return {message: 'cannot update the new amount to less price than inital amount of the payment', success: false};
    }
    // const initialAmountInCents = parseInt(parsedInitialAmount*100);
    const newAmountInCents = parseInt(parsedNewAmount*100);
    const result = await updatePaymentIntent(paymentIntentID, newAmountInCents);
    if (result) {
>>>>>>> 9e7eb84 (Customer subgroup commit)
      return {message: 'successfully updated the payment amount of the paymentIntent', success: true, data: result};
    }
    return {message: 'failed to update the payment intent', success: false};
  } catch (err) {
    console.log('Error occured while doing the bussiness logic for updating the payment amount: ', err.message);
    throw err;
  }
}

<<<<<<< HEAD
module.exports = {getUserPaymentMethods, checkMembershipStatus, verifyPaymentID, savePaymentMethod, deletePM, makePayment, refundPaidPayment, updatePaymentAmount};
=======
module.exports = {getUserPaymentMethods, checkMembershipStatus, verifyPaymentID, savePaymentMethod, deletePaymentMethod, makePayment, refundPaidPayment, updatePaymentAmount};
>>>>>>> 9e7eb84 (Customer subgroup commit)
