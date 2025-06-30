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
        <p v-if="errors.number_of_slots" class="error">{{ errors.number_of_slots }}</p>
        <input type="text" v-model="settings.number_of_slots" />
        <p class="item-description">
          Enter the maximum number of appointments allowed per time slot.
        </p>
      </div>
      <div class="form-group">
        <label>Slot Durations:</label>
        <p v-if="errors.slot_duration" class="error">{{ errors.slot_duration }}</p>
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
        <p v-if="errors.time_zone" class="error">{{ errors.time_zone }}</p>
        <multiselect
          v-model="settings.time_zone"
          :options="timeZones"
          :custom-label="timeZonesLabel"
          placeholder="Search timezone"
          track-by="id"
          label="timezone"
        ></multiselect>
        <p class="item-description">
          Choose your local time zone to ensure correct scheduling for bookings and time-based functionalities.
        </p>
      </div>

      <div class="form-group">
        <label>Payment Methods:</label>
        <p v-if="errors.payment_methods" class="error">{{ errors.payment_methods }}</p>
          <!-- Multiselect outside the loop -->
          <multiselect
            v-model="selectedMethods[currentIndex]"
            :options="payment_methods"
            :custom-label="paymentLabel"
            :taggable="true"
            :multiple="true"
            @tag="addOption"
            @remove="onRemoveOption"
            tag-placeholder="Add this as a new option"
            placeholder="Select or add"
            :close-on-select="false"
            label="name"
            track-by="name"
          />
     

        <p class="item-description">
          Add accepted payment methods. Customers will see these options during checkout.
        </p>
      </div>

      <div class="form-group">
        <label>Currency:</label>
        <p v-if="errors.currency_code" class="error">{{ errors.currency_code }}</p>
        <multiselect
          v-model="settings.currency_code"
          :options="currencyList"
          :custom-label="currencyLabel"
          placeholder="Search Currency"
          track-by="currency_code"
          label="currency_code"
        ></multiselect>
        <p class="item-description">
          Select the currency to be used for transactions and pricing display.
        </p>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" v-model="settings.enable_discount"  @change="enable_discount_choices($event.target.checked)"/>
          Enable Discount
        </label>
        <div v-if="enable_discount_opt">
          <label><input type="radio" v-model="settings.enable_discount_type" value="fixed">Fixed Amount Discount</label>
          <label><input type="radio" v-model="settings.enable_discount_type" value="percentage">Percentage Discount</label>
        </div>
        <p class="item-description">
          Enable discount to sales transaction.
        </p>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" v-model="settings.enable_tax"  @change="enable_tax_choices($event.target.checked)"/>
          Enable Tax
        </label>
        <div v-if="enable_tax_opt">
          <label><input type="radio" v-model="settings.enable_tax_type" value="fixed">Fixed Amount Tax</label>
          <label><input type="radio" v-model="settings.enable_tax_type" value="percentage">Percentage Tax</label>
        </div>
        <p class="item-description">
          Enable tax to sales transaction.
        </p>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" v-model="settings.allow_last_minute_booking"  @change="enable_last_booking($event.target.checked)" />
          Allow Last Minute Booking
        </label>
        <p class="item-description">
          Enable this option to allow customers to book appointments at the last minute, bypassing any advance notice restrictions.
        </p>
      </div>
      <div class="form-group" v-if="enable_last_booking_opt">
        <label>
          <input type="text" v-model="settings.allow_last_minute_buffer" />
          Last Minute Buffer
        </label>
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
        currency_code: "",
        number_of_slots: "",
        slot_duration: "",
        time_type:"",
        enable_discount: false,
        enable_discount_type:'',
        enable_tax_type:'',
        allow_last_minute_booking:'',
        allow_last_minute_buffer:'',
        selectedPayment: null,
        selectedOptions: [],
        payment_methods: [],
      },
      payment_methods: [],
      paymentOptions: [],
      selectedMethods: [[]],
      currentIndex: 0,
      IMG_URL: '',
      timeZones: [],
      currencyList: [],
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
      loader_save: false,
      enable_discount_opt: false,
      enable_tax_opt: false,
      enable_last_booking_opt:false,
      errors: {
        number_of_slots: '',
        slot_duration: '',
        time_zone: '',
        payment_methods: '',
        currency_code: ''
      }
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
    this.fetchCurrencies();
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
          data.enable_discount = !!Number(data.enable_discount);
          data.enable_tax = !!Number(data.enable_tax);
          data.allow_last_minute_booking = !!Number(data.allow_last_minute_booking);
          data.currency_code = this.currencyList.find(
              currency => currency.code === data.currency_code
            );
          this.enable_discount_opt = !!Number(data.enable_discount);
          this.enable_tax_opt = !!Number(data.enable_tax);
          this.enable_last_booking_opt = !!Number(data.allow_last_minute_booking);
          this.settings = response.data;

          this.paymentOptions = JSON.parse(data.selectedOptions);
          this.selectedMethods[0] = JSON.parse(data.selectedOptions);
          
          this.payment_methods = JSON.parse(data.selectedOptions);
          this.selected_payment = data.payment_method;
          
        });
    },
    updateSettings() {


      this.errors = {
    number_of_slots: '',
    slot_duration: '',
    time_zone: '',
    payment_methods: '',
    currency_code: ''
  };

  let valid = true;

  if (!this.settings.number_of_slots) {
    this.errors.number_of_slots = 'Number of Slot Per Time is required.';
    valid = false;
  }

  if (!this.settings.slot_duration) {
    this.errors.slot_duration = 'Slot Duration is required.';
    valid = false;
  }

  if (!this.settings.time_zone) {
    this.errors.time_zone = 'Time Zone is required.';
    valid = false;
  }

  if (!this.selectedMethods[this.currentIndex] || this.selectedMethods[this.currentIndex].length === 0) {
    this.errors.payment_methods = 'At least one payment method is required.';
    valid = false;
  }

  if (!this.settings.currency_code) {
    this.errors.currency_code = 'Currency is required.';
    valid = false;
  }

  if (!valid) {
    this.notifyVue("top", "center", "danger", "Please fix the validation errors.", "ti-alert");
    return;
  }



      this.loader_save = true;
      let self = this;
      
      this.settings.selectedOptions = this.payment_methods;

      const payload = { 
        ...this.settings,
        business_id: self.user.business_id,
        user_id: self.user.id
      };

      axios
        .post(api.API_URL + "/settings", payload, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        .then(response => {
          this.loader_save = false;
          store.commit('enableOnlineBooking', this.settings.enable_booking==true ? 1 : 0);
          store.commit('setUser', response.data.user); 
          store.commit('setSettings', response.data.user.settings);
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
          store.commit('setUser', response.data.user); 
          store.commit('setSettings', response.data.user.settings);
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
    paymentLabel(option) {
      return option.name;
    },
    currencyLabel(currency) {
      return `${currency.code} (${currency.symbol})`;
    },
    enable_book_btn(value){
       // Update the local flag for showing the booking link container
      this.enable_booking_btn = value;
    },
    enable_discount_choices(value){
      this.enable_discount_opt = value;
    },
    enable_tax_choices(value){
      this.enable_tax_opt = value;
    },
    enable_last_booking(value){
      this.enable_last_booking_opt = value;
    },
    addPaymentMethod() {
      this.payment_methods.push('');
    },
    onRemoveOption(removedOption) {
      // Optional: if you want to also remove from the options list
      const index = this.payment_methods.findIndex(item => item.name === removedOption.name);
      if (index !== -1) {
        this.payment_methods.splice(index, 1);
      }

      // Remove from all selectedMethods
      this.selectedMethods = this.selectedMethods.map(selected =>
        selected.filter(item => item.name !== removedOption.name)
      );
    },
    addOption(newTag) {
      const newOption = { name: newTag };
      this.payment_methods.push(newOption);
      // Optionally, you can automatically select the newly added tag:
      this.selectedMethods[this.currentIndex].push(newOption);
    },
    editPaymentMethod(index) {
      this.currentIndex = index;
    },
    customCreateTag (newTag) {
          return { label: newTag, value: newTag }
    },
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

.payment-method-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.payment-method-item .multiselect {
  width: 200px;
}

.remove-button {
  background: #ff4444;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.add-button {
  background: #106c9c;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.add-button i {
  margin-right: 5px;
}

.error {
  color: red;
  font-size: 0.85em;
  margin-top: 4px;
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
