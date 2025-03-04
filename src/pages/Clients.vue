<template>
  <div id="page-client">
    <div class="row">
      <div class="col-12">
        <card>
          <div slot="raw-content" class="table-responsive">
            <div class="row" id="top-tool-bar">
              <div class="col-6">
                <input type="text" v-model="search_value" @input="search" id="search">
              </div>
              <div class="col-6">
                <p-button type="info" round @click.native.prevent="modalAddClient" id="add-client">
                  Add Client
                </p-button>
              </div>
            </div>
            <loader v-if="loader"/>
            <table class="table table-striped tbl-style" id="client-tbl">
              <thead>
                <th style="text-align: center;">First Name</th>
                <th style="text-align: center;">Last Name</th>
                <th style="text-align: center;">Email</th> <!-- New Email column -->
                <th style="text-align: center;">Contact Number</th>
                <th style="text-align: center;">Date Added</th>
                <th style="text-align: center;" class="action">Action</th>
              </thead>
              <tbody v-if="clients.total > 0">
                <tr v-for="(client,index) in clients.data" :key="index">
                  <td style="text-align: center;">{{ client.first_name }}</td>
                  <td style="text-align: center;">{{ client.last_name }}</td>
                  <td style="text-align: center;">{{ client.email }}</td> <!-- Render email -->
                  <td style="text-align: center;">{{ client.contact_number }}</td>
                  <td style="text-align: center;">{{ dateToString(client.created_at) }}</td>
                  <td class="action">
                    <p-button type="info" round @click.native.prevent="modalEditClient(client)">
                      <span class="ti-pencil"></span>
                    </p-button>
                    <p-button type="info" round @click.native.prevent="transaction(client)">
                      <span class="ti-eye"></span>
                    </p-button>
                    <p-button type="info" round @click.native.prevent="deleteClient(client.id)" v-if="role==1">
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
            <paginate
              :page-count="total_page"
              :page-range="1"
              :margin-pages="2"
              :click-handler="clickCallback"
              :prev-text="'Prev'"
              :next-text="'Next'"
              :container-class="'pagination'"
              :page-class="'page-item'"
              v-if="clients.total > 0">
            </paginate>
          </div>
        </card>
      </div>
    </div>

    <Modal :showModal="modalVisible" :title="modal_title" @close="closeModalClient">
      <loader v-if="loader_save"/> 
      <fg-input
        type="text"
        label="First Name"
        placeholder="First Name"
        v-model="info.first_name"
      />
      <fg-input
        type="text"
        label="Last Name"
        placeholder="Last Name"
        v-model="info.last_name"
      />
      <fg-input
        type="email"
        label="Email"
        placeholder="Email"
        v-model="info.email"
      /> <!-- New Email input -->
      <fg-input
        type="text"
        label="Contact Number"
        placeholder="Contact Number"
        v-model="info.contact_number"
      />
      <p-button type="info" round @click.native.prevent="addClient" id="add-client" v-show="btn_type == 'add'" v-if="add_btn">
        Add
      </p-button> 
      <p-button type="info" round @click.native.prevent="updateClient" id="add-client" v-show="btn_type == 'edit'">
        Update
      </p-button>  
      <div style="clear:both;">&nbsp;</div>
    </Modal>
  </div>
</template>

<script>
import api  from "@/static/config.json";
import axios from 'axios'
import Loader from "@/components/Loader";
import Modal from '@/components/Modal';
import Paginate from 'vuejs-paginate'
import VAutocomplete from 'v-autocomplete';
import ItemTemplate from '@/components/ItemTemplate.vue';
import Swal from 'sweetalert2';

