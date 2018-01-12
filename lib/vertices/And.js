"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Comparison_1 = require("./Comparison");
/**
 * And compiles to an SQL and.
 */
var And = /** @class */ (function (_super) {
    __extends(And, _super);
    function And() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    And.prototype.escape = function (params) {
        var _this = this;
        return this
            .left
            .escape(params)
            .chain(function (l) {
            return _this
                .right
                .escape(params)
                .map(function (r) { return "(" + l + ") AND (" + r + ")"; });
        });
    };
    And.prototype.compile = function () {
        var _this = this;
        return this
            .left
            .compile()
            .chain(function (l) {
            return _this
                .right
                .compile()
                .map(function (r) { return "(" + l + ") AND (" + r + ")"; });
        });
    };
    return And;
}(Comparison_1.Comparison));
exports.And = And;
//# sourceMappingURL=And.js.map