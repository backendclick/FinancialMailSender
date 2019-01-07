const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 5000;

const mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient;
const url = "mongodb://localhost:27017/";
const dbName = "sampledb";

const path = "c:/codes/mock/";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

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
        
        console.log("Iniciando loop");
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

app.post("/sendMails", (req)=>{
    console.log("Requisição recebida em /sendMails");
    console.log("Body recebido", req.body);
});

function getCode(fileName, month){
    console.log("Iniciando getCode:" + fileName);
    let clientNameGroups = /BOLETO JAN\s?2019\s?-\s?(\w*)[\s\.]/.exec(fileName);
    console.log("Finalizado getCode. Nome do cliente extraído", clientNameGroups[1]);
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

app.listen(port, () => console.log(`Listening on port ${port}`));