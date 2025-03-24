<template>
  <div class="wrapper">
    <side-bar>
      <template slot="links">
        <sidebar-link
          to="/dashboard"
          name="Dashboard"
          icon="ti-panel"
          v-if="hasPermission('view_dashboard')"
        />
        <sidebar-link
          to="/clients"
          name="Clients"
          icon="ti-view-list-alt"
          v-if="hasPermission('view_clients')"
        />
        <sidebar-link
          to="/services"
          name="Services"
          icon="ti-clipboard"
          v-if="hasPermission('view_services')"
        />
        <sidebar-link
          to="/appointments"
          name="Appointments"
          icon="ti-calendar"
          v-if="hasPermission('view_appointments')"
        />
        <sidebar-link
          to="/availability"
          name="Availability"
          icon="ti-time"
          v-if="hasPermission('view_availability')"
        />
        <sidebar-link
          to="/users"
          name="Users"
          icon="ti-user"
          v-if="hasPermission('view_users')"
        />
        
        <sidebar-link
          to="/transactions"
          name="Transactions"
          icon="ti-layout-list-post"
          v-if="hasPermission('view_transactions')"
        />
        <sidebar-link
          to="/subscription"
          name="Subscription"
          icon="ti-package"
          v-if="user.owner==1"
        />
        <!--
        <sidebar-link
          to="/expenses"
          name="Expenses"
          icon="ti-money"
          v-if="hasPermission('view_expenses')"
        />
        -->
        <sidebar-link
          to="/reports"
          name="Reports"
          icon="ti-timer"
          v-if="hasPermission('view_reports')"
        />
        <sidebar-link
          to="/settings"
          name="Settings"
          icon="ti-settings"
          v-if="hasPermission('view_settings')"
        />
      </template>
      <mobile-menu>
        <li class="nav-item">
          <a class="nav-link" @click="logout">
            <i class="ti-power-off"></i>
            <p>Logout</p>
          </a>
        </li>
        <li class="divider"></li>
      </mobile-menu>
    </side-bar>
    <div class="main-panel">
      <top-navbar></top-navbar>

      <dashboard-content @click.native="toggleSidebar"> </dashboard-content>

      <content-footer></content-footer>
    </div>
  </div>
</template>
<style lang="scss">
.wrapper .sidebar .nav .nav-item .nav-link{margin: 7px 0px!important;}
</style>
<script>
import axios from 'axios'
import api  from "@/static/config.json";
import TopNavbar from "./TopNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import DashboardContent from "./Content.vue";
import MobileMenu from "./MobileMenu";
export default {
  components: {
    TopNavbar,
    ContentFooter,
    DashboardContent,
    MobileMenu,
  },data(){
    return{
      role_id: '',
    }
  },computed: {
    user() {
      return this.$store.state.user;
    },
    token() {
      return this.$store.state.token;
    }
  },
  methods: {
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    },
    logout(){
            
            axios.post(api.API_URL+'/logout', {
                },
                
                {
                 headers: { Authorization: `Bearer ${this.token}`}
                }
                )
                    .then((data) => {
                        localStorage.removeItem("token");
                        this.$router.push({name: 'login'})
                    })
                    .catch((response) => {
                          if(response.data.error.code =='token_could_not_verified'){
                            this.$router.push({name: 'login'})
                          }
                    });
    },
    hasPermission(permission) {
      // Adjust the property path if your permissions are nested under a role.
      // For example, if your user object stores permissions under "role.permissions",
      // you might use: this.user.role && this.user.role.permissions.some(...)
      return this.user.permissions && this.user.permissions.some(p => p === permission);
    }
  },
  created(){
    this.role_name = this.user.role_name;
  }
};
</script>
