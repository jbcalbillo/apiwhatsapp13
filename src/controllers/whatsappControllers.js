const fs = require("fs");
const myConsole = new console.Console(fs.createWriteStream("./log.txt", { encoding: 'utf8' }));
const whatsappService = require("../services/whatsappService");

const VerifyToken = (req, res) => {
    try {
        var accessToken = "TOKENVISBOT";
        var token = req.query["hub.verify_token"];
        var challenge = req.query["hub.challenge"];

        if (challenge != null && token != null && token === accessToken) {
            res.send(challenge);
        } else {
            res.status(400).send();
        }
    } catch (e) {
        res.status(400).send();
    }
};

const ReceivedMessage = (req, res) => {
    try {
        const entry = req.body.entry[0];
        const changes = entry.changes[0];
        const value = changes.value;
        const messageObject = value.messages;

        if (messageObject) {
            const messages = messageObject[0];
            const senderWaId = messages.from;
            const senderProfile = value.contacts[0].profile.name;
            const messageType = messages.type;

            const messageData = GetTextUser(messages);
            const text = messageData.text;
            const buttonId = messageData.buttonId || "N/A"; // Usar "N/A" si no hay buttonId

            myConsole.log(`Numero del usuario: ${senderWaId}`);
            myConsole.log(`Perfil del usuario: ${senderProfile}`);
            myConsole.log(`ID de WhatsApp del usuario: ${senderWaId}`);
            myConsole.log(`Tipo de mensaje recibido: ${messageType}`);
            myConsole.log(`Texto del mensaje: ${text}`);

            if (messageType === "interactive" && messageData.buttonId) {
                myConsole.log(`La opción elegida fue: ${text}`);
                myConsole.log(`ID del botón: ${buttonId}`);
            }

            let responseText;
            if (messageType === "text") {
                responseText = `Hola ${senderWaId}, has enviado el texto: ${text}`;
            } else if (messageType === "interactive" && messageData.buttonId) {
                responseText = `Acabas de elegir la opción: ${text} (ID del botón: ${buttonId})`;
            } else {
                responseText = `Has enviado un mensaje del tipo: ${messageType}`;
            }

            const responseMessage = whatsappService.createTextMessage(responseText, senderWaId);
            whatsappService.SendMessageWhatsapp(messageType, responseMessage, senderWaId);

            res.send('EVENT_RECEIVED');
        } else {
            res.send('EVENT_RECEIVED');
        }
    } catch (e) {
        myConsole.log(e);
        res.send('EVENT_RECEIVED');
    }
};

function GetTextUser(messages) {
    let text = "";
    let buttonId = null;
    const typeMessage = messages.type;
    if (typeMessage === "text") {
        text = messages.text.body;
    } else if (typeMessage === "interactive") {
        const interactiveObject = messages.interactive;
        const typeInteractive = interactiveObject.type;

        if (typeInteractive === "button_reply") {
            text = interactiveObject.button_reply.title;
            buttonId = interactiveObject.button_reply.id;
        } else if (typeInteractive === "list_reply") {
            text = interactiveObject.list_reply.title;
            // buttonId = null; // No se necesita ID en este caso, pero puede ser agregado si es necesario
        }
    }
    return { text, buttonId };
}

module.exports = {
    VerifyToken,
    ReceivedMessage,
    GetTextUser
};
