<template>
    <div class="checkout-wrapper">
      <div id="logo-wrap">
        <img src="@/assets/img/logo.png" id="logo" />
      </div>
  
      <!-- Success message after payment is completed -->
      <div v-if="checkoutSuccess" class="success-message">
        Payment completed successfully!
        <br />
        <button @click="redirectToDashboard" class="dashboard-button">
          Go to Dashboard
        </button>
      </div>
  
      <!-- Checkout section -->
      <div v-else>
        <h3 class="heading-checkout">Checkout</h3>
        <loader v-if="loader" />
        <div v-if="subscriptionDetails" class="checkout-details">
          <h4>{{ subscriptionDetails.name }}</h4>
          <p class="description">{{ formattedPlan }}</p>
          <p class="price">Price: ${{ subscriptionDetails.price }}</p>
          <p class="billing-frequency">Billing: {{ billingFrequency }}</p>
          <p class="renewal-date">Next Renewal: {{ nextRenewalDate }}</p>
          <small class="cancellation-note">Cancel anytime before renewal to avoid charges.</small>
          <div style="clear:both;">&nbsp;</div>
          <button class="paypal-btn" @click="proceedToPaypal">
            Proceed to PayPal
          </button>
        </div>
        <div v-else>
          <p>Loading subscription details...</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  import api from "@/static/config.json";
  import store from "@/store";
  import Loader from "@/components/Loader";
  
  export default {
    components: { Loader },
    data() {
      return {
        checkoutSuccess: false,
        loader: false,
        // For demo purposes, we are initializing subscriptionDetails here
        subscriptionDetails: {
          id: 1,
          name: "AppointMe Pro",
          plan: "pro_yearly", // "pro_monthly" or "pro_yearly"
          price: "$250" // Adjusted for yearly plan
        },
        sub_id: ''
      };
    },
    computed: {
      user() {
        return store.state.user;
      },
      token() {
        return store.state.token;
      },
      subscriptionId() {
        return this.$route.params.id;
      },
      formattedPlan() {
        return this.subscriptionDetails.plan === "pro_yearly" ? "Pro Yearly" : "Pro Monthly";
      },
      billingFrequency() {
        return this.subscriptionDetails.plan === "pro_yearly" ? "Every year" : "Every month";
      },
      nextRenewalDate() {
        const now = new Date();
        if (this.subscriptionDetails.plan === "pro_yearly") {
          now.setFullYear(now.getFullYear() + 1);
        } else {
          now.setMonth(now.getMonth() + 1);
        }
        return now.toDateString();
      },
    },
    mounted() {
      this.fetchSubscriptionDetails();
    },
    methods: {
      fetchSubscriptionDetails() {
        this.loader = true;
        axios
          .get(`${api.API_URL}/subscription/${this.subscriptionId}`, {
            headers: { Authorization: `Bearer ${this.token}` }
          })
          .then(response => {
            this.subscriptionDetails = response.data;
            this.loader = false;
          })
          .catch(error => {
            this.loader = false;
            console.error("Error fetching subscription details:", error);
          });
      },
      proceedToPaypal() {
        this.loader = true;
        axios
          .post(
            `${api.API_URL}/paypal`,
            {
                subscription_id: this.subscriptionDetails.id,
                plan: this.subscriptionDetails.plan,
                price: this.subscriptionDetails.price,
                user_id: this.user.id
            },
            {
              headers: { Authorization: `Bearer ${this.token}` }
            }
          )
          .then(response => {
            this.loader = false;
            window.location.href = response.data.links[0].href;
          })
          .catch(error => {
            this.loader = false;
            console.error("Error proceeding to PayPal:", error);
          });
      },
      redirectToDashboard() {
        this.$router.push("/dashboard");
      }
    }
  };
  </script>
  
  <style scoped>
  /* CSS Variables for a modern, elegant palette */
  :root {
    --primary-color: #2c3e50;
    --secondary-color: #2980b9;
    --accent-color: #e74c3c;
    --light-bg: #f9f9f9;
    --card-bg: #ffffff;
    --text-color: #333333;
    --shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    --border-radius: 10px;
  }
  
  .checkout-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px;
    background: linear-gradient(135deg, #ececec, #f9f9f9);
    min-height: 100vh;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: var(--text-color);
  }
  
  #logo-wrap {
    width: 100%;
    text-align: center;
    margin-bottom: 30px;
  }
  
  #logo {
    max-width: 200px;
    transition: transform 0.3s ease;
  }
  #logo:hover {
    transform: scale(1.05);
  }
  
  .heading-checkout {
    text-align: center;
    margin-bottom: 20px;
    font-size: 2em;
    color: var(--primary-color);
  }
  
  .checkout-details {
    background: var(--card-bg);
    padding: 30px 40px;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    width: 100%;
    max-width: 480px;
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .checkout-details:hover {
    transform: translateY(20px);
    box-shadow: 0 12px 24px rgba(110, 107, 107, 0.15);
  }


  .checkout-details{
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
  
  .checkout-details h4 {
    font-size: 1.5em;
    margin-bottom: 15px;
    color: var(--secondary-color);
  }
  
  .description {
    font-size: 25px;
    color: #777;
    margin-bottom: 10px;
    font-style: italic;
    font-weight: bold;
  }
  
  .price {
    font-size: 1.2em;
    font-weight: bold;
    margin-bottom: 20px;
    color: var(--accent-color);
  }
  
  .billing-frequency,
  .renewal-date {
    font-size: 19px;
    margin-bottom: 10px;
  }
  
  .cancellation-note {
    font-size: 0.8em;
    color: #f60000;
    margin-top: 10px;
  }
  
  .paypal-btn {
    background-color: #ffc439;
    color: #111;
    border: none;
    padding: 14px 30px;
    border-radius: 30px;
    font-size: 1em;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
    margin-top: 20px;
  }
  .paypal-btn:hover {
    background-color: #e6b12a;
    transform: scale(1.03);
  }
  
  .success-message {
    background: linear-gradient(135deg, var(--secondary-color), #1f6391);
    color: #fff;
    font-size: 1.2em;
    text-align: center;
    padding: 30px 40px;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    width: 100%;
    max-width: 480px;
    margin: 20px auto;
    font-weight: bold;
  }
  
  .dashboard-button {
    background-color: var(--primary-color);
    color: #fff;
    border: none;
    padding: 14px 30px;
    border-radius: 30px;
    font-size: 1em;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
    margin-top: 20px;
  }
  .dashboard-button:hover {
    background-color: #1a252f;
    transform: scale(1.03);
  }
  
  @media (max-width: 768px) {
    .checkout-details,
    .success-message {
      width: 90%;
      padding: 20px;
    }
  }
  </style>
  