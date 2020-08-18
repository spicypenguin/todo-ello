var boardList = [];
var listList = [];

var writeToLocalStorage = function (board, highPriority, lowPriority, extraCurricular) {
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem('boardId', JSON.stringify(board));
        localStorage.setItem('highPriorityList', JSON.stringify(highPriority));
        localStorage.setItem('lowPriorityList', JSON.stringify(lowPriority));
        localStorage.setItem('extraCurricularList', JSON.stringify(extraCurricular));

        window.location.replace('/index.html');

    } else {
        console.log('Could not access local storage, failing out');
        window.location.replace("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    }
};

var authenticationSuccess = function () {
    window.Trello.rest('GET','members/me/boards', boardsSuccess, apiFailure);
};

var boardsSuccess = function (data) {
    for (var i = 0; i < data.length; i++){
        boardList.push({
            id: data[i].id,
            name: data[i].name
        });
    }
    console.log('board success');
};

var listSuccess = function (data) {
    for (var i = 0; i < data.length; i++){
        listList.push({
            id: data[i].id,
            name: data[i].name
        });
    }
    showLists();
    console.log('list success');
};

var apiFailure = function () {
    console.log('this failed');
};

var findLists = function () {
    this.board = configureTodo.selectedBoard.id;
    window.Trello.rest('GET','boards/'+ this.board + '/lists', listSuccess, apiFailure);
};

var showLists = function () {
    $('#selected-board').removeClass('hidden');
    $('#form').removeClass('hidden');
    $('#lists').removeClass('hidden');
    $('#boards').addClass('hidden');
};

var hideLists = function () {
    $('#selected-board').addClass('hidden');
    $('#form').addClass('hidden');
    $('#lists').addClass('hidden');
    $('#boards').removeClass('hidden');
};

var configureTodo = new Vue({
  el: '#configure',
  data: {
    highPriority: '',
    lowPriority: '',
    extraCurricular: '',
    boards: boardList,
    lists: listList,
    selectedBoard: {}
  },
  methods: {
      searchForLists: function(event) {
          if (event) {
              this.selectedBoard.id = event.target.id;
              this.selectedBoard.name = event.target.innerText;
              if(configureTodo.lists.length > 0){
                   listList = [];
                   configureTodo.lists = listList;
              }
              findLists();
          }
      },
      doSubmit: function() {
          this.highPriority = {id: $("#zone1").children()[0].id, name: $("#zone1").children()[0].innerText};
          this.lowPriority = {id: $("#zone2").children()[0].id, name: $("#zone2").children()[0].innerText};
          this.extraCurricular = {id: $("#zone3").children()[0].id, name: $("#zone3").children()[0].innerText};
          writeToLocalStorage(this.selectedBoard, this.highPriority, this.lowPriority, this.extraCurricular);
      }
  }
});

window.Trello.authorize({
   type: 'popup',
    name: 'Todo-ello',
    scope: {
        read: 'true',
        write: 'true'
    },
    expiration: 'never',
    success: authenticationSuccess,
    error: apiFailure
});
