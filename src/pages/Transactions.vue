<template>
  <div id="page-transactions">
  <div class="row">
    <div class="col-12">
      
      <router-link to="/dashboard" tag="button" class="back-home">Back to Home</router-link>
      <card>
        <div slot="raw-content" class="table-responsive">
          <div class="row" id="top-tool-bar">
            <div class="col-6">
              <!-- New client name filter input -->
              <multiselect
                v-model="selectedClientSearch"
                :options="ClientItems"
                :custom-label="clientLabel"
                :loading="isLoadingClients"
                placeholder="Search client"
                @search-change="fetchClients"
                track-by="id"
                label="first_name"
                class="client-search"
              ></multiselect>
              <date-picker v-model="date_range" placeholder="Select date range" range></date-picker>
              <p-button type="info" round @click.native.prevent="generate" id="generate">
                Generate
              </p-button>
              <div style="clear:both; height: 0;"></div>
            </div>
            <div class="col-6 trans">
              <p-button type="info" round @click.native.prevent="modalAddTransact" id="add-transact">
                Add Sales
              </p-button>
            </div>
          </div>


          <h4 v-if="this.from_value == ''" class="report-text-head">Sales</h4>
          <h4 v-else class="report-text-head">Reports: From {{ this.from_value  }} to {{this.to_value}}</h4>

          <loader v-if="loader"/>
          <table class="table table-striped" id="transact-tbl">
   <thead>
      <th>Date</th>
      <th>Time</th>
      <th>Full Name</th>
      <th>Services</th>
      <th>Status</th>
      <th>Payment</th>
      <th>Total</th>
      <th class="action">Action</th>
   </thead>
   <tbody v-if="transactions.total > 0">
                                    <tr v-for="(transact,index) in transactions.data" :key="index">
                                        <td>{{ transact.date }}</td>
                                        <td>{{ transact.time }}</td>
                                        <td>{{ transact.client ? transact.client.first_name : 'No client' }}</td>
                                        <td>{{ formatServices(transact) }}</td>
                                        <td>{{ transact.status }}</td>
                                        <td>{{ transact.payment_method == '' || transact.status =='Unpaid' ? 'Pending \n to Update' : transact.payment_method}}</td>
                                        <td>{{currency_label}} {{ Number(transact.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
                                        <td class="action">
                                              <p-button type="info" round @click.native.prevent="modalEditTransact(transact)">
                                                <span class="ti-pencil"></span>
                                              </p-button>
                                              <p-button type="info" round @click.native.prevent="deleteTransact(transact.id)">
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
<div class="total-wrap">
  <h4>Total Sales: {{ currency_label }} {{ total_sales.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }) }}</h4>
  <!-- <h4>Cash: {{ cash.toLocaleString() }}</h4>
  <h4>Gcash: {{ gcash.toLocaleString() }}</h4>
  <h4>Bank Transfer: {{ bank.toLocaleString() }}</h4> -->
</div>
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
            v-if="transactions.total > 0"
            >
          </paginate>
          
        </div>
      </card>
    </div>
  </div>

  <Modal :showModal="modalVisible" :title="modal_title" @close="closeModalTransact">
      <loader v-if="loader_save"/> 
      <multiselect
          v-model="selectedClient"
          :options="ClientItems"
          :custom-label="clientLabel"
          :loading="isLoadingClients"
          placeholder="Search client"
          @search-change="fetchClients"
          track-by="id"
          label="first_name"
        ></multiselect>
      <fg-input
              type="date"
              label="Date:"
              placeholder="Date"
              v-model="info.date"
            />
      <fg-input
              type="time"
              label="Time:"
              placeholder="Time"
              v-model="info.time"
       />  
       <div class="w-full mt-4 p-10">
        <div v-for="(service, index) in services" :key="index">
          <div class="flex justify-start ml-2 mt-4">
            <multiselect
              v-model="service.selectedService"
              :options="service.serviceOptions"
              placeholder="Search service"
              @search-change="query => fetchServiceOptions(query, index)"
              track-by="id"
              :custom-label="servicesLabel"
              @input="serviceChanged(service, index)"
              class="services_input"
            ></multiselect>
            {{currency_label}}
            <input
              v-model="service.price"
              placeholder="Price"
              class="w-full py-2 border border-indigo-500 rounded prices"
              @input="price"
              readonly
            />
            <p-button type="info" v-if="index !== 0" round @click.native.prevent="remove(index)" class="trash-service">
              <span class="ti-trash"></span>
            </p-button>
          </div>
          <p-button type="info" v-if="index === services.length - 1" round @click.native.prevent="addMore(index)" class="add-services">Add Service</p-button>
        </div>

        </div>
        
       <div style="clear:both; height: 30px;"></div>
        <p>
        <label>Status:</label><br/>
        <select v-model="info.status">
            <option value="Fully Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partial">Partial</option>
        </select>
       </p>
        <p>
          <label>Client Notes:</label><br/>
          <textarea v-model="info.notes" id="client-notes">
          </textarea>
         </p>
        <fg-input
              type="hidden"
              label=""
              placeholder="Total"
              v-model="info.total"
       />   
        
       <div id="payment-method">
            <label class="cash-label">Payment Method: </label> 
            <select v-model="info.payment_method" class="payment-method">
              <option value="Cash">Cash</option>
              <option value="Gcash">Gcash</option>
              <option value="Bank">Bank Transfer</option>
            </select>
      </div>

       <div id="to-pay" v-if="info.payment_method=='Cash'">
          <label class="cash-label">Cash: </label> 

          <fg-input
                type="text"
                  label=""
                  placeholder="Cash"
                  v-model="info.cash"
                  @input.native="changeCash"
            />
            <div v-if="cashError" class="error-message">{{ cashError }}</div>
          <h4>Change: {{ info.change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</h4>  
        </div>

        <fg-input
               type="number" min="1" step="any" 
                  label="Discount"
                  placeholder="Discount"
                  v-model="info.discount"
            />

            <fg-input
                 type="number" min="1" step="any" 
                  label="Tax"
                  placeholder="Tax"
                  v-model="info.tax"
            />

      <h2 id="grand-total">Total: {{currency_label}}{{ Number(info.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</h2>
      <div style="clear:both;">&nbsp;</div>
       <p-button type="info" round @click.native.prevent="addTransact" id="add-transact" v-show="btn_type == 'add'" v-if="add_btn">
            ADD SALES
       </p-button> 
       <p-button type="info" round @click.native.prevent="updateTransact" id="add-transact" v-show="btn_type == 'edit'">
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
import api  from "@/static/config.json";
import axios from 'axios'
import Loader from "@/components/Loader";
import Modal from '@/components/Modal';
import VAutocomplete from 'v-autocomplete';
import ItemTemplate from '@/components/ItemTemplate.vue';
import Paginate from 'vuejs-paginate'
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';
import store from '@/store';
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";
import Swal from 'sweetalert2';

export default {
  components:{
    Loader,
    Paginate,
    Modal,
    DatePicker,
    VAutocomplete,
    ItemTemplate,
    Multiselect,
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
      transactions:[],
      showAddModal:true,
      modalVisible: false,
      info:{
          id:'',
          client_id:'',
          date: '',
          time: '',
          services:[],
          total: 0,
          status:'',
          notes:'',
          change: 0,
          tax:0,
          discount:0
      },
      modal_title:'',
      modal_button:'',
      btn_type:'',
      client_name:'',
      services: [
        {
          services_name: "",
          price: "",
          selectedService: null,
          serviceOptions: [],
          loading: false,
        },
      ],
      topay:false,
      from_value:'',
      to_value:'',
      total_sales: 0,
      cash:0,
      gcash:0,
      bank:0,
      date_range:'',
      add_btn:true,
      item: {},
      items: [],
      ClientItems: [],
      template: ItemTemplate,
      input_name:'',
      role_id: '',
      selectedClient:'',
      selectedClientSearch: '',
      isLoadingClients:false,
      input_name: '',
      currency_label: '',
      total: 0,
      cashError:''
    }
  },
  computed:{
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
  methods:{
    async list(page = 1) {


        let self = this;
        let limit = 10;
        let url =
          api.API_URL +
          `/transact?page=${page}&limit=${limit}&business_id=${this.user.business_id}`;

        // If a client is selected via the multiselect, filter by its client_id
        if (this.selectedClientSearch && this.selectedClientSearch.id) {
          url += `&client_id=${this.selectedClientSearch.id}`;
        }

        // Always include a date filter
        if (this.date_range && this.date_range.length >= 2) {
          if(this.date_range==","){
            this.from_value = null
            this.to_value = null
          }else{
            const startDate = new Date(this.date_range[0]);
            const endDate = new Date(this.date_range[1]);

            // Now use toLocaleDateString on the Date objects
            this.from_value = startDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });
            this.to_value = endDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });
            url += `&from=${this.from_value}&to=${this.to_value}`;
          }
          
        }


        self.page = page;
        self.loader = true;

        await axios
          .get(url, {
            headers: { Authorization: `Bearer ${this.token}` },
          })
          .then(({ data }) => {
            self.loader = false;
            self.total = data.transactions.total;
            self.transactions = data.transactions;
            self.total_page = Math.ceil(data.transactions.total / limit);
            self.total_sales = parseFloat(data.total_sales);
            // self.cash = data.cash;
            // self.gcash = data.gcash;
            // self.bank = data.bank;
          })
          .catch(({ response }) => {
            if (response.data.error.code === "token_could_not_verified") {
              localStorage.removeItem("token");
              this.$router.push("/login");
            }
          });
      }
      ,

     clickCallback (pageNum){
        console.log(pageNum)
        this.list(pageNum)
    },
    openModalTransact() {
      this.modalVisible = true;
    },
    closeModalTransact() {
      this.modalVisible = false;
    },
    addTransact(){
      const service = this.services;
      const self_cr = this;
      let count_services = 0;
      Object.keys(service).forEach(function(key) {

         if(service[key].services_name==""){
              count_services++;
         }

      });

      let error_count = 0;
      if(this.se==''){
          error_count++
          this.notifyVue('top', 'center','danger','Please enter Client Name','ti-hand-stop')
      }
    
      
  

      if(error_count==0){
        this.loader_save = true;
         this.add_btn = false;  
        let self = this;
            axios.post(api.API_URL+'/transact/store', {
                    client_id: self.selectedClient.id,
                    date: self.info.date,
                    time: self.info.time,
                    status: self.info.status,
                    notes: self.info.notes,
                    total: self.info.total,
                    business_id: self.user.business_id,
                    payment_method: self.info.payment_method,
                    cash: self.info.cash,
                    discount: self.info.discount,
                    tax: self.info.tax,
                    services: self.services
                    .filter(service => service.selectedService)  // only include items with a selection
                    .map(service => service.selectedService)
                },
                
                {
                 headers: { Authorization: `Bearer ${this.token}`}
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
                        self.notifyVue('top', 'center','success','Transact Successfully Added','ti-announcement')
                        self.list();
                        self.closeModalTransact()
                        self.info.date = ''
                        self.info.time = ''
                        self.info.notes = ''
                        self.info.status = ''
                        self.info.total = ''
                        self.services = []
                        self.selectedClient = '' 
                      }
                      
                      self.add_btn = true; 
                      
                    })
                    .catch((error) => {
                      try {
                           self.loader_save = false;
                          if(error.response.status==400){
                            alert(error.response.data.error.message)
                            this.notifyVue('top', 'center','danger',error.response.data.error.message,'ti-hand-stop')
                          }else if(error.response.status==422){
                            for (const [key, value] of Object.entries(error.response.data)) {
                                this.notifyVue('top', 'center','danger',value,'ti-hand-stop')
                            }
                          }
                          this.add_btn = true;  
                        }
                        catch(err) {
                        
                        }
                    });
      } 
                    
    },
    updateTransact(){

      this.loader_save = true;
      let self = this;

            axios.put(api.API_URL+'/transact/update/'+self.info.id, {
                   client_id: self.selectedClient.id,
                    date: self.info.date,
                    time: self.info.time,
                    status: self.info.status,
                    notes: self.info.notes,
                    total: self.info.total,
                    business_id: self.user.business_id,
                    payment_method: self.info.payment_method,
                    cash: self.info.cash,
                    discount: self.info.discount,
                    tax: self.info.tax,
                    services: self.services
                    .filter(service => service.selectedService)  // only include items with a selection
                    .map(service => service.selectedService)
                },
                
                {
                 headers: { Authorization: `Bearer ${this.token}`}
                }
                )
                    .then((data) => {
                      self.loader_save = false;
                      self.notifyVue('top', 'center','success','Transact Successfully Updated','ti-announcement')
                      self.list();
                      self.closeModalTransact()
                      self.info.first_name = ''
                      self.info.last_name = ''
                      self.info.contact_number = ''
                      self.selectedClient = ''
                    })
                    .catch((error) => {
                      try {
                           self.loader_save = false;
                          if(error.response.status==400){
                            alert(error.response.data.error.message)
                            this.notifyVue('top', 'center','danger',error.response.data.error.message,'ti-hand-stop')
                          }else if(error.response.status==422){
                            for (const [key, value] of Object.entries(error.response.data)) {
                                this.notifyVue('top', 'center','danger',value,'ti-hand-stop')
                            }
                            
                           
                          }
                        }
                        catch(err) {
                        
                        }
                    });
    },
    notifyVue(verticalAlign, horizontalAlign,type,msg,icon) {
      const color = Math.floor(Math.random() * 4 + 1);
      this.$notify({
        title:msg,
        icon: icon,
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: type,
      });
    },
    generate() {
    // Ensure a valid date range exists.
    if (!this.date_range || this.date_range.length < 2) {
      const today = new Date();
      this.date_range = [today, today];
    }
    this.list();
  },

    modalAddTransact(){
      this.info.date = ''
      this.info.time = ''
      this.selectedClient = ''
      this.info.total = 0
      this.info.notes = '';  
      this.info.date = this.getDateDash();
      this.info.time = this.getTime();
      this.modal_title = 'Add Sales'
      this.modal_button = 'Add'
      this.openModalTransact()
      this.btn_type = 'add'
      this.topay = false;
      this.input_name = ''
      this.info.change = 0
    },
    deleteTransact(id){
      this.loader_save = true;
      let self = this;


      Swal.fire({
          title: "Are you sure?",
          text: "Do you really want to delete this transaction?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!"
      }).then((result) => {
          if (result.isConfirmed) {
              
              axios.delete(api.API_URL+'/transact/delete/'+id,
                  
                  {
                  headers: { Authorization: `Bearer ${this.token}`}
                  }
                  )
                      .then((data) => {
                        self.loader_save = false;
                        self.notifyVue('top', 'center','success','Transact Successfully Deleted','ti-announcement')
                        self.list();
                      })
                      .catch((error) => {
                        try {
                            self.loader_save = false;
                            if(error.response.status==400){
                              alert(error.response.data.error.message)
                              this.notifyVue('top', 'center','danger',error.response.data.error.message,'ti-hand-stop')
                            }else if(error.response.status==422){
                              for (const [key, value] of Object.entries(error.response.data)) {
                                  this.notifyVue('top', 'center','danger',value,'ti-hand-stop')
                              }
                              
                            
                            }
                          }
                          catch(err) {
                          
                          }
                      });
          }
      });

    },
    addMore(index) {
      this.services.push({
        services_name: "",
        price: "",
        selectedService: null,
        serviceOptions: [],
        loading: false,
      });

      this.fetchServiceOptions('',(index + 1));
    },
    remove(index) {
      this.services.splice(index, 1);
      this.price(); 
    },
    getDate(){
      const today = new Date();
      const yyyy = today.getFullYear();
      let mm = today.getMonth() + 1; // Months start at 0!
      let dd = today.getDate();

      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;

      const formattedToday = mm + '/' + dd + '/' + yyyy;
      return formattedToday;
    },
    getTime(){
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      // Ensure two-digit formatting for hours and minutes
      const formattedHours = hours < 10 ? '0' + hours : hours;
      const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
      return `${formattedHours}:${formattedMinutes}`;
    },
    price: function () {
          let total = 0;
          var p = this.services;
          for (var key in p) {
              if (p.hasOwnProperty(key)) {
                  total = total + parseFloat(p[key].price);
              }
          }

          this.info.total = total
    },
    isNumber(value) {
        return typeof value === 'number';
    },
    format_price: function(newValue) {
      const result = newValue.replace(/\D/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return result;
    },
    redirectView(client){
       localStorage.setItem("client_name", client.first_name + ' ' + client.last_name);
        this.$router.push({path: '/transaction/'+client.id})
    },
    getLabel(item) {
      if (!item) return '';
      this.info.client_id = item.id;
      return item.first_name + ' ' + item.last_name;
    },
    updateItems (text) {

      this.info.client_id = ''
      let self = this;
      self.loader_save = true;

               axios.get(api.API_URL+`/client?search=${text}&business_id=${this.user.business_id}`,
                  {
                    headers: { Authorization: `Bearer ${this.token}` }
                  }
                ).then(({data})=>{
                  self.loader_save = false;
                  if(data.total==0){
                    this.notifyVue('top', 'center','danger','Client not found','ti-hand-stop')
                  }
                  self.items = data.data


                }).catch(({ response })=>{
                      if(response.data.error.code =='token_could_not_verified'){
                          this.$router.push('/login')
                      }
                })
    },
    modalEditTransact(transact) {
      this.modal_title = 'Update Sales';
      this.modal_button = 'Update';
      this.openModalTransact();
      this.btn_type = 'edit';
      this.info.date = transact.date;
      this.info.time = transact.time;
      this.info.status = transact.status;
      this.info.notes = transact.notes;
      this.info.total = transact.total;
      this.info.payment_method = transact.payment_method;
      this.info.client_id = transact.client_id;
      
      // Auto-populate the client multiselect
      this.selectedClient = transact.client ? transact.client : null;
      
      this.info.id = transact.id;
      // Ensure the services are populated (assuming transact.services is a JSON string)
       // Map the parsed services to the required format for multiselect
       this.services = transact.transaction_items.map(item => ({
        services_name: item.service.name,
        price: item.service.price,
        selectedService: item.service,
        serviceOptions: [],  // You can load options later if needed
        loading: false
      }));


      this.topay = true;
      this.info.cash = 0;
      this.info.change = 0;
    },
    fetchClients(searchText) {
      this.isLoadingClients = true;
      axios
        .get(api.API_URL + `/client?search=${searchText}&business_id=${this.user.business_id}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        .then(({ data }) => {
          this.ClientItems = data.data;
          this.isLoadingClients = false;
        })
        .catch((error) => {
          console.error("Error fetching clients:", error);
          this.isLoadingClients = false;
        });
    },
    clientLabel(client) {
      return `${client.first_name} ${client.last_name}`;
    },
    servicesLabel(service) {
       return service ? service.name : '';
    },
    getDateDash() {
      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    fetchServiceOptions(query, index) {
        // Set loading flag if desired
        this.services[index].loading = true;
        axios.get(api.API_URL + `/service?page=1&limit=10&search=${query}&business_id=${this.user.business_id}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        .then(({ data }) => {
          // Assume your API returns an object with a 'data' property containing the list of services
          this.$set(this.services[index], 'serviceOptions', data.data);
          this.services[index].loading = false;
        })
        .catch((error) => {
          console.error(error);
          this.services[index].loading = false;
        });
      },

      // Called when a service is selected from the multiselect
      serviceChanged(service, index) {
        if (service.selectedService) {
          // Update the service name and price from the selected option
          service.services_name = service.selectedService.services_name;
          service.price = service.selectedService.price;
          this.price(); // recalc total if needed
        } else {
          // Reset if no selection
          service.services_name = "";
          service.price = "";
          this.price();
        }
      },
      changeCash(event) {
        // Sanitize input and prevent invalid characters
        let cashValue = event.target.value
          .replace(/[^0-9.]/g, '') // Remove non-numeric characters
          .replace(/(\..*)\./g, '$1'); // Allow only one decimal point

        // Update model with sanitized value
        this.info.cash = cashValue;

        // Validate numeric format
        if (!/^(\d+\.?\d*|\.\d+)$/.test(cashValue)) {
          this.cashError = 'Please enter a valid number';
          this.info.change = 0;
          return;
        }

        // Validate numeric value
        const number = parseFloat(cashValue);
        if (isNaN(number)) {
          this.cashError = 'Invalid number format';
          this.info.change = 0;
          return;
        }

        // Clear error if valid
        this.cashError = '';
        
        // Calculate change
        const total = parseFloat(this.info.total);
        this.info.change = number - total;
      },
      formatServices(transaction) {
        if (transaction.transaction_items && transaction.transaction_items.length) {
          return transaction.transaction_items.map(item => item.service.name).join(', ');
        }
        return 'No Service';
      },
      cancel(){
         this.closeModalTransact();
         this.info.date = ''
         this.info.time = ''
         this.info.notes = ''
         this.info.status = ''
         this.info.total = ''
         this.services = []
         this.selectedClient = '' 
      }

  },
  created() {
      this.list();
      this.client_name = localStorage.getItem('client_name');
      this.info.client_id = this.$route.params.id;
      this.role_id = localStorage.getItem('role_id');
      this.fetchClients('');
      this.fetchServiceOptions('',0);
      const plainSettings = JSON.parse(JSON.stringify(this.settings));
      this.currency_label = plainSettings.currency_symbol;
  }
};
</script>
<style>
#transact-tbl .btn{padding: 5px 10px!important; margin-right:5px;}
.action{text-align: center;}
#top-tool-bar{padding:10px;}
#add-transact{float:right;}
#search{width:50%;}
.pagination li{margin-right:20px;}
.pagination{padding: 10px!important;}
.pagination .page-item.active a{font-weight: bold; background-color: #b6aa62!important;} 
.pagination li a{background: #106c9c; padding: 5px; color: #fff!important; }
#add-transact{float:right;}
#no-record{font-weight: bold; font-size: 20px;}
.client-name{margin-left: 10px;}
#page-transactions .modal{overflow-y: scroll!important; height: 560px;}
.trash-service{margin-left: 10px;}
#grand-total{float:right;}
.add-services{margin-top:30px;}
.cash-label{font-weight: bold; font-size: 18px; margin-right: 10px;}
#client-notes{width:100%;}
#generate{margin-left: 10px;}
.report-text-head{padding-left: 16px; font-size: 16px;}
.client-search{display: inline-block; width: 39%;}
.back-home{margin-bottom: 20px; background: #106c9c; color:#fff; border:none;}
.total-wrap{margin-left:10px; margin-bottom: 30px;}
.total-wrap h4{margin-top: 0px!important;}
.services_input{display: inline-block!important; width: 48%!important; margin-right: 9px!important;}
#payment-method{padding:20px 0;}
.prices{border:none!important;}
#cancel{float: right; margin-right:5px;}
</style>
