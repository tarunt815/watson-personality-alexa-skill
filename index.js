var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var lambda = new AWS.Lambda();

exports.handler = (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
     
    try {
        if (event.session.new) {
            //New Session
            console.log("NEW SESSION");
        }
        
        switch (event.request.type) {
    
            case "LaunchRequest":
                // > Launch Request
                console.log("LAUNCH REQUEST");
                break;
    
            case "IntentRequest":
                // > Intent Request
                console.log("INTENT REQUEST")

                switch(event.request.intent.name) {
                    case "GetPersonalityTraits":
                        var params = {
                            FunctionName: 'watson_twitter', // the lambda function we are going to invoke
                            Payload: '{ "handle" : "@TarunThummala" }',
                            InvocationType: 'RequestResponse'
                        };
                        lambda.invoke(params, function(err, data) {
                                    if (err) {
                                        console.log("Hello")
                                        context.fail(err);
                                    } else if (data.Payload) {
                                        console.log(data.Payload)
                                        console.log(Object.prototype.toString(data.Payload))
                                        var personality = data.Payload
                                        context.succeed(
                                            generateResponse(
                                                buildSpeechletResponse(`Ok Tarun, here are your top five personality traits. ${personality}`, true),
                                                {}
                                            )
                                        )
                                    }
                        })
                    break;

                    case "GetOtherPersonalityTraits":
                        console.log(event.request.intent.slots.TwitterHandle.resolutions.resolutionsPerAuthority[0].values[0].value.id) // print id sent by custom slot value
                        var handle = event.request.intent.slots.TwitterHandle.resolutions.resolutionsPerAuthority[0].values[0].value.id
                        var userHandle = event.request.intent.slots.TwitterHandle.resolutions.resolutionsPerAuthority[0].values[0].value.name
                        var params = {
                            FunctionName: 'watson_twitter', // the lambda function we are going to invoke
                            Payload: '{ "handle" : "' + handle + '" }',
                            InvocationType: 'RequestResponse'
                        };
                        lambda.invoke(params, function(err, data) {
                                    console.log("hello")
                                    if (err) {
                                        console.log("Hello")
                                      context.fail(err);
                                    } else if (data.Payload) {
                                        console.log(data.Payload)
                                        console.log(Object.prototype.toString(data.Payload))
                                        var personality = data.Payload
                                        context.succeed(
                                            generateResponse(
                                                buildSpeechletResponse(`Ok. I've analyzed ${userHandle}'s personality. The top five personality traits are ${personality}.`, true),
                                                {}
                                            )
                                        )
                                    }
                        }) 
                        break;

                    default:
                        throw "Invalid intent"
                }
                break;


            case "SessionEndedRequest":
                // > Session Ended Request
                console.log("SESSION ENDED REQUEST")
                break;
    
            default:
                context.fail("INVALID REQUEST TYPE: ${event.request.type}")
        }
        
    } catch(error) { context.fail('Exception: ${error}') }
}
    

// Helpers
buildSpeechletResponse = (outputText, shouldEndSession) => {

    return {
        outputSpeech: {
            type: "PlainText",
            text: outputText
        },
        shouldEndSession: shouldEndSession
    }
}

generateResponse = (SpeechletResponse, sessionAttributes) => {

    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: SpeechletResponse
    }
}