<template>
  <div id="page-category">
  <div class="row">
    <div class="col-12">
      <card>
        <div slot="raw-content" class="table-responsive">
          <div class="row" id="top-tool-bar">
            <div class="col-6">
               <input type="text" v-model="search_value" @input="search" id="search">
            </div>
            <div class="col-6">
               <p-button class="tool-btn" type="info" round @click.native.prevent="modalAddCategory" id="add-categories">
                  Add Categories
                </p-button>
                <p-button class="tool-btn" type="info" round @click.native.prevent="redirectToser" id="add-service">
                  Services
                </p-button>
              </div>
          </div>
          <loader v-if="loader"/>
          <table class="table table-striped tbl-style" id="category-tbl">
   <thead>
      <th>Category Name</th>
      <th>Description</th>
      <th class="action">Action</th>
   </thead>
   <tbody v-if="categories.total > 0">
      <tr v-for="(category,index) in categories.data" :key="index">
          <td>{{ category.name }}</td>
          <td>{{ category.description }}</td>
          <td class="action">
            <p-button type="info" round @click.native.prevent="modalEditCategory(category)">
              <span class="ti-pencil"></span>
            </p-button>
            <p-button type="info" round @click.native.prevent="deleteCategory(category.id)">
                <span class="ti-trash"></span>
            </p-button> 
          </td>
      </tr>
   </tbody>
   <tbody v-else>
      <tr>
          <td align="center" colspan="3" id="no-record">No record found.</td>
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
            v-if="categories.total > 0"
            >
          </paginate>
        </div>
      </card>
    </div>
  </div>

    <Modal :showModal="modalVisible" :title="modal_title" @close="closeModalCategory">
      <loader v-if="loader_save"/> 
      <fg-input
        type="text"
        label="Category Name"
        placeholder="Enter Category Name"
        v-model="info.name"
      />

      <fg-input
        type="text"
        label="Description"
        placeholder="Enter Description"
        v-model="info.description"
      />

       <p-button type="info" round @click.native.prevent="addCategory" id="add-category" v-show="btn_type == 'add'" v-if="add_btn">
            Add
       </p-button> 
       <p-button type="info" round @click.native.prevent="updateCategory" id="update-category" v-show="btn_type == 'edit'">
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
import Swal from 'sweetalert2';

export default {
  components:{
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
      categories:[],
      modalVisible: false,
      info:{
          id:'',
          name: '',
          description: '',
          business_id: ''
      },
      search_value:'',
      modal_title:'',
      btn_type:'',
      add_btn:true,
      errors: {
        name: ''
      }
    }
  },computed: {
    user() {
      return this.$store.state.user;
    },
    token() {
      return this.$store.state.token;
    }
  },
  methods:{
    async list(page=1){
           let self = this;
           let limit=10;
           self.page = page;
           self.loader = true;

           await axios.get(api.API_URL+`/service-category?page=${page}&limit=${limit}&search=${this.search_value}&business_id=${this.user.business_id}`,
             {
               headers: { Authorization: `Bearer ${this.token}` }
             }
           ).then(({data})=>{
             self.loader = false;
             self.categories = data.data
             self.total_page = Math.ceil(data.data.total/limit);
           }).catch(({ response })=>{
               if(response.data.error.code =='token_could_not_verified'){
                   this.$router.push('/login')
               }
           })
     },

     clickCallback (pageNum){
        this.list(pageNum)
     },
    openModalCategory() {
      this.modalVisible = true;
    },
    closeModalCategory() {
      this.modalVisible = false;
    },
    validateForm() {
      this.errors = { name: '' };
      let isValid = true;

      if (!this.info.name.trim()) {
        this.notifyVue('top', 'center', 'danger', 'Category name is required.', 'ti-hand-stop');
        isValid = false;
      }

      return isValid;
    },
    addCategory(){
      if (!this.validateForm()) return;

      this.loader_save = true;
      let self = this;
      this.add_btn = false;
      
      axios.post(api.API_URL+'/service-category', this.info,
        { headers: { Authorization: `Bearer ${this.token}`} }
      ).then(() => {
          self.loader_save = false;
          self.notifyVue('top', 'center','success','Category Successfully Added','ti-announcement')
          self.list();
          self.closeModalCategory()
          self.resetForm();
          self.add_btn = true;
        }).catch((error) => {
          self.handleError(error);
        });
    },
    updateCategory(){
      if (!this.validateForm()) return;

      this.loader_save = true;
      let self = this;
      
      axios.put(api.API_URL+'/service-category/'+this.info.id, this.info,
        { headers: { Authorization: `Bearer ${this.token}`} }
      ).then(() => {
          self.loader_save = false;
          self.notifyVue('top', 'center','success','Category Successfully Updated','ti-announcement')
          self.list();
          self.closeModalCategory()
          self.resetForm();
        }).catch((error) => {
          self.handleError(error);
        });
    },
    deleteCategory(id){
      Swal.fire({
          title: "Are you sure?",
          text: "Do you really want to delete this category?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!"
      }).then((result) => {
          if (result.isConfirmed) {
              let self = this;
              axios.delete(api.API_URL + '/service-category/' + id, {
                  headers: { Authorization: `Bearer ${this.token}` }
              })
              .then(() => {
                  Swal.fire("Deleted!", "Category Successfully Deleted.", "success");
                  self.notifyVue('top', 'center', 'success', 'Category Successfully Deleted', 'ti-announcement');
                  self.list();
              })
              .catch((error) => {
                  self.handleError(error);
              });
          }
      });

    },
    resetForm() {
      this.info = {
        id: '',
        name: '',
        description: '',
        business_id: this.user.business_id
      };
    },
    handleError(error) {
      this.loader_save = false;
      // if (error.response?.status === 422) {
      //   for (const [key, value] of Object.entries(error.response.data)) {
      //     this.notifyVue('top', 'center','danger',value,'ti-hand-stop')
      //   }
      // } else {
      //   this.notifyVue('top', 'center','danger','An error occurred','ti-hand-stop')
      // }
    },
    notifyVue(verticalAlign, horizontalAlign,type,msg,icon) {
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
    modalAddCategory(){
      this.modal_title = 'Add Category'
      this.openModalCategory()
      this.btn_type = 'add'
      this.resetForm()
    },
    modalEditCategory(category){
      this.modal_title = 'Update Category'
      this.openModalCategory()
      this.btn_type = 'edit'
      this.info = { ...category }
    },
    redirectToser() {
      this.$router.push("/services");
    },
  },
  created() {
      this.list();
      this.info.business_id = this.user.business_id
  }
};
</script>

<style>
#category-tbl .btn{padding: 5px 10px!important; margin-right:5px;}
.action{text-align: center;}
#top-tool-bar{padding:10px;}
#add-category{float:right;}
#search{width:50%;}
.pagination li{margin-right:20px;}
.pagination{padding: 10px!important;}
.pagination .page-item.active a{font-weight: bold; background-color: #b6aa62!important;} 
.pagination li a{background: #106c9c; padding: 5px; color: #fff!important; }
#no-record{font-weight: bold; font-size: 20px;}

@media screen and (max-width: 600px) {
  .modal{width: 100%!important;}
}

.error-message {
  color: red;
  font-size: 0.8em;
  margin-top: -10px;
  margin-bottom: 10px;
}

.action .btn-info{margin: 0 2px;}
.tool-btn{float: right; margin:0 3px;}

@media (max-width: 768px) {
  .modal {
    width: 100% !important;
  }
  #search{width: 100% !important;}
  #add-categories{float:none!important;}
  .tool-btn{margin:0 3px;}
  .tool-btn{float: none!important;}
}
</style>