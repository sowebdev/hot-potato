/**
 * Manages game instance lifecycle
 */

GameInstance = {};
GameInstance.game = null;
GameInstance.phaserConfig = {
    width: 700,
    height: 500,
    renderer: Phaser.AUTO,
    parent: 'gameContainer',
    //Disable game pause when browser loses focus
    disableVisibilityChange: true
};
GameInstance.createGame = function (id) {
    //Subscribe to players sync for current game
    Meteor.subscribe('players', id);
    if (!GameInstance.game) {
        // Create Phaser instance
        GameInstance.game = new HotPotatoe.Game(new Phaser.Game(GameInstance.phaserConfig), id);
    }
    if (!GameInstance.game.isMainStateRunning) {
        var gameDb = GamesDb.findOne(id);
        GameInstance.game.setUp(gameDb.players, id);
        GameInstance.game.start();
        document.getElementById('logo').style.display = "none";
    }

};
GameInstance.destroyGame = function () {
    if (GameInstance.game) {
        GameInstance.game.switchToPending();
        while (GameInstance.game.players.length > 0) {
            GameInstance.game.players.pop();
        }
    }
};
GameInstance.observeGameStatus = function () {
    var gamesDb = GamesDb.find();
    gamesDb.observe({
        added: function(doc){
            if (doc.status == 'running') {
                GameInstance.createGame(doc._id);
            }
        },
        changed: function(newDoc, oldDoc){
            if (newDoc.status == 'running' && oldDoc.status != 'running') {
                GameInstance.createGame(newDoc._id);
            }
            if (newDoc.status == 'pending' && oldDoc.status != 'pending') {
                GameInstance.destroyGame();
            }
        }
    });
};
GameInstance.updateSyncData = function () {
    var playersDb = Players.find();
    if (GameInstance.game) {
        playersDb.forEach(function(playerDb) {
            var _player = _.findWhere(GameInstance.game.players, {id: playerDb.id});
            if (_player) {
                _player.setHotPotatoe(playerDb.isHotPotatoe);
                if (_player.sprite) {
                    _player.sprite.x = playerDb.sprite.x;
                    _player.sprite.y = playerDb.sprite.y;
                    _player.sprite.width = playerDb.sprite.width;
                    _player.sprite.height = playerDb.sprite.height;
                    _player.sprite.angle = playerDb.sprite.angle;
                    _player.sprite.visible = playerDb.sprite.visible;
                }
                _player.canMove = playerDb.canMove;
            }
        });
    }
};

GameInstance.formatSecondsForCountdown = function(seconds){
    var minutes = Math.floor(seconds / 60);
    seconds = seconds - minutes * 60;
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    if (seconds < 10) {
        seconds = '0' + seconds;
    }
    return minutes + ':' + seconds;
};