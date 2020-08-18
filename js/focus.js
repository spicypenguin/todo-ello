var boardId = '';
var highPriorityList = '';
var lowPriorityList= '';
var extraCurricularList = '';

var highPriority = [];
var lowPriority = [];
var extraCurricular = [];
var focusCards = [];

var pickMode = true;

var todoCards = new Vue({
  el: '#todos',
  data: {
    highCards: highPriority,
    lowCards: lowPriority,
    extraCards: extraCurricular,
    focusCards: focusCards
  },
  methods: {
      pickCard: function(event) {
          if(event.target.nodeName == 'LABEL'){
              storePick({
                  id: event.target.parentNode.id,
                  name: event.target.parentNode.innerText
              });
          } else {
              storePick({
                  id: event.target.id,
                  name: event.target.innerText
              });
          }
      },
      resetPicks: function() {
          resetPicks();
      },
      closeCard: function(event) {
          closeCard(event.target.id, true);
      }
  }
});

var authenticationSuccess = function(data) {
    console.log('Successful authentication');
    if (typeof(Storage) !== "undefined") {
        // get board ID from local storage, or redirect to configure if not set
        if(localStorage.getItem('boardId') == null ||
                localStorage.getItem('highPriorityList') == null ||
                localStorage.getItem('lowPriorityList') == null ||
                localStorage.getItem('extraCurricularList') == null) {
            window.location.replace("configure.html");
        }
        else {
            boardId = localStorage.getItem('boardId');
            highPriorityList = localStorage.getItem('highPriorityList');
            lowPriorityList = localStorage.getItem('lowPriorityList');
            extraCurricularList = localStorage.getItem('extraCurricularList');

        }
    } else {
        console.log('Could not access local storage, failing out');
        window.location.replace("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    }
    
    getNewCards();
};

var getNewCards = function() {
    window.Trello.rest(
            'GET',
            '/boards/' + boardId + '/cards',
            getCardsSuccess,
            apiFailure
    );
};

var getCardsSuccess = function(data) {
    clearList(highPriority);
    clearList(lowPriority);
    clearList(extraCurricular);

    for (var i = 0; i < data.length; i++) {
        if (data[i]['idList'] == highPriorityList) {
            highPriority.push(data[i]);
        } else if (data[i]['idList'] == lowPriorityList) {
            lowPriority.push(data[i]);
        } else if (data[i]['idList'] == extraCurricularList) {
            extraCurricular.push(data[i]);
        }
    }

    toggleFocusMode();
};

var clearList = function(list){
    while(list.length > 0){
        list.pop();
    }
};

var toggleFocusMode = function () {
    if (pickMode) {
        if(focusCards.length >= 5) {
            // In pick mode, and we already have enough cards
            // No more picking
            $(".pickcards").addClass("hidden");
            $(".focuscards").removeClass("hidden");
            $("div").removeClass("selected");
            pickMode = false;
        }
    } else {
        if(focusCards.length == 0) {
            // Not in pick mode, and there are no cards left
            // Time to pick more cards!
            $(".pickcards").removeClass("hidden");
            $(".focuscards").addClass("hidden");
            pickMode = true;
        }
    }
};

var apiFailure = function(data) {
    console.log('Failed call' + JSON.stringify(data, null, 2));
};

var closeCard = function(cardId, shouldClose){
    window.Trello.rest('PUT', '/cards/' + cardId, {closed: shouldClose}, statusSuccess);
};

var statusSuccess = function(data){
    for(var i = 0; i < focusCards.length; i ++){
        if(focusCards[i]['id'] == data['id']){
            focusCards.splice(i, 1);
        }
    }

    getNewCards();
    console.log('Success' + JSON.stringify(data, null, 2));
};

var storePick = function(pick){
    var notInList = true;
    for(var i = 0; i < focusCards.length; i++) {
        if(pick.id == focusCards[i].id) {
            focusCards.splice(i, 1);
            $('#' + pick.id).removeClass('selected');
            notInList = false;
            break;
        }
    }

    if (notInList) {
        focusCards.push(pick);
        $('#' + pick.id).addClass('selected');
    }

    console.log(focusCards.length);
    toggleFocusMode();
};

var resetPicks = function(){
    clearList(focusCards);
    toggleFocusMode();
};

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