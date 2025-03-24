<template>
  <div id="page-profile">
    <div class="profile-display">
      <h2>User Profile</h2>
      <div>
        <strong>First Name:</strong> {{ info.first_name }}
      </div>
      <div>
        <strong>Last Name:</strong> {{ info.last_name }}
      </div>
      <div>
        <strong>Email:</strong> {{ info.email }}
      </div>
      <div>
        <strong>User Role:</strong> {{ info.role_name }}
      </div>
      <div>
        <strong>Business Belong:</strong> {{ info.business_name }}
      </div>
    </div>
    <p-button type="info" round @click.native.prevent="openEditModal">
      Edit Profile
    </p-button>

    <p-button type="info" round @click.native.prevent="deleteAccount" class="danger-btn" id="update-profile">
        Delete Account
    </p-button>

    <Modal :showModal="modalVisible" :title="modal_title" @close="closeModal">
      <loader v-if="loader_save" />
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
        placeholder="Enter New Password"
        v-model="info.password"
      />
      <div class="form-group">
        <label>User Role</label>
        <select v-model="info.role" class="form-control">
          <option value="" disabled>Select Role</option>
          <option v-for="role in roleOptions" :key="role.value" :value="role.value">
            {{ role.label }}
          </option>
        </select>
      </div>
      <div style="clear:both">&nbsp;</div>
      <p-button type="info" round @click.native.prevent="updateProfile" id="update-profile">
        Update Profile
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
import Swal from "sweetalert2";

export default {
  components: {
    Loader,
    Modal,
    Swal
  },
  data() {
    return {
      loader: false,
      loader_save: false,
      modalVisible: false,
      modal_title: "",
      info: {
        id: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "", // role id (editable, stored as string)
        role_name: "", // display role name
        business: "", // business id (editable)
        business_name: "" // display business name
      },
      roleOptions: [],
      businessOptions: []
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
    // Fetch roles dynamically from /roles and convert id to string
    fetchRoles() {
      const token = localStorage.getItem("token");
      const business_id = this.user.business_id;
      axios
        .get(api.API_URL + `/roles?business_id=${business_id}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        .then(({ data }) => {
          this.roleOptions = data.data.map(role => ({
            label: role.name,
            value: String(role.id) // convert to string
          }));
        })
        .catch(error => {
          console.error("Error fetching roles:", error);
        });
    },
    // Fetch user profile from /profile/{user_id} with business_id as a query parameter
    getProfile() {
      const user_id = this.$route.params.user_id || this.user.id;
      const token = localStorage.getItem("token");
      const business_id = this.user.business_id;
      this.loader = true;
      axios
        .get(api.API_URL + "/profile/" + user_id, {
          headers: { Authorization: `Bearer ${this.token}` },
          params: { business_id }
        })
        .then(({ data }) => {
          this.loader = false;
          this.info.id = data.id;
          this.info.first_name = data.first_name;
          this.info.last_name = data.last_name;
          this.info.email = data.email;
          // Convert the role id to string so it matches the select option values
          this.info.role = data.role ? String(data.role.id) : "";
          this.info.role_name = data.role ? data.role.name : "";
          this.info.business = data.business ? String(data.business.id) : "";
          this.info.business_name = data.business ? data.business.name : "";
        })
        .catch(error => {
          this.loader = false;
          if (error.response && error.response.data.error.code === "token_could_not_verified") {
            this.$router.push("/login");
          }
        });
    },
    openEditModal() {
      this.modal_title = "Edit Profile";
      this.info.password = "";
      this.modalVisible = true;
    },
    closeModal() {
      this.modalVisible = false;
    },
    validateForm() {
      if (!this.info.first_name.trim()) {
        this.notifyVue("top", "center", "danger", "First Name is required.", "ti-hand-stop");
        return false;
      }
      if (!this.info.last_name.trim()) {
        this.notifyVue("top", "center", "danger", "Last Name is required.", "ti-hand-stop");
        return false;
      }
      if (!this.info.email.trim()) {
        this.notifyVue("top", "center", "danger", "Email is required.", "ti-hand-stop");
        return false;
      }
      if (!this.info.role) {
        this.notifyVue("top", "center", "danger", "User Role is required.", "ti-hand-stop");
        return false;
      }
    
      return true;
    },
    updateProfile() {
      if (!this.validateForm()) return;
      const user_id = this.info.id;
      this.loader_save = true;
      axios
        .put(
          api.API_URL + "/user/" + user_id,
          {
            first_name: this.info.first_name,
            last_name: this.info.last_name,
            email: this.info.email,
            password: this.info.password,
            role_id: this.info.role,
            business_id: this.info.business
          },
          {
            headers: { Authorization: `Bearer ${this.token}` }
          }
        )
        .then(() => {
          this.loader_save = false;
          this.notifyVue("top", "center", "success", "Profile successfully updated", "ti-announcement");
          this.getProfile();
          this.closeModal();
        })
        .catch(error => {
          this.loader_save = false;
          if (error.response && error.response.status === 400) {
            this.notifyVue("top", "center", "danger", error.response.data.error.message, "ti-hand-stop");
          }
        });
    },
    deleteAccount() {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you really want to delete your account? This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                axios.post(
                    api.API_URL + "/delete-account",
                    { user_id: this.user.id },
                    { headers: { Authorization: `Bearer ${this.token}` } }
                )
                .then(() => {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Your account has been successfully deleted. You will no longer have access to your account.",
                        icon: "success",
                        confirmButtonColor: "#3085d6"
                    });
                })
                .catch((error) => {
                    let errorMessage = "An error occurred while deleting your account.";
                    if (error.response) {
                        if (error.response.status === 400) {
                          errorMessage = (error.response.data.error && error.response.data.error.message) || error.response.data.message;
                        } else if (error.response.status === 422) {
                            errorMessage = Object.values(error.response.data.errors || {}).flat()[0] || error.response.data.message;
                        }
                    }
                    Swal.fire({
                        title: "Error!",
                        text: errorMessage,
                        icon: "error",
                        confirmButtonColor: "#d33"
                    });
                    console.error(error);
                });
            }
        });
    },

    notifyVue(verticalAlign, horizontalAlign, type, msg, icon) {
      this.$notify({
        title: msg,
        icon: icon,
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: type
      });
    }
  },
  created() {
    this.getProfile();
    this.fetchRoles();
  }
};
</script>

<style scoped>
/* Reverted Display Styling */
#page-profile {
  padding: 20px;
}

.profile-display {
  margin-bottom: 20px;
  padding: 15px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.profile-display h2 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
}

.profile-display div {
  font-size: 16px;
  margin-bottom: 8px;
  color: #555;
}

/* Enhanced Form Styling */
.form-group {
  margin: 20px 0;
}

.form-group label {
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
  color: #444;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  border-color: #106c9c;
  outline: none;
}

.p-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  background-color: #106c9c;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 15px;
}

.p-button:hover {
  background-color: #0d5a7a;
}

.danger-btn{background-color: #f2474f; border:1px solid #f2474f; margin-left: 5px;}

/* Responsive Adjustments */
@media (max-width: 600px) {
  #page-profile {
    padding: 20px;
  }
  .profile-display h2 {
    font-size: 22px;
  }
  .form-control {
    font-size: 14px;
    padding: 10px 12px;
  }
  .p-button {
    font-size: 14px;
    padding: 10px 20px;
  }
}
</style>
