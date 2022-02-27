import fetch from 'node-fetch';
import {getCoapLedStatus, getPIRStatus, getMicStatus} from './coap.mjs';

// Database variables
const {InfluxDB, Point} = require('@influxdata/influxdb-client')
const url = 'https://us-east-1-1.aws.cloud2.influxdata.com'
const token = "8MkGu8tDM4AHKB69seAD_2mkaOxYlO7CR0xVP-UcQIkI2GnWJwiZ1TkLEq9nrHmjbU4Rj_BmsfarBqenAcjO7w=="
const org = 'rmm180000@utdallas.edu'
const bucket = 'mock_I'

// links to the influx database indicated by the url using the token
const database = new InfluxDB({
  url: url,
  token: token,
})

// writeApi allows write and query access to the bucket
const writeApi = database.getWriteApi(org, bucket)
writeApi.useDefaultTags({host: 'host1'})

const TOPOLOGY_ROUTE = 'http://localhost:80/topology';
let ipList = [];

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
        
        // Convert to datapoints
        let datapointMotion = PointMotion(pirState, ipList[i])
        let datapointNoise = PointNoise(micVal, ipList[i])
        
        // Send to database
        PlotPoint(datapointMotion)
        PlotPoint(datapointNoise)
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
