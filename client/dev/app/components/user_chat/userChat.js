'use strict';

angular.module('clickApp.directives').controller('userChatCtrl', ['$scope', function userChatCtrl($scope) {
  console.log('userChatCtrl', $scope.user);

  var state = $scope.state;

  $scope.chat = {
    msg: '',
    to: []
  };
  function setChatTo(to) {
    $scope.chat.to = R.reject(R.equals(state.user.state.stamp), to);
  }
  $scope.userIsInTo = function (stamp) {
    return R.find(R.equals(stamp), $scope.chat.to);
  };
  $scope.doToggleUserTo = function (stamp) {
    if ($scope.userIsInTo(stamp)) {
      setChatTo(R.reject(R.equals(stamp), $scope.chat.to));
    } else {
      setChatTo(R.append(stamp, $scope.chat.to));
    }
  };
  $scope.doSetAllUsersTo = function () {
    setChatTo(R.pluck('stamp', state.user.connection.users));
  };
  $scope.doSetToChat = function (chat) {
    setChatTo(R.pipe(R.prop('to'), R.append(R.prop('from', chat)), R.uniq)(chat));
  };

  function chatMsgIsValid() {
    return R.length(s.strip($scope.chat.msg)) > 0;
  }
  $scope.canSendChatMsg = function () {
    return !R.isEmpty($scope.chat.to) && chatMsgIsValid();
  };
  $scope.doSendChatMessage = function () {
    if (!$scope.canSendChatMsg()) return null;

    return R.pipePromise(function () {
      return $scope.stateEvent('User.sendChatMsg', $scope.chat);
    }, function () {
      $scope.chat.msg = '';
      $scope.$digest();
    })($scope.user);
  };
  $scope.doSendChatMessageToAll = function () {
    setChatTo(R.pluck('stamp', state.user.connection.users));
    $scope.doSendChatMessage();
  };
}]).directive('clickUserConnection', [function () {
  return {
    restrict: 'E',
    controller: 'userChatCtrl',
    templateUrl: 'partials/directives/user_chat.html',
    scope: true,
    link: function link() {}
  };
}]);
//# sourceMappingURL=userChat.js.map
