"use strict"
const express = require('express');
const pug = require('pug');
const bodyParser = require("body-parser");
const MCrypt = require('mcrypt').MCrypt;
const CryptoJS = require('crypto-js');
const crypto = require('crypto');

const app = express();

app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({extended :false}));

app.get('/', (req, res) => {
    res.render('index', {});
});

app.post('/sendData', (req, res) => {
    let merchant_key = req.body.merchant_key;
    let merchant_id = req.body.merchant_id;
    let aggregator_id = 'paygate';

    let return_elements = {};
    return_elements.me_id = merchant_id;
    let txn_details = aggregator_id + '|' + merchant_id.toString() + '|' +  req.body.order_no.toString() + '|' + req.body.amount.toString() + '|'+ req.body.country + '|' + req.body.currency + '|' + req.body.txn_type + '|' + req.body.success_url + '|'+ req.body.failure_url + '|' + req.body.channel;
    //console.log(merchant_key);
    return_elements.txn_details = encode(txn_details.toString().trim(), merchant_key.toString());
    
    let pg_details = req.body.pg_id + '|' + req.body.paymode + '|' + req.body.scheme + '|' + req.body.emi_months;
    return_elements.pg_details = encode(pg_details, merchant_key);
    
    let card_details =  req.body.card_no +'|' + req.body.exp_month + '|' + req.body.exp_year + '|' + req.body.cvv2 +'|' + req.body.card_name;
    return_elements.card_details = encode(card_details, merchant_key);
    
    let cust_details = req.body.cust_name + '|' + req.body.email_id + '|' + req.body.mobile_no +'|' + req.body.unique_id + '|'+ req.body.is_logged_in;
    return_elements.cust_details = encode(cust_details, merchant_key);
    
    let bill_details = req.body.bill_address + '|' + req.body.bill_city + '|' + req.body.bill_state +
        '|' + req.body.bill_country + '|' + req.body.bill_zip;
    return_elements.bill_details = encode(bill_details, merchant_key);
    
    let ship_details = req.body.ship_address + '|' + req.body.ship_city + '|' + req.body.ship_state + '|'
         + req.body.ship_country + '|' + req.body.ship_zip + '|' + req.body.ship_days + '|' + req.body.address_count;
    return_elements.ship_details = encode(ship_details, merchant_key);
    let item_details = req.body.item_count + '|' + req.body.item_value + '|' + req.body.item_category;
    return_elements.item_details = encode(item_details, merchant_key);
    let other_details = req.body.udf_1 + '|' + req.body.udf_2 + '|' + req.body.udf_3 + '|' + req.body.udf_4 +
        '|' + req.body.udf_5;
    return_elements.other_details = encode(other_details, merchant_key);
	
    res.render('sendData', return_elements);
});

app.post('/response', (req, res) => {
    let return_elements = {};
    let merchant_key = "FgmDFWEm7kJLgOrNCVE0Ee1BSoyF5yILHHFvSjRdg+c=";
    let txn_response1 = req.body.txn_response ? req.body.txn_response : '';
    txn_response1 = decrypt(txn_response1, merchant_key);
    let txn_response_arr = txn_response1.split('|');	
	let txn_response = {};
    txn_response.ag_id = txn_response_arr[0]?txn_response_arr[0]:'';
    txn_response.me_id = txn_response_arr[1]?txn_response_arr[1]:'';
    txn_response.order_no = txn_response_arr[2]?txn_response_arr[2]:'';
    txn_response.amount = txn_response_arr[3]?txn_response_arr[3]:'';
    txn_response.country = txn_response_arr[4]?txn_response_arr[4]:'';
    txn_response.currency = txn_response_arr[5]?txn_response_arr[5]:'';
    txn_response.txn_date = txn_response_arr[6]?txn_response_arr[6]:'';
    txn_response.txn_time = txn_response_arr[7]?txn_response_arr[7]:'';
    txn_response.ag_ref = txn_response_arr[8]?txn_response_arr[8]:'';
    txn_response.pg_ref = txn_response_arr[9]?txn_response_arr[9]:'';
    txn_response.status = txn_response_arr[10]?txn_response_arr[10]:'';
    //txn_response.txn_type = txn_response_arr[11]?txn_response_arr[11]:'';
    txn_response.res_code = txn_response_arr[11]?txn_response_arr[11]:'';
    txn_response.res_message = txn_response_arr[12]?txn_response_arr[12]:'';

	return_elements.txn_response = txn_response;
	
    let pg_details1 = req.body.pg_details ? req.body.pg_details: '';
    pg_details1 = decrypt(pg_details1, merchant_key);
    let pg_details_arr = pg_details1.split('|');
	let pg_details = {};
    pg_details.pg_id = pg_details_arr[0]?pg_details_arr[0]:'';
    pg_details.pg_name = pg_details_arr[1]?pg_details_arr[1]:'';
    pg_details.paymode = pg_details_arr[2]?pg_details_arr[2]:'';
    pg_details.emi_months = pg_details_arr[3]?pg_details_arr[3]:'';

	return_elements.pg_details = pg_details;
	
    let fraud_details1 = req.body.fraud_details ? req.body.fraud_details : '';
    fraud_details1 = decrypt(fraud_details1, merchant_key);
    let fraud_details_arr = fraud_details1.split('|');
	let fraud_details = {};
    fraud_details.fraud_action = fraud_details_arr[0]?fraud_details_arr[0]:'';
    fraud_details.fraud_message = fraud_details_arr[1]?fraud_details_arr[1]:'';
    fraud_details.score = fraud_details_arr[0]?fraud_details_arr[0]:'';

	return_elements.fraud_details = fraud_details;
	
    let other_details1 = req.body.other_details ? req.body.other_details : '';
    other_details1 = decrypt(other_details1, merchant_key);
    let other_details_arr = other_details1.split('|');
	let other_details = {};
    other_details.udf_1 = other_details_arr[0]?other_details_arr[0]:'';
    other_details.udf_2 = other_details_arr[1]?other_details_arr[1]:'';
    other_details.udf_3 = other_details_arr[2]?other_details_arr[2]:'';
    other_details.udf_4 = other_details_arr[3]?other_details_arr[3]:'';
    other_details.udf_5 = other_details_arr[4]?other_details_arr[4]:'';

	return_elements.other_details = other_details;
	
    res.render('response', return_elements);
});



app.listen(8000, ()=>{
    console.log('server started');
});

function encode(text, skey) {
	var base64Iv = "0123456789abcdef";  // generate your key
	var key = CryptoJS.enc.Base64.parse(skey);
	var iv = CryptoJS.enc.Utf8.parse(base64Iv);
	var encrypted = CryptoJS.AES.encrypt(text, key, {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});    
    var decryptedData = encrypted.toString();
	return decryptedData;	
}


function decrypt(text, skey) {
    var base64Iv = "0123456789abcdef";
    var key = CryptoJS.enc.Base64.parse(skey);
    var iv = CryptoJS.enc.Utf8.parse(base64Iv);
    var decrypted = CryptoJS.AES.decrypt(text, key, {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});
    var decryptedData = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedData;
}
