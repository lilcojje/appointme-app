<template>
  <span class="loader"></span>
</template>
<style>
.loader {
    width: 48px;
    height: 48px;
    border: 5px solid #e5cf6f;
    border-bottom-color: #008080;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
    position: fixed; /* Changed from absolute to fixed */
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* This centers the element */
    z-index: 9999;
    }

    @keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
    } 
</style>
