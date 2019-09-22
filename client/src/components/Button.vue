<template>
    <button @click="$emit('clicked')">{{value}}</button>
</template>

<script>
export default {
    name: 'Button',
    props: ['value']
}
</script>

<style scoped>
button {
    padding: 10px;
    background-color: #eee;
    color: black;
    border: 1px solid #ccc;
}
button:hover {
    background-color: #ddd;
    box-shadow: 0 5px 6px 0 rgba(0,0,0,0.12),0 5px 9px 0 rgba(0,0,0,0.1);
}
</style>