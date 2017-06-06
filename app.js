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
            controller: "myController",
            templateUrl: "Templates/main.html",
            resolve: {
                "currentAuth": ["Auth", function(Auth) {
                    return Auth.$requireSignIn();
                }]
            }
        }).when("/createnew", {
            controller: "myController",
            templateUrl: "Templates/scoreCalculator.html",
            resolve: {
                "currentAuth": ["Auth", function(Auth) {
                    return Auth.$requireSignIn();
                }]
            }
        }).when("/viewrecords", {
            controller: "myController",
            templateUrl: "Templates/viewRecords.html", 
            resolve: {
                "currentAuth": ["Auth", function(Auth) {
                    return Auth.$requireSignIn();
                }]
            }
        }).when("/signin", {
            templateUrl: "Templates/profile.html",
        }).when("/editrecord", {
            controller: "myController",
            templateUrl: "Templates/editRecords.html", 
            resolve: {
                "currentAuth": ["Auth", function(Auth) {
                    return Auth.$requireSignIn();
                }]
            }
        })
}]);

app.controller("myNavController", ['$scope', function ($scope) {
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

app.controller("MyAuthCtrl", ["$scope", "Auth", "$firebaseArray", function ($scope, Auth, $firebaseArray) {
    $scope.auth = Auth;
    $scope.newAccount = false;
    $scope.user = null;
    $scope.nameChange = false;
    $scope.emailChange = false;
    $scope.tempBugSolution = true;
    $scope.createUser = function() {
      $scope.message = null;
      $scope.error = null;
        $scope.auth.$createUserWithEmailAndPassword($scope.email, $scope.password)
        .then(function(firebaseUser) {
            $firebaseArray(database.ref('/users/')).$add(firebaseUser);
        }).catch(function(error) {
          $scope.error = error;
        });
    };
    $scope.updateName = function() {
        $scope.user.updateProfile({
          displayName: $scope.name,
        }).then(function() {
          // Update successful.
        }, function(error) {
          // An error happened.
        });
        $scope.nameChange = true;
        return false;
    }
    $scope.updateEmail = function() {
        $scope.user.updateEmail($scope.email).then(function() {
        // Update successful.
        }, function(error) {
        // An error happened.
            console.log(error);
        });
        $scope.emailChange = true;
        $scope.tempBugSolution = false;
        return false;
    }
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
        $scope.newAccount = false;
        $scope.name = firebaseUser.displayName;
        if ($scope.tempBugSolution) {
            $scope.email = firebaseUser.email;
        }
        $scope.user = firebase.auth().currentUser;
    });
    //Guest Sign In
   $scope.guestsignin = function() {
        $scope.auth.$signInAnonymously().then(function(firebaseUser) {
        console.log("Signed in as:", firebaseUser.uid);
        }).catch(function(error) {
        console.error("Authentication failed:", error);
        });
   } 
    
    //Google Sign in
    $scope.signinGoogle = function() {
        $scope.auth.$signInWithPopup("google").then(function (result) {
            console.log("Signed in as:", result.user.uid);
        }).catch(function (error) {
            console.error("Authentication failed:", error);
        });
    }
}]);

app.controller('myController', ['$scope', '$firebaseArray', "currentAuth", function ($scope, $firebaseArray, currentAuth) {
    $scope.currentUser = currentAuth;
    $scope.editRecord = {};
    $scope.frame = {};
    $scope.scoreData = {};
    $scope.selectRecord = function (record, scores) {
        $scope.editRecord = record;
        $scope.frame = scores;
        $scope.recordSelected = true;
    }
    $scope.allData = $firebaseArray(database.ref('/scores/'));
    $scope.allDataUsers = $firebaseArray(database.ref('/users/'));
    $scope.userData = [];
    $scope.userDataProfile = null;
    $scope.allData.$loaded().then(function (result) {
        for (var i = 0; i < $scope.allData.length; i++) {
            $scope.allData[i].__proto__ = Profile.prototype;
            if ($scope.currentUser.email === $scope.allData[i].Email) {
                    $scope.userData.push($scope.allData[i]);
                }
            for (var j = 0; j < 10; j++) {
                $scope.allData[i].scores[j].__proto__ = Scores.prototype;
            }
        }
    }).catch(function (error) {
        console.log("Error:", error);
    });
    $scope.allDataUsers.$loaded().then(function (result) {
        for (var i = 0; i < result.length; i ++) {
            if ($scope.currentUser.email === result[i].email) {
                console.log('Hit!' + result[i]);
                $scope.userDataProfile = result[i];
            }
        }
    }).catch(function (error) {
        console.log("Error:", error);
    });

    $scope.createNewRecord = function (newName, newEmail) {
        $scope.scoreData = new Profile(newName, newEmail);
        $scope.scoreData.createScores();
        $scope.scoreData.Name = $scope.currentUser.displayName;
        $scope.scoreData.Email = $scope.currentUser.email;
        $scope.scoreData.checkFinishedGame();
        $scope.allData.$add($scope.scoreData).then(function(ref) {
            var index = $scope.allData.$indexFor(ref.key);
            $scope.scoreData = $scope.allData[index];
            $scope.scoreData.__proto__ = Profile.prototype;
            for (var i = 0; i < 10; i++) {
                $scope.scoreData.scores[i].__proto__ = Scores.prototype;
            }
            console.log($scope.scoreData);
        });
        return false;
    }
    $scope.saveEditedRecord = function (record) {
        record.resetProfile();
        record.bowlAverage();
        record.strikespareCount();
        record.checkFinishedGame();
        if ($scope.userDataProfile !== null) {
            for (var i = 0; i < $scope.userData.length; i++) {
                $scope.userDataProfile.strikes += record.strikes;
                $scope.userDataProfile.spares += record.spares;
                $scope.userDataProfile.total += record.total;
            }
        }
        $scope.allData.$save(record).then(function(ref) {
            for (var j = 0; j < 10; j++) {
                record.scores[j].__proto__ = Scores.prototype;
            }
        });
        $scope.allDataUsers.$save($scope.userDataProfile);
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
    this.bowlstrikecount = 0;
    this.bowlsparecount = 0;
    this.bowl1count = 0;
    this.bowl2count = 0;
    this.gameFinished = false;
    this.scores = [];
}
Profile.prototype.checkFinishedGame = function() {
    for (var i = 0; i < this.scores.length; i++) {
        if (this.scores[i].bowl1display === "") {
            this.gameFinished = 'Unfinished';
            return false;
        } else if (this.scores[i].bowl2tab && this.scores[i].bowl2display === "") {
            this.gameFinished = 'Unfinished';
            return false;
        } else if (this.scores[i].bowl3tab && this.scores[i].bowl3display === "") {
            this.gameFinished = 'Unfinished';
            return false;
        } else {
            this.gameFinished = 'Complete';
        }
    }
    console.log(this.scores[0]);
    return false;
}
Profile.prototype.resetProfile = function() {
    this.strikes = 0;
    this.strikebonusave = 0;
    this.spares = 0;
    this.sparebonusave = 0;
    this.bowl1average = 0;
    this.bowl2average = 0;
    this.bowlstrikecount = 0;
    this.bowlsparecount = 0;
    this.bowl1count = 0;
    this.bowl2count = 0;
}
Profile.prototype.bowlAverage = function() {
    for (var i = 0; i < this.scores.length; i++) {
        delete this.scores[i].$$hashKey;
        this.bowl1average += this.scores[i].bowl1;
        this.bowl1count++;
        if (this.scores[i].bowl1 !== 10) {
            this.bowl2average += this.scores[i].bowl2;
            this.bowl2count++;
        }
        if (this.scores[i].key === 9) {
            if (this.scores[i].bowl1 === 10 && this.scores[i].bowl2 === 10) {
                this.bowl1average += this.scores[i].bowl2 + this.scores[i].bowl3;
                this.bowl1count += 2;
            } else if (this.scores[i].bowl1 === 10) {
                this.bowl1average += this.scores[i].bowl2;
                this.bowl1count++;
                this.bowl2average += this.scores[i].bowl3;
                this.bowl2count++;
            } else if (this.scores[i].bowl1 + this.scores[i].bowl2 === 10) {
                this.bowl1average += this.scores[i].bowl3;
                this.bowl1count++;
                this.bowl2average += this.scores[i].bowl2;
                this.bowl2count++;
            }
        }
    }
    if (this.bowl2count === 0) {
        this.bowl2count = 1;
    }
    this.bowl1average = (this.bowl1average / this.bowl1count).toFixed(2);
    this.bowl2average = (this.bowl2average / this.bowl2count).toFixed(2);
    this.total = this.scores[9].aggtotal;
}
Profile.prototype.strikespareCount = function() {
    for (var i = 0; i < this.scores.length; i++) {
        if (this.scores[i].bowl1display === 'X') {
            this.strikes++;
            this.bowlstrikecount++;
        }
        if (this.scores[i].bowl2display === 'X') {
            this.strikes++;
        } else if (this.scores[i].bowl2display === '/') {
            this.spares++;
            this.bowlsparecount++;
        }
        if (this.scores[i].bowl3display === 'X') {
            this.strikes++;
        } else if (this.scores[i].bowl3display === '/') {
            this.spares++;
        }
        this.strikebonusave += this.scores[i].strikebonus;
        this.sparebonusave += this.scores[i].sparebonus;
    }
    if (this.bowlstrikecount !== 0) {
        this.strikebonusave = (this.strikebonusave / this.bowlstrikecount).toFixed(2)
    }
    if (this.bowlsparecount !== 0) {
        this.sparebonusave = (this.sparebonusave / this.bowlsparecount).toFixed(2);
    }
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
