<template>
  <div>
    <span>{{ item.name }}</span>
  </div>
</template>
 
<script>
export default {
  props: {
    item: { required: true },
    searchText: { required: true }
  }
}
</script> 