export default {
  components:{
    Loader,
    Paginate,
    Modal,
    VAutocomplete,
    ItemTemplate,
    Swal
  },
  data() {
    return {
      loader: false,
      loader_save: false,
      records: {
        success:true
      },
      total_page: 0,
      clients:[],
      showAddModal:true,
      modalVisible: false,
      info:{
        id:'',
        first_name: '',
        last_name: '',
        email: '',            // New email property
        contact_number:''
      },
      search_value:'',
      input_name:'',
      modal_title:'',
      modal_button:'',
      btn_type:'',
      add_btn:true,
      item: {},
      items: [],
      template: ItemTemplate,
      role:'',
      business_id: ''
    }
  },
  methods:{
    async list(page=1){
      let self = this;
      let limit=10;
      let search_val = self.search_value
      self.page = page;
      self.loader = true;

      await axios.get(api.API_URL+`/client?page=${page}&limit=${limit}&search=${search_val}&business_id=${localStorage.getItem('business_id')}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      ).then(({data})=>{
        self.loader = false;
        self.clients = data
        self.total_page = Math.ceil(data.total/limit);
      }).catch(({ response })=>{
        if(response.data.error.code =='token_could_not_verified'){
          this.$router.push('/login')
        }
      })
    },

    clickCallback (pageNum){
      console.log(pageNum)
      this.list(pageNum)
    },
    openModalClient() {
      this.modalVisible = true;
    },
    closeModalClient() {
      this.modalVisible = false;
    },
    validateForm() {
      if (!this.info.first_name.trim()) {
        this.notifyVue('top', 'center', 'danger', 'First name is required', 'ti-hand-stop');
        return false;
      }
      if (!this.info.last_name.trim()) {
        this.notifyVue('top', 'center', 'danger', 'Last name is required', 'ti-hand-stop');
        return false;
      }
      if (!this.info.email.trim()) {
        this.notifyVue('top', 'center', 'danger', 'Email is required', 'ti-hand-stop');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.info.email)) {
        this.notifyVue('top', 'center', 'danger', 'Invalid email format', 'ti-hand-stop');
        return false;
      }
      if (!this.info.contact_number.trim()) {
        this.notifyVue('top', 'center', 'danger', 'Contact number is required', 'ti-hand-stop');
        return false;
      }
      const contactRegex = /^\d+$/;
      if (!contactRegex.test(this.info.contact_number)) {
        this.notifyVue('top', 'center', 'danger', 'Contact number must contain only numbers', 'ti-hand-stop');
        return false;
      }
      if (this.info.contact_number.length < 10 || this.info.contact_number.length > 15) {
        this.notifyVue('top', 'center', 'danger', 'Contact number must be between 10-15 digits', 'ti-hand-stop');
        return false;
      }
      return true;
    },

    addClient(){
      if (!this.validateForm()) return;
      const token = localStorage.getItem('token');
      this.loader_save = true;
      let self = this;
      this.add_btn = false;
      axios.post(api.API_URL+'/client/store', {
        first_name: self.info.first_name,
        last_name: self.info.last_name,
        email: self.info.email,             // Send email in the payload
        contact_number: self.info.contact_number,
        business_id : localStorage.getItem('business_id')
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
      )
      .then((data) => {
        self.loader_save = false;
        self.notifyVue('top', 'center','success','Client Successfully Added','ti-announcement')
        self.list();
        self.closeModalClient()
        self.info.first_name = ''
        self.info.last_name = ''
        self.info.email = ''              // Clear email field
        self.info.contact_number = ''
        self.add_btn = true;
      })
      .catch((error) => {
        try {
          self.loader_save = false;
          if(error.response.status==400){
            alert(error.response.data.error.message)
            this.notifyVue('top', 'center','danger',error.response.data.error.message,'ti-hand-stop')
          } else if(error.response.status==422){
            for (const [key, value] of Object.entries(error.response.data)) {
              this.notifyVue('top', 'center','danger',value,'ti-hand-stop')
            }
            this.add_btn = true;  
          }
        }
        catch(err) {}
      });
    },
    updateClient(){
      if (!this.validateForm()) return;
      const token = localStorage.getItem('token');
      this.loader_save = true;
      let self = this;
      axios.put(api.API_URL+'/client/update/'+self.info.id, {
        first_name: self.info.first_name,
        last_name: self.info.last_name,
        email: self.info.email,             // Send updated email
        contact_number: self.info.contact_number,
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
      )
      .then((data) => {
        self.loader_save = false;
        self.notifyVue('top', 'center','success','Client Successfully Updated','ti-announcement')
        self.list();
        self.closeModalClient()
        self.info.first_name = ''
        self.info.last_name = ''
        self.info.email = ''              // Clear email field
        self.info.contact_number = ''
      })
      .catch((error) => {
        try {
          self.loader_save = false;
          if(error.response.status==400){
            alert(error.response.data.error.message)
            this.notifyVue('top', 'center','danger',error.response.data.error.message,'ti-hand-stop')
          } else if(error.response.status==422){
            for (const [key, value] of Object.entries(error.response.data)) {
              this.notifyVue('top', 'center','danger',value,'ti-hand-stop')
            }
          }
        }
        catch(err) {}
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
    search(){
      this.list()
    },
    modalAddClient(){
      this.modal_title = 'Add Client'
      this.modal_button = 'Add'
      this.openModalClient()
      this.btn_type = 'add'
      this.info.first_name = ''
      this.info.last_name = ''
      this.info.email = ''             // Clear email when opening modal
      this.info.contact_number = ''
      this.add_btn = true;
    },
    modalEditClient(client){
      this.modal_title = 'Update Client'
      this.modal_button = 'Update'
      this.openModalClient()
      this.btn_type = 'edit'
      this.info.first_name = client.first_name
      this.info.last_name = client.last_name
      this.info.email = client.email        // Populate email for editing
      this.info.contact_number = client.contact_number
      this.info.id = client.id
    },
    transaction(client){
      localStorage.setItem("client_name", client.first_name + ' ' + client.last_name);
      this.$router.push({path: '/transaction/'+client.id})
    },
    dateToString(date_data){
      var date = new Date(date_data);
      let date_return = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) 
                        + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) 
                        + '/' + date.getFullYear();
      return date_return;
    },
    getLabel (item) {   
      this.list()
      return item.first_name + ' ' + item.last_name
    },
    updateItems (text) {
      let self = this;
      this.search_value = text;
      axios.get(api.API_URL+`/client?search=${text}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
      ).then(({data})=>{
        self.loader = false;
        self.items = data.data
      }).catch(({ response })=>{
        if(response.data.error.code =='token_could_not_verified'){
          this.$router.push('/login')
        }
      })
    },
    deleteClient(id){
      const token = localStorage.getItem('token');
      this.loader_save = true;
      let self = this;

      Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this client?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        reverseButtons: true,
        focusCancel: true
      }).then((result) => {
        if (result.isConfirmed) {
          axios
            .delete(api.API_URL + "/client/delete/" + id, {
              headers: { Authorization: `Bearer ${token}` }
            })
            .then(() => {
              self.loader_save = false;
              Swal.fire({
                title: "Deleted!",
                text: "Client successfully deleted.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
              });
              self.list();
            })
            .catch((error) => {
              self.loader_save = false;
              try {
                if (error.response.status === 400) {
                  Swal.fire({
                    title: "Error",
                    text: error.response.data.error.message,
                    icon: "error"
                  });
                } else if (error.response.status === 422) {
                  const messages = Object.values(error.response.data).join("\n");
                  Swal.fire({
                    title: "Validation Error",
                    text: messages,
                    icon: "error"
                  });
                }
              } catch (err) {
                Swal.fire({
                  title: "Error",
                  text: "Something went wrong!",
                  icon: "error"
                });
              }
            });
        }
      });

    }
  },
  created() {
    this.list();
    this.role = localStorage.getItem('role_id');
    this.business_id = localStorage.getItem('business_id');
  }
};
</script>

