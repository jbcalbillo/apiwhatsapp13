const functions = require('@google-cloud/functions-framework');
const app = require('./index');

functions.http('metaWebhook', app);
