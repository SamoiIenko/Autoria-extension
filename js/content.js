const add = `
<svg version="1.1" class="add" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
    viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
    <path d="M256,0C114.833,0,0,114.833,0,256s114.833,256,256,256s256-114.853,256-256S397.167,0,256,0z M256,472.341
        c-119.275,0-216.341-97.046-216.341-216.341S136.725,39.659,256,39.659S472.341,136.705,472.341,256S375.295,472.341,256,472.341z
        "/>
    <path d="M355.148,234.386H275.83v-79.318c0-10.946-8.864-19.83-19.83-19.83s-19.83,8.884-19.83,19.83v79.318h-79.318
        c-10.966,0-19.83,8.884-19.83,19.83s8.864,19.83,19.83,19.83h79.318v79.318c0,10.946,8.864,19.83,19.83,19.83
        s19.83-8.884,19.83-19.83v-79.318h79.318c10.966,0,19.83-8.884,19.83-19.83S366.114,234.386,355.148,234.386z"/>
</svg>`;

const added = `
<svg version="1.1" class="added" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
    viewBox="0 0 426.667 426.667" style="enable-background:new 0 0 426.667 426.667;" xml:space="preserve">
    <path d="M421.876,56.307c-6.548-6.78-17.352-6.968-24.132-0.42c-0.142,0.137-0.282,0.277-0.42,0.42L119.257,334.375
        l-90.334-90.334c-6.78-6.548-17.584-6.36-24.132,0.42c-6.388,6.614-6.388,17.099,0,23.713l102.4,102.4
        c6.665,6.663,17.468,6.663,24.132,0L421.456,80.44C428.236,73.891,428.424,63.087,421.876,56.307z"/>
</svg>`;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.context) {
        
    }
});


init();

async function init(){
    const carsList = await elementAppear('.ticket-item', null, true);
    const result = (await requestBackground(new ExtensionMessage(config.keys.getCarInfo))).data;
    for(const card of carsList) {

        const info = await getCarInfo(card);
        const footer = card.querySelector('.footer_ticket');
        const button = document.createElement('button');
        const isExist = result.filter((elem) => elem.car_id == info.id).length > 0;

        button.className = (isExist) ? 'check-button choose-car-button' : 'my-button choose-car-button';
        button.innerHTML = (isExist) ? `${added} <p>Added</p>` : `${add} <p>Add</p>`;
        button.onclick = async () => {
            
            if(isExist) {
                return;
            }
            const result = await requestBackground(new ExtensionMessage(config.keys.addCarInfo, info));
            console.log(result);
            button.className = 'check-button choose-car-button';
            button.innerHTML = `${added} <p>Added</p>`;
        }

        if(footer) {
            footer.appendChild(button);
        }


    }
}

async function getCarInfo(card) {
    
    const id = card.dataset.advertisementId;
    const title = card.querySelector('.ticket-title');
    const price =  card.querySelector('.price-ticket span > span');
    const image =  card.querySelector('.ticket-photo img');
    const link =  card.querySelector('.m-link-ticket');
    const mileage =  card.querySelector('.js-race');
    const location =  card.querySelector('.js-location');
    const fuel =  card.querySelector('.characteristic .item-char:nth-child(3)');
    const gearbox =  card.querySelector('.characteristic .item-char:nth-child(4)');
    const description =  card.querySelector('.descriptions-ticket');
    const date = card.querySelector('.footer_ticket span > span');

    return {
        id,
        title: title.innerText.replace(/\'/g, "''") ?? '',
        price: parseInt(price.innerText.replace(/\u00a0|\s/g, '')) ?? '',
        image: image.src ?? '',
        link: link.href ?? '',
        mileage: isNaN(parseInt(mileage.innerText)) ? 0 : parseInt(mileage.innerText),
        location: location.innerText.trim().replace(/\'/g, "''") ?? '',
        fuel: fuel.innerText.split(',')[0].trim() ?? '',
        volume: parseFloat(fuel.innerText.split(',')[1]) ?? '',
        gearbox: gearbox.innerText.trim() ?? '',
        description: description.innerText.replace(/\'/g, "''") ?? '',
        date: date.innerText.trim().split('.').reverse().join('-')
    }
}
