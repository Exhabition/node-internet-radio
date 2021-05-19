const icecast = require("./lib/icecast.js");
const shoutcast = require("./lib/shoutcast.js");
const icystream = require("./lib/icystream.js");

const StreamSource = {
  SHOUTCAST_V1: "SHOUTCAST_V1",
  SHOUTCAST_V2: "SHOUTCAST_V2",
  STREAM: "STREAM",
  ICECAST: "ICECAST",
};

/**
 * @param {String} url - The url of the station you want to receive information of.
 * @param {function(error, result):void} callback - The url of the station you want to receive information of.
 * @param {String} [method] - Either SHOUTCAST_V1, SHOUTCAST_V2, STREAM or ICECAST
 */
function getStationInfo(url, callback, method) {
  let methodHandler = undefined;

  switch (method) {
    case StreamSource.SHOUTCAST_V1:
      methodHandler = shoutcast.getShoutcastV1Station;
      break;
    case StreamSource.SHOUTCAST_V2:
      methodHandler = shoutcast.getShoutcastV2Station;
      break;
    case StreamSource.ICECAST:
      methodHandler = icecast.getIcecastStation;
      break;
    case StreamSource.STREAM:
      methodHandler = icystream.getStreamStation;
      break;
    default:
  }

  // If we have a specific method to fetch from then
  // attempt only that.
  if (methodHandler) {
    return methodHandler(url, callback);
  }

  // Resolve the promise from the async function and return the station with the callback
  // We shouldn't mix callbacks and promises but for backwards compatibility I am breaking
  // the law here......
  return findStation(url)
    .then(station => callback(null, station))
    .catch(err => callback(err));

  /**
   * @param {String} url - Url of given stream
   * @returns {Object|Error} Mixed (object if successful, string if error)
  */
  async function findStation(url) {
    this.results = await V1(url);
    // Find which provider has our station
    if (this.results == null || typeof this.results == "undefined") {
      this.results = await V2(url);
    }
    if (this.results == null || typeof this.results == "undefined") {
      this.results = await Ice(url);
    }
    if (this.results == null || typeof this.results == "undefined") {
      this.results = await Icy(url);
    }
    return this.results;

    // ====================================================================================
    // =                  Promise wrapper functions                                       =
    // ====================================================================================
    function V1(url) {
      return new Promise((resolve, reject) => {
        try {
          shoutcast.getShoutcastV1Station(url, function (error, station) {
            resolve(station);
          });
        } catch (err) {
          reject(err);
        }
      });
    }
    function V2(url) {
      return new Promise((resolve, reject) => {
        try {
          shoutcast.getShoutcastV2Station(url, function (error, station) {
            resolve(station);
          });
        } catch (err) {
          reject(err);
        }
      });
    }
    function Icy(url) {
      return new Promise((resolve, reject) => {
        try {
          icystream.getStreamStation(url, function (error, station) {
            resolve(station);
          });
        } catch (err) {
          reject(err);
        }
      });
    }
    function Ice(url) {
      return new Promise((resolve, reject) => {
        try {
          icecast.getIcecastStation(url, function (error, station) {
            resolve(station);
          });
        } catch (err) {
          reject(err);
        }
      });
    }
  }
}

module.exports.StreamSource = StreamSource;
module.exports.getStationInfo = getStationInfo;
