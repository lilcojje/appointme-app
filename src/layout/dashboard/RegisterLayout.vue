<template>
  <div class="wrapper-reg">
    <div id="logo-wrap">
      <img src="@/assets/img/logo.png" id="logo-reg" />
    </div>
    <div id="register-form" v-if="!registrationSuccess">
      <loader v-show="loader" />
      <h3 class="heading-details">Personal Details</h3>
      <form @submit.prevent="validateForm">
        <div class="row">
          <div class="col-md-12">
            <fg-input
              type="text"
              label="First Name"
              placeholder="Enter First Name"
              v-model="first_name"
            ></fg-input>
            <span v-if="errors.first_name" class="error">{{ errors.first_name }}</span>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <fg-input
              type="text"
              label="Last Name"
              placeholder="Enter Last Name"
              v-model="last_name"
            ></fg-input>
            <span v-if="errors.last_name" class="error">{{ errors.last_name }}</span>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <fg-input
              type="email"
              label="Email"
              placeholder="Enter Email"
              v-model="email"
            ></fg-input>
            <span v-if="errors.email" class="error">{{ errors.email }}</span>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <fg-input
              type="password"
              label="Password"
              placeholder="Enter Password"
              v-model="password"
              id="input-pass"
            ></fg-input>
            <span v-if="errors.password" class="error">{{ errors.password }}</span>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <fg-input
              type="password"
              label="Confirm Password"
              placeholder="Confirm Password"
              v-model="confirm_password"
              id="input-confirm-pass"
            ></fg-input>
            <span v-if="errors.confirm_password" class="error">{{ errors.confirm_password }}</span>
          </div>
        </div>
        <div class="text-center reg-btn">
          <p-button type="info" round @click.native.prevent="validateForm" class="btn-front">
            Register
          </p-button>
        </div>
        <div class="text-center backto">
          <button @click="redirectToLogin" class="back-to-login-button">Back to Login</button>
        </div>
        <div class="clearfix"></div>
      </form>
    </div>
    <!-- <transition name="fade">
      <div v-if="registrationSuccess" class="success">
        Successfully registered!<br />Please click the login button.
        <br /><button @click="redirectToLogin" class="login-button">Login</button>
      </div>
    </transition> -->
  </div>
</template>

<style scoped>
.wrapper-reg {
  max-width: 600px;
  margin: 50px auto;
  padding: 40px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

#logo-wrap {
  text-align: center;
  margin-bottom: 20px;
}

#logo-reg {
  width: 300px;
}

#register-form {
  padding: 0 10px;
}

.row {
  margin-bottom: 15px;
}

.error {
  color: #e74c3c;
  font-weight: bold;
  font-size: 15px;
  margin-top: 5px;
  margin-bottom: 18px;
  display: inline-block;
}

.success {
  background: linear-gradient(135deg, #6dd5ed, #2193b0);
  color: #ffffff;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin: 20px 0;
  animation: fadeIn 0.5s ease-in-out;
}

.p-button {
  display: inline-block;
  background-color: #2196f3;
  color: #ffffff;
  padding: 12px 30px;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.p-button:hover {
  background-color: #1976d2;
}

.login-button,
.back-to-login-button {
  background-color: #8e44ad;
  color: #ffffff;
  border: none;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 16px;
  transition: background-color 0.3s ease;
  cursor: pointer;
  margin-top: 45px;
  margin-bottom: 10px;
  padding: 7px 12px;
}

.login-button:hover,
.back-to-login-button:hover {
  background-color: #732d91;
}

.reg-btn{margin-top:40px;}
.reg-btn button{width: 32%;}
.reg-btn button:hover{background-color:#093d58;}
.update-btn,
.backto {
  text-align: center;
}

input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input:focus {
  border-color: #2196f3;
  box-shadow: 0 0 5px rgba(33, 150, 243, 0.5);
  outline: none;
}

.heading-details{text-align: center; margin: 30px 0;}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<script>
import api from "@/static/config.json";
import axios from "axios";
import Loader from "@/components/Loader";
import store from '@/store';

export default {
  components: {
    Loader,
  },
  data() {
    return {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
      loader: false,
      errors: {},
      registrationSuccess: false,
    };
  },
  methods: {
    validateForm() {
      this.errors = {};
      if (!this.first_name) this.errors.first_name = "First name is required";
      if (!this.last_name) this.errors.last_name = "Last name is required";
      if (!this.email) this.errors.email = "Email is required";
      else if (!/.+@.+\..+/.test(this.email)) this.errors.email = "Invalid email format";
      if (!this.password) this.errors.password = "Password is required";
      else if (this.password.length < 6) this.errors.password = "Password must be at least 6 characters long";
      if (!this.confirm_password) this.errors.confirm_password = "Confirm password is required";
      else if (this.confirm_password !== this.password) this.errors.confirm_password = "Passwords do not match";

      if (Object.keys(this.errors).length === 0) {
        this.register();
      }
    },
    register() {
      this.loader = true;
      axios
        .post(`${api.API_URL}/register`, {
          first_name: this.first_name,
          last_name: this.last_name,
          email: this.email,
          password: this.password,
          register: 1,
          notify_email: true,
        })
        .then((response) => {
          // Access the token from response.data and commit it properly
          store.commit('setAccessToken', response.data.access_token);
          store.commit('setUser', response.data.user); 
          this.loader = false;
          this.first_name = "";
          this.last_name = "";
          this.email = "";
          this.password = "";
          this.confirm_password = "";
          this.$router.push("/update-business");
        })
        .catch((error) => {
          this.loader = false;
          if (error.response && error.response.data.errors) {
            this.errors = Object.keys(error.response.data.errors).reduce((acc, key) => {
              acc[key] = error.response.data.errors[key][0];
              return acc;
            }, {});
          } else {
            alert("Registration failed. Please try again.");
          }
        });
    },

    redirectToLogin() {
      this.$router.push("/login");
    },
  },
};
</script>
