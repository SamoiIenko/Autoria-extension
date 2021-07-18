var OAUTH = {
    key: {
        auth: "auth",
        authCodeReceived: "auth-code-received",
        pushToSpreadsheet: "push-to-spreadsheet",
    },

    //OAUTH Config
    config: {
        securityToken: "elmmessenger",
        scope: "email profile",
    },

    
    
    authRequestTab: null,

    user: {
        info: "oauth-user-info",
        refreshToken: "user-refresh-token",
        tokenInfo: function(token = "") {return `https://oauth2.googleapis.com/tokeninfo?id_token${token}`},
        signIn: function(){
            let params = {
                response_type: "code",
                client_id: config.client_id,
                scope: OAUTH.config.scope,
                redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
                state: `extension_token=${OAUTH.config.securityToken}`,
                nonce: OAUTH.getHash(),
                access_type: "offline",
            };
            let url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
            for (let param of Object.keys(params)){
                url.searchParams.set(param, params[param]);
            }
            return url.href;
        },
        tokenUrl: "https://accounts.google.com/o/oauth2/token",

        infoPayload: function(token){
            return {
                "code": token,
                "client_id": config.client_id,
                "redirect_uri": "urn:ietf:wg:oauth:2.0:oob",
                "grant_type": "authorization_code"
            }
            
        
        },
        refreshPayload: function(token){
            return {
                "refresh_token": token,
                "client_id": config.client_id,
                "redirect_uri": "urn:ietf:wg:oauth:2.0:oob",
                "grant_type": "refresh_token"
            }
            
        
        },
        profileUrl: "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
    },

    calendar: {
        id: "primary",
        create: {
            url: "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            body: function (start, end, summary) {
                return {
                    "summary": summary,
                    "end": {
                        "dateTime": end
                    },
                    "start": {
                        "dateTime": start
                    },
                }
            }
        },
        getList: {
            url: `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
            body: function () {
                let timeMin, timeMax;
                let date = new Date();

                date.setDate(date.getDate() - 7);
                min = date.toISOString();
               
                date = new Date();
                max = date.toISOString();

                return {
                    "timeMax": timeMax,
                    "timeMin": timeMin
                }
            }
        }
    },

    spreadsheet: {
        id: "spreadsheet-id",
        create: {
            url: "https://sheets.googleapis.com/v4/spreadsheets",
            body: function(spreadsheetName = "Automatically Created Spreedsheet", sheetName = "Sheet1", headers = []){
                let headerObjects = [];
                for(let header of headers){
                    headerObjects.push({
                        "userEnteredValue": {
                        "stringValue": header
                        }
                    });
                };
                return {
                    "properties": {
                  
                        "title": spreadsheetName
                        
                      
                    },
                    "sheets": [{
                        "properties": {
                            "title": sheetName
                        },
                        "data": [
                            {
                                "rowData": [
                                    {
                                        "values": headerObjects
                                    }
                                ]
                            }
                        ]
                    }]
                  
                }
                
            }
        },
        append: {
            url: function(spreadsheetId){
                return `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Saved Questions:append?valueInputOption=USER_ENTERED`;
            },
            body: function(values){
                return {
                    "majorDimension": "ROWS",
                    "values": values
                }
            }
        },
    },
    request: {
        refreshUserInfo: () =>{
            return new Promise(async (resolve) =>{
                let refreshToken = await storageGet(OAUTH.user.refreshToken);
                if(refreshToken != ''){
                    let payload = OAUTH.user.refreshPayload(refreshToken);
                    let userInfo = await OAUTH.request.getGoogleUserData(payload);
                    await storageSet({key: OAUTH.user.info, value: userInfo});
                    resolve(userInfo);
                }
                resolve();
            });
        },

        createCalendarEvent: (start, end, summary) => {
            return new Promise(async (resolve) => {
                let userInfo = await OAUTH.request.refreshUserInfo();
                const body = OAUTH.calendar.create.body(start, end, summary);
                if(!userInfo){
                    resolve({success: false});
                }else{
                    $.ajax({
                        type: "POST",
                        crossDomain: true,
                        headers: {
                            'Authorization': `Bearer ${userInfo.access_token}`,
                        },
                        traditional: true,
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(body),
                        url: OAUTH.calendar.create.url,
                        dataType: "json",
                        success: (result, textStatus, xhr) => {
                            console.log(result);
                            result.status = xhr.status;
                            resolve(result);
                        },
                        error: (result) => {
                            console.log(result);
                            resolve(result);
                        },
                    });
                }
            });
        },

        getCalendarEvents: () => {
            return new Promise(async (resolve) => {
                let userInfo = await OAUTH.request.refreshUserInfo();
                const body = OAUTH.calendar.getList.body();

                if(!userInfo){
                    resolve({success: false});
                    return;
                }

                $.ajax({
                    type: "GET",
                    crossDomain: true,
                    headers: {
                        'Authorization': `Bearer ${userInfo.access_token}`,
                    },
                    traditional: true,
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(body),
                    url: OAUTH.calendar.getList.url,
                    dataType: "json",
                    success: (result, textStatus, xhr) => {
                        console.log(result);
                        result.status = xhr.status;
                        resolve(result);
                    },
                    error: (result) => {
                        console.log(result);
                        resolve(result);
                    },
                });

            })
        },

        getProfileInfo: () => {
            return new Promise(async (resolve) => {
                let userInfo = await OAUTH.request.refreshUserInfo();
                let profileInfo = await getProfileInfo();
                resolve(profileInfo);


                function getProfileInfo(){
                    return new Promise((resolve, reject) => {
                    
            
                        $.ajax({
                            type: "GET",
                            headers: {
                                'Authorization': `Bearer ${userInfo.access_token}`,
                            },
                            traditional: true,
                            contentType: "application/json; charset=utf-8",
                            url: OAUTH.user.profileUrl,
                            dataType: "json",
                            success: (result, textStatus, xhr) => {
                                result.status = xhr.status;
                                resolve(result);
                            },
                            error: (result) => {
                                console.log(result);
                                resolve(result);
                            },
                        });
                
                
                    
                    });
                }
            });
        },
        createSpreadsheet: (spreadsheetName, sheetName, headers) =>{
            return new Promise(async (resolve) =>{
                let body = OAUTH.spreadsheet.create.body(spreadsheetName, sheetName, headers);

                let sheetObject = await createSpreadsheet(body);
                await storageSet({key: OAUTH.spreadsheet.id, value: sheetObject.spreadsheetId});
                resolve(sheetObject);
            });
            

            function createSpreadsheet(body){
                return new Promise(async (resolve, reject) => {
                    let userInfo = await OAUTH.request.refreshUserInfo();

                    $.ajax({
                        type: "POST",
                        headers: {
                            'Authorization': `Bearer ${userInfo.access_token}`,
                        },
                        traditional: true,
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(body),
                        url: OAUTH.spreadsheet.create.url,
                        dataType: "json",
                        success: (result, textStatus, xhr) => {
                            result.status = xhr.status;
                            resolve(result);
                        },
                        error: (result) => {
                            console.log(result);
                            resolve(result);
                        },
                    });
            
            
                
                });
            }
        },
        appendSpreadsheetValues: (values) => {
            return new Promise(async (resolve) =>{
                let userInfo = await OAUTH.request.refreshUserInfo();
                let spreedsheetId = await storageGet(OAUTH.spreadsheet.id);

                $.ajax({
                    type: "POST",
                    headers: {
                        'Authorization': `Bearer ${userInfo.access_token}`,
                    },
                    traditional: true,
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(OAUTH.spreadsheet.append.body(values)),
                    url: OAUTH.spreadsheet.append.url(spreedsheetId),
                    dataType: "json",
                    success: (result, textStatus, xhr) => {
                        result.status = xhr.status;
                        result.success = true;
                        resolve(result);
                    },
                    error: (result) => {
                        console.log(result);
                        resolve(result);
                    },
                });
            });
        },
        openAuth: async (message, sender) => {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                OAUTH.authRequestTab = tabs[0];
            });

            console.log(sender);
            let url = OAUTH.user.signIn();
        
            chrome.tabs.create({url});
        },
    
        saveUser: (message, sender) => {
            return new Promise(async (resolve) =>{
                console.log(this);
                let payload = OAUTH.user.infoPayload(message.data.code);
                let userInfo = await OAUTH.request.getGoogleUserData(payload, message, sender);
                chrome.extension.sendMessage(new ExtensionMessage(OAUTH.key.auth, userInfo));
                resolve();
            });
            
        },
    
        getGoogleUserData: (payload, message, sender) => {
            return new Promise(async (resolve) =>{
            
                if(sender){
                    chrome.tabs.remove(sender.tab.id);
                    chrome.tabs.update(OAUTH.authRequestTab.id, { 'active': true });
                }
                
                
                
                let userInfo = await requestInfo(payload);
                console.log(userInfo);
                await storageSet({key: OAUTH.user.info, value: userInfo});
                if(!payload.refresh_token){
                    await storageSet({key: OAUTH.user.refreshToken, value: userInfo.refresh_token});
                }

                const userData = parseJwt(userInfo.id_token);
               
                const data = {
                    Email: userData.email
                }


                $.ajax({
                    type: 'POST',
                    url: `${config.baseUrl}/User/Login`,
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(data),
                    success: async (resp) => {
                        await storageSet({key: config.keys.userId, value: resp.id});
                    },
                    error: (resp) => {
                        console.log(resp);
                    }
                });
                
                resolve(userInfo);
            });
            
        
            function requestInfo(payload){
                return new Promise((resolve, reject) => {
                    
            
                    $.ajax({
                        type: "POST",
                        traditional: true,
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(payload),
                        url: OAUTH.user.tokenUrl,
                        dataType: "json",
                        success: (result, textStatus, xhr) => {
                            result.status = xhr.status;
                            resolve(result);
                        },
                        error: (result) => {
                            console.log(result);
                            resolve(result);
                        },
                    });
            
            
                
                });
            }
        }
    },

    getHash: (length = 12) => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
      }
};





