var config = {
    apiKey: "AIzaSyCcGq7RWCs7vW7qk4Bf1K02G64ZJeQBZ14",
    authDomain: "bowlingstattracker.firebaseapp.com",
    databaseURL: "https://bowlingstattracker.firebaseio.com",
    projectId: "bowlingstattracker",
    storageBucket: "bowlingstattracker.appspot.com",
    messagingSenderId: "949953608405"
};
firebase.initializeApp(config);
var database = firebase.database();

var app = angular.module('MyApp', ['ngRoute']);

app.controller('myController', function ($scope) {
    database.ref().remove();
    $scope.scoreData = [];
    myData = $scope.scoreData;
    for (var i = 0; i < 10; i++) {
        myData.push({
            bowl1: 0,
            strikebonus: 0,
            sparebonus: 0,
            bowl2: 0,
            bowl3: 0,
            frametotal: 0,
            aggtotal: 0,
            framenum: i + 1,
            key: i
        })
    }
    myData[9].bowl3 = 0;
    $scope.calcFrame = function (frame) {
        if (frame.bowl1 > 10 || frame.bowl1 < 0) {
            alert("Scores can only be between 0 and 10. Input again.");
            return false;
        } else if ((frame.bowl2 > 10 - frame.bowl1 || frame.bowl2 < 0) && frame.key < 9) {
            alert("Please input a score between " + 0 + " and " + (10 - frame.bowl1) + ".");
            return false;
        }
        myData[frame.key].frametotal = frame.bowl1 + frame.bowl2;
        for (var i = 0; i < myData.length; i++) {
            if (myData[i].bowl1 === 10) {
                strikeCalculator(myData[i]);
                myData[i].sparebonus = 0;
            } else if (myData[i].bowl2 + myData[i].bowl1 === 10 && myData[i].bowl1 !== 10) {
                spareCalculator(myData[i]);
                myData[i].strikebonus = 0;
            } else {
                myData[i].strikebonus = 0;
                myData[i].sparebonus = 0;
            }
            
            myData[i].aggtotal = 0;
            if (i === 0) {
                myData[i].aggtotal += myData[i].frametotal + myData[i].strikebonus + myData[i].sparebonus;
            } else if (i === 9) {
                if (myData[i].bowl1 === 10){
                    myData[i].aggtotal += myData[i - 1].aggtotal + myData[i].bowl1 + myData[i].strikebonus + myData[i].sparebonus;
                } else {
                    myData[i].aggtotal += myData[i - 1].aggtotal + myData[i].bowl1 + myData[i].bowl2 + myData[i].strikebonus + myData[i].sparebonus;
                }
            } else {
                myData[i].aggtotal += myData[i - 1].aggtotal + myData[i].frametotal + myData[i].strikebonus + myData[i].sparebonus;
            }
        }
    };
    var strikeCalculator = function (frame) {
        myData[frame.key].strikebonus = 0;
        if (frame.key === 8) {
            if (myData[frame.key + 1].bowl1 === 10) {
                myData[frame.key].strikebonus = 10 + myData[frame.key + 1].bowl2;
            } else {
                myData[frame.key].strikebonus = myData[frame.key + 1].frametotal;
            }
        } else if (frame.key === 9) {
            if (myData[frame.key].bowl2 === 10) {
                myData[frame.key].strikebonus = 10 + myData[frame.key].bowl3;
            } else {
                myData[frame.key].strikebonus = myData[frame.key].bowl2 + myData[frame.key].bowl3;
            }
        } else {
            if (myData[frame.key + 1].bowl1 === 10) {
                myData[frame.key].strikebonus = 10 + myData[frame.key + 2].bowl1;
            } else {
                myData[frame.key].strikebonus = myData[frame.key + 1].frametotal;
            }
        }
    }
    var spareCalculator = function (frame) {
        if (frame.key === 9) {
            myData[frame.key].sparebonus = myData[frame.key].bowl3;
        } else {
            myData[frame.key].sparebonus = myData[frame.key + 1].bowl1;
        }
    }
    database.ref().child('/scores/0').set(myData);
});