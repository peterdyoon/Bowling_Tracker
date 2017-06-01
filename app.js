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

var app = angular.module('MyApp', ['firebase']);

function Profile(name, email){
    this.Name = name;
    this.Email = email;
    this.bowl1average = 0;
    this.bowl2average = 0;
    this.strikes = 0;
    this.strikebonusave = 0;
    this.spares = 0;
    this.sparebonusave = 0;
    this.total = 0;
    this.scores = [];
    for (var i = 0; i < 10; i++) {
        this.scores.push(new Scores(i));
    }
    this.strikeCalculator = function(key) {
        this.scores[key].bowl1display = 'X';
        this.scores[key].strikebonus = 0;
        this.scores[key].sparebonus = 0;
        if (key === 8) {
            if (this.scores[key + 1].bowl1 === 10) {
                this.scores[key].strikebonus = 10 + this.scores[key + 1].bowl2;
            } else {
                this.scores[key].strikebonus = this.scores[key + 1].bowl1 + this.scores[key + 1].bowl2;
            }
        } else if (key === 9) {
            if (this.scores[key].bowl2 === 10) {
                this.scores[key].bowl2display = 'X';
                this.scores[key].strikebonus = 10 + this.scores[key].bowl3;
            } else {
                this.scores[key].strikebonus = this.scores[key].bowl2 + this.scores[key].bowl3;
            }
            if (this.scores[key].bowl3 === 10) {
                this.scores[key].bowl3display = 'X';
            }
        } else {
            if (this.scores[key + 1].bowl1 === 10) {
                this.scores[key].strikebonus = 10 + this.scores[key + 2].bowl1;
            } else {
                this.scores[key].strikebonus = this.scores[key + 1].frametotal;
            }
        }
    }
    this.refreshScores = function() {
        for (var i = 0; i < this.scores.length; i++) {
            //strike calculator, spare calculator, non-strike/spare calculator, agg-total calculator
            
            frame = this.scores[i]
            
            frame.frametotal = frame.bowl1 + frame.bowl2 + frame.bowl3;
            
            if (frame.bowl1 === 10) {
                strikeCalculator(frame.key);
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
    }
}

function Scores(i) {
    this.bowl1 = 0;
    this.bowl2 = 0;
    this.bowl3 = 0;
    this.bowl1display = '';
    this.bowl2display = '';
    this.bowl2tab = false;
    this.bowl3display = 0;
    this.bowl3tab = false;
    this.activetab = 1;
    this.strikebonus = 0;
    this.sparebonus = 0;
    this.frametotal = 0;
    this.aggtotal = 0;
    this.framenum = i + 1;
    this.key = i;
    this.bowl1Pad = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'X', 0, ];
    this.bowl2Pad = [];
    this.bowl3Pad = [];
    this.bowl1scoreConversion = function(calc) {
        if (calc === 'X') {
            this.bowl1 = 10;
        } else {
            this.bowl1 = calc;
        }
        return false;
    }
    this.bowl2scoreConversion = function(calc) {
        if (calc === '/') {
            this.bowl2 = 10 - this.bowl1;
        } else {
            this.bowl2 = calc;
        }
        return false;
    }
    this.bowl3scoreConversion = function(calc) {
        if (calc === 'X') {
            this.bowl3 = 10;
        } else if (calc === '/') {
            this.bowl3 = 10 - this.bowl2;
        } else {
            this.bowl2 = calc;
        }
        return false;
    }
    this.resetbowl2and3 = function() {
        this.bowl2 = 0;
        this.bowl3 = 0;
        this.bowl2display = 0;
        this.bowl3display = 0;
    }
    this.resetbowl3 = function() {
        this.bowl3 = 0;
        this.bowl3display = 0;
    }
    this.activateTab = function() {
        if (this.key === 9 && this.frametotal > 9){
            this.bowl2tab = true;
            this.bowl3tab = true;
        } else if (frame.bowl1 === 10) {
            this.bowl2tab = false;
            this.bowl3tab = false;
        } else {
            this.bowl2tab = true;
            this.bowl3tab = false;
        }
    }
}

app.controller('myController', ['$scope', '$firebaseArray', function ($scope, $firebaseArray) {
    $scope.editrecord = {};
    $scope.allData = $firebaseArray(database.ref('/scores/'));
//    myDataSet = $scope.scoreData;
//    myData = myDataSet.scores;
    $scope.createNewRecord = function(newName, newEmail) {
        $scope.scoreData = new Profile(newName, newEmail);
        return false;
    }
    $scope.saveNewRecord = function(myDataSet, myData) {
        if (myData[9].bowl2tab === false) {
            alert("Your new record is incomplete. Please finish.");
            return false;
        }
        myDataSet.strikes = 0;
        bowlstrikecount = 0;
        myDataSet.strikebonusave = 0;
        myDataSet.spares = 0;
        bowlsparecount = 0;
        myDataSet.sparebonusave = 0;
        myDataSet.bowl1average = 0;
        myDataSet.bowl2average = 0;
        bowl1count = 0;
        bowl2count = 0;
        for (var i = 0; i < myData.length; i++) {
            delete myData[i].$$hashKey;
            
//            Bowl1 and Bowl2 Average
            myDataSet.bowl1average += myData[i].bowl1;
            bowl1count++;
            if (myData[i].bowl1 !== 10) {
                myDataSet.bowl2average += myData[i].bowl2;
                bowl2count++;
            }
            if (myData[i].key === 9) {
                if (myData[i].bowl1 === 10 && myData[i].bowl2 === 10) {
                    myDataSet.bowl1average += myData[i].bowl2 + myData[i].bowl3;
                    bowl1count += 2;
                } else if (myData[i].bowl1 === 10) {
                    myDataSet.bowl1average += myData[i].bowl2;
                    bowl1count++;
                    myDataSet.bowl2average += myData[i].bowl3;
                    bowl2count++;
                } else if (myData[i].bowl1 + myData[i].bowl2 === 10) {
                    myDataSet.bowl1average += myData[i].bowl3;
                    bowl1count++;
                    myDataSet.bowl2average += myData[i].bowl2;
                    bowl2count++;
                }
            }
//            Strike and Spare Count
            if (myData[i].bowl1display === 'X') {
                myDataSet.strikes ++;
                bowlstrikecount ++;
            }
            if (myData[i].bowl2display === 'X') {
                myDataSet.strikes ++;
            } else if (myData[i].bowl2display === '/') {
                myDataSet.spares ++;
                bowlsparecount ++;
            }
            if (myData[i].bowl3display === 'X') {
                myDataSet.strikes ++;
            } else if (myData[i].bowl3display === '/') {
                myDataSet.spares ++;
            }
//            Strike and Spare Average
            myDataSet.strikebonusave += myData[i].strikebonus;
            myDataSet.sparebonusave += myData[i].sparebonus;
        }
//        Bowl 1 and Bowl 2 Average
        if (bowl2count === 0) {
            bowl2count = 1;
        }
        myDataSet.bowl1average = (myDataSet.bowl1average / bowl1count).toFixed(2);
        myDataSet.bowl2average = (myDataSet.bowl2average / bowl2count).toFixed(2);
//        Strike and Spare Average
        if (bowlstrikecount === 0) {
            bowlstrikecount = 1;
        }
        if (bowlsparecount === 0) {
            bowlsparecount = 1;
        }
        myDataSet.strikebonusave = (myDataSet.strikebonusave / bowlstrikecount).toFixed(2)
        myDataSet.sparebonusave = (myDataSet.sparebonusave / bowlsparecount).toFixed(2);
        
        myDataSet.total = myData[9].aggtotal;
        $scope.allData.$add(myDataSet);
        return false;
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
                myData[frame.key].strikebonus = myData[frame.key + 1].bowl1 + myData[frame.key + 1].bowl2;
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
}]);