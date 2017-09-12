const keygen = require("keygenerator");
const swig = require("swig");
const Path = require('path');
const validUrl = require('valid-url');


let collectionShortened = "shortenedUrl";


function generatekey(mongodb) {
    let selectedKey = keygen.number();

    let shortenedUrlCollection = mongodb.collection(collectionShortened);

    shortenedUrlCollection.findOne({key: selectedKey}, function (err, urlInfo) {
        if (err) {
            console.log(err);
            return;
        }
        if (urlInfo != null && urlInfo != undefined) {
            selectedKey = generatekey(mongodb);
        }
    });

    return selectedKey;
}


let routes = function (server, mongodb) {

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            let template = swig.compileFile(Path.join(__dirname, "/views/index.html"));
            reply(template());
        }
    })

    server.route({
        method: 'POST',
        path: '/new',
        handler: function (request, reply) {
            let shortenedUrlCollection = mongodb.collection(collectionShortened);

            let hostName = request.info.host + '/';

            let payload = request.payload;

            let url = payload.url;

            let key = generatekey(mongodb);

            if (validUrl.isUri(url)){

                let data = {
                    original_url: url,
                    key: key
                }

                shortenedUrlCollection.insert(data, function (err, result) {
                    if (err) {
                        reply("Error");
                        return;
                    }
                    reply({original_url: url, short_url: hostName + key});
                });
            }
            else {
                reply({short_url:'Invalid Url'})
            }
        }
    });

    server.route({
        method: "GET",
        path: "/{key}",
        handler: function (request, reply) {
            let shortenedUrlCollection = mongodb.collection(collectionShortened);

            let key = request.params.key;

            shortenedUrlCollection.findOne({key: key}, function (err, urlInfo) {
                if(err){
                    reply("Error");
                }
                if (urlInfo !== null && urlInfo !== undefined) {
                    let url = urlInfo.original_url;
                    reply.redirect(url);
                }
                else{
                    reply({data:'This is an invalid url'});
                }
            })
        }
    });


}

module.exports = routes;