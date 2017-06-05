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

var app = angular.module('MyApp', ['firebase', 'ngRoute']);

app.config(['$routeProvider', '$locationProvider', function
    ($routeProvider, $locationProvider) {
        $routeProvider.when("/pageMain", {
            templateUrl: "Templates/main.html"
        }).when("/createnew", {
            templateUrl: "Templates/scoreCalculator.html"
        }).when("/viewrecords", {
            templateUrl: "Templates/viewRecords.html"
        })
}]);

app.controller('myNavController', ['$scope', function ($scope) {
    $scope.tab = 0;
    $scope.selectTab = function (newTab) {
        $scope.tab = newTab;
    };
}]);

app.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
  }
]);

app.controller("MyAuthCtrl", ["$scope", "Auth", function ($scope, Auth) {
    $scope.auth = Auth;
    $scope.createUser = function() {
      $scope.message = null;
      $scope.error = null;

      // Create a new user
      $scope.auth.$createUserWithEmailAndPassword($scope.email, $scope.password)
        .then(function(firebaseUser) {
          $scope.message = "User created with uid: " + firebaseUser.uid;
        }).catch(function(error) {
          $scope.error = error;
        });
    };
    $scope.deleteUser = function() {
      $scope.message = null;
      $scope.error = null;

      // Delete the currently signed-in user
      $scope.auth.$deleteUser().then(function() {
        $scope.message = "User deleted";
      }).catch(function(error) {
        $scope.error = error;
      });
    };
    $scope.auth.$onAuthStateChanged(function(firebaseUser) {
      $scope.firebaseUser = firebaseUser;
    });
    
    //Google Sign in
    $scope.provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup($scope.provider).then(function (result) {
        var token = result.credential.accessToken;
        var user = result.user;
        console.log(token, user + ' : it worked!');
    }).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
        console.log(errorMessage + ' ' + email + ' ' + credential);
    });
//    $scope.auth.$signInWithPopup("google").then(function (result) {
//        // This gives you a Google Access Token. You can use it to access the Google API.
//        var token = result.credential.accessToken;
//        // The signed-in user info.
//        var user = result.user;
//        // ...
//    }).catch(function (error) {
//        // Handle Errors here.
//        var errorCode = error.code;
//        var errorMessage = error.message;
//        // The email of the user's account used.
//        var email = error.email;
//        // The firebase.auth.AuthCredential type that was used.
//        var credential = error.credential;
//        // ...
//    });
}]);

