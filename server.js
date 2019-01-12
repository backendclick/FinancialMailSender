const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const dayjs = require('dayjs');
const port = process.env.PORT || 5000;

const mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient;
const url = "mongodb://localhost:27017/";
const dbName = "sampledb";

const fromMail = 'tarapi007@gmail.com';
const toMail = 'clickticonsultoria@gmail.com'

const authUser = 'tarapi007@gmail.com';
const authPass = 'generalize' ;
const path = "C:\\Users\\Diego\\Google Drive\\ClickTI Informática\\BOLETOS CLICKTI\\2019\\JAN\\";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var developMongoUrl = process.env.developMongoUrl;
if(developMongoUrl){
  console.log("developMongoUrl: ", developMongoUrl);
}

app.post('/list', (req, res) => {
    let clients = [];
    console.log("Requisição /list recebida;");

    
    // let month = req.body.month;
    // if(!isValidMonth(month)){
    //     console.log("Mês inválido:", month);
    //     res.send(
    //         `Mês inválido: ${req.body.post}`
    //     );
    //     return;
    // }
 
    fs.readdir(path, function(err, items) {

        // for (var i=0; i<items.length; i++) {
        //     let client = {};
        //     let code = getCode(items[i]);
        //     console.log("Iniciando recuperação do cliente: " + code)
        //     client = getClient(code).then(function(){
        //         console.log("Finalizada recuperação do cliente: " + code)
        //         client.file = items[i];
        //         client.sent = getSendStatus();
        //         clients.push(client);
        //         console.log("clients final:", clients);
        //             res.send(
        //                 clients
        //             );
        //     });
           
        // }
        
        console.log("Iniciando fs.readdir", path);
        // let inserts = [];
        // (async function loop() {
        //     for (let i = 0; i < SIZE; i++) {
        //         await getClient("AMONTENEGRO");
        //     }
        //     console.log("await loop ends");
        // })

        let inserts = [];
        for (let i = 0; i < items.length; i++){
            let code = getCode(items[i]);
            inserts.push(getClient(code,items[i]));
        }

        Promise.all(inserts).then(values => { 
            console.log("resultado do promise all", values);
            counteredValues = [];
            for(let i=0;i<values.length;i++){
                values[i].key = i;
            }
            res.send(
                values
            );
        });
        
    });
});

app.get("/bdPing", (req, res)=>{
    console.log("============= Recebida requisição em: bdPing ============");
    MongoClient.connect(url, (err, db)=>{
        try{
          if(err) {
            throw err;
          } 
          db.db(dbName).collection("clientes")
                .find({})
                .count()
                .then((count)=>{
                    console.log("[ bdPing ] - count: ", count);
                    res.send({
                        status: 1, 
                        pingTime: dayjs().format('DD-MM-YYYY HH:mm:ss')
                    })
                })
        } catch (e){
          console.error("[ bdPing ] - ", e);
          res.send({status: -1, msg: e})
        } 
      });
    
})
app.post("/sendMails", (req)=>{
    console.log("Requisição recebida em /sendMails");
    //console.log("Body recebido", req.body);
    if("body" in req){
        req.body.map((item) => {
            console.log("---------Item:", item); 
            
        });

    } else {
        console.log("req sem body")
    }
});

function getCode(fileName, month){
    console.log("Iniciando getCode:" + fileName);
    let clientNameGroups = /BOLETO JAN\s?2019\s?-\s?(\w*)[\s\.]/.exec(fileName);
    console.log("===================Finalizado getCode. Nome do cliente extraído", clientNameGroups);
    return clientNameGroups[1];
}

function isValidMonth(month){ 
    if(month == "JAN" 
            || month == "FEV"
            || month == "MAR"
            || month == "ABR"
            || month == "MAI"
            || month == "JUN"
            || month == "JUL"
            || month == "AGO"
            || month == "SET"
            || month == "OUT"
            || month == "NOV"
            || month == "DEZ" ){
        return true;
    } else {
        return false;
    }
}

function getSendStatus(){
    return false;
}

async function getClient(code, fileName){
    
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, (err, db)=>{
            try{
              if(err) {
                throw err;
              } 
              db.db(dbName).collection("clientes").find({"code" : code}).toArray(function(err, clients) {
                if(err) throw err;
                console.log("Finalizada montagem do cliente: ", code);
                console.log("Clients array recuperado", clients);
                clients[0].file = fileName;
                clients[0].willBeSent = true;
                // clients[0].sent = getSendStatus();
                resolve(clients[0]);
              });
            } catch (e){
              console.error("[ /getClient] - ", e);
              return reject(e)
            } 
          });
    });
}


const EmailManager = {
    sendMail : function (filename) {
        console.log("EmailManager - Iniciando envio de email .  ");
        
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: authUser,
                pass: authPass
            }
        });
        
        var mailOptions = {
            from: fromMail,
            to: toMail,
            subject: 'teste anexo', 
            html: 'teste - corpo',
            attachments: [{
                filename: filename,
                path: `${path}${filename}`,
                contentType: 'application/pdf'
            }]
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log("Email enviado. Reponse: " + info.response);
                console.log("MailOptions:");
                console.log( mailOptions);
            }
        });
        
    }
};
app.listen(port, () => console.log(`Listening on port ${port}`));