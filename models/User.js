/**
 * Created by hea on 2/14/18.
 */
//http://mongodb.github.io/node-mongodb-native/2.2/quick-start/quick-start/
const User = {};
const DB={};
let MongoClient = require('mongodb').MongoClient, ObjectID = require('mongodb').ObjectID
    , assert = require('assert'), bcrypt = require("bcrypt");
let url = 'mongodb://peace:123@localhost/myDB';

let nextIndex = 0;

MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to DB");

    DB.db=db;
    DB.collection = db.collection('user');
    //nextIndex for autoIncrement
    /*

    User.create({id:1,name:'ping',password:'54321',email:'phe004@ucr.edu', avatar:'/avatar/1.png'},function (r) {
        console.log("add");
        console.log(r);
    });
    User.create({id:2,name:'adam',password:'123',email:'adam.he@cdk.com', avatar:'/avatar/2.png'},function (r) {
        console.log("add");
        console.log(r);
    });
    /*
    User.create({id:3,name:'peace',password:'1991',email:'peace940814202@gmail.com', avatar:'/avatar/3.png'},function (r) {
        console.log("add");
        console.log(r);
    });
    */
    /*
    User.create({name:'peace',password:'54321',email:'phe004@ucr.edu'},function (r) {
        console.log("add");
        console.log(r);
    });
    */
    User.read({},function (r) {
        nextIndex = r.length;
        console.log("read");
        console.log(r);
        console.log(nextIndex);
    });


    /*
    // the _id in mongoDB is ObjectId, if only string value can't remove
    User.delete({id:123,name:'peace',password:'123456',email:'phe004@ucr.edu'},function (r) {
        console.log("delete");
        console.log(r);
    });
    */
    /*
    User.update({id:123,name:'peace',password:'abc123',email:'phe004@ucr.edu'},{'$set':{password:'123456'}},function (r) {
        console.log("update");
        console.log(r.nModified+"updated");
    });
    */
    /*
    User.authenticate({name:'peace'},'54321',function (r) {
        console.log('autheticate');
        console.log(r);
    },function (e) {
        console.log('error'+e);
    })
    */
    /*
    User.changePassword({name:'adam'},'abc',function(r){
        if(r === false||r.nModified===0){
           console.log('no user match/no change');
        }else{
            console.log('change password');
            console.log(r.nModified+"updated");
        }

    },function(err){
        console.log('error in change password'+err);
    });
    */
});
//add/insert user to db
User.create = function (user, callback, errorCallback) {
    //https://github.com/ahadrovic/ExpressJSCourse/blob/master/chapter8/models/user.js
    //console.log(typeof  user);
    nextIndex++;
    if(!user.hasOwnProperty('id')){
        user.id = nextIndex;
    }

    bcrypt.hash(user.password,10,function (err,hash) {
        if (err) {
            return errorCallback(err);
        }

        user.password = hash;
        //if no id ,auto increment instead


        DB.collection.insertOne(user,function (err,response) {
            if(err){
                if(errorCallback){
                    errorCallback(err);
                }else{
                    console.log(err);
                }
            }else {
                callback(response.ops[0]);
            }

        });

    })

};
//find/read can have different situations https://docs.mongodb.com/manual/reference/method/db.collection.find/
User.read = function (user, callback, errorCallback) {
    DB.collection.find(user).sort({id:1}).toArray(function(err,response){
        if(err){
            if(errorCallback){
                errorCallback(err);
            }else{
                console.log(err);
            }
        }else {
            callback(response);
        }
        
    });

};
//same as find, update has many situations https://docs.mongodb.com/manual/reference/method/db.collection.update/
User.update = function (user,update, callback, errorCallback) {
    DB.collection.updateOne(user,update,function (err,response) {
        if(err){
            if(errorCallback){
                errorCallback(err);
            }else{
                console.log(err);
            }
        }else {
            callback(response.result);
        }
    });

};

//https://docs.mongodb.com/manual/reference/method/db.collection.remove/
User.delete = function (user, callback, errorCallback) {
    if(user.hasOwnProperty("_id")){
        user["_id"] = new ObjectID(user["_id"]);
    }
    DB.collection.removeOne(user,function (err,response) {
        if(err){
            if(errorCallback){
                errorCallback(err);
            }else{
                console.log(err);
            }
        }else {
            callback(response.result);
        }

    });

};

//no err callback true or false
User.authenticate = function (user , password, callback, errorCallback) {
    User.read(user, function (result) {
        //result is array, assume no more than one match, then
        //console.log(result[0]);
        if(result[0]===null||result[0]===undefined){
            console.log('no such user');
            callback(false);
        }else{
            bcrypt.compare(password,result[0].password,function (err,response) {

                if (err) {
                    return errorCallback(err);
                }

                //we can use with or without return. both work
                // send the data from the db to the controller
                if(response){
                    return callback(result[0]);
                }else{
                    return callback(false);
                }


            })
        }

    },function (err) {
        errorCallback(err);
    });
}


User.changePassword = function (user , password, callback, errorCallback) {
    User.read(user, function (result) {
        //result is array, assume no more than one match, then
        //console.log(result[0]);
        if(result[0]===null||result[0]===undefined){
            console.log('no such user');
            callback(false);
        }else{
            bcrypt.hash(password,10,function (err,hash) {
                if (err) {
                    return errorCallback(err);
                }else{
                    User.update(user,{'$set':{password:hash}},function (r) {
                        callback(r);
                    },function (err) {
                        errorCallback(err);
                    });
                }
            });
        }

    },function (err) {
        errorCallback(err);
    });
}

module.exports=User;