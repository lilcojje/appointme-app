<template>
  <div class="landing-page">
    <!-- Header Section -->
    <header class="header-section">
      <div class="container">
        <div class="logo-section">
          <img v-if="businessProfile.business_logo" :src="api.IMG_URL + businessProfile.business_logo" :alt="businessProfile.business_name" class="business-logo">
          <h1 v-else class="business-name">{{ businessProfile.business_name }}</h1>
          <p class="tagline" v-if="businessProfile.business_tag_line">{{ businessProfile.business_tag_line }}</p>
        </div>
        
        <div class="social-media">
          <a v-if="businessProfile.business_fb" :href="businessProfile.business_fb" target="_blank" class="social-icon">
            <span class="icon-text">FB</span>
          </a>
          <a v-if="businessProfile.business_insta" :href="businessProfile.business_insta" target="_blank" class="social-icon">
            <span class="icon-text">IG</span>
          </a>
          <a v-if="businessProfile.business_tiktok" :href="businessProfile.business_tiktok" target="_blank" class="social-icon">
            <span class="icon-text">TT</span>
          </a>
          <a v-if="businessProfile.business_email" :href="'mailto:' + businessProfile.business_email" class="social-icon">
            <span class="icon-text">✉</span>
          </a>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h2>Welcome to {{ businessProfile.business_name }}</h2>
          <p v-if="businessProfile.business_welcome_message">{{ businessProfile.business_welcome_message }}</p>
          <button class="btn btn-primary" @click="showBookingModal">Book Now</button>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="services-section" v-if="businessProfile.business_services && businessProfile.business_services.length">
      <div class="container">
        <h2>Our Services</h2>
        <div class="services-container">
          <div class="service-category" v-for="(category, catIndex) in groupedServices" :key="catIndex">
            <h3>{{ category.category }}</h3>
            <ul class="service-list">
              <li v-for="(service, index) in category.services" :key="index" @click="addToCart(service)">
                {{ service.name }}
                <span class="service-price" v-if="service.price">${{ service.price }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Location Section -->
    <section class="location-section">
      <div class="container">
        <h2>Our Location</h2>
        <div class="location-content">
          <div class="map-container" v-if="businessProfile.business_map">
            <div v-html="businessProfile.business_map"></div>
          </div>
          <div class="address-info">
            <p v-if="businessProfile.business_address">{{ businessProfile.business_address }}</p>
            <button class="btn btn-secondary" @click="showBookingModal">Book Appointment</button>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about-section" v-if="businessProfile.business_description">
      <div class="container">
        <h2>About Us</h2>
        <p>{{ businessProfile.business_description }}</p>
      </div>
    </section>

    <!-- Booking Modal -->
    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal-content">
        <button class="close-modal" @click="closeModal">&times;</button>
        <div class="booking-form-wrapper">
          <!-- Your existing booking form component -->
          <div class="wrapper">
            <!-- Existing booking form content -->
            <h3 class="form-title">Book Your Appointment</h3>
            <!-- Include all your existing booking form code here -->
            <!-- ... -->
          </div>
        </div>
      </div>
    </div>

    <!-- Shopping Cart -->
    <div class="shopping-cart" :class="{ 'cart-open': cart.length > 0 }">
      <div class="cart-header" @click="toggleCart">
        <span class="cart-icon">🛒</span>
        <span class="cart-count">{{ cart.length }}</span>
      </div>
      <div class="cart-content" v-if="isCartOpen">
        <h4>Your Selected Services</h4>
        <ul class="cart-items">
          <li v-for="(item, index) in cart" :key="index">
            {{ item.name }}
            <span class="item-price" v-if="item.price">${{ item.price }}</span>
            <button class="remove-item" @click="removeFromCart(index)">&times;</button>
          </li>
        </ul>
        <button class="btn btn-primary" @click="proceedToBooking">Proceed to Booking</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/static/config.json";
import axios from "axios";

export default {
  data() {
    return {
      businessProfile: {
        business_name: "My Awesome Business",
        business_tag_line: "Quality services you can trust",
        business_logo: "",
        business_description: "We are a professional service provider dedicated to delivering exceptional quality and customer satisfaction. Our team of experts is ready to serve all your needs.",
        business_welcome_message: "Thank you for visiting our page. We're excited to serve you!",
        business_address: "123 Main Street, Cityville, ST 12345",
        business_map: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.215209179035!2d-73.98784468459382!3d40.74844047932799!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ0JzU0LjQiTiA3M8KwNTknMTMuNyJX!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`,
        business_fb: "https://facebook.com",
        business_insta: "https://instagram.com",
        business_tiktok: "https://tiktok.com",
        business_email: "contact@mybusiness.com",
        business_services: [
          {
            id: 1,
            name: "Basic Service",
            price: 50,
            duration: 60,
            category: "Standard Services"
          },
          {
            id: 2,
            name: "Premium Service",
            price: 100,
            duration: 90,
            category: "Standard Services"
          },
          {
            id: 3,
            name: "Deluxe Package",
            price: 200,
            duration: 120,
            category: "Premium Packages"
          }
        ]
      },
      cart: [],
      isCartOpen: false,
      showModal: false,
      selectedService: null,
      serviceOptions: [],
      api: api
    };
  },
  computed: {
    groupedServices() {
      // Group services by category
      const groups = {};
      if (!this.businessProfile.business_services) return [];
      
      this.businessProfile.business_services.forEach(service => {
        const category = service.category || 'Other Services';
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(service);
      });
      
      return Object.keys(groups).map(category => {
        return {
          category: category,
          services: groups[category]
        };
      });
    }
  },
  methods: {
    fetchBusinessProfile() {
      const business_id = this.$route.params.id;
      axios
        .get(`${api.API_URL}/guest-business-profie/${business_id}`)
        .then(response => {
          // Only overwrite default data if API returns actual data
          if (response.data) {
            this.businessProfile = {
              ...this.businessProfile, // Keep defaults as fallback
              ...response.data // Override with API data
            };
          }
          // Parse services if they're stored as JSON string
          if (typeof this.businessProfile.business_services === 'string') {
            this.businessProfile.business_services = JSON.parse(this.businessProfile.business_services);
          }
        })
        .catch(error => {
          console.error("Error fetching business profile:", error);
          // Keep the default data if API call fails
        });
    },
    // ... rest of your methods remain the same ...
  },
  mounted() {
    this.fetchBusinessProfile();
  }
};
</script>

<style scoped>
/* Base Styles */
.landing-page {
  font-family: 'Roboto', sans-serif;
  color: #333;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header Styles */
.header-section {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo-section {
  text-align: center;
  margin-bottom: 20px;
}

.business-logo {
  max-height: 100px;
  max-width: 100%;
}

.business-name {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.tagline {
  font-size: 1.2rem;
  color: #7f8c8d;
  font-style: italic;
}

.social-media {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.social-icon {
  color: #2c3e50;
  font-size: 1.5rem;
  transition: color 0.3s;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f1f1f1;
}

.social-icon:hover {
  background: #3498db;
  color: white;
}

.icon-text {
  font-size: 1rem;
  font-weight: bold;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://via.placeholder.com/1920x600');
  background-size: cover;
  background-position: center;
  color: white;
  padding: 100px 0;
  text-align: center;
}

.hero-content h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.hero-content p {
  font-size: 1.2rem;
  max-width: 800px;
  margin: 0 auto 30px;
}

/* Button Styles */
.btn {
  display: inline-block;
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background-color: #2ecc71;
  color: white;
}

.btn-secondary:hover {
  background-color: #27ae60;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* Services Section */
.services-section {
  padding: 80px 0;
  background-color: #f9f9f9;
}

.services-section h2 {
  text-align: center;
  margin-bottom: 50px;
  font-size: 2rem;
  color: #2c3e50;
}

.services-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.service-category {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.service-category h3 {
  color: #3498db;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f1f1f1;
}

.service-list {
  list-style: none;
  padding: 0;
}

.service-list li {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: space-between;
}

.service-list li:hover {
  background-color: #f8f9fa;
  padding-left: 10px;
}

.service-price {
  color: #2ecc71;
  font-weight: bold;
}

/* Location Section */
.location-section {
  padding: 80px 0;
}

.location-section h2 {
  text-align: center;
  margin-bottom: 50px;
  font-size: 2rem;
  color: #2c3e50;
}

.location-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.map-container {
  height: 400px;
  border-radius: 10px;
  overflow: hidden;
}

.map-container iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.address-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.address-info p {
  font-size: 1.1rem;
  margin-bottom: 30px;
}

/* About Section */
.about-section {
  padding: 80px 0;
  background-color: #f9f9f9;
}

.about-section h2 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 2rem;
  color: #2c3e50;
}

.about-section p {
  max-width: 800px;
  margin: 0 auto;
  font-size: 1.1rem;
  line-height: 1.8;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 10px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 30px;
}

.close-modal {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #7f8c8d;
}

/* Shopping Cart */
.shopping-cart {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 999;
  transition: all 0.3s;
}

.cart-header {
  background-color: #3498db;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  position: relative;
}

.cart-icon {
  font-size: 1.5rem;
}

.cart-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #e74c3c;
  color: white;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
}

.cart-content {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 300px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  padding: 20px;
  display: none;
}

.cart-open .cart-content {
  display: block;
}

.cart-content h4 {
  margin-top: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.cart-items {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  max-height: 200px;
  overflow-y: auto;
}

.cart-items li {
  padding: 10px 0;
  border-bottom: 1px solid #f1f1f1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  font-weight: bold;
  color: #2ecc71;
}

.remove-item {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 1.2rem;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .location-content {
    grid-template-columns: 1fr;
  }
  
  .hero-section {
    padding: 60px 0;
  }
  
  .hero-content h2 {
    font-size: 2rem;
  }
  
  .services-container {
    grid-template-columns: 1fr;
  }
  
  .shopping-cart {
    bottom: 20px;
    right: 20px;
  }
  
  .cart-content {
    width: 280px;
  }
}
</style>