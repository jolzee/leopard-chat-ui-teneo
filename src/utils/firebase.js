import Vue from "vue";

export default class Firebase {
  static firebase;
  static initialized = false;

  static init(firebaseConfig) {
    if (!Firebase.initialized) {
      return new Promise(function(resolve, reject) {
        Promise.all([
          import(/* webpackChunkName: "firebase" */ "firebase/app"),
          import(/* webpackChunkName: "firebase" */ "firebase/auth"),
          import(/* webpackChunkName: "firebase" */ "firebase/database")
        ])
          .then(([firebase]) => {
            if (firebase.apps.length === 0) {
              Vue.$log.debug("Initializing Firebase");
              firebase.initializeApp(firebaseConfig);
            }
            Firebase.firebase = firebase;
            Firebase.initialized = true;
            Firebase.initializing = false;
            resolve(firebase);
          })
          .catch(err => {
            reject(err);
          });
      });
    }
  }

  static getInstance() {
    if (Firebase.initialized) {
      return Firebase.firebase;
    } else {
      throw new Error("Firebase not initialized");
    }
  }
}
