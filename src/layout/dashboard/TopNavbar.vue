<template>
  <nav class="navbar navbar-expand-lg navbar-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">{{ routeName }}</a>
      <button
        class="navbar-toggler navbar-burger"
        type="button"
        @click="toggleSidebar"
        :aria-expanded="$sidebar.showSidebar"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-bar"></span>
        <span class="navbar-toggler-bar"></span>
        <span class="navbar-toggler-bar"></span>
      </button>
      <div class="collapse navbar-collapse">
      </div>
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
    </div>
  </nav>
</template>
<script>
import axios from 'axios'
import api  from "@/static/config.json";

export default {
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
      fullname: ''
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
   
  },
  created(){
    this.fullname = this.user.first_name + ' ' ;
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

@media only screen and (max-width: 767px) {
  #view-form {
    display: none;
  }
  
  #sub-link{
    display: none;
  }
  .hide-to-mobile{display: none;}
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
