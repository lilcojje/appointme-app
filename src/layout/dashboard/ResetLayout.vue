<template>
  <div class="wrapper">
    <div id="logo-wrap">
      <img src="@/assets/img/logo.png" id="logo" />
    </div>
    <div id="reset-password-form" v-if="!resetSuccess">
      <loader v-show="loader" />
      <form @submit.prevent="validateForm">
        <div class="row">
          <div class="col-md-12">
            <fg-input
              type="password"
              label="New Password"
              placeholder="Enter your new password"
              v-model="password"
            ></fg-input>
            <span v-if="errors.password" class="error">{{ errors.password }}</span>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <fg-input
              type="password"
              label="Confirm Password"
              placeholder="Confirm your new password"
              v-model="password_confirmation"
            ></fg-input>
            <span v-if="errors.password_confirmation" class="error">{{ errors.password_confirmation }}</span>
          </div>
        </div>
        <div class="text-center">
          <p-button type="info" round @click.native.prevent="validateForm" class="btn-front">
            Reset Password
          </p-button>
        </div>
        <div class="text-center">
          <button @click="redirectToLogin" class="back-to-login-button">Back to Login</button>
        </div>
        <div class="clearfix"></div>
      </form>
    </div>
    <transition name="fade">
      <div v-if="resetSuccess" class="success">
        Your password has been reset successfully.<br />
        You can now log in with your new password.
        <br /><button @click="redirectToLogin" class="login-button">Login</button>
      </div>
    </transition>
  </div>
</template>

<script>
import api from "@/static/config.json";
import axios from "axios";
import Loader from "@/components/Loader";

export default {
  components: {
    Loader,
  },
  data() {
    return {
      email: "",
      token: "",
      password: "",
      password_confirmation: "",
      loader: false,
      errors: {},
      resetSuccess: false,
    };
  },
  created() {
    // Extract email from query parameters and token from route params
    this.email = this.$route.query.email || "";
    this.token = this.$route.params.token || "";
  },
  methods: {
    validateForm() {
      this.errors = {};

      if (!this.password) {
        this.errors.password = "Password is required";
      }
      if (!this.password_confirmation) {
        this.errors.password_confirmation = "Password confirmation is required";
      }
      if (this.password && this.password_confirmation && this.password !== this.password_confirmation) {
        this.errors.password_confirmation = "Passwords do not match";
      }

      if (Object.keys(this.errors).length === 0) {
        this.resetPassword();
      }
    },
    resetPassword() {
      this.loader = true;
      axios
        .post(`${api.API_URL}/password/reset`, {
          email: this.email,
          password: this.password,
          password_confirmation: this.password_confirmation,
          token: this.token,
        })
        .then((response) => {
          this.loader = false;
          this.resetSuccess = true;
          // Clear the password fields after successful reset
          this.password = "";
          this.password_confirmation = "";
        })
        .catch((error) => {
          this.loader = false;
          if (error.response && error.response.data.errors) {
            this.errors = Object.keys(error.response.data.errors).reduce((acc, key) => {
              acc[key] = error.response.data.errors[key][0];
              return acc;
            }, {});
          } else {
            alert("Password reset failed. Please try again.");
          }
        });
    },
    redirectToLogin() {
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
#reset-password-form {
  width: 30%;
  margin: 0 auto;
  padding: 30px;
  border-radius: 10px;
}
#logo-wrap {
  width: 50%;
  margin: 0 auto;
  margin-bottom: 10px;
  text-align: center;
}
#logo {
  width: 50%;
  margin-top: 100px;
}
.btn-front {
  margin: 3px;
}
.error {
  color: red;
  font-size: 12px;
}
.success {
  color: white;
  background-color: #28a745;
  font-size: 18px;
  text-align: center;
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 8px;
  animation: fadeIn 0.5s ease-in-out;
  width: 31%;
  margin: 0 auto;
  font-weight: bold;
}
.login-button,
.back-to-login-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 15px;
  margin-top: 10px;
  cursor: pointer;
  border-radius: 5px;
  font-size: 16px;
}
.login-button:hover {
  background-color: #0056b3;
}

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

/* Responsive Styles */
@media only screen and (max-width: 768px) {
  #reset-password-form,
  .success {
    width: 90%;
    padding: 20px;
  }
  #logo-wrap {
    width: 70%;
  }
  #logo {
    width: 70%;
    margin-top: 50px;
  }
}

@media only screen and (max-width: 480px) {
  #reset-password-form,
  .success {
    width: 95%;
    padding: 15px;
  }
  #logo-wrap {
    width: 80%;
  }
  #logo {
    width: 80%;
    margin-top: 30px;
  }
}
</style>