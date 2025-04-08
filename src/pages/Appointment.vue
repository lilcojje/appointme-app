<template>
  <div id="page-appointment">
    <div class="row">
      <div class="col-12">
        <card>
          <div slot="raw-content" class="table-responsive">
            <div class="row" id="top-tool-bar">
              <div class="col-6">
                <input 
                  type="text" 
                  v-model="search_text" 
                  @input="search" 
                  placeholder="Search appointments..." 
                  class="form-control search"
                v-if="view_list"/>
                <select v-model="selectedStatus" @change="search" class="form-control search" v-if="view_list">
                  <option value="">Filter by Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                  <option value="No Show">No Show</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>
              <div class="col-6 add-btn-wrap">
                <p-button type="info" round @click.native.prevent="modalAddAppointment" id="add-appointment" v-show="user.permissions.includes('add_appointments')">
                  Add Appointment
                </p-button>
              </div>
            </div>
            <div class="row" id="top-tool-bar">
              <div class="col-6">
                <select @change="SelectView" v-model="select_view" id="select-view">
                  <option value="">Select View</option>
                  <option value="list">List</option>
                  <option value="calendar">Calendar</option>
                </select>
                <date-picker v-model="date_range" range v-if="view_list && select_view !== ''"></date-picker>
                <p-button type="info" round @click.native.prevent="generate" id="generate-appoint" v-if="view_list && select_view !== ''">
                  Date Filter
                </p-button>
              </div>
            </div>
            <loader v-if="loader" />
            <FullCalendar ref="cc" :options="calendarOptions" id="fullcalendar" v-if="calendar_list" />
            <table class="table table-striped tbl-style" id="appoint-tbl" v-if="view_list && select_view !== ''">
              <thead>
                <th class="hide-to-mobile">ID</th>
                <th>First Name</th>
                <th class="hide-to-mobile">Last Name</th>
                <th class="hide-to-mobile">Contact Number</th>
                <th style="text-align: center;">Date <span class="hide-desktop">Time</span></th>
                <th style="text-align: center;" class="hide-to-mobile">Time</th>
                <th class="hide-to-mobile">Services</th>
                <th class="hide-to-mobile">Status</th>
                <th style="text-align: center;">Action</th>
              </thead>
              <tbody v-if="appointments.total > 0">
                <tr v-for="(appointment, index) in appointments.data" :key="index">
                  <td class="hide-to-mobile">{{ appointment.id }}</td>
                  <td>{{ appointment.client ? appointment.client.first_name : 'N/A' }}</td>
                  <td class="hide-to-mobile">{{ appointment.client ? appointment.client.last_name : 'N/A' }}</td>
                  <td class="hide-to-mobile">{{ appointment.client ? appointment.client.contact_number : 'N/A' }}</td>
                  <td style="text-align: center;">{{ appointment.appointment_date }}<span class="hide-desktop">{{ appointment.appointment_time }}</span> <span class="status hide-desktop" :style="{ backgroundColor: getStatusColor(appointment.status), color: '#fff', padding: '5px 10px', borderRadius: '5px' }">
                      {{ appointment.status }}
                    </span><span class="hide-desktop">{{ appointment.formated_service }}</span></td>
                  <td style="text-align: center;" class="hide-to-mobile">{{ appointment.appointment_time }}</td>
                  <td class="hide-to-mobile">{{ appointment.formated_service }}</td>
                  <td class="hide-to-mobile">
                    <span class="status" :style="{ backgroundColor: getStatusColor(appointment.status), color: '#fff', padding: '5px 10px', borderRadius: '5px' }">
                      {{ appointment.status }}
                    </span>
                  </td>
                  <td class="action">
                    <p-button type="info" round @click.native.prevent="editEvent(appointment)" v-show="user.permissions.includes('edit_appointments')">
                      <span class="ti-pencil"></span>
                    </p-button>
                    <p-button type="info" round @click.native.prevent="deleteAppointment(appointment.id)" v-show="user.permissions.includes('delete_appointments')">
                      <span class="ti-trash"></span>
                    </p-button>
                    <p-button type="info" round @click.native.prevent="approveAppointment(appointment)" v-show="user.permissions.includes('approve_appointments')">
                      <span class="ti-thumb-up"></span>
                    </p-button>
                  </td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr>
                  <td align="center" colspan="7" id="no-record">No record found.</td>
                </tr>
              </tbody>
            </table>
            <div class="total_records">Total Records: {{total}}</div>
            <paginate
              :page-count="total_page"
              :page-range="1"
              :margin-pages="2"
              :click-handler="clickCallback"
              :prev-text="'Prev'"
              :next-text="'Next'"
              :container-class="'pagination'"
              :page-class="'page-item'"
              v-if="appointments.total > 0 && !calendar_list && select_view !== ''"
            ></paginate>
          </div>
        </card>
      </div>
    </div>

    <!-- Appointment Modal -->
    <Modal :showModal="modalVisible" :title="modal_title" @close="closeModalAppointment">
      <loader v-if="loader_save" />
      <div class="form-group">
        <label class="control-label" v-if="show_client">Select Client</label>
        <select @change="selectClient($event)" class="select-client form-control" v-model="info.client_type" v-if="show_client">
          <option value="">Select Client</option>
          <option value="new">New Client</option>
          <option value="existing">Existing Client</option>
        </select>
      </div>


      

      <!-- Existing Client Section -->
      <div v-show="view_existing">
        <div class="form-group">
          <label class="control-label">Search Client:</label>
            <multiselect
              v-model="selectedClient"
              :options="items"
              :custom-label="clientLabel"
              :loading="isLoadingClients"
              placeholder="Search client"
              @search-change="fetchClients"
              track-by="id"
              label="first_name"
              class="search-client"
            ></multiselect>
         </div>
      </div>

      <!-- New Client Section (with Email field) -->
      <div v-show="view_new">
        <fg-input v-model="info.first_name" label="First Name" placeholder="First Name" />
        <fg-input v-model="info.last_name" label="Last Name" placeholder="Last Name" />
        <fg-input v-model="info.contact_number" label="Contact Number" placeholder="Contact Number" />
        <fg-input v-model="info.email" label="Email" placeholder="Email" />
      </div>

      <fg-input type="date" label="Select Date" placeholder="Date" v-model="info.date" @change.native="changeDate" :min="minDate" />

      <div class="form-group" v-if="timeType=='auto'">
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
                    <div class="form-group front-timepicker" v-else>
                      <label class="control-label">Input Time</label>
                      <vue-timepicker format="hh:mm a" v-model="info.time" id="input-time" input-class="input_time" input-width="100%" @change="inputTime" :disabled="!dateChanged"></vue-timepicker>
                    </div>

      <div class="form-group">
        <label class="control-label">Services</label>
        <multiselect
          v-model="selectedService"
          :options="serviceOptions"
          :custom-label="getServiceLabel"
          track-by="id"
          label="name"
          :multiple="true"
          placeholder="Select Service"
          class="w-full py-2 border border-indigo-500 rounded"
        ></multiselect>
      </div>

      <!-- New Status Selection Field -->
      <div class="form-group">
        <label class="control-label">Status</label>
        <select v-model="info.status" class="form-control">
          <option value="">Select Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="No Show">No Show</option>
          <option value="Completed">Completed</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Rescheduled">Rescheduled</option>
          <option value="In Progress">In Progress</option>
          <option value="On Hold">On Hold</option>
          <option value="Declined">Declined</option>
        </select>
      </div>


      <div class="form-group" v-if="rebook_reason_view">
        <label class="control-label">Reschedule Reason:</label>
        <textarea v-model="info.rebook_reason" class="form-control"></textarea>
      </div>

      <div style="clear:both;">&nbsp;</div>
      <p-button type="info" round @click.native.prevent="addAppointment" id="add-appointment" v-show="btn_type === 'add'">
        {{ modal_button === 'Reschedule' ? 'Reschedule' : 'Add APPOINTMENT' }}
      </p-button>
      <p-button type="info" round @click.native.prevent="updateAppointment" id="add-appointment" v-show="btn_type === 'edit'">
         Update
      </p-button>
      <p-button type="info" round @click.native.prevent="cancel()" id="cancel">
            Cancel
       </p-button> 
      
      <div style="clear:both;">&nbsp;</div>
    </Modal>

    <!-- View Appointment Modal -->
    <Modal :showModal="modalViewVisible" :title="modal_title" @close="closeModalViewAppointment" id="modal-appointment">
      <loader v-if="loader" />
      <div class="row">
        <div class="col-lg-12">
          <p class="appoint-info">Date: {{ info.date }}</p>
          <p class="appoint-info">Time: {{ info.time }}</p>
          <p class="appoint-info">Services: {{ services }}</p>
          <p class="appoint-info" v-if="info.status">
            Status: {{ info.status ? info.status.charAt(0).toUpperCase() + info.status.slice(1) : '' }}
          </p>
        </div>
      </div>
      <div style="clear:both;">&nbsp;</div>
      
      <p-button type="info" round @click.native.prevent="editEvent(app_data)" class="edt-appointment">
        Edit APPOINTMENT
      </p-button>
      <p-button type="info" round @click.native.prevent="cancel()" id="cancel">
            Cancel
       </p-button> 
      <div style="clear:both;">&nbsp;</div>
    </Modal>
  </div>
