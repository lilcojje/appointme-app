<template>
  <div id="page-report">
    <div class="row">
      <div class="col-12">
        <router-link to="/dashboard" round tag="button" class="back-home">Back to Home</router-link>
        <card>
          <div slot="raw-content">
            <div class="row" id="top-tool-bar">
              <div class="col-12 report-content">
                <h4>Select Report</h4>
                <select v-model="reportType" @change="resetFilters" id="report_type">
                  <option disabled value="">Select Report Type</option>
                  <option value="Appointment Summary Report">Appointment Summary Report</option>
                  <option value="Daily Appointment Schedule">Daily Appointment Schedule</option>
                  <option value="Client Report">Client Report</option>
                  <option value="Service Report">Service Report</option>
                  <option value="Cancellation & No-Show Report">Cancellation & No-Show Report</option>
                  <option value="Sales Report">Sales Report</option>
                </select>
              </div>
            </div>

            <!-- Filters for Appointment Summary Report -->
            <div v-if="reportType === 'Appointment Summary Report'" class="filter-group">
              <date-picker v-model="startDate" placeholder="Start Date" :clearable="true" />
              <date-picker v-model="endDate" placeholder="End Date" :clearable="true" />
              <button round @click="generateReport">Generate Report</button>
            </div>

            <!-- Filter for Daily Appointment Schedule -->
            <div v-else-if="reportType === 'Daily Appointment Schedule'" class="filter-group">
              <date-picker v-model="specificDate" placeholder="Select Date" :clearable="true" />
              <button round @click="generateReport">Generate Report</button>
            </div>

            <!-- Filter for Sales Report -->
            <div v-else-if="reportType === 'Sales Report'" class="filter-group">
              <select v-model="salesRange" id="sales_range">
                <option disabled value="">Select Sales Range</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <button round @click="generateReport">Generate Report</button>
            </div>

            <!-- For other reports, just a Generate button -->
            <div v-else-if="reportType" class="filter-group">
              <button round @click="generateReport">Generate Report</button>
            </div>

            <!-- Loader -->
            <loader v-if="loader" />

            <!-- Render Report Data -->
            <div v-if="!loader && reportData" class="report-data">
              <!-- Appointment Summary Report -->
              <div v-if="reportType === 'Appointment Summary Report'">
                <h5>Date Range: {{ reportData.date_range.start }} to {{ reportData.date_range.end }}</h5>
                <h5>Summary</h5>
                <table class="table table-striped tbl-style">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in reportData.summary" :key="index">
                      <td>{{ item.status }}</td>
                      <td>{{ item.count }}</td>
                    </tr>
                  </tbody>
                </table>
                <h5>Daily Breakdown</h5>
                <table class="table table-striped tbl-style">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in reportData.daily_breakdown" :key="index">
                      <td>{{ item.date }}</td>
                      <td>{{ item.status }}</td>
                      <td>{{ item.count }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Daily Appointment Schedule -->
              <div v-if="reportType === 'Daily Appointment Schedule'">
                <h5>Date: {{ reportData.date }}</h5>
                <table class="table table-striped tbl-style">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Client</th>
                      <th>Service</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(appointment, index) in reportData.appointments" :key="index">
                      <td>{{ appointment.appointment_time }}</td>
                      <td>{{ appointment.client_name }}</td>
                      <td>{{ appointment.service_type.join(', ') }}</td>
                      <td>{{ appointment.status }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Client Report -->
              <div v-if="reportType === 'Client Report'">
                <table class="table table-striped tbl-style">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Contact Number</th>
                      <th>Appointments</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(client, index) in reportData.clients" :key="index">
                      <td>{{ client.first_name }} {{ client.last_name }}</td>
                      <td>{{ client.contact_number }}</td>
                      <td>{{ client.appointment_count }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Service Report -->
              <div v-if="reportType === 'Service Report'">
                <table class="table table-striped tbl-style">
                  <thead>
                    <tr>
                      <th>Service Name</th>
                      <th>Bookings</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(service, index) in reportData.services" :key="index">
                      <td>{{ service.name }}</td>
                      <td>{{ service.appointments_count }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Cancellation & No-Show Report -->
              <div v-if="reportType === 'Cancellation & No-Show Report'">
                <table class="table table-striped tbl-style">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Cancellations</td>
                      <td>{{ reportData.cancelled_count }}</td>
                    </tr>
                    <tr>
                      <td>No-Shows</td>
                      <td>{{ reportData.no_show_count }}</td>
                    </tr>
                  </tbody>
                </table>
                <h5>Cancellation Reasons</h5>
                <table class="table table-striped tbl-style">
                  <thead>
                    <tr>
                      <th>Reason</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(reason, index) in reportData.cancellation_reasons" :key="index">
                      <td>{{ reason.rebook_reason }}</td>
                      <td>{{ reason.count }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Sales Report -->
              <div v-if="reportType === 'Sales Report'">
                <h5>Sales Report - {{ reportData.range | capitalize }} Sales</h5>
                <table class="table table-striped tbl-style">
                  <thead>
                    <tr>
                      <th v-if="salesRange === 'daily'">Date</th>
                      <th v-if="salesRange === 'weekly'">Year</th>
                      <th v-if="salesRange === 'weekly'">Week</th>
                      <th v-if="salesRange === 'monthly'">Year</th>
                      <th v-if="salesRange === 'monthly'">Month</th>
                      <th v-if="salesRange === 'yearly'">Year</th>
                      <th>Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in reportData.sales" :key="index">
                      <td v-if="salesRange === 'daily'">{{ item.date }}</td>
                      <td v-if="salesRange === 'weekly'">{{ item.year }}</td>
                      <td v-if="salesRange === 'weekly'">{{ item.week }}</td>
                      <td v-if="salesRange === 'monthly'">{{ item.year }}</td>
                      <td v-if="salesRange === 'monthly'">{{ item.month }}</td>
                      <td v-if="salesRange === 'yearly'">{{ item.year }}</td>
                      <td>{{ formatCurrency(item.total_sales) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/static/config.json";
import axios from "axios";
import Loader from "@/components/Loader";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import Swal from "sweetalert2";

export default {
  props: ["item"],
  components: {
    Loader,
    DatePicker,
    Swal
  },
  data() {
    return {
      loader: false,
      reportType: "",
      business_id: "", // Set this value from localStorage or via props as needed
      startDate: null, // For Appointment Summary Report (date range)
      endDate: null,
      specificDate: null, // For Daily Appointment Schedule
      salesRange: "",    // For Sales Report (daily, weekly, monthly, yearly)
      reportData: null,  // Data returned from the API
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
  },
  methods: {
    resetFilters() {
      // Reset any previously set filter values when changing report type
      this.startDate = null;
      this.endDate = null;
      this.specificDate = null;
      this.salesRange = "";
      this.reportData = null;
    },
    async generateReport() {
      if (this.user.subscription && this.user.subscription.plan === "free") {
          Swal.fire({
              icon: 'warning',
              title: 'Upgrade Required',
              text: 'This feature is available in the Pro version. Upgrade now to unlock full access!',
              showCancelButton: true,
              confirmButtonText: 'Upgrade Now',
              cancelButtonText: 'Maybe Later'
          }).then((result) => {
              if (result.isConfirmed) {
                  this.$router.push('/subscription');
              }
          });
          return;
      }

      if (!this.reportType) return;
      this.loader = true;

      // Build query parameters
      const params = {
        business_id: this.business_id,
        report_type: this.reportType,
      };

      if (this.reportType === "Appointment Summary Report") {
        if (this.startDate) params.start_date = this.startDate;
        if (this.endDate) params.end_date = this.endDate;
      }
      if (this.reportType === "Daily Appointment Schedule") {
        if (this.specificDate) params.date = this.specificDate;
      }
      if (this.reportType === "Sales Report") {
        if (!this.salesRange) {
          Swal.fire("Please select a sales range");
          this.loader = false;
          return;
        }
        params.range = this.salesRange;
      }

      try {
        const response = await axios.get(`${api.API_URL}/report`, {
          params: params,
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.reportData = response.data;
      } catch (error) {
        console.error("Error generating report:", error);
        // Optionally notify the user about the error here
      } finally {
        this.loader = false;
      }
    },
    formatCurrency(value) {
      if (!value) return "₱0.00"; // Default value if it's null/undefined
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: this.settings.currency_code, // Change to your desired currency (e.g., USD, EUR)
        minimumFractionDigits: 2, // Ensures two decimal places
      }).format(value);
    },
  },
  created() {
    // Initialize business_id from localStorage (or from props)
    this.business_id = this.user.business_id || "";
  },
  filters: {
    capitalize(value) {
      if (!value) return "";
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  }
};
</script>

<style scoped>
.back-home {
  margin-bottom: 20px;
  background: #106c9c;
  color: #fff;
  border: none;
  padding: 10px 20px;
  text-decoration: none;
}
#top-tool-bar {
  padding: 10px 0;
}
select#report_type,
select#sales_range {
  padding: 10px;
  margin-right: 10px;
  width: auto;
}
.filter-group {
  margin: 15px 0;
  padding: 0 26px;
}
button {
  padding: 10px 20px;
  background: #106c9c;
  color: #fff;
  border: none;
  cursor: pointer;
  margin-left: 10px;
}
table {
  margin-top: 20px;
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

table thead {
  background: linear-gradient(45deg, #106c9c, #1e9ac2);
  color: #fff;
}

table thead th {
  padding: 15px;
  text-align: left;
}

table tbody tr {
  border-bottom: 1px solid #eee;
}

table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

table tbody tr:hover {
  background-color: #f1f1f1;
}

table td {
  padding: 15px;
}

.report-content {
  padding: 0 40px 30px;
}
.report-data {
  padding: 28px;
}

/* Mobile Responsive Styles */
@media screen and (max-width: 768px) {
  #page-report .mx-datepicker{width: 100%!important;}
  .report-content {
    padding: 0 20px 20px;
  }
  .report-data {
    padding: 15px;
  }
  select#report_type,
  select#sales_range {
    width: 100%;
    margin: 0 0 10px 0;
  }
  .filter-group {
    padding: 0 15px;
  }
  button {
    margin: 10px 0 0 0;
    width: 100%;
  }
  .back-home {
    width: 100%;
    text-align: center;
    padding: 12px;
  }
  table thead th,
  table td {
    padding: 10px;
    font-size: 14px;
  }
}
</style>
