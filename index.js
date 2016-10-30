//> var bitcore = require('bitcore-lib');
//undefined
//> var rand_buffer = bitcore.crypto.Random.getRandomBuffer(32);
//undefined
//> var rand_number = bitcore.crypto.BN.fromBuffer(rand_buffer);
//undefined
//> rand_number
//<BN: a704803130b493d2904d851e2f5f456355fb62318d13c056676442b095f741b4>
//> rand_number.toS
//undefined
//> rand_number.toString
//[Function: toString]
//> rand_number.toString()
//'75544197851363651525001973931637507965785014555542909685099003437165877608884'
//> rand_number.toString()
//'75544197851363651525001973931637507965785014555542909685099003437165877608884'
//> var address = new bitcore.PrivateKey(rand_number).toAddress();
//undefined
//> address
//<Address: 1EGsdMDdwWuENv79rJpyEQnd8ZjGA61eX6, type: pubkeyhash, network: livenet>
//> var address = new bitcore.PrivateKey(rand_number).toAddress('testnet');
//undefined
//> address
//<Address: mtnpvQJckYLVA2amZsoM4KzwzZKy5RybmV, type: pubkeyhash, network: testnet>
//> var address = new bitcore.PrivateKey(rand_number).toAddress('testnet');
//undefined
//> address
//<Address: mtnpvQJckYLVA2amZsoM4KzwzZKy5RybmV, type: pubkeyhash, network: testnet>
//> bitcore.PrivateKey('testnet').toWIF();
//'cPmPeqgKQkmqMQWrs87JrMkNtepjL8zsasNwF8Hrsfj4tjvPy3gB'

console.log('\n');
var bitcore = require('bitcore-lib');
var privateKeyWIF = 'cPmPeqgKQkmqMQWrs87JrMkNtepjL8zsasNwF8Hrsfj4tjvPy3gB';
var privateKey = bitcore.PrivateKey.fromWIF(privateKeyWIF);
var address = privateKey.toAddress();
console.log('address: ', address);

var value = new Buffer('this is a way to generate an address from a string--risky--not random--guessable!!!');
var hash = bitcore.crypto.Hash.sha256(value);
var bn = bitcore.crypto.BN.fromBuffer(hash);
var address2 = new bitcore.PrivateKey(bn, 'testnet').toAddress();
console.log('address2: ', address2);

var Insight = require('bitcore-explorers').Insight;
var insight = new Insight('testnet');
insight.getUnspentUtxos(address, function(err, utxos) {
	if (err) {
		console.log('error: ', err);
	} else {
		console.log(utxos);
		var tx = bitcore.Transaction();
		tx.from(utxos);
		tx.to(address2, 10000);//address has 0.0045BTC but we need to pay transaction fee, so lowering the transfer amount to address2
		tx.change(address); //since all inputs must be spent completed, and extra amount will generate a new output and the change amount of go to this address. Though the best privacy practice is to generate a new address for the change
		tx.fee(50000);
		tx.sign(privateKey);
		console.log('transaction: ', tx.toObject());
		tx.serialize();
		console.log('serialized output: ', tx.serialize());

		var scriptIn = bitcore.Script(tx.toObject().inputs[0].script);
		console.log('input script string: ', scriptIn.toString());
		var scriptOut = bitcore.Script(tx.toObject().outputs[0].script);
		console.log('output script string: ', scriptOut.toString());

		insight.broadcast(tx, function(err, returnedTxId) {
			if (err) {
				console.log('error: ', err);
			} else {
				console.log('successful broadcast: ' + returnedTxId);
			}
		});
	}
});
