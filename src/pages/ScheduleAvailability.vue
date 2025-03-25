<template>
  <div id="page-schedule">
    <!-- Tab Menu -->
    <div class="tab-menu">
      <button :class="{'active': activeTab === 'businessHours'}" @click="activeTab = 'businessHours'">
        Business Hours
      </button>
      <button :class="{'active': activeTab === 'blockedDates'}" @click="activeTab = 'blockedDates'">
        Block Holidays & Custom Dates
      </button>
    </div>

    <!-- Business Hours Tab Content -->
    <div v-if="activeTab === 'businessHours'">
      <div class="row">
        <div class="col-12">
          <card>
            <div slot="raw-content" class="table-responsive">
              <div class="row" id="top-tool-bar">
                <div class="col-6">&nbsp;</div>
                <div class="col-6">
                  <p-button type="info" round @click.native.prevent="modalAddSchedule" id="add-schedule">
                    Add Schedule
                  </p-button>
                </div>
              </div>
              <loader v-if="loader" />
              <table class="table table-striped tbl-style" id="schedule-tbl">
                <thead>
                  <th>Day</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Break Start</th>
                  <th>Break End</th>
                  <th style="width: 5%; text-align: center;">Available</th>
                  <th style="text-align: center;">Action</th>
                </thead>
                <tbody v-if="schedules.total > 0">
                  <tr v-for="(schedule, index) in schedules.data" :key="index">
                    <td>{{ dayNames[schedule.day_of_week] }}</td>
                    <td>{{ formatTime(schedule.start_time) }}</td>
                    <td>{{ formatTime(schedule.end_time) }}</td>
                    <td>{{ schedule.break_start_time ? formatTime(schedule.break_start_time) : '-' }}</td>
                    <td>{{ schedule.break_end_time ? formatTime(schedule.break_end_time) : '-' }}</td>
                    <td style="width: 5%; text-align: center;">{{ schedule.is_available ? 'Yes' : 'No' }}</td>
                    <td class="action">
                      <p-button type="info" round @click.native.prevent="modalEditSchedule(schedule)" v-show="user.permissions.includes('edit_availability')">
                        <span class="ti-pencil"></span>
                      </p-button>
                      <p-button type="info" round @click.native.prevent="deleteSchedule(schedule.id)" v-show="user.permissions.includes('delete_availability')">
                        <span class="ti-trash"></span>
                      </p-button>
                    </td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr>
                    <td align="center" colspan="8" id="no-record">No record found.</td>
                  </tr>
                </tbody>
              </table>
              <paginate
                :page-count="total_page"
                :page-range="1"
                :margin-pages="2"
                :click-handler="clickCallback"
                :prev-text="'Prev'"
                :next-text="'Next'"
                :container-class="'pagination'"
                :page-class="'page-item'"
                v-if="schedules.total > 0"
              />
            </div>
          </card>
        </div>
      </div>

      <Modal :showModal="modalVisible" :title="modal_title" @close="closeModalSchedule">
        <loader v-if="loader_save" />
        <div class="form-group">
          <label>Day of Week</label>
          <select class="form-control" v-model="info.day_of_week">
            <option v-for="(day, index) in dayNames" :value="index.toString()" :key="index">
              {{ day }}
            </option>
          </select>
        </div>
        <fg-input type="time" label="Start Time" v-model="info.start_time" />
        <fg-input type="time" label="End Time" v-model="info.end_time" />
        <fg-input type="time" label="Break Start Time" v-model="info.break_start_time" />
        <fg-input type="time" label="Break End Time" v-model="info.break_end_time" />
        <fg-input type="number" label="Slot Duration (minutes)" v-model="info.slot_duration" />
        <div class="form-check" v-show="btn_type == 'edit'">
          <label class="form-check-label">
            <input type="checkbox" class="form-check-input" v-model="info.is_available" />
            Available
          </label>
        </div>

        <p-button type="info" id="add-schedule" round @click.native.prevent="addSchedule" v-show="btn_type == 'add'">
          Add
        </p-button>
        <p-button type="info" id="add-schedule" round @click.native.prevent="updateSchedule" v-show="btn_type == 'edit'">
          Update
        </p-button>
        <p-button type="info" round @click.native.prevent="cancelSched()" id="cancel">
            Cancel
        </p-button> 
      </Modal>
    </div>

    <!-- Block Holidays & Custom Dates Tab Content -->
    <div v-if="activeTab === 'blockedDates'">
      <div class="row">
        <div class="col-12">
          <card>
            <div slot="raw-content" class="table-responsive">
              <div class="row" id="top-tool-bar">
                <div class="col-6">&nbsp;</div>
                <div class="col-6">
                  <!-- Changed method call to openModalBlockedDate -->
                  <p-button type="info" round @click.native.prevent="openModalBlockedDate" id="add-blocked-date">
                    Add Blocked Date
                  </p-button>
                </div>
              </div>
              <loader v-if="loaderBlocked" />
              <table class="table table-striped tbl-style" id="blocked-date-tbl">
                <thead>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Holiday Name</th>
                  <th>Reason</th>
                  <th style="text-align: center;">Action</th>
                </thead>
                <tbody v-if="blockedDates.total > 0">
                  <tr v-for="(block, index) in blockedDates.data" :key="index">
                    <td>{{ block.date }}</td>
                    <td>{{ block.type }}</td>
                    <td>{{ block.holiday_name ? block.holiday_name : '-' }}</td>
                    <td>{{ block.reason ? block.reason : '-' }}</td>
                    <td class="action">
                      <p-button type="info" round @click.native.prevent="modalEditBlockedDate(block)">
                        <span class="ti-pencil"></span>
                      </p-button>
                      <p-button type="info" round @click.native.prevent="deleteBlockedDate(block.id)">
                        <span class="ti-trash"></span>
                      </p-button>
                    </td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr>
                    <td align="center" colspan="5" id="no-record">No record found.</td>
                  </tr>
                </tbody>
              </table>
              <paginate
                :page-count="totalPageBlocked"
                :page-range="1"
                :margin-pages="2"
                :click-handler="clickCallbackBlocked"
                :prev-text="'Prev'"
                :next-text="'Next'"
                :container-class="'pagination'"
                :page-class="'page-item'"
                v-if="blockedDates.total > 0"
              />
            </div>
          </card>
        </div>
      </div>

      <Modal :showModal="modalBlockedVisible" :title="modalBlockedTitle" @close="closeModalBlockedDate">
        <loader v-if="loaderBlockedSave" />
        <div class="form-group">
          <fg-input type="date" label="Date" v-model="blockedInfo.date" />
        </div>
        <div class="form-group">
          <label>Type</label>
          <select class="form-control" v-model="blockedInfo.type">
            <option value="holiday">Holiday</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div class="form-group" v-if="blockedInfo.type === 'holiday'">
          <fg-input type="text" label="Holiday Name" v-model="blockedInfo.holiday_name" />
        </div>
        <div class="form-group">
          <fg-input type="text" label="Reason" v-model="blockedInfo.reason" />
        </div>

        <p-button type="info" id="add-blocked-date" round @click.native.prevent="addBlockedDate" v-show="blockedBtnType == 'add'">
          Add
        </p-button>
        <p-button type="info" id="update-blocked-date" round @click.native.prevent="updateBlockedDate" v-show="blockedBtnType == 'edit'">
          Update
        </p-button>
        <p-button type="info" round @click.native.prevent="cancelBlock()" id="cancel">
            Cancel
        </p-button> 
      </Modal>
    </div>
  </div>
