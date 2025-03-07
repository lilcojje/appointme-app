<template>
    <div id="page-permissions">
      <div class="row">
        <div class="col-12">
          <card>
            <div slot="raw-content" class="table-responsive">
              <div class="row" id="top-tool-bar">
                <div class="col-6">
                  <input type="text" v-model="search_value" @input="search" id="search" placeholder="Search roles...">
                </div>
                <div class="col-6">
                  <p-button type="info" round @click.native.prevent="modalAddRole" id="add-role">
                    Add Role
                  </p-button>
                </div>
              </div>
              <loader v-if="loader"/>
              <table class="table table-striped tbl-style" id="permission-tbl">
                <thead>
                  <th>Role Name</th>
                  <th>Permissions</th>
                  <th class="action">Action</th>
                </thead>
                <tbody v-if="roles.total > 0">
                  <tr v-for="(role, index) in roles.data" :key="index">
                    <td>{{ role.name }}</td>
                    <td>
                      <span v-for="(permission, pIndex) in role.permissions" :key="pIndex" class="permission-badge">
                        {{ permission.name }}
                      </span>
                    </td>
                    <td class="action">
                      <p-button type="info" round @click.native.prevent="modalEditRole(role)">
                        <span class="ti-pencil"></span>
                      </p-button>
                      <p-button type="info" round @click.native.prevent="deleteRole(role.id)">
                        <span class="ti-trash"></span>
                      </p-button>
                    </td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr>
                    <td align="center" colspan="3" id="no-record">No roles found.</td>
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
                v-if="roles.total > 0">
              </paginate>
            </div>
          </card>
        </div>
      </div>

      <Modal :showModal="modalVisible" :title="modal_title" @close="closeModalRole">
        <loader v-if="loader_save"/>
        <fg-input
          type="text"
          label="Role Name"
          placeholder="Enter Role Name"
          v-model="roleInfo.name"
        />
        
        <div class="form-group">
          <label class="control-label">Permissions</label>
          <div class="permissions-list">
            <div v-for="permission in allPermissions" :key="permission.id" class="permission-item">
              <label>
                <input type="checkbox" 
                      v-model="roleInfo.selectedPermissions" 
                      :value="permission.id"
                      class="">
                {{ permission.name }}
              </label>
            </div>
          </div>
        </div>

        <div style="clear:both">&nbsp;</div>
        <p-button type="info" round @click.native.prevent="saveRole" id="save-role" v-show="btn_type == 'add'">
          Save
        </p-button>
        <p-button type="info" round @click.native.prevent="updateRole" id="update-role" v-show="btn_type == 'edit'">
          Update
        </p-button>
      </Modal>
    </div>
</template>

<script>
import api from "@/static/config.json";
import axios from 'axios'
import Loader from "@/components/Loader";
import Modal from '@/components/Modal';
import Paginate from 'vuejs-paginate';

export default {
  components: {
    Loader,
    Paginate,
    Modal
  },
  data() {
    return {
      loader: false,
      loader_save: false,
      total_page: 0,
      roles: [],
      allPermissions: [],
      modalVisible: false,
      roleInfo: {
        id: '',
        name: '',
        selectedPermissions: []
      },
      search_value: '',
      modal_title: '',
      btn_type: ''
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
    async list(page = 1) {
      let self = this;
      let limit = 10;
      self.page = page;
      self.loader = true;

      try {
        const [rolesRes, permissionsRes] = await Promise.all([
          axios.get(api.API_URL + `/roles?page=${page}&limit=${limit}&search=${self.search_value}&business_id=${this.user.business_id}`, {
            headers: { Authorization: `Bearer ${this.token}` }
          }),
          axios.get(api.API_URL + '/permissions', {
            headers: { Authorization: `Bearer ${this.token}` }
          })
        ]);

        self.roles = rolesRes.data;
        self.allPermissions = permissionsRes.data;
        self.total_page = Math.ceil(rolesRes.data.total / limit);
        self.loader = false;
      } catch (error) {
        if (_context.t0.response && 
            _context.t0.response.data && 
            _context.t0.response.data.error && 
            _context.t0.response.data.error.code === 'token_could_not_verified') {
          this.$router.push('/login');
        }
        self.loader = false;
      }
    },

    async saveRole() {
      if (!this.validateRoleForm()) return;

      this.loader_save = true;
      try {
        const response = await axios.post(api.API_URL + '/roles', {
          name: this.roleInfo.name,
          business_id: this.user.business_id,
          permissions: this.roleInfo.selectedPermissions
        }, {
          headers: { Authorization: `Bearer ${this.token}` }
        });

        this.$notify({
          title: 'Role created successfully',
          icon: 'ti-announcement',
          type: 'success'
        });
        this.closeModalRole();
        this.list();
      } catch (error) {
        this.handleApiError(error);
      } finally {
        this.loader_save = false;
      }
    },

    async updateRole() {
      if (!this.validateRoleForm()) return;

      this.loader_save = true;
      try {
        await axios.put(api.API_URL + `/roles/${this.roleInfo.id}`, {
          name: this.roleInfo.name,
          permissions: this.roleInfo.selectedPermissions
        }, {
          headers: { Authorization: `Bearer ${this.token}` }
        });

        this.$notify({
          title: 'Role updated successfully',
          icon: 'ti-announcement',
          type: 'success'
        });
        this.closeModalRole();
        this.list();
      } catch (error) {
        this.handleApiError(error);
      } finally {
        this.loader_save = false;
      }
    },

    validateRoleForm() {
      if (!this.roleInfo.name.trim()) {
        this.$notify({
          title: 'Role name is required',
          icon: 'ti-hand-stop',
          type: 'danger'
        });
        return false;
      }

      if (this.roleInfo.selectedPermissions.length === 0) {
        this.$notify({
          title: 'At least one permission must be selected',
          icon: 'ti-hand-stop',
          type: 'danger'
        });
        return false;
      }

      return true;
    },

    modalAddRole() {
      this.modal_title = 'Create New Role';
      this.roleInfo = { id: '', name: '', selectedPermissions: [] };
      this.btn_type = 'add';
      this.openModalRole();
    },

    modalEditRole(role) {
      this.modal_title = 'Edit Role';
      this.roleInfo = {
        id: role.id,
        name: role.name,
        selectedPermissions: role.permissions.map(p => p.id)
      };
      this.btn_type = 'edit';
      this.openModalRole();
    },

    openModalRole() {
      this.modalVisible = true;
    },

    closeModalRole() {
      this.modalVisible = false;
    },

    // Other methods (deleteRole, search, clickCallback, handleApiError) would be similar to user template
  },
  created() {
    this.list();
  }
};
</script>

<style>
#permission-tbl .btn { padding: 5px 10px!important; margin-right: 5px; }
.permission-badge {
  background: #eee;
  padding: 2px 8px;
  border-radius: 12px;
  margin: 2px;
  display: inline-block;
}
.permissions-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 10px;
}
.permission-item {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}
.permission-item:last-child {
  border-bottom: none;
}
.action .btn-info{margin: 0 2px;}
#add-role{float:right}
</style>