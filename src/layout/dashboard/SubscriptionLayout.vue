<template>
    <div class="subscription-wrapper">
      <div id="logo-wrap">
        <img src="@/assets/img/logo.png" id="logo" />
      </div>
      <transition name="fade">
        <div v-if="subscriptionSuccess" class="success-message">
          Subscription updated successfully!
          <br />
          <button @click="redirectToDashboard" class="dashboard-button">
            Go to Dashboard
          </button>
        </div>
      </transition>
      <button @click="redirectToDashboard" class="subscribe-btn">
           Back to Dashboard
        </button>
      <h3 class="heading-details" v-if="!subscriptionSuccess">Choose Your Subscription</h3>
      <div class="subscription-cards" v-if="!subscriptionSuccess">
        <loader v-show="loader"/>
        <div 
          class="card" 
          v-for="plan in subscriptionPlans" 
          :key="plan.value" 
          :class="{ selected: plan.value === getPlan }"
        >
          <h4>{{ plan.name }}</h4>
          <p class="description">{{ plan.description }}</p>
          <p v-if="plan.price" class="price">Price: {{ plan.price }}</p>
          <button 
            :class="['subscribe-btn', { btnselected: plan.value === getPlan}]"
            @click="subscribe(plan.value)" 
            :disabled="plan.value === getPlan && getStatus!= 'expired'"
          >
            <span v-if="String(plan.value) === String(getPlan)">
              Selected
            </span>
            <span v-else>
              Subscribe
            </span>
          </button>
        </div>
        <button @click="cancelSubscription" class="cancel-button" v-if="getPlan!=='free' && paypalSubscriptionId !== null">
            Cancel Subscription
        </button>
       
      </div>


  
      <!-- New Features Section -->
      <section class="features-section" v-if="!subscriptionSuccess">
        <h3>Key Features</h3>
        <div class="features-grid">
          <div class="feature-item" v-for="feature in features" :key="feature.title">
            <!-- Icon added to each feature -->
            <span :class="['icon-name', feature.icon]"></span>
            <h4>{{ feature.title }}</h4>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </section>
  
      
    </div>
  </template>
  
  
  <script>
  import axios from "axios";
  import api from "@/static/config.json";
  import store from "@/store";
  import Loader from "@/components/Loader";
  import Swal from 'sweetalert2';
  
  export default {
    components: {
    Loader,
    Swal
  },
    data() {
      return {
        subscriptionPlans: [
          {
            name: "Free",
            value: "free",
            description:
              "Limited features: Add up to 10 clients, 10 services, 15 appointments, 15 transactions, and 1 user only."
          },
          {
            name: "Monthly",
            value: "pro_monthly",
            price: "$25",
            description:
              "Monthly subscription with unlimited access to all features."
          },
          {
            name: "Yearly",
            value: "pro_yearly",
            price: "$290",
            description:
              "Yearly subscription with unlimited access to all features. Save 10%!"
          }
        ],
        features: [
            { title: "Booking Management", description: "Easily manage appointments with an intuitive booking system.", icon: "ti-calendar" },
            { title: "Rebooking", description: "Allow clients to reschedule their appointments seamlessly.", icon: "ti-reload" },
            { title: "Cancel", description: "Clients and admins can cancel appointments with instant updates.", icon: "ti-close" },
            { title: "Online Form", description: "A customizable online booking form to collect client details.", icon: "ti-pencil" },
            { title: "Client Reminder", description: "Automated reminders via email or SMS to reduce no-shows.", icon: "ti-alarm-clock" },
            { title: "Clients Management", description: "Store and manage client details for quick access.", icon: "ti-user" },
            { title: "Services Management", description: "Define and manage different services offered, including pricing and duration.", icon: "ti-agenda" },
            { title: "Availability", description: "Set working hours and availability for appointments.", icon: "ti-time" },
            { title: "Block Holidays and Custom Days", description: "Configure non-working days, holidays, and special unavailable dates.", icon: "ti-lock" },
            { title: "Reports", description: "Generate various reports for business insights.", icon: "ti-bar-chart" },
            { title: "Appointment Summary Report", description: "View an overview of all booked appointments.", icon: "ti-book" },
            { title: "Daily Appointment Schedule", description: "Get a detailed schedule of daily appointments.", icon: "ti-calendar" },
            { title: "Client Report", description: "Track client history and interactions.", icon: "ti-clipboard" },
            { title: "Service Report", description: "Analyze service demand and usage.", icon: "ti-pie-chart" },
            { title: "Cancellation and No-Show", description: "Monitor missed and canceled appointments.", icon: "ti-na" },
            { title: "Users Management", description: "Manage system users with different access levels.", icon: "ti-settings" },
            { title: "Add Users", description: "Create new users for the system.", icon: "ti-plus" },
            { title: "Assign User Permissions", description: "Grant or restrict access to different features.", icon: "ti-lock" },
            { title: "Enable/Disable", description: "Activate or deactivate user accounts as needed.", icon: "ti-power-off" },
            { title: "Sales Transactions", description: "Add Daily Sales Transactions and Generate Sales Report.", icon: "ti-money" },
            { title: "Dynamic Settings", description: "Fully customizable settings for time zones, currency, booking rules, feature toggles, and branding.", icon: "ti-wand" }
        ],
        subscriptionSuccess: false,
        loader: false
      };
    },
    computed: {
      user() {
        return store.state.user;
      },
      token() {
        return store.state.token;
      },
      paypalSubscriptionId() {
        return this.user && this.user.subscription
          ? this.user.subscription.paypal_subscription_id
          : null; // or return a default value
      },
      getPlan() {
        return this.user && this.user.subscription
          ? this.user.subscription.plan
          : null; // or return a default value
      },
      getStatus() {
        return this.user && this.user.subscription
          ? this.user.subscription.status
          : null; // or return a default value
      }
    },
    methods: {
      subscribe(planValue) {

        if (this.paypalSubscriptionId && planValue !== "free") {
          
            Swal.fire({
                title: "Are you sure want to change the subscription?",
                text: "Your previous subscription will be canceled",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, change it!"
              }).then((result) => {
                if (result.isConfirmed) {
                  this.loader = true;

                  axios
                    .post(
                      `${api.API_URL}/paypal-cancel`,
                      {
                        subscription_id: this.user.subscription.paypal_subscription_id,
                      },
                      {
                        headers: { Authorization: `Bearer ${this.token}` }
                      }
                    )
                    .then(response => {
                      axios
                          .post(
                            `${api.API_URL}/subscription`,
                            {
                              business_id: this.user.business_id,
                              user_id: this.user.id,
                              plan: planValue,
                            },
                            {
                              headers: { Authorization: `Bearer ${this.token}` }
                            }
                          )
                          .then(response => {
                            this.loader = false;

                            if(response.data.plan=="free"){
                              store.commit('setUser', response.data.user); 
                              this.subscriptionSuccess = true;
                            }else{
                              this.$router.push("/checkout/"+response.data.id);
                            }
                            
                          })
                          .catch(error => {
                            this.loader = false;
                            console.error("Subscription error:", error);
                          });
                    })
                    .catch(error => {
                      this.loader = false;
                      console.error("Subscription error:", error);
                    });

                 
              }
            });
        }else{
            this.loader = true;
              axios
                .post(
                  `${api.API_URL}/subscription`,
                  {
                    business_id: this.user.business_id,
                    plan: planValue,
                    user_id: this.user.id
                  },
                  {
                    headers: { Authorization: `Bearer ${this.token}` }
                  }
                )
                .then(response => {
                  this.loader = false;

                  if(response.data.plan=="free"){
                    this.subscriptionSuccess = true;
                    store.commit('setUser', response.data.user); 
                  }else{
                    this.$router.push("/checkout/"+response.data.id);
                  }
                  
                })
                .catch(error => {
                  this.loader = false;
                  console.error("Subscription error:", error);
                });
          }
        
        
      },
      redirectToDashboard() {
        this.$router.push("/dashboard");
      },
      cancelSubscription(){
          this.loader = true;
            axios.post(
              `${api.API_URL}/paypal-cancel`,
              {
                subscription_id: this.user.subscription.paypal_subscription_id,
                user_id: this.user.id,
              },
              {
                headers: { Authorization: `Bearer ${this.token}` }
              }
            )
            .then(response => {
              this.loader = false;
              Swal.fire('Success!', 'You have successfully cancelled the subscription.', 'success');
              store.commit('setUser', response.data.user); 
            })
            .catch(error => {
              this.loader = false;
              console.error("Subscription error:", error);
            });
      }
    },
    created(){
    }
  };
  </script>
  
  <style scoped>
  .subscription-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background: #f4f6f8;
    min-height: 100vh;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
  
  #logo-wrap {
    width: 100%;
    text-align: center;
    margin-bottom: 20px;
  }
  
  #logo {
    max-width: 260px;
  }
  
  .heading-details {
    text-align: center;
    margin: 30px 0;
  }
  
  .subscription-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    width: 100%;
    max-width: 900px;
  }
  
  .card {
    background: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 280px;
    text-align: center;
  }
  
  /* Elegant styling for the description text */
  .description {
    font-family: 'Georgia', serif;
    font-size: 15px;
    color: #555;
    line-height: 1.6;
    margin-bottom: 10px;
    text-align: center;
    font-style: italic;
    letter-spacing: 0.3px;
  }
  
  .price {
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  .subscribe-btn {
    background-color: #007bff;
    color: #fff;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .subscribe-btn:hover {
    background-color: #0056b3;
  }
  
/* Updated styling for the features section */
.features-section {
  margin-top: 40px;
  width: 100%;
  max-width: 900px;
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.features-section h3 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.75rem;
  color: #333;
}

/* Grid layout for feature boxes */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

/* Feature item card styling */
.feature-item {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* Styling for the icon inside each feature */
.feature-item .icon-name {
  font-size: 2.5rem;
  color: #007bff;
  margin: 0 auto 10px; /* auto left/right centers the element */
  display: block;
}

/* Feature item text styling */
.feature-item h4 {
  font-size: 1.25rem;
  margin-bottom: 15px;
  color: #333;
}

.feature-item p {
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
}

  
  .success-message {
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

  .cancel-button{
    background-color: #ff0000;
    color: #fff;
    font-weight: bold;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .cancel-button:hover{
    background-color: #9f0000;
    color: #fff;
    font-weight: bold;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .selected{border: 1px solid #000;}
  .btnselected{background-color: #666;}
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .subscription-cards {
      flex-direction: column;
      align-items: center;
    }
    .card {
      width: 90%;
    }
    .features-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>
    