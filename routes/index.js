var express = require('express');
var fs = require('fs');
var router = express.Router();
var User = require('../models/User');
var Busboy = require('busboy');
var multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //path root is the project folder, not in folder index.js
        cb(null, 'public/avatar/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.png') ;
    }
})

var upload = multer({ storage: storage });

/* GET home page. */
router.get('/dashboard', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/allUser', function(req, res, next) {
  User.read({},function (result) {
      res.header("Content-Type",'application/json');
      res.send(JSON.stringify(result, null, 4));
  });
});

//https://github.com/expressjs/multer
//upload.single('avatar') is Multer middleware. care the name should be the same?
/*
router.post('/upload',upload.single('avatar'), function(req, res, next) {
    console.log(req.file);
    res.send(req.file.filename);
});
*/

//https://www.npmjs.com/package/busboy
router.post('/upload', function(req, res, next) {
    console.log(req.headers['content-type']);
    console.log(req.body);
    let resStr ='';
    var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        resStr = 'File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype;
        console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);

        //store upload file
        file.pipe(fs.createWriteStream('public/avatar/'+filename));
        /*
        file.on('data', function(data) {
            console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
        });
        file.on('end', function() {
            console.log('File [' + fieldname + '] Finished');
        });
        */
    });
    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
        console.log('Field [' + fieldname + ']: value: ' + val);
    });
    busboy.on('finish', function() {
        console.log('Done parsing form!');
        res.send(resStr);
    });

    req.pipe(busboy);// pipe req to configed busboy

});

//post req body empty
router.post('/addUser', function(req, res, next) {
    console.log(req.body);


    if(req.body){
        User.create(req.body, function (result) {
                res.header("Content-Type",'application/json');
                res.send(JSON.stringify(result, null, 4));
        });
    }

});

router.post('/deleteUser', function(req, res, next) {
    console.log(req.body);

    if(req.body){
        User.delete(req.body, function (result) {
            res.header("Content-Type",'application/json');
            res.send(JSON.stringify(result, null, 4));
        });
    }
});

router.post('/login',function (req, res, next) {
    console.log(req.body);
    console.log(req.session.returnTo);
    if(req.body){
        User.authenticate({name: req.body.name}, req.body.password, function(result){
            console.log(result);
            if(result){
                req.session.user = result;
                //redirect to the origin url
                //res.redirect(req.session.returnTo);
                res.redirect('/dashboard');
            }
        },function (err) {
            console.log(err);
        });
    }
});

router.get('/download', function (req, res, next) {
    console.log(__dirname);
    //set the filename after download
    res.setHeader('Content-disposition', 'attachment; filename=PingHe2017.pdf' );
    fs.createReadStream(__dirname+'/../public/avatar/PingHe2017.pdf', {highWaterMark: 32 * 1024}).pipe(res).on('finish',function () {
        console.log('done download')
    });
    //res.sendFile(__dirname+'/../public/avatar/PingHe2017.pdf');
});

//https://github.com/Automattic/node-canvas
router.get('/verificationCode', function(req, res, next) {
    let Canvas = require('canvas')
        , Image = Canvas.Image
        , canvas = new Canvas(120, 60)
        , ctx = canvas.getContext('2d');

    let charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let vcode = '';
    for(let i=0; i<4; i++){
        vcode += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    //console.log(vcode);

    //ctx.font = '30px Impact';
    ctx.font = '30px Helvetica';
    //ctx.rotate(.1);
    ctx.fillText(vcode, 10, 40);

    var te = ctx.measureText(vcode);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.lineTo(50, 102);
    ctx.lineTo(50 + te.width, 102);
    ctx.stroke();
    res.send('<img src="' + canvas.toDataURL() + '" />');
});

module.exports = router;
