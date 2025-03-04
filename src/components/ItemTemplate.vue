<template>
  <div>
    <span>{{ item.first_name }} {{ item.last_name }}</span>
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