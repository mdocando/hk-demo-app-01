// const Joi = require('joi'); // Utiliza una clase por convención las clases comienzan with UperCase
require('dotenv').config() // That's it. process.env now has the keys and values you defined in your .env file:
const axios = require('axios').default;
const bodyParser = require('body-parser');
const { response } = require('express');
const express = require('express');
const app = express();

app.use(express.json());
// app.use(bodyParser.json());

// Endpoint routes
app.get('/', (req, res) => {
    res.send('Api works!!!')
});

const { SERVER_URL, TELEGRAM_TOKEN, YAHOO_TOKEN } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const URI = `/setWebhook`;
const WEBHOOK_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${SERVER_URL}/${TELEGRAM_TOKEN}`;

const init = async () => {
    const response = await axios.get(WEBHOOK_URL);
    console.log(response.data);
}

app.post(`/${TELEGRAM_TOKEN}`, async (req, res) => {
    console.log(req.body);
    const text = req.body.message.text;
    const chatId = req.body.message.chat.id;
    let respText = null;
    const options = {
        method: 'GET',
        // url: 'https://yfapi.net/v1/finance/trending/US',
        url: 'https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=AAPL',
        params: { modules: 'defaultKeyStatistics,assetProfile' },
        headers: {
            'x-api-key': `${YAHOO_TOKEN}`
        }
    };
    const yahooResp = await axios.request(options);
    
    if (!yahooResp.data.error){
        respText = yahooResp.data;
    } 
    else respText = 'No es posible procesar su solicitud en este momento'
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `
            Symbol: ${respText.quoteResponse.result[0].symbol}
        Display Name: ${respText.quoteResponse.result[0].displayName}
        Market: ${respText.quoteResponse.result[0].market}
        Currency: ${respText.quoteResponse.result[0].currency}
        PostMarketPrice: ${respText.quoteResponse.result[0].postMarketPrice}
        `
    })
    // console.log(JSON.stringify(respText.quoteResponse.result[0]))
    return res.send();
})

const PORT = process.env.PORT || 8443;
app.listen(PORT, async () => {
    console.log(`Server listening on port ${PORT}`);
    await init();
}); 