<template>
  <div class="wrapper">
      <div id="logo-wrap">
          <img src="@/assets/img/logo.png" id="logo-updbn"/>
      </div>
      <div id="business-profile-form" v-if="!updateSuccess">
        <loader v-show="loader"/>
        <h3 class="heading-details">Business Details</h3>
        <form @submit.prevent="validateForm">
          <div class="row">
            <div class="col-md-12">
              <fg-input
                type="text"
                label="Business Name:"
                placeholder="Enter Business Name"
                v-model="business_name"
              ></fg-input>
              <span v-if="errors.business_name" class="error">{{ errors.business_name }}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Time Zone:</label>
            <multiselect
              v-model="settings.time_zone"
              :options="timeZones"
              :custom-label="timeZonesLabel"
              placeholder="Search timezone"
              track-by="id"
              label="first_name"
            ></multiselect>
          </div>
          <div class="form-group">
            <label>Currency:</label>
            <multiselect
              v-model="settings.currency_code"
              :options="currencyList"
              :custom-label="currencyLabel"
              placeholder="Search Currency"
              track-by="currency_code"
              label="currency_code"
            ></multiselect>
          </div>
          <div class="text-center update-btn">
            <p-button type="info" round @click.native.prevent="validateForm">
              Update 
            </p-button>
          </div>
          <div class="text-center backto">
            <button @click="redirectToLogin" class="back-to-login-button">Back to Login</button>
          </div>
          <div class="clearfix"></div>
        </form>
      </div>
      <transition name="fade">
        <div v-if="updateSuccess" class="success">
          Business profile updated successfully!<br/>
          Click below to return to the login.
          <br/>
          <button @click="redirectToDashboard" class="dashboard-button">Go to Dashboard</button>
        </div>
      </transition>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #f4f6f8;
  min-height: 100vh;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

#logo-wrap {
  width: 100%;
  text-align: center;
  margin-bottom: 20px;
}

#logo {
  max-width: 150px;
  margin-top: 40px;
}

#business-profile-form {
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.error {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.update-btn,
.backto {
  margin-top: 20px;
}

.btn-front,
.dashboard-button,
.back-to-dashboard-button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-front:hover,
.dashboard-button:hover,
.back-to-dashboard-button:hover {
  background-color: #0056b3;
}

.dashboard-button{margin-top: 16px;}

.success {
  background: linear-gradient(135deg, #28a745, #218838);
  color: #fff;
  font-size: 18px;
  text-align: center;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 500px;
  margin: 20px auto;
  font-weight: bold;
  animation: fadeIn 0.5s ease-in-out;
}

.update-btn{margin-top:40px;}
.update-btn button:hover{background-color:#093d58;}

.heading-details{text-align: center; margin: 30px 0;}


.back-to-login-button {
  background-color: #8e44ad;
  color: #ffffff;
  border: none;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 16px;
  transition: background-color 0.3s ease;
  cursor: pointer;
  margin-top: 20px;
  margin-bottom: 10px;
  padding: 7px 12px;
}



#logo-updbn{max-width: 260px;}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  #business-profile-form,
  .success {
    width: 90%;
    padding: 20px;
  }
  #logo {
    max-width: 120px;
  }
}
</style>

<script>
import api from "@/static/config.json";
import axios from 'axios';
import Loader from "@/components/Loader";
import Multiselect from "vue-multiselect";
import store from '@/store';

export default {
  components: {
    Loader,
    Multiselect
  },
  data() {
    return {
      user_id: '',
      business_name: '',
      business_email: '',
      business_address: '',
      business_phone: '',
      business_description: '',
      loader: false,
      errors: {},
      updateSuccess: false,
      timeZones: [],
      settings: {
        time_zone: null,
        currency_code:'',
      },
      isLoadingTimeZones: false,
      currencyList:[]
    };
  },computed: {
    user() {
      return this.$store.state.user;
    },
    token() {
      return this.$store.state.token;
    }
  },
  methods: {
    validateForm() {
      this.errors = {};
      if (!this.business_name) this.errors.business_name = "Business name is required";
      if (Object.keys(this.errors).length === 0) {
        this.updateProfile();
      }
    },
    updateProfile() {
      this.loader = true;
      axios.post(`${api.API_URL}/business-update`, {
          user_id: this.user.id,
          business_name: this.business_name,
          business_email: this.business_email,
          business_address: this.business_address,
          business_phone: parseInt(this.business_phone, 10) || 0,
          business_description: this.business_description,
          time_zone: this.settings.time_zone,
          currency_code: this.settings.currency_code
      })
      .then(response => {
       // localStorage.setItem("business_id", response.data.business.id);
        //localStorage.setItem("business_name", response.data.business.business_name);

        //this.$store.commit('updateUserBusinessName', response.data.business.business_name);
        store.commit('setUser', response.data.user); 
        store.commit('setSettings', response.data.user.settings);
        store.commit('enableOnlineBooking', response.data.user.settings.enable_booking);

        this.loader = false;
        this.updateSuccess = true;
        //this.$router.push('/subscription');
      }).catch(error => {
        this.loader = false;
        if (error.response && error.response.data) {
          this.notifyVue("top", "center", "danger", error.response.data.message, "ti-hand-stop");
        }
      });

    },
    notifyVue(position, alignment, type, message, icon) {
      this.$notify({
        title: message,
        icon: icon,
        horizontalAlign: alignment,
        verticalAlign: position,
        type: type
      });
    },
    fetchTimeZones() {

      this.isLoadingTimeZones = true;
      axios.get(api.API_URL + "/timezones", {
        headers: { Authorization: `Bearer ${this.token}` }
      })
      .then(response => {
        this.timeZones = response.data.timezones;
      })
      .catch(error => {
        console.error("Error fetching time zones:", error);
      })
      .finally(() => {
        this.isLoadingTimeZones = false;
      });
    },
    fetchCurrencies() {
      axios.get(api.API_URL + "/currencies",
      {
       headers: { Authorization: `Bearer ${this.token}` }
      })
      .then(response => {
        this.currencyList = response.data;
      }).catch(error => {
        console.error("Error fetching time zones:", error);
      });
    },
    redirectToDashboard() {
      this.$router.push('/dashboard');
    },
    redirectToLogin(){
      this.$router.push('/login');
    },
    timeZonesLabel(time) {
      return `${time}`;
    },
    currencyLabel(currency) {
      return `${currency.code} (${currency.symbol})`;
    },
  },
  created() {

    if(this.user.business_id){
      this.$router.push('/login');
    }
    
    this.fetchTimeZones();
    this.fetchCurrencies();
    if (!this.user.id) {
      this.redirectToLogin();
    }
  }
};
</script>
