<template>
  <footer class="footer">
    <div class="container-fluid d-flex flex-wrap justify-content-between">
      <nav>
        <ul>
          <li>
            <router-link :to="{ path: '/dashboard' }">Dashboard</router-link>
          </li>
          <li>
            <a href="https://appointme.tech/privacy" target="_blank">Privacy Policy</a>
          </li>
          <li>
            <a href="https://appointme.tech/terms" target="_blank">Terms & Conditions</a>
          </li>
        </ul>
      </nav>
      <div class="copyright d-flex flex-wrap">
        &copy; AppointMe
      </div>
    </div>
  </footer>
</template>
<script>
export default {};
</script>
<style></style>
