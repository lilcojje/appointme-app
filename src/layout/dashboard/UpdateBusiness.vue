<template>
  <div class="wrapper">
      <div id="logo-wrap">
          <img src="@/assets/img/logo.png" id="logo-updbn"/>
      </div>
      <div id="business-profile-form" v-if="!updateSuccess">
        <loader v-show="loader"/>
        <form @submit.prevent="validateForm">
          <div class="row">
            <div class="col-md-12">
              <fg-input
                type="text"
                label="Business Name"
                placeholder="Enter Business Name"
                v-model="business_name"
              ></fg-input>
              <span v-if="errors.business_name" class="error">{{ errors.business_name }}</span>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <fg-input
                type="email"
                label="Business Email"
                placeholder="Enter Business Email"
                v-model="business_email"
              ></fg-input>
              <span v-if="errors.business_email" class="error">{{ errors.business_email }}</span>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <fg-input
                type="text"
                label="Business Address"
                placeholder="Enter Business Address"
                v-model="business_address"
              ></fg-input>
              <span v-if="errors.business_address" class="error">{{ errors.business_address }}</span>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <fg-input
                type="text"
                label="Business Phone Number"
                placeholder="Enter Business Phone Number"
                v-model="business_phone"
              ></fg-input>
              <span v-if="errors.business_phone" class="error">{{ errors.business_phone }}</span>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <fg-input
                type="textarea"
                label="Business Description"
                placeholder="Enter Business Description"
                v-model="business_description"
              ></fg-input>
              <span v-if="errors.business_description" class="error">{{ errors.business_description }}</span>
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
          <div class="text-center update-btn">
            <p-button type="info" round @click.native.prevent="validateForm" class="btn-front">
              Update Profile
            </p-button>
          </div>
          <div class="text-center backto">
            <button @click="redirectToLogin" class="back-to-dashboard-button">Back to Login</button>
          </div>
          <div class="clearfix"></div>
        </form>
      </div>
      <transition name="fade">
        <div v-if="updateSuccess" class="success">
          Business profile updated successfully!<br/>
          Click below to return to the login.
          <br/>
          <button @click="redirectToDashboard" class="dashboard-button">Go to Login</button>
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
      },
      isLoadingTimeZones: false
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
      if (!this.business_email) this.errors.business_email = "Business email is required";
      else if (!/.+@.+\..+/.test(this.business_email)) this.errors.business_email = "Invalid email format";
      if (!this.business_address) this.errors.business_address = "Business address is required";
      if (!this.business_phone) this.errors.business_phone = "Business phone number is required";
      if (!this.business_description) this.errors.business_description = "Business description is required";
      
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
          business_phone: this.business_phone,
          business_description: this.business_description,
          time_zone: this.settings.time_zone
      })
      .then(response => {
       // localStorage.setItem("business_id", response.data.business.id);
        //localStorage.setItem("business_name", response.data.business.business_name);

        //this.$store.commit('updateUserBusinessName', response.data.business.business_name);
        console.log(response.data.user)
        store.commit('setUser', response.data.user); 

        this.loader = false;
        this.updateSuccess = true;
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
    redirectToDashboard() {
      this.$router.push('/login');
    },
    redirectToLogin(){
      this.$router.push('/login');
    },
    timeZonesLabel(time) {
      return `${time}`;
    },
  },
  created() {

    if(this.user.business_id){
      this.$router.push('/login');
    }
    
    this.fetchTimeZones();
    if (!this.user.id) {
      this.redirectToLogin();
    }
  }
};
</script>
