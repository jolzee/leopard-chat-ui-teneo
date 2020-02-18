const logger = require("@/utils/logging").getLogger("firebase.js");

export default class Firebase {
	static firebase;

	static initialized = false;

	static init() {
		return new Promise(function connectToFirebase(resolve, reject) {
			if (!Firebase.initialized) {
				Promise.all([
					import(/* webpackChunkName: "firebase" */ "firebase/app"),
					import(/* webpackChunkName: "firebase" */ "firebase/auth")
				])
					.then(([firebase]) => {
						if (firebase.apps.length === 0) {
							logger.debug("Initializing Firebase");
							firebase.initializeApp({
								apiKey: window.leopardConfig.firebase.apiKey,
								authDomain: window.leopardConfig.firebase.authDomain,
								projectId: window.leopardConfig.firebase.projectId,
								storageBucket: window.leopardConfig.firebase.storageBucket,
								messagingSenderId: window.leopardConfig.firebase.messagingSenderId
							});
						}
						Firebase.firebase = firebase;
						Firebase.initialized = true;
						Firebase.initializing = false;
						resolve(firebase);
					})
					.catch(err => {
						reject(err);
					});
			}
		});
	}

	static getInstance() {
		if (Firebase.initialized) {
			return Firebase.firebase;
		}
		throw new Error("Firebase not initialized");
	}
}
