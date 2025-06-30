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
    <transition name="modal">
    <div class="modali-mask" v-if="showWelcome">
      <div class="modali-wrapper">
        <div class="modali-container modern">
          <h3>Welcome to AppointMe!</h3>
          <p>We're excited to have you here. Follow these steps to get started:</p>
          <ul class="modern-list">
            <li>✅ Add Services</li>
            <li>✅ Setup Availability</li>
            <li>✅ Update Settings and Business Profile</li>
            <li>✅ Add Appointment</li>
            <li>✅ Assign Users</li>
            <li>✅ View Booking Form Link</li>
          </ul>
          <button class="modern-button" @click="dismissWelcome">Got it!</button>
        </div>
      </div>
    </div>
  </transition>


  </div>
</template>
<style lang="scss">
.wrapper .sidebar .nav .nav-item .nav-link{margin: 7px 0px;}

@media (max-width: 768px) {
  .wrapper .sidebar .nav .nav-item .nav-link{margin: 0px;}
}


.modali-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  
}



.modali-container {
  background: white;
  padding: 20px 30px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}

.modali-container h3 {
  margin-top: 0;
}

.modali-container button {
  margin-top: 20px;
}

.modali-container.modern {
  background: #fff;
  padding: 30px 35px;
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  text-align: center;
  font-family: 'Segoe UI', sans-serif;
}

.modern-list {
  list-style: none;
  padding: 0;
  margin: 20px 0;
  text-align: left;

  li {
    padding-left: 24px;
    position: relative;
    margin-bottom: 10px;
    font-size: 15px;
    color: #333;
  }
}

.modern-button {
  background-color: #106c9c;
  color: #fff;
  border: none;
  padding: 12px 24px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #093953;
  }
}



</style>
<script>
import axios from 'axios'
import api  from "@/static/config.json";
import TopNavbar from "./TopNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import DashboardContent from "./Content.vue";
import MobileMenu from "./MobileMenu";
import store from '@/store';
export default {
  components: {
    TopNavbar,
    ContentFooter,
    DashboardContent,
    MobileMenu,
  },data(){
    return{
      role_id: '',
      showWelcome: false,
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
                        window.location.href = '/login';
                    })
                    .catch((response) => {
                          if(response.data.error.code =='token_could_not_verified'){
                            window.location.href = '/login';
                          }
                    });
    },
    hasPermission(permission) {
      // Adjust the property path if your permissions are nested under a role.
      // For example, if your user object stores permissions under "role.permissions",
      // you might use: this.user.role && this.user.role.permissions.some(...)
      return this.user.permissions && this.user.permissions.some(p => p === permission);
    },
    dismissWelcome() {

      this.showWelcome = false;

      const payload = { 
        welcome_intro: 1,
        business_id: this.user.business_id,
        user_id: this.user.id
      };
      
      axios
        .post(api.API_URL + "/settings", payload, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        .then(response => {
           store.commit('setUser', response.data.user); 
           store.commit('setSettings', response.data.user.settings);
        });

      localStorage.setItem('appointme_welcome_shown', 'true');
      
    }

    },
  created(){
    this.role_name = this.user.role_name;
    
    if (this.user.settings.welcome_intro==0) {
      this.showWelcome = true;
   }
  }
};
</script>
