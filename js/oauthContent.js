async function init(){
    let form = await elementAppear('form');
    let code = form.querySelector('form textarea').value;
    chrome.runtime.sendMessage(new ExtensionMessage(OAUTH.key.authCodeReceived, {code}));
}
init();
