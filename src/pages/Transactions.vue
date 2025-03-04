<template>
  <div id="page-transactions">
  <div class="row">
    <div class="col-12">
      
      <router-link to="/dashboard" tag="button" class="back-home">Back to Home</router-link>
      <card>
        <div slot="raw-content" class="table-responsive">
          <div class="row" id="top-tool-bar">
            <div class="col-6">
              <div v-if="role_id==1">
                <date-picker v-model="date_range" placeholder="Select date range" range></date-picker>
                <p-button type="info" round @click.native.prevent="generate" id="generate">Generate</p-button>
                <div style="clear:both; height: 0;"></div>
              </div>
            </div>
            <div class="col-6 trans">
              <p-button type="info" if=round @click.native.prevent="modalAddTransact" id="add-transact">
                 Add Transaction
              </p-button>
            </div>
          </div>

          <h4 v-if="this.from_value == ''" class="report-text-head">Today's Transactions - {{ getDate() }}</h4>
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
                                        <td v-if="transact.clients.first_name !== null && transact.clients.last_name !== null">{{ transact.clients.first_name }} {{ transact.clients.last_name }}</td>
                                        <td>{{ transact.formated_service }}</td>
                                        <td>{{ transact.status }}</td>
                                        <td>{{ transact.payment_method == '' || transact.status =='Unpaid' ? 'Pending \n to Update' : transact.payment_method}}</td>
                                        <td>{{ transact.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }}</td>
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
  <h4>Total Sales: {{ total_sales.toLocaleString() }}</h4>
  <h4>Cash: {{ cash.toLocaleString() }}</h4>
  <h4>Gcash: {{ gcash.toLocaleString() }}</h4>
  <h4>Bank Transfer: {{ bank.toLocaleString() }}</h4>
</div>

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
      <v-autocomplete :items="items" v-model="input_name" :get-label="getLabel" :component-item='template' @update-items="updateItems" placeholder="Enter Name" class="autocomplete">
      </v-autocomplete> 
      <fg-input
              type="text"
              label="Date:"
              placeholder="Date"
              v-model="info.date"
            />
      <fg-input
              type="text"
              label="Time:"
              placeholder="Time"
              v-model="info.time"
       />  
       <div class="w-full mt-4 p-10">
          <div v-for="(service, index) in services" :key="index">
            <div class="flex justify-start ml-2 mt-4">
              <input
                v-model="service.services_name"
                placeholder="Service"
                class="w-full py-2 border border-indigo-500 rounded"
              />
              <input
                v-model="service.price"
                placeholder="Price"
                class="w-full py-2 border border-indigo-500 rounded"
                @input="price"
              />
              <p-button type="info" round @click.native.prevent="remove(index)" class="trash-service"><span class="ti-trash"></span></p-button>
            </div>
          </div>
        </div>
        <p-button type="info" round @click.native.prevent="addMore()" class="add-services">Add Service</p-button>
       <div style="clear:both; height: 30px;"></div>
        <p>
        <label>Status:</label><br/>
        <select v-model="info.status">
            <option value="Unpaid">Unpaid</option>
            <option value="Fully Paid">Fully Paid</option>
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

       <div id="to-pay" v-show="topay">
          <label class="cash-label">Cash: </label> 
          <input
                  type="text"
                  label=""
                  placeholder="Cash"
                  v-model="info.cash"
                  @change="cash"
          /> 
          <h4>Change: {{ info.change.toLocaleString() }}</h4>  
      </div>

       <h2 id="grand-total">Total: {{info.total.toLocaleString()}}</h2>
       <div style="clear:both;">&nbsp;</div>
       <p-button type="info" round @click.native.prevent="addTransact" id="add-transact" v-show="btn_type == 'add'" v-if="add_btn">
            SAVE TRANSACTION
       </p-button> 
       <p-button type="info" round @click.native.prevent="updateTransact" id="add-transact" v-show="btn_type == 'edit'">
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
import VAutocomplete from 'v-autocomplete';
import ItemTemplate from '@/components/ItemTemplate.vue';
import Paginate from 'vuejs-paginate'
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';

