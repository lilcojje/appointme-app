<template>
  <div id="page-dashboard">
    <loader v-if="loader"/> 
    
    <card title="Today's Appointment">
        <div slot="raw-content" class="table-responsive">
          <table class="table table-striped" id="appoint-tbl">
            <thead> 
              <th>Time</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Status</th>
            </thead>
            <tbody v-if="paginatedTodaysAppointments.length > 0">
              <tr v-for="(appointment, index) in paginatedTodaysAppointments" :key="index">
                <td>{{ formatTime(appointment.appointment_time) }}</td>
                <td>{{ appointment.client ? appointment.client.first_name : 'N/A' }}</td>
                <td>{{ appointment.client ? appointment.client.last_name : 'N/A' }}</td>
                <td><span :style="{ backgroundColor: getStatusColor(appointment.status), color: '#fff', padding: '5px 10px', borderRadius: '5px' }">
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
              <th>Date</th>
              <th>Time</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Status</th>
            </thead>
            <tbody v-if="paginatedUpcomingAppointments.length > 0">
              <tr v-for="(appointment, index) in paginatedUpcomingAppointments" :key="index">
                <td>{{ formatDate(appointment.appointment_date) }}</td>
                <td>{{ formatTime(appointment.appointment_time) }}</td>
                <td>{{ appointment.client ? appointment.client.first_name : 'N/A' }}</td>
                <td>{{ appointment.client ? appointment.client.last_name : 'N/A' }}</td>
                <td><span :style="{ backgroundColor: getStatusColor(appointment.status), color: '#fff', padding: '5px 10px', borderRadius: '5px' }">
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


    
    <div class="row">
      <div class="col-md-6 col-xl-3">
        <div class="card">
          <div class="card-body">
            <div class="row">
              <div class="col-7">
                <div class="numbers">
                  <p>Clients</p>
                  {{ totalClients.toLocaleString() }}
                </div>
              </div>
            </div>
            <hr>
            <div class="stats">
              <i class="ti-reload"></i> Updated now
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-xl-3">
        <div class="card">
          <div class="card-body">
            <div class="row">
              <div class="col-7">
                <div class="numbers">
                  <p>Users</p>
                  {{ totalUsers.toLocaleString() }}
                </div>
              </div>
            </div>
            <hr>
            <div class="stats">
              <i class="ti-reload"></i> Updated now
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
      todaysAppointments: [],
      upcomingAppointments: [],
      todayPage: 1,
      upcomingPage: 1,
      itemsPerPage: 5, // Number of items per page
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
    }
  },
  mounted() {
    // console.log(this.$store.state.user);

    this.fetchDashboardData();
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
  width: 128px;
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
  width: 128px;
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
</style>
