<template>
    <div class="container">
        <div id='board'>
            <div @click='$emit("selected", cell.id)' 
                v-for='cell in board' :key='cell.id' 
                class="cell" 
                :class="cell.value === 0 ? 'emptyCell' : ''">
                {{cell.value === 0 ? '' : cell.value === 1 ? 'X' : '0'}}
                </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Board',
    props: ['board'],
}
</script>

<style scoped>
#board {
    width: 300px;
    height: 300px;
    font-family: monospace;
    font-size: 6em;
    display:table;
    float:left;
    margin-right:20px;
    border-collapse: collapse;
    background-color:rgba(0,0,0,.1);
            
}
.cell {
    text-align: center;
    height:100px;
    width:100px;
    border:1px solid gray;
    float: left;
}
.emptyCell:hover {
    background-color: #ccc;
}

</style>