export default {
  components:{
    Loader,
    Paginate,
    Modal,
    DatePicker,
    VAutocomplete,
    ItemTemplate
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
      },
      modal_title:'',
      modal_button:'',
      btn_type:'',
      client_name:'',
      services: [
        {
          services_name: "",
          price: "",
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
      template: ItemTemplate,
      input_name:'',
      role_id: ''
    }
  },
  methods:{
    async list(page=1){
           let self = this;
           let limit=10;

           const range_data = this.date_range;

           if(this.date_range!=""){
               this.from_value = range_data[0].toLocaleDateString("en-US", { 
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })

               this.to_value = range_data[1].toLocaleDateString("en-US", { 
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
           }
           

           let from = this.from_value == '' ? this.getDate() : this.from_value
           let to = this.to_value == '' ? this.getDate() : this.to_value
           let client_id = this.$route.params.id
           

           self.page = page;
           self.loader = true;

                await axios.get(api.API_URL+`/report?page=${page}&limit=${limit}&from=${from}&to=${to}`,
                  {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                  }
                ).then(({data})=>{
                  self.loader = false;
                  self.transactions = data.data
                  self.total_page = Math.ceil(data.data.total/limit);
                  self.total_sales = data.total
                  self.cash = data.cash
                  self.gcash = data.gcash
                  self.bank = data.bank

                }).catch(({ response })=>{
                  if(response.data.error.code =='token_could_not_verified'){
                              localStorage.removeItem("token");
                              this.$router.push('/login')
                  }
                })
     },

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
      if(this.info.client_id==''){
          error_count++
          this.notifyVue('top', 'center','danger','Please enter Client Name','ti-hand-stop')
      }
    
      
    
      if(count_services>0){
        error_count++
        this.notifyVue('top', 'center','danger','Please enter Services','ti-hand-stop')
      }

      const token = localStorage.getItem('token');

      if(error_count==0){
        this.loader_save = true;
      this.add_btn = false;  
      let self = this;
      let client_id = this.info.client_id
            axios.post(api.API_URL+'/transact/store', {
                    client_id: client_id,
                    date: self.info.date,
                    time: self.info.time,
                    status: self.info.status,
                    notes: self.info.notes,
                    services:self.services,
                    total: self.info.total,
                    payment_method: self.info.payment_method
                },
                
                {
                 headers: { Authorization: `Bearer ${token}`}
                }
                )
                    .then((data) => {
                      self.loader_save = false;
                      self.notifyVue('top', 'center','success','Transact Successfully Added','ti-announcement')
                      self.list();
                      self.closeModalTransact()
                      self.info.date = ''
                      self.info.time = ''
                      self.info.notes = ''
                      self.info.status = ''
                      self.info.total = ''
                      self.services = []
                      self.add_btn = true; 
                      self.info.client_id = '' 
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
                            
                            this.add_btn = true;  
                          }
                        }
                        catch(err) {
                        
                        }
                    });
      } 
                    
    },
    updateTransact(){
      const token = localStorage.getItem('token');
      this.loader_save = true;
      let self = this;
      let client_id = this.info.client_id
            axios.put(api.API_URL+'/transact/update/'+self.info.id, {
                    client_id: client_id,
                    date: self.info.date,
                    time: self.info.time,
                    status: self.info.status,
                    notes: self.info.notes,
                    services:self.services,
                    total: self.info.total,
                    payment_method: self.info.payment_method
                },
                
                {
                 headers: { Authorization: `Bearer ${token}`}
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
    generate(){
        this.list()
    },
    modalAddTransact(){
      this.info.date = ''
      this.info.time = ''
      this.info.client_id = ''
      this.info.total = 0
      this.services = [
        {
          services_name: "",
          price: "",
        },
      ]
      this.info.notes = '';  
      this.info.date = this.getDate();
      this.info.time = this.getTime();
      this.modal_title = 'Add Transaction'
      this.modal_button = 'Add'
      this.openModalTransact()
      this.btn_type = 'add'
      this.topay = false;
      this.input_name = ''
    },
    deleteTransact(id){
      const token = localStorage.getItem('token');
      this.loader_save = true;
      let self = this;

      const response = confirm("Are you sure you want to do delete?");

                if (response) {
                  axios.delete(api.API_URL+'/transact/delete/'+id,
                
                {
                 headers: { Authorization: `Bearer ${token}`}
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
                } else {
                   
                }

    },
    addMore() {
      this.services.push({
        services_name: "",
        price: "",
      });
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
      const today = new Date();
      const formattedTime = today.toLocaleTimeString().replace(/:\d+ /, ' ');
      return formattedTime;
    },
    price: function () {
          let total = 0;
          var p = this.services;
          for (var key in p) {
              if (p.hasOwnProperty(key)) {
                  total = total + parseInt(p[key].price);
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
    getLabel (item) {   
      this.info.client_id = item.id

      return item.first_name + ' ' + item.last_name
    },
    updateItems (text) {

      this.info.client_id = ''
      let self = this;
      self.loader_save = true;

               axios.get(api.API_URL+`/client?search=${text}`,
                  {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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
    modalEditTransact(transact){
      this.modal_title = 'Update Transaction'
      this.modal_button = 'Update'
      this.openModalTransact()
      this.btn_type = 'edit'
      this.info.date = transact.date
      this.info.time = transact.time
      this.info.status = transact.status
      this.info.notes = transact.notes
      this.info.total = transact.total
      this.info.payment_method = transact.payment_method
      this.info.client_id = transact.client_id
      this.input_name = transact.clients
      this.info.id = transact.id
      this.services = JSON.parse(transact.services)
      this.topay = true;
      this.info.cash = 0;
      this.info.change = 0;
    },
  },
  created() {
      this.list();
      this.client_name = localStorage.getItem('client_name');
      this.info.client_id = this.$route.params.id;
      this.role_id = localStorage.getItem('role_id');
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
.cash-label{font-weight: bold; font-size: 22px; margin-right: 10px;}
#client-notes{width:100%;}
#generate{margin-left: 10px;}
.report-text-head{padding-left: 16px; font-size: 16px;}
.back-home{margin-bottom: 20px; background: #106c9c; color:#fff; border:none;}
.total-wrap{margin-left:10px; margin-bottom: 30px;}
.total-wrap h4{margin-top: 0px!important;}
</style>
