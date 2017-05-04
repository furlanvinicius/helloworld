app.controller('LoginCtrl', function($scope, $state, $firebaseAuth, $ionicPopup, $ionicLoading) {

    $scope.usuario = {};

    $scope.authObj = $firebaseAuth();

    var firebaseUser = $scope.authObj.$getAuth();

    if (firebaseUser) {
        $state.go('tabs.usuarios');
    }

    $scope.login = function(usuario) {

        $ionicLoading.show({template: 'Loading...'});

        $scope.authObj.$signInWithEmailAndPassword(usuario.email, usuario.password)
            .then(function(firebaseUser) {
                console.log("Signed in as:", firebaseUser.uid);
                $ionicLoading.hide();
                $state.go('tabs.usuarios');
            }).catch(function(error) {
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                    title: 'Falha no Login',
                    template: error.message
                });
            });
    }
});

app.controller('RegistroCtrl', function($scope, $state, $firebaseAuth, $firebaseObject, $ionicPopup, $ionicLoading) {

    $scope.usuario = {};

    $scope.authObj = $firebaseAuth();

    $scope.registrar = function(usuario) {

         $ionicLoading.show({template: 'Calma ai! Porra!'});

        $scope.authObj.$createUserWithEmailAndPassword(usuario.email, usuario.password)
            .then(function(firebaseUser) {

                $ionicLoading.hide();

                console.log("User " + firebaseUser.uid + " created successfully!");

                addUsuario(firebaseUser);
                $state.go('login');

            }).catch(function(error) {

                $ionicLoading.hide();

                var alertPopup = $ionicPopup.alert({
                    title: 'Erro ao registrar',
                    template: error.message
                });
            });
    }

    function addUsuario(firebaseUser) {

        var ref = firebase.database().ref('usuarios/' + firebaseUser.uid);

        var obj = $firebaseObject(ref);

        obj.displayName = firebaseUser.email;
        obj.email = firebaseUser.email;
        obj.$save().then(function(ref) {
            ref.key === obj.$id; // true
            console.log('Usuário criado na BaseDeFogo(firebase)');
        }, function(error) {
            console.log("Error:", error);
        });
    }

});

app.controller('TabsCtrl', function($scope) {

});

app.controller('UsuariosCtrl', function($scope, $firebaseArray) {

    var ref = firebase.database().ref('usuarios');
    $scope.usuarios = $firebaseArray(ref);

    $scope.enviarMensagem = function(usuario){
        var refMsg = firebase.database().ref('mensagens');
        $firebaseArray(refMsg).$add(msg)
        .then(function(resp){
            debugger;
        })
        .catch(function(error){
            debugger;
        })
    }

});

app.controller('MensagensCtrl', function($scope, $firebaseArray, $ionicPopup, $firebaseAuth) {
    var ref = firebase.database().ref('mensagens');
    $scope.mensagens = $firebaseArray(ref);

    $scope.data={
        name: ""
    }

    $scope.add = function() {
        var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="data.name">',
            title: 'Digite nome do Grupo',
            subTitle: '~Nome descente, pf!',
            scope: $scope,
            buttons: [
            { text: 'Errei!' },
            {
                text: '<b>Só vai!</b>',
                type: 'button-positive',
                onTap: function(e) {
                if (!$scope.data.name) {
                    //don't allow the user to close unless he enters name password
                    e.preventDefault();
                } else {

                    return $scope.data.name;
                }
                }
            }
            ]
        });

        myPopup.then(function(resp){
            var firebaseUser = $firebaseAuth().$getAuth();
            $scope.mensagens.$add({name: resp, admin: firebaseUser.uid});
        });
    }

    $scope.view = function(id){
        $state.go('tab.mensagem', {id: id});
    }
});

app.controller('MensagemCtrl', function($scope, $stateParamse, $firebaseArray) {

    var id = $stateParams.id;
    var ref = firebase.database().ref('mensagem/'+id);
    $scope.mensagens = $firebaseArray(ref);
});

app.controller('ProfileCtrl', function($scope, $state, $firebaseAuth, $firebaseObject, $ionicLoading) {

    $scope.authObj = $firebaseAuth();

    var firebaseUser = $scope.authObj.$getAuth();

    $scope.usuario = angular.copy(firebaseUser);

    var ref = firebase.database().ref('usuarios/' + firebaseUser.uid + '/status');
    $firebaseObject(ref).$loaded(function(obj) {
        $scope.usuario.status = obj.$value;
    });

    $scope.logout = function() {
        $scope.authObj.$signOut();
        $state.go('login');
    }

    $scope.atualizar = function(usuario) {

        $ionicLoading.show({template: 'Saving...'});
        
        firebaseUser.updateProfile({            
            displayName: usuario.displayName
            //TODO: Atualizar Imagem...
        }).then(function(response) {
            $ionicLoading.hide();
            console.log("ok" + response);
            atualizarUsuario(usuario.displayName);
        }, function(error) {
            $ionicLoading.hide();
            //Error
            console.log(error);
        });
    }

    function atualizarUsuario(displayName) {
        var ref = firebase.database().ref('usuarios/' + firebaseUser.uid + '/displayName');

        var obj = $firebaseObject(ref);

        obj.$value = displayName;

        obj.$save().then(function(ref) {
            ref.key === obj.$id; // true
            console.log('Nome do usuário atualizado na base de dados.');
        }, function(error) {
            console.log("Error:", error)
        });
    }

    $scope.atualizarSenha = function(password) {
        $scope.authObj.$updatePassword(password)
            .then(function() {
                console.log("Password changed successfully!");
            }).catch(function(error) {
                console.error("Error: ", error);
            });
    }




    $scope.atualizarStatus = function(usuario) {
        $ionicLoading.show({template: 'Saving...'});
        
        firebaseUser.updateProfile({            
            status: usuario.status
            //TODO: Atualizar Imagem...
        }).then(function(response) {
            $ionicLoading.hide();
            console.log("ok" + response);
            atualizarStatus(usuario.status);
        }, function(error) {
            $ionicLoading.hide();
            //Error
            console.log(error);
        });

    }


    function atualizarStatus(status) {
        var ref = firebase.database().ref('usuarios/' + firebaseUser.uid + '/status');

        
        obj = $firebaseObject(ref);
        obj.$value = status;

        obj.$save().then(function(ref) {
            ref.key === obj.$id; // true
            console.log('Nome do usuário atualizado na base de dados.');
        }, function(error) {
            console.log("Error:", error)
        });


    }



});