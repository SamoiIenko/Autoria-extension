chrome.runtime.onMessage.addListener(
    function(message, sender){
        switch (message.context) {
          case config.keys.login:
            login(message);
            break;
          case OAUTH.key.auth:
            OAUTH.request.openAuth(message, sender);
            break;
          case OAUTH.key.authCodeReceived:
            processUserInfo(message, sender);
            break;
          case config.keys.addCarInfo:
            addAdvertisement(message, sender);
            break;
          case config.keys.getCarInfo:
            getAllAdvertisements(message, sender);
            break;
          case config.keys.removeCar:
            removeCar(message);
            break;
          case config.keys.editCar:
            editCar(message);
            break;
          case config.keys.searchCar:
            searchCar(message);
            break;
        }
    }
);

chrome.runtime.onInstalled.addListener(async (details) => {

})

async function processUserInfo(message, sender) {
  await OAUTH.request.saveUser(message, sender);
}

function login(message) {

  $.ajax({
    url: `${config.baseUrl}/login`,
    type: 'POST',
    data: message.data,
    success: resp => {
      chrome.extension.sendMessage(new ExtensionMessage(message.context, resp));
    },
    error: resp => {
      chrome.extension.sendMessage(new ExtensionMessage(message.context, resp));
    }
  })
}

 async function addAdvertisement(message, sender) {

   const userId = await storageGet(config.keys.userId);

  $.ajax({
    url: `${config.baseUrl}/wishlist`,
    type: 'POST',
    data: {
      ...message.data, 
      userId
    },
    success: resp => {
      sendPageMessage(new ExtensionMessage(message.context, resp), sender.tab.id);
    },
    error: resp => {
      sendPageMessage(new ExtensionMessage(message.context, resp), sender.tab.id);
    }
  })
}

async function getAllAdvertisements(message, sender) {

  const userId = await storageGet(config.keys.userId);

  $.ajax({
    url: `${config.baseUrl}/get-adv`,
    type: 'GET',
    data: {
      userId
    },

    success: resp => {
      chrome.extension.sendMessage(new ExtensionMessage(message.context, resp));
      if(sender.tab) {  
        sendPageMessage(new ExtensionMessage(message.context, resp), sender.tab.id);
      }
    },
    error: resp => {
      chrome.extension.sendMessage(new ExtensionMessage(message.context, resp));
      if(sender.tab) {
      sendPageMessage(new ExtensionMessage(message.context, resp), sender.tab.id);
      }
    }
  })
}

function removeCar(message) {

  $.ajax({
    url: `${config.baseUrl}/remove-car`,
    type: 'DELETE',
    data: message.data,
    success: resp => {
      chrome.extension.sendMessage(new ExtensionMessage(message.context, resp));
    },
    error: resp => {
      chrome.extension.sendMessage(new ExtensionMessage(message.context, resp));
    }
  })
}

async function editCar(message) {

  const userId = await storageGet(config.keys.userId);

  $.ajax({
    url: `${config.baseUrl}/edit-car`,
    type: 'PATCH',
    data: {
          ...message.data,
          userId
        },
    success: resp => {
      chrome.extension.sendMessage(new ExtensionMessage(message.context, resp));
    },
    error: resp => {
      chrome.extension.sendMessage(new ExtensionMessage(message.context, resp));
    }
  })
}

async function searchCar(message) {

  const userId = await storageGet(config.keys.userId);
  
  $.ajax({
    url: `${config.baseUrl}/search-car`,
    type: 'POST',
    data: {
      ...message.data,
      userId
    },
    success: resp => {
      chrome.extension.sendMessage(new ExtensionMessage(message.context, resp));
    },
    error: resp => {
      chrome.extension.sendMessage(new ExtensionMessage(message.context, resp));
    }
  })
}
