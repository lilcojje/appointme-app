<template>
  <div class="wrapper">
    <transition name="fade">
      <div id="logo-wrap" v-if="logoUrl">
        <img :src="logoUrl" id="logo-appointment" />
      </div>
      <div v-else class="business-title">
        <h1>{{businessProfile.business_name}}</h1>
      </div>
    </transition>
    <h3 class="heading-center" v-if="isCancelView">Cancel Appointment</h3>
    <!-- Cancel View (only shown if not canceled) -->
    <transition name="fade">
      <div class="appointment-form cancel-form" v-if="isCancelView">
        <loader v-if="loader_save" />
        <p><strong>Appointment ID:</strong> {{ appointment_info.id }}</p>
        <p><strong>Date:</strong> {{ formatDate(appointment_info.appointment_date) }}</p>
        <p><strong>Time:</strong> {{ appointment_info.appointment_time }}</p>
        <p></p><strong>Services:</strong> {{ appointment_info.services.join(', ') }}</p>
        <p class="cancel-message">If you need to cancel your appointment, click below.</p>
        <div class="button-wrap">
          <p-button type="danger" round @click.native.prevent="cancelAppointment" class="choices">
            Cancel Appointment
          </p-button>
        </div>
      </div>
    </transition>

    <!-- NEW: Canceled Appointment Display Message -->
    <transition name="fade" v-if="isCanceled">
      <div class="appointment-form canceled-display">
        <p class="cancel-message">
          Your appointment has been canceled. Please choose either "New Client" or "Existing Client" below to schedule another appointment.
        </p>
      </div>
    </transition>

    <transition name="fade" v-if="isRescheduled">
      <div class="appointment-form canceled-display">
        <p class="cancel-message">
          Your appointment has been already reschuled. 
        </p>
      </div>
    </transition>
    <h3 class="form-title" v-if="!isCancelView">Book Your Appointment</h3>
    <!-- New/Existing Buttons (hidden when rebooking) -->
    <transition name="fade" v-if="!isCancelView && !isRebook">
      <div id="choose" v-if="!choose_show && !success_show">
        <p-button type="info" round @click.native.prevent="chooseNew" class="choices">
          New Client
        </p-button>
        <p-button type="info" round @click.native.prevent="chooseExist" class="choices">
          Existing Client
        </p-button>
      </div>
    </transition>

    <!-- Appointment Form -->
    <transition name="fade" v-if="!isCancelView && !isRescheduledView">
      <div class="appointment-form" v-if="choose_show">
        <loader v-if="loader" />
        <!-- Suggested Title for the Appointment Form -->
        <transition name="fade">
          <!-- Hide the form once success_show is true -->
          <form @submit.prevent v-if="!success_show">
            <div class="row">
              <loader v-if="loader_save" />
              <div class="col-md-12" v-if="choose_info">
                <div class="form-group">
                  <label class="control-label" v-if="show_client">Select Client</label>
                </div>
                <!-- New Client Form -->
                <transition name="fade">
                  <div v-if="view_new">
                    <fg-input
                      v-model="info.first_name"
                      label="First Name"
                      placeholder="First Name"
                    />
                    <fg-input
                      v-model="info.last_name"
                      placeholder="Last Name"
                      label="Last Name"
                    />
                    <fg-input
                      v-model="info.contact_number"
                      placeholder="Contact Number"
                      label="Contact Number"
                    />
                    <fg-input
                      v-model="info.email"
                      placeholder="Email"
                      label="Email"
                      type="email"
                    />
                  </div>
                </transition>
                <!-- Existing Client Search -->
                <transition name="fade">
                  <div class="col-md-12" v-if="choose_existing">
                    <fg-input
                      v-model="info.email"
                      placeholder="Enter registered email"
                      label="Enter your registered email"
                      type="email"
                    />
                    <p-button type="info" round @click.native.prevent="chooseSearch" class="choices">
                      Search
                    </p-button>
                  </div>
                </transition>

                <!-- If rebooking, display a message with the rebook ID -->
                <transition name="fade">
                  <div v-if="isRebook" class="rebook-info">
                    <p><strong>Rebooking Appointment ID:</strong>&nbsp;<span  style="font-weight: bold; color:red;">{{ rebookId }}</span></p>
                    <p>
                      Previous Appointment Date: <span  style="font-weight: bold; color:red;">{{ rebookPreviousDate }}</span> <br/>
                      <span v-if="rebookClientName" style="font-weight: bold;"> by {{ rebookClientName }}</span>
                    </p>
                    <p style="color: red;">Please provide a reason for rebooking.</p>
                  </div>
                </transition>

                <!-- Common Appointment Fields -->
                <transition name="fade">
                  <div v-if="choose_found || view_new || isRebook">
                    <div class="form-group">
                      <label class="control-label">Date</label>
                      <input
                        type="date"
                        v-model="info.date"
                
                        @change="changeDate"
                        placeholder="Enter Date"
                        class="form-control"
                        :min="minDate"
                      />
                    </div>
                    <div class="form-group">
                      <label class="control-label">Select Time</label>
                      <select
                        v-model="info.time"
                        class="time-list form-control"
                        :disabled="!dateChanged" @change="changeTime"
                      >
                        <option value="">Select Time</option>
                        <option
                          v-for="(item, index) in time_list"
                          :value="item"
                          :key="index"
                        >
                          {{ item }}
                        </option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="control-label">Services</label>
                      <Multiselect
                        v-model="selectedService"
                        :options="serviceOptions"
                        :custom-label="getServiceLabel"
                        track-by="id"
                        label="name"
                        :multiple="true"
                        placeholder="Select Service"
                        class="w-full py-2"
                      />
                        <div v-if="serviceOptions.length == 0">
                          <p class="error-msg">Please contact the administrator to add services.</p>
                        </div>

                    </div>

                    <!-- Additional textarea for rebook reason -->
                    <div class="form-group" v-if="isRebook">
                      <label class="control-label">Reason</label>
                      <textarea
                        v-model="info.reason"
                        placeholder="Enter reason for rebooking"
                        class="form-control"
                      ></textarea>
                    </div>

                    <div style="clear:both;">&nbsp;</div>
                    <!-- Schedule Appointment Button -->
                    <p-button
                      type="info"
                      round
                      :disabled="loader_save"
                      @click.native.prevent="addAppointment"
                      id="add-appointment-fnt"
                      v-if="btn_type === 'add'"
                    >
                      Schedule Appointment
                    </p-button>
                  </div>
                </transition>
                <transition name="fade">
                  <div class="return-menu">
                    <p-button type="info" round @click.native.prevent="returnMain" class="choices">
                      Return to Main Menu
                    </p-button>
                  </div>
                </transition>
              </div>
            </div>
          </form>
        </transition>
        <!-- Success Message with Appointment Info and Cancel Option -->
        <transition name="fade">
        <div id="success" v-if="success_show">
          <h3>Your Appointment is Pending Confirmation</h3>
          <p>Your appointment has been successfully scheduled and is now pending confirmation.</p>
          <p><strong>Appointment ID:</strong> {{ appointment_info.appointment_id }}</p>
          <p><strong>Appointment Date:</strong> {{ formatDate(appointment_info.date) }}</p>
          <p><strong>Time:</strong> {{ appointment_info.time }}</p>
          <p><strong>Services:</strong> {{ appointment_info.services.join(', ') }}</p>
          <p>Thank you for choosing our services.</p>
          <p>You will receive a confirmation email once your appointment is approved.</p>
          <!-- Suggested Cancel Message Text -->
          <p class="cancel-message">If you need to cancel your appointment, please check your email.</p>
          <div class="return-menu">
              <p-button type="info" round @click.native.prevent="returnMain" class="choices">
                  Return to Main Menu
              </p-button>
          </div>
        </div>
      </transition>

      </div>
      <div style="clear:both">&nbsp;<</div>
    </transition>
  </div>
