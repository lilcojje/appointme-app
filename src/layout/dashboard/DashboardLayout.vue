<template>
  <div class="wrapper">
    <side-bar>
      <template slot="links">
        <sidebar-link to="/dashboard" name="Dashboard" icon="ti-panel" />
        <sidebar-link
          to="/clients"
          name="Clients"
          icon="ti-view-list-alt"
        />
        <sidebar-link
          to="/services"
          name="Services"
          icon="ti-clipboard"
        />
       <sidebar-link
          to="/appointments"
          name="Appointments"
          icon="ti-calendar"
        />
        <sidebar-link
          to="/availability"
          name="Availability"
          icon="ti-time"
        />
        <sidebar-link
          to="/users"
          name="Users"
          icon="ti-user"
        />
        <!--<sidebar-link
          to="/transactions"
          name="Transactions"
          icon="ti-layout-list-post"
        />
       <sidebar-link
          to="/expenses"
          name="Expenses"
          icon="ti-money"
          v-if="role_id==1"
        />-->
        <sidebar-link
          to="/reports"
          name="Reports"
          icon="ti-timer"
          v-if="role_id==1"
        />

        <sidebar-link
          to="/settings"
          name="Settings"
          icon="ti-settings"
          v-if="role_id==1"
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
<style lang="scss"></style>
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
  },
  methods: {
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    },
    logout(){
            const token = localStorage.getItem('token');
            axios.post(api.API_URL+'/logout', {
                },
                
                {
                 headers: { Authorization: `Bearer ${token}`}
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
    }
  },
  created(){
    this.role_id = localStorage.getItem('role_id');
  }
};
</script>
