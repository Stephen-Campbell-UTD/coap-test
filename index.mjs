import fetch from 'node-fetch';
import {getCoapLedStatus, getPIRStatus, getMicStatus} from './coap.mjs';

const TOPOLOGY_ROUTE = 'http://localhost:80/topology';

let ipList = [];

setInterval( async () => {
    const response = await fetch(TOPOLOGY_ROUTE);
    const topology = await response.json();
    ipList = topology.connectedDevices;

    // Send coap request for each ip in ipList except last ip (Border Router)
    console.log('COAP Requests: {');
    for(let i=0; i<ipList.length-1; i++) {
        console.log('  COAP Node:',ipList[i]);
        // let ledStates = getCoapLedStatus(ipList[i]);
        let pirState = getPIRStatus(ipList[i])
        let micVal = getMicStatus(ipList[i])
        // console.log('    -ledStates:', ledStates);
        console.log('    - pirState:', pirState);
        console.log('    - micVal:', micVal);
    }
    console.log('}\n');
}, 2000);
