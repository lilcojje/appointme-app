<template>
  <div id="page-dashboard">
    <loader v-if="loader"/>
    <card title="Today's Appointment">
        <div slot="raw-content" class="table-responsive">
          <table class="table table-striped" id="appoint-tbl">
            <thead> 
              <th>Time</th>
              <th>First Name</th>
              <th>Services</th>
              <th>Status</th>
            </thead>
            <tbody v-if="paginatedTodaysAppointments.length > 0">
              <tr v-for="(appointment, index) in paginatedTodaysAppointments" :key="index">
                <td>{{ formatTime(appointment.appointment_time) }}</td>
                <td>{{ appointment.client ? appointment.client.first_name : 'N/A' }}</td>
                <td>{{ appointment.formated_service }}</td>
                <td><span class="status" :style="{ backgroundColor: getStatusColor(appointment.status), color: '#fff', padding: '5px 10px', borderRadius: '5px' }">
                      {{ appointment.status }}
                    </span></td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td align="center" colspan="4">No Appointment.</td>
              </tr>
            </tbody>
          </table>
           <!-- Pagination Controls BELOW the Table -->
          <div class="pagination-controls">
            <button @click="prevPage('today')" :disabled="todayPage === 1" class="pagination-btn">
              ◀
            </button>
            <span>Page {{ todayPage }} of {{ totalTodayPages }}</span>
            <button @click="nextPage('today')" :disabled="todayPage >= totalTodayPages" class="pagination-btn">
              ▶
            </button>
          </div>
        </div>
      </card>

      <card title="Upcoming Appointments">
        <div slot="raw-content" class="table-responsive">
          <table class="table table-striped" id="appoint-tbl">
            <thead> 
              <th>Date<span class="hide-desktop"> Time</span></th>
              <th class="hide-to-mobile">Time</th>
              <th>First Name</th>
              <th>Services</th>
              <th>Status</th>
            </thead>
            <tbody v-if="paginatedUpcomingAppointments.length > 0">
              <tr v-for="(appointment, index) in paginatedUpcomingAppointments" :key="index">
                <td>{{ formatDate(appointment.appointment_date) }}<span class="hide-desktop">{{ appointment.formated_service }}</span></td>
                <td class="hide-to-mobile">{{ formatTime(appointment.appointment_time) }}</td>
                <td>{{ appointment.client ? appointment.client.first_name : 'N/A' }}</td>
                <td>{{ appointment.formated_service }}</td>
                <td><span class="status" :style="{ backgroundColor: getStatusColor(appointment.status), color: '#fff', padding: '5px 10px', borderRadius: '5px' }">
                      {{ appointment.status }}
                    </span>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td align="center" colspan="4">No Appointment.</td>
              </tr>
            </tbody>
          </table>
           <!-- Pagination Controls BELOW the Table -->
          <div class="pagination-controls">
            <button @click="prevPage('upcoming')" :disabled="upcomingPage === 1" class="pagination-btn">
              ◀
            </button>
            <span>Page {{ upcomingPage }} of {{ totalUpcomingPages }}</span>
            <button @click="nextPage('upcoming')" :disabled="upcomingPage >= totalUpcomingPages" class="pagination-btn">
              ▶
            </button>
          </div>
        </div>
       
      </card>

    <h4>Today's Insights</h4>
    <div class="row">
      <div class="col-md-6 col-xl-3">
        <div class="card" @click="redirectTo('transactions')">
            <div class="card-body">
              <div>
                <div class="row">
                  <div class="col-5">
                    <div class="icon-big text-center icon-warning">
                      <i class="ti-money"></i>
                    </div>
                  </div>
                  <div class="col-7">
                    <div class="numbers">
                      <p>Sales</p> <span class="mid-desc">{{currency_label}}{{formattedTotalSales}}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <hr>
                  <div class="stats">
                    <i class="ti-reload"></i> Updated now
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
      <div class="col-md-6 col-xl-3">
        <div class="card" @click="redirectTo('appointments')">
            <div class="card-body">
              <div>
                <div class="row">
                  <div class="col-5">
                    <div class="icon-big text-center icon-danger">
                      <i class="ti-calendar"></i>
                    </div>
                  </div>
                  <div class="col-7">
                    <div class="numbers">
                      <p>Pending</p> {{totalPending}}
                    </div>
                  </div>
                </div>
                <div>
                  <hr>
                  <div class="stats">
                    <i class="ti-reload"></i> Updated now
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
      <div class="col-md-6 col-xl-3">
         <div class="card" @click="redirectTo('appointments')">
            <div class="card-body">
              <div>
                <div class="row">
                  <div class="col-5">
                    <div class="icon-big text-center icon-success">
                      <i class="ti-thumb-up"></i>
                    </div>
                  </div>
                  <div class="col-7">
                    <div class="numbers">
                      <p>Completed</p> {{totalCompleted}}
                    </div>
                  </div>
                </div>
                <div>
                  <hr>
                  <div class="stats">
                    <i class="ti-reload"></i> Updated now
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
      <div class="col-md-6 col-xl-3">
        <div class="card" @click="redirectTo('appointments')">
            <div class="card-body">
              <div>
                <div class="row">
                  <div class="col-5">
                    <div class="icon-big text-center icon-danger">
                      <i class="ti-na"></i>
                    </div>
                  </div>
                  <div class="col-7">
                    <div class="numbers">
                      <p>Cancelled</p> {{totalCancelled}}
                    </div>
                  </div>
                </div>
                <div>
                  <hr>
                  <div class="stats">
                    <i class="ti-reload"></i> Updated now
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>

    <h4>Insights</h4>

    <div class="row">
      <div class="col-md-6 col-xl-3">
        <div class="card" @click="redirectTo('subscription')">
            <div class="card-body">
              <div>
                <div class="row">
                  <div class="col-5">
                    <div class="icon-big text-center icon-danger">
                      <i class="ti-crown"></i>
                    </div>
                  </div>
                  <div class="col-7">
                    <div class="numbers">
                      <p>Subscription</p> <span class="sml-desc">{{ user.subscription.plan }}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <hr>
                  <div class="stats">
                    <i class="ti-reload"></i> Updated Plan
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
      <div class="col-md-6 col-xl-3">
        <div class="card" @click="redirectTo('clients')">
            <div class="card-body">
              <div>
                <div class="row">
                  <div class="col-5">
                    <div class="icon-big text-center icon-info">
                      <i class="ti-user"></i>
                    </div>
                  </div>
                  <div class="col-7">
                    <div class="numbers">
                      <p>Clients</p> {{ totalClients.toLocaleString() }}
                    </div>
                  </div>
                </div>
                <div>
                  <hr>
                  <div class="stats">
                    <i class="ti-reload"></i> New Clients
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
      <div class="col-md-6 col-xl-3">
        <div class="card" @click="redirectTo('users')">
            <div class="card-body">
              <div>
                <div class="row">
                  <div class="col-5">
                    <div class="icon-big text-center icon-warning">
                      <i class="ti-server"></i>
                    </div>
                  </div>
                  <div class="col-7">
                    <div class="numbers">
                      <p>Users</p> {{ totalUsers.toLocaleString() }}
                    </div>
                  </div>
                </div>
                <div>
                  <hr>
                  <div class="stats">
                    <i class="ti-reload"></i> Active Users
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
      <div class="col-md-6 col-xl-3">
        <div class="card" @click="redirectTo('services')">
            <div class="card-body">
              <div>
                <div class="row">
                  <div class="col-5">
                    <div class="icon-big text-center icon-danger">
                      <i class="ti-ruler-alt"></i>
                    </div>
                  </div>
                  <div class="col-7">
                    <div class="numbers">
                      <p>Services</p> {{ totalServices.toLocaleString() }}
                    </div>
                  </div>
                </div>
                <div>
                  <hr>
                  <div class="stats">
                    <i class="ti-reload"></i> New Services
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios';
import api from "@/static/config.json";
import Loader from "@/components/Loader";

