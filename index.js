var http = require('http');
var express=require('express');

var expressApp=express();
var serverInstance1=http.createServer(expressApp);

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

serverInstance1.listen(8182,function(error, success){
    if(error){
        console.log("Error starting server"+error);
    }else{
        console.log("Servert started"+success);
    }
})