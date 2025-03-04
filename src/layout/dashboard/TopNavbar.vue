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
      <a class="nav-link" id="view-form" @click="viewForm" v-if="settings.enable_booking"><span class="ti-eye"></span>View Form</a>
      <drop-down
          class="nav-item"
          :title="fullname"
          title-classes="nav-link"
          icon="ti-user"
          id="user-dropdown"
        >
          <a class="dropdown-item" @click="profile">Profile</a>
          <a class="dropdown-item" @click="viewForm">View Form</a>
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
  },
  data() {
    return {
      activeNotifications: false,
      fullname: '',
      settings: {
        enable_booking: ""
      },
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
            const token = localStorage.getItem('token');
            axios.post(api.API_URL+'/logout', {
                },
                
                {
                 headers: { Authorization: `Bearer ${token}`}
                }
                )
                    .then((data) => {
                         localStorage.clear();
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
    viewForm() {
      const business_id = localStorage.getItem("business_id");
      // Resolve the URL using Vue Router (optional but recommended for proper routing)
      const url = this.$router.resolve({ path: '/book/' + business_id }).href;
      window.open(url, '_blank');
    },
    fetchSettings() {
      const token = localStorage.getItem("token");
      const business_id = localStorage.getItem("business_id");
      axios
        .get(api.API_URL + "/settings", {
          headers: { Authorization: `Bearer ${token}` },
          params: { business_id }
        })
        .then(response => {
          const data = response.data;
          data.enable_booking = !!Number(data.enable_booking);
          this.settings = response.data;
        });
    },
  },
  created(){
    this.fullname = localStorage.getItem('fullname');
    this.fetchSettings();
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

#view-form span{margin-right: 5px;}

@media only screen and (max-width: 767px) {
  #view-form {
    display: none;
  }
}

</style>
