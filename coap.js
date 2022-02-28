import coap from 'coap';

const ledPath = "/led"
const pirPath = "/pir"
const micPath = "/mic"

let pirVal = undefined;
let micVal = undefined;
const ledStates = {
  rled: null,
  gled: null
}

const getOptions = {
  observe: false,
  host: null,
  pathname: '/',
  method: 'get',
  confirmable: 'true',
  retrySend: 'true',
  options: {},
};

const COAP_LED = {
  RED: 0x0,
  GREEN: 0x1,
};

const COAP_NODE_STATE = {
  ON: 0x0,
  OFF: 0x1,
};

function getCoapLedStatus(targetIP) {
  getOptions.host = targetIP;
  getOptions.pathname = ledPath;
  const getRequest = coap.request(getOptions);

  getRequest.on('response', (getResponse) => {
    ledStates.rled = !!getResponse.payload.readUInt8(0);
    ledStates.gled = !!getResponse.payload.readUInt8(1);
  });

  getRequest.end();
  return ledStates;
}

function getPIRStatus(targetIP) {
  getOptions.host = targetIP;
  getOptions.pathname = pirPath;
  const getRequest = coap.request(getOptions);

  getRequest.on('response', (getResponse) => {
    //console.log(getResponse);
    pirVal = getResponse.payload.readUInt8(0);

  });

  getRequest.end();
  return pirVal;
}

function getMicStatus(targetIP) {
  getOptions.host = targetIP;
  getOptions.pathname = micPath;
  const getRequest = coap.request(getOptions);

  getRequest.on('response', (getResponse) => {
    //console.log(getResponse);
    micVal = getResponse.payload.readFloatLE(0);
  });

  getRequest.end();
  return micVal;
}

export {
  getMicStatus, getPIRStatus, getCoapLedStatus
}

// export function updateCoapLed(targetIP, ledType, shouldIlluminate) {
//   putOptions.host = targetIP;
//   const putRequest = coap.request(putOptions);

//   const targetState = shouldIlluminate ? COAP_NODE_STATE.ON : COAP_NODE_STATE.OFF;
//   const payload = Buffer.from([ledType, targetState]);
//   putRequest.write(payload);
//   // console.log('putRequest:', putRequest);

//   putRequest.on('response', (putResponse) => {
//     // console.log('putResponse:', putResponse);
//   });

//   putRequest.end();
// }
