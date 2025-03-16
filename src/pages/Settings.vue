<template>
  <div id="settings">
    <loader v-if="loader_save" />
    <!-- Tabs Navigation -->
    <div class="tabs">
      <button 
        :class="{ active: activeTab === 'general' }" 
        @click="activeTab = 'general'"
      >
        General Settings
      </button>
      <button 
        :class="{ active: activeTab === 'business' }" 
        @click="activeTab = 'business'"
      >
        Business Profile
      </button>
    </div>

    <!-- General Settings Tab -->
    <div v-if="activeTab === 'general'" class="tab-content">
      <!-- Suggested Description -->
      <p class="description">
        Adjust your general application settings here. Toggle the online booking form and select your preferred time zone to ensure your services run smoothly.
      </p>
      <div class="form-group">
        <label>
          <input type="checkbox" v-model="settings.enable_booking"  @change="enable_book_btn($event.target.checked)"/>
          Enable Booking Online Form
        </label>
        <p class="item-description">
          Enable or disable the online booking form to allow customers to schedule appointments directly through your website.
        </p>
        <div v-if="enable_booking_btn" class="booking-link-container">
          <p class="booking-link">Booking Link: 
            <a :href="bookingUrl" target="_blank">{{ bookingUrl }}</a>
          </p>
          <button @click="copyBookingUrl" class="copy-button">Copy</button>
        </div>
      </div>
      <div class="form-group">
        <label>Number of Slot Per Time:</label>
        <input type="text" v-model="settings.number_of_slots" />
        <p class="item-description">
          Enter the maximum number of appointments allowed per time slot.
        </p>
      </div>
      <div class="form-group">
        <label>Slot Durations:</label>
        <input type="text" v-model="settings.slot_duration" placeholder="Mins."/>
        <p class="item-description">
          Specify the duration (in minutes) for each time slot interval.
        </p>
      </div>
      <div class="form-group">
        <label>Time Input Type:</label>
        <div>
          <label>
            <input type="radio" v-model="settings.time_type" value="auto">
            Auto Generate
          </label>
        </div>
        <div>
          <label>
            <input type="radio" v-model="settings.time_type" value="manual">
            Manual
          </label>
        </div>
        <p class="item-description">
          Choose time input: Manual or Auto-generated based on the Slot Durations.
        </p>
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
        <p class="item-description">
          Choose your local time zone to ensure correct scheduling for bookings and time-based functionalities.
        </p>
      </div>
      <button @click="updateSettings">Save Settings</button>
    </div>

    <!-- Business Profile Tab -->
    <div v-if="activeTab === 'business'" class="tab-content">
      <div class="form-group">
        <label>Business Logo:</label>
        <input type="file" @change="handleLogoUpload" />
        <div v-if="businessProfile.business_logo">
          <img :src="`${IMG_URL}${businessProfile.business_logo}`" alt="Business Logo" style="max-width: 150px; margin-top: 10px;">
        </div>
      </div>
      <div class="form-group">
        <label>Business Name:</label>
        <input type="text" v-model="businessProfile.business_name" />
      </div>
      <div class="form-group">
        <label>Business Email:</label>
        <input type="email" v-model="businessProfile.business_email" />
      </div>
      <div class="form-group">
        <label>Business Address:</label>
        <input type="text" v-model="businessProfile.business_address" />
      </div>
      <div class="form-group">
        <label>Business Phone:</label>
        <input type="text" v-model="businessProfile.business_phone" />
      </div>
      <div class="form-group">
        <label>Business Description:</label>
        <textarea v-model="businessProfile.business_description"></textarea>
      </div>
      <button @click="updateBusinessProfile">Save Business Profile</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import api from "@/static/config.json";
