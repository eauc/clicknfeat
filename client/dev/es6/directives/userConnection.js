angular.module('clickApp.directives')
  .controller('userConnectionCtrl', [
    '$scope',
    'pubSub',
    'userConnection',
    function userConnectionCtrl($scope,
                                pubSubService,
                                userConnectionService) {
      console.log('userConnectionCtrl', $scope.user);

      $scope.chat = {
        msg: '',
        to: [],
      };
      $scope.userIsInTo = (stamp) => {
        return R.find(R.equals(stamp), $scope.chat.to);
      };
      $scope.doToggleUserTo = (stamp) => {
        if($scope.userIsInTo(stamp)) {
          $scope.chat.to = R.reject(R.equals(stamp), $scope.chat.to);
        }
        else {
          $scope.chat.to = R.append(stamp, $scope.chat.to);
        }
        $scope.chat.to = R.reject(R.equals($scope.user.state.stamp),
                                  $scope.chat.to);
      };
      $scope.doSetAllUsersTo = () => {
        $scope.chat.to = R.pipe(
          R.pluck('stamp'),
          R.reject(R.equals($scope.user.state.stamp))
        )($scope.user.connection.users);
      };
      $scope.doSetToChat = (chat) => {
        $scope.chat.to = R.pipe(
          R.prop('to'),
          R.append(R.prop('from', chat)),
          R.reject(R.equals($scope.user.state.stamp)),
          R.uniq
        )(chat);
      };
      
      $scope.canSendChatMsg = () => {
        return ( !R.isEmpty($scope.chat.to) &&
                 R.length(s.strip($scope.chat.msg)) > 0
               );
      };
      $scope.doSendChatMessage = () => {
        if(!$scope.canSendChatMsg()) return null;
        
        return userConnectionService
          .sendChat($scope.chat.to, $scope.chat.msg,
                    $scope.user)
          .then(() => {
            $scope.chat.msg = '';
            $scope.$digest();
          });
      };
      $scope.doSendChatMessageToAll = function() {
        if(R.length(s.strip($scope.chat.msg)) <= 0) return null;

        var to = R.pipe(
          R.pluck('stamp'),
          R.reject(R.equals($scope.user.state.stamp))
        )($scope.user.connection.users);
        
        return userConnectionService
          .sendChat(to, $scope.chat.msg,
                    $scope.user)
          .then(() => {
            $scope.chat.msg = '';
            $scope.$digest();
          });
      };
    }
  ])
  .directive('clickUserConnection', [
    function() {
      return {
        restrict: 'E',
        controller: 'userConnectionCtrl',
        templateUrl: 'partials/directives/user_connection.html',
        scope: true,
        link: function(/*scope, element, attrs*/) {
        }
      };
    }
  ]);
