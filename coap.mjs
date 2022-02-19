import { Buffer } from 'buffer';
import coap from 'coap';

const ledStates = {
  rled: null,
  gled: null
}

const getOptions = {
  observe: false,
  host: null,
  pathname: '/led',
  method: 'get',
  confirmable: 'true',
  retrySend: 'true',
  options: {},
};

// const putOptions = {
//   observe: false,
//   host: null,
//   pathname: '/led',
//   method: 'put',
//   confirmable: 'true',
//   retrySend: 'true',
//   options: {},
// };

export const COAP_LED = {
  RED: 0x0,
  GREEN: 0x1,
};

export const COAP_NODE_STATE = {
  ON: 0x0,
  OFF: 0x1,
};

export function getCoapLedStatus(targetIP) {
  getOptions.host = targetIP;
  const getRequest = coap.request(getOptions);
  
  getRequest.on('response', (getResponse) => {
    ledStates.rled = !!getResponse.payload.readUInt8(0);
    ledStates.gled = !!getResponse.payload.readUInt8(1);
  });

  getRequest.end();
  return ledStates;
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