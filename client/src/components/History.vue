<template>
  <div id='text-area'>
        <p v-for="message in messages" :key='message.id'>{{message.message}}</p>
        <div id="dummy"></div>
    </div>
</template>

<script>
export default {
    name: 'History',
    props: ['messages']
}
</script>

<style scoped>
#text-area {
    height:300px;
    width:220px;
    float:right;
    text-align: left;
    background-color: rgba(0,0,0,.1);
    padding: 0 10px;
    overflow-y: scroll;
}
#dummy {
    margin-top: 50px;
}

</style>