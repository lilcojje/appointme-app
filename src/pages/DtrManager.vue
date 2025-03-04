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
          </div>
          <loader v-if="loader"/>
          <table class="table table-striped" id="client-tbl">
   <thead>
      <th>Name</th>
      <th class="action">Action</th>
   </thead>
   <tbody v-if="staffs.total > 0">
                                    <tr v-for="(staff,index) in staffs.data" :key="index">
                                        <td>{{ staff.name }}</td>
                                        <td class="action">
                                              <p-button type="info" round @click.native.prevent="dtrView(staff)">
                                                <span class="ti-eye"></span>
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
            v-if="staffs.total > 0"
            >
          </paginate>
        </div>
      </card>
    </div>
  </div>


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

export default {
  components:{
    Loader,
    Paginate,
    Modal,
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
      staffs:[],
      showAddModal:true,
      modalVisible: false,
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
    }
  },
  methods:{
    async list(page=1){
           let self = this;
           let limit=10;
           let search_val = this.search_value

           self.page = page;
           self.loader = true;

                await axios.get(api.API_URL+`/staff?page=${page}&limit=${limit}&search=${search_val}`,
                  {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                  }
                ).then(({data})=>{
                  self.loader = false;
                  self.staffs = data
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
      this.info.contact_number = client.contact_number
      this.info.id = client.id
    },
    dtrView(staff){
        localStorage.setItem("staff_name", staff.name);
        this.$router.push({path: '/dtr/'+staff.id})
    },dateToString(date_data){
      var date = new Date(date_data);
      let date_return = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear();
      return date_return;
    },
    getLabel (item) {   
      this.list()
      return item.name + ' '
    },
    updateItems (text) {
      let self = this;
      this.search_value = text;
               axios.get(api.API_URL+`/staff?search=${text}`,
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
    }
  },
  created() {
      this.list();
      this.role = localStorage.getItem('role_id');
  }
};
</script>
<style>
#client-tbl .btn{padding: 5px 10px!important; margin-right:5px;}
.action{text-align: center;}
#top-tool-bar{padding:10px;}
#add-client{float:right;}
#search{width:50%;}
.pagination li{margin-right:20px;}
.pagination{padding: 10px!important;}
.pagination .page-item.active a{font-weight: bold; background-color: #b6aa62!important;} 
.pagination li a{background: #106c9c; padding: 5px; color: #fff!important; }
#add-client{float:right;}
#no-record{font-weight: bold; font-size: 20px;}
@media screen and (max-width: 600px) {
  .modal{width: 100%!important;}
}

</style>
