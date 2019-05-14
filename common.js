// Initialize Firebase
       var config = {
            apiKey: "AIzaSyDKdxfHSJAf6ZzPr1T_ELJxWIb-YTFGzNM",
            authDomain: "test-c7da1.firebaseapp.com",
            databaseURL: "https://test-c7da1.firebaseio.com",
            projectId: "test-c7da1",
            storageBucket: "test-c7da1.appspot.com",
            messagingSenderId: "550969625752"
        };
        firebase.initializeApp(config);
                
        // Check to see if you are logged in
        firebase.auth().onAuthStateChanged(function(user) {
            if (user == null) {
                alert("Not logged in.");
                return;
            } else {
                userId = user.uid;
                name = user.displayName;
                imageUrl = user.photoURL;
                email = user.email;
                    
                // write user data to users
                //writeUserData(userId, name, email, imageUrl);
                
                // write data to document
                mydiv = document.getElementById("mydata");
                mydiv.innerHTML = name
                myphotodiv = document.getElementById("myphoto");
                myphotodiv.innerHTML = "<img src='" + imageUrl + "'/>";

                firebase.database().ref('/tweets').once('value').then(function(snapshot) {
                    var data = (snapshot.val());
                    if (data == null) {
                      console.log("No data found at /tweets/" + userId);  
                    } else {
                        
                      firebase.database().ref('/users').once('value').then(function(snapshot) { 
                        var userdata = (snapshot.val());
                        if (userdata != null) {
                           dataarray = [data,userdata]
                           console.log(dataarray)
                           updatetweets(dataarray); 
                        }
                      });
                      //console.log(data)
                      //updatetweets(data);
                    }
                });
            } // end user null check
        }); // end check auth state
        
        function encodeImageFileAsURL() {

            var filesSelected = document.getElementById("inputFileToLoad").files;
            if (filesSelected.length > 0) {
                var fileToLoad = filesSelected[0];
                var fileReader = new FileReader();
                fileReader.onload = function(fileLoadedEvent) {
                    var srcData = fileLoadedEvent.target.result; // <--- data: base64
                    //var newImage = document.createElement('img');
                    //newImage.src = srcData;
                    //document.getElementById("imgTest").innerHTML = newImage.outerHTML;
                    document.getElementById("imgTest").innerHTML = srcData;
                    //console.log("Converted Base64 version is: " + document.getElementById("imgTest").innerHTML);
                    console.log(srcData);
                }
                fileReader.readAsDataURL(fileToLoad);
            }
        } // end function
        
        // write user data
        function writeUserData(userId, name, email, imageUrl) {
            firebase.database().ref('users/' + userId).set({
                username: name,
                email: email,
                profile_picture : imageUrl
            });
        }
        
        function updatetweets(data) {
            //var mylist = "<ul>";
            var mytab = "<table>";
            users = data[1]; // put on top, because changed data - not good coding change later
            data = data[0];
            
            for (var u in data) {
                for (var t in data[u]) {
                    mytab = mytab + "<tr>";
                    var date = new Date(data[u][t].time);
                    var time = date.toDateString();
                    console.log(time);
                    if (data[u][t].img != "") {
                        mytab = mytab + "<td><img src='" + users[u].profile_picture + "' width='100px'></td>";
                        mytab = mytab + "<td>" + users[u].username + "</td>";
                        mytab = mytab + "<td>" + data[u][t].tweet + "</td>";
                        mytab = mytab + "<td>" + time + "<br><img src='" + data[u][t].img + "' width='300px'></td>";
                    } else {
                        mytab = mytab + "<td><img src='" + users[u].profile_picture + "' width='100px'></td>";
                        mytab = mytab + "<td>" + users[u].username + "</td>";
                        mytab = mytab + "<td>" + data[u][t].tweet + "</td>";
                        mytab = mytab + "<td>" + time + "</td>";
                        
                        
                    } 
                    mytab = mytab + "</tr>";
                }   
            }
            //mylist = mylist + "</ul>";
            mytab = mytab + "</table>"
            var mytdiv = document.getElementById("mytweets");
            //mytdiv.innerHTML = mylist;
            mytdiv.innerHTML = mytab;
        }
        
        // write tweets to firebase
        function tweet() {
            
            
            var twitdoc = document.getElementById("twit");
            var twitimg = document.getElementById("imgTest");
            var nameValue = twitdoc.value;
            var imgValue = twitimg.innerHTML;
            var js_time = Date.now();
            var tweetid = firebase.database().ref('tweets/' + userId + "/").push({tweet: nameValue, time: js_time, img: imgValue}).catch(function(error) {
                alert("Error - Unacceptable Language");
            });
                
                
                
            twitdoc.value = "";
            writeUserData(userId, name, email, imageUrl);
            console.log("tweet written")
            
            firebase.database().ref('/tweets').once('value').then(function(snapshot) {
                    var data = (snapshot.val());
                    if (data == null) {
                      console.log("No data found at /tweets/" + userId);  
                    } else { 
                        firebase.database().ref('/users').once('value').then(function(snapshot) { 
                        var userdata = (snapshot.val());
                        if (userdata != null) {
                           dataarray = [data,userdata]
                           console.log(dataarray)
                           updatetweets(dataarray); 
                        }
                      });
                    }
                });
            
            
            // The unique key stored in tweetid is based on a timestamp, so list items will automatically be ordered chronologically. Because Firebase generates a unique key for each tweet, no write conflicts will occur if multiple users add a post at the same time. https://firebase.google.com/docs/database/admin/save-data
            
        }
        
        function signin() {
            console.log("Signing in");
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithRedirect(provider).then(function(result) { 
                window.location.replace("fbtest.html");
            });
        }
        
        function signout() {
            console.log("Signing out");
            firebase.auth().signOut().then(function() {
            });
        }