</template>

<script>
import api from "@/static/config.json";
import axios from "axios";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import Paginate from "vuejs-paginate";
import DatePicker from "vue2-datepicker";
import VAutocomplete from "v-autocomplete";
import ItemTemplate from "@/components/ItemTemplate.vue";
import ItemServices from "@/components/ItemServices.vue";
import "vue2-datepicker/index.css";
import "v-autocomplete/dist/v-autocomplete.css";
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";
import Swal from 'sweetalert2';
import VueTimepicker from 'vue2-timepicker'
import 'vue2-timepicker/dist/VueTimepicker.css'

export default {
  components: {
    Loader,
    Paginate,
    Modal,
    DatePicker,
    VComplete: VAutocomplete,
    VAutocomplete,
    ItemTemplate,
    Multiselect,
    FullCalendar,
    Swal,
    VueTimepicker
  },
  data() {
    return {
      loader: false,
      loader_save: false,
      current_page: '',
      records: { success: true },
      total_page: 0,
      search_text: "",
      selectedStatus: "",
      appointments: [],
      showAddModal: true,
      modalVisible: false,
      modalViewVisible: false,
      info: {
        id: "",
        first_name: "",
        last_name: "",
        contact_number: "",
        email: "", // Added email field
        services: "",
        date: "",
        time: "",
        status: "",
        client_type: "",
        rebook_reason:""
      },
      search_value: "",
      from_value: "",
      to_value: "",
      modal_title: "",
      modal_button: "",
      btn_type: "",
      client_name: "",
      topay: false,
      show_status: false,
      show_selected_time: false,
      view_existing: false,
      dateChanged: false,
      services: "",
      view_new: false,
      item: {},
      items: [],
      template: ItemTemplate,
      templateService: ItemServices,
      input_name: "",
      time_list: [],
      gluta_services: "",
      date_range: "",
      selectedService: null,
      serviceOptions: [],
      calendarOptions: {
        plugins: [dayGridPlugin],
        initialView: "dayGridMonth",
        weekends: true,
        events: [],
        datesSet: this.handleMonthChange,
        eventClick: this.handleEventClick
      },
      select_view: "",
      calendar_list: false,
      view_list: false,
      if_edit: false,
      add_btn: true,
      selectedClient: null,
      isLoadingClients: false,
      show_client: true,
      app_data: [],
      was_delete: false,
      rebook_reason_view:false,
      minDate: this.getTodayDate(),
      schedule_found: false,
      is_not_found_error: false,
      isDateChanged:false,
      time_type: '',
      total: 0
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    token() {
      return this.$store.state.token;
    },
    settings() {
      // Ensure it's an array
      return this.$store.state.settings;
    },
    timeType() {
      const plainSettings = JSON.parse(JSON.stringify(this.settings));

      const time_type = plainSettings.time_type;

      return time_type;
      // const setting = plainSettings.find(item => item.key === 'enable_booking');
      // // Convert the value "1" to boolean true, otherwise return false
      // return setting ? setting.value == "1" : false;
    }
  },
  methods: {
    async list(page = 1) {
      let self = this;
      let limit = 10;
      // if (self.view_list) {
      //   self.view_list = true;
      //   self.calendar_list = false;
      // } else {
      //   self.view_list = false;
      //   self.calendar_list = true;
      // }

      const range_data = this.date_range;
      if (this.date_range !== "") {
        this.from_value = range_data[0].toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        });
        this.to_value = range_data[1].toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        });
      }
      let from = this.from_value === "" ? this.getMonthStart() : this.from_value;
      let to = this.to_value === "" ? this.getMonthEnd() : this.to_value;
      self.page = page;
      self.loader = true;
     
      await axios
        .get(
          api.API_URL +
           `/appointment?page=${page}&limit=${limit}&from=${from}&to=${to}&search=${this.search_text}&status=${this.selectedStatus}&business_id=${self.user.business_id}`,
          {
            headers: { Authorization: `Bearer ${self.token}` }
          }
        )
        .then(({ data }) => {
          self.loader = false;
          self.appointments = data;
          self.total_page = Math.ceil(data.total / limit);
          data.data.forEach((appointment) => {
            appointment.formated_service =
              Array.isArray(appointment.services) && appointment.services.length
                ? appointment.services.join(", ")
                : "No Service";
          });
          self.total = data.total;
        })
        .catch(({ response }) => {
          if (response.data.error.code === "token_could_not_verified") {
            localStorage.removeItem("token");
            this.$router.push("/login");
          }
        });
    },
    clickCallback(pageNum) {
      this.list(pageNum);
      this.current_page = pageNum;
      this.view_list = true;
      this.calendar_list = false;
    },
    openModalAppointment() {
      this.modalVisible = true;
    },
    closeModalAppointment() {
      this.modalVisible = false;
    },
    closeModalViewAppointment() {
      this.modalViewVisible = false;
    },
    addAppointment() {
      
      let self = this;
      this.add_btn = false;
      // --- Validations for Add Appointment ---
      if (!self.info.client_type) {
        self.notifyVue("top", "center", "danger", "Please select a client type", "ti-hand-stop");
        return;
      }
      // Only validate selectedClient if the type is "existing"
      if (self.info.client_type === "existing" && (!self.selectedClient || !self.selectedClient.id)) {
        self.notifyVue("top", "center", "danger", "Please select an existing client", "ti-hand-stop");
        return;
      }
      if (self.info.client_type === "new") {
        if (!self.info.first_name) {
          self.notifyVue("top", "center", "danger", "First Name is required", "ti-hand-stop");
          return;
        }
        if (!self.info.last_name) {
          self.notifyVue("top", "center", "danger", "Last Name is required", "ti-hand-stop");
          return;
        }
        if (!self.info.contact_number) {
          self.notifyVue("top", "center", "danger", "Contact Number is required", "ti-hand-stop");
          return;
        }
        if (!self.info.email) {
          self.notifyVue("top", "center", "danger", "Email is required", "ti-hand-stop");
          return;
        }
      }
      
      if (!self.info.date) {
        self.notifyVue("top", "center", "danger", "Date is required", "ti-hand-stop");
        return;
      }
      if (!self.info.time) {
        self.notifyVue("top", "center", "danger", "Time is required", "ti-hand-stop");
        return;
      }
      if (!self.selectedService || self.selectedService.length === 0) {
        self.notifyVue("top", "center", "danger", "Please select at least one service", "ti-hand-stop");
        return;
      }

      if(this.client_type	=='existing'){
        alert(info.email)
        self.info.first_name = "";
        self.info.last_name = "";
        self.info.contact_number = "";
         self.info.email = "";
      }
      
      
      this.loader_save = true;
      axios
        .post(
          api.API_URL + "/appointment/store",
          {
            first_name: self.info.first_name,
            last_name: self.info.last_name,
            contact_number: self.info.contact_number,
            email: self.info.email,
            time: self.info.time,
            date: self.info.date,
            services: self.selectedService,
            business_id: self.user.business_id,
            client_type: self.info.client_type,
            source: 'System Encoded',
            status: self.info.status,
            client_id: self.info.client_type === "existing" ? self.selectedClient.id : null,
            ...(self.info.status === "Rescheduled" && {
              rebook_reason: self.info.rebook_reason,
              rebook_from: self.info.id
            })
          },
          {
            headers: { Authorization: `Bearer ${self.token}` }
          }
        )
        .then((response) => {
          self.loader_save = false;
          if (response.data.error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Limit Reached',
                    text: 'Adding Appointment has reached the limit. Please upgrade to Pro.',
                    showCancelButton: true,
                    confirmButtonText: 'Subscribe',
                    cancelButtonText: 'Close'
                }).then((result) => {
                    if (result.isConfirmed) {
                        this.$router.push('/subscription')
                    }
                });
            }else{
              self.notifyVue("top", "center", "success", "Appointment Successfully Added", "ti-announcement");
              self.list();
              self.closeModalAppointment();
              // Clear fields
              self.info.first_name = "";
              self.info.last_name = "";
              self.info.contact_number = "";
              self.info.email = "";
              self.info.status = "";
              self.info.date = "";
              self.info.time = "";
              self.services = [];
              self.handleMonthChange();
            } 

          self.add_btn = true;
        })
        .catch((error) => {
          try {
            self.loader_save = false;
            if (error.response.status === 400) {
              self.notifyVue("top", "center", "danger", error.response.data.error.message, "ti-hand-stop");
            } else if (error.response.status === 422) {
              for (const [key, value] of Object.entries(error.response.data)) {
                self.notifyVue("top", "center", "danger", value, "ti-hand-stop");
              }
              self.add_btn = true;
            }
          } catch (err) {}
        });
    },
    updateAppointment() {

      let self = this;
      // --- Validations for Update Appointment ---
      if (!self.info.client_type && self.info.client_type == "new") {
        self.notifyVue("top", "center", "danger", "Please select a client type", "ti-hand-stop");
        return;
      }
      if (self.info.client_type === "existing" && (!self.selectedClient || !self.selectedClient.id)) {
        self.notifyVue("top", "center", "danger", "Please select an existing client", "ti-hand-stop");
        return;
      }
      if (self.info.client_type === "new") {
        if (!self.info.first_name) {
          self.notifyVue("top", "center", "danger", "First Name is required", "ti-hand-stop");
          return;
        }
        if (!self.info.last_name) {
          self.notifyVue("top", "center", "danger", "Last Name is required", "ti-hand-stop");
          return;
        }
        if (!self.info.contact_number) {
          self.notifyVue("top", "center", "danger", "Contact Number is required", "ti-hand-stop");
          return;
        }
        if (!self.info.email) {
          self.notifyVue("top", "center", "danger", "Email is required", "ti-hand-stop");
          return;
        }
      }
      if (!self.info.date) {
        self.notifyVue("top", "center", "danger", "Date is required", "ti-hand-stop");
        return;
      }
      if (!self.info.time) {
        self.notifyVue("top", "center", "danger", "Time is required", "ti-hand-stop");
        return;
      }
      if (!self.selectedService || self.selectedService.length === 0) {
        self.notifyVue("top", "center", "danger", "Please select at least one service", "ti-hand-stop");
        return;
      }
      if (!self.info.status) {
        self.notifyVue("top", "center", "danger", "Status is required", "ti-hand-stop");
        return;
      }
      this.loader_save = true;
      axios
        .put(
          api.API_URL + "/appointment/update/" + self.info.id,
          {
            first_name: self.info.first_name,
            last_name: self.info.last_name,
            contact_number: self.info.contact_number,
            email: self.info.email,
            time: self.info.time,
            date: self.info.date,
            services: self.selectedService,
            status: self.info.status,
            business_id: self.user.business_id,
            client_type: self.info.client_type,
            client_id: self.info.client_type === "existing" ? self.selectedClient.id : null
          },
          {
            headers: { Authorization: `Bearer ${self.token}` }
          }
        )
        .then((data) => {
          self.loader_save = false;
          self.notifyVue("top", "center", "success", "Appointment Successfully Updated", "ti-announcement");
          self.list();
          self.closeModalAppointment();
          self.info.first_name = "";
          self.info.last_name = "";
          self.info.contact_number = "";
          self.info.email = "";
          self.handleMonthChange();
        })
        .catch((error) => {
          try {
            self.loader_save = false;
            if (error.response.status === 400) {
              self.notifyVue("top", "center", "danger", error.response.data.error.message, "ti-hand-stop");
            } else if (error.response.status === 422) {
              for (const [key, value] of Object.entries(error.response.data)) {
                self.notifyVue("top", "center", "danger", value, "ti-hand-stop");
              }
            }
          } catch (err) {}
        });
    },
    getTodayDate() {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
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
    search() {
      this.list();
    },
    modalAddAppointment() {
      this.info.first_name = "";
      this.info.last_name = "";
      this.info.contact_number = "";
      this.info.email = ""; // Reset email
      this.info.time = "";
      this.info.date = "";
      this.info.client_type = "";
      this.input_name = "";
      this.info.date = "";
      this.info.status = "";
      this.show_client = true;
      this.view_existing = false;
      this.selectedClient = "";
      this.modal_title = "Add Appointment";
      this.modal_button = "Add";
      this.openModalAppointment();
      this.btn_type = "add";
      this.topay = false;
      this.add_btn = true;
      this.selectedService = [];
    },
    modalEditAppointment(appointment) {
      this.if_edit = true;
      this.modal_title = "Update Appointment";
      this.modal_button = "Update";
      this.openModalAppointment();
      this.btn_type = "edit";
      this.info.first_name  = (appointment.client && appointment.client.first_name) || "";
      this.info.last_name = (appointment.client && appointment.client.last_name) || "";
      this.info.contact_number = (appointment.client && appointment.client.contact_number) || "";
      this.info.email = (appointment.client && appointment.client.contact_number) || "";
      this.info.time = appointment.time;
      this.info.date = appointment.date;
      this.info.status = appointment.status;
      this.info.client_type = appointment.type;
      this.info.id = appointment.id;
      this.show_status = true;
      this.show_client = false;
      this.dateChanged = false;
      this.getTimeList();
    },
    deleteAppointment(id) {

      this.loader_save = true;
      let self = this;
      self.calendar_list = false;
      
      Swal.fire({
        title: "Want to delete this appointment?",
        text: "Do you really want to delete this appointment?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
          axios
            .delete(api.API_URL + "/appointment/delete/" + id, {
              headers: { Authorization: `Bearer ${self.token}` }
            })
            .then((data) => {
              self.was_delete = true;
              self.loader_save = false;
              Swal.fire("Deleted!", "Appointment successfully deleted.", "success");
              self.list();
            })
            .catch((error) => {
              self.loader_save = false;
              try {
                if (error.response.status == 400) {
                  Swal.fire("Error", error.response.data.error.message, "error");
                } else if (error.response.status == 422) {
                  for (const [key, value] of Object.entries(error.response.data)) {
                    Swal.fire("Validation Error", value, "error");
                  }
                }
              } catch (err) {
                Swal.fire("Error", "Something went wrong!", "error");
              }
            });
        }
      });

    },
    addMore() {
      this.services.push({ services_name: "" });
    },
    remove(index) {
      this.services.splice(index, 1);
      this.price();
    },
    getDate() {
      const today = new Date();
      const yyyy = today.getFullYear();
      let mm = today.getMonth() + 1;
      let dd = today.getDate();
      if (dd < 10) dd = "0" + dd;
      if (mm < 10) mm = "0" + mm;
      return mm + "/" + dd + "/" + yyyy;
    },
    getTime() {
      const today = new Date();
      return today.toLocaleTimeString().replace(/:\d+ /, " ");
    },
    price() {
      let total = 0;
      for (let key in this.services) {
        if (this.services.hasOwnProperty(key)) {
          total = total + parseInt(this.services[key].price);
        }
      }
      this.info.total = total;
    },
    isNumber(value) {
      return typeof value === "number";
    },
    format_price(newValue) {
      const result = newValue.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return result;
    },
    cash(e) {
      const change = parseInt(this.info.cash) - parseInt(this.info.total);
      this.info.change = change;
    },
    selectClient(event) {
      if (event.target.value === "new") {
        this.view_new = true;
        this.view_existing = false;
      } else if (event.target.value === "existing") {
        this.view_new = false;
        this.view_existing = true;
        this.info.first_name = ''
        this.info.last_name = ''
        this.info.email = ''
        this.info.contact_number = ''
      }
    },
    getLabel(item) {
      this.info.first_name = item.first_name;
      this.info.last_name = item.last_name;
      this.info.contact_number = item.contact_number;
      this.info.email = item.email || "";
      return item.first_name + " " + item.last_name;
    },
    updateItems(text) {
      let self = this;
      self.loader_save = true;
      axios
        .get(api.API_URL + `/client?search=${text}`, {
          headers: { Authorization: `Bearer ${self.token}` }
        })
        .then(({ data }) => {
          self.loader_save = false;
          self.items = data.data;
        })
        .catch(({ response }) => {
          if (response.data.error.code == "token_could_not_verified") {
            this.$router.push("/login");
          }
        });
    },
    // --- Additional Methods ---
    getMonthStart() {
      let date = new Date();
      return `${String(date.getMonth() + 1).padStart(2, "0")}/01/${date.getFullYear()}`;
    },
    getMonthEnd() {
      let date = new Date();
      let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      return `${String(date.getMonth() + 1).padStart(2, "0")}/${lastDay}/${date.getFullYear()}`;
    },
    fetchServiceOptions() {
      axios
        .get(api.API_URL + `/service?business_id=${this.user.business_id}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        .then(({ data }) => {
          this.serviceOptions = data.data.map((service) => ({
            id: service.id,
            name: service.name
          }));
        })
        .catch((error) => {
          console.error("Error fetching service options", error);
        });
    },
    getServiceLabel(service) {
      return service.name;
    },
    clientLabel(client) {
      return `${client.first_name} ${client.last_name}`;
    },
    fetchClients(searchText) {
      this.isLoadingClients = true;
      axios
        .get(api.API_URL + `/client?search=${searchText}&business_id=${this.user.business_id}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        .then(({ data }) => {
          this.items = data.data;
          this.isLoadingClients = false;
        })
        .catch((error) => {
          console.error("Error fetching clients:", error);
          this.isLoadingClients = false;
        });
    },
    // --- End Additional Methods ---
    getTimeList() {
        let self = this;
        let date = this.info.date;
        this.loader_save = true;

        return axios
            .get(api.API_URL + `/availability-list?business_id=${self.user.business_id}&date=${date}`, {
                headers: { Authorization: `Bearer ${self.token}` }
            })
            .then(({ data }) => {
                self.loader_save = false;
                self.dateChanged = true;
                self.time_list = data;

                if (Array.isArray(data) && data.length > 0) {
                    self.schedule_found = true;
                    self.is_not_found_error = false;

                    // ✅ Only show Swal when changeDate() triggers this function
                    if (self.isDateChanged &&  this.btn_type === "edit") {
                        Swal.fire({
                            title: "Need to Reschedule?",
                            text: "This will create a new appointment and update the booking.",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Yes",
                            cancelButtonText: "No"
                        }).then((result) => {
                            if (result.isConfirmed) {
                                this.modal_title = "Reschedule Appointment";
                                this.modal_button = "Reschedule";
                                this.info.status = "Rescheduled";
                                this.rebook_reason_view = true;
                                this.btn_type = "add";
                                this.info.client_type = "existing";
                            }
                        });

                        // Reset the flag after displaying the alert
                        self.isDateChanged = false;
                    }
                } else {
                    self.schedule_found = false;
                    self.is_not_found_error = true;
                }
                return data;
            })
            .catch((error) => {
                self.loader_save = false;
                self.schedule_found = false;
                self.is_not_found_error = true;

                if (error.response) {
                    var errorMessage = (error.response && error.response.data && error.response.data.error) || "Unknown server error";

                    if (errorMessage === "No schedule found for the selected date") {
                        self.time_list = [];
                        self.is_not_found_error = true;
                    }

                    if (error.response.status === 401) {
                        self.$router.push("/login");
                    }

                    self.notifyVue("top", "center", "danger", errorMessage, "ti-hand-stop");
                } else {
                    console.error("Request failed:", error.message);
                    self.notifyVue("top", "center", "danger", "Network error occurred", "ti-hand-stop");
                }

                return Promise.reject(error);
            });
    },

    changeDate() {
        this.isDateChanged = true; // Set flag to indicate the date was changed
        this.getTimeList();
    }
    ,
    generate() {
      this.list();
      this.calendar_list = false;
      this.view_list = true;
    },
    SelectView() {
      if (this.select_view === "calendar") {
        this.calendar_list = true;
        this.view_list = false;
      } else {
        this.calendar_list = false;
        this.view_list = true;
      }
    },
    async handleMonthChange() {
      let self = this;
      let calendarApi = this.$refs.cc.getApi();
      let current_month = calendarApi.view.currentStart;
      let month_year = current_month.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit"
      });

      self.loader = true;
      axios
        .get(api.API_URL + `/appointment/calendar?filter=${month_year}&business_id=${this.user.business_id}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        .then(({ data }) => {
          self.loader = false;
          this.calendarOptions.events = data;
          this.$refs.calendar.getApi().render();
        })
        .catch(({ response }) => {
          self.loader = false;
        });
    },
    handleEventClick(info) {
      this.modal_title = "View Appointment";
      this.modalViewVisible = true;
      this.view_existing = true;
      this.show_selected_time = true;
      let self = this;
      self.loader = true;
      this.modal_title = "View Appointment";
      this.info.date = "";
      this.info.time = "";
      this.services = "";
      axios
        .get(api.API_URL + `/appointment/show/${info.event.id}`, {
          headers: { Authorization: `Bearer ${self.token}` },
          params: { business_id: self.user.business_id }
        })
        .then(({ data }) => {
          self.loader = false;
          self.modal_title = data.client.first_name + " " + data.client.last_name;
          self.info.first_name = data.client.first_name;
          self.info.last_name = data.client.last_name;
          self.info.contact_number = data.client.contact_number;
          self.info.email = data.client.email || "";
          self.info.status = data.status;
          self.info.id = info.event.id;
          self.app_data = data;
          const date = new Date(data.appointment_date);
          self.info.date = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
          });
          self.info.time = data.appointment_time;
          self.services = data.services.join(", ");
        })
        .catch((error) => {
          if (
            error.response &&
            error.response.data &&
            error.response.data.error &&
            error.response.data.error.code === "token_could_not_verified"
          ) {
            this.$router.push("/login");
          } else {
            console.error(error);
          }
        });
    },
    async editEvent(appointment) {
      let self = this;
      self.loader = true;
      this.modal_button = "Update";
      this.modalViewVisible = false;
      this.show_client = false;
      this.view_existing = true;
      this.rebook_reason_view = false;

      this.info.id = appointment.id;
      this.selectedClient = {
        id: appointment.client.id,
        first_name: appointment.client.first_name,
        last_name: appointment.client.last_name,
        contact_number: appointment.client.contact_number,
        email: appointment.client.email || ""
      };
      const date = new Date(appointment.appointment_date);
      self.info.date = date.toISOString().split("T")[0];
      await self.getTimeList();
      if (!self.time_list.includes(appointment.appointment_time)) {
        self.time_list.push(appointment.appointment_time);
      }
      self.info.time = appointment.appointment_time;
      self.info.status = appointment.status;
      self.loader = false;
      self.if_edit = true;
      self.modal_title = "Update Appointment";
      self.btn_type = "edit";
      self.openModalAppointment();
      this.items = [this.selectedClient];
     
      self.selectedService = appointment.appointment_services.map((appointmentService) => {
        return { id: appointmentService.id, name: appointmentService.service.name };
      });
      
    },
    approveAppointment(appointment){

          if(appointment.status!="Pending"){
            this.notifyVue("top", "center", "danger", "For Pending Status Only", "ti-hand-stop");
            return
          }

          this.loader = true;
            // Post to the endpoint using businessId and include appointment id in the payload, with authorization token in the header
            axios.post(`${api.API_URL}/confirm-appointment/${this.user.business_id}`, {
                appointment: appointment.id,
                confirm: 1
            }, {
                headers: { Authorization: `Bearer ${this.token}` }
            })
            .then(response => {
                this.loader = false;
                this.updateSuccess = true;
                this.notifyVue("top", "center", "success", "Appointment Successfully Updated", "ti-announcement");
                this.list().then(() => {
                    this.clickCallback(this.current_page);
                });
            })
            .catch(error => {
                this.loader = false;
                if (error.response && error.response.data) {
                this.errors = error.response.data;
                }
            });

    },
    getStatusColor(status) {
      const statusColors = {
        Scheduled: "#3498db",
        Pending: "#f1c40f",
        Confirmed: "#2ecc71",
        Rescheduled: "#9b59b6",
        Cancelled: "#e74c3c",
        Completed: "#2c3e50",
        "No Show": "#e67e22",
        "In Progress": "#1abc9c",
        "On Hold": "#34495e",
        Declined: "#c0392b"
      };
      return statusColors[status] || "#bdc3c7"; // Default gray if status is unknown
    },
    search() {
      this.list();
    },
    changeTime(){
        let self = this;
        this.loader_save = true;

        let date = this.info.date;
        let time = this.info.time;
        let time_type = this.time_type;

        return axios
          .get(api.API_URL + `/check-slot?business_id=${this.user.business_id}&date=${date}&time=${time}&time_type=${time_type}`, {
            headers: { Authorization: `Bearer ${this.token}` }
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
                //self.dateChanged = false;

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
    inputTime(eventData){
      if(eventData.displayTime.length==8){
        this.changeTime();
      }
    },cancel(){
        this.closeModalAppointment();
        this.info.first_name = "";
        this.info.last_name = "";
        this.info.contact_number = "";
        this.info.email = "";
        this.info.status = "";
        this.info.date = "";
        this.info.time = "";
        this.services = [];
      }
  },
  created() {
    this.select_view = 'list';
    this.view_list = true;
    this.list();
    this.client_name = localStorage.getItem("client_name");
    this.info.client_id = this.$route.params.id;
    this.fetchServiceOptions();
    this.fetchClients('');

    // const timeTypeSetting = this.businessProfile.setting.find(item => item.key === 'time_type');
    //       const timeTypeValue = timeTypeSetting ? timeTypeSetting.value : null;
    //       this.time_type = timeTypeValue;
  },
  watch: {
    selectedClient(newClient) {
      if (newClient) {
        this.info.first_name = newClient.first_name;
        this.info.last_name = newClient.last_name;
        this.info.contact_number = newClient.contact_number;
        this.info.email = newClient.email || "";
      }
    }
  }
};
</script>

<style>
#appointment-tbl .btn {
  padding: 5px 10px !important;
  margin-right: 5px;
}
.action {
  text-align: center;
}
#top-tool-bar {
  padding: 10px;
}
#add-appointment {
  float: right;
}
#search {
  width: 50%;
  padding:5px;
}
.pagination li {
  margin-right: 20px;
}
.pagination {
  padding: 10px !important;
}
.pagination .page-item.active a {
  font-weight: bold;
  background-color: #b6aa62 !important;
}
.pagination li a {
  background: #106c9c;
  padding: 5px;
  color: #fff !important;
}
#no-record {
  font-weight: bold;
  font-size: 20px;
}
.client-name {
  margin-left: 10px;
}
.modal {
  overflow-y: scroll !important;
}
.trash-service {
  margin-left: 10px;
}
#grand-total {
  float: right;
}
.add-services {
  margin-top: 30px;
}
.cash-label {
  font-weight: bold;
  font-size: 22px;
  margin-right: 10px;
}
#client-notes {
  width: 100%;
}
.select-client {
  display: block;
  margin-bottom: 20px;
}
.back-home {
  margin-bottom: 20px;
  background: #106c9c;
  color: #fff;
  border: none;
}
.v-autocomplete-list {
  z-index: 9999;
  background-color: #fff;
  position: absolute;
  border: 1px solid #000;
}
.autocomplete {
  margin-bottom: 30px;
}
.v-autocomplete-list-item {
  padding-bottom: 5px;
  border: 1px solid #000;
  padding: 10px;
}
.time-list {
  display: block;
}
.gluata-services {
  margin-top: 20px;
  margin-bottom: 20px;
}
.gluata-services label {
  display: block;
  font-weight: bold;
  font-size: 16px;
}
#fullcalendar {
  padding: 10px;
}
#select-view {
  padding: 6px;
  margin-right: 20px;
}
#time-of {
  font-weight: bold;
  margin-top: 25px;
}
#time-of span {
  color: red;
}
#top-tool-bar .mx-datepicker-range {
  width: 220px;
  margin-right: 15px;
}
a.fc-event {
  cursor: pointer;
}
.appoint-info {
  font-size: 20px;
  font-weight: bold;
}
.edt-appointment {
  margin-right: 5px;
}
#page-appointment .modal {
  height: 640px !important;
}
#page-appointment .border {
  border: none !important;
}
.search{width: 47% !important;
  display: inline-block !important;
  margin-right: 7px;}
.action .btn-info{margin: 0 2px; padding: 4px 9px;}

.status{display: inline-block;}
.search-client{margin-bottom: 20px;}
.hide-desktop{display: none;}
</style>
