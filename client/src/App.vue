<template>
  <div id="app">
    <div v-show='!this.maxReached'>
      <h1>TIC TAC TOE</h1>
      <!-- <button @click="startGame">{{isRunning ? 'Restart' : 'Start'}}</button> -->
      <Button @clicked="startGame" :value="isRunning ? 'Restart' : 'Start'" />
      <Board :board='board' @selected='handleSelect' />
      <History :messages='messages' />
    </div>

    <MaxReached v-show="this.maxReached" />
  </div>
</template>

<script>
import Board from './components/Board';
import History from './components/History';
import MaxReached from './components/MaxReached';
import Button from './components/Button';
import socketIO from 'socket.io-client';
import uuid from 'uuid/v4';

export default {
  name: 'app',
  components: {
    Board,
    History,
    MaxReached,
    Button
  },
  data() {
    return {
      socket: null,
      board: null,
      isRunning: false,
      messages: [],
      player_id: null,
      played: false,
      maxReached: false
    }
  },
  methods: {
    startGame() {
      if(this.isRunning) {
        this.socket.emit('restart')
      } else if (this.played) {
        this.socket.emit('restart')
      } else {
        this.socket.emit('start')
      }
    },
    addMessage(message) {
      this.messages.push({message, id: uuid()})
      var element = document.getElementById("dummy");
      element.scrollIntoView(false);
    },
    handleSelect(id) {
      if(!this.isRunning) {
        this.addMessage('The game is not running!')
      } else {
        this.played = true;
        this.socket.emit('select', {cell_id: id, player_id: this.player_id})
      }
    }
  },
  created() {
    this.socket = socketIO('/');
  },
  mounted() {

    this.socket.on('register', data => {
      if(data === 'maxPlayersNumberReached') {
        this.maxReached = true;
      }
      this.board = data.board;
      this.player_id = data.player_id;
      if(data.player_id === 1) {
        this.addMessage('You are player 1 (X)')
      } else if (data.player_id === 2) {
        this.addMessage('You are player 2 (0)')
      }
    })

    this.socket.on('message', data => {
      this.addMessage(data)
      if(data === 'You are now player 1') {
        this.player_id = 1;
      }
    })

    this.socket.on('start', data => {
      if(data === 'waitPlayer2') {
        this.addMessage('You must wait for an opponent')

      } else if (data === 'success') {
        this.isRunning = true;
        this.addMessage('The game has been started; Player 1 to choose')
      }
    })

    this.socket.on('abandoned', data => {
      this.board = data.board;
      this.isRunning = false;
      this.addMessage('The opponent left')
    })

    this.socket.on('connected', data => {
      if(data === 1) {
        this.addMessage('Waiting for an opponent')
      } else if(data === 2) {
        this.addMessage('The game can start now')
      }
    })

    this.socket.on('select', data => {
      if(data === 'notYourTurn') {
        this.addMessage('Is not your turn!')
      } else if (data === 'alreadyTaken') {
        this.addMessage('Already taken!')
      }
    })

    this.socket.on('next', data => {
      this.board = data.board;
      this.addMessage('Player ' + data.nextPlayer + ' to choose')
    })

    this.socket.on('result', data => {
      this.board = data.board;
      this.isRunning = false;
      if(data.winner === 'draw') {
        this.addMessage('No moves available. Draw!')
      } else {
        this.addMessage('Player ' + data.winner + ' has won!')
      }
    })

    this.socket.on('restart', data => {
      this.board = data;
      this.isRunning = true;
    })
  }
}
</script>

<style>
body {
    font-family: sans-serif;
    text-align: center;
}
#app {
  width: 600px;
  display: table;
  margin: 70px auto;
}
button{
  margin: 30px;
}
 .clear {
    clear:both;
}
</style>
