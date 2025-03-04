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
              <p-button type="info" if=round @click.native.prevent="modalAddExpenses" id="add-transact">
                 Add Expenses
              </p-button>
            </div>
          </div>

          <h4 v-if="this.from_value == ''" class="report-text-head">Today's Expenses - {{ getDate() }}</h4>
          <h4 v-else class="report-text-head">Reports: From {{ this.from_value  }} to {{this.to_value}}</h4>

          <loader v-if="loader"/>
          <table class="table table-striped" id="transact-tbl">
   <thead>
      <th>Date</th>
      <th>Expenses Name</th>
      <th>Amount</th>
      <th>Note</th>
      <th class="action">Action</th>
   </thead>
   <tbody v-if="expenses.total > 0">
                                    <tr v-for="(expense,index) in expenses.data" :key="index">
                                        <td>{{ expense.date }}</td>
                                        <td>{{ expense.expense_name }}</td>
                                        <td>{{ expense.amount }}</td>
                                        <td>{{ expense.note }}</td>
                                        <td class="action">
                                              <p-button type="info" round @click.native.prevent="modalEditExpense(expense)">
                                                <span class="ti-pencil"></span>
                                              </p-button>
                                              <p-button type="info" round @click.native.prevent="deleteExpense(expense.id)">
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
  <h4>Total Expenses: {{ total_expense.toLocaleString() }}</h4>
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
            v-if="expenses.total > 0"
            >
          </paginate>
          
        </div>
      </card>
    </div>
  </div>

  <Modal :showModal="modalVisible" :title="modal_title" @close="closeModalExpense">
      <loader v-if="loader_save"/> 
      <fg-input
              type="text"
              label="Expenses Name:"
              placeholder="Expenses Name"
              v-model="info.expense_name"
            />

            <fg-input
              type="text"
              label="Amount:"
              placeholder="Amount"
              v-model="info.amount"
            />
            <fg-input
              type="text"
              label="Date:"
              placeholder="Date"
              v-model="info.date"
            />
            <p>
              <label>Notes:</label><br/>
              <textarea v-model="info.notes" id="client-notes">
              </textarea>
            </p>

       <div style="clear:both;">&nbsp;</div>
       <p-button type="info" round @click.native.prevent="addExpense" id="add-transact" v-show="btn_type == 'add'">
            ADD EXPENSES
       </p-button> 
       <p-button type="info" round @click.native.prevent="updateExpense" id="add-transact" v-show="btn_type == 'edit'">
            UPDATE EXPENSES
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
      expenses:[],
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
          expense_name: '',
          amount: '',
          note: ''
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
      total_expense: 0,
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

    
           let from = this.from_value
           let to = this.to_value
           

           self.page = page;
           self.loader = true;

                await axios.get(api.API_URL+`/expense?page=${page}&limit=${limit}&from=${from}&to=${to}`,
                  {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                  }
                ).then(({data})=>{
                  self.loader = false;
                  self.expenses = data.data
                  self.total_page = Math.ceil(data.data.total/limit);
                  self.total_expense = data.total

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
    closeModalExpense() {
      this.modalVisible = false;
    },
    addExpense(){
 
      const token = localStorage.getItem('token');
      this.loader_save = true;
      this.add_btn = false;  
      let self = this;
            axios.post(api.API_URL+'/expense/store', {
                    expense_name: self.info.expense_name,
                    date: self.info.date,
                    amount: self.info.amount,
                    date: self.info.date,
                    note: self.info.notes
                },
                
                {
                 headers: { Authorization: `Bearer ${token}`}
                }
                )
                    .then((data) => {
                      self.loader_save = false;
                      self.notifyVue('top', 'center','success','Transact Successfully Added','ti-announcement')
                      self.list();
                      self.closeModalExpense()
                      self.info.expense_name = ''
                      self.info.amount = ''
                      self.info.date = ''
                      self.info.notes = ''
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
      
                    
    },
    updateExpense(){
      const token = localStorage.getItem('token');
      this.loader_save = true;
      let self = this;
            axios.put(api.API_URL+'/expense/update/'+self.info.id, {
                    expense_name: self.info.expense_name,
                    amount: self.info.amount,
                    date: self.info.date,
                    note: self.info.notes
                },
                
                {
                 headers: { Authorization: `Bearer ${token}`}
                }
                )
                    .then((data) => {
                      self.loader_save = false;
                      self.notifyVue('top', 'center','success','Transact Successfully Updated','ti-announcement')
                      self.list();
                      self.closeModalExpense()
                      self.info.expense_name = ''
                      self.info.amount = ''
                      self.info.date = ''
                      self.info.notes = ''
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
    modalAddExpenses(){
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
      this.modal_title = 'Add Expenses'
      this.modal_button = 'Add'
      this.openModalTransact()
      this.btn_type = 'add'
      this.topay = false;
      this.input_name = ''
    },
    deleteExpense(id){
      const token = localStorage.getItem('token');
      this.loader_save = true;
      let self = this;

      const response = confirm("Are you sure you want to do delete?");

                if (response) {
                  axios.delete(api.API_URL+'/expense/delete/'+id,
                
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
    modalEditExpense(expense){
      this.modal_title = 'Update Expense'
      this.modal_button = 'Update'
      this.openModalTransact()
      this.btn_type = 'edit'
      this.info.id = expense.id
      this.info.date = expense.date
      this.info.expense_name = expense.expense_name
      this.info.amount = expense.amount
      this.info.notes = expense.notes
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
