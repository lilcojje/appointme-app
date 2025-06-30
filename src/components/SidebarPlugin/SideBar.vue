<template>
  <div
    class="sidebar"
    :data-background-color="backgroundColor"
    :data-active-color="activeColor"
  >
    <div class="sidebar-wrapper" id="style-3">
      <div class="logo">
        <a href="#" class="simple-text">
          <div class="logo-img">
            <!-- If businessLogo (from computed) is provided, it will be used;
                 otherwise, the default image is shown -->
            <img :src="businessLogo" alt="Business Logo" />
          </div>
          {{ business_name }}
        </a>
      </div>
      <slot> </slot>
      <ul class="nav">
        <slot name="links">
          <sidebar-link
            v-for="(link, index) in sidebarLinks"
            :key="index"
            :to="link.path"
            :name="link.name"
            :icon="link.icon"
          >
          </sidebar-link>
        </slot>
      </ul>
      <moving-arrow :move-y="arrowMovePx"> </moving-arrow>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import api from "@/static/config.json";// Adjust this import based on your API configuration
import MovingArrow from "./MovingArrow.vue";
import SidebarLink from "./SidebarLink";

export default {
  props: {
    title: {
      type: String,
      default: "Paper Dashboard",
    },
    backgroundColor: {
      type: String,
      default: "black",
      validator: (value) => {
        let acceptedValues = ["white", "black", "darkblue"];
        return acceptedValues.indexOf(value) !== -1;
      },
    },
    activeColor: {
      type: String,
      default: "success",
      validator: (value) => {
        let acceptedValues = [
          "primary",
          "info",
          "success",
          "warning",
          "danger",
        ];
        return acceptedValues.indexOf(value) !== -1;
      },
    },
    sidebarLinks: {
      type: Array,
      default: () => [],
    },
    autoClose: {
      type: Boolean,
      default: true,
    },
  },
  provide() {
    return {
      autoClose: this.autoClose,
      addLink: this.addLink,
      removeLink: this.removeLink,
    };
  },
  components: {
    MovingArrow,
    SidebarLink,
  },
  computed: {
    // Returns the correct logo based on the fetched business profile.
    businessLogo() {
      // Check if businessProfile exists and has a non-empty business_logo value.
      if (this.user.business_logo) {
        return api.IMG_URL + this.user.business_logo;
      }
      // Fallback to default image.
      return require('@/assets/img/logo.png');
    },
    // Calculate the arrow's position for the active link.
    arrowMovePx() {
      return this.linkHeight * this.activeLinkIndex;
    },
    user() {
      return this.$store.state.user;
    },
    token() {
      return this.$store.state.token;
    }
  },
  data() {
    return {
      linkHeight: 65,
      activeLinkIndex: 0,
      windowWidth: 0,
      isWindows: false,
      hasAutoHeight: false,
      links: [],
      business_name: '',
      businessProfile: null,
    };
  },
  methods: {
    findActiveLink() {
      this.links.forEach((link, index) => {
        if (link.isActive()) {
          this.activeLinkIndex = index;
        }
      });
    },
    addLink(link) {
      const index = this.$slots.links.indexOf(link.$vnode);
      this.links.splice(index, 0, link);
    },
    removeLink(link) {
      const index = this.links.indexOf(link);
      if (index > -1) {
        this.links.splice(index, 1);
      }
    }
  },
  mounted() {
    this.$watch("$route", this.findActiveLink, {
      immediate: true,
    });
    // Optionally initialize business_name from localStorage.
    this.business_name = this.user.business_name || '';
    // Fetch updated business details.
    
  },
};
</script>

<style>
.wrapper .sidebar .logo .simple-text .logo-img img {
  max-width: 40px!important;
}
.logo{white-space: nowrap;}
</style>
