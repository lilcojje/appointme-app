<template>
  <div id="page-user">
    <div class="row">
      <div class="col-12">
        <card>
          <div slot="raw-content" class="table-responsive">
            <div class="row" id="top-tool-bar">
              <div class="col-6">
                <input type="text" v-model="search_value" @input="search" id="search">
              </div>
              <div class="col-6">
                <p-button type="info" round @click.native.prevent="modalAddUser" id="add-user" v-show="userData.permissions.includes('add_users')">
                  Add User
                </p-button>
                <p-button type="info" round @click.native.prevent="redirectToRoles" id="add-roles" v-show="userData.permissions.includes('view_permissions')">
                  Permissions
                </p-button>
              </div>
            </div>
            <loader v-if="loader"/>
            <table class="table table-striped tbl-style" id="user-tbl">
              <thead>
                <th style="text-align: center;">First Name</th>
                <th style="text-align: center;">Last Name</th>
                <th style="text-align: center;">Email</th>
                <th style="text-align: center;">Role</th>
                <th style="text-align: center;" class="action">Action</th>
              </thead>
              <tbody v-if="users.total > 0">
                <tr v-for="(user, index) in users.data" :key="index">
                  <td style="text-align: center;">{{ user.first_name }}</td>
                  <td style="text-align: center;">{{ user.last_name }}</td>
                  <td style="text-align: center;">{{ user.email }}</td>
                  <td style="text-align: center;">{{ user.role.name }}</td>
                  <td style="text-align: center;" class="action">
                    <p-button type="info" round @click.native.prevent="modalEditUser(user)" v-show="userData.permissions.includes('edit_users')">
                      <span class="ti-pencil"></span>
                    </p-button>
                    <p-button type="info" round @click.native.prevent="deleteUser(user.id)" v-show="userData.permissions.includes('delete_users') && user.owner != 1">
                      <span class="ti-trash"></span>
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
              v-if="users.total > 0">
            </paginate>
          </div>
        </card>
      </div>
    </div>

    <Modal :showModal="modalVisible" :title="modal_title" @close="closeModalUser">
      <loader v-if="loader_save"/>
      <fg-input
        type="text"
        label="First Name"
        placeholder="Enter First Name"
        v-model="info.first_name"
      />
      <fg-input
        type="text"
        label="Last Name"
        placeholder="Enter Last Name"
        v-model="info.last_name"
      />
      <fg-input
        type="email"
        label="Email"
        placeholder="Enter Email"
        v-model="info.email"
      />
      <fg-input
        type="password"
        label="Password"
        placeholder="Enter Password"
        v-model="info.password"
      />
      <div class="form-group" data-v-701ac82d="">
        <label class="control-label">Role</label>
        <select v-model="info.role" class="form-control" id="role-select" :disabled="disable_role">
          <option value="" disabled>Select Role</option>
          <option v-for="role in roleOptions" :key="role.value" :value="role.value">
            {{ role.label }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <div class="form-check">
          <input type="checkbox" v-model="info.notify_email" id="notify_email" class="form-check-input">
          <label class="form-check-label" for="notify_email">Notify Email Notifications</label>
        </div>
      </div>
      
      <div style="clear:both">&nbsp;</div>
      <p-button type="info" round @click.native.prevent="addUser" id="add-user" v-show="btn_type == 'add'" v-if="add_btn">
        Add
      </p-button>
      <p-button type="info" round @click.native.prevent="updateUser" id="update-user" v-show="btn_type == 'edit'">
        Update
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
import axios from 'axios'
import Loader from "@/components/Loader";
import Modal from '@/components/Modal';
import Paginate from 'vuejs-paginate';
import Swal from 'sweetalert2';

export default {
  components: {
    Loader,
    Paginate,
    Modal,
    Swal
  },
  data() {
    return {
      loader: false,
      loader_save: false,
      total_page: 0,
      users: [],
      modalVisible: false,
      info: {
        id: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role_id: '', // Replaced status with role
        notify_email: false
      },
      roleOptions: [],
      search_value: '',
      modal_title: '',
      btn_type: '',
      add_btn: true,
      errors: {
        first_name: '',
        last_name: '',
        email: '',
        password: ''
      },
      disable_role: false,
      total:0
    };
  },computed: {
    userData() {
      return this.$store.state.user;
    },
    token() {
      return this.$store.state.token;
    }
  },
  methods: {
    async list(page = 1) {
      let self = this;
      let limit = 10;
      let search_val = this.search_value;

      self.page = page;
      self.loader = true;

      await axios.get(api.API_URL + `/user?page=${page}&limit=${limit}&search=${search_val}&business_id=${this.userData.business_id}`,
        {
          headers: { Authorization: `Bearer ${this.token}` }
        }
      ).then(({ data }) => {
        self.loader = false;
        self.users = data;
        self.total = data.total;
        self.total_page = Math.ceil(data.total / limit);
      }).catch(({ response }) => {
        if (response.data.error.code === 'token_could_not_verified') {
          this.$router.push('/login')
        }
      });
    },
    clickCallback(pageNum) {
      console.log(pageNum)
      this.list(pageNum)
    },
    openModalUser() {
      this.modalVisible = true;
    },
    closeModalUser() {
      this.modalVisible = false;
    },
    validateForm() {
      this.errors = { first_name: '', last_name: '', email: '', password: '', role_id: '' };

      let isValid = true;

      if (!this.info.first_name.trim()) {
        this.notifyVue('top', 'center', 'danger', 'First Name is required.', 'ti-hand-stop');
        isValid = false;
      }

      if (!this.info.last_name.trim()) {
        this.notifyVue('top', 'center', 'danger', 'Last Name is required.', 'ti-hand-stop');
        isValid = false;
      }

      if (!this.info.email.trim()) {
        this.notifyVue('top', 'center', 'danger', 'Email is required.', 'ti-hand-stop');
        isValid = false;
      } else if (!this.isValidEmail(this.info.email)) {
        this.notifyVue('top', 'center', 'danger', 'Invalid email format.', 'ti-hand-stop');
        isValid = false;
      }

      if (!this.info.password.trim() && this.btn_type!=="edit") {
        this.notifyVue('top', 'center', 'danger', 'Password is required.', 'ti-hand-stop');
        isValid = false;
      }

      if (!this.info.role) {
        this.notifyVue('top', 'center', 'danger', 'Role is required.', 'ti-hand-stop');
        isValid = false;
      }

      return isValid;
    },
    addUser() {
      if (!this.validateForm()) return;

      this.loader_save = true;
      let self = this;
      this.add_btn = false;

      axios.post(api.API_URL + '/user', {
        first_name: self.info.first_name,
        last_name: self.info.last_name,
        email: self.info.email,
        password: self.info.password,
        role_id: self.info.role, // Sending role instead of status
        notify_email: self.info.notify_email,
        business_id: this.userData.business_id
      },
      {
        headers: { Authorization: `Bearer ${this.token}` }
      })
        .then((response) => {
          self.loader_save = false;
          if (response.data.error) {
            Swal.fire({
              icon: 'error',
              title: 'Limit Reached',
              text: 'Adding Services has reached the limit. Please upgrade to Pro.',
              showCancelButton: true,
              confirmButtonText: 'Subscribe',
              cancelButtonText: 'Close'
            }).then((result) => {
              if (result.isConfirmed) {
                this.$router.push('/subscription');
              }
            });
          } else {
            self.notifyVue('top', 'center', 'success', 'User successfully added', 'ti-announcement');
            self.list();
            self.closeModalUser();
            self.resetForm();
          }
          self.add_btn = true;
        })
        .catch((error) => {
            self.loader_save = false;
            
            // Get the main error message or fallback if not available
            let errMsg = error.response && error.response.data && error.response.data.message 
                        ? error.response.data.message 
                        : 'An error occurred. Please try again.';

            // If there are email errors, append them only if they differ from the main message
            if (error.response && error.response.data && error.response.data.errors && error.response.data.errors.email) {
              const emailErrors = error.response.data.errors.email;
              const additionalErrors = emailErrors.filter(msg => msg !== errMsg);
              if (additionalErrors.length) {
                errMsg += " " + additionalErrors.join(" ");
              }
            }

            this.notifyVue('top', 'center', 'danger', errMsg, 'ti-hand-stop');
            self.add_btn = true;
          });

    },

    updateUser() {
      if (!this.validateForm()) return;

      this.loader_save = true;
      let self = this;

      axios.put(api.API_URL + '/user/' + self.info.id, {
        first_name: self.info.first_name,
        last_name: self.info.last_name,
        email: self.info.email,
        password: self.info.password,
        role_id: self.info.role, // Sending role instead of status
        notify_email: self.info.notify_email,
        business_id: this.userData.business_id
      },
      {
        headers: { Authorization: `Bearer ${this.token}` }
      })
        .then(() => {
          self.loader_save = false;
          self.notifyVue('top', 'center', 'success', 'User successfully updated', 'ti-announcement');
          self.list();
          self.closeModalUser();
          self.resetForm();
        })
        .catch((error) => {
          self.loader_save = false;
          if (error.response.status === 400) {
            if (error.response.data.errors) {
              // Loop through all error fields and display each error message
              Object.keys(error.response.data.errors).forEach(key => {
                error.response.data.errors[key].forEach(message => {
                  this.notifyVue('top', 'center', 'danger', message, 'ti-hand-stop');
                });
              });
            } else {
              alert(error.response.data.message);
              this.notifyVue('top', 'center', 'danger', error.response.data.message, 'ti-hand-stop');
            }
          }
        });
    },


    deleteUser(id) {

      this.loader_save = true;
      let self = this;

      Swal.fire({
          title: "Are you sure?",
          text: "Do you really want to delete this user?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!"
      }).then((result) => {
          if (result.isConfirmed) {
              axios.delete(api.API_URL + '/user/' + id, {
                  headers: { Authorization: `Bearer ${this.token}` }
              })
              .then(() => {
                  self.loader_save = false;
                  Swal.fire("Deleted!", "User successfully deleted.", "success");

                  self.list();
              })
              .catch((error) => {
                  self.loader_save = false;
                  if (error.response.status === 400) {
                      Swal.fire("Error", error.response.data.error.message, "error");
                      self.notifyVue('top', 'center', 'danger', error.response.data.error.message, 'ti-hand-stop');
                  }
              });
          }
      });
    },
    resetForm() {
      this.info.first_name = '';
      this.info.last_name = '';
      this.info.email = '';
      this.info.password = '';
      this.info.role = ''; // Reset role
      this.info.notify_email = false;
    },
    notifyVue(verticalAlign, horizontalAlign, type, msg, icon) {
      this.$notify({
        title: msg,
        icon: icon,
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: type,
      });
    },
    search() {
      this.list();
    },
    modalAddUser() {
      this.modal_title = 'Add User';
      this.openModalUser();
      this.btn_type = 'add';
      this.resetForm();
      this.add_btn = true;
    },
    modalEditUser(user) {
      this.modal_title = 'Update User';
      this.openModalUser();
      this.btn_type = 'edit';
      this.info.first_name = user.first_name;
      this.info.last_name = user.last_name;
      this.info.email = user.email;
      this.info.role = user.role.id; // Assign role to info
      this.info.id = user.id;
      this.info.notify_email = user.notify_email;
    
      if(parseInt(user.owner, 10)==1){
        this.disable_role = true;
      }else{
        this.disable_role = false;
      }
    },
    redirectToRoles() {
      this.$router.push('/user-permission');
    },
    isValidEmail(email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailPattern.test(email);
    },
    // New method to fetch role options dynamically
    async getRoles() {
      try {
        let response = await axios.get(api.API_URL + `/roles?business_id=${this.userData.business_id}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        let rolesArray = response.data.data || [];
        this.roleOptions = rolesArray.map(role => ({ label: role.name, value: role.id }));
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    },
    cancel(){
        this.closeModalUser();
        this.resetForm();
      }
  },
  created() {
    this.list();
    this.getRoles();
  }
};
</script>

<style>
#user-tbl .btn { padding: 5px 10px!important; margin-right:5px; }
.action { text-align: center; }
#top-tool-bar { padding:10px; }
#add-user { float:right; }
#search { width:50%; }
.pagination li { margin-right:20px; }
.pagination { padding: 10px!important; }
.pagination .page-item.active a { font-weight: bold; background-color: #b6aa62!important; } 
.pagination li a { background: #106c9c; padding: 5px; color: #fff!important; }
#add-user { float:right; }
#no-record { font-weight: bold; font-size: 20px; }
@media screen and (max-width: 600px) {
  .modal { width: 100%!important; }
}

.error-message {
  color: red;
  font-size: 0.8em;
  margin-top: -10px;
  margin-bottom: 10px;
}

#add-roles { float:right; margin-right: 5px; }
.action .btn-info { margin: 0 2px; }
</style>
