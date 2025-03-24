<template>
  <div id="page-service">
    <div class="row">
      <div class="col-12">
        <card>
          <div slot="raw-content" class="table-responsive">
            <div class="row" id="top-tool-bar">
              <div class="col-6">
                <input type="text" v-model="search_value" @input="search" id="search" />
              </div>
              <div class="col-6 align-right">
                <p-button type="info" round @click.native.prevent="modalAddService" id="add-service" v-show="user.permissions.includes('add_services')">
                  Add Services
                </p-button>
                <p-button type="info" round @click.native.prevent="redirectTocat" id="add-categories" v-show="user.permissions.includes('view_permissions')">
                  Categories
                </p-button>
              </div>
            </div>
            <loader v-if="loader" />
            <table class="table table-striped tbl-style" id="service-tbl">
              <thead>
                <th style="text-align: center;">Service Name</th>
                <th style="text-align: center;">Price</th>
                <th style="text-align: center;">Category</th>
                <th style="text-align: center;" class="action">Action</th>
              </thead>
              <tbody v-if="services.total > 0">
                <tr v-for="(service,index) in services.data" :key="index">
                  <td style="text-align: center;">{{ service.name }}</td>
                  <td style="text-align: center;">{{currency_label}}{{ service.price }}</td>
                  <td style="text-align: center;">
                    {{ service.service_category ? service.service_category.name : 'N/A' }}
                  </td>
                  <td style="text-align: center;" class="action">
                    <p-button type="info" round @click.native.prevent="modalEditService(service)" v-show="user.permissions.includes('edit_services')">
                      <span class="ti-pencil"></span>
                    </p-button>
                    <p-button type="info" round @click.native.prevent="deleteService(service.id)" v-show="user.permissions.includes('delete_services')">
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
              v-if="services.total > 0"
            >
            </paginate>
          </div>
        </card>
      </div>
    </div>

    <Modal :showModal="modalVisible" :title="modal_title" @close="closeModalService">
      <loader v-if="loader_save" />
      <fg-input
        type="text"
        label="Service Name"
        placeholder="Enter Service Name"
        v-model="info.service_name"
      />

      <fg-input
        type="number"
        label="Price"
        placeholder="Enter Price"
        v-model="info.price"
        step="0.01"
        min="0"
      />

      <fg-input
        type="text"
        label="Description"
        placeholder="Enter Description"
        v-model="info.description"
      />

      <div class="form-group" data-v-701ac82d="">
        <label class="control-label">Category</label>
        <select v-model="info.category_id" class="form-control">
          <option value="" disabled>Select a category</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <p-button
        type="info"
        round
        @click.native.prevent="addService"
        id="add-service"
        v-show="btn_type == 'add'"
        v-if="add_btn"
      >
        Add
      </p-button>
      <p-button
        type="info"
        round
        @click.native.prevent="updateService"
        id="add-service"
        v-show="btn_type == 'edit'"
      >
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
import axios from "axios";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import Paginate from "vuejs-paginate";
import VAutocomplete from "v-autocomplete";
import ItemTemplate from "@/components/ItemTemplate.vue";
import Swal from "sweetalert2";

