<template>
    <div class="wrapper">
      <div v-if="!paymentSuccess">
        <loader v-show="loader"/>
        <div class="confirm-message">
          <p>Processing your PayPal payment...</p>
        </div>
      </div>
      <transition name="fade">
        <div v-if="paymentSuccess" class="success">
          PayPal Payment Successful!<br/>
          Your subscription has been activated.
          <br/>
          <button @click="redirectToDashboard" class="dashboard-button">
            Go to Dashboard
          </button>
        </div>
      </transition>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import api from "@/static/config.json";
  import Loader from "@/components/Loader";
  import store from '@/store';

  export default {
    components: { Loader },
    data() {
      return {
        subscriptionId: null,
        baToken: null,
        paypalToken: null,
        loader: false,
        paymentSuccess: false,
        errors: {}
      };
    },
    computed: {
      user() {
        return this.$store.state.user;
      },
      token() {
        return this.$store.state.token;
      }
    },
    methods: {
      processPaypalPayment() {
        this.loader = true;
        // Call the backend API to process the PayPal success details
        axios.post(`${api.API_URL}/paypal-success`, {
          sub_id : this.sub_id,
          user_id : this.user.id,
          subscription_id: this.subscriptionId,
          ba_token: this.baToken,
          token: this.paypalToken
        }, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        .then(response => {
          this.loader = false;
          this.paymentSuccess = true;
          // Optionally trigger a notification here
          store.commit('setUser', response.data.user); 
          this.notifyVue("top", "center", "success", "PayPal Payment Processed Successfully", "ti-announcement");
        })
        .catch(error => {
          this.loader = false;
          if (error.response && error.response.data) {
            this.errors = error.response.data;
          }
        });
      },
      redirectToDashboard() {
        this.$router.push('/dashboard');
      }
    },
    created() {
      // Extract PayPal details from query parameters
      this.subscriptionId = this.$route.query.subscription_id;
      this.baToken = this.$route.query.ba_token;
      this.paypalToken = this.$route.query.token;
      this.sub_id = this.$route.query.id;
      
      // Process the PayPal payment details immediately
      this.processPaypalPayment();
    }
  };
  </script>
  
  <style scoped>
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background: #f4f6f8;
    min-height: 100vh;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
  
  .confirm-message p {
    font-size: 18px;
    margin-bottom: 20px;
  }
  
  .dashboard-button {
    background-color: #007bff;
    color: #fff;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 16px;
  }
  
  .dashboard-button:hover {
    background-color: #0056b3;
  }
  
  .success {
    background: linear-gradient(135deg, #28a745, #218838);
    color: #fff;
    font-size: 18px;
    text-align: center;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 500px;
    margin: 20px auto;
    font-weight: bold;
    animation: fadeIn 0.5s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  </style>
  