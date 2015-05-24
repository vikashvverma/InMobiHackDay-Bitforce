var express = require('express');
var serveStatic = require('serve-static');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var morgan = require('morgan');
var childProcess = require('child_process');
var multer = require('multer');
var fileType = '';

var app = new express();
app.listen(3000);
app.use(express.static('public'));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(session({
  secret: "http://www.programminggeek.in/",
  resave: true,
  saveUninitialized: true
}))
app.use(morgan('dev'));
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});
app.post('/info', function(req, res) {
  var model = req.body;
  console.log(model.ip);
  res.status(200).send({
    "name": "Vikash"
  });
});
app.post('/install', function(req, res) {
  var model = req.body;
  console.log(model);

  var fs = require('fs');
  var deviceList = JSON.parse(fs.readFileSync('./public/device.json', 'utf8'));
  for (var i = deviceList.children.length; i--;) {
    if (deviceList.children[i].ip == model.ip) {
      for (var j = deviceList.children[i].children.length; j--;) {
        if (deviceList.children[i].children[j].name == model.service) {
          return res.status(503).send({
            status: false,
            info: model.service + " already installed!"
          });
        }
      }
      deviceList.children[i].children.push({
        icon: model.service + ".png",
        name: model.service,
        type: "service",
        ext:model.service=='cplus'?'cpp':(model.service=='java'?'java':'py')
      });
      fs.writeFileSync('./public/device.json', JSON.stringify(deviceList));
      break;
    }
  }


  var datatoSend = (model.username + ':' + model.ip + ':' + model.password + ":" + model.service);
  //console.log(datatoSend);
  childProcess.exec('./scripts/InstallWebService.sh ' + datatoSend, function(error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
      //res.status(500).status({status:false,info:"Unable to install service, check credentials!"});
    } else {
      //res.status(200).send({status:true,info:"Service installed successfully!"});
    }
  });

  res.status(200).send({
    status: true,
    info: model.service + ' has been installed!'
  });
});


app.get('/discover', function(req, res) {

  childProcess.exec("arp-scan -I wlan0 -l | tail -n +3 | head -n -3|awk '{print $1}' > ip.txt ", function(error, stdout, stderr) {
    //console.log('stdout: ' + stdout);
    //console.log('stderr: ' + stderr);
    if (error !== null) {
      //console.log('exec error: ' + error);
      res.status(403).send({
        status: false,
        info: "Problem discovering devices!"
      });
    } else {
      updateDevices(function(err, result) {
        res.status(200).send({
          status: true,
          info: "Devices discovered!"
        })
      });
    }
  });

  //res.status(200).send({status:true,info:model.service});
});


app.post('/monitoring', function(req, res) {
  var model = req.body;
  console.log(model);
  var datatoSend = (model.username + ':' + model.ip + ':' + model.password);
  //console.log(datatoSend);

  childProcess.exec("sh ./scripts/MonitorWebService.sh " + datatoSend, function(error, stdout, stderr) {

    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
        res.status(503).send({status:false,info:'Unable to get device health!'});
    } else {
        res.status(200).send({status:true,info:{'ram':stdout.split('\n')[0].split(':')[1],'used':stdout.split('\n')[1].split(':')[1]}});
    }

  });

  //res.status(200).send({status:true,info:model.service});
});


app.use(multer({
  dest: __dirname,
  rename: function(fieldname, filename) {
    return filename;
  },
  onFileUploadStart: function(file) {
    fileType = file.originalname.split('.')[1];
  }
}));


app.post('/upload', function(req, res) {
    var fs=require('fs');
    var arrIP = [];
    var jsonObj = {};

    fs.readFile('./public/device.json', 'utf8', function(err, data) {
        jsonObj = JSON.parse(data);
        // console.log(jsonObj);
        // console.log(fileType);
        for (var i = 0; i < jsonObj.children.length; ++i) {
            for (var j = 0; j < jsonObj.children[i].children.length; ++j) {
                // console.log("jsonExt,,, ",jsonObj.children[i].children[j].ext);
                if (jsonObj.children[i].children[j].ext == fileType) {
                    arrIP.push(jsonObj.children[i].ip);
                }
            }
        }
        fileType="";
        console.log("System running services : \n",arrIP);

        fs.readFile('ipRatio.txt', function(err, data) {
    var arr = [];
    var arr1 = [];
    var array = data.toString().split("\n");
    for (var i = 0; i < array.length; ++i) {
        arr.push(parseFloat(array[i].split(':')[0]) / parseFloat(array[i].split(':')[1]) + ' ' + array[i].split(':')[2]);
    }
    arr.sort();
    console.log('RAM usage on devices : \n', arr);

    // fs.readFile('ip.txt', function(err, data) {
    //     var array1 = data.toString().split("\n");
    //     for (var i = 0; i < array1.length; ++i) {
    //         arr1.push(array1[i]);
    //     }
    //     console.log('arr1,,,', arr1);

        for (var i = 0; i < arr.length; ++i) {
            for (var j = 0; j < arrIP.length; ++j) {
                if (arr[i].split(' ')[1] == arrIP[j]) {
                    console.log("Match found for ", arr[i].split(' ')[1]);
                    return;
                }
            }
        }

    // })
});
        res.send(arrIP);
    });
});



function updateDevices(callback) {
  var fs = require('fs');

  var arr = [];

  fs.readFile('ip.txt', function(err, data) {
    var array = data.toString().split("\n");
    for (i in array) {
      arr.push(array[i]);
    }
    console.log("IP array,,, ", arr);

    fs.readFile('./public/device.json', 'utf8', function(err, data) {
      jsonObj = JSON.parse(data);

      for (var i = 0; i < arr.length - 1; ++i) {
        var flag = false;
        for (var j = 0; j < jsonObj.children.length; ++j) {
          if (arr[i] == jsonObj.children[j].ip) {
            console.log("Match found for ", arr[i]);
            flag = true;
            continue;
          }
        }
        if (flag == false) {
          console.log("No match found for ", arr[i]);
          var newIP = {};
          newIP["icon"] = "device.png";
          newIP["name"] = arr[i];
          newIP["type"] = "Device";
          newIP["username"] = "root";
          newIP["ip"] = arr[i];
          newIP["children"] = [];
          jsonObj.children.push(newIP);
        }
      }
      console.log(jsonObj);

      fs.writeFileSync('./public/device.json', JSON.stringify(jsonObj, null, 4));
      callback(null, true);
    });

  });
}