export default {
  components: {
    Loader,
    Paginate,
    Modal,
    VAutocomplete,
    ItemTemplate,
    Swal,
  },
  data() {
    return {
      loader: false,
      loader_save: false,
      records: {
        success: true,
      },
      total_page: 0,
      services: [],
      categories: [],
      showAddModal: true,
      modalVisible: false,
      info: {
        id: "",
        service_name: "",
        description: "",
        price: "",
        sale_price: "",
        category_id: "",
      },
      search_value: "",
      input_name: "",
      modal_title: "",
      modal_button: "",
      btn_type: "",
      add_btn: true,
      item: {},
      items: [],
      template: ItemTemplate,
      errors: {
        service_name: "",
        price: "",
      },
      currency_label: '',
      total: 0
    };
  },computed: {
    user() {
      return this.$store.state.user;
    },
    token() {
      return this.$store.state.token;
    },
    settings() {
      // Ensure it's an array
      return this.$store.state.settings;
    }
  },
  methods: {
    async list(page = 1) {
      let self = this;
      let limit = 10;
      let search_val = this.search_value;

      self.page = page;
      self.loader = true;

      await axios
        .get(
          api.API_URL +
            `/service?page=${page}&limit=${limit}&search=${search_val}&business_id=${this.user.business_id}`,
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        )
        .then(({ data }) => {
          self.loader = false;
          self.services = data;
          self.total = data.total;
          self.total_page = Math.ceil(data.total / limit);
        })
        .catch(({ response }) => {
          if (response.data.error.code == "token_could_not_verified") {
            this.$router.push("/login");
          }
        });
    },

    clickCallback(pageNum) {
      console.log(pageNum);
      this.list(pageNum);
    },
    openModalService() {
      this.modalVisible = true;
    },
    closeModalService() {
      this.modalVisible = false;
    },
    validateForm() {
      this.errors = { service_name: "", price: "" };

      let isValid = false;

      if (!this.info.service_name.trim()) {
        this.notifyVue(
          "top",
          "center",
          "danger",
          "Service name is required.",
          "ti-hand-stop"
        );
        isValid = false;
      }

      const price = parseFloat(this.info.price);
      if (!this.info.price.toString().trim()) {
        this.notifyVue(
          "top",
          "center",
          "danger",
          "Price is required.",
          "ti-hand-stop"
        );
        isValid = false;
      } else if (isNaN(price) || price < 0) {
        this.notifyVue(
          "top",
          "center",
          "danger",
          "Price must be a valid non-negative number.",
          "ti-hand-stop"
        );
        isValid = false;
      } else {
        isValid = true;
      }

      return isValid;
    },
    addService() {
      if (!this.validateForm()) return;

      this.loader_save = true;
      let self = this;
      this.add_btn = false;

      axios
        .post(
          api.API_URL + "/service",
          {
            name: self.info.service_name,
            description: self.info.description,
            price: self.info.price,
            category_id: self.info.category_id,
            business_id: self.user.business_id,
          },
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        )
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
                        this.$router.push('/subscription')
                    }
                });
            } else {
              self.notifyVue(
                "top",
                "center",
                "success",
                "Service Successfully Added",
                "ti-announcement"
              );
              self.list();
              self.closeModalService();
              self.info.service_name = "";
              self.info.description = "";
              self.info.price = "";
              self.info.category_id = "";
            }
        })
        .catch((error) => {
          try {
            self.loader_save = false;
            if (error.response.status == 400) {
              const msg = error.response.data.error
                ? error.response.data.error.message
                : error.response.data.message;
              alert(msg);
              this.notifyVue("top", "center", "danger", msg, "ti-hand-stop");
            } else if (error.response.status == 422) {
              if (error.response.data.errors) {
                for (const key in error.response.data.errors) {
                  if (error.response.data.errors.hasOwnProperty(key)) {
                    const errMsg = error.response.data.errors[key][0];
                    this.notifyVue(
                      "top",
                      "center",
                      "danger",
                      errMsg,
                      "ti-hand-stop"
                    );
                  }
                }
              } else {
                this.notifyVue(
                  "top",
                  "center",
                  "danger",
                  error.response.data.message,
                  "ti-hand-stop"
                );
              }
            }

              this.add_btn = true;
          } catch (err) {
            console.error(err);
          }
        });
    },
    updateService() {
      if (!this.validateForm()) return;
  
      this.loader_save = true;
      let self = this;
      axios
        .put(
          api.API_URL + "/service/" + self.info.id,
          {
            name: self.info.service_name,
            description: self.info.description,
            price: self.info.price,
            category_id: self.info.category_id,
            business_id: self.user.business_id,
          },
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        )
        .then((data) => {
          self.loader_save = false;
          self.notifyVue(
            "top",
            "center",
            "success",
            "Service Successfully Updated",
            "ti-announcement"
          );
          self.list();
          self.closeModalService();
          self.info.service_name = "";
          self.info.description = "";
          self.info.price = "";
          self.info.category_id = "";
          self.user.business_id = "";
        })
        .catch((error) => {
          try {
            self.loader_save = false;
            if (error.response.status == 400) {
              const msg = error.response.data.error
                ? error.response.data.error.message
                : error.response.data.message;
              alert(msg);
              this.notifyVue("top", "center", "danger", msg, "ti-hand-stop");
            } else if (error.response.status == 422) {
              if (error.response.data.errors) {
                for (const key in error.response.data.errors) {
                  if (error.response.data.errors.hasOwnProperty(key)) {
                    const errMsg = error.response.data.errors[key][0];
                    this.notifyVue(
                      "top",
                      "center",
                      "danger",
                      errMsg,
                      "ti-hand-stop"
                    );
                  }
                }
              } else {
                this.notifyVue(
                  "top",
                  "center",
                  "danger",
                  error.response.data.message,
                  "ti-hand-stop"
                );
              }
            }
          } catch (err) {
            console.error(err);
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
        type: type,
      });
    },
    search() {
      this.list();
    },
    modalAddService() {
      this.modal_title = "Add Service";
      this.modal_button = "Add";
      this.openModalService();
      this.btn_type = "add";
      this.info.service_name = "";
      this.info.price = "";
      this.info.description = "";
      this.add_btn = true;
    },
    modalEditService(service) {
      this.modal_title = "Update Service";
      this.modal_button = "Update";
      this.openModalService();
      this.btn_type = "edit";
      this.info.service_name = service.name;
      this.info.price = service.price;
      this.info.description = service.description;
      this.info.category_id = service.service_category.id;
      this.info.id = service.id;
    },
    deleteService(id) {
    
      this.loader_save = true;
      let self = this;

      Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          axios
            .delete(api.API_URL + "/service/" + id, {
              headers: { Authorization: `Bearer ${this.token}` },
            })
            .then((data) => {
              self.loader_save = false;
              Swal.fire("Deleted!", "Client Successfully Deleted.", "success");
              self.list();
            })
            .catch((error) => {
              self.loader_save = false;
              try {
                if (error.response.status === 400) {
                  const msg = error.response.data.error
                    ? error.response.data.error.message
                    : error.response.data.message;
                  Swal.fire("Error", msg, "error");
                  self.notifyVue("top", "center", "danger", msg, "ti-hand-stop");
                } else if (error.response.status === 422) {
                  if (error.response.data.errors) {
                    for (const key in error.response.data.errors) {
                      if (error.response.data.errors.hasOwnProperty(key)) {
                        const errMsg = error.response.data.errors[key][0];
                        Swal.fire("Error", errMsg, "error");
                        self.notifyVue(
                          "top",
                          "center",
                          "danger",
                          errMsg,
                          "ti-hand-stop"
                        );
                      }
                    }
                  } else {
                    Swal.fire(
                      "Error",
                      error.response.data.message,
                      "error"
                    );
                    self.notifyVue(
                      "top",
                      "center",
                      "danger",
                      error.response.data.message,
                      "ti-hand-stop"
                    );
                  }
                }
              } catch (err) {
                console.error("Error handling the response:", err);
              }
            });
        }
      });
    },
    transaction(service) {
      localStorage.setItem(
        "service_name",
        service.first_name + " " + service.last_name
      );
      this.$router.push({ path: "/transaction/" + service.id });
    },
    dateToString(date_data) {
      var date = new Date(date_data);
      let date_return =
        (date.getMonth() > 8
          ? date.getMonth() + 1
          : "0" + (date.getMonth() + 1)) +
        "/" +
        (date.getDate() > 9 ? date.getDate() : "0" + date.getDate()) +
        "/" +
        date.getFullYear();
      return date_return;
    },
    getLabel(item) {
      this.list();
      return item.first_name + " " + item.last_name;
    },
    updateItems(text) {
      let self = this;
      this.search_value = text;
      axios
        .get(api.API_URL + `/service?search=${text}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .then(({ data }) => {
          self.loader = false;
          self.items = data.data;
        })
        .catch(({ response }) => {
          if (response.data.error.code == "token_could_not_verified") {
            this.$router.push("/login");
          }
        });
    },
    redirectTocat() {
      this.$router.push("/services-cat");
    },
    async fetchCategories() {
      try {
        const { data } = await axios.get(
          api.API_URL +
            `/service-category?business_id=${this.user.business_id}`,
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        );
        this.categories = data.data.data;
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    },
      cancel(){
        this.closeModalService();
        this.info.service_name = "";
        this.info.description = "";
        this.info.price = "";
        this.info.category_id = "";
      }
  },
  created() {
    this.list();
    this.fetchCategories();
    const plainSettings = JSON.parse(JSON.stringify(this.settings));
    this.currency_label = plainSettings.currency_symbol;
  },
};
</script>

<style scoped>
#service-tbl .btn {
  padding: 5px 10px !important;
  margin-right: 5px;
}
.action {
  text-align: center;
}
#top-tool-bar {
  padding: 10px;
}
#add-service {
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
#add-service {
  float: right;
}
#no-record {
  font-weight: bold;
  font-size: 20px;
}

@media screen and (max-width: 600px) {
  .modal {
    width: 100% !important;
  }
}

.error-message {
  color: red;
  font-size: 0.8em;
  margin-top: -10px;
  margin-bottom: 10px;
}

#add-categories {
  float: right;
  margin-right: 5px;
}
.action .btn-info {
  margin: 0 2px;
}
</style>
