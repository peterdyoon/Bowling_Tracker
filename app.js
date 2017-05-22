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
            bowl1display:'',
            strikebonus: 0,
            sparebonus: 0,
            bowl2: 0,
            bowl2display:'',
            bowl2tab: false,
            bowl3: 0,
            bowl3display:0,
            activetab: 1,
            bowl3tab: false,
            frametotal: 0,
            aggtotal: 0,
            framenum: i + 1,
            key: i, 
            bowl1Pad: [1, 2, 3, 4, 5, 6, 7, 8, 9, 'X', 0,], 
            bowl2Pad: [],
            bowl3Pad: []
        })
    }
    $scope.spareCalcMaker = function(frame) {
        var dumArray = [];
        var myrange = 0
        if (frame.bowl1 === 10 && frame.bowl2 === 10) {
            frame.bowl1display = 'X';
            frame.bowl2display = 'X';
            return frame.bowl1Pad;
        } else if (frame.bowl1 === 10 && frame.activetab === 1) {
            frame.bowl1display = 'X';
            frame.bowl2display = frame.bowl2;
            return frame.bowl1Pad;
        } else if (frame.bowl1 === 10 && frame.activetab === 2) {
            frame.bowl1display = 'X';
            frame.bowl2display = frame.bowl2;
            myrange = 10 - frame.bowl2;
        } else if (frame.bowl1 + frame.bowl2 === 10) {
            frame.bowl1display = frame.bowl1;
            frame.bowl2display = '/';
            return frame.bowl1Pad;
        } else {
            myrange = 10 - frame.bowl1;
        }
        for (var i = 1; i < myrange; i++) {
            dumArray.push(i);
        }
//        for (var i = 1; i < 10; i++) {
//            if (i < myrange) {
//                dumArray.push(i);
//            } else {
//                dumArray.push('');
//            }
//        }
        dumArray.push(0);
        dumArray.push('/');
        return dumArray;
    }
    $scope.calcTranslator = function(frame, calc) {
        if (typeof calc === 'string') {
            if (calc.toLowerCase() === 'x') {
                return 10;
            } else if (calc === '/') {
                if (frame.key === 9 && frame.activetab === 3) {
                    return 10 - frame.bowl2;
                } else {
                    return 10 - frame.bowl1;
                }
            }
        } else {
            return calc;
        }
        return false;
    }
    $scope.selectTab = function(frame, num) {
        frame.activetab = num;
        return false;
    }
    $scope.calcFrame = function (frame) {
        if (frame.bowl1 === 10 && frame.key !== 9) {
            frame.bowl2 = 0;
        }
        myData[frame.key].frametotal = frame.bowl1 + frame.bowl2 + frame.bowl3;
        showCheck(myData[frame.key]);
        for (var i = 0; i < myData.length; i++) {
            if (myData[i].bowl1 === 10) {
                myData[i].bowl1display = 'X';
                strikeCalculator(myData[i]);
                myData[i].sparebonus = 0;
            } else if (myData[i].bowl2 + myData[i].bowl1 === 10 && myData[i].bowl1 !== 10) {
                myData[i].bowl2display = '/';
                spareCalculator(myData[i]);
                myData[i].strikebonus = 0;
            } else {
                myData[i].bowl1display = myData[i].bowl1;
                myData[i].bowl2display = myData[i].bowl2;
                myData[i].bowl3display = myData[i].bowl3;
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
                myData[frame.key].bowl2display = 'X';
                myData[frame.key].strikebonus = 10 + myData[frame.key].bowl3;
            } else {
                myData[frame.key].strikebonus = myData[frame.key].bowl2 + myData[frame.key].bowl3;
            }
            if (myData[frame.key].bowl3 === 10) {
                myData[frame.key].bowl3display = 'X';
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
        myData[frame.key].sparebonus = 0;
        if (frame.key === 9) {
            myData[frame.key].sparebonus = myData[frame.key].bowl3;
        } else {
            myData[frame.key].sparebonus = myData[frame.key + 1].bowl1;
        }
    }
    var showCheck = function (frame) {
        if (frame.key === 9 && frame.frametotal > 9){
            frame.bowl2tab = true;
            frame.bowl3tab = true;
        } else if (frame.bowl1 === 10) {
            frame.bowl2tab = false;
            frame.bowl3tab = false;
        } else {
            frame.bowl2tab = true;
            frame.bowl3tab = false;
        }
    }
    database.ref().child('/scores/0').set(myData);
});