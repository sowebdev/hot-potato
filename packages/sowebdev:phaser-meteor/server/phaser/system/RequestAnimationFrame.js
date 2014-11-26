/**
 * Replaced every call to setTimeout or clearTimeout with Meteor equivalents
 * Meteor.setTimeout
 * Meteor.clearTimeout
 */

/**
 * Starts the requestAnimationFrame running or setTimeout if unavailable in browser
 * @method Phaser.RequestAnimationFrame#start
 */
Phaser.RequestAnimationFrame.prototype.start = function() {
    this.isRunning = true;

    var _this = this;

    if (!window.requestAnimationFrame || this.forceSetTimeOut)
    {
        this._isSetTimeOut = true;

        this._onLoop = function () {
            return _this.updateSetTimeout();
        };

        this._timeOutID = Meteor.setTimeout(this._onLoop, 0);
    }
    else
    {
        this._isSetTimeOut = false;

        this._onLoop = function (time) {
            return _this.updateRAF(time);
        };

        this._timeOutID = window.requestAnimationFrame(this._onLoop);
    }
};

/**
 * The update method for the setTimeout.
 * @method Phaser.RequestAnimationFrame#updateSetTimeout
 */
Phaser.RequestAnimationFrame.prototype.updateSetTimeout = function () {

    this.game.update(Date.now());

    this._timeOutID = Meteor.setTimeout(this._onLoop, this.game.time.timeToCall);

};

/**
 * Stops the requestAnimationFrame from running.
 * @method Phaser.RequestAnimationFrame#stop
 */
Phaser.RequestAnimationFrame.prototype.stop = function () {

    if (this._isSetTimeOut)
    {
        Meteor.clearTimeout(this._timeOutID);
    }
    else
    {
        window.cancelAnimationFrame(this._timeOutID);
    }

    this.isRunning = false;

};