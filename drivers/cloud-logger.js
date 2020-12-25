'use strict';

const Homey = require('homey');
const https = require('https');

class CloudLogger {

	sendLog(message, timestamp, type, serialNumber) { 
		timestamp *= 1000;
		message.timestamp = new Date(timestamp).toISOString();
		message.type = type;
		message.PartitionKey = serialNumber;
		message.RowKey = (8640000000000000 - timestamp).toString().padStart(19, '0');

		const data = JSON.stringify(message);
		// console.log("Log: " + data);

		const options = {
			hostname: `${Homey.env.AZURE_STORAGE_ACCOUNT_NAME}.table.core.windows.net`,
			method: 'POST',
			port: 443,
			path: `/${Homey.env.AZURE_STORAGE_TABLE_NAME}?${Homey.env.AZURE_STORAGE_SAS_TOKEN}`,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(data),
				'x-ms-date': message.timestamp
			},
		};
		
		const req = https.request(options, (res) => {
			// console.log(`STATUS: ${res.statusCode}`);
			// console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
			res.setEncoding('utf8');
			res.on('data', (chunk) => {
			//   console.log(`BODY: ${chunk}`);
			});
			res.on('end', () => {
			//   console.log('No more data in response.');
			});
		  });
		  
		  req.on('error', (e) => {
			console.error(`problem with request: ${e.message}`);
		  });
		  
		  // Write data to request body
		  req.write(data);
		  req.end();
	}	
}

module.exports = CloudLogger;