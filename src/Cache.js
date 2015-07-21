"use strict";

var _get = require("babel-runtime/helpers/get")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _Map2 = require("babel-runtime/core-js/map")["default"];

Object.defineProperty(exports, "__esModule", {
	value: true
});

var Cache = (function (_Map) {
	_inherits(Cache, _Map);

	function Cache() {
		_classCallCheck(this, Cache);

		_get(Object.getPrototypeOf(Cache.prototype), "constructor", this).call(this);
		this._stats = new _Map2();
	}

	_createClass(Cache, [{
		key: "clear",
		value: function clear() {
			this._stats.clear();
			return _get(Object.getPrototypeOf(Cache.prototype), "clear", this).call(this);
		}
	}, {
		key: "delete",
		value: function _delete(key) {
			var deleted = _get(Object.getPrototypeOf(Cache.prototype), "delete", this).call(this, key);
			if (deleted) this._stats["delete"](key);
		}
	}, {
		key: "get",
		value: function get(key) {
			if (this._stats.has(key)) ++this._stats.get(key).visits;
			return _get(Object.getPrototypeOf(Cache.prototype), "get", this).call(this, key);
		}
	}, {
		key: "set",
		value: function set(key, value) {
			_get(Object.getPrototypeOf(Cache.prototype), "set", this).call(this, key, value);
			if (this._stats.has(key)) ++this._stats.get(key).updates;else this._stats.set(key, { visits: 0, updates: 0 });
			return this;
		}
	}]);

	return Cache;
})(_Map2);

exports.Cache = Cache;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhY2hlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBYSxLQUFLO1dBQUwsS0FBSzs7QUFDTixVQURDLEtBQUssR0FDSDt3QkFERixLQUFLOztBQUVoQiw2QkFGVyxLQUFLLDZDQUVUO0FBQ1AsTUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFPLENBQUE7RUFDckI7O2NBSlcsS0FBSzs7U0FLWixpQkFBRztBQUNQLE9BQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDbkIscUNBUFcsS0FBSyx1Q0FPSTtHQUNwQjs7O1NBQ0ssaUJBQUMsR0FBRyxFQUFFO0FBQ1gsT0FBTSxPQUFPLDhCQVZGLEtBQUssd0NBVWEsR0FBRyxDQUFDLENBQUE7QUFDakMsT0FBSSxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sVUFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0dBQ3BDOzs7U0FDRSxhQUFDLEdBQUcsRUFBRTtBQUNSLE9BQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUE7QUFDdkQscUNBZlcsS0FBSyxxQ0FlQyxHQUFHLEVBQUM7R0FDckI7OztTQUNFLGFBQUMsR0FBRyxFQUFFLEtBQUssRUFBRTtBQUNmLDhCQWxCVyxLQUFLLHFDQWtCTixHQUFHLEVBQUUsS0FBSyxFQUFDO0FBQ3JCLE9BQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUEsS0FDbkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQTtBQUNsRCxVQUFPLElBQUksQ0FBQTtHQUNYOzs7UUF0QlcsS0FBSzs7O1FBQUwsS0FBSyxHQUFMLEtBQUsiLCJmaWxlIjoiY2FjaGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgQ2FjaGUgZXh0ZW5kcyBNYXAge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5fc3RhdHMgPSBuZXcgTWFwXG5cdH1cblx0Y2xlYXIoKSB7XG5cdFx0dGhpcy5fc3RhdHMuY2xlYXIoKVxuXHRcdHJldHVybiBzdXBlci5jbGVhcigpXG5cdH1cblx0ZGVsZXRlKGtleSkge1xuXHRcdGNvbnN0IGRlbGV0ZWQgPSBzdXBlci5kZWxldGUoa2V5KVxuXHRcdGlmIChkZWxldGVkKSB0aGlzLl9zdGF0cy5kZWxldGUoa2V5KVxuXHR9XG5cdGdldChrZXkpIHtcblx0XHRpZiAodGhpcy5fc3RhdHMuaGFzKGtleSkpICsrdGhpcy5fc3RhdHMuZ2V0KGtleSkudmlzaXRzXG5cdFx0cmV0dXJuIHN1cGVyLmdldChrZXkpXG5cdH1cblx0c2V0KGtleSwgdmFsdWUpIHtcblx0XHRzdXBlci5zZXQoa2V5LCB2YWx1ZSlcblx0XHRpZiAodGhpcy5fc3RhdHMuaGFzKGtleSkpICsrdGhpcy5fc3RhdHMuZ2V0KGtleSkudXBkYXRlc1xuXHRcdGVsc2UgdGhpcy5fc3RhdHMuc2V0KGtleSwge3Zpc2l0czogMCwgdXBkYXRlczogMH0pXG5cdFx0cmV0dXJuIHRoaXNcblx0fVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9