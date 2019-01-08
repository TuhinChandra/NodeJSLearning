var http = require('http');
var express=require('express');
var xlstojson = require('xls-to-json-lc');
var xlsxtojson = require('xlsx-to-json-lc');
var bodyParser = require('body-parser');
var multer = require('multer');

var expressApp=express();
var serverInstance1=http.createServer(expressApp);
expressApp.use(bodyParser.json());

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
var upload = multer({ //multer settings
                storage: storage,
                fileFilter : function(req, file, callback) { //file filter
                    if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                        return callback(new Error('Wrong extension type'));
                    }
                    callback(null, true);
                }
            }).single('file');

var products=[
    {"ean":1, "displayName":"Product A"},
    {"ean":2, "displayName":"Product B"},
    {"ean":3, "displayName":"Product C"}

];

expressApp.get("/getAllProducts",function(request, response){
    response.json(products);
})

expressApp.get("/getProductByEAN",function(request, response){
    var ean=request.query.ean;

    var matchedProduct = products.filter(function(item) {
        return item.ean == ean;
      });
    response.json(matchedProduct);
})
/** API path that will upload the files */
expressApp.post('/upload', function(req, res) {
    var exceltojson;
    upload(req,res,function(err){
        if(err){
             res.json({error_code:1,err_desc:err});
             return;
        }
        /** Multer gives us file info in req.file object */
        if(!req.file){
            res.json({error_code:1,err_desc:"No file passed"});
            return;
        }
        /** Check the extension of the incoming file and 
         *  use the appropriate module
         */
        if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        try {
            exceltojson({
                input: req.file.path,
                output: null, //since we don't need output.json
                lowerCaseHeaders:true
            }, function(err,result){
                if(err) {
                    return res.json({error_code:1,err_desc:err, data: null});
                } 
                res.json({error_code:0,err_desc:null, data: result});
            });
        } catch (e){
            res.json({error_code:1,err_desc:"Corupted excel file"});
        }
    })
})
expressApp.get('/',function(req,res){
    res.sendFile(__dirname + "/index.html");
})

serverInstance1.listen(8182,function(error, success){
    if(error){
        console.log("Error starting server"+error);
    }else{
        console.log("Servert started"+success);
    }
})