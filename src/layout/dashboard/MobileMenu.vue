<template>
  <ul class="nav navbar-nav nav-mobile-menu">
    <h5 id="fullname" @click="profile"><span class="ti-user"></span>{{ fullname }}</h5>
    <h5 @click="viewForm" id="viewForm"><span class="ti-eye" ></span>View Form</h5>
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
  methods: {
    viewForm() {
      const business_id = localStorage.getItem("business_id");
      // Resolve the URL using Vue Router (optional but recommended for proper routing)
      const url = this.$router.resolve({ path: '/book/' + business_id }).href;
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
    this.fullname = localStorage.getItem('fullname');
  }
};
</script>
<style>
#fullname{text-align: left; color: #fff; cursor: pointer;}
#fullname span{display: inline-block; margin-left: 7px; margin-right: 10px;}
#viewForm{text-align: left; color: #fff; cursor: pointer;}
#viewForm span{display: inline-block; margin-left: 7px; margin-right: 10px;}
</style>
