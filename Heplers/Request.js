export class Request {
  constructor() {}

  async Send(config) {
    let content = config.Content;
    let authorizationHeader;
    let responce;

    if (config.Authorization.length > 0) {
      authorizationHeader = `Bearer ${config.Authorization}`;
    }

    if (config.Type.toLowerCase() === "post") {
      responce = await fetch(config.Url, { 
        method: 'POST',
        headers: {
          'Content-Type': "application/json",
          "authorization": authorizationHeader
        },
        body: JSON.stringify(content)
      });
    } else {
      responce = await fetch(config.Url);
    }

    return responce;
  }
}

export default Request;