/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const EuropeanPlate = require('./europeanplate.json');
const Presentation = require('./presentation.json');
const Util = require('./util.js');
const Title = "European Plate";
const LogoUrl = Util.getS3PreSignedUrl('Media/European Plate.webp');

const LaunchRequestHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
	},
	handle(handlerInput) {
	    const locale = handlerInput.requestEnvelope.request.locale;
		let speakOutput = 'Welcome to European Plate.';
		if (locale === "fr-FR") {
		    speakOutput = 'Bienvenue sur European Plate.';
		}
		let responseBuilder = handlerInput.responseBuilder;
		if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
			responseBuilder.addDirective({
				type: 'Alexa.Presentation.APL.RenderDocument',
				version: '1.0',
				document: Presentation,
				datasources: {
					detailImageRightData: {
						title: Title,
						logoUrl: LogoUrl,
						primaryText: speakOutput,
						detailImage: LogoUrl
					}
				}
			});
		}
		return handlerInput.responseBuilder
		    .speak(speakOutput)
		    .reprompt(speakOutput)
		    .getResponse();
	}
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let speakOutput = 'Welcome to European Plate.';
		if (locale === "fr-FR") {
		    speakOutput = 'Bienvenue sur European Plate.';
		}
		let responseBuilder = handlerInput.responseBuilder;
		if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
			responseBuilder.addDirective({
				type: 'Alexa.Presentation.APL.RenderDocument',
				version: '1.0',
				document: Presentation,
				datasources: {
					detailImageRightData: {
						title: Title,
						logoUrl: LogoUrl,
						primaryText: speakOutput,
						detailImage: LogoUrl
					}
				}
			});
		}
		sessionAttributes.speakOutput = speakOutput;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const GetCountryByCodeIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
		&& Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetCountryByCodeIntent';
	},
	handle(handlerInput) {
	    const locale = handlerInput.requestEnvelope.request.locale;
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
		const slot = handlerInput.requestEnvelope.request.intent.slots;
		let repromptOutput = 'Try: Which country is represented by B?';
		if (locale === "fr-FR") {
		    repromptOutput = 'Essayez: quel pays est représenté par B?';
		}
		let detailImage;
		let speakOutput;
		let responseBuilder = handlerInput.responseBuilder;
		if (typeof slot.CountryCode.resolutions.resolutionsPerAuthority[0].values === 'undefined') {
			speakOutput = 'Sorry, I don\'t know what you mean by ' + slot.CountryCode.value + '.';
    		if (locale === "fr-FR") {
    		    speakOutput = 'Désolé, je ne vois pas ce que tu veux dire par ' + slot.CountryCode.value + '.';
    		}
		} else {
			const findCountry = handlerInput.requestEnvelope.request.intent.slots.CountryCode.resolutions.resolutionsPerAuthority[0].values[0].value.name;
			let found = EuropeanPlate.find(obj => obj.code === findCountry);
			speakOutput = found.code + ' denotes ' + found.country + '.';
    		if (locale === "fr-FR") {
    		    speakOutput = found.code + ' désigne ' + found.pays + '.';
    		}
			detailImage = Util.getS3PreSignedUrl('Media/' + found.country + '.webp');
		}
		if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
			responseBuilder.addDirective({
				type: 'Alexa.Presentation.APL.RenderDocument',
				version: '1.0',
				document: Presentation,
				datasources: {
					detailImageRightData: {
						title: Title,
						logoUrl: LogoUrl,
						primaryText: speakOutput,
						detailImage: detailImage
					}
				}
			});
		}
		sessionAttributes.detailImage = detailImage;
		sessionAttributes.speakOutput = speakOutput;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
		return handlerInput.responseBuilder
		    .speak(speakOutput)
		    .reprompt(repromptOutput)
		    .getResponse();
	}
};

const RepeatIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let responseBuilder = handlerInput.responseBuilder;
		if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
			responseBuilder.addDirective({
				type: 'Alexa.Presentation.APL.RenderDocument',
				version: '1.0',
				document: Presentation,
				datasources: {
					detailImageRightData: {
						title: Title,
						logoUrl: LogoUrl,
						primaryText: sessionAttributes.speakOutput,
						detailImage: sessionAttributes.detailImage || sessionAttributes.LogoUrl
					}
				}
			});
		}
        return handlerInput.responseBuilder
            .speak(sessionAttributes.speakOutput)
            .reprompt(sessionAttributes.repromptSpeech)
            .getResponse();
    },
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
		let speakOutput = 'Try: Which country is represented by B?';
		if (locale === "fr-FR") {
		    speakOutput = 'Essayez: quel pays est représenté par B?';
		}
		let responseBuilder = handlerInput.responseBuilder;
		if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
			responseBuilder.addDirective({
				type: 'Alexa.Presentation.APL.RenderDocument',
				version: '1.0',
				document: Presentation,
				datasources: {
					detailImageRightData: {
						title: Title,
						logoUrl: LogoUrl,
						primaryText: speakOutput,
						detailImage: LogoUrl
					}
				}
			});
		}
		sessionAttributes.detailImage = LogoUrl;
		sessionAttributes.speakOutput = speakOutput;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
		return handlerInput.responseBuilder
		    .speak(sessionAttributes.speakOutput)
		    .reprompt(sessionAttributes.speakOutput)
		    .getResponse();
	}
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
		let speakOutput = 'Thanks for using European Plate.';
		if (locale === "fr-FR") {
		    speakOutput = 'Merci d\'utiliser European Plate.';
		}
		let responseBuilder = handlerInput.responseBuilder;
		if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
			responseBuilder.addDirective({
				type: 'Alexa.Presentation.APL.RenderDocument',
				version: '1.0',
				document: Presentation,
				datasources: {
					detailImageRightData: {
						title: Title,
						logoUrl: LogoUrl,
						primaryText: speakOutput,
						detailImage: LogoUrl
					}
				}
			});
		}
		return handlerInput.responseBuilder
		    .speak(speakOutput)
		    .withShouldEndSession(true)
		    .getResponse();
	}
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
		let speakOutput = 'Sorry, I don\'t know anything about that. Try Again.';
		if (locale === "fr-FR") {
		    speakOutput = 'Désolé, je n\'en sais rien. Essayer à nouveau.';
		}
		let responseBuilder = handlerInput.responseBuilder;
		if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
			responseBuilder.addDirective({
				type: 'Alexa.Presentation.APL.RenderDocument',
				version: '1.0',
				document: Presentation,
				datasources: {
					detailImageRightData: {
						title: Title,
						logoUrl: LogoUrl,
						primaryText: speakOutput,
						detailImage: LogoUrl
					}
				}
			});
		}
		return handlerInput.responseBuilder.speak(speakOutput).reprompt(speakOutput).getResponse();
	}
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        let speakOutput = `You just triggered ${intentName}`;
		if (locale === "fr-FR") {
		    speakOutput = `Tu viens de déclencher ${intentName}`;
		}
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const locale = handlerInput.requestEnvelope.request.locale;
		let speakOutput = 'Sorry, I had trouble doing what you asked. Try Again.';
		if (locale === "fr-FR") {
		    speakOutput = 'Désolé, j\'ai eu du mal à faire ce que vous avez demandé. Essayer à nouveau.';
		}
		let responseBuilder = handlerInput.responseBuilder;
		if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
			responseBuilder.addDirective({
				type: 'Alexa.Presentation.APL.RenderDocument',
				version: '1.0',
				document: Presentation,
				datasources: {
					detailImageRightData: {
						title: Title,
						logoUrl: LogoUrl,
						primaryText: speakOutput,
						detailImage: LogoUrl
					}
				}
			});
		}
		console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);
		return handlerInput.responseBuilder.speak(speakOutput).reprompt(speakOutput).getResponse();
	}
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        GetCountryByCodeIntentHandler,
        RepeatIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();