app.controller('myController', ['$scope', '$firebaseArray', function ($scope, $firebaseArray) {
    $scope.editRecord = {};
    $scope.frame = {};
    $scope.selectRecord = function (record, scores) {
        $scope.editRecord = record;
        $scope.frame = scores;
    }
    $scope.allData = $firebaseArray(database.ref('/scores/'));
    $scope.allData.$loaded().then(function (x) {
        for (var i = 0; i < $scope.allData.length; i++) {
            $scope.allData[i].__proto__ = Profile.prototype;
            for (var j = 0; j < 10; j++) {
                $scope.allData[i].scores[j].__proto__ = Scores.prototype;
            }
        }
    }).catch(function (error) {
        console.log("Error:", error);
    });

    $scope.createNewRecord = function (newName, newEmail) {
        $scope.scoreData = new Profile(newName, newEmail);
        $scope.scoreData.createScores();
        return false;
    }
    $scope.saveNewRecord = function (myDataSet, myData) {
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
                myDataSet.strikes++;
                bowlstrikecount++;
            }
            if (myData[i].bowl2display === 'X') {
                myDataSet.strikes++;
            } else if (myData[i].bowl2display === '/') {
                myDataSet.spares++;
                bowlsparecount++;
            }
            if (myData[i].bowl3display === 'X') {
                myDataSet.strikes++;
            } else if (myData[i].bowl3display === '/') {
                myDataSet.spares++;
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
}]);

function Profile(name, email) {
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
}
Profile.prototype.refreshScores = function () {
    for (var i = 0; i < this.scores.length; i++) {
        frame = this.scores[i];
        if (frame.bowl1 === 10) {
            this.strikeCalculator(frame.key);
        } else if (frame.bowl2 + frame.bowl1 === 10 && frame.bowl1 !== 10) {
            this.spareCalculator(frame.key);
        } else {
            this.noMarkCalculator(frame.key);
        }
        this.aggTotalCalculator(i);
    }
}
Profile.prototype.createScores = function () {
    for (var i = 0; i < 10; i++) {
        this.scores.push(new Scores(i));
    }
}
Profile.prototype.strikeCalculator = function (key) {
    this.scores[key].strikebonus = 0;
    this.scores[key].sparebonus = 0;
    // Special Rules for Frame 9
    if (key === 8) {
        if (this.scores[key + 1].bowl1 === 10) {
            this.scores[key].strikebonus = 10 + this.scores[key + 1].bowl2;
        } else {
            this.scores[key].strikebonus = this.scores[key + 1].bowl1 + this.scores[key + 1].bowl2;
        }
        // Special Rules for Frame 10
    } else if (key === 9) {
        if (this.scores[key].bowl2 === 10) {
            this.scores[key].strikebonus = 10 + this.scores[key].bowl3;
        } else {
            this.scores[key].strikebonus = this.scores[key].bowl2 + this.scores[key].bowl3;
        }
        if (this.scores[key].bowl3 === 10) {}
    } else {
        if (this.scores[key + 1].bowl1 === 10) {
            this.scores[key].strikebonus = 10 + this.scores[key + 2].bowl1;
        } else {
            this.scores[key].strikebonus = this.scores[key + 1].frametotal;
        }
    }
}
Profile.prototype.spareCalculator = function (key) {
    this.scores[key].sparebonus = 0;
    this.scores[key].strikebonus = 0;
    if (key === 9) {
        this.scores[key].sparebonus = this.scores[key].bowl3;
    } else {
        this.scores[key].sparebonus = this.scores[key + 1].bowl1;
    }
}
Profile.prototype.noMarkCalculator = function (key) {
    this.scores[key].strikebonus = 0;
    this.scores[key].sparebonus = 0;
}
Profile.prototype.aggTotalCalculator = function (key) {
    this.scores[key].aggtotal = 0;
    if (key === 0) {
        this.scores[key].aggtotal += this.scores[key].frametotal + this.scores[key].strikebonus + this.scores[key].sparebonus;
    } else if (key === 9) {
        if (this.scores[key].bowl1 === 10) {
            this.scores[key].aggtotal += this.scores[key - 1].aggtotal + this.scores[key].bowl1 + this.scores[key].strikebonus + this.scores[key].sparebonus;
        } else {
            this.scores[key].aggtotal += this.scores[key - 1].aggtotal + this.scores[key].bowl1 + this.scores[key].bowl2 + this.scores[key].strikebonus + this.scores[key].sparebonus;
        }
    } else {
        this.scores[key].aggtotal += this.scores[key - 1].aggtotal + this.scores[key].frametotal + this.scores[key].strikebonus + this.scores[key].sparebonus;
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
}

Scores.prototype.selectTab = function (num) {
    this.activetab = num;
    return false;
}
Scores.prototype.bowl1scoreConversion = function (calc) {
    this.bowl2 = 0;
    this.bowl2display = '';
    this.bowl3 = 0;
    this.bowl3display = '';
    if (calc === 'X') {
        this.bowl1 = 10;
        this.bowl1display = 'X';
    } else {
        this.bowl1 = calc;
        this.bowl1display = calc;
    }
    this.frametotal = this.bowl1 + this.bowl2 + this.bowl3;
    return false;
}
Scores.prototype.bowl2scoreConversion = function (calc) {
    this.bowl3 = 0;
    this.bowl3display = '';
    if (calc === 'X') {
        this.bowl2 = 10;
        this.bowl2display = 'X';
    } else if (calc === '/') {
        this.bowl2 = 10 - this.bowl1;
        this.bowl2display = '/';
    } else {
        this.bowl2 = calc;
        this.bowl2display = calc;
    }
    this.frametotal = this.bowl1 + this.bowl2 + this.bowl3;
    return false;
}
Scores.prototype.bowl3scoreConversion = function (calc) {
    if (calc === 'X') {
        this.bowl3 = 10;
        this.bowl3display = 'X';
    } else if (calc === '/') {
        this.bowl3 = 10 - this.bowl2;
        this.bowl3display = '/';
    } else {
        this.bowl3 = calc;
        this.bowl3display = calc;
    }
    this.frametotal = this.bowl1 + this.bowl2 + this.bowl3;
    return false;
}
Scores.prototype.activateTab = function () {
    if (this.key === 9 && this.frametotal > 9) {
        if (this.bowl1 === 10 && this.bowl2display === '') {
            this.bowl2tab = true;
            this.bowl3tab = false;
            this.selectTab(2);
        } else {
            this.bowl2tab = true;
            this.bowl3tab = true;
            this.selectTab(3);
        }
    } else if (this.bowl1 === 10) {
        this.bowl2tab = false;
        this.bowl3tab = false;
    } else {
        this.bowl2tab = true;
        this.bowl3tab = false;
        this.selectTab(2);
    }
}
Scores.prototype.bowl2NumPadMaker = function () {
    var dumArray = [];
    var myrange = 0
    if (this.bowl1 === 10 && this.activetab === 1) {
        this.bowl2Pad = this.bowl1Pad;
        return false;
    } else {
        myrange = 10 - this.bowl1;
    }
    for (var i = 1; i < myrange; i++) {
        dumArray.push(i);
    }
    dumArray.push(0);
    dumArray.push('/');
    this.bowl2Pad = dumArray;
    return false;
}
Scores.prototype.bowl3NumPadMaker = function () {
    var dumArray = [];
    var myrange = 0
    if (this.bowl1 === 10 && this.bowl2 === 10 || (this.bowl1 + this.bowl2) === 10) {
        this.bowl3Pad = this.bowl1Pad;
    } else {
        myrange = 10 - this.bowl2;
        for (var i = 1; i < myrange; i++) {
            dumArray.push(i);
        }
        dumArray.push(0);
        dumArray.push('/');
        this.bowl3Pad = dumArray;
    }

}