</template>

<script>
import api from "@/static/config.json";
import axios from "axios";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import Paginate from "vuejs-paginate";
import Swal from "sweetalert2";

export default {
  components: { Loader, Paginate, Modal },
  data() {
    return {
      activeTab: "businessHours",
      // Business Hours Data
      loader: false,
      loader_save: false,
      schedules: { data: [], total: 0 },
      total_page: 0,
      modalVisible: false,
      modal_title: "",
      btn_type: "",
      info: {
        day_of_week: "",
        start_time: "",
        end_time: "",
        break_start_time: null,
        break_end_time: null,
        slot_duration: 30,
        is_available: true,
        service_provider_id: null,
        business_id: ''
      },
      dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      search_value: "",
      
      // Blocked Dates Data
      loaderBlocked: false,
      loaderBlockedSave: false,
      blockedDates: { data: [], total: 0 },
      totalPageBlocked: 0,
      modalBlockedVisible: false,
      modalBlockedTitle: "",
      blockedBtnType: "",
      blockedInfo: {
        date: "",
        type: "holiday",
        holiday_name: "",
        reason: "",
        business_id: ''
      }
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
    // Business Hours Methods
    async list(page = 1) {
      this.loader = true;
      const limit = 10;
      const search_val = this.search_value;
      try {
        const { data } = await axios.get(
          `${api.API_URL}/schedule-availability?page=${page}&limit=${limit}&search=${search_val}&business_id=${this.user.business_id}`,
          { headers: { Authorization: `Bearer ${this.token}` } }
        );
        this.schedules = data;
        this.total_page = Math.ceil(data.total / limit);
      } catch (error) {
        // Handle error if needed
      } finally {
        this.loader = false;
      }
    },
    validateScheduleInfo() {
      if (!this.info.start_time) {
        this.notifyVue("top", "center", "danger", "Start Time is required", "ti-hand-stop");
        return false;
      }
      if (!this.info.end_time) {
        this.notifyVue("top", "center", "danger", "End Time is required", "ti-hand-stop");
        return false;
      }
      if (this.info.start_time >= this.info.end_time) {
        this.notifyVue("top", "center", "danger", "Start Time must be before End Time", "ti-hand-stop");
        return false;
      }
      if (!this.info.slot_duration || this.info.slot_duration <= 0) {
        this.notifyVue("top", "center", "danger", "Slot Duration must be a positive number", "ti-hand-stop");
        return false;
      }
      if ((this.info.break_start_time && !this.info.break_end_time) || (!this.info.break_start_time && this.info.break_end_time)) {
        this.notifyVue("top", "center", "danger", "Both Break Start and Break End times must be provided", "ti-hand-stop");
        return false;
      }
      if (this.info.break_start_time && this.info.break_end_time && this.info.break_start_time >= this.info.break_end_time) {
        this.notifyVue("top", "center", "danger", "Break Start Time must be before Break End Time", "ti-hand-stop");
        return false;
      }
      return true;
    },
    notifyVue(verticalAlign, horizontalAlign, type, msg, icon) {
      this.$notify({
        title: msg,
        icon: icon,
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: type
      });
    },
    addSchedule() {
      if (!this.validateScheduleInfo()) return;
      this.loader_save = true;
      axios
        .post(`${api.API_URL}/schedule-availability`, this.info, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        .then(() => {
          this.loader_save = false;
          this.notifyVue("top", "center", "success", "Schedule added successfully", "ti-announcement");
          this.list();
          this.closeModalSchedule();
          this.info.day_of_week = ''
          this.info.start_time = ''
          this.info.end_time = ''
          this.info.break_start_time = ''
          this.info.break_end_time = ''
          this.info.slot_duration = 30
        })
        .catch((error) => {
          this.loader_save = false;
          let errorMessage = "An unexpected error occurred.";
          if (error.response && error.response.data) {
            errorMessage = error.response.data.message || errorMessage;
          }
          this.notifyVue("top", "center", "danger", errorMessage, "ti-hand-stop");
        });
    },
    updateSchedule() {
      if (!this.validateScheduleInfo()) return;
      this.loader_save = true;
      this.info.business_id = this.user.business_id;
      axios
        .put(`${api.API_URL}/schedule-availability/${this.info.id}`, this.info, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        .then(() => {
          this.loader_save = false;
          this.notifyVue("top", "center", "success", "Schedule updated successfully", "ti-announcement");
          this.list();
          this.closeModalSchedule();
        })
        .catch((error) => {
          this.loader_save = false;
          let errorMessage = "An unexpected error occurred.";
          if (error.response && error.response.data) {
            errorMessage = error.response.data.message || errorMessage;
          }
          this.notifyVue("top", "center", "danger", errorMessage, "ti-hand-stop");
        });
    },
    clickCallback(pageNum) {
      this.list(pageNum);
    },
    openModalSchedule() {
      this.modalVisible = true;
    },
    closeModalSchedule() {
      this.modalVisible = false;
    },
    deleteSchedule(id) {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this schedule?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
          this.loader_save = true;
          axios
            .delete(`${api.API_URL}/schedule-availability/${id}`, {
              headers: { Authorization: `Bearer ${this.token}` }
            })
            .then(() => {
              this.loader_save = false;
              Swal.fire("Deleted!", "Schedule Successfully Deleted.", "success");
              this.list();
            })
            .catch(() => {
              this.loader_save = false;
              Swal.fire("Error", "Failed to delete schedule", "error");
              this.notifyVue("top", "center", "error", "Failed to delete schedule", "ti-announcement");
            });
        }
      });
    },
    modalAddSchedule() {
      this.modal_title = "Add Schedule";
      this.btn_type = "add";
      this.info = {
        day_of_week: "",
        start_time: "",
        end_time: "",
        break_start_time: null,
        break_end_time: null,
        slot_duration: 30,
        is_available: true,
        service_provider_id: null,
        business_id: this.user.business_id
      };
      this.openModalSchedule();
    },
    modalEditSchedule(schedule) {
      this.modal_title = "Update Schedule";
      this.btn_type = "edit";
      this.info = { ...schedule };
      this.openModalSchedule();
    },
    formatTime(time) {
      if (!time) return "-";
      let [hour, minute] = time.split(":");
      hour = parseInt(hour);
      let suffix = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12;
      return `${hour}:${minute} ${suffix}`;
    },

    // Blocked Dates Methods
    async listBlockedDates(page = 1) {
      this.loaderBlocked = true;
      const limit = 10;
      try {
        const { data } = await axios.get(
          `${api.API_URL}/blocked-dates?page=${page}&limit=${limit}&business_id=${this.user.business_id}`,
          { headers: { Authorization: `Bearer ${this.token}` } }
        );
        this.blockedDates = data;
        this.totalPageBlocked = Math.ceil(data.total / limit);
      } catch (error) {
        // Handle error if needed
      } finally {
        this.loaderBlocked = false;
      }
    },
    addBlockedDate() {
      if (this.blockedInfo.type === "holiday" && !this.blockedInfo.holiday_name) {
        this.notifyVue("top", "center", "danger", "Holiday name is required for holiday type", "ti-hand-stop");
        return;
      }
      this.loaderBlockedSave = true;
      axios
        .post(`${api.API_URL}/blocked-dates`, this.blockedInfo, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        .then(() => {
          this.loaderBlockedSave = false;
          this.notifyVue("top", "center", "success", "Blocked Date added successfully", "ti-announcement");
          this.listBlockedDates();
          this.closeModalBlockedDate();
          this.blockedInfo.date = '';
          this.blockedInfo.type = '';
          this.blockedInfo.holiday_name = '';
          this.blockedInfo.reason = '';
        })
        .catch((error) => {
          this.loaderBlockedSave = false;
          let errorMessage = "An unexpected error occurred.";
          if (error.response && error.response.data) {
            errorMessage = error.response.data.message || errorMessage;
          }
          this.notifyVue("top", "center", "danger", errorMessage, "ti-hand-stop");
        });
    },
    updateBlockedDate() {
      if (this.blockedInfo.type === "holiday" && !this.blockedInfo.holiday_name) {
        this.notifyVue("top", "center", "danger", "Holiday name is required for holiday type", "ti-hand-stop");
        return;
      }
      this.loaderBlockedSave = true;
      this.blockedInfo.business_id = this.user.business_id;
      axios
        .put(`${api.API_URL}/blocked-dates/${this.blockedInfo.id}`, this.blockedInfo, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        .then(() => {
          this.loaderBlockedSave = false;
          this.notifyVue("top", "center", "success", "Blocked Date updated successfully", "ti-announcement");
          this.listBlockedDates();
          this.closeModalBlockedDate();
        })
        .catch((error) => {
          this.loaderBlockedSave = false;
          let errorMessage = "An unexpected error occurred.";
          if (error.response && error.response.data) {
            errorMessage = error.response.data.message || errorMessage;
          }
          this.notifyVue("top", "center", "danger", errorMessage, "ti-hand-stop");
        });
    },
    clickCallbackBlocked(pageNum) {
      this.listBlockedDates(pageNum);
    },
    openModalBlockedDate() {
      this.modalBlockedTitle = "Add Blocked Date";
      this.blockedBtnType = "add";
      this.blockedInfo = {
        date: "",
        type: "holiday",
        holiday_name: "",
        reason: "",
        business_id: this.user.business_id
      };
      this.modalBlockedVisible = true;
    },
    closeModalBlockedDate() {
      this.modalBlockedVisible = false;
    },
    modalEditBlockedDate(block) {
      this.modalBlockedTitle = "Update Blocked Date";
      this.blockedBtnType = "edit";
      this.blockedInfo = { ...block };
      this.modalBlockedVisible = true;
    },
    deleteBlockedDate(id) {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this blocked date?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
          this.loaderBlockedSave = true;
          axios
            .delete(`${api.API_URL}/blocked-dates/${id}`, {
              headers: { Authorization: `Bearer ${this.token}` }
            })
            .then(() => {
              this.loaderBlockedSave = false;
              Swal.fire("Deleted!", "Blocked Date Successfully Deleted.", "success");
              this.listBlockedDates();
            })
            .catch(() => {
              this.loaderBlockedSave = false;
              Swal.fire("Error", "Failed to delete blocked date", "error");
              this.notifyVue("top", "center", "error", "Failed to delete blocked date", "ti-announcement");
            });
        }
      });
    },
      cancelBlock(){
        this.closeModalBlockedDate();
        this.blockedInfo.date = '';
        this.blockedInfo.type = '';
        this.blockedInfo.holiday_name = '';
        this.blockedInfo.reason = '';
      },
      cancelSched(){
          this.closeModalSchedule();
          this.info.day_of_week = ''
          this.info.start_time = ''
          this.info.end_time = ''
          this.info.break_start_time = ''
          this.info.break_end_time = ''
          this.info.slot_duration = 30
      }
  },
  created() {
    this.list();
    this.listBlockedDates();
    this.info.business_id = this.user.business_id;
    this.blockedInfo.business_id = this.user.business_id;
  }
};
</script>

<style>
/* Tabs styling */
.tab-menu {
  margin-bottom: 20px;
}
.tab-menu button {
  padding: 10px 20px;
  border: none;
  background-color: #106c9c;
  color: #fff;
  cursor: pointer;
  margin-right: 10px;
}
.tab-menu button.active {
  background-color: #b6aa62;
}
#top-tool-bar {
  padding: 10px;
}
#add-schedule,
#add-blocked-date {
  float: right;
}
.action {
  text-align: center;
}
.tbl-style {
  margin-bottom: 20px;
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

.center-text{text-align: center;}
.tab-menu button{width: 100%; margin-bottom: 5px;}
</style>
