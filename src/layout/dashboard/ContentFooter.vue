<template>
  <footer class="footer">
    <div class="container-fluid d-flex flex-wrap justify-content-between footer-nav">
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
<style>
@media (max-width: 768px) {
  .footer .footer-nav{justify-content: center!important; align-items: center!important;}
  .footer nav ul li{display: block!important;}
  .footer .copyright {
      padding: 20px 15px 60px 0!important;
      width: 100%;
      text-align: center;
      justify-content: center;
    align-items: center;
  }
}

</style>
