<template>
  <div class="wrapper login-wrap">
      <div id="logo-wrap">
          <img src="@/assets/img/logo.png" id="logo-login"/>
      </div>
      <div id="login-form">
        <loader v-show="loader"/>
        <form @submit.prevent>
          <div class="row">
            <div class="col-md-12">
              <fg-input
                type="text"
                label="Email"
                placeholder="Enter a Email"
                v-model="email"
              ></fg-input>
              <p v-if="errors.email" class="error-text">{{ errors.email[0] }}</p>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 password-field">
              <fg-input
                :type="passwordFieldType"
                label="Password"
                placeholder="Enter a Password"
                v-model="password"
                id="input-pass"
              ></fg-input>
              <span class="toggle-password" @click="togglePasswordVisibility">
                <i :class="passwordFieldType === 'password' ? 'ti-eye' : 'ti-eye'"></i>
              </span>
              <p v-if="errors.password" class="error-text">{{ errors.password[0] }}</p>
            </div>
          </div>
          <p v-if="generalError" class="error-text">{{ generalError }}</p>

          <div class="forget-pass-wrap">
              <a href="/forget">Forget Password?</a>
          </div>
          <div class="text-center">
            <p-button type="info" round @click.native.prevent="login" class="btn-front">
              Login
            </p-button>
            <p-button type="info" round @click.native.prevent="redirectToRegister" class="btn-front">
              Register
            </p-button>
          </div>

          <div class="row">
            <div class="col-md-12 password-field">
              <div class="google-signin-container">
                <div id="g_id_onload"
                  data-client_id="982363249873-dmq6of1ubi3lgvkmhllqdslqfbmi2eov.apps.googleusercontent.com"
                  data-callback="handleCredentialResponse"
                  data-auto_prompt="false"
                  data-position="center"
                  >
                </div>
                <div class="g_id_signin" data-type="standard"></div>
              </div>
            </div>
          </div>
          
          <div class="clearfix"></div>
        </form>
      </div>
    </div>
</template>

<style scoped>
/* Overall layout & background */
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ece9e6, #ffffff);
  padding: 20px;
  font-family: 'Open Sans', sans-serif;
}

/* Logo styling */
#logo-wrap {
  margin-bottom: 20px;
  text-align: center;
}

#logo-login {
  width: 300px;
  transition: transform 0.3s ease;
}

#logo-login:hover {
  transform: scale(1.1);
}

.forget-pass-wrap{margin-bottom: 20px;}

/* Login form container */
#login-form {
  width: 100%;
  max-width: 400px;
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* Input field container (if not already styled by fg-input) */
.fg-input {
  width: 100%;
  margin-bottom: 20px;
}

/* Error text styling */
.error-text {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 5px;
}

/* Password field adjustments */
.password-field {
  position: relative;
}

/* Toggle password icon styling */
.toggle-password {
  position: absolute;
  right: 24px;
  top: 57%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #999;
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: #333;
}

/* Forget password link styling */
.forget-pass-wrap a {
  color: #3498db;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forget-pass-wrap a:hover {
  color: #217dbb;
}

/* Button styling */
.btn-front {
  margin: 8px;
  padding: 6px 16px;
  font-size: 14px;
  border-radius: 25px;
  text-transform: uppercase;
  transition: background 0.3s ease, transform 0.2s ease;
}

.btn-front:hover {
  transform: translateY(-2px);
}

/* Loader styling */
.loader {
  text-align: center;
  margin-bottom: 20px;
}

.g_id_signin{margin-top: 20px;}

/* Responsive design adjustments */
@media (max-width: 480px) {
  #login-form {
    padding: 30px;
    width: 90%;
  }

  .wrapper{
    min-height: 68vh!important; /* Make it fill the screen */
    display: flex;
  }
 
}

.google-btn {
  background-color: #db4437;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.google-signin-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}


</style>


<script>
import api from "@/static/config.json";
import axios from 'axios';
import Loader from "@/components/Loader";
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import store from '@/store';
import { mapState, mapMutations } from 'vuex';


export default {
  components: {
    Loader
  },
  data() {
    return {
      email: '',
      password: '',
      loader: false,
      errors: {},
      generalError: '',
      passwordFieldType: 'password'
    };
  },
  methods: {
    login() {
      this.loader = true;
      this.errors = {};
      this.generalError = '';
      axios.post(api.API_URL + '/login', {
        email: this.email,
        password: this.password,
        fcm: localStorage.getItem('fcm'),
      })
      .then(({ data }) => {
        this.loader = false;

        // localStorage.setItem("token", data.access_token);
        // localStorage.setItem("role_id", data.user.role_id);
        // localStorage.setItem("role_name", data.user.role_name);
        // localStorage.setItem("fullname", data.user.first_name + ' ' + data.user.last_name);
        // localStorage.setItem("user_id", data.user.id);
        // localStorage.setItem("business_id", data.user.business_id);
        // localStorage.setItem("business_name", data.user.business_name);

        store.commit('setUser', data.user); 
        store.commit('setAccessToken', data.access_token);
        store.commit('setSettings', data.user.settings);
        store.commit('enableOnlineBooking', data.user.settings.enable_booking);
        
        if (data.user.business_id === null) {
          this.$router.push('/update-business');
        } else {
          this.$router.push({ name: 'dashboard' });
        }

        
      })
      .catch((error) => {
        this.loader = false;
        if (error.response) {
          if (error.response.data.errors) {
            this.errors = error.response.data.errors;
          } else if (error.response.data.error) {
            this.generalError = error.response.data.error.message;
          }
        }
      });
    },
    redirectToRegister() {
      this.$router.push('/register');
    },
    togglePasswordVisibility() {
      this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    },
    async handleCredentialResponse(response) {
      console.log("Google Credential Response:", response);

      // Send the response token to Laravel backend
      const res = await fetch(api.API_URL + "/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();

      // Store JWT token in local storage

      store.commit('setAccessToken', data.access_token);
      store.commit('setUser', data.user); 
      store.commit('setSettings', data.user.settings);
      store.commit('enableOnlineBooking', data.user.settings.enable_booking);
      
      // Redirect user to dashboard
      if (!data.user.business_id) {
          this.$router.push('/update-business');
        } else {
          this.$router.push({ name: 'dashboard' });
        }
      
    },
  },
  async mounted() {
    window.handleCredentialResponse = this.handleCredentialResponse;
    
    if (Capacitor.isNativePlatform()) {
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }
      await PushNotifications.register();
      await PushNotifications.addListener('registration', token => {
        localStorage.setItem("fcm", token.value);
      });
    }
  }
};
</script>
