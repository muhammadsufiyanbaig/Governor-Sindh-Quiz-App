const { insertKey } = require("../models/keyModel");
const { getCurrentTimeFormatted } = require("./timeUtils");

const keyGenerator = (function () {
  let currentKey = null;
  let timer = null;

  function generateRandomKey() {
    const randomString = Math.random().toString(36).substr(2, 6);
    return `${randomString}`;
  }

  async function updateKey() {
    currentKey = generateRandomKey();
    console.log(`New Key Generated: ${currentKey}`);
    await insertKey(currentKey, getCurrentTimeFormatted());
  }

  function startKeyGeneration() {
    updateKey();
    timer = setInterval(() => {
      updateKey();
    }, 60 * 60 * 1000);
  }

  function stopKeyGeneration() {
    if (timer) {
      clearInterval(timer);
    }
  }

  function getCurrentKey() {
    return currentKey;
  }

  return {
    start: startKeyGeneration,
    stop: stopKeyGeneration,
    getCurrentKey: getCurrentKey,
  };
})();

module.exports = keyGenerator;
