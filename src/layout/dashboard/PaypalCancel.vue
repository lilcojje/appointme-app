<template>
  <div class="wrapper">
    <!-- Cancellation Message -->
    <div class="cancel">
      PayPal Payment Cancelled!<br/>
      Your subscription has not been activated.
      <br/>
      <button @click="redirectToSubscription" class="subscription-button">
        Return to Subscription Page
      </button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    redirectToSubscription() {
      this.$router.push('/subscription');
    }
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

.cancel {
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
  background: linear-gradient(135deg, #dc3545, #c82333);
}

.subscription-button {
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

.subscription-button:hover {
  background-color: #0056b3;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
