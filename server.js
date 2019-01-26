const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const dayjs = require('dayjs');
require('dayjs/locale/pt-br');
const nodemailer = require('nodemailer');
const mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient;

const port = process.env.PORT || 5000;
const url = "mongodb://localhost:27017/";
const dbName = "sampledb";

const fromMail = 'tarapi007@gmail.com';
const authUser = 'tarapi007@gmail.com';
const authPass = 'generalize';

const path = "C:\\Users\\Diego\\Google Drive\\ClickTI Informática\\BOLETOS CLICKTI\\2019\\";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var developMongoUrl = process.env.developMongoUrl;
if(developMongoUrl){
  console.log("developMongoUrl: ", developMongoUrl);
} else {
    console.log("Não foi encontrado developMongoUrl;")
    return;
}

app.post('/list', (req, res) => {
   try{
    let clients = [];
    console.log("============= Recebida requisição em: LIST ============");
    let nextMonth = req.body.nextMonth.toUpperCase();
    console.log(">>>>>>>>>>>>>>>>>var NextMonth: ", nextMonth);
    // let month = req.body.month;
    // if(!isValidMonth(month)){
    //     console.log("Mês inválido:", month);
    //     res.send(
    //         `Mês inválido: ${req.body.post}`
    //     );
    //     return;
    // }
    let fullPath = path + nextMonth + "\\";
    fs.readdir(fullPath, function(err, items) {
        
        console.log("Iniciando varredura de boletos na pasta - " + fullPath );
        console.log("Mês selecionado - ", nextMonth);
        console.log("Qtde de arquivos encontrados na pasta - ", items.length);
        let boletosDoMes = items.filter((item) => {
            let month = extractMonth(item);
            return month == nextMonth;
        });
        console.log("Qtde de arquivos do mês - ",  boletosDoMes.length);
      
        let selects = [];
        for (let i = 0; i < boletosDoMes.length; i++){
            let code = extractCode(boletosDoMes[i]);
            selects.push(getClient(code,boletosDoMes[i]));
        }

        Promise.all(selects).then(values => { 
            console.log("resultado do promise all", values);
            for(let i=0;i<values.length;i++){
                values[i].key = i;
            }
            res.send(
                {
                    status : 1,
                    boletos : values
                }
                
            );
        });
    });
   } catch (e) {
    res.send({
        status : -1,
        message : e
    });
   }
});

app.get("/bdPing", (req, res)=>{
    console.log("============= Recebida requisição em: bdPing ============");
    try{
        MongoClient.connect(url, (err, db)=>{
            if(err) {
                res.send({status: -1, msg: err});
            } else {
                db.db(dbName).collection("clientes")
                        .find({})
                        .count()
                        .then((count)=>{
                            console.log("[ bdPing ] - count: ", count);
                            db.close();
                            res.send({
                                status: 1, 
                                pingTime: dayjs().format('DD/MM/YYYY HH:mm:ss')
                            })
                        })  
            } 
        });
    } catch (e){
        console.error("[ bdPing ] - ERROR: ", e);
        try{db.close();} catch (e){console.log("Error closing conn", e)} 
        res.send({status: -1, msg: e})
    } 
})

app.post("/sendMails", (req, res)=>{
    console.log("Requisição recebida em /sendMails");
    //console.log("Body recebido", req.body);
    if("body" in req){
        req.body.map((item) => {
            console.log("---------Item:", item);
            if(item.willBeSent == true){
                EmailManager.sendMail(item);
            } 
        });

    } else {
        console.log("req sem body")
    }
    res.send({
        status : 1
    })
});

function extractCode(fileName, month){
    console.log("Iniciando extractCode:" + fileName);
    var rgx = /.*2019\s?-\s?(\w*)[\s\.]/g;
    let clientNameGroups = rgx.exec(fileName);
    console.log("===================Finalizado extractCode. Grupo extraído", clientNameGroups);
    return clientNameGroups[1];
}

function extractMonth(fileName){
    console.log("[extractMonth] - Invoked. FileName - ", fileName);

    var rgx = /BOLETO\s*(\w*)\s*2019\s*-\s*/g;

    let group1 = rgx.exec(fileName);
    console.log("===================[extractMonth] - Finalizado. Grupo extraído", group1);
    return group1[1];
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
    sendMail : function (cliente) {
        console.log("EmailManager - Iniciando envio de email . FileName: ", cliente);
        
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: authUser,
                pass: authPass
            }
        });
        
        var mailOptions = {
            from: fromMail,
            to: cliente.mail,
            subject: `BOLETO ${dayjs().locale('pt-br').format('MMMM').toUpperCase()}/2019 - ClickTI Informática`, 
            html: `<p>Bom dia.</p>

            <p>Segue em anexo o boleto referente à ${dayjs().locale('pt-br').format('MMMM')}/2019 do contrato de manutenção dos computadores.</p>
            
            <p>Att</p>
            `,
            attachments: [{
                filename: cliente.file,
                path: `${path}${cliente.file}`,
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