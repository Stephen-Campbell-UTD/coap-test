import fetch from 'node-fetch';
import {getCoapLedStatus, getPIRStatus, getMicStatus} from './coap.js';

// ipList and topology
const TOPOLOGY_ROUTE = 'http://localhost:80/topology';
let ipList = [];

// Database variables
import {InfluxDB, Point} from '@influxdata/influxdb-client'
const url = 'https://us-east-1-1.aws.cloud2.influxdata.com'
const token = "OUuCncH4-9COxLt2O-XNljDWctyAQtmb2A24pMJbugGTmpFkoT_aTXszOg198UZjgTF6wAAseb-UQ_Z52GxbCw=="
const org = 'rmm180000@utdallas.edu'
const bucket = 'mock_II'

// links to the influx database indicated by the url using the token
const database = new InfluxDB({
  url: url,
  token: token,
})

// writeApi allows write and query access to the bucket
const writeApi = database.getWriteApi(org, bucket)
writeApi.useDefaultTags({host: 'host1'})

// Interval between data collection
const dataPollInt = 2000

setInterval( async () => {
    // Get IPs
    const response = await fetch(TOPOLOGY_ROUTE);
    const topology = await response.json();
    ipList = topology.connectedDevices;

    // Send coap request for each ip in ipList except last ip (Border Router)
    console.log('COAP Requests: {');
    for(let i=0; i<ipList.length-1; i++) {
        console.log('  COAP Node:',ipList[i]);

        // Get data from nodes
        // let ledStates = getCoapLedStatus(ipList[i]);
        let pirState = getPIRStatus(ipList[i])
        let micVal = getMicStatus(ipList[i])

        // Print data from nodes
        // console.log('    -ledStates:', ledStates);
        console.log('    - pirState:', pirState);
        console.log('    - micVal:', micVal);

        // Send to database
        if(pirState !== undefined) {
          let datapointMotion = PointMotion(pirState, ipList[i])
          PlotPoint(datapointMotion)
        }
        if(micVal !== undefined) {
          let datapointNoise = PointNoise(micVal, ipList[i])
          PlotPoint(datapointNoise)
        }
    }
    console.log('}\n');
}, dataPollInt);

// Returns a point converted from motion data
function PointMotion(dat, ip) {
  return new Point("motionReading").tag("sensor",ip).floatField("value",dat).timestamp(new Date())
}

// Returns a point converted from noise data
function PointNoise(dat, ip) {
  return new Point("noiseReading").tag("sensor",ip).floatField("value",dat).timestamp(new Date())
}

// Send a datapoint to the database
// Returns null
function PlotPoint(datapoint) {
  try {
    writeApi.writePoint(datapoint)
    console.log("Sent datapoint to database.")
  } catch (err) {
    console.log("Error while sending to database. Error: " + err)
  }
}