</template>

<script>
import api from "@/static/config.json";
import axios from "axios";
import Loader from "@/components/Loader";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";
import Swal from 'sweetalert2';

export default {
  components: {
    Loader,
    Multiselect,
    Swal
  },
  data() {
    return {
      info: {
        id: "",
        first_name: "",
        last_name: "",
        contact_number: "",
        email: "",
        services: "",
        date: "",
        time: "",
        status: "",
        client_type: "",
        reason: "" // Added for rebook reason
      },
      appointment_id: null, // To store the appointment ID after scheduling
      appointment_info: {
        appointment_date: '',
        appointment_time: '',
        services: [],
      }, // Holds appointment ID, date, and time for display
      choose_show: false,
      view_new: false,
      choose_existing: false,
      choose_found: false,
      choose_info: false,
      loader: false,
      loader_save: false,
      isReadOnly: false,
      selectedService: null,
      serviceOptions: [],
      time_list: [],
      dateChanged: false,
      btn_type: "add",
      show_client: false,
      success_show: false,
      selectedClient: null,
      add_btn: true,
      appointmentIdFromUrl: null,
      isCancelView: false, // already exists
      isCanceled: false,   // NEW property to track if appointment is canceled

      // New properties for rebook handling
      isRebook: false,
      rebookId: null,
      rebookPreviousDate: "",
      rebookClientName: "",
      isRescheduled: false,
      isRescheduledView: false,
      appointment_token : '',
      // New property to store business profile data including the logo
      businessProfile: {},
      minDate: this.getTodayDate()
    };
  },
  computed: {
    logoUrl() {
      // If businessProfile contains a business_logo, return it; otherwise, use the default logo.
      return this.businessProfile && this.businessProfile.business_logo
        ? api.IMG_URL + this.businessProfile.business_logo
        : '';
    },
    
  },
  methods: {
    fetchBusinessProfile() {
      const token = localStorage.getItem("token");
      const business_id = this.$route.params.id;
      axios
        .get(`${api.API_URL}/guest-business-profie/${business_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
          this.businessProfile = response.data;
          const timeTypeSetting = this.businessProfile.setting.find(item => item.key === 'time_type');
          const timeTypeValue = timeTypeSetting ? timeTypeSetting.value : null;
          
        })
        .catch(error => {
          console.error("Error fetching business profile:", error);
        });
    },
    resetForm() {
      this.info = {
        id: "",
        first_name: "",
        last_name: "",
        contact_number: "",
        email: "",
        services: "",
        date: "",
        time: "",
        status: "",
        client_type: "",
        reason: ""
      };
    },
    chooseNew() {
      this.isReadOnly = false;
      this.choose_show = true;
      this.view_new = true;
      this.choose_existing = false;
      this.choose_found = true;
      this.choose_info = true;
      this.resetForm();
      this.info.client_type = "new";
      this.isCanceled = false;
    },
    chooseExist() {
      this.info.email = "";
      this.choose_show = true;
      this.view_new = false;
      this.choose_existing = true;
      this.choose_found = false;
      this.choose_info = true;
      this.info.client_type = "existing";
      this.isCanceled = false;
    },
    returnMain() {
      this.choose_show = false;
      this.choose_info = false;
      this.choose_existing = false;
      this.choose_found = false;
      this.view_new = false;
      this.resetForm();
    },
    chooseSearch() {
      this.loader = true;
      const email = this.info.email.trim();

      if (!this.validateEmail(email)) {
        this.notifyVue(
          "top",
          "center",
          "danger",
          "Please enter a valid email address",
          "ti-hand-stop"
        );
        this.loader = false;
        return;
      }

      axios
        .post(
          api.API_URL + `/client-email`,
          { email: email },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        )
        .then(({ data }) => {
          this.loader = false;
          if (data.success) {
            this.notifyVue(
              "top",
              "center",
              "success",
              "Client found",
              "ti-check-box"
            );
            // Merge the returned client data into our info object
            this.info = { ...this.info, ...data.client };
            this.choose_found = true;
            this.choose_existing = false;
            this.isReadOnly = true;
            this.selectedClient = data.client;
          } else {
            this.notifyVue(
              "top",
              "center",
              "danger",
              data.message || "Client not found",
              "ti-hand-stop"
            );
          }
        })
        .catch(error => {
          this.loader = false;
          this.notifyVue(
            "top",
            "center",
            "danger",
            "Error checking client email",
            "ti-hand-stop"
          );
        });
    },
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },
    addAppointment() {
          let self = this;
          self.add_btn = false;

          // Set client_type only if not in rebook mode
          if (!self.isRebook) {
            self.info.client_type = self.view_new ? "new" : "existing";
          }

          // Skip client_type validation if rebooking
          if (!self.isRebook && !self.info.client_type) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: "Please select a client type",
              confirmButtonText: 'OK'
            });
            self.add_btn = true;
            return;
          }

          if (self.info.client_type === "existing" && !self.isRebook && (!self.selectedClient || !self.selectedClient.id)) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: "Please select an existing client",
              confirmButtonText: 'OK'
            });
            self.add_btn = true;
            return;
          }

          if (!self.info.date) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: "Date is required",
              confirmButtonText: 'OK'
            });
            self.add_btn = true;
            return;
          }

          if (!self.info.time) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: "Time is required",
              confirmButtonText: 'OK'
            });
            self.add_btn = true;
            return;
          }

          if (!self.selectedService || (Array.isArray(self.selectedService) && self.selectedService.length === 0)) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: "Please select at least one service",
              confirmButtonText: 'OK'
            });
            self.add_btn = true;
            return;
          }

          // Ensure reason is required for rebooking
          if (self.isRebook && (!self.info.reason || !self.info.reason.trim())) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: "Reason is required for rebooking",
              confirmButtonText: 'OK'
            });
            self.add_btn = true;
            return;
          }

          self.loader_save = true;
          const business_id = this.$route.params.id;
          let contactNumber = parseInt(self.info.contact_number, 10);
          axios
            .post(
              api.API_URL + "/appointment-guest/store",
              {
                first_name: self.info.first_name,
                last_name: self.info.last_name,
                contact_number: contactNumber,
                email: self.info.email,
                time: self.info.time,
                date: self.info.date,
                services: self.selectedService,
                business_id: business_id,
                client_type: self.isRebook ? "existing" : self.info.client_type,
                source: "Online Form",
                status: self.info.status,
                client_id: self.info.client_type === "existing" && self.selectedClient ? self.selectedClient.id : null,
                appointment_type: self.isRebook ? "rebook" : "new",
                reason: self.isRebook ? self.info.reason : null,
                rebook_id: self.rebookId
              },
              { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            )
            .then((response) => {
              self.loader_save = false;
              if (response.data && response.data.appointment_id) {
                self.appointment_id = response.data.appointment_id;
              }
              
              self.appointment_info = {
                appointment_id: self.appointment_id,
                date: self.info.date,
                time: self.info.time,
                services: self.selectedService.map((s) => s.name)
              };
              self.success_show = true;
              if (typeof self.list === "function") self.list();
              if (typeof self.closeModalAppointment === "function") self.closeModalAppointment();

              self.resetForm();
              self.add_btn = true;
            })
            .catch((error) => {
              self.loader_save = false;
              if (error.response && error.response.data) {
                // Loop through each field error and combine them into one string
                let messages = Object.keys(error.response.data)
                  .map(key => error.response.data[key].join(', '))
                  .join('\n');
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: messages,
                  confirmButtonText: 'OK'
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: "Error occurred",
                  confirmButtonText: 'OK'
                });
              }
              self.add_btn = true;
            });
        },

    fetchAppointmentDetails() {
      const business_id = this.$route.params.id;
      const appointment_token = this.appointment_token;
      let self = this;

      // Validate Business ID
      if (!business_id || Number.isNaN(Number(business_id))) {
        this.notifyVue("top", "center", "danger", "Invalid Business ID", "ti-hand-stop");
        return;
      }


      axios
         .get(`${api.API_URL}/appointment/view/${appointment_token}`, {
          params: { 
            business_id
          }
        })
        .then(({ data }) => {
          if (data) {
            console.log(data);
            self.appointment_info = data;
          
            // NEW: Check if the appointment status is "Canceled"
            if (data.status === "Cancelled") {
              self.isCanceled = true;
              self.isCancelView = false; // Hide the cancel view form if already canceled
            } else {
              self.isCanceled = false;
            }
          } else {
            self.appointment_info = { appointment_id: null, date: '', time: '' };
          }
        })
        .catch((error) => {
          console.error("API Error:", error);
          this.notifyVue("top", "center", "danger", "Error fetching appointment details", "ti-hand-stop");
        });
    },
    cancelAppointment() {
      let self = this;
      const appointment_token = this.appointment_token;

      if (!appointment_token) {
        this.notifyVue("top", "center", "danger", "No token ID found", "ti-hand-stop");
        return;
      }

      Swal.fire({
          title: 'Are you sure you want to cancel your appointment?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, cancel it!',
          cancelButtonText: 'No, keep it'
        }).then((result) => {
          if (result.isConfirmed) {
            this.loader_save = true;
            axios
              .post(api.API_URL + '/cancel-appointment', { appointment_token: appointment_token }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              })
              .then(response => {
                self.loader_save = false;
                if (response.data.success === false) {
                  this.notifyVue('top', 'center', 'danger', response.data.message, 'ti-hand-stop');
                } else {
                  this.isCancelView = false;
                  this.notifyVue('top', 'center', 'success', 'Appointment cancelled successfully', 'ti-check-box');
                  this.success_show = false;
                }
              })
              .catch(error => {
                self.loader_save = false;
                this.notifyVue('top', 'center', 'danger', 'Error cancelling appointment', 'ti-hand-stop');
              });
          }
        });

    },
    changeDate() {
      this.getTimeList();
    },
    changeTime(){
        let self = this;
        this.loader_save = true;

        let date = this.info.date;
        let time = this.info.time;

        return axios
          .get(api.API_URL + `/check-slot?business_id=${this.$route.params.id}&date=${date}&time=${time}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          })
          .then(({ data }) => {
            self.loader_save = false;
            console.log(data.message);

            // Display SweetAlert2 success message when slot is available
            Swal.fire({
              icon: 'success',
              title: data.message,
              text: `Available Slots: ${data.available_slots}`,
              confirmButtonText: 'OK'
            });
            
            return data;
          })
          .catch(({ response }) => {
              self.loader_save = false;
              let errorMessage = "An unknown error occurred";

              if (response && response.data) {
                errorMessage = response.data.error || errorMessage;
                console.error(errorMessage);

                // Display SweetAlert2 error message
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: errorMessage,
                  confirmButtonText: 'OK'
                });

                self.time_list = [];
                self.dateChanged = false;

                if (response.data.error.code === "token_could_not_verified") {
                  this.$router.push("/login");
                }
              } else {
                errorMessage = "Unknown error occurred.";
                console.error(errorMessage);

                // Display SweetAlert2 error message
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: errorMessage,
                  confirmButtonText: 'OK'
                });
              }
              return Promise.reject(response);
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
    fetchServiceOptions() {
      axios
        .get(api.API_URL + `/guest-services?business_id=${this.$route.params.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then(({ data }) => {
          // Note: data.data is an object; the actual services array is in data.data.data
          this.serviceOptions = data.data.map(service => ({
            id: service.id,
            name: service.name
          }));
        })
        .catch((error) => {
          console.error("Error fetching service options", error);
        });
    },

    getServiceLabel(option) {
      return option.name;
    },
    getTimeList() {
      let self = this;
      let date = this.info.date;
      this.loader_save = true;
      return axios
        .get(api.API_URL + `/availability-list?business_id=${this.$route.params.id}&date=${date}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then(({ data }) => {
          self.loader_save = false;
          self.dateChanged = true;
          self.time_list = data;
          return data;
        })
        .catch(({ response }) => {
            self.loader_save = false;
            let errorMessage = "An unknown error occurred";

            if (response && response.data) {
              errorMessage = response.data.error || errorMessage;
              console.error(errorMessage);

              // Display SweetAlert2 error message
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonText: 'OK'
              });

              self.time_list = [];
              self.dateChanged = false;

              if (response.data.error.code === "token_could_not_verified") {
                this.$router.push("/login");
              }
            } else {
              errorMessage = "Unknown error occurred.";
              console.error(errorMessage);

              // Display SweetAlert2 error message
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonText: 'OK'
              });
            }
            return Promise.reject(response);
          });

    },
    fetchRebookDetails() {
      const business_id = this.$route.params.id;
      const appointment_token = this.appointment_token;
      let self = this;
      // Validate IDs
      if (!business_id || Number.isNaN(Number(business_id))) {
        this.notifyVue("top", "center", "danger", "Invalid Business ID", "ti-hand-stop");
        return;
      }
    
      axios
        .get(`${api.API_URL}/appointment/view/${appointment_token}`, {
          params: { business_id }
        })
        .then(({ data }) => {
          if (data) {
            // Pre-populate form fields with fetched data
            self.info.first_name = data.first_name || "";
            self.info.last_name = data.last_name || "";
            self.info.contact_number = data.contact_number || "";
            self.info.email = data.email || "";
            // Use the correct field for the appointment date based on your API
            self.info.date = data.appointment_date || data.date || "";
            self.info.time = data.appointment_time || data.time || "";
            self.rebookId = data.id;
            
            // Load client id for rebooking if available
            if (data.client.id) {
              self.selectedClient = { id: data.client.id };
            }
            if (data.services && Array.isArray(data.services)) {
              // Assuming data.services is an array of IDs
              self.selectedService = self.serviceOptions.filter(service =>
                data.services.includes(service.id)
              );
            }

            if (data.status === "Rescheduled") {
              self.isRescheduled = true;
              self.isRescheduledView = true; // Hide the cancel view form if already canceled
            }
            
            // Store previous appointment date and client name for display
            self.rebookPreviousDate = data.appointment_date || data.date || "";
            self.rebookClientName = (data.client.first_name ? data.client.first_name + ' ' + (data.client.last_name || "") : "");
          } else {
            self.notifyVue("top", "center", "danger", "Appointment details not found", "ti-hand-stop");
          }
        })
        .catch((error) => {
          console.error("Error fetching rebook appointment details:", error);
          self.notifyVue("top", "center", "danger", "Error fetching rebook appointment details", "ti-hand-stop");
        });
    },
    formatDate(value) {
      if (!value) return '';
      // Replace dashes with slashes for better cross-browser compatibility
      const formattedValue = value.replace(/-/g, '/');
      const date = new Date(formattedValue);
      if (isNaN(date.getTime())) return value; // Return the original value if date is invalid
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    getTodayDate() {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.fetchServiceOptions();
    this.fetchBusinessProfile();
  },
  created() {
    // Check if URL has the `cancel` parameter
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("cancel")) {
      this.appointment_token = urlParams.get("cancel");
      this.isCancelView = true; // Enable cancel view mode
      this.fetchAppointmentDetails();
    }

    if (urlParams.has("rebook")) {
      this.appointment_token = urlParams.get("rebook");
      this.isRebook = true;
      this.choose_show = true; // Show the appointment form
      this.choose_info = true; // Ensure the form fields are rendered
      this.info.client_type = "existing";
      this.fetchRebookDetails();
    }

    
  }
};
</script>