export default {
  components: {
    Loader
  },
  data() {
    return {
      loader: false,
      totalClients: 0,
      totalUsers: 0,
      totalServices: 0,
      totalSales: 0,
      totalPending: 0,
      totalCompleted: 0,
      totalCancelled: 0,
      todaysAppointments: [],
      upcomingAppointments: [],
      todayPage: 1,
      upcomingPage: 1,
      itemsPerPage: 5, 
      currency_label: ''
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    token() {
      return this.$store.state.token;
    },
    totalTodayPages() {
      return Math.ceil(this.todaysAppointments.length / this.itemsPerPage);
    },
    totalUpcomingPages() {
      return Math.ceil(this.upcomingAppointments.length / this.itemsPerPage);
    },
    paginatedTodaysAppointments() {
      const start = (this.todayPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.todaysAppointments.slice(start, end);
    },
    paginatedUpcomingAppointments() {
      const start = (this.upcomingPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.upcomingAppointments.slice(start, end);
    },
    settings() {
      // Ensure it's an array
      return this.$store.state.settings;
    },
    formattedTotalSales() {
      let total = Number(this.totalSales) || 0; // Convert to number and handle null/undefined
      return total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  },
  methods: {
    async fetchDashboardData() {
      this.loader = true;
      try {

        const response = await axios.get(`${api.API_URL}/report/dashboard`, {
          headers: { Authorization: `Bearer ${this.token}` },
          params: { business_id: this.user.business_id }
        });

        this.totalClients = response.data.total_clients;
        this.totalUsers = response.data.total_users;
        this.totalServices = response.data.total_services;
        this.totalSales = response.data.total_sales;
        this.totalPending = response.data.total_pending;
        this.totalCompleted = response.data.total_completed;
        this.totalCancelled = response.data.total_cancelled;

        response.data.todays_appointments.data.forEach((appointment) => {
          appointment.formated_service =
            Array.isArray(appointment.services) && appointment.services.length
              ? appointment.services.join(", ")
              : "No Service";
        });

        response.data.upcoming_appointments.data.forEach((appointment) => {
          appointment.formated_service =
            Array.isArray(appointment.services) && appointment.services.length
              ? appointment.services.join(", ")
              : "No Service";
        });


       
        this.todaysAppointments = response.data.todays_appointments.data || [];


        this.upcomingAppointments = response.data.upcoming_appointments.data || [];

        // Reset pagination when new data loads
        this.todayPage = 1;
        this.upcomingPage = 1;
      } catch (error) {
        if (error.response && error.response.data.error.code === 'token_could_not_verified') {
          localStorage.removeItem("token");
          this.$router.push('/login');
        }
      } finally {
        this.loader = false;
      }
    },
    nextPage(type) {
      if (type === 'today' && this.todayPage < this.totalTodayPages) {
        this.todayPage++;
      } else if (type === 'upcoming' && this.upcomingPage < this.totalUpcomingPages) {
        this.upcomingPage++;
      }
    },
    prevPage(type) {
      if (type === 'today' && this.todayPage > 1) {
        this.todayPage--;
      } else if (type === 'upcoming' && this.upcomingPage > 1) {
        this.upcomingPage--;
      }
    },
    formatDate(dateString) {
      if (!dateString) return "N/A"; // Handle empty values safely
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric"
      });
    },
    formatTime(timeString) {
      if (!timeString) return "N/A"; // Handle empty values safely
      const [hours, minutes] = timeString.split(":");
      let hour = parseInt(hours, 10);
      let period = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12; // Convert to 12-hour format
      return `${hour}:${minutes} ${period}`;
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
    redirectTo(redirect) {
        this.$router.push("/"+redirect);
      },
    updateFcm() {
      const fcm = localStorage.getItem('fcm'); // Get FCM from localStorage

      axios.post(api.API_URL + '/fcm-update', 
          {
              user_id: this.user.id,  // Add user_id in the post parameter
              fcm: fcm // Add FCM token
          }, 
          {
              headers: { Authorization: `Bearer ${this.token}` }
          }
      )
      .then((data) => {
          // Handle success response
      })
      .catch((response) => {
          if (response.data.error.code === 'token_could_not_verified') {
              this.$router.push({ name: 'login' });
          }
      });
  }
  },
  mounted() {
    // console.log(this.$store.state.user);

    this.fetchDashboardData();
    const plainSettings = JSON.parse(JSON.stringify(this.settings));
    this.currency_label = plainSettings.currency_symbol;
  },
  created(){
     this.updateFcm();
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
#search{width: 60%;}
.action .btn-info{margin: 0 2px; padding: 4px 9px;}
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 10px; /* Adds spacing below the pagination */
}

.pagination-btn {
  background-color: #106c9c;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border: none;
  padding: 8px 12px;
  margin: 0 5px;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.3s ease-in-out;
}

.pagination-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #0b4a70;
}
.sml-desc{font-size: 14px; text-transform: uppercase; font-weight: bold;}
.mid-desc{font-size: 18px; text-transform: uppercase; font-weight: bold; color:green;}

.status{display: inline-block;}

@media screen and (max-width: 600px) {
  .num-info{flex: 0 0 100%!important; max-width: 100%!important;}
  .num-info .numbers{text-align: center!important;}
}

</style>
