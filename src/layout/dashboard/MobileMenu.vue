<template>
  <ul class="nav navbar-nav nav-mobile-menu">
    <h5 id="fullname" @click="profile"><span class="ti-user"></span>{{ fullname }}</h5>
   <!--<h5 id="subscribe-to" @click="subscription"><span class="ti-medall"></span><span  v-if="user.subscription.plan=='free'" class="subsc">Upgrade Pro</span><span class="subsc" v-else>(PRO)</span></h5>-->
    <slot></slot>
  </ul>
</template>
<script>
export default {

  data() {
    return {
      fullname: '',
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    enableBooking() {
      return this.$store.state.enableBooking;
    }
  },
  methods: {
    viewForm() {
     
      // Resolve the URL using Vue Router (optional but recommended for proper routing)
      const url = this.$router.resolve({ path: '/book/' + this.user.business_id }).href;
      window.open(url, '_blank');
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    profile() {
      // Redirect to the '/profile' route
      this.$router.replace('/profile');
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
  },
  created(){
    this.fullname = this.user.first_name + ' ' + this.user.last_name;
  }
};
</script>
<style>
#fullname{text-align: left; color: #fff; cursor: pointer; font-size: 14px; font-weight: bold;}
#fullname span{display: inline-block; margin-left: 7px; margin-right: 10px;}
#subscribe-to{text-align: left; color: #fff; cursor: pointer;}
#subscribe-to span{display: inline-block; margin-left: 7px; margin-right: 10px;}
#viewForm{text-align: left; color: #fff; cursor: pointer; font-size: 14px; font-weight: bold;}
#viewForm span{display: inline-block; margin-left: 7px; margin-right: 10px;}
</style>