<style scoped>
.wrapper {
  padding: 20px;
  font-family: 'Roboto', sans-serif;
  background-color: #f9f9f9;
  min-height: 100vh;
}

/* Form container styles */
.appointment-form,
#choose {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  margin: 20px auto;
}
#add-appointment-fnt{width: 100%;}

/* Logo styling */
#logo-wrap {
  text-align: center;
  margin-bottom: 20px;
}
#logo-appointment {
  width: 80%;
  max-width: 300px;
  margin: 30px auto;
}

/* Fade transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* Responsive buttons style */
.choices {
  width: 100%;
  margin-bottom: 15px;
  display: block;
}

/* Text styling for headings and messages */
.heading-center,
.form-title {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}
.form-title {
  font-size: 1.6em;
  font-weight: 600;
}

/* Cancel message and general messages styling */
.cancel-message {
  text-align: center;
  font-style: italic;
  color: #d9534f;
  margin-bottom: 20px;
  font-weight: bold;
}

/* Button wrap for cancel buttons */
.button-wrap {
  text-align: center;
  margin-top: 30px;
}

/* Rebook info block */
.rebook-info {
  text-align: center;
  margin-bottom: 20px;
  font-style: italic;
  color: #555;
}

/* Return menu styling */
.return-menu {
  text-align: center;
  margin-top: 20px;
}

/* Form group styling */
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}
.form-control {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1em;
  transition: border-color 0.3s;
}
.form-control:focus {
  outline: none;
  border-color: #66afe9;
}

/* Success message styling */
#success {
  text-align: center;
  padding: 20px;
}

.business-title{text-align: center; margin-bottom: 60px;}

.error-msg{color:red; font-weight: bold;}

/* Media queries for mobile responsiveness */
@media (max-width: 768px) {
  .appointment-form,
  #choose {
    padding: 15px;
    width: 90%;
  }
  #logo {
    width: 60%;
  }
}
</style>
