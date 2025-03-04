<template>
  <div id="page-client">
  <div class="row">
    <div class="col-12">
      <card>
        <div slot="raw-content" class="table-responsive">
          <div class="row" id="top-tool-bar">
            <div class="col-6">
            </div>
            <div class="col-6">
              <p-button type="info" if=round @click.native.prevent="modalViewDtr('time_out')" id="add-dtr" :disabled="timeout_btn">
                 Time Out
              </p-button>
              <p-button type="info" if=round @click.native.prevent="modalViewDtr('time_in')" id="add-dtr" :disabled="timein_btn">
                 Time In
              </p-button>
            </div>
          </div>
          <loader v-if="loader"/>
          <table class="table table-striped tbl-style" id="client-tbl">
   <thead>
      <th>Date</th>
      <th>Login</th>
      <th>Logout</th>
      <th>Late</th>
   </thead>
   <tbody v-if="dtrs.total > 0">
                                    <tr v-for="(dtr,index) in dtrs.data" :key="index">
                                      
                                        <td>{{ dtr.date }}</td>
                                        <td>{{ convertTo12HourFormat(dtr.time_in) }}</td>
                                        <td>{{ convertTo12HourFormat(dtr.time_out) }}</td>
                                        <td>{{ dtr.late }} Mins</td>
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
            v-if="dtrs.total > 0"
            >
          </paginate>
        </div>
      </card>
    </div>
  </div>

    <Modal :showModal="modalVisible" :title="modal_title" @close="closeModalDtr">
      <loader v-if="loader_save"/> 
      <h5>Date: {{ date }}</h5>
      <h5>Time: {{ formattedTime }}</h5>
      <h5>Selfie to Camera:</h5>
    <button @click="openCamera" id="open-camera">Open Camera</button>
    <div v-if="photo">
      <img :src="photo" alt="Captured photo" id="captured-img"/>
    </div>
    <div style="clear:both;">&nbsp;</div>
    <p-button type="info" round @click.native.prevent="addDtr" id="add-client" v-if="camera_open && submit_login">
            Time-In
    </p-button> 
    <p-button type="info" round @click.native.prevent="outDtr" id="add-client" v-if="camera_open && submit_logout">
            Time-Out
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
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
      dtrs:[],
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
      image_view:'',
      photo: null,
      currentTime: new Date(),
      camera_open: false,
      timein_btn:true,
      timeout_btn:true,
      date:'',
      time_in:'',
      user_id:'',
      submit_login: false,
      submit_logout: false,
    }
  },
  methods:{
    async list(page=1){
           let self = this;
           let limit=10;
           let user_id = localStorage.getItem('user_id');

           self.page = page;
           self.loader = true;

                await axios.get(api.API_URL+`/dtr?page=${page}&limit=${limit}&user_id=${user_id}`,
                  {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                  }
                ).then(({data})=>{
                  self.loader = false;
                  self.dtrs = data
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
    openModalDtr() {
      this.modalVisible = true;
    },
    closeModalDtr() {
      this.modalVisible = false;
    },
    addDtr(){
      
      const token = localStorage.getItem('token');
      
      let self = this;
      this.loader_save = true;
      this.timein_btn = false;
      this.submit_login = false;
            axios.post(api.API_URL+'/dtr/store', {
                   date : self.date,
                   time_in : self.time_in,
                   user_id : self.user_id,
                   selfie : self.photo,
                },
                
                {
                 headers: { Authorization: `Bearer ${token}`}
                }
                )
                    .then((data) => {
                      self.loader_save = false;
                      self.notifyVue('top', 'center','success','DTR Successfully Added','ti-announcement')
                      self.list();
                      self.loader_save = false;
                      self.timein_btn = true; 
                      self.timeout_btn = false; 
                      self.modalVisible = false;
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
                            
                            self.timein_btn = true;  
                           
                          }
                        }
                        catch(err) {
                        
                        }
                    });

                    
    },
    updateDtr(){
      const token = localStorage.getItem('token');
      this.loader_save = true;
      let self = this;
      this.submit_logout = false;
            axios.put(api.API_URL+'/dtr/update/'+self.info.id, {
                    first_name: self.info.first_name,
                    last_name: self.info.last_name,
                    contact_number: self.info.contact_number,
                },
                
                {
                 headers: { Authorization: `Bearer ${token}`}
                }
                )
                    .then((data) => {
                      self.loader_save = false;
                      self.notifyVue('top', 'center','success','Client Successfully Updated','ti-announcement')
                      self.list();
                      self.closeModalDtr()
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
    outDtr(){
      const token = localStorage.getItem('token');
      this.loader_save = true;
      this.submit_logout = false;
      let self = this;
            axios.post(api.API_URL+'/dtr/out', {
                    time_out: self.time_out,
                    user_id: self.user_id,
                    date: self.date,
                    selfie: self.photo,
                },
                
                {
                 headers: { Authorization: `Bearer ${token}`}
                }
                )
                    .then((data) => {
                      self.loader_save = false;
                      self.notifyVue('top', 'center','success','Successfully Logout','ti-announcement')
                      self.list();
                      self.closeModalDtr();
                      self.timeout_btn = true; 
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
    search(){
        this.list()
    },
   modalViewDtr(time){
     this.photo = '';
     const currentTime = new Date();
     const hours = currentTime.getHours();
     const minutes = currentTime.getMinutes();
     const seconds = currentTime.getSeconds();
    //  const curtime =  this.currentTime.toISOString().slice(0, 19).replace('T', ' ');

        const options = { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' };

        // Get the date in 'MM/DD/YYYY' format and then reformat it to 'YYYY-MM-DD'
        const current_date = new Intl.DateTimeFormat('en-US', options).format(currentTime).replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2');
   
     this.date = current_date;

    if(time=='time_in'){
        this.modal_title = 'DTR Time-In'
        this.time_in = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        this.submit_login = true;
    }else{
        this.modal_title = 'DTR Time-Out'
        this.time_out = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        this.submit_login = false;
        this.submit_logout = true;
    }

     
     this.openModalDtr()

      

    },
    modalEditDtr(client){
      this.modal_title = 'Update Client'
      this.modal_button = 'Update'
      this.openModalDtr()
      this.btn_type = 'edit'
      this.info.first_name = client.first_name
      this.info.last_name = client.last_name
      this.info.contact_number = client.contact_number
      this.info.id = client.id
    },
    transaction(client){
        localStorage.setItem("client_name", client.first_name + ' ' + client.last_name);
        this.$router.push({path: '/transaction/'+client.id})
    },dateToString(date_data){
      var date = new Date(date_data);
      let date_return = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear();
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
    },deleteDtr(id){
      const token = localStorage.getItem('token');
      this.loader_save = true;
      let self = this;

      const response = confirm("Are you sure you want to do delete?");

                if (response) {
                  axios.delete(api.API_URL+'/client/delete/'+id,
                
                {
                 headers: { Authorization: `Bearer ${token}`}
                }
                )
                    .then((data) => {
                      self.loader_save = false;
                      self.notifyVue('top', 'center','success','Client Successfully Deleted','ti-announcement')
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
    async openCamera() {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera
        });
        this.photo = image.dataUrl; // Save the image URL to display
        this.camera_open = true;
      } catch (error) {
        console.error('Camera error:', error);
      }
    },
    convertTo12HourFormat(time) {
      // Check if time is a valid string before splitting
      if (!time || typeof time !== 'string') {
        return ''; // Handle invalid input gracefully
      }

      const [hours, minutes] = time.split(':');

      // Handle cases where the time doesn't split correctly
      if (!hours || !minutes) {
        return ''; // Handle invalid time format
      }

      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      date.setSeconds(0); // Set seconds to 0 to disable them

      // Use toLocaleTimeString to convert to 12-hour format without seconds
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    },
    updateTime() {
      this.currentTime = new Date(); // Update the current time
    },
    checkCheckin() {
       let self = this;
       let user_id = localStorage.getItem('user_id');
       const currentTime = new Date();
        const options = { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' };

        // Get the date in 'MM/DD/YYYY' format and then reformat it to 'YYYY-MM-DD'
        const current_date = new Intl.DateTimeFormat('en-US', options).format(currentTime).replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2');

       axios.get(api.API_URL+`/dtr/check-in?user_id=${user_id}&date=${current_date}`,
                  {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                  }
                ).then(({data})=>{
                  
                  if(data.success==false){
                    self.timein_btn = false;
                  }else{
                    self.timein_btn = true;
                  }

                }).catch(({ response })=>{
                      if(response.data.error.code =='token_could_not_verified'){
                          this.$router.push('/login')
                      }
                })
    },
    checkCheckOut() {
       let self = this;
       let user_id = localStorage.getItem('user_id');
       const currentTime = new Date();
        const options = { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' };

        // Get the date in 'MM/DD/YYYY' format and then reformat it to 'YYYY-MM-DD'
        const current_date = new Intl.DateTimeFormat('en-US', options).format(currentTime).replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2');

       axios.get(api.API_URL+`/dtr/check-out?user_id=${user_id}&date=${current_date}`,
                  {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                  }
                ).then(({data})=>{
                  
                  if(data.success==true){
                    self.timeout_btn = false;
                  }else{
                    self.timeout_btn = true;  
                    
                  }

                }).catch(({ response })=>{
                      if(response.data.error.code =='token_could_not_verified'){
                          this.$router.push('/login')
                      }
                })
    }
  },
  created() {
      this.checkCheckin();
      this.checkCheckOut();
      this.list();
      this.role = localStorage.getItem('role_id');
      this.user_id = localStorage.getItem('user_id');
      this.updateTime();
      setInterval(this.updateTime, 1000); // Update every second
  },
  computed: {
    formattedTime() {
      const options = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      };
      return this.currentTime.toLocaleString('en-US', options);
    },
  },

};
</script>
<style>
#client-tbl .btn{padding: 5px 10px!important; margin-right:5px;}
.action{text-align: center;}
#top-tool-bar{padding:10px;}
#search{width:50%;}
.pagination li{margin-right:20px;}
.pagination{padding: 10px!important;}
.pagination .page-item.active a{font-weight: bold; background-color: #b6aa62!important;} 
.pagination li a{background: #106c9c; padding: 5px; color: #fff!important; }
#add-dtr{float:right;  margin-left: 10px;}
#no-record{font-weight: bold; font-size: 20px;}
@media screen and (max-width: 600px) {
  .modal{width: 100%!important;}
}
#captured-img{width:100%;}
#open-camera{margin-bottom: 15px; background-color: #008080; border-color: #008080; color: #FFFFFF;  opacity: 1; box-sizing: border-box;
  border-width: 2px;
  font-size: 12px;
  font-weight: 600;
  padding: 0.5rem 18px;
  line-height: 1.75;
  text-transform: uppercase;
  border-radius: 30px;
  }
</style>
