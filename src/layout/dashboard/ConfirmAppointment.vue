<template>
    <div class="wrapper">
      <div id="confirm-appointment-form" v-if="!updateSuccess">
        <loader v-show="loader"/>
      </div>
      <transition name="fade">
        <div v-if="updateSuccess" class="success">
          Appointment confirmed successfully!<br/>
          Click below to return to the dashboard.
          <br/>
          <button @click="redirectToDashboard" class="dashboard-button">Go to Dashboard</button>
        </div>
      </transition>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import api from "@/static/config.json";
  import Loader from "@/components/Loader";
  
  export default {
    components: {
      Loader
    },
    data() {
      return {
        businessId: null,    // This is the route parameter (business id)
        appointment: null,   // This is the appointment id from the query parameter
        loader: false,
        updateSuccess: false,
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
        confirmAppointment(busines_id) {
            this.loader = true;
            // Post to the endpoint using businessId and include appointment id in the payload, with authorization token in the header
            axios.post(`${api.API_URL}/confirm-appointment/${this.$route.params.id}`, {
                appointment: this.$route.query.id,
                confirm: 1
            }, {
                headers: { Authorization: `Bearer ${this.token}` }
            })
            .then(response => {
                this.loader = false;
                this.updateSuccess = true;
                this.notifyVue("top", "center", "success", "Appointment Successfully Updated", "ti-announcement");
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
      // Extract the business id from the route parameters
      this.confirmAppointment();
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
  
  #logo-wrap {
    width: 100%;
    text-align: center;
    margin-bottom: 20px;
  }
  
  #confirm-appointment-form {
    background: #fff;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 500px;
    text-align: center;
  }
  
  .confirm-message p {
    font-size: 18px;
    margin-bottom: 20px;
  }
  
  .error {
    color: #e74c3c;
    font-size: 12px;
    margin-top: 5px;
    display: block;
  }
  
  .update-btn,
  .backto {
    margin-top: 20px;
  }
  
  .btn-front,
  .dashboard-button,
  .back-to-dashboard-button {
    background-color: #007bff;
    color: #fff;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .btn-front:hover,
  .dashboard-button:hover,
  .back-to-dashboard-button:hover {
    background-color: #0056b3;
  }
  
  .dashboard-button {
    margin-top: 16px;
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
  
  #logo-updbn {
    max-width: 260px;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @media (max-width: 768px) {
    #confirm-appointment-form,
    .success {
      width: 90%;
      padding: 20px;
    }
    #logo-updbn {
      max-width: 120px;
    }
  }
  </style>  