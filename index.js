const port = process.env.PORT || 1337;

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://h.etf.unsa.ba');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.get('/igraci', (req,res) => {
    fs.readFile('spisak_igraca.csv', (err, data) => {
        if(err) throw err;
        res.end(data.toString());
    });
});

app.post('/upisi', (req,res) => {
    fs.readFile('rang_lista.csv', (err, data) => {
        if(err) throw err;
        let nasao=false;
        let igraci=data.toString();
        let igraciNiz=igraci.split('\n');
        for(let i=0;i<igraciNiz.length-1;i++) {
            let polja=igraciNiz[i].split(',');
            if(polja[0]==req.param('username')) {
                nasao=true;
                igraciNiz.splice(i,1);
                fs.writeFile('rang_lista.csv', igraciNiz.join('\n'), (err) => {
                    if(err) throw err;

                    let novaLinija;

                    if(req.param('objekti')!=3) {
                        novaLinija=req.param('username')+',NIJE ZAVRSENO '+req.param('vrijeme')+','+req.param('objekti')+'/3\n';
                    }
                    else {
                        novaLinija=req.param('username')+','+req.param('vrijeme')+','+req.param('objekti')+'/3\n';
                    }
                    fs.appendFile('rang_lista.csv', novaLinija, (err) => {
                        if(err) throw err;
                    });
                });
            }
        }
        if(!nasao) {
            let novaLinija;

            if(req.param('objekti')!=3) {
                novaLinija=req.param('username')+',NIJE ZAVRSENO '+req.param('vrijeme')+','+req.param('objekti')+'/3\n';
            }
            else {
                novaLinija=req.param('username')+','+req.param('vrijeme')+','+req.param('objekti')+'/3\n';
            }
            fs.appendFile('rang_lista.csv', novaLinija, (err) => {
                if(err) throw err;
            });
        }
    });

    fs.readFile('nadjeni.csv', (err,data) => {
        if(err) throw err;
        let nasao=false;
        let nadjeni=data.toString();
        let nadjeniNiz=nadjeni.split('\n');
        for(let i=0;i<nadjeniNiz.length-1;i++) {
            let polja=nadjeniNiz[i].split(',');
            if(polja[0]==req.param('username')) {
                nasao=true;
                nadjeniNiz.splice(i,1);
                fs.writeFile('nadjeni.csv', nadjeniNiz.join('\n'), (err) => {
                    if(err) throw err;

                    let novaLinija;

                    if(req.param('objekti')!=3) {
                        novaLinija=req.param('username')+','+req.param('kupatilo')+','+req.param('kuhinja')+','+req.param('spavaca')+'\n';
                    }
                    else {
                        novaLinija=req.param('username')+',0,0,0\n';
                    }
                    fs.appendFile('nadjeni.csv', novaLinija, (err) => {
                        if(err) throw err;
                        res.end(novaLinija);
                    });
                });
            }
        }
        if(!nasao) {
            let novaLinija;

            if(req.param('objekti')!=3) {
                novaLinija=req.param('username')+','+req.param('kupatilo')+','+req.param('kuhinja')+','+req.param('spavaca')+'\n';
            }
            else {
                novaLinija=req.param('username')+',0,0,0\n';
            }
            fs.appendFile('nadjeni.csv', novaLinija, (err) => {
                if(err) throw err;
                res.end(novaLinija);
            });
        }
    });
});

app.get('/ranglista', (req,res) => {
    fs.readFile('rang_lista.csv', (err, data) => {
        if(err) throw err;
        res.end(data.toString());
    });
});

app.get('/nadjeni', (req,res) => {
    fs.readFile('nadjeni.csv', (err, data) => {
        if(err) throw err;
        res.end(data.toString());
    });
});

app.get('/rangiraj', (req,res) => {
    fs.readFile('rang_lista.csv', (err,data) => {
        if(err) throw err;
        let zavrsili=[];
        let nisuZavrsili=[];
        let igraci=data.toString();
        let igraciNiz=igraci.split('\n');
        for(let i=0; i<igraciNiz.length-1;i++) {
            if(igraciNiz[i].indexOf("NIJE ZAVRSENO")==-1) {
                let polja=igraciNiz[i].split(',');
                let objekat={username: polja[0], vrijeme: polja[1]};
                zavrsili.push(objekat);
            }
            else {
                let polja=igraciNiz[i].split(',');
                let objekat={username: polja[0], vrijeme: polja[1].substring(14,polja[1].length)};
                nisuZavrsili.push(objekat);
            }
        }
        zavrsili.sort(function(a,b) {
            return parseInt(a.vrijeme)>parseInt(b.vrijeme);
        });
        nisuZavrsili.sort(function(a,b) {
            return parseInt(a.vrijeme)>parseInt(b.vrijeme);
        });
        let niz=[];
        for(let i=0; i<zavrsili.length; i++) {
            niz.push(zavrsili[i].username+","+zavrsili[i].vrijeme);
        }
        for(let i=0; i<nisuZavrsili.length; i++) {
            niz.push(nisuZavrsili[i].username+",NIJE ZAVRSENO "+nisuZavrsili[i].vrijeme);
        }
        fs.writeFile('rangirani.csv', niz.join('\n'), (err) => {
            if(err) throw err;
            res.end(niz.join('\n'));
        });
    });
});

app.listen(port);