import Multiselect from "vue-multiselect";
import Loader from "@/components/Loader";
import store from '@/store';
export default {
  components: {
    Multiselect,
    Loader
  },
  data() {
    return {
      activeTab: "general",
      settings: {
        enable_booking: false,
        time_zone: "",
        number_of_slots: "",
        slot_duration: "",
        time_type:""
      },
      IMG_URL: '',
      timeZones: [],
      businessProfile: {  
        business_name: "",
        business_email: "",
        business_address: "",
        business_phone: "",
        business_description: "",
        business_logo: ""
      },
      enable_booking_btn: false,
      logoFile: null,
      loader_save: false
    };
  },
  computed:{
    bookingUrl() {
      return `https://app.appointme.tech/book/${this.user.business_id}`;
    },
    user() {
      return this.$store.state.user;
    },
    token() {
      return this.$store.state.token;
    }
  },
  created() {
    this.fetchSettings();
    this.fetchTimeZones();
    this.fetchBusinessProfile();
    this.IMG_URL = api.IMG_URL;
  },
  methods: {
    fetchSettings() {
 
      const business_id = this.user.business_id;
      axios
        .get(api.API_URL + "/settings", {
          headers: { Authorization: `Bearer ${this.token}` },
          params: { business_id }
        })
        .then(response => {
          const data = response.data;
          data.enable_booking = !!Number(data.enable_booking);
          this.settings = response.data;
        });
    },
    updateSettings() {
      this.loader_save = true;
      const payload = { 
        ...this.settings,
        business_id: this.user.business_id
      };
      axios
        .post(api.API_URL + "/settings", payload, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        .then(() => {
          this.loader_save = false;
          store.commit('enableOnlineBooking', this.settings.enable_booking==true ? 1 : 0);
          this.notifyVue("top", "center", "success", "Settings updated successfully", "ti-announcement");
        });
    },
    fetchBusinessProfile() {
      
      const business_id = this.user.business_id;
      axios
        .get(api.API_URL + `/business-profile/${business_id}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        .then(response => {
          this.businessProfile = response.data;
        });
    },
    fetchTimeZones() {
      axios.get(api.API_URL + "/timezones",
      {
       headers: { Authorization: `Bearer ${this.token}` }
      })
      .then(response => {
        this.timeZones = response.data.timezones;
      }).catch(error => {
        console.error("Error fetching time zones:", error);
      });
    },
    handleLogoUpload(event) {
      // Get the file from the input
      this.logoFile = event.target.files[0];
    },
    updateBusinessProfile() {
      let self = this;
      this.loader_save = true;
      // Use FormData to handle file uploads along with other fields
      const formData = new FormData();
      formData.append('business_name', this.businessProfile.business_name);
      formData.append('business_email', this.businessProfile.business_email);
      formData.append('business_address', this.businessProfile.business_address);
      formData.append('business_phone', this.businessProfile.business_phone);
      formData.append('business_description', this.businessProfile.business_description);

      // Append the file if one was selected
      if (this.logoFile) {
        formData.append('business_logo', this.logoFile);
      }

      axios
        .post(api.API_URL + `/business-profile/${this.user.business_id}`, formData, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        .then(response => {
          this.loader_save = false;
          // Update businessProfile with response data (including logo URL)
          self.businessProfile = response.data.business || self.businessProfile;
          self.notifyVue("top", "center", "success", "Business Profile updated successfully", "ti-announcement");
        })
        .catch((error) => {
          if (error.response && error.response.data) {
            let errorMessage = "Failed to update business profile.";
            if (error.response.data.message) {
              errorMessage += ` ${error.response.data.message}`;
            }
            if (error.response.data.errors) {
              const errors = error.response.data.errors;
              errorMessage += Object.values(errors).flat().join(" ");
            }
            self.notifyVue("top", "center", "danger", errorMessage, "ti-alert");
          } else {
            self.notifyVue("top", "center", "danger", "An unexpected error occurred.", "ti-alert");
          }
        });
    },

    notifyVue(verticalAlign, horizontalAlign, type, msg, icon) {
      const color = Math.floor(Math.random() * 4 + 1);
      this.$notify({
        title: msg,
        icon: icon,
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: type
      });
    },
    copyBookingUrl() {
      navigator.clipboard.writeText(this.bookingUrl).then(() => {
        alert("Booking link copied to clipboard");
      }).catch(err => {
        console.error("Failed to copy", err);
      });
    },
    timeZonesLabel(time) {
      return `${time}`;
    },
    enable_book_btn(value){
       // Update the local flag for showing the booking link container
      this.enable_booking_btn = value;
    }
  }
};
</script>

<style scoped>
/* Container */
#settings {
  padding: 30px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
}

/* Tab Navigation */
.tabs {
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 25px;
}

.tabs button {
  flex: 1;
  padding: 12px 0;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.3s ease;
}

.tabs button:hover {
  color: #333;
}

.tabs button.active {
  color: #106c9c;
  border-bottom: 2px solid #106c9c;
  font-weight: 600;
}

/* Tab Content */
.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

.description {
  margin-bottom: 20px;
  font-size: 14px;
  color: #555;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #444;
}

.item-description {
  font-size: 12px;
  color: #777;
  margin-top: 4px;
}

/* Form Inputs */
input[type="text"],
input[type="email"],
select,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

input[type="text"]:focus,
input[type="email"]:focus,
select:focus,
textarea:focus {
  border-color: #106c9c;
  outline: none;
}

/* Save Button */
button {
  padding: 12px 20px;
  background-color: #106c9c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0d5a7a;
}

.timezome-list{
  width: 35%;
}

/* Fade In Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
