<template>
  <div class="error-page">
    <!-- Fade Transition with Logo -->
    <transition name="fade">
      <div id="logo-wrap">
        <img src="@/assets/img/logo.png" id="logo" alt="Logo" />
      </div>
    </transition>
    <!-- 404 Error Message -->
    <div class="error-content">
      <h1>404</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <router-link to="/" class="home-button">Return Home</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "Error404"
};
</script>

<style scoped>
/* Overall Page Styles */
.error-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  text-align: center;
  padding: 20px;
}

/* Logo Styles */
#logo-wrap {
  margin-bottom: 20px;
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* Error Message Styles */
.error-content h1 {
  font-size: 4rem;
  margin: 0;
  color: #333;
}

.error-content p {
  font-size: 1.25rem;
  margin: 20px 0;
  color: #666;
}

/* Button Styles */
.home-button {
  display: inline-block;
  padding: 10px 20px;
  background-color: #3498db;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.home-button:hover {
  background-color: #2980b9;
}
</style>
