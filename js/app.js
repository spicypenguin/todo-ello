var boardId = '';
var highPriorityList = { id: 0, name: 'Highest' };
var lowPriorityList = { id: 0, name: 'Medium' };
var extraCurricularList = { id: 0, name: 'Low' };

var highPriority = [];
var lowPriority = [];
var extraCurricular = [];
var allCards = [];

var doneHighPriority = [];
var doneLowPriority = [];
var doneExtraCurricular = [];
var allDone = [];

var todoCards = new Vue( {
    el: '#todos',
    data: {
        listOne: highPriorityList,
        listTwo: lowPriorityList,
        listThree: extraCurricularList,
        highCards: highPriority,
        highAdd: '',
        lowCards: lowPriority,
        lowAdd: '',
        extraCards: extraCurricular,
        extraAdd: '',
        doneHigh: doneHighPriority,
        doneLow: doneLowPriority,
        doneExtra: doneExtraCurricular,
        allCards: allCards,
        allDone: allDone
    },
    methods: {
        doHighSubmit: function () {
            createCard( 'high', this.highAdd );
            this.highAdd = '';
        },
        doLowSubmit: function () {
            createCard( 'low', this.lowAdd );
            this.lowAdd = '';
        },
        doExtraSubmit: function () {
            createCard( 'extra', this.extraAdd );
            this.extraAdd = '';
        },
        closeCard: function ( event ) {
            closeCard( event.target.id, event.target.checked );
        }
    }
} );

var getRelevantCards = function () {
    window.Trello.rest(
        'GET',
        '/boards/' + selectedBoard.id + '/cards',
        getCardsSuccess,
        apiFailure
    );
    window.Trello.rest(
        'GET',
        '/boards/' + selectedBoard.id + '/cards/closed',
        getClosedCardsSuccess,
        apiFailure
    );
};

var getCardsSuccess = function ( data ) {
    console.log( JSON.stringify( data, null, 2 ) );
    for ( var i = 0; i < data.length; i++ ) {
        if ( data[ i ][ 'idList' ] == highPriorityList.id ) {
            highPriority.push( data[ i ] );
        } else if ( data[ i ][ 'idList' ] == lowPriorityList.id ) {
            lowPriority.push( data[ i ] );
        } else if ( data[ i ][ 'idList' ] == extraCurricularList.id ) {
            extraCurricular.push( data[ i ] );
        }

        allCards.push( data[ i ] );
    }
};

var getClosedCardsSuccess = function ( data ) {
    var sortedData = data.sort( function ( a, b ) {
        return a.dateLastActivity < b.dateLastActivity;
    } );

    var currDate = new Date();
    var hoursBack = 24;
    if ( currDate.getDay() == 0 ) {
        hoursBack = 48;
    } else if ( currDate.getDay() == 1 ) {
        hoursBack = 72;
    }

    for ( var i = 0; i < sortedData.length; i++ ) {
        var msgDate = new Date( sortedData[ i ][ 'dateLastActivity' ] )
        if ( Math.floor( ( currDate - msgDate ) / ( 1000 * 60 * 60 ) ) <= hoursBack ) {
            if ( sortedData[ i ][ 'idList' ] == highPriorityList.id ) {
                doneHighPriority.push( sortedData[ i ] );
            } else if ( sortedData[ i ][ 'idList' ] == lowPriorityList.id ) {
                doneLowPriority.push( sortedData[ i ] );
            } else if ( sortedData[ i ][ 'idList' ] == extraCurricularList.id ) {
                doneExtraCurricular.push( sortedData[ i ] );
            }

            allDone.push( data[ i ] );
        }
    }
};

var apiFailure = function ( data ) {
    console.log( 'Failed call' + JSON.stringify( data, null, 2 ) );
};

var closeCard = function ( cardId, shouldClose ) {
    if ( shouldClose ) {
        $( "#" + cardId ).parent().addClass( "completed" );
    } else {
        $( "#" + cardId ).parent().removeClass( "completed" );
    }
    console.log( cardId, shouldClose );
    window.Trello.rest( 'PUT', '/cards/' + cardId, { closed: shouldClose }, statusSuccess );
};

var createCard = function ( list, cardName ) {
    var idList = '';

    switch ( list ) {
        case 'high':
            idList = highPriorityList.id;
            break;
        case 'low':
            idList = lowPriorityList.id;
            break;
        case 'extra':
            idList = extraCurricularList.id;
            break;
    }
    window.Trello.rest( 'POST', '/cards', { idList: idList, name: cardName }, cardSuccess, apiFailure );
};

var statusSuccess = function ( data ) {
    console.log( 'Success' + JSON.stringify( data, null, 2 ) );
};

var cardSuccess = function ( data ) {
    console.log( 'Success' + JSON.stringify( data, null, 2 ) );
    switch ( data[ 'idList' ] ) {
        case highPriorityList.id:
            highPriority.push( data );
            break;
        case lowPriorityList.id:
            lowPriority.push( data );
            break;
        case extraCurricularList.id:
            extraCurricular.push( data );
            break;
    }
};

var logout = function () {
    localStorage.removeItem( 'board' );
    localStorage.removeItem( 'highPriorityList' );
    localStorage.removeItem( 'lowPriorityList' );
    localStorage.removeItem( 'trello_token' );
};


var authenticationSuccess = function ( data ) {
    console.log( 'Successful authentication' );

    getLocalStorage();
    getRelevantCards();

};

var getLocalStorage = function () {
    if ( typeof ( Storage ) !== "undefined" ) {
        // get board ID from local storage, or redirect to configure if not set
        if ( localStorage.getItem( 'boardId' ) == null ||
            localStorage.getItem( 'highPriorityList' ) == null ||
            localStorage.getItem( 'lowPriorityList' ) == null ||
            localStorage.getItem( 'extraCurricularList' ) == null ) {
            window.location.replace( "configure.html" );
        } else {
            console.log( 'Getting data from local storage' );
            selectedBoard = JSON.parse( localStorage.getItem( 'boardId' ) );
            listOne = JSON.parse( localStorage.getItem( 'highPriorityList' ) );
            listTwo = JSON.parse( localStorage.getItem( 'lowPriorityList' ) );
            listThree = JSON.parse( localStorage.getItem( 'extraCurricularList' ) );

            highPriorityList.id = listOne.id;
            highPriorityList.name = listOne.name;

            lowPriorityList.id = listTwo.id;
            lowPriorityList.name = listTwo.name;

            extraCurricularList.id = listThree.id;
            extraCurricularList.name = listThree.name;
        }
    } else {
        console.log( 'Could not access local storage, failing out' );
        window.location.replace( "https://www.youtube.com/watch?v=dQw4w9WgXcQ" );
    }
};

window.Trello.authorize( {
    type: 'popup',
    name: 'Todo-ello',
    scope: {
        read: 'true',
        write: 'true'
    },
    expiration: 'never',
    success: authenticationSuccess,
    error: apiFailure
} );

$( document ).ready( function () {
    getLocalStorage();
    $( '#logout' ).click( function ( e ) { e.preventDefault(); logout(); return false; } );
} );