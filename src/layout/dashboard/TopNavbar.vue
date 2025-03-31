<template>
  <nav class="navbar navbar-expand-lg navbar-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">{{ routeName }}</a>
      <button
        class="navbar-toggler navbar-burger hide-to-mobile"
        type="button"
        @click="toggleSidebar"
        :aria-expanded="$sidebar.showSidebar"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-bar"></span>
        <span class="navbar-toggler-bar"></span>
        <span class="navbar-toggler-bar"></span>
      </button>
        <div class="collapse navbar-collapse hide-to-mobile">
        </div>
      <drop-down
        class="nav-item notification-nav"
        title-classes="nav-link"
        icon="ti-bell"
        id="notifications-dropdown"
        @click.native="fetchNotifications"
      >
        <template v-slot:title>
          <i class="ti-bell"></i>
          <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
        </template>
        
        <div class="notification-list">
          <div v-if="notifications.length === 0" class="dropdown-item text-muted">
            No new notifications
          </div>
          <a v-for="(notification, index) in notifications.slice(0, 5)" 
            :key="index"
            :class="['dropdown-item', { 'unread': !notification.read }]"
            @click="markAsRead(notification)">
            {{ notification.message }}
            <small class="text-muted">{{ notification.time }}</small>
          </a>

          <div class="dropdown-divider"></div>
          <a class="dropdown-item text-center view-all" href="/notifications">
            View All Notifications
          </a>
        </div>
      </drop-down>
      <a class="nav-link" id="view-form" @click="viewForm" v-if="enableBooking"><span class="ti-eye"></span>View Form</a>
      <a class="nav-link-sub" @click="subscription" id="sub-link" ><span  v-if="user.subscription.plan=='free'" class="subsc">Upgrade Pro</span><span class="subsc" v-else>(PRO)</span></a>
      <drop-down
          class="nav-item"
          :title="fullname"
          title-classes="nav-link"
          icon="ti-user"
          id="user-dropdown"
        >
          <a class="dropdown-item" @click="profile">Profile</a>
          <a class="dropdown-item" @click="subscription" v-if="user.owner==1">Subscription</a>
          <a class="dropdown-item" href="mailto:support@apppointme.tech">Support</a>
          <a class="dropdown-item" @click="logout">Logout</a>
        </drop-down>
        <button
          class="navbar-toggler navbar-burger hide-to-desktop"
          type="button"
          @click="toggleSidebar"
          :aria-expanded="$sidebar.showSidebar"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-bar"></span>
          <span class="navbar-toggler-bar"></span>
          <span class="navbar-toggler-bar"></span>
        </button>
    </div>
  </nav>
</template>
<script>
import axios from 'axios'
import api  from "@/static/config.json";
import Swal from 'sweetalert2';

export default {
  components: {
    Swal
  },
  computed: {
    routeName() {
      const { name } = this.$route;
      return this.capitalizeFirstLetter(name);
    },
    user() {
      return this.$store.state.user;
    },
    token() {
      return this.$store.state.token;
    },
    settings() {
      // Ensure it's an array
      return this.$store.state.settings;
    },
    enableBooking() {
      return this.$store.state.enableBooking;
    }
  },
  data() {
    return {
      activeNotifications: false,
      fullname: '',
      notifications: [],
      unreadCount: 0,
      pollInterval: null
    };
  },
  methods: {
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    toggleNotificationDropDown() {
      this.activeNotifications = !this.activeNotifications;
    },
    closeDropDown() {
      this.activeNotifications = false;
    },
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    hideSidebar() {
      this.$sidebar.displaySidebar(false);
    },
    logout(){
            axios.post(api.API_URL+'/logout', {
                },
                
                {
                 headers: { Authorization: `Bearer ${this.token}`}
                }
                )
                    .then((data) => {
                         localStorage.clear();
                         this.$store.dispatch('clearStore');

                        this.$router.push({name: 'login'})
                    })
                    .catch((response) => {
                          if(response.data.error.code =='token_could_not_verified'){
                            this.$router.push({name: 'login'})
                          }
                    });
    },
    profile() {
      // Redirect to the '/profile' route
      this.$router.replace('/profile');
    },
    subscription(){
      this.$router.replace('/subscription');
    },
    viewForm() {
      const business_id = this.user.business_id;
      // Resolve the URL using Vue Router (optional but recommended for proper routing)
      const url = this.$router.resolve({ path: '/book/' + business_id }).href;
      window.open(url, '_blank');
    },
    async fetchNotifications() {
      try {
        const response = await axios.get(api.API_URL + `/notifications?business_id=${this.user.business_id}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        this.notifications = response.data.notifications;
        this.unreadCount = response.data.unread_count;
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    },

    async markAsRead(notification) {
      if (!notification.read) {
        try {
          await axios.put(api.API_URL + `/notifications/${notification.id}/read?business_id=${this.user.business_id}`, {}, {
            headers: { Authorization: `Bearer ${this.token}` }
          });
          notification.read = true;
          this.$router.replace(notification.link);
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      }
    },

    setupPolling() {
      this.pollInterval = setInterval(() => {
        this.fetchNotifications();
      }, 30000); // Poll every 5 minutes
    }
   
  },
  created(){
    this.fullname = this.user.first_name + ' ' ;

    if(this.user.subscription.status == 'failed'){
      Swal.fire({
                    icon: 'error',
                    title: 'Paypal Payment Failed',
                    text: 'Your subscription payment was unsuccessful. Please update your payment details to continue using the service.',
                    showCancelButton: true,
                    confirmButtonText: 'Pay',
                    cancelButtonText: 'Close'
                }).then((result) => {
                    if (result.isConfirmed) {
                      window.location.href = 'https://www.paypal.com/myaccount/autopay/';
                    }
                });
    }
  },
  mounted() {
    this.fetchNotifications();
    this.setupPolling();
  },
  beforeDestroy() {
    clearInterval(this.pollInterval);
  }
};

</script>
<style>
#view-form {
  float: right;
  display: block;
  width: 125px;
  font-weight: bold;
  cursor: pointer;
}
.subsc{text-transform: uppercase; cursor: pointer; font-weight: bold;}

#view-form span{margin-right: 5px;}
.unread{background: #e3dfdf!important;}
#notifications-dropdown .dropdown-menu{width: 350px!important;}
#notifications-dropdown .dropdown-item{white-space: normal;}

@media (min-width: 992px) {
  .hide-to-desktop {
    display: none;
  }
}

@media only screen and (max-width: 767px) {

  #notifications-dropdown .dropdown-menu{min-width: 22rem!important; left: -93.4px;}
  #notifications-dropdown .dropdown .dropdown-menu .dropdown-item{white-space: normal!important;}
  
  #sub-link{
    display: none;
  }
  .hide-to-mobile{display: none;}
  .show-to-mobile{display: block;}

  .navbar .navbar-brand{font-size: 12px!important;}
}

@media screen and (max-height: 500px) and (orientation: landscape) {
  #view-form {
    display: none;
  }
  
  #sub-link{
    display: none;
  }
}


</style>
