/*!

 =========================================================
 * Vue Paper Dashboard - v1.0.1
 =========================================================

 * Product Page: http://www.creative-tim.com/product/paper-dashboard
 * Copyright 2023 Creative Tim (http://www.creative-tim.com)
 * Licensed under MIT (https://github.com/creativetimofficial/paper-dashboard/blob/master/LICENSE.md)

 =========================================================

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 */
import Vue from "vue";
import App from "./App";
import router from "./router/index";

import PaperDashboard from "./plugins/paperDashboard";
import "vue-notifyjs/themes/default.css";

import firebaseMessaging from './firebase';
import store from './store';  
import GAuth from "vue-google-oauth2";

Vue.config.productionTip = false;

Vue.use(PaperDashboard);

const gauthOption = {
  clientId: "982363249873-dmq6of1ubi3lgvkmhllqdslqfbmi2eov.apps.googleusercontent.com",
  scope: "profile email",
  prompt: "select_account"
};

Vue.use(GAuth, gauthOption);

/* eslint-disable no-new */
new Vue({
  store,
  router,
  render: (h) => h(App),
  created() {

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/firebase-messaging-sw.js').then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }).catch(error => {
          console.error('ServiceWorker registration failed: ', error);
        });
      });
    }

    // Request permission for receiving notifications
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        // Get registration token
        firebaseMessaging.getToken().then(token => {
          localStorage.setItem("fcm", token);

          // Send this token to your server to send FCM messages to this device
        }).catch(error => {
          console.error('Error getting FCM token:', error);
        });
      } else {
        console.log('Unable to get permission for notifications.');
      }
    });
  }
}).$mount("#app");