<style>
#client-tbl .btn {
  padding: 5px 10px!important; 
  margin-right:5px;
}
.action {
  text-align: center;
}
#top-tool-bar {
  padding:10px;
}
#add-client {
  float:right;
}
#search {
  width:50%;
}
.pagination li {
  margin-right:20px;
}
.pagination {
  padding: 10px!important;
}
.pagination .page-item.active a {
  font-weight: bold; 
  background-color: #b6aa62!important;
} 
.pagination li a {
  background: #106c9c; 
  padding: 5px; 
  color: #fff!important;
}
#add-client {
  float:right;
}
#no-record {
  font-weight: bold; 
  font-size: 20px;
}
@media screen and (max-width: 600px) {
  .modal {
    width: 100%!important;
  }
}

.action .btn-info{margin: 0 2px;}

table.tbl-style {
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  width: 98%!important;
  margin: 20px auto;
}

table.tbl-style thead {
  background: linear-gradient(45deg, #106c9c, #1e9ac2);
  color: #fff;
}

table.tbl-style thead th {
  padding: 15px;
  text-align: left;
}

table.tbl-style tbody tr {
  border-bottom: 1px solid #eee;
}

table.tbl-style tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

table.tbl-style tbody tr:hover {
  background-color: #f1f1f1;
}

table.tbl-style td {
  padding: 15px;
}

